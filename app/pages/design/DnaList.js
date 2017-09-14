import React, { Component } from 'react'
import {
    Image,
    Text,
    View,
    Alert,
    ListView,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
} from 'react-native'
import ScrollableTabBar, { DefaultTabBar, } from '../../libs/react-native-scrollable-tab-view'
import * as common from '../../utils/CommonUtils'
import PanoramaTaskHandler from '../../utils/PanoramaTaskHandler'
import SchemeHandler from '../../utils/SchemeHandler'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import { ApiMap } from '../../constants/Network'
import Colors from '../../constants/Colors'
import Spinner from '../../libs/react-native-loading-spinner-overlay'
import TaskRecords from './TaskRecords'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

const STYLE_TYPE_MINE = 'STYLE_TYPE_MINE'
const STYLE_TYPE_SHARED = 'STYLE_TYPE_SHARED'

export default class DnaList extends Component {
    constructor (props) {
        super(props)
        this.state = {
            myStyleDataSource: ds,
            sharedDataSource: ds,
            currentSelect: '',
            tabState: STYLE_TYPE_MINE,
        }

        this.sharedStyleIndex = 1
        this.myStyleIndex = 1
        this.myStyleData = []
        this.sharedStyleData = []
        this.loadIndex = 0
    }

    componentDidMount () {
        this.requestStyle(STYLE_TYPE_MINE)
    }

    onRequestMyStyleCallback (status, response) {
        this.setState({isFetching: false})
        if (status) {
            this.myStyleData = [...this.myStyleData, ...response.data]

            this.setState({myStyleDataSource: ds.cloneWithRows(this.myStyleData)})
        } else {

        }
    }

    onRequestSharedStyleCallback (status, response) {
        this.setState({isFetching: false})
        if (status) {
            this.sharedStyleData = [...this.sharedStyleData, ...response.data]
            this.setState({sharedDataSource: ds.cloneWithRows(this.sharedStyleData)})
        } else {
            showErrorAlert(response)
        }
    }

    requestStyle (type) {
        let apiRequest = new ApiRequest()
        if (type == STYLE_TYPE_MINE) {
            this.setState({isFetching: true, fetchingText: '加载我的DNA...'})
            apiRequest.request(ApiMap.getDnas, {
                index: this.myStyleIndex,
                owner: true
            }, null, this.onRequestMyStyleCallback.bind(this))
        } else if (type == STYLE_TYPE_SHARED) {
            this.setState({isFetching: true, fetchingText: '加载全球共享DNA...'})
            apiRequest.request(ApiMap.getDnas, {index: this.sharedStyleIndex}, null, this.onRequestSharedStyleCallback.bind(this))
        }
    }

    _renderDnaRow (rowData, sectionId, rowId) {
        let image = SchemeHandler.getScreenshot(rowData, {width: deviceWidth})
        let time = rowData.createdUtc.replace('T', ' ')
        time = time.replace('Z', '')

        return (
            <TouchableHighlight
                onPress={() => this.chooseDna(rowData, rowId, this.state.tabState)}
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
                    <Image source={{uri: image}}
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
                    <ScrollableTabBar
                        renderTabBar={() => <DefaultTabBar style={{
                            backgroundColor: Colors.transparent,
                            height: 25,
                            marginTop: 10,
                            width: deviceWidth * 2 / 3,
                            alignSelf: 'center'
                        }}/>}
                        onChangeTab={(obj) => this.onChangeTab(obj)}
                        tabBarTextStyle={{fontSize: 18,}}
                        tabBarActiveTextColor={Colors.mainColor}
                        tabBarInactiveTextColor={Colors.white}
                        tabBarUnderlineStyle={{backgroundColor: Colors.transparent, height: 2}}
                        ref={(tabView) => { this.tabView = tabView }}>
                        <View tabLabel='我的风格'>
                            <ListView
                                contentContainerStyle={{marginTop: 10, width: deviceWidth}}
                                onEndReached={this.loadMore.bind(this, this.state.tabState)}
                                dataSource={this.state.myStyleDataSource}
                                enableEmptySections={true}
                                renderRow={this._renderDnaRow.bind(this)}/>
                        </View>
                        <View tabLabel='全球共享'>
                            <ListView
                                contentContainerStyle={{marginTop: 10, width: deviceWidth}}
                                onEndReached={this.loadMore.bind(this, this.state.tabState)}
                                dataSource={this.state.sharedDataSource}
                                enableEmptySections={true}
                                renderRow={this._renderDnaRow.bind(this)}/>
                        </View>
                    </ScrollableTabBar>
                    <TouchableOpacity
                        onPress={() => this.props.navigator.pop()}
                        style={{position: 'absolute', left: 5, top: 15, paddingLeft: 15}}>
                        <Image source={require('../../images/common/icon_back_white.png')}/>
                    </TouchableOpacity>
                </View>
                <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>

            </Image>

        )
    }

    onChangeTab (obj) {
        this.setState({currentSelect: ''})//用户切换选择框时，会触发该方法，所以在这个方法里去掉用户选择风格的样式
        //onChangeTab()在用户刚进入该页面和切换选择会触发，所以用户刚进入该页面this.loadIndex = 1，
        //用户切换一次选项this.loadIndex = 2，此后用户再切换无需重复加载数据，所以在this.loadIndex < 2才触发加载数据方法
        if (this.loadIndex < 2) {
            this.onLoadData(obj)
        }
    }

    onLoadData (obj) {
        this.loadIndex++
        if (obj.i == 0) {
            this.setState({tabState: STYLE_TYPE_MINE}, function () {
                this.requestStyle(STYLE_TYPE_MINE)
            })

        } else {
            this.setState({tabState: STYLE_TYPE_SHARED}, function () {
                this.requestStyle(STYLE_TYPE_SHARED)
            })
        }
    }

    onLeftBack () {
        this.props.navigator.pop()
    }

    chooseDna (dna, rowId, type) {
        if (type == STYLE_TYPE_MINE) {
            this.setState({
                currentSelect: rowId,
                myStyleDataSource: ds.cloneWithRows(this.myStyleData),
            })

        } else if (type == STYLE_TYPE_SHARED) {
            this.setState({
                currentSelect: rowId,
                sharedDataSource: ds.cloneWithRows(this.sharedStyleData),
            })
        }

        Alert.alert('应用DNA', '是否将此DNA应用到你的方案中',
            [
                {text: '否', onPress: () => {}},
                {text: '是', onPress: () => this.DnaApplication(dna)}
            ]
        )
        // SchemeHandler.scheme = scheme
        // this.props.navigator.push({id: 'PanoramaPage', component: PanoramaPage});
    }

    DnaApplication (dna) {
        this.setState({isFetching: true, fetchingText: 'DNA应用中...'})
        PanoramaTaskHandler.postPanoramaTask({
            ...SchemeHandler.scheme,
            id: SchemeHandler.scheme.id,
            dnaId: dna.id
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
    }

    loadMore (type) {
        if (type == STYLE_TYPE_MINE) {
            if (this.myStyleData.length % 20 == 0 && this.myStyleData.length != 0) {
                this.myStyleIndex++
                this.requestStyle(type)
            }

        } else if (type == STYLE_TYPE_SHARED) {
            if (this.sharedStyleData.length % 20 == 0 && this.sharedStyleData.length != 0) {
                this.sharedStyleIndex++
                this.requestStyle(type)
            }
        }
    }
}
