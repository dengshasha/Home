import React, { Component } from 'react';
import {
	Image,
	Text,
	StyleSheet,
	View,
	Platform,
	DeviceEventEmitter,
	TouchableOpacity,
} from 'react-native';

import {ApiMap, CommunityApiMap, JpushApiMap} from '../constants/Network';
import * as common from '../utils/CommonUtils';
import {ApiRequest, showErrorAlert} from '../utils/ApiRequest';

import PanoramaTaskHandler from '../utils/PanoramaTaskHandler';
import PanoramaPage from './design/PanoramaPage';
import SchemeHandler from '../utils/SchemeHandler';
import Swiper from 'react-native-swiper';
import PreloadImage from '../components/PreloadImage';
import JPushModule from 'jpush-react-native'
import { SaveJPushMsg } from '../utils/Storage'

import Colors from '../constants/Colors';
import * as Icon from '../images/';

import ActivityPage from './activity/ActivityPage';
import ActivityListPage from './activity/ActivityListPage';
import DesignPage from './design/DesignPage';
import SharePage from './share/SharePage';
import UserInfo from './user/UserInfo';

import ActivityDescriptionPage from './activity/ActivityDescriptionPage'
import LoginPage from './login/loginPage';
import CustomeEvent from '../constants/CustomeEvent'

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();
var { NativeModules } = require('react-native');

const MODAL_TYPE_GUIDE = 'MODAL_TYPE_GUIDE';
const MODAL_TYPE_EVALUATE = 'MODAL_TYPE_EVALUATE';
const MODAL_TYPE_ACTIVITY = 'MODAL_TYPE_ACTIVITY';

export default class MainPage extends Component {
	constructor(props) {
		super(props);
		this.selectedBtn = '';
		this.state = {
			isFetching: false,
			fetchingText: '',
			activityTipsImg: '',
			activityTipsContent: '',
			activityBanner:[],
			hasUnreadMsg: false, //是否有未读消息
		}
	}

	componentWillMount(){
		global.userInfo && global.userInfo.user_id && JPushModule.setAlias(global.userInfo.user_id.toString(), () => {}, () => {})
		this.getActivityBanner()
	}

	componentDidMount() {

		DeviceEventEmitter.addListener( CustomeEvent.NEED_LOGIN, ()=>{

			setTimeout(()=>{
				global.storage.save({
					key: 'userInfo',  //注意:请不要在key中使用_下划线符号!
					data: {userInfo: null},
				});
				global.userInfo = null;
				global.storage.clearMapForKey('activityList' )
				this.props.navigator.resetTo({id: 'LoginPage', component: LoginPage })
			},1000)
		})

		this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
			if (event._data.route.id == 'MainPage') {
				this.getUnreadMessage()
			}
		})
	}

	componentWillUnmount() {
		this._isMounted = false
		// JPushRemoveHandle()
	}

	//获取未读消息
	getUnreadMessage() {
		let apiRequest = new ApiRequest();
		let params = {
			jpushMsgType: 'all',
			communityIndex: 1,
			jpushReadStatus: 2 //2代表未读消息
		}

		apiRequest.request(JpushApiMap.getPushMessage, params, null, (status, response) => {
			if (status) {
				if (response.data.length > 0) {
					this.setState({
						hasUnreadMsg: true
					})
				} else {
					this.setState({
						hasUnreadMsg: false
					})
				}
			} else {
				showErrorAlert(response)
			}
		})
	}

	getActivityBanner () {
		let apiRequest = new ApiRequest();
		apiRequest.request(CommunityApiMap.getActivities, null, null, (status, response) => {
			if (status) {
				let data = response.data.filter( item => item.end_time > Date.now() / 1000)
				this.setState({ showActivityModal: true, activityBanner: data })
			}
		})
	}

	render() {
		console.log(global.userInfo)
		const playIcon = this.selectedBtn !== 'application' ? Icon.mainPlay : Icon.mainPlayAfter;
		const designIcon = this.selectedBtn !== 'design' ? Icon.mainDesign : Icon.mainDesignAfter;
		const activityIcon = this.selectedBtn !== 'activity' ? Icon.mainActivity : Icon.mainActivityAfter;
		const shareIcon = this.selectedBtn !== 'share' ? Icon.mainShare : Icon.mainShareAfter;
		const userIcon = this.selectedBtn !== 'user' ? Icon.mainUser : Icon.mainUserAfter;
		return (
			<View style={{flex:1}}>
				<View style={{flex:1}}>
					<Image source = {require('../images/main/main_bg.png')} style={styles.mainBgImg}>
						<View style={styles.container}>
							<TouchableOpacity style={styles.buttons} onPress={() => this.enterApplicationPlayPage()}>
								<Image source={playIcon} resizeMode={'contain'} style={styles.iconSize}/>
								<Text style={{fontSize: 14 ,fontWeight: 'bold', color: this.selectedBtn == 'application' ? '#55A7D8' : '#fff'}}>试玩</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.buttons} onPress={() => this.enterDesignPage()}>
								<Image source={designIcon} resizeMode={'contain'}  style={styles.iconSize}/>
								<Text style={{ fontSize: 14 ,fontWeight: 'bold', color: this.selectedBtn == 'design' ? '#4FB87E' : '#fff'}}>开始设计</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.buttons} onPress={() => this.enterActivityListPage()}>
								<Image source={activityIcon} resizeMode={'contain'}  style={styles.iconSize}/>
								<Text style={{ fontSize: 14, fontWeight: 'bold', color: this.selectedBtn == 'activity' ? '#B782C6' : '#fff'}}>活动</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.buttons} onPress={() => this.enterSharePage()}>
								<Image source={shareIcon} resizeMode={'contain'}  style={styles.iconSize}/>
								<Text style={{ fontSize: 14, fontWeight: 'bold', color: this.selectedBtn == 'share' ? '#E4A474' : '#fff'}}>作品分享</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.buttons} onPress={() => this.enterUserPage()}>

								<Image source={userIcon} resizeMode={'contain'}  style={styles.iconSize}/>
								<Text style={{ fontSize: 14, fontWeight: 'bold', color: this.selectedBtn == 'user' ? '#E1828B' : '#fff'}}>我的</Text>
								{this.state.hasUnreadMsg && <View style = {styles.msgPrompt}/>}
							</TouchableOpacity>
						</View>
						<TouchableOpacity style={{alignSelf: 'center', bottom: 20 / 667 * deviceHeight, position: 'absolute', justifyContent: 'center', alignItems: 'center'}}>
							<Image source={require('../images/main/home_logo.png')}/>
							<Text style={{color: Colors.white, fontSize: 12}}>玩家生活.内测版</Text>
						</TouchableOpacity>
					</Image>
				</View>
				{this.renderActivityModal()}
				{this.renderJumpOut()}

			</View>
		)
	}

	renderJumpOut(){
		if (this.state.showActivityModal) {
			return(
				<TouchableOpacity
					onPress={()=>this.setState({showActivityModal: false})}
					style={{position: 'absolute', top:20, right: 20, borderRadius:20, height: 30, width: 70, borderColor: 'white', borderWidth:1,justifyContent: 'center', alignItems: 'center'}}>
					<Text style={{color: 'white', fontSize:12}}>跳过</Text>
				</TouchableOpacity>
			)
		}
	}

	renderActivityModal(){

		if (this.state.showActivityModal) {
			return (
				<Swiper
					autoplay
					style={{position: 'absolute', top:0, left: 0 }}
					height={deviceHeight}
					width={deviceWidth}>
					{
						this.state.activityBanner.map( (item, index) => {
							/**
							 * 返回活动轮播图列表
							 * @cover_url: anner轮播高清图链接url
							 * @id: 对应活动Id
							 */
							let {tips_url, id} = item;
							return (
								<PreloadImage
									resizeMode = {'stretch'}
									url={tips_url}
									key={index}
									onPress={() => this.enterActivityDescriptionPage(item)}
									style={{width: deviceWidth, height: deviceHeight}}/>
							)
						})
					}

				</Swiper>
			)
		}
	}

	enterActivityPage(activityId){
		this.setState({showActivityModal: false}, ()=>{
			this.props.navigator.push({id: 'ActivityPage', component: ActivityPage, activityId})
		})
	}

	enterActivityDescriptionPage(activity) {
		this.setState({showActivityModal: false}, ()=>{
			this.props.navigator.push({
				id: 'ActivityDescriptionPage',
				component: ActivityDescriptionPage,
				activity: activity
			})
		})
	}

	enterApplicationPlayPage() {
		this.selectedBtn = 'application';
		let apiRequest = new ApiRequest();
		this.setState({isFetching: true, fetchingText: '加载试玩方案...'})
		apiRequest.request(ApiMap.getSchemes,{index: this.index, keyword: 'name:玩家生活试玩方案V01'},null, (status, res)=>{
			this.setState({isFetching: false})
			if (status) {
				if (res.count) {
					SchemeHandler.scheme = res.data[0]
					this.props.navigator.push({id:'PanoramaPage', component: PanoramaPage, isFirst: true})
				}
			}
		})
	}

	enterDesignPage() {
		this.selectedBtn = 'design';
		this.props.navigator.push({id: 'DesignPage', component: DesignPage});
	}

	enterSharePage() {
		this.selectedBtn = 'share';
		this.props.navigator.push({id: 'SharePage', component: SharePage});
	}

	// 进去活动页
	enterActivityListPage() {
		this.selectedBtn = 'activity';
		this.props.navigator.push({id: 'ActivityListPage', component: ActivityListPage});
	}

	enterUserPage() {
		this.selectedBtn = 'user';
		this.props.navigator.push({id: 'UserInfo', component: UserInfo});
	}


}

const styles = StyleSheet.create({
	// 背景图
	mainBgImg: {
		width: deviceWidth,
		height: deviceHeight,
		justifyContent: 'center',
		alignItems: 'center'
	},
	container:{
		alignItems: 'center',
		marginTop: -deviceHeight * 0.1
	},
	iconSize: {
		height: common.adaptWidth(120),
		width: common.adaptWidth(120),
		marginBottom: 3
	},
	buttons:{
		alignItems: 'center',
		height: 100 / 667 * deviceHeight,
		justifyContent:'center',
		width: 75 / 375 * deviceWidth,
	},
	msgPrompt: {
		backgroundColor: Colors.mainColor,
		borderColor: Colors.white,
		borderRadius: 4,
		borderWidth: 1,
		height: 8,
		left: common.adaptWidth(80),
		position: 'absolute',
		top: 20 / 667 * deviceHeight,
		width: 8,
	}
})
