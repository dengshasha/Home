import React, { Component } from 'react'
import {
    Image,
    Text,
    View,
    Alert,
    ListView,
    Modal,
    Platform,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    NativeModules
} from 'react-native'
import * as common from '../../utils/CommonUtils'
import PanoramaTaskHandler from '../../utils/PanoramaTaskHandler'
import SchemeHandler from '../../utils/SchemeHandler'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import { CommunityApiMap } from '../../constants/Network'
import Colors from '../../constants/Colors'
import Spinner from '../../libs/react-native-loading-spinner-overlay'
import NavigationBar from '../../components/NavigationBar'
import PreloadImage from '../../components/PreloadImage'
import TaskRecords from '../design/TaskRecords'

var UMNative = NativeModules.UMNative

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()
const apiRequest = new ApiRequest()

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

class ModalView extends Component {
    constructor (props) {
        super(props)
        this.state = {
            modalVisible: true,
        }
    }

    render () {
        return (
            <Modal
                visible={this.state.modalVisible}
                onRequestClose={() => console.log('you close modal')}
                transparent={true}
                animationType={'slide'}>
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: deviceWidth,
                    height: deviceHeight,
                    backgroundColor: 'rgba(0, 0, 0, .8)',
                }}>
                    <Image source={require('../../images/activity/dnaList_dialog.png')} style={styles.modalImg}
                           resizeMode={'stretch'}/>
                    <TouchableOpacity style={styles.modalBtn} onPress={() => {
                        this.setState({modalVisible: false})
                    }}>
                        <Text style={styles.modalBtnText}>跳过</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        )
    }
}

export default class ActivityDnaList extends Component {
    constructor (props) {
        super(props)
        this.state = {
            dataSource: ds,
            currentSelect: '',
        }
        this.listViewData = []
    }

    componentDidMount () {
        UMNative.onPageBegin('ActivityDnaList')
        this.requestStyle()
        // console.log(this.props);
    }

    componentWillUnmount () {
        UMNative.onPageEnd('ActivityDnaList')
    }

    onRequestStyleCallback (status, response) {
        this.setState({
            isFetching: false
        })
        if (status) {
            this.listViewData = response.data
            this.setState({dataSource: ds.cloneWithRows(response.data)})
        } else {
            showErrorAlert(response)
        }
    }

    requestStyle () {
        this.setState({
            isFetching: true,
            fetchingText: 'dna获取中，请稍候...'
        })
        let {activityId} = this.props.route
        apiRequest.request(CommunityApiMap.getDna, {activityId}, null, this.onRequestStyleCallback.bind(this))
    }

    _renderRow (rowData, sectionId, rowId) {
        let image = rowData.images
        return (
            <TouchableHighlight
                onPress={() => this.chooseDna(rowData, rowId)}
                underlayColor={Colors.mainColor}
                style={{
                    alignSelf: 'center',
                    backgroundColor: Colors.white,
                    borderWidth: 2,
                    borderColor: this.state.currentSelect == rowId ? Colors.mainColor : Colors.white,//Colors.white,
                    marginTop: 10,
                    height: 230 / 667 * deviceHeight,
                    width: deviceWidth - 20,
                    borderRadius: 5
                }}>
                <View>
                    <PreloadImage
                        isTouched={false}
                        url={image}
                        style={{width: deviceWidth - 24, height: 230 / 667 * deviceHeight - 4, borderRadius: 3}}/>
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: this.state.currentSelect == rowId ? 'rgba(243,59,88,0.9)' : Colors.white,
                    }}>
                        <Text style={{
                            color: this.state.currentSelect == rowId ? Colors.white : Colors.black,
                            fontSize: 16,
                        }}>{rowData.name}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }

    render () {
        let bgImg = SchemeHandler.getScreenshot(SchemeHandler.scheme, {height: deviceHeight})
        return (
            <Image source={{uri: bgImg}}
                   style={{flex: 1, backgroundColor: Colors.mainBgColor, paddingTop: global.IOS_PLATFORM ? 20 : 0}}>
                <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)'}}>
                    <NavigationBar
                        title={'选择风格'}
                        titleColor={Colors.white}
                        style={{elevation: 0}}
                        backgroundColor={'transparent'}
                        onLeftButtonPress={() => this.onLeftBack()}
                        leftButtonIcon={require('../../images/common/icon_back_white.png')}/>
                    <ListView
                        contentContainerStyle={{width: deviceWidth}}
                        dataSource={this.state.dataSource}
                        enableEmptySections={true}
                        renderRow={this._renderRow.bind(this)}/>
                </View>
                <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
                <ModalView />
            </Image>

        )
    }

    onLeftBack () {
        this.props.navigator.pop()
    }

    chooseDna (dna, rowId) {
        this.setState({
            currentSelect: rowId,
            dataSource: ds.cloneWithRows(this.listViewData),
        })
        Alert.alert('应用DNA', '是否确认将此DNA应用到你的方案中', [{text: '取消', onPress: () => {}}, {
            text: '确认',
            onPress: () => this.DnaApplication(dna)
        }])
    }

    postPanoramaTask (newId, dnaId) {
        let {activityId, originSchemeId} = this.props.route
        PanoramaTaskHandler.postPanoramaTask({
            ...SchemeHandler.scheme,
            id: newId,
            dnaId: dnaId,
            activityId,
            originSchemeId,
            userTags: `activity+${activityId}`
        }, () => {
            Alert.alert('DNA风格更换成功！', '点击查看，移至渲染列表',
                [
                    {text: '继续设计', onPress: () => this.props.navigator.pop()},
                    {
                        text: '查看',
                        onPress: () => this.props.navigator.replace({id: 'TaskRecords', component: TaskRecords})
                    }
                ]
            )
        })
    }

    DnaApplication (dna) {
        this.setState({isFetching: true, fetchingText: 'DNA应用中...'})
        PanoramaTaskHandler.postPanoramaTask({
            ...SchemeHandler.scheme,
            id: SchemeHandler.scheme.id,
            dnaId: dna.origin_id,
            activityId: this.props.route.activityId,
            originSchemeId: this.props.route.originSchemeId,
            userTags: `activity+${this.props.route.activityId}`
        }, () => {
            this.setState({isFetching: false})
            Alert.alert('DNA应用方案成功！', '点击查看，移至渲染列表',
                [
                    {text: '继续设计', onPress: () => this.props.navigator.pop()},
                    {
                        text: '查看',
                        onPress: () => this.props.navigator.replace({id: 'TaskRecords', component: TaskRecords})
                    }
                ]
            )
        })

        // this.setState({isFetching: true, fetchingText: 'DNA应用中...'})
        // SchemeHandler.newScheme('tempScheme', SchemeHandler.scheme, (status, responseData)=>{
        //   if (status) {
        //     this.postPanoramaTask(responseData.newId, dna.origin_id)
        //   } else {
        //     this.setState({isFetching: false})
        //     showErrorAlert(responseData)
        //   }
        // })
    }
}

const styles = StyleSheet.create({
    modalBtn: {
        alignItems: 'center',
        backgroundColor: Colors.transparent,
        borderColor: Colors.white,
        borderRadius: 15 / 667 * deviceHeight,
        borderWidth: 1,
        justifyContent: 'center',
        height: 30 / 667 * deviceHeight,
        right: 15 / 667 * deviceHeight,
        position: 'absolute',
        top: Platform.OS === 'ios' ? 30 : 10,
        width: 70 / 667 * deviceHeight,
    },
    modalBtnText: {
        color: Colors.white,
        fontSize: 12,
    },
    modalImg: {
        alignSelf: 'center',
        height: 1.41 * (deviceWidth - 100 / 667 * deviceHeight),
        width: deviceWidth - 100 / 667 * deviceHeight,
    }
})
