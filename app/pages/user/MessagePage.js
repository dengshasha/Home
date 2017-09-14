/*created by melody 2017/7/16
 消息详情页
 */
import React, { Component } from 'react'
import {
	View,
	Text,
	Image,
	StyleSheet,
	ScrollView,
	ListView,
	TouchableOpacity,
} from 'react-native'

import * as Icon from '../../images/'
import Colors from '../../constants/Colors'
import * as common from '../../utils/CommonUtils'

import NavigationBar from '../../components/NavigationBar'
import NoDataDefaultView from '../../components/NoDataDefaultView'

import Spinner from '../../libs/react-native-loading-spinner-overlay'
import Toast from 'react-native-easy-toast'

import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest'
import {JpushApiMap} from '../../constants/Network'

import ActivityPublishedPage from '../activity/ActivityPublishedPage'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

var apiRequest = new ApiRequest()

export default class MessagePage extends Component {
	constructor(props) {
		super(props)
		let ds = new ListView.DataSource({
			rowHasChanged: (r1,r2) => r1 !== r2,
			sectionHeaderHasChanged: (s1, s2) => s1 !== s2
		});
		this.state = {
			messageList: [],
			isFetching: false,
			fetchingText: '',
			dataSource: ds,
			historyMsgList: [],
		}
	}

	componentWillMount() {

	}

	componentDidMount() {
		this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
			if (event._data.route.id == 'MessagePage') {
				this.getAllMsg()
			}
		})
	}

	_genRow(data) {
		let readData = [], unreadData = []
		for (let i = 0; i < data.length; i++) {
			if (data[i].is_read) {
				readData.push(data[i])
			} else {
				unreadData.push(data[i])
			}
		}
		let obj = {
			"unreadMessage": unreadData,
			"readMessage": readData
		}
		return obj
	}

	//先在该页面获取全景图再跳转
//    getWorkDetail(worksId, callback){
//        this.setState({ isFetching: true, fetchingText: '方案加载中，请稍候...' })
//        apiRequest.request(CommunityApiMap.getActivityWork, {activityWorkId: worksId}, null, (status, response)=>{
//            if (status) {
//                this.getSchemeDetail(response.scheme_id, callback)
//            } else {
//                this.setState({ isFetching: false })
//                showErrorAlert(response)
//            }
//        })
//    }
//
//    getSchemeDetail(schemeId, callback) {
//        apiRequest.request(ApiMap.getScheme, {version: schemeId}, null, (status, response)=>{
//            this.setState({ isFetching: false })
//            if (status) {
//                SchemeHandler.scheme = response.data;  // 获取活动物品数据数组
//                callback && callback()
//            } else {
//                this.setState({ isFetching: false })
//                showErrorAlert(response)
//            }
//        })
//    }

	//获取所有消息
	getAllMsg() {
		let params = {
			jpushMsgType: 'all',
			communityIndex: 1,
			jpushReadStatus: 0
		}

		apiRequest.request(JpushApiMap.getPushMessage, params, null, (status, response) => {
			if (status) {
				console.log(response.data)
				this.setState({
					messageList: response.data,
					dataSource: this.state.dataSource.cloneWithRowsAndSections(this._genRow(response.data))
				})
			} else {
				showErrorAlert(response)
			}
		})
	}

	changeMsgReadStatus(msgId) {
		apiRequest.request(JpushApiMap.updatePushMsgReadState, {jpushMsgId: msgId}, null, (status, response) => {
			if (status) {

			} else {
				showErrorAlert(response)
			}
		})
	}

	enterActivityPublishedPage(worksId, activityId, msgId) {
		this.changeMsgReadStatus(msgId)
		this.props.navigator.push({
			id: 'ActivityPublishedPage', component: ActivityPublishedPage, params: {workId: worksId, activityId: activityId}
		})
	}

	_renderRow(rowData, sectionId, rowId) {
		let msgId = rowData.msg_id;
		let messageType = rowData.msg_type
		let msg = JSON.parse(rowData.msg)
		let worksId = msg.works_id
		let activityId = msg.activity_id
		let name = '暂无', typeText = '暂无'
		if (messageType === 'activity_comment') {
			name = msg.comment_author_name
			if (msg.comment_type === 'works') {
				typeText = '评论了你的作品'
			} else if (msg.comment_type === 'comment') {
				typeText = '回复了你的作品'
			}

		} else if (messageType === 'activity_rating') {
			name = msg.rating_author_name
			typeText = '给你的作品评分啦'
		}
		return(
			<TouchableOpacity
				style = {styles.listContainer}
				onPress = {() => this.enterActivityPublishedPage(worksId, activityId, msgId)}
			>
				<Text style = {styles.listText}><Text style = {styles.name}>{name}</Text>  {typeText}</Text>
				{!rowData.is_read && <View style = {styles.msgPrompt}/>}
			</TouchableOpacity>
		)
	}

	render() {
		return (
			<View style = {styles.allContainer}>
				<NavigationBar
					backgroundColor = {Colors.white}
					title = {'通知'}
					titleColor = {Colors.black}
					onLeftButtonPress={() => this.props.navigator.pop()}
					leftButtonIcon={Icon.backBlack}
					rightButtonIcon1 = {Icon.customerBlack}
					navigator = {this.props.navigator}
					logoIcon = {Icon.logoBlack}
					verticalLineColor = {Colors.logoGray}
				/>
				{this.state.messageList.length > 0 ?
					<ListView
						dataSource = {this.state.dataSource}
						enableEmptySections = {true}
						renderRow = {this._renderRow.bind(this)}/>
					:
					<NoDataDefaultView noDataText = {'暂无未读消息'} />}
				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
				<Toast ref = {(toast) => this.toast = toast}/>
				{/*<TouchableOpacity onPress = {() => this.getUnreadMsg()}>
				 <Text>查询数据</Text>
				 </TouchableOpacity>
				 <TouchableOpacity onPress = {() => this.onRemoveData()}>
				 <Text>删除数据</Text>
				 </TouchableOpacity>*/}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	allContainer: {
		backgroundColor: Colors.mainBgColor,
		flex: 1,
	},
	contentContainer: {
		backgroundColor: Colors.white,
		flex: 1,
		marginTop: 15 / 667 * deviceHeight,
		width: deviceWidth,
	},
	listContainer: {
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: Colors.veryLightGrey,
		flexDirection: 'row',
		height: 65 / 667 * deviceHeight,
		justifyContent: 'space-between',
		paddingHorizontal: 10 / 375 * deviceWidth,
		width: deviceWidth,
	},
	listText: {
		color: Colors.black,
		fontSize: 16,
	},
	name: {
		color: Colors.mainColor,
	},
	msgPrompt: {
		backgroundColor: Colors.mainColor,
		borderRadius: 4,
		height: 8,
		marginHorizontal: 10 / 375 * deviceWidth,
		width: 8,
	},
})