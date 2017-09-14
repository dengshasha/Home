/**
 * update by Traveller 2017-6.22
 * 1、为活动全景图添加 发布活动和分享全景 按钮
 * 2、发布活动按钮，添加相应事件：点击按钮弹出拍摄提示
 * -> 点击去拍摄，push全景大图。
 * -> 点击再看看，关闭提示。
 * melody updated at 2017.8.14 点击参赛时先判断是否有参赛条件
 * */
import React, { Component } from 'react'
import {
    View,
    Text,
    Image,
    Easing,
    Alert,
    WebView,
    Animated,
    Platform,
    StyleSheet,
    NativeModules,
    TouchableOpacity
} from 'react-native'
import SchemeHandler from '../../utils/SchemeHandler'
import { ApiRequest } from '../../utils/ApiRequest'
import { CommunityApiMap, ApiMap } from '../../constants/Network'
import { PanoramaSharedModal } from '../../components/Modal'
import CrosswalkWebView from '../../libs/react-native-webview-crosswalk'
import NavigationBar from '../../components/NavigationBar'
import * as Icon from '../../images/'
import * as Images from '../../images/share/main'
import * as common from '../../utils/CommonUtils'
import Colors from '../../constants/Colors'
import Spinner from '../../libs/react-native-loading-spinner-overlay'
import Orientation from 'react-native-orientation'

import ProductListPage from '../design/ProductListPage'
import TaskRecords from '../design/TaskRecords'
import ActivityDnaList from './ActivityDnaList'
import Shot from './Shot'
var deviceWidth = common.getWidth()
var deviceHeight = common.getHeight()

const apiRequest = new ApiRequest()
var WeChat = require('react-native-wechat')
var UMNative = NativeModules.UMNative

export default class ActivityPanoramaPage extends Component {
    constructor (props) {
        super(props)
        this.state = {
            isFetching: false,
            fetchingText: '',
            activityRuleTips: '',
            showShareModal: false,
            taskCount: 0,
            processingTaskCount: 0,
            // 进度图片
            processImage: Images.panoramaProcessIcon,
            layoutData: [], //活动的布局方案数据
            uploadData: [], //用户参加过的方案的次数
            rotateValue: new Animated.Value(0)
        }
        this.activityId = this.props.route.activityId || JSON.parse(this.props.route.taskData.data).activityId
        this.originSchemeId = this.props.route.originSchemeId
        this.fromPage = this.props.route.fromPage
        this.releaseState = this.props.route.releaseState
        this.loop = Animated.timing(this.state.rotateValue, {
            toValue: 1,  //角度从0变1
            duration: 3000,  //从0到1的时间
            easing: Easing.out(Easing.linear),//线性变化，匀速旋转
        })

    }

    componentWillMount () {
        this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
            if (event._data.route.id !== 'ActivityPanoramaPage') {
                Orientation.lockToPortrait()
            } else {
                Orientation.unlockAllOrientations()
            }
        })

        WeChat.isWXAppInstalled()
            .then((isInstalled) =>
                !isInstalled ? (this.modalVisible = false) : (this.modalVisible = true)
            )
        Orientation.addOrientationListener((orientation) => {
            if (orientation == 'LANDSCAPE') {
                deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getWidth() - 20 : common.getNormalHeight() - 20
                deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() : common.getWidth()
            } else if (orientation == 'PORTRAIT') {
                deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getWidth() : common.getNormalHeight()
                deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() - 20 : common.getWidth() - 20
            }
        })
        UMNative.onPageBegin('ActivityPanoramaPage')
    }

    componentDidMount () {
        this.getActivity()
        this.getActivityOfScheme()
        this.getActivityOfUserScheme()

        this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
            if (event._data.route.id === 'ActivityPanoramaPage' || !this.timer) {
                // 获取用户的队列渲染记录
                this.getUserRenderTasks()
            }
        })
    }

    componentWillUnmount () {
        Orientation.lockToPortrait()
        Orientation.removeOrientationListener()
        UMNative.onPageEnd('ActivityPanoramaPage')
        this.loop = null
        this.timeout && clearTimeout(this.timeout)
        this.timer && clearInterval(this.timer)
        this.didFocusSubscription.remove()
    }

    //获取活动详情
    getActivity () {
        apiRequest.request(CommunityApiMap.getActivity, {id: this.activityId}, null, (status, response) => {
            if (status) {
                if (response.data) {
                    this.setState({
                        activityRuleTips: response.data.rule_tips
                    })
                }
            }
        })
    }

    //获取该活动里的布局
    getActivityOfScheme () {
        let apiRequest = new ApiRequest()
        apiRequest.request(CommunityApiMap.getActivity, {communitySchemesOfActivityId: this.activityId}, null, (status, response) => {
            if (status) {
                this.setState({
                    layoutData: response.data
                })
            } else {
                console.log('ERROR!', response.data)
            }
        })
    }

    //获取用户是否已参加过该方案的比赛
    getActivityOfUserScheme () {
        let apiRequest = new ApiRequest()
        apiRequest.request(CommunityApiMap.getActivity, {communityUploadInfoOfActivityId: this.activityId}, null, (status, response) => {
            if (status) {
                this.setState({
                    uploadData: response.data
                })
            }
        })
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

    startAnimation () {
        this.state.rotateValue.setValue(0)
        this.loop && this.loop.start(() => this.startAnimation())
    }

    //拍摄封面
    shootCover () {
        let data = JSON.parse(this.props.route.taskData.data)
        let originSchemeId = data.originSchemeId //获取布局的id
        let submitCount = 0  //布局方案可发布的次数
        let count = 0 //用户已经发布了的次数
        this.state.layoutData.forEach((item) => {
            if (item.origin_id === originSchemeId) {
                submitCount = item.submit_count
            }
        })
        this.state.uploadData.forEach((item) => { //只有用户发布过作品的布局才会存在于该数组中，所以如果没有找到，说明用户一次都没有发布过。
            if (item.scheme_id === originSchemeId) {
                count = item.count
            }
        })
        let restTime = submitCount - count
        if (submitCount === 0) {
            Alert.alert('该方案已经过期了，请重新选择布局吧~')
        } else if (restTime <= 0) {
            Alert.alert('该布局已经发布过方案了，请重新选择布局吧~')
        } else {
            Alert.alert('方案还没有封面', '现在去拍摄一个吧',
                [
                    {
                        text: '再改改', onPress: () => {}
                    },
                    {
                        text: '拍摄', onPress: () => {
                        this.timer && clearInterval(this.timer)
                        this.props.navigator.push({
                            id: 'Shot',
                            component: Shot,
                            taskScheme: this.props.route.taskData
                        })
                    }
                    }
                ])
        }

    }

    isPortrait () {
        return deviceWidth < deviceHeight
    }

    renderButtons (releaseActivityMenus) {
        if (this.releaseState !== false) {
            releaseActivityMenus.shift()// 移除发布活动
            releaseActivityMenus.shift()// 移除分享全景
        }
        let menuData = releaseActivityMenus
        let menuWidth, imageWidth, fontSize, length = menuData.length - 1 //length 控制最后一个显示数量
        if (this.isPortrait()) {
            menuWidth = deviceHeight / 9
            imageWidth = deviceHeight / 13
            fontSize = 13
        } else {
            menuWidth = deviceHeight / 6
            imageWidth = deviceHeight / 9
            fontSize = 10
        }
        return menuData.map((item, index) => {
            if (index !== length) { // 除开任务进程的其他按钮
                return (
                    <View
                        key={index}
                        style={{
                            alignItems: 'center',
                            marginTop: 10,
                            width: menuWidth, height: menuWidth
                        }}>
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
                                ) : (<Image resizeMode={'contain'}
                                            style={{width: imageWidth, height: imageWidth}}
                                            source={item.image}/>
                                )
                            }
                            {index === length && this.state.taskCount
                                ? (<View style={styles.redPoint}>
                                    <Text style={styles.redPointText}>{this.state.taskCount}</Text>
                                </View>)
                                : null}
                        </View>
                    </TouchableOpacity>
                    <Text style={{
                        color: '#fff',
                        marginTop: 3,
                        fontSize: fontSize,
                        backgroundColor: 'transparent'
                    }}>{item.text}</Text>
                </View>
            )
        })
    }

    renderWebview () {
        let url = SchemeHandler.getPanoramaUrl().replace('bar=show', 'bar=hide')
        if (Platform.OS === 'ios') {
            return (
                <WebView
                    style={{flex: 1}}
                    ref="webview"
                    javaScriptEnabled={true}
                    source={{uri: url}}>
                </WebView>
            )
        } else if (Platform.OS === 'android') {
            return (
                <CrosswalkWebView
                    localhost={false}
                    style={{flex: 1}}
                    url={url}/>
            )
        }
    }

    render () {
        let imageUrl = SchemeHandler.getPanoramaUrl()
        // 全景图左侧功能按钮
        let releaseActivityMenus = [
            {
                image: Images.releaseActivity,
                onPress: () => { this.shootCover() },
                text: '参赛'
            },
            {
                image: Images.shareIcon,
                onPress: () => this.setState({showShareModal: true}),
                text: '微信分享'
            },
            {
                image: Images.changeProductsIcon,
                onPress: () => {
                    this.timer && clearInterval(this.timer)
                    this.props.navigator.push({
                        id: 'ProductListPage',
                        component: ProductListPage,
                        activityId: this.activityId,
                        originSchemeId: this.originSchemeId,
                        actionType: 'activity'
                    })
                },
                text: '换一换'
            },
            {
                image: Images.changeStyleIcon,
                onPress: () => {
                    this.timer && clearInterval(this.timer)
                    this.props.navigator.push({
                        id: 'ActivityDnaList',
                        component: ActivityDnaList,
                        activityId: this.activityId,
                        originSchemeId: this.originSchemeId,
                        actionType: 'activity'
                    })
                },
                text: '换风格'
            },
            {
                image: this.state.processImage,
                onPress: () => {
                    this.timer && clearInterval(this.timer)
                    this.props.navigator.push({id: 'TaskRecords', component: TaskRecords})
                },
                text: '任务进程'
            }
        ]

        return (
            <View style={{flex: 1, backgroundColor: '#000'}}>
                {this.renderWebview()}
                <NavigationBar
                    style={{position: 'absolute'}}
                    title={''}
                    backgroundColor={Colors.transparent}
                    navigator={this.props.navigator}
                    onLeftButtonPress={() => this.props.navigator.pop()}
                    leftButtonIcon={Icon.backWhite}
                    rightButtonIcon1={Icon.customerWhite}
                    logoIcon={Icon.logoWhite}/>
                {/**菜单栏**/}
                <View style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: this.isPortrait() ? deviceHeight / 9 : deviceHeight / 6,
                    height: deviceHeight,
                    justifyContent: 'center'
                }}>
                    {this.renderButtons(releaseActivityMenus)}
                </View>

                <View style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    position: 'absolute',
                    bottom: 0,
                    height: 45 / 667 * deviceHeight,
                    width: deviceWidth,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Text style={{
                        color: Colors.white,
                        fontSize: 14,
                        backgroundColor: Colors.transparent
                    }}>注：{this.state.activityRuleTips}</Text>
                </View>
                <PanoramaSharedModal
                    url={imageUrl}
                    visible={this.state.showShareModal}
                    closeShareDialog={() => this.setState({showShareModal: false})}/>
                <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
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
