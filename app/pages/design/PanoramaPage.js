import React, { Component } from 'react'
import {
    View,
    Text,
    Easing,
    Image,
    WebView,
    Animated,
    Platform,
    StyleSheet,
    TouchableOpacity,
} from 'react-native'
import SchemeHandler from '../../utils/SchemeHandler'
import * as common from '../../utils/CommonUtils'
import * as Images from '../../images/share/main'
import Colors from '../../constants/Colors'
import { ApiRequest } from '../../utils/ApiRequest'
import { ApiMap } from '../../constants/Network'
import Orientation from '../../libs/react-native-orientation'
import ProductListPage from './ProductListPage'
import TaskRecords from './TaskRecords'
import DnaList from './DnaList'
import SaveScheme from './SaveScheme'
import SaveDna from './SaveDna'
import { PanoramaGuideModal } from '../../components/GuideModal'
import CrosswalkWebView from '../../libs/react-native-webview-crosswalk'
import Spinner from '../../libs/react-native-loading-spinner-overlay'
import { PanoramaPageModal, PanoramaSharedModal } from '../../components/Modal'
import WebShoppingPage from '../share/WebShoppingPage'

const WeChat = require('react-native-wechat')

const productListIcon = require('../../images/scheme/panorama/panorama_product_list.png'); //物品清单图标

var deviceWidth = common.getWidth()
var deviceHeight = common.getHeight()
const apiRequest = new ApiRequest()
export default class PanoramaPage extends Component {
    constructor (props) {
        super(props)
        this.state = {
            showShareModal: false,
            showSuccessAnimation: false,
            showAllButtons: true,
            saveModalVisible: false,
            showGuideModal: this.props.route.isFirst,
            taskCount: 0, // 任务总数
            processingTaskCount: 0, // 正在进行的任务数量
            processImage: Images.panoramaProcessIcon,// 进度图片
            rotateValue: new Animated.Value(0),
        }
        this.loop = Animated.timing(this.state.rotateValue, {
            toValue: 1,  //角度从0变1
            duration: 3000,  //从0到1的时间
            easing: Easing.out(Easing.linear),//线性变化，匀速旋转
        })
        this.isFirst = this.props.route.isFirst
        Orientation.addOrientationListener((orientation) => {
            if (orientation == 'LANDSCAPE') {
                deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getWidth() - 20 : common.getNormalHeight() - 20
                deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() : common.getWidth()
            } else if (orientation == 'PORTRAIT') {
                deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getWidth() : common.getNormalHeight()
                deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() - 20 : common.getWidth() - 20
            }
        })
    }

    componentWillMount () {
        this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
            if (event._data.route.id !== 'PanoramaPage') {
                Orientation.lockToPortrait()
            } else {
                Orientation.unlockAllOrientations()
            }
        })

        WeChat.isWXAppInstalled()
            .then((isInstalled) =>
                !isInstalled ? (this.modalVisible = false) : (this.modalVisible = true)
            )
    }

    componentDidMount () {
        this.setState({isFetching: true, fetchingText: '加载方案详情...'})
        apiRequest.request(ApiMap.getScheme, {version: SchemeHandler.scheme.id}, null, (status, res) => {
            if (status) {
                SchemeHandler.scheme = res.data
            } else {
                this.props.navigator.pop()
            }
            this.setState({isFetching: false})
        })
        this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
            if (event._data.route.id === 'PanoramaPage' || !this.timer) {
                this.getUserRenderTasks()
            }
        })
    }

    componentWillUnmount () {
        Orientation.lockToPortrait()
        Orientation.removeOrientationListener()
        this.timeout && clearTimeout(this.timeout)
        this.timer && clearInterval(this.timer)
    }

    isPortrait () {
        return deviceWidth < deviceHeight
    }

    showSaveAlert () {
        this.setState({
            saveModalVisible: true
        })

    }

    /**
     * 开始旋转动画
     */
    startAnimation () {
        this.state.rotateValue.setValue(0)
        this.loop && this.loop.start(() => this.startAnimation())
    }

    // 获取用户的队列渲染记录
    getUserRenderTasks () {
        let params = {queueName: 'p360', account: global.userInfo.userName, isChecked: false}
        this.timer = setInterval(() => {
            apiRequest.request(ApiMap.getTaskQueue, params, null, (status, res) => {
                if (status) {
                    let {processingTaskCount, finishedTaskCount} = res
                    if (processingTaskCount > 0) {
                        if (this.state.processingTaskCount === 0) {
                            this.startAnimation()
                        }
                        this.setState({
                            processingTaskCount,
                            taskCount: processingTaskCount, // 控制右上角的数字
                            processImage: Images.panoramaProcessing
                        })
                        return
                    }
                    if (finishedTaskCount > this.state.taskCount) {
                        this.setState({
                            taskCount: finishedTaskCount, // 控制右上角的数字
                            processImage: Images.panoramaProcessEndIcon
                        })
                        // 完成队列里面的任务数量
                        this.timeout = setTimeout(() => {
                            this.setState({
                                processImage: Images.panoramaProcessIcon
                            })
                        }, 2000)

                    } else {
                        this.timer && clearInterval(this.timer)
                    }
                } else {
                    console.log(res)
                }
            })
        }, 3000)
    }
    //跳转到物品清单页面
	enterProductListPage( ) {
		this.props.navigator.push({id: 'WebShoppingPage', component: WebShoppingPage, params: {originId: SchemeHandler.scheme.id}})
	}

    renderButtons () {
        let menuData = [
            {
                image: require('../../images/scheme/panorama/save_scheme.png'),
                onPress: () => {
                    this.timer && clearInterval(this.timer)
                    this.showSaveAlert()
                },
                text: '保存'
            },
            {
                image: require('../../images/scheme/panorama/share.png'),
                onPress: () => {
                    this.timer && clearInterval(this.timer)
                    this.setState({showShareModal: true})
                },
                text: '微信分享'
            },
            {
                image: require('../../images/scheme/panorama/DNA_Application.png'),
                onPress: () => {
                    this.timer && clearInterval(this.timer)
                    this.props.navigator.push({id: 'DnaList', component: DnaList, dnaType: 'common'})
                },
                text: '换风格'
            },
            {
                image: require('../../images/scheme/panorama/modify_item.png'),
                onPress: () => {
                    this.timer && clearInterval(this.timer)
                    this.props.navigator.push({
                        id: 'ProductListPage',
                        component: ProductListPage,
                        actionType: 'common'
                    })
                },
                text: '换一换'
            },
            {
                text: '物品清单',
                image: productListIcon,
                onPress: () => this.enterProductListPage( )
            },
            {
                image: this.state.processImage,
                onPress: () => {
                    this.timer && clearInterval(this.timer)
                    this.props.navigator.push({id: 'TaskRecords', component: TaskRecords})
                },
                text: '任务进度'
            }
        ]
        let menuWidth
        let imageWidth
        let fontSize
        if (this.isPortrait()) {
            menuWidth = deviceHeight / 9
            imageWidth = deviceHeight / 13
            fontSize = 13
        } else {
            menuWidth = deviceHeight / 6
            imageWidth = deviceHeight / 9
            fontSize = 10
        }
        const length = menuData.length - 1
        return menuData.map((item, index) => {
            if (index !== length) { // 除开任务进程的其他按钮
                return (
                    <View key={index}
                          style={{alignItems: 'center', marginTop: 10, width: menuWidth, height: menuWidth,}}>
                        <TouchableOpacity onPress={() => item.onPress()}>
                            <Image resizeMode={'contain'}
                                   style={{width: imageWidth, height: imageWidth, position: 'relative'}}
                                   source={item.image}>
                            </Image>
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: fontSize,
                            color: '#fff',
                            backgroundColor: 'transparent',
                            marginTop: 3
                        }}>{item.text}</Text>
                    </View>
                )
            }
            return (
                <View key={index}
                      style={{alignItems: 'center', marginTop: 10, width: menuWidth, height: menuWidth}}>
                    {/*红点*/}
                    <TouchableOpacity onPress={() => item.onPress()}>
                        <View style={{position: 'relative'}}>
                            {
                                item.image === Images.panoramaProcessing ? (
                                    <Animated.Image resizeMode={'contain'} style={{
                                        width: imageWidth, height: imageWidth, transform: [{
                                            rotate: this.state.rotateValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '360deg'],
                                            })
                                        }]
                                    }} source={item.image}/>
                                ) : (<Image
                                    resizeMode={'contain'}
                                    style={{width: imageWidth, height: imageWidth}}
                                    source={item.image}/>)
                            }
                            {index === length && this.state.taskCount
                                ? (<View style={styles.redPoint}>
                                    <Text style={styles.redPointText}>{this.state.taskCount}</Text>
                                </View>)
                                : null}
                        </View>
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: fontSize,
                        color: '#fff',
                        backgroundColor: 'transparent',
                        marginTop: 3
                    }}>{item.text}</Text>
                </View>
            )
        })
    }

    renderWebview () {
        this.panoramaUrl = SchemeHandler.getPanoramaUrl() ? SchemeHandler.getPanoramaUrl() : this.panoramaUrl
        if (Platform.OS === 'ios') {
            return (
                <WebView
                    ref="webview"
                    javaScriptEnabled={true}
                    source={{uri: this.panoramaUrl}}>
                </WebView>
            )
        } else if (Platform.OS === 'android') {
            return (
                <CrosswalkWebView
                    localhost={false}
                    style={{flex: 1}}
                    url={this.panoramaUrl}/>
            )
        }
    }

    render () {
        this.panoramaUrl = SchemeHandler.getPanoramaUrl() ? SchemeHandler.getPanoramaUrl() : this.panoramaUrl
        let left
        let top
        if (deviceHeight > deviceWidth || this.isPortrait()) {
            left = deviceWidth / 2 - deviceWidth / 8
            top = deviceHeight / 2 - deviceHeight / 8 + deviceWidth / 8
        } else {
            top = deviceHeight / 2 - deviceHeight / 8
            left = deviceWidth / 2 - deviceWidth / 8 + deviceHeight / 8
        }

        return (
            <View ref={(viewRef) => this.viewRef = viewRef} style={{flex: 1}}>
                {this.renderWebview()}
                {/** 导航条**/}
                <View style={{
                    position: 'absolute',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    top: this.isPortrait() ? 20 : 0,
                    left: 0,
                    right: 0,
                    height: 44,
                    width: deviceWidth
                }}>
                    <TouchableOpacity style={{paddingLeft: 10, width: 44, height: 44}}
                                      onPress={() => this.props.navigator.pop()}>
                        <Image style={{margin: 5}} source={require('../../images/common/icon_back_white.png')}/>
                    </TouchableOpacity>
                </View>
                {/**菜单栏**/}
                <View style={{
                    position: 'absolute',
                    right: 0,
                    width: this.isPortrait() ? deviceHeight / 9 : deviceHeight / 6,
                    height: deviceHeight,
                    justifyContent: 'center'
                }}>
                    {this.state.showAllButtons && this.renderButtons()}
                </View>

                <PanoramaSharedModal
                    url={this.panoramaUrl}
                    visible={this.state.showShareModal}
                    closeShareDialog={() => this.setState({showShareModal: false})}/>
                {/**<View {...this._panResponder.panHandlers} style = {{ position: 'absolute', top: top, left: left, width: 60, height: 60}}/>**/}
                <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
                <PanoramaPageModal
                    modalVisible={this.state.saveModalVisible}
                    close={() => this.setState({saveModalVisible: false})}
                    saveScheme={() => {
                        this.setState({saveModalVisible: false})
                        this.props.navigator.push({id: 'SaveScheme', component: SaveScheme})
                    }}
                    saveStyle={() => {
                        this.setState({saveModalVisible: false})
                        this.props.navigator.push({id: 'SaveDna', component: SaveDna})
                    }}/>

                { this.state.showGuideModal &&
                <PanoramaGuideModal
                    visible={this.state.showGuideModal}
                    close={() => this.setState({showGuideModal: false})}
                    weChat={() => this.setState({showShareModal: true})}
                    navigator={this.props.navigator}/>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    // 右上红点
    redPoint: {
        position: 'absolute',
        right: 0,
        top: 0,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.mainColor,
        backgroundColor: Colors.mainColor,
        paddingHorizontal: 2
    },
    redPointText: {
        fontSize: 10,
        color: Colors.white
    }
})
