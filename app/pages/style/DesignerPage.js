/**
 * Created by Melody.Deng on 2017/9/1.
 * 1.普通设计师
 * 2.特约设计师
 */

import React, {Component} from 'react';
import {
	Image,
	Text,
	View,
	ListView,
	StyleSheet,
	findNodeHandle,
	TouchableOpacity,
} from 'react-native';

import Spinner from '../../libs/react-native-loading-spinner-overlay'
import * as common from '../../utils/CommonUtils'

import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest'
import {ApiMap, CommunityApiMap} from '../../constants/Network'
import Colors from '../../constants/Colors'
import NavigationBar from '../../components/NavigationBar'
import ActivityPublishedPage from '../activity/ActivityPublishedPage'
import * as Icon from '../../images/'
import styles from '../../styles/designer'
import DNADetailsPage from './DNADetailsPage'

//列表展示方式
const TYPE_OF_STYLE_ONE = 'TYPE_OF_STYLE_ONE';
const TYPE_OF_STYLE_TWO = 'TYPE_OF_STYLE_TWO';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const bannerHeight = 170 / 667 * deviceHeight; //顶部背景图片高度

const apiRequest = new ApiRequest();

//列表排列方式Icon
const list1Icon = require('../../images/activity/activity_list1.png');
const list2Icon = require('../../images/activity/activity_list2.png');
const list1AfterIcon = require('../../images/activity/activity_list1_after.png');
const list2AfterIcon = require('../../images/activity/activity_list2_after.png');

//导航栏样式
const NAV_STYLE_TRANSPARENT = 'NAV_STYLE_TRANSPARENT';
const NAV_STYLE_WHITE = 'NAV_STYLE_WHITE';

const queenIcon = require('../../images/activity/activity_queen.png'); //排行前三Icon

const vIcon = require('../../images/style/designer_v.png'); //设计师加v图标

export default class DesignerPage extends Component {
	constructor (props) {
		super(props);
		let ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2,
		});
		this.state = {
			dataSource: ds,
			isFetching: false,
			fetchingText: '',
			userData: [],
			listStyle: TYPE_OF_STYLE_TWO,
			navStyle: NAV_STYLE_TRANSPARENT,
			userId: this.props.route.userId,
		};
		this.activityIndex = 1;
		this.activityData = [];
		this.DNAIndex = 1;
		this.myDnaData = [];
	}

	componentDidMount () {
		this.getCommunityUserInfo();
	}

	//获取社区用户信息
	getCommunityUserInfo () {
		apiRequest.request(CommunityApiMap.getUserInfo, {communityUserId: this.state.userId}, null, (status, response) => {
			if (status) {
				this.setState({userData: response});
				this.originUserId = response.token_id;
				this.getUserInfo(); //社区的用户信息里没有保存用户类型，但保存了原始用户的id,用这个id去原始接口请求获取用户的tyoe
			}
		})
	}

	//获取原始用户信息
	getUserInfo() {
		//这参数也是没谁了，userName传userId,我能怎么办，我也很绝望
		apiRequest.request(ApiMap.getUser, {userName: this.originUserId}, null, (status, response) => {
			if (status) {
				this.type = response.type;
				this.getData()
			} else {
				showErrorAlert(response)
			}
		})
	}

	//获取数据
	getData() {
		switch (this.type) {
			case 1: //1:普通设计师 2: 特约设计师
				this.getActivityWorks();
				break;
			case 2:
				this.getDNAWorks();
				break;
			default:
				this.getActivityWorks()
		}
	}

	//获取用户参加所有活动的作品(普通设计师)
	getActivityWorks () {
		let body = {
			activityUserId: this.state.userId,
			communityIndex: this.activityIndex,
			order_by: 'desc'
		};
		apiRequest.request(CommunityApiMap.getActivityWorkRateOfUser, body, null, (status, response) => {
			if (status) {
				this.activityData = response.data;
				this.setState({
					dataSource: this.state.dataSource.cloneWithRows(this.activityData)
				})
			} else {
				showErrorAlert(response)
			}
		})
	}

	//获取用户的DNA作品（特约设计师）
	getDNAWorks() {
		apiRequest.request(ApiMap.getDnas, {userIds: this.originUserId}, null, (status, response) => {
			if (status) {
				this.myDnaData = response.data;
				this.setState({
					dataSource: this.state.dataSource.cloneWithRows(this.myDnaData)
				})
			} else {
				showErrorAlert('网络出错！')
			}
		})
	}

	//获取全景图详情
	getActivityWorkDetail (workId, activityId, callback) {
		this.setState ({isFetching: true, fetchingText: '方案加载中，请稍候...'});
		apiRequest.request (CommunityApiMap.getActivityWork, {activityWorkId: workId}, null, (status, response)=> {
			if (status) {
				apiRequest.request (CommunityApiMap.getActivity, {id: activityId}, null, (activityStatus, activityRes)=> {
					this.setState ({isFetching: false});
					if (activityStatus) {
						this.activity = activityRes.data;
						callback && callback (response)
					} else {
						this.setState ({isFetching: false});
						showErrorAlert (activityRes)
					}
				})
			} else {
				this.setState ({isFetching: false});
				showErrorAlert (response)
			}
		});
	}

	//获取dna数据
	getAllDNAData(callback) {
		this.setState ({isFetching: true, fetchingText: '风格加载中，请稍候...'});
		apiRequest.request(ApiMap.getDnas, {index: 1}, null, (status, response) => {
			if (status) {
				callback && callback(response.data);
				this.setState({
					isFetching: false
				})
			} else {
				this.setState ({isFetching: false});
				showErrorAlert('网络出错！')
			}
		})
	}

	//导航栏样式切换
	onScroll (event) {
		let position = event.nativeEvent.contentOffset.y;
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
		this.setState ({
			listStyle: TYPE_OF_STYLE_TWO
		});
		this.getData();
	}

	//切换列表展示方式（一排一个）
	onChangeToListStyle1 () {
		this.setState ({
			listStyle: TYPE_OF_STYLE_ONE
		});
		this.getData();
	}

	//跳转到参加活动发布的方案页面
	enterActivityPublishedPage (rowData) {
		let isOwner = rowData.author.user_id == global.userInfo.user_id;
		this.getActivityWorkDetail (rowData.id, rowData.activity_id, (workDetail) => {
			this.props.navigator.push ({
				id: 'ActivityPublishedPage',
				component: ActivityPublishedPage,
				params: {workId: workDetail.id, activity: this.activity, isOwner: isOwner}
			})
		})
	}

	enterDNADetailsPage(rowData) {
		this.getAllDNAData( (DNAData) => {
			this.props.navigator.push ({
				id: 'DNADetailsPage',
				component: DNADetailsPage,
				DNADetailsData: rowData,
				allData: DNAData
			})
		})
	}

	//特约设计师header
	_renderDNAHeader () {
		let avatar = this.state.userData.avatar_url ? {uri: this.state.userData.avatar_url} : Icon.headIcon;

		let listStyle1Icon = this.state.listStyle == TYPE_OF_STYLE_ONE ? list1AfterIcon : list1Icon;
		let listStyle2Icon = this.state.listStyle == TYPE_OF_STYLE_TWO ? list2AfterIcon : list2Icon;

		return (
			<View>
				<View style={styles.headerContainer1}>
					<Image source={avatar} style={styles.headAvatar1}/>
					<Text style={styles.headUsername1}>{this.state.userData.name}</Text>
					<View style={styles.designerVContainer}>
						<Image source={vIcon}/>
						<Text style={styles.designerText}>设计师</Text>
					</View>
				</View>
				<View style={styles.categoryContainer}>
					<Text style={{color: Colors.black}}>DNA作品</Text>
					<View style={styles.listStyleContainer}>
						<TouchableOpacity onPress={() => this.onChangeToListStyle1()}>
							<Image source={listStyle1Icon}/>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => this.onChangeToListStyle2()}>
							<Image source={listStyle2Icon}/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		)
	}

	//普通设计师header
	_renderWorksHeader () {
		let avatarBg = this.state.userData.avatar_url ? {uri: this.state.userData.avatar_url} : Icon.defaultImg;
		let avatar = this.state.userData.avatar_url ? {uri: this.state.userData.avatar_url} : Icon.headIcon;

		let listStyle1Icon = this.state.listStyle == TYPE_OF_STYLE_ONE ? list1AfterIcon : list1Icon;
		let listStyle2Icon = this.state.listStyle == TYPE_OF_STYLE_TWO ? list2AfterIcon : list2Icon;

		return (
			<View>
				<View style={styles.headerContainer}>
					<Image
						source={avatarBg}
						style={styles.headerBg}
					>
						<View style={styles.headerBgCover}/>
					</Image>
					<Image source={avatar} style={styles.headAvatar}/>
					<Text style={styles.headUsername}>{this.state.userData.name}</Text>
				</View>
				<View style={styles.categoryContainer}>
					<Text style={{color: Colors.black}}>活动</Text>
					<View style={styles.listStyleContainer}>
						<TouchableOpacity onPress={() => this.onChangeToListStyle1()}>
							<Image source={listStyle1Icon}/>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => this.onChangeToListStyle2()}>
							<Image source={listStyle2Icon}/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		)
	}

	//普通设计师list
	_renderWorksRow (rowData, sectionID, rowID) {
		let rank = rowData.rank, rankView;
		if (rank <= 3) {
			rankView =	<View style={styles.rankContainer}>
				<Image source={queenIcon} style = {styles.rankQueenIcon}>
					<Text style = {styles.rankQueenText}>{rank}</Text>
				</Image>
			</View>
		} else {
			rankView = <View style={styles.rankContainer}>
				<View style={styles.otherRankContainer}>
					<Text style={styles.otherRankText}>NO.{rank}</Text>
				</View>
			</View>
		}
		if (this.state.listStyle === TYPE_OF_STYLE_TWO) {
			return (
				<View style={styles.listviewContainerStyle1}>
					<TouchableOpacity onPress={() => this.enterActivityPublishedPage (rowData)}>
						<Image source={{uri: rowData.works_img}} style={styles.listviewImage1}/>
					</TouchableOpacity>
					{rankView}
				</View>
			)
		}
		return (
			<View style={styles.listviewContainerStyle2}>
				<TouchableOpacity onPress={() => this.enterActivityPublishedPage (rowData)}>
					<Image source={{uri: rowData.works_img}} style={styles.listviewImage2}/>
				</TouchableOpacity>
				{rankView}
			</View>
		)
	}

	//特约设计师list
	_renderDNARow(rowData, sectionID, rowID) {
		if (this.state.listStyle === TYPE_OF_STYLE_TWO) {
			return (
				<View style={styles.listViewDNAContainer1}>
					<TouchableOpacity onPress = {() => this.enterDNADetailsPage(rowData)}>
						<Image source={{uri: rowData.images}} style={styles.listViewDNAImage1}/>
					</TouchableOpacity>
					<View style={styles.listViewDNATextContainer1}>
						<Text>{rowData.name}</Text>
					</View>
				</View>
			)
		}

		return (
			<View style={styles.listviewContainerStyle2}>
				<TouchableOpacity onPress = {() => this.enterDNADetailsPage(rowData)}>
					<Image source={{uri: rowData.images}} style={styles.listviewImage2}/>
				</TouchableOpacity>
			</View>
		)
	}

	render () {
		let isNavTop = this.state.navStyle === NAV_STYLE_TRANSPARENT; //顶部导航栏颜色
		return (
			<View style={styles.allContainer}>
				{this.type === 2 ?
					<ListView
						style={{marginBottom: 15 / 667 * deviceHeight}}
						contentContainerStyle={styles.listviewStyle}
						dataSource={this.state.dataSource}
						stickySectionHeadersEnabled={false}
						renderRow={this._renderDNARow.bind(this)}
						onScroll={this.onScroll.bind(this)}
						renderHeader={this._renderDNAHeader.bind(this)}
						enableEmptySections={true}/>
					:
					<ListView
						style={{marginBottom: 15 / 667 * deviceHeight}}
						contentContainerStyle={styles.listviewStyle}
						dataSource={this.state.dataSource}
						stickySectionHeadersEnabled={false}
						renderRow={this._renderWorksRow.bind(this)}
						onScroll={this.onScroll.bind(this)}
						renderHeader={this._renderWorksHeader.bind(this)}
						enableEmptySections={true}/>
				}
				<NavigationBar title={''}
				               navigator={this.props.navigator}
				               style={{position: 'absolute', top: 0}}
				               titleColor={isNavTop ? Colors.white : Colors.black}
				               backgroundColor={isNavTop ? Colors.transparent : Colors.white}
				               leftButtonIcon={isNavTop ? Icon.backWhite : Icon.backBlack}
				               onLeftButtonPress={() => this.props.navigator.pop()}
				               logoIcon={isNavTop ? Icon.logoWhite : Icon.logoBlack}
				               rightButtonIcon1={isNavTop ? Icon.customerWhite : Icon.customerBlack}/>
				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
			</View>
		)
	}
}

