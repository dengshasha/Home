/*
 * melody updated at 2017.8.14 点击参赛时先判断是否有参赛条件
 */
import React, { Component } from 'react'
import {
    View,
    ListView,
    Image,
    Text,
    Alert,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native'
import Swipeout from 'react-native-swipeout'
import Toast from 'react-native-easy-toast'
import * as common from '../../utils/CommonUtils'
import Colors from '../../constants/Colors'
import NavigationBar from '../../components/NavigationBar'
import ProcessBlock from '../../components/ProcessBlock'
import { CommunityApiMap, ApiMap } from '../../constants/Network'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import Spinner from '../../libs/react-native-loading-spinner-overlay'
import PullRefreshListView from '../../components/PullRefreshListView'
import * as Images from '../../images/'
import SchemeHandler from '../../utils/SchemeHandler'
import LayoutTaskHandler from '../../utils/LayoutTaskHandler'
import PanoramaTaskHandler from '../../utils/PanoramaTaskHandler'
import ScrollableTabBar, { DefaultTabBar, } from '../../libs/react-native-scrollable-tab-view'
import PanoramaPage from './PanoramaPage'
// import SmartListViewComponent from '../../components/SmartListViewComponent'
import NoDataDefaultView from '../../components/NoDataDefaultView'
import PreloadImage from '../../components/PreloadImage'
import ActivityPanoramaPage from '../activity/ActivityPanoramaPage'
import Shot from '../activity/Shot'
import ApplicationTypePage from '../design/ApplicationTypePage'
import HomePage from '../house/HomePage'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const apiRequest = new ApiRequest()

export default class TaskRecords extends Component {
    constructor (props) {
        super(props)
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 != row2
        })
        this.pages = 1
        this.state = {
            panoramaTaskRecordsdata: ds.cloneWithRows(PanoramaTaskHandler.renderTasks),
            layoutTaskRecordsdata: ds.cloneWithRows([]),
            isFetching: false,
            isRefresh: true,
            hasPanoramaTaskData: true,
            hasLayoutTaskData: true,
            fetchingText: '',
            showMyHome: true,
        }
        this.originSchemeId = this.props.route.originSchemeId
        this._onPanoramaTaskRefresh = this._onPanoramaTaskRefresh.bind(this)
        this._onLayoutTaskRefresh = this._onLayoutTaskRefresh.bind(this)
    }

    componentWillMount () {
        this._gestureHandlers = {
            //onStartShouldSetResponder: ()=>{this.setState({isScrollLock: true});},
            onMoveShouldSetResponder: () => true,
            //onResponderRelease: ()=>{this.setState({isScrollLock: false});},
        }

    }

    componentDidMount () {
        // 调用定时器
        this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
            if (event._data.route.id === 'TaskRecords' && !this.timeInterval) {
                this.setTimeGetPanoTask()
            }
        })
    }

    componentWillReceiveProps (nextProps) {
        this.getPanoramaTask()
    }

    componentWillUnmount () {
        // 定时器清空
        clearInterval(this.timeInterval)
        clearTimeout(this.timer)
    }

    getLayoutTask () {
        apiRequest.request(ApiMap.getLayout, {owner: true, order: 1}, null, (status, response) => {
            if (status) {
                let data = []
                response.data.map((item) => {
                    if (item.extraData) {
                        try {
                            let extraData = JSON.parse(item.extraData)
                            extraData.ccid && data.push(item)
                        } catch (e) {
                            return
                        }
                    } else {
                        this.state.hasLayoutTaskData = false
                    }
                })
                status && this.setState({layoutTaskRecordsdata: this.state.layoutTaskRecordsdata.cloneWithRows(data.reverse())})
            }
        })
    }

    // 获取全景图渲染任务
    getPanoramaTask (callback) {
        PanoramaTaskHandler.refreshTaskProcess(this.pages, () => {
                let renderTasks = PanoramaTaskHandler.renderTasks
                this.setState({
                    isFetching: false,
                    panoramaTaskRecordsdata: this.state.panoramaTaskRecordsdata.cloneWithRows(renderTasks)
                })
                if (renderTasks) {
                    let completed = renderTasks.every(task => task.finishTime > 0)
                    if (completed && this.timeInterval) {
                        this.timeInterval = clearInterval(this.timeInterval)
                    }
                } else {
                    showErrorAlert('网络不佳')
                    this.setState({
                        isFetching: false,
                    })
                }
                if (callback) callback()
            }
        )
    }

    /**
     * 加载更多渲染记录
     */
    loadMoreTasks () {
        let count = PanoramaTaskHandler.taskCount
        if (this.pages <= count / 20 + 1) {
            ++this.pages
            this.getPanoramaTask()
        } else {
            this.toast.show('到底了')
        }
    }

    onLeftBack () {
        this.props.navigator.pop()
    }

    /**
     * 进入全景图前，获取全集图数据
     */
    enterModifySchemePage (taskData) {
        this.result = JSON.parse(taskData.result)
        this.setState({isFetching: true, fetchingText: '方案获取中，请稍候...'})
        let data = JSON.parse(taskData.data)
        if (!taskData.isChecked) {
            PanoramaTaskHandler.patchTask(taskData.id, {isChecked: true})
        }
        let releaseState = data.released
        let schemeVersionId
        let viewUrl = this.result.viewUrl
        let urlParams = viewUrl.split('&')

        if (urlParams.length === 1) {
            schemeVersionId = data.schemeId
        } else if (urlParams.length === 2) {
            let newSchemeIdParams = urlParams[1]
            if (newSchemeIdParams) {
                schemeVersionId = newSchemeIdParams.split('=')[1]
            }
        }
        apiRequest.request(ApiMap.getScheme, {version: schemeVersionId}, null, (status, responseData) => {
            this.setState({isFetching: false})
            if (status) {
                this.getSchemeCallback(status, responseData, taskData, releaseState)
            } else {
                this.toast.show(' 设计师带着设计方案飘向远方啦 ', 3000)
            }
        })
    }

    getSchemeCallback (status, responseData, taskData, releaseState) {
        let {activityId, originSchemeId} = JSON.parse(taskData.data)
        this.setState({isFetching: false})
        if (status) {
            SchemeHandler.scheme = responseData.data
            this.timeInterval && clearInterval(this.timeInterval)
            activityId
                ? this.props.navigator.push({
                id: 'ActivityPanoramaPage',
                component: ActivityPanoramaPage,
                taskData,
                releaseState,
                originSchemeId: originSchemeId,
                fromPage: 'TaskRecords'
            })
                : this.props.navigator.push({id: 'PanoramaPage', component: PanoramaPage})
        }
    }

    requestScheme (schemeVersionId) {
        this.setState({isFetching: true, fetchingText: '方案获取中，请稍候...'})
        apiRequest.request(ApiMap.getScheme, {version: schemeVersionId}, null, this.getSchemeCallback.bind(this))
    }

    requestLayout (taskData) {
        taskData.defaultSid && this.requestScheme(taskData.defaultSid)
    }

    renderLayoutTaskRow (rowData) {
        let areaImage
        if (rowData.images && rowData.images.indexOf('{') >= 0) {
            let images = JSON.parse(rowData.images)
            areaImage = [images.layout, ...images.refers]
        } else if (rowData.images) {
            areaImage = [rowData.images]
        }
        return (
            <View style={{margin: 3}}>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{width: deviceWidth - 20}}>
                    {
                        Array.isArray(areaImage) && areaImage.map((image, index,) => {
                            return (
                                <View key={index} {...this._gestureHandlers}
                                      style={{width: (deviceWidth - 20) / 3, height: deviceWidth / 3}}>
                                    <Image style={{width: (deviceWidth - 20) / 3, height: deviceWidth / 3, margin: 3}}
                                           source={{uri: image}}/>
                                </View>)
                        })
                    }
                </ScrollView>
                <View style={{
                    height: 60,
                    flexDirection: 'row',
                    marginHorizontal: 10,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {this.renderLayoutButton(rowData)}
                </View>
            </View>
        )
    }

    // 发布按钮 以及各种状态的展示
    releasedButton (rowData) {
        if (rowData.isSuccessed) {
            let data = JSON.parse(rowData.data)
            if (data.activityId) { // 未发布的 released -> false
                if (!data.released) {
                    return (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <TouchableOpacity onPress={() => this.prepareToReleaseScheme(rowData)}>
                                <View style={{
                                    borderWidth: 0.8,
                                    borderColor: Colors.black,
                                    backgroundColor: 'transparent',
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 3,
                                    width: common.adaptWidth(200),
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Text style={{color: Colors.black, backgroundColor: 'transparent',}}>参赛</Text>
                                </View>
                            </TouchableOpacity>
                            {/*小红点*/}
                            {rowData.isChecked
                                ? null
                                : (<View style={{
                                    position: 'absolute',
                                    right: -3,
                                    top: -3,
                                    borderWidth: 1,
                                    width: 8,
                                    height: 8,
                                    borderRadius: 3,
                                    borderColor: Colors.mainColor,
                                    backgroundColor: Colors.mainColor
                                }}/>)}
                        </View>
                    )
                }
                return (
                    <View style={{
                        borderWidth: 0.8,
                        borderColor: Colors.lightGrey,
                        backgroundColor: 'transparent',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 3
                    }}>
                        <Text style={{color: Colors.lightGrey}}>作品已完成</Text>
                    </View>
                )
            }
            return (
                <View style={{
                    borderWidth: 0.8,
                    borderColor: Colors.lightGrey,
                    backgroundColor: 'transparent',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 3
                }}>
                    <Text style={{color: Colors.lightGrey}}>作品已完成</Text>
                </View>
            )
        }
        return (
            <View style={{
                borderWidth: 0.8,
                borderColor: Colors.black,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: 'transparent',
                borderRadius: 3,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {rowData.errorMsg
                    ? (
                        <TouchableOpacity style={{
                            alignSelf: 'center',
                        }} onPress={() => {
                            PanoramaTaskHandler.rePostPanoramaTask(rowData, () => {
                                this.toast.show(' 重新提交成功 ')
                                if (!this.timeInterval) {
                                    this.setTimeGetPanoTask()
                                }
                            })
                        }}>
                            {/*todo 1、请求删除渲染接口 2、重新提交本次任务*/}
                            <Text style={{
                                color: Colors.black,
                            }}>重新提交</Text>
                        </TouchableOpacity>)
                    : (
                        <Text style={{color: Colors.black, backgroundColor: 'transparent'}}>渲染中 可继续操作</Text>
                    )}
            </View>
        )
    }

    // 删除一条渲染记录并且渲染整行样式
    renderPanormaTaskRow (rowData) {
        let scale = rowData.errorMsg ? 0.7 : (!rowData.result ? 0.5 : 0)
        let textColor = scale == 0 ? '#575553' : 'black'
        let swipeoutBtns = [
            {
                text: '删除',
                backgroundColor: Colors.mainColor,
                onPress: () => {
                    Alert.alert('删除', '是否删除？', [{text: '否'}, {
                        text: '是', onPress: () => {
                            PanoramaTaskHandler.deletePanoramaTask(rowData.id, () => {
                                this.getPanoramaTask(() => this.toast.show('删除成功'))
                            })
                        }
                    }])
                }
            }
        ]
        return (
            <Swipeout right={swipeoutBtns} style={{height: 100, width: deviceWidth, marginTop: 6}} autoClose={true}>
                <TouchableOpacity style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    padding: 5,
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 5,
                    height: common.adaptWidth(200),
                    width: deviceWidth,
                }}>
                    <ProcessBlock
                        scheme={rowData}
                        style={{flex: 1}}
                        animateStyle={{
                            backgroundColor: rowData.errorMsg ? Colors.lightGrey
                                : (rowData.isSuccessed ? Colors.white : Colors.mainColor)
                        }}/>
                    <View
                        style={{alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 10, flex: 1}}>
                        <Text
                            style={{
                                backgroundColor: 'transparent',
                                color: textColor
                            }}>{common.formatActivityData(rowData.createTime)}</Text>
                        {
                            // 发布到活动 按钮
                            this.releasedButton(rowData)
                        }
                    </View>
                    {this.renderButton(rowData)}
                </TouchableOpacity>
            </Swipeout>
        )
    }

    renderLayoutButton (data) {
        if (data.extraData) {
            let extraData
            try {
                extraData = JSON.parse(data.extraData)
                return (
                    <TouchableOpacity onPress={() => this.requestLayout(extraData)}>
                        <Text style={{padding: 3, paddingHorizontal: 5, color: Colors.mainColor}}>当前进度：设计已完成
                            查看白模方案></Text>
                    </TouchableOpacity>
                )
            } catch (e) {
                return (
                    <TouchableOpacity onPress={() => {
                    }}>
                        <Text
                            style={{padding: 3, paddingHorizontal: 5, color: Colors.mainColor, fontSize: 16}}>当前进度：等待3D房型制作> </Text>
                    </TouchableOpacity>
                )
            } finally {

            }
        } else {
            return (
                <TouchableOpacity onPress={() => {
                }}>
                    <Text style={{padding: 3, paddingHorizontal: 5, color: Colors.mainColor, fontSize: 16}}>当前进度：等待3D房型制作> </Text>
                </TouchableOpacity>
            )
        }
    }

    // 每行功能按钮
    renderButton (data) {
        if (data.isSuccessed) {
            let result
            let p360Base64
            let image
            if ((typeof(data.result) == 'string') && data.result.includes('{"')) {
                result = common.getSafetyJsonObj(data.result)
                p360Base64 = result.viewUrl
                let imagesJsonObj = common.getSafetyJsonObj(PanoramaTaskHandler.getPanoramaResult(p360Base64))
                if (imagesJsonObj.screenshots && imagesJsonObj.screenshots.length) {
                    image = imagesJsonObj.screenshots[imagesJsonObj.screenshots.length - 1]
                } else if ((result.viewUrl.split('&')[0].length === 28) && imagesJsonObj) {
                    image = imagesJsonObj
                }
            }
            image = SchemeHandler.jointImageSize(image, {width: deviceWidth / 3 * 2})
            return (
                <PreloadImage
                    url={image}
                    onPress={() => this.enterModifySchemePage(data)}
                    style={{margin: 2, width: deviceWidth / 3, height: 90}}
                />
            )
        } else if (!data.result) {
            return (null)
        }
    }

    //获取该活动里的布局
    getActivityOfScheme (activityId) {
        return new Promise((resolve, reject) => {
            apiRequest.request(CommunityApiMap.getActivity, {communitySchemesOfActivityId: activityId}, null, (status, response) => {
                if (status) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            })
        })
    }

    //获取用户是否已参加过该方案的比赛
    getActivityOfUserScheme (activityId) {
        return new Promise((resolve, reject) => {
            apiRequest.request(CommunityApiMap.getActivity, {communityUploadInfoOfActivityId: activityId}, null, (status, response) => {
                if (status) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            })
        })
    }

    prepareToReleaseScheme (scheme) {
	    console.log('------------', scheme)
        let data = JSON.parse(scheme.data)
        let originSchemeId = data.originSchemeId //获取布局的id
        let activityId = data.activityId
        Promise.all([this.getActivityOfScheme(activityId), this.getActivityOfUserScheme(activityId)])
            .then((response) => {
                this.layoutData = response[0]
                this.uploadData = response[1]
                let submitCount = 0  //布局方案可发布的次数
                let count = 0 //用户已经发布了的次数
                this.layoutData.forEach((item) => {
                    if (item.origin_id === originSchemeId) {
                        submitCount = item.submit_count //找到该布局的可以发布的次数
                    }
                })
                this.uploadData.forEach((item) => { //只有用户发布过作品的布局才会存在于该数组中，所以如果没有找到，说明用户一次都没有发布过。
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
                    Alert.alert('方案还没有封面', ' 现在去拍摄一个吧 ', [
                        {text: '再看看', onPress: () => {}},
                        {
                            text: '去拍摄', onPress: () => {
                            this.timeInterval && clearInterval(this.timeInterval)
                            if (!scheme.isChecked) {
                                PanoramaTaskHandler.patchTask(scheme.id, {isChecked: true})
                            }
                            this.props.navigator.push({component: Shot, id: 'Shot', taskScheme: scheme})
                        }
                        },
                    ])
                }
            })
            .catch((error) => {
                console.log(error)
            })

    }

    onChangeTab (obj) {
        if (obj.from !== obj.i) {
            if (obj.i === 0) {
                this.getPanoramaTask()
            } else if (obj.i === 1) {
                this.getLayoutTask()
            }
        }
    }

    renderDefaultView () {
        return (<NoDataDefaultView />)
    }

    renderLayoutTaskView () {
        return (
            <PullRefreshListView
                onPullRelease={this._onLayoutTaskRefresh.bind(this)}
                initialListSize={20}
                enableEmptySections={true}
                dataSource={this.state.layoutTaskRecordsdata}
                renderRow={this.renderLayoutTaskRow.bind(this)}/>
        )
    }

    // 定时获取进度
    setTimeGetPanoTask () {
        this.setState({isFetching: true, fetchingText: '任务获取中，请稍候...'})
        this.timeInterval = setInterval(() => this.getPanoramaTask(), 3000)
    }

    //渲染任务下拉刷新
    _onPanoramaTaskRefresh (resolve) {
        PanoramaTaskHandler.refreshTaskProcess(1, () => {
            this.hideRefreshLogo(resolve)
            this.setState({
                panoramaTaskRecordsdata: this.state.panoramaTaskRecordsdata.cloneWithRows(PanoramaTaskHandler.renderTasks)
            })
        })
    }

    //下拉刷新完成回调
    hideRefreshLogo (resolve) {
        this.timer = setTimeout(() => {
            resolve()
            this.toast.show('刷新成功')
        }, 500)
    }

    //户型进度下拉刷新
    _onLayoutTaskRefresh (resolve) {
        LayoutTaskHandler.refreshTaskProcess((allTasks) => {
            this.hideRefreshLogo(resolve)
            this.setState({layoutTaskRecordsdata: this.state.layoutTaskRecordsdata.cloneWithRows(allTasks)})
        })
    }

    render () {
        let isLock = true
        return (
            <View style={{
                width: deviceWidth,
                height: deviceHeight,
                alignItems: 'center'
            }}>
                <NavigationBar
                    title={'任务'}
                    style={{elevation: 0}}
                    navigator={this.props.navigator}
                    titleColor={Colors.black}
                    backgroundColor={Colors.white}
                    leftButtonIcon={require('../../images/common/icon_back_black.png')}
                    onLeftButtonPress={() => this.onLeftBack()}
                    logoIcon={require('../../images/common/logo_black.png')}
                    verticalLineColor={Colors.logoGray}
                />
                <ScrollableTabBar
                    renderTabBar={() => <DefaultTabBar style={{backgroundColor: Colors.white, height: 25,}}/>}
                    locked={isLock}
                    onChangeTab={(obj) => this.onChangeTab(obj)}
                    tabBarActiveTextColor={Colors.mainColor}
                    tabBarInactiveTextColor={'black'}
                    tabBarTextStyle={{fontSize: 16, backgroundColor: 'transparent'}}
                    tabBarUnderlineStyle={{backgroundColor: Colors.transparent, height: 2}}
                    ref={(tabView) => {
                        this.tabView = tabView
                    }}>
                    <View tabLabel='渲染进度' style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        {
                            PanoramaTaskHandler.renderTasks.length === 0 ? (this.renderDefaultView())
                                : (
                                <PullRefreshListView
                                    onPullRelease={this._onPanoramaTaskRefresh.bind(this)}
                                    enableEmptySections={true}
                                    dataSource={this.state.panoramaTaskRecordsdata}
                                    renderRow={this.renderPanormaTaskRow.bind(this)}
                                    onLoadMore={() => this.loadMoreTasks()}/>
                            )
                        }
                    </View>
                    {/*<View tabLabel='户型进度' style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        {this.state.hasLayoutTaskData ? this.renderLayoutTaskView() : this.renderDefaultView()}
                    </View>*/}
                </ScrollableTabBar>
                {
                    this.state.showMyHome ? (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                            width: deviceWidth - 20,
                            height: common.adaptWidth(130),
                            position: 'absolute',
                            bottom: common.adaptWidth(26),
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderRadius: common.adaptWidth(14)
                        }}>
                            <Text style={{color: '#fff'}}>信不信？50元改造你的家！</Text>
                            <TouchableOpacity onPress={() => this.props.navigator.push({
                                id: 'HomePage',
                                component: HomePage
                            })}>
                                <View style={{
                                    backgroundColor: '#fff',
                                    width: common.adaptWidth(180),
                                    height: common.adaptWidth(60),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: common.adaptWidth(8)
                                }}>
                                    <Text>马上申请</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableWithoutFeedback onPress={() => this.setState({showMyHome: false})}>
                                <View>
                                    <Image source={Images.cancleHome}/>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    ) : null
                }
                <Toast ref={(toast) => this.toast = toast}/>
                <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
            </View>
        )
    }
}
