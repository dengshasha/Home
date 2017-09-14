/*
 created by melody 2017/7/05
 活动排行榜页面
 */
import React, { Component } from 'react'
import {
    Image,
    Text,
    View,
    Modal,
    ListView,
    ScrollView,
    NativeModules,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native'

import Toast, { DURATION } from 'react-native-easy-toast'
import Spinner from '../../libs/react-native-loading-spinner-overlay'
import * as common from '../../utils/CommonUtils'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import {CommunityApiMap } from '../../constants/Network'

import NavigationBar from '../../components/NavigationBar'
import PreloadImage from '../../components/PreloadImage'
import PullRefreshListView from '../../components/PullRefreshListView'

import ActivityLayoutPage from './ActivityLayoutPage'
import ActivityDescriptionPage from './ActivityDescriptionPage'
import ActivityPublishedPage from './ActivityPublishedPage'





import DesignerPage from '../style/DesignerPage'

import * as Images from '../../images/activity/main'
import * as Icon from '../../images/'
import styles from '../../styles/activity'
import Colors from '../../constants/Colors'

var UMNative = NativeModules.UMNative
const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

var apiRequest = new ApiRequest()

//切换tab
const LIST_TYPE_RANK = 'LIST_TYPE_RANK'
const LIST_TYPE_LATEST = 'LIST_TYPE_LATEST'
const LIST_TYPE_MINE = 'LIST_TYPE_MINE'

//列表样式
const LIST_STYLE_TWO = 'LIST_STYLE_TWO'
const LIST_STYLE_THREE = 'LIST_STYLE_THREE'

//导航栏样式
const NAV_STYLE_TRANSPARENT = 'NAV_STYLE_TRANSPARENT'
const NAV_STYLE_WHITE = 'NAV_STYLE_WHITE'

var bannerHeight = deviceWidth / 2 + 20 //顶部图片的高度

const queenIcon = require('../../images/activity/activity_queen.png') //排行前三Icon
//评论和点赞Icon
const commentIcon = require('../../images/activity/activity_comment.png')
const starIcon = require('../../images/activity/activity_star.png')
//列表排列方式Icon
const list1Icon = require('../../images/activity/activity_list1.png')
const list2Icon = require('../../images/activity/activity_list2.png')
const list1AfterIcon = require('../../images/activity/activity_list1_after.png')
const list2AfterIcon = require('../../images/activity/activity_list2_after.png')

export default class ActivityPage extends Component {
    constructor (props) {
        super(props)
        let ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })
        this.state = {
            dataSource: ds,
            isFetching: false,
            fetchingText: '',
            tabState: LIST_TYPE_LATEST, //选项卡
            isJoinedTheActivity: false,
            listStyle: LIST_STYLE_TWO, //列表展示样式
            navStyle: NAV_STYLE_TRANSPARENT, //导航栏样式
            showDescript: false, //活动说明显示弹框
            footState: 0, //上拉加载更多
        }
        this.activity = undefined
        this.activityId = this.props.route.activityId
        this.mySchemeIndex = 1
        this.rankingSchemeIndex = 1
        this.latestSchemeIndex = 1
        this.otherSchemeTotal = 0 //排行榜和最新的数据长度一样
        this.rankingSchemeData = []
        this.mySchemeData = []
        this.latestSchemeData = []
        this.loadRankTime = 0 //是否是第一次切换到该tab
        this.loadMineTime = 0
    }

    componentWillMount () {
        this.getActicities()
        this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
            if (event._data.route.id == 'ActivityPage') {
                this.loadScheme(this.state.tabState)
            }
        })
        this.getMySchemes()
        UMNative.onPageBegin('ActivityPage')
    }

    componentDidMount () {

    }

    componentWillUnmount () {
        this.didFocusSubscription.remove()
        UMNative.onPageEnd('ActivityPage')
    }

    //获取活动详情
    getActicities () {
        let id = this.activityId
        global.storage.load({
            key: 'activityList',
            id: id,
        }).then(res => { // storage已经存在该活动
            if (res) {
                this.activity = res
            } else {
                throw {name: 'NotFoundError'}
            }
        }).catch(err => { // storage不存在，则请求指定ID的活动
            switch (err.name) {
                case 'NotFoundError':
                    apiRequest.request(CommunityApiMap.getActivity, {id}, null, (status, response) => {
                        this.setState({isFetching: false})
                        if (status && response.data) {
                            this.activity = response.data
                            global.storage.save({
                                key: 'activityList',
                                id: id,
                                data: response.data,
                            })
                        } else {
                            showErrorAlert(response)
                        }
                    })
                    break
                case 'ExpiredError':
                    // TODO
                    break
            }
        })
    }

    //获取排行榜的方案数据
    getRankSchemes (callback) {
        apiRequest.request(CommunityApiMap.getActivityWorks, {
            communityIndex: this.rankingSchemeIndex,
            worksOfActivityId: this.activityId
        }, null, (status, response) => {
            this.setState({isFetching: false})
            callback && callback()
            if (status) {
                this.rankingSchemeData = [...this.rankingSchemeData, ...response.data]
                this.otherSchemeTotal = response.total
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.rankingSchemeData)
                })
            }
        })
    }

    //获取最新的方案数据
    getLatestSchemes (callback) {
        apiRequest.request(CommunityApiMap.getActivityWorks, {
            communityIndex: this.latestSchemeIndex,
            order_condition: 'createat',
            order_by: 'desc',
            worksOfActivityId: this.activityId
        }, null, (status, response) => {
            console.log(response.data)
            this.setState({isFetching: false})
            callback && callback()
            if (status) {
                this.latestSchemeData = [...this.latestSchemeData, ...response.data]
                this.otherSchemeTotal = response.total
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.latestSchemeData)
                })
            }
        })
    }

    //获取我参加该活动发布的方案
    getMySchemes (callback) {
        apiRequest.request(CommunityApiMap.getUserActivityWorks, {
            communityIndex: this.mySchemeIndex,
            activity_id: this.activityId,
            communityWorksOfUserId: global.userInfo.user_id
        }, null, (status, response) => {
            this.setState({isFetching: false})
            callback && callback()
            if (status && response.data.length !== 0) {
                this.mySchemeData = [...this.mySchemeData, ...response.data]
                if (this.loadMineTime == 0) {
                    this.setState({
                        isJoinedTheActivity: true
                    })
                    this.loadMineTime++
                } else {

                    this.setState({
                        showDescript: false,
                        dataSource: this.state.dataSource.cloneWithRows(this.mySchemeData)
                    })
                }

            } else {
                this.setState({showDescript: true})
            }
        })
    }

    //获取方案详情
    // getSchemeDetail(schemeId, callback) {
    // 	this.setState({isFetching: true, fetchingText: '方案加载中，请稍候...'})
    // 	apiRequest.request(ApiMap.getScheme, {version: schemeId}, null, (status, response) => {
    // 		this.setState({isFetching: false})
    // 		if (status) {
    // 			SchemeHandler.scheme = response.data;  // 获取活动物品数据数组
    // 			callback && callback()
    // 		}
    // 	})
    // }

    enterActivityDescriptionPage () {
        this.props.navigator.push({
            id: 'ActivityDescriptionPage',
            component: ActivityDescriptionPage,
            activity: this.activity
        })
    }

    enterActivityLayoutPage () {
        let {activityId} = this.props.route
        this.props.navigator.push({id: 'ActivityLayoutPage', component: ActivityLayoutPage, activityId})
    }

    enterPanoramaPage (rowData) {
        this.props.navigator.push({
            id: 'ActivityPublishedPage',
            component: ActivityPublishedPage,
            params: {workId: rowData.id, activityId: this.activityId}
        })
    }

    _enterMainPage () {
        this.props.navigator.popToTop()
    }

    //判断加载排行榜|最新|我的 作品
    loadScheme (tabState) {
        let preTabState = this.state.tabState
        this.setState({
            tabState: tabState
        })
        if (preTabState === tabState) {//当前所在tab与用户点击的tab一致时，刷新该tab下的数据源，重新请求数据
            switch (tabState) {
                case LIST_TYPE_LATEST:
                    this.setState({isFetching: true, fetchingText: '刷新中，请稍候...'})
                    //刷新需要清空该tab下的数据，并且将页码重新设置为1
                    this.latestSchemeData = []
                    this.latestSchemeIndex = 1
                    this.getLatestSchemes()
                    break
                case LIST_TYPE_RANK:
                    this.setState({isFetching: true, fetchingText: '刷新中，请稍候...'})
                    this.rankingSchemeData = []
                    this.rankingSchemeIndex = 1
                    this.getRankSchemes()
                    break
                case LIST_TYPE_MINE:
                    this.setState({isFetching: true, fetchingText: '刷新中，请稍候...'})
                    this.mySchemeData = []
                    this.mySchemeIndex = 1
                    this.getMySchemes()
                    break
            }
        } else {//不一致时，仅仅是切换数据源而不重新请求接口
            switch (tabState) {
                case LIST_TYPE_MINE :
                    this.loadMyScheme()
                    break
                case LIST_TYPE_RANK :
                    this.loadRankScheme()
                    break
                case LIST_TYPE_LATEST:
                    this.setState({
                        dataSource: this.state.dataSource.cloneWithRows(this.latestSchemeData)
                    })
                    break
            }
        }
    }

    //需要判断是否是第一次切换到该tab，只有第一次切换过来才请求数据
    //由于该页面最新和我的 在页面初始化都已经请求过数据了，所以只针对获取排行榜数据
    loadRankScheme () {
        if (this.loadRankTime === 0) {
            this.setState({isFetching: true, fetchingText: '加载中，请稍候...'})
            this.getRankSchemes()
            this.loadRankTime++
        }
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rankingSchemeData)
        })
    }

    loadMyScheme () {
        if (this.loadMineTime === 0) {
            this.getMySchemes()
        }
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.mySchemeData)
        })
    }

    //加载更多
    onLoadMore () {
        //根据实际需求，我的作品不会超过20条，所以不需要处理加载更多的情况
        switch (this.state.tabState) {
            case LIST_TYPE_RANK :
                if (this.rankingSchemeData.length < this.otherSchemeTotal) {
                    this.setState({footState: 1}) //footState = 1:加载中
                    this.timer = setTimeout(() => {
                        this.rankingSchemeIndex++
                        this.getRankSchemes()
                    }, 800)
                } else {
                    this.setState({footState: 2})//footState = 2:加载完成
                }
                break
            case LIST_TYPE_LATEST :
                if (this.latestSchemeData.length < this.otherSchemeTotal) {
                    this.setState({footState: 1}) //footState = 1:加载中
                    this.timer = setTimeout(() => {
                        this.latestSchemeIndex++
                        this.getLatestSchemes()
                    }, 800)
                } else {
                    this.setState({footState: 2})//footState = 2:加载完成
                }
                break
            case LIST_TYPE_MINE:
                if (this.mySchemeData.length % 20 === 0 && this.mySchemeData.length !== 0) {
                    this.setState({footState: 1}) //footState = 1:加载中
                    this.timer = setTimeout(() => {
                        this.mySchemeIndex++
                        this.getMySchemes()
                    }, 800)
                } else {
                    this.setState({footState: 2})//footState = 2:加载完成
                }
                break
        }
    }

    hideRefreshLogo (resolve) {
        this.timer = setTimeout(() => {
            resolve()
        }, 1000)
    }

    //下拉刷新
    onPullRelease (resolve) {
        switch (this.state.tabState) {
            case LIST_TYPE_RANK :
                this.rankingSchemeData = []
                this.rankingSchemeIndex = 1
                this.getRankSchemes(() => this.hideRefreshLogo(resolve))
                break
            case LIST_TYPE_LATEST :
                this.latestSchemeData = [] //刷新需要清空该tab下的数据，并且将页码重新设置为1
                this.latestSchemeIndex = 1
                this.getLatestSchemes(() => this.hideRefreshLogo(resolve))
                break
            case LIST_TYPE_MINE :
                this.mySchemeData = []
                this.mySchemeIndex = 1
                this.getMySchemes(() => this.hideRefreshLogo(resolve))
                break
        }
    }

    //导航栏样式切换
    scrollToDown (position) {
        if (position > bannerHeight) {
            this.setState({
                navStyle: NAV_STYLE_WHITE
            })
        } else {
            this.setState({
                navStyle: NAV_STYLE_TRANSPARENT
            })
        }
    }

    //切换列表展示方式（一排二个）
    onChangeToListStyle2 () {
        this.setState({
            listStyle: LIST_STYLE_TWO
        })
        this.loadScheme(this.state.tabState)
    }

    //切换列表展示方式（一排三个）
    onChangeToListStyle3 () {
        this.setState({
            listStyle: LIST_STYLE_THREE
        })
        this.loadScheme(this.state.tabState)
    }

    //我的排名视图
    renderBannerContent () {
        /*参加该活动banner*/
        let work = this.mySchemeData[0]
        if (this.state.isJoinedTheActivity && work) {
            let works_img = work.works_img ? work.works_img : ''
            return (
                <View style={styles.bannerContainer}>
                    <View style={styles.bannerRankContainer}>
                    	<View style = {styles.rankCircle}>
                    		<Text style={styles.bannerRankNumber}>{work.rank}</Text>
                    	</View>
                        <Text style={styles.bannerRankText}>我的最高排名</Text>
                    </View>
                    <View style={styles.bannerRankContainer}>
                    	<PreloadImage
                    	    url={works_img}
                    	    onPress={() => this.enterPanoramaPage(work)}
                    	    style={styles.bannerMySchemeImg}
                    	/>
                    	<Text style={styles.bannerRankText}>我的方案</Text>
                    </View>

                    <View style={styles.bannerRankContainer}>
                    	<View style = {styles.rankCircle}>
                    		<Text style={styles.bannerRankNumber}>{work.rating}</Text>
                    	</View>
                        <Text style={styles.bannerRankText}>获得星星</Text>
                    </View>
                </View>
            )
        }
        /*未参加该活动banner*/
        let contentText = '也想秀出你的设计？赶快点击我要参加'
        return (
            <View style={styles.bannerContainer}>
                <Image source={Images.noSchemeIcon}/>
                <Text style={{color: Colors.black, fontSize: 12}}>{contentText}</Text>
            </View>
        )
    }

    //listview视图
    _renderRow (rowData, sectionID, rowID) {
        let images = rowData.works_img
        let rank = rowData.rank
        let avatar = (rowData.author && rowData.author.avatar_url) ? {uri: rowData.author.avatar_url} : Icon.headIcon
        let rating = rowData.rating, rankView
        let commentCount = rowData.comment_count
        if (rank <= 3) {
            rankView =	<View style={styles.rankContainer}>
            	<Image source={queenIcon} style = {{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
					<Text style = {{color: Colors.white, fontSize: 12, paddingRight: 5, backgroundColor: Colors.transparent}}>{rank}</Text>
            	</Image>
            </View>
        } else {
            rankView = <View style={styles.rankContainer}>
	            <View style={styles.otherRankContainer}>
	                <Text style={styles.otherRankText}>NO.{rank}</Text>
	            </View>
	        </View>
        }
        /*列表，一排两个*/
        if (this.state.listStyle === LIST_STYLE_TWO) {
            return (
                <View style={styles.listViewItemContainer1}>
                    <PreloadImage
                        url={images}
                        style={styles.listViewItemImg1}
                        onPress={() => this.enterPanoramaPage(rowData)}>

                            {rankView}
                    </PreloadImage>
                    <View style = {styles.avatarAndRateContainer}>
                    	<TouchableWithoutFeedback onPress={() =>
                    	    this.props.navigator.push({
                    	        component: DesignerPage,
                    	        userId: rowData.author.user_id
                    	    })}>
                    	    <Image source={avatar} style={styles.avatar}/>
                    	</TouchableWithoutFeedback>
                    	<View style = {styles.rateContainer}>
                    		<Image source = {starIcon}/>
                    		<Text style = {styles.rateText}>({rating})</Text>
                    		<Image source = {commentIcon} style = {{marginLeft: 10}}/>
                    		<Text style = {styles.rateText}>({commentCount})</Text>
                    	</View>
                    </View>
                </View>
            )
        }
        /*列表，一排三个*/
        return (
            <View style={styles.listViewItemContainer2}>
                <PreloadImage
                    url={images}
                    style={styles.listViewItemImg2}
                    onPress={() => this.enterPanoramaPage(rowData)}>
                    <View style={styles.rankIconContainer2}>
                        {rankView}
                    </View>
                </PreloadImage>
            </View>
        )
    }

    _renderHeader (sectionData, sectionID) {
        let bannerImgUrl = this.activity ? {uri: this.activity.cover_url} : Icon.defaultImg
        let isRank = this.state.tabState === LIST_TYPE_RANK
        let isLatest = this.state.tabState === LIST_TYPE_LATEST
        let isMine = this.state.tabState === LIST_TYPE_MINE
        let selectedStyle = {
            color: Colors.black,
            fontSize: 16,
            backgroundColor: 'transparent'
        }
        let commonStyle = {color: Colors.midGrey, fontSize: 14, backgroundColor: 'transparent'}

        let listStyle2Icon = this.state.listStyle === LIST_STYLE_TWO ? list1AfterIcon : list1Icon
        let listStyle3Icon = this.state.listStyle === LIST_STYLE_THREE ? list2AfterIcon : list2Icon

        if (this.state.navStyle === NAV_STYLE_TRANSPARENT) {
            return (
                <View>
                    <TouchableOpacity onPress={() => this.enterActivityLayoutPage()}
                                      style={{overflow: 'visible', }} removeClippedSubviews={false}>
                        <Image source={bannerImgUrl} style={styles.bannerImg}/>
                    </TouchableOpacity>
                    {this.renderBannerContent()}
                    <View style={styles.tabContainer}>
                    	<View style={styles.listStyleContainer}>
                    	    <TouchableOpacity onPress={() => this.onChangeToListStyle2()}>
                    	        <Image source={listStyle2Icon}/>
                    	    </TouchableOpacity>
                    	    <TouchableOpacity onPress={() => this.onChangeToListStyle3()}>
                    	        <Image source={listStyle3Icon}/>
                    	    </TouchableOpacity>
                    	</View>
                    	<View style = {styles.tabBtnTextContainer}>

                    		<TouchableOpacity style={styles.tabBtn} onPress={() => this.loadScheme(LIST_TYPE_LATEST)}>
                    		    <Text style={isLatest ? selectedStyle : commonStyle}>最新</Text>
                    		    <View style = {styles.verticalLine} />
                    		</TouchableOpacity>
                    		<TouchableOpacity  onPress={() => this.loadScheme(LIST_TYPE_RANK)}>
                    		    <Text style={isRank ? selectedStyle : commonStyle}>排行</Text>

                    		</TouchableOpacity>
                    		{this.state.isJoinedTheActivity &&
                    		<TouchableOpacity style={styles.tabBtn} onPress={() => this.loadScheme(LIST_TYPE_MINE)}>
                    			<View style = {styles.verticalLine} />
                    		    <Text style={isMine ? selectedStyle : commonStyle}>我的</Text>
                    		</TouchableOpacity> }
                    	</View>
                    </View>
                </View>
            )
        }
        return (
            <View>
                <TouchableOpacity onPress={() => this.enterActivityLayoutPage()}
                                  style={{overflow: 'visible', marginBottom: 50}} removeClippedSubviews={false}>
                    <Image resizeMode={'stretch'} source={bannerImgUrl} style={styles.bannerImg}/>
                </TouchableOpacity>
                {this.renderBannerContent()}
            </View>
        )
    }

    renderOtherNavStyle () {
        let isRank = this.state.tabState === LIST_TYPE_RANK
        let isLatest = this.state.tabState === LIST_TYPE_LATEST
        let isMine = this.state.tabState === LIST_TYPE_MINE
        let selectedStyle = {
            paddingHorizontal: 10,
            color: Colors.black,
            backgroundColor: 'transparent',
            fontSize: 14
        }
        let commonStyle = {color: Colors.darkGrey, fontSize: 14, backgroundColor: 'transparent', paddingHorizontal: 10}

        let listStyle2Icon = this.state.listStyle === LIST_STYLE_TWO ? list1AfterIcon : list1Icon
        let listStyle3Icon = this.state.listStyle === LIST_STYLE_THREE ? list2AfterIcon : list2Icon

        return (
            <View style={styles.navContainer}>
                <View style={styles.logoContainer}>
                    <TouchableOpacity onPress={() => this.props.navigator.pop()}>
                        <Image resizeMode={'contain'} source={Icon.backBlack}/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={this._enterMainPage.bind(this)} style = {{marginLeft: 10}}>
                        <Image source={Icon.logoBlack}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.tabContainer1}>

                    <TouchableOpacity onPress={() => this.loadScheme(LIST_TYPE_LATEST)}>
                        <Text style={isLatest ? selectedStyle : commonStyle}>最新</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.loadScheme(LIST_TYPE_RANK)}>
                        <Text style={isRank ? selectedStyle : commonStyle}>排行</Text>
                    </TouchableOpacity>
                    {this.state.isJoinedTheActivity &&
                    <TouchableOpacity onPress={() => this.loadScheme(LIST_TYPE_MINE)}>
                        <Text style={isMine ? selectedStyle : commonStyle}>我的</Text>
                    </TouchableOpacity> }
                </View>
                <View style={styles.listStyleContainer1}>
                    <TouchableOpacity onPress={() => this.onChangeToListStyle2()}>
                        <Image source={listStyle2Icon}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.onChangeToListStyle3()}>
                        <Image source={listStyle3Icon}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    //主视图
    render () {
        if (!this.activity) return <View style={{flex: 1, backgroundColor: '#fff'}}/> // 如果活动不存在，返回null

        return (
            <View style={{flex: 1, backgroundColor: Colors.mainBgColor}}>
                <PullRefreshListView
                    onPullRelease={this.onPullRelease.bind(this)}
                    scrollToDown={(position) => this.scrollToDown(position)}
                    contentContainerStyle={styles.listViewContainerStyle}
                    stickySectionHeadersEnabled={false}
                    enableEmptySections={true}
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    renderHeader={this._renderHeader.bind(this)}
                    onLoadMore={this.onLoadMore.bind(this)}
                    upPullState={this.state.footState}
                    pullListText={'没有更多数据了~'}
                />
                <NavigationBar
                    title={''}
                    style={{position: 'absolute', top: 0, elevation: 0}}
                    navigator={this.props.navigator}
                    backgroundColor={Colors.transparent}
                    leftButtonIcon={Icon.backWhite}
                    logoIcon={Icon.logoWhite}
                    verticalLineColor={Colors.white}
                    onLeftButtonPress={() => this.props.navigator.pop()}
                    rightButtonIcon1={Images.activityIcon}
                    rightButtonTitle1={'活动说明'}
                    rightButtonTitleColor={Colors.white}
                    onRightButton1Press={() => this.enterActivityDescriptionPage()}
                />
                {this.state.navStyle === NAV_STYLE_WHITE && this.renderOtherNavStyle()}
                <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
                <Toast ref={(toast) => this.toast = toast}/>
            </View>
        )
    }
}
