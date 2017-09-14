import React, {Component} from 'react';
import {
	View,
	Image,
	Text,
	Modal,
	TextInput,
	ListView,
	StyleSheet,
	LayoutAnimation,
	TouchableOpacity,
	Alert,
	Platform,
	ActivityIndicator,
	NativeModules,
} from 'react-native';

import * as common from '../../utils/CommonUtils' ;
import Colors from '../../constants/Colors' ;
import NavigationBar from '../../components/NavigationBar' ;
import {CommunityApiMap} from '../../constants/Network';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import PullRefreshListView from '../../components/PullRefreshListView';
import Toast, {DURATION} from 'react-native-easy-toast';
import Keyboard from 'Keyboard';
import * as Icon from '../../images/';
import * as Images from '../../images/activity/main';
import styles from '../../styles/activityComment'

import NoDataDefaultView from '../../components/NoDataDefaultView'

var UMNative = NativeModules.UMNative;

var apiRequest = new ApiRequest ();

const deviceWidth = common.getWidth ();
const deviceHeight = common.getHeight ();

/*
class ReportModal extends Component {
	constructor (props) {
		super (props);
	}

	render () {
		return (
			<Modal animationType={'slide'}
			       transparent={true}
			       visible={this.props.modalVisible}
			       onRequestClose={() => console.log ('modal has been closed')}>
				<View style={{
					justifyContent: 'flex-end',
					backgroundColor: 'rgba(0,0,0,.6)',
					width: deviceWidth,
					height: deviceHeight
				}}>

					<View style={{paddingBottom: 10 / 667 * deviceHeight}}>
						{(this.props.commentAutherId == global.userInfo.id) &&
						<TouchableOpacity style={styles.modalBtn} onPress={()=> {
							Alert.alert ('提示', '确认删除该评论', [{text: '取消'}, {
								text: '删除',
								onPress: ()=>this.deleteComment ()
							}]);
						}}>
							<Text style={[styles.modalBtnText, {color: 'red'}]}>删除</Text>
						</TouchableOpacity>}
						<TouchableOpacity style={styles.modalBtn} onPress={()=> {
							Alert.alert ('提示', '确认举报该评论', [{text: '取消'}, {text: '举报'}]);
						}}>
							<Text style={styles.modalBtnText}>举报</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalBtn} onPress={()=>this.props.toggleReportModal (false)}>
							<Text style={styles.modalBtnText}>取消</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		)
	}

	deleteComment () {
		let params = {
			communityTargetId: this.props.communityTargetId,
			deleteCommentId: this.props.commentId
		}
		apiRequest.request (CommunityApiMap.deleteActivityWorkComment, params, null, this.onDeleteCommentCallback.bind (this));
		this.props.toggleReportModal (false);
	}

	onDeleteCommentCallback (status, responseData) {
		if (status) {
			//处理请求成功事件
			this.props.deleteCallback ()
		} else {
			//处理请求失败事件
			showErrorAlert (responseData);
		}
	}
}
*/

export default class ActivityCommentPage extends Component {
	constructor (props) {
		super (props);
		let ds = new ListView.DataSource ({
			rowHasChanged: (r1, r2) => {
				return r1 !== r2
			}
		});
		this._renderRow = this._renderRow.bind (this);
		this.index = 1;
		this.data = [];
		this.canSendMsg = true;
		this.state = {
			modalVisible: false,
			dataSource: ds.cloneWithRows (this.data),
			commentText: '',
			placeHolder: ' 请输入评论内容',
			replyCommentId: 0,
			keyboardSpace: 0,
			hasData: true, //页面加载数据完成之前不应该出现暂无评论，而应该在确定没有数据的时候再显示暂无评论
			commentTotal: '', //评论总数
			footState: 0, //0:隐藏 1：加载完成 2：加载中
			isOwner: false,
		}
	}

	componentWillMount () {
		this.requestComment ()
		this.requestUserInfo ()
	}

	componentDidMount () {
		Keyboard.addListener ('keyboardWillShow', this.updateKeyboardSpace.bind (this));
		Keyboard.addListener ('keyboardWillHide', this.resetKeyboardSpace.bind (this));
		UMNative.onPageBegin ('ActivityCommentPage');

	}

	componentWillUnmount () {
		Keyboard.removeAllListeners ('keyboardWillShow', 'keyboardWillHide');
		UMNative.onPageEnd ('ActivityCommentPage');
		this.timer && clearTimeout (this.timer);
	}

	updateKeyboardSpace (frames) {
		const keyboardSpace = (deviceHeight - frames.endCoordinates.screenY) / 2.0;
		LayoutAnimation.linear ();
		this.setState ({keyboardSpace: keyboardSpace});
	}

	resetKeyboardSpace () {
		this.setState ({keyboardSpace: 0});
	}

	//方案作者信息
	requestUserInfo () {
		apiRequest.request (CommunityApiMap.getActivityWork, {id: this.props.route.workId}, null, (status, response)=> {
			if (status) {
				this.setState ({
					isOwner: response.author.user_id === global.userInfo.user_id
				})
			} else {
				showErrorAlert (response)
			}
		})
	}

	requestComment () {
		let pageSize = 20
		let params = {
			communityTargetId: this.props.route.workId, //`${this.props.route.workId}/comment`
			communityIndex: this.index,
			communityStart: 0,
			communityLength: pageSize,
		}
		apiRequest.request (CommunityApiMap.getActivityWorkComment, params, null, this.onRequestCommentCallback.bind (this))
	}

	onRequestCommentCallback (status, responseData) {
		if (status) {
			
			if (responseData.data && responseData.data.length) {
				this.data = [...this.data, ...responseData.data]
				this.setState ({
					dataSource: this.state.dataSource.cloneWithRows (this.data),
					commentTotal: responseData.total,
					footState: 0,
					hasData: true,
				})
			} else {
				this.setState ({hasData: false})
			}

		} else {
			//处理请求失败事件
			showErrorAlert (responseData);
		}
	}

	onPullRelease (resolve) {
		let pageSize = 20
		let params = {
			communityTargetId: this.props.route.workId, //`${this.props.route.workId}/comment`
			communityIndex: 1,
			communityStart: 0,
			communityLength: pageSize,
		}
		apiRequest.request (CommunityApiMap.getActivityWorkComment, params, null, (status, response) => {
			this.timer = setTimeout (() => {
				resolve ()//下拉刷新成功以后调用此方法
			}, 800)
			if (status) {
				this.index = 1
				this.data = response.data
				this.setState ({
					dataSource: this.state.dataSource.cloneWithRows (this.data),
					footState: 0,
				})
			} else {
				//处理请求失败事件
				showErrorAlert (response);
			}
		})
	}

	deleteComment (userId, commentId, rowId) {
		this.deleteRowId = rowId;
		Alert.alert ('提示', '确认删除该评论', [{text: '取消'}, {
			text: '删除', onPress: () => {
				let params = {
					//communityTargetId: `${this.props.route.workId}/comment`,
					deleteCommentId: commentId
				}
				apiRequest.request (CommunityApiMap.deleteActivityWorkComment, params, null, this.commentDeleteCallBack.bind (this));
			}
		}]);
	}

	_renderRow (rowData, sectionID, rowID) {
		let currentTime = new Date ().getTime () / 1000;
		let commentTime = rowData.created_at;
		let timeInterval = currentTime - commentTime;
		let cellHeight = deviceHeight / 5;
		if (rowData.in_reply_to_user != null) {
			cellHeight = deviceHeight / 3;
		}
		return (
			<View style={styles.listViewItem}>
				<View style={{
					alignItems: 'center',
					flexDirection: 'row',
					height: 65 / 667 * deviceHeight,
					justifyContent: 'space-between',
					paddingVertical: 15 / 667 * deviceHeight,
				}}>
					<View style={{alignItems: 'center', flexDirection: 'row'}}>
						<Image
							source={rowData.author.avatar_url ? {uri: rowData.author.avatar_url} : require ('../../images/user/mine_icon_head.png')}
							style={styles.avatar}/>
						<View style={{paddingLeft: 10 / 375 * deviceWidth}}>
							<Text style={{color: Colors.black, fontSize: 16}}>{rowData.author.name}</Text>
							<Text style={{fontSize: 12}}>{common.getTimeInterval (timeInterval)}</Text>
						</View>
					</View>
					<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
						<TouchableOpacity style={styles.leftBtn} onPress={() => {
							this.setState ({
								placeHolder: `回复 ${rowData.author.name}:`,
								replyCommentId: rowData.comment_id
							})
							this.refs.textinput.focus ();
						}}>
							<Image source={Images.commentIcon}/>
						</TouchableOpacity>
						{this.state.isOwner &&
						<TouchableOpacity style={styles.leftBtn}
						                  onPress={() => this.deleteComment (rowData.author.id, rowData.comment_id, rowID)}>
							<Image source={Images.deleteIcon}/>
						</TouchableOpacity>}

						{/* <TouchableOpacity onPress={() => this.toggleReportModal(true, rowData.author.id, rowData.id, rowID)}
						 style={{paddingLeft: 25 / 375 * deviceWidth}}>
						 <Image source={require('../../images/share/comment/icon_more.png')} />
						 </TouchableOpacity>*/}

					</View>

				</View>
				{rowData.in_reply_to_author !== null &&
				<View style={styles.replyContainer}>
					<Text style={styles.replyAuthorName}>{rowData.in_reply_to_author.name}</Text>
					<Text style={styles.replyContent}>{rowData.in_reply_to_content}</Text>
				</View>
				}
				<View style={{marginBottom: 15 / 667 * deviceHeight}}>
					<Text style={{fontSize: 16}}>{rowData.content}</Text>
				</View>
			</View>
		)
	}

	//有评论数据时的视图
	renderCommentList () {
		return (
			<PullRefreshListView
				style={{flex: 1, marginBottom: 70 / 667 * deviceHeight}}
				onPullRelease={this.onPullRelease.bind (this)}
				processIconYPosition={60}
				contentContainerStyle={{flexWrap: 'wrap',}}
				enableEmptySections={true}
				dataSource={this.state.dataSource}
				renderRow={this._renderRow.bind (this)}
				onLoadMore={this._onLoadMore.bind (this)}
				upPullState={this.state.footState}
				pullListText={'没有更多评论了~'}
			/>
		)
	}

	render () {
		
		return (
			<View style={{flex: 1, backgroundColor: Colors.mainBgColor}}>

				{this.state.hasData ? this.renderCommentList () : <NoDataDefaultView noDataText={'暂无评论'}/>}
				<NavigationBar title={'评论'}
				               navigator={this.props.navigator}
				               titleColor={Colors.black}
				               backgroundColor={Colors.white}
				               leftButtonIcon={Icon.backBlack}
				               onLeftButtonPress={() => this.onLeftBack ()}
				               logoIcon={Icon.logoBlack}
				               rightButtonIcon1={Icon.customerBlack}
				               verticalLineColor={Colors.logoGray}
				               style={{position: 'absolute', top: 0}}
				/>
				<View style={[styles.textInputContainer, {bottom: this.state.keyboardSpace * 2}]}>
					<TextInput
						ref='textinput'
						style={styles.textInput}
						placeholder={this.state.placeHolder}
						value={this.state.commentText}
						onBlur={()=> {
							this.setState ({
								placeHolder: ' 请输入评论内容',
								replyCommentId: 0,
							})
						}}
						placeholderTextColor={Colors.veryLightGrey}
						underlineColorAndroid="transparent"
						maxLength={1000}
						onChangeText={(text) => this.setState ({commentText: text})}/>
					<TouchableOpacity
						onPress={() => this.onSendComment ()}
						style={styles.buttonSend}>
						<Text style={{color: Colors.mainColor}}>发送</Text>
					</TouchableOpacity>
				</View>
				{/*<ReportModal modalVisible={this.state.modalVisible}
				 toggleReportModal={this.toggleReportModal.bind(this)}
				 commentAutherId={this.commentAutherId}
				 commentId={this.commentId}
				 communityTargetId={`${this.props.route.workId}/comment`}
				 deleteCallback={this.commentDeleteCallBack.bind(this)}/>*/}
				<Toast ref="toast"/>
			</View>
		)
	}

	_onLoadMore () {
		if (this.state.footState != 0) return
		if (this.data.length < this.state.commentTotal) {
			this.setState ({footState: 1}) //footState = 1:加载中
			this.timer = setTimeout (() => {
				this.index++
				this.requestComment ()
			}, 800)
		} else {
			this.setState ({footState: 2})//footState = 2:加载完成
		}
	}

	onLeftBack () {
		this.props.navigator.pop ();
	}

	//打开举报窗口
	toggleReportModal (visible, userId, commentId, rowId) {
		this.setState ({
			modalVisible: visible,
		})
		if (rowId) {
			this.commentId = commentId;
			this.deleteRowId = rowId;
			this.commentAutherId = userId;
		}
	}

	//发送评论
	onSendComment () {
		if (this.canSendMsg) {
			if (this.state.commentText.length > 0) {
				let body = {
					target_id: this.props.route.workId.toString (),
					reply_comment_id: this.state.replyCommentId,
					content: this.state.commentText,
					comment_type: 'activity'
				}
				this.canSendMsg = false;
				apiRequest.request (CommunityApiMap.addActivityWorkComment, null, body, this.onAddCommentCallback.bind (this))
			} else {
				this.refs.toast.show ('评论内容不能为空');
			}
		}
	}

	onAddCommentCallback (status, responseData) {
		this.canSendMsg = true;
		if (status) {
			this.setState ({commentText: ''})
			this.index = 1;
			this.data = [];
			this.refs.toast.show ('评论成功');
			this.requestComment ();
			//处理请求成功事件
		} else {
			//处理请求失败事件
			showErrorAlert (responseData);
		}
	}

	commentDeleteCallBack () {
		this.refs.toast.show ('删除评论成功');
		this.data = [...this.data];
		this.data.splice (this.deleteRowId, 1);
		this.setState ({
			dataSource: this.state.dataSource.cloneWithRows (this.data)
		});
	}
}
