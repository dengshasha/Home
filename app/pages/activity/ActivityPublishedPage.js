import React, {Component} from "react";
import {
	View,
	Text,
	Image,
	WebView,
	Platform,
	ListView,
	Modal,
	NativeModules,
	TouchableOpacity,
	TouchableWithoutFeedback
} from "react-native";
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {CommunityApiMap, activityAddress} from '../../constants/Network';
import CrosswalkWebView from '../../libs/react-native-webview-crosswalk';
import NavigationBar from '../../components/NavigationBar';
import * as Icon from '../../images/';
import * as Images from '../../images/share/main';
import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import Orientation from 'react-native-orientation';
import {PanoramaSharedModal, PanoramaRateModal} from '../../components/Modal';
import ScoreModal from '../../components/ScoreModal';
import Toast from 'react-native-easy-toast';
import ActivityCommentPage from './ActivityCommentPage';
import DesignerPage from '../style/DesignerPage'
import StarTrendPage from './StarTrendPage'
import styles from '../../styles/activityPublished'

var WeChat = require('react-native-wechat');
var UMNative = NativeModules.UMNative;
var deviceWidth = common.getWidth();
var deviceHeight = common.getHeight();
var panoramaIcon, otherDesignIcon;

const apiRequest = new ApiRequest();

class PromptModal extends Component {
	constructor(props) {
		super(props)
		this.state = {
			modalVisible: true
		}
	}

	render() {
		return (
			<Modal visible = {this.state.modalVisible}
				transparent = {true}
				onRequestClose = {() => {}}
				animationType = {'none'}>
				<View style={styles.modalContainer}>
					<Image source = {require('../../images/activity/published_shareText.png')} style = {styles.promptModalImg}>
						<TouchableOpacity onPress = {() => this.setState({modalVisible: false})} style = {styles.promptCloseBtn}>
							<Image source={require('../../images/activity/published_close.png')} />
						</TouchableOpacity>
					</Image>
				</View>
			</Modal>
		)
	}
}

//当前排名
class Ranking extends Component {
	renderOtherRanking() {
		return (
			<View style={styles.rankingContainer}>
				<View style={styles.rankingTextContainer}>
					<Text style={styles.ranking}>NO.{this.props.ranking}</Text>
					<Text style={{color: Colors.white}} numberOfLines = {1} ellipsizeMode = {'tail'}>{this.props.userName}</Text>
				</View>
				<TouchableWithoutFeedback onPress={() =>
					this.props.navigator.push({component: DesignerPage, userId: this.props.userId})}>
					<Image source={this.props.avatar} style={styles.authorAvatar}/>
				</TouchableWithoutFeedback>
			</View>
		)
	}
	renderOwnerRanking() {
		return (
			<View style={styles.ownerRankingContainer}>
				<Text style={styles.ranking}>{this.props.ranking}</Text>
				<Text style={{color: Colors.white}}>当前排名</Text>
			</View>
		)
	}

	render() {
		return this.props.isOwner ? this.renderOwnerRanking() : this.renderOtherRanking()
	}

}

//点赞人列表
class LikeList extends Component {
    constructor(props) {
      super(props)
    }

    openModal(rowData) {
      this.props.openModal(rowData)
    }

    _renderRow(rowData, sectionID, rowID) {
        let avatar = rowData.author.avatar_url ? {uri: rowData.author.avatar_url} : Icon.headIcon
        return(
          <TouchableOpacity onPress = {() => this.openModal(rowData)} style = {styles.likeListBtn}>
            <Image source = {avatar} style={styles.avatar}/>
            <View style = {styles.authorNameContainer}>
            	<Text
            		numberOfLines = {1}
            		ellipsizeMode = {'tail'}
            		style = {styles.authorName}>{rowData.author.name}</Text>
            </View>
          </TouchableOpacity>
        )
    }

    render() {
        return(
            <View style = {{
                bottom: 30 / 667 * deviceHeight,
                height: 60 / 667 * deviceHeight,
                position: 'absolute',
                width: deviceWidth,
            }}>
                <ListView
                    contentContainerStyle = {{paddingHorizontal: 10}}
                    showsHorizontalScrollIndicator = {false}
                    showsVerticalScrollIndicator = {false}
                    horizontal = {true}
                    dataSource = {this.props.dataSource}
                    enableEmptySections = {true}
                    onEndReached = {this.props.renderMore}
                    renderRow = {this._renderRow.bind(this)}/>
            </View>
        )
    }
}

export default class ActivityPublishedPage extends Component {
	constructor(props) {
		super(props);
		let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		this.state = {
			likePeopleDataSource: ds.cloneWithRows([]),
			isFetching: false,
			fetchingText: '',
			showShareModal: false,
			showRateModal: false,
			likeState: false, // 点赞状态
			totalStar: 0,
			scoreModalVisible: false,
			likePeople: '',
			rateStar: 0, //单次分数
			isOwner: false,
			commentCount: 0,//评论数量
		}
		this.work = undefined;
		this.totalStar = 0;
		this.usersIndex = 1;
		this.likePeopleData = [];
		this.workId = props.workId;
		this.activity = props.activity;
		this.getActivityDetailWork = this.getActivityDetailWork.bind(this);
		this.getActivityUsersWhoLikeWork = this.getActivityUsersWhoLikeWork.bind(this);
		this.getActivityWorkRateOfUser = this.getActivityWorkRateOfUser.bind(this);

	}

	componentWillMount() {
		this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
			if (event._data.route.id != 'ActivityPanoramaPage') {
				Orientation.lockToPortrait();
			} else {
				Orientation.unlockAllOrientations();
			}
		});

		WeChat.isWXAppInstalled()
			.then((isInstalled) =>
				!isInstalled ? (this.modalVisible = false) : (this.modalVisible = true)
			)
		Orientation.addOrientationListener((orientation) => {
			if (orientation == 'LANDSCAPE') {
				deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getWidth() - 20 : common.getNormalHeight() - 20;
				deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() : common.getWidth();
			} else if (orientation == 'PORTRAIT') {
				deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getWidth() : common.getNormalHeight();
				deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() - 20 : common.getWidth() - 20;
			}
			this.setState({})
		})


		UMNative.onPageBegin('ActivityPublishedPage');

		// 获取活动相关呼叫
		global.storage.load({
			key: 'activityList',
			id: this.props.activityId
		}).then(res => {
			if (res) {
				this.activity = res;
			}
		}).catch(e => {
			switch (e.name) {
				case 'NotFoundError':
					break;
				case 'ExpiredError':
					// TODO
					break;
			}
		}).finally(
			// 获取参加活动的作品详情
			() => {
				this.getActivityDetailWork();
				this.getActivityUsersWhoLikeWork();
				this.getComment();
			}
		)
	}

	componentDidMount() {
		this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
			if (event._data.route.id == 'ActivityPublishedPage') {
				this.getComment()
			}
		})
	}

	componentWillUnmount() {
		this.didFocusSubscription.remove()
		Orientation.lockToPortrait();
		Orientation.removeOrientationListener();
		UMNative.onPageEnd('ActivityPublishedPage');
	}

	//获取评论数量
	getComment() {
		let params = {
		  communityTargetId: this.workId, 
		  communityIndex: 1,
		}
		apiRequest.request(CommunityApiMap.getActivityWorkComment, params, null, (status, response) => {
			if (status) {
				this.setState({
					commentCount: response.total
				})
			}
		})
	}

	getActivityDetailWork() {
		apiRequest.request(CommunityApiMap.getActivityWork, {activityWorkId: this.workId}, null, (status, response) => {
			if (status) {
				this.work = response;
				this.totalStar = response.rating;
				this.setState({
					isOwner: response.author.user_id === global.userInfo.user_id
				})
			} else {
				showErrorAlert(response)
			}
		});
	}

	getActivityUsersWhoLikeWork() {
		this.setState({
			isFetching: true,
			fetchingText: '评分列表获取中，请稍候...'
		})
		apiRequest.request(CommunityApiMap.getActivityWorkRateList, {
			activityRatingId: this.workId,
			communityIndex: this.usersIndex,
			order_condition: 'createat',
			order_by: 'desc'
		}, null, (status, response) => {
			this.setState({
				isFetching: false
			});
			if (status) {
				if (this.likePeopleData % 20 == 0) {
					this.likePeopleData = [...this.likePeopleData, ...response.data];
				} else {
					this.likePeopleData = response.data;
				}
				this.setState({
					likePeopleDataSource: this.state.likePeopleDataSource.cloneWithRows(this.likePeopleData),
				})
				this.getActivityWorkRateOfUser();
			} else {
				showErrorAlert(response)
			}
		});
	}

	getActivityWorkRateOfUser() {
		this.setState({
			fetchingText: '评分信息获取中，请稍候...'
		})
		apiRequest.request(CommunityApiMap.getActivityWorkRateOfUser, {
				activityRateWorkId: this.workId,
				activityRateUserId: global.userInfo.user_id
			},
			null, (status, response) => {
				this.setState({
					isFetching: false
				});
				if (status) {
					if (response.data.rating > 0)
						this.setState({
							likeState: true
						})
				} else {
					// showErrorAlert(response)
				}
			});
	}

	isPortrait() {
		return deviceWidth < deviceHeight;
	}

	closeScoreModal() {
		this.setState({
			scoreModalVisible: false
		})
	}

	openScoreModal(likePeopleData) {
		this.setState({
			scoreModalVisible: true,
			likePeople: likePeopleData
		})
	}

	enterGeneralUserPage(userId) {
		this.setState({
			scoreModalVisible: false
		})
		this.props.navigator.push({id: 'DesignerPage', component: DesignerPage, userId: userId})
	}


	//评分人列表加载更多
	renderLikePeopleMore() {
		if (this.likePeopleData.length % 20 === 0 && this.likePeopleData.length !== 0) {
			this.likePeopleData = [];
			this.usersIndex++;
			this.getActivityUsersWhoLikeWork();
		}
	}

	//刷新
	onFresh() {
		this.likePeopleData = [];
		this.usersIndex = 1;
		this.getActivityUsersWhoLikeWork();
		this.getActivityDetailWork();
		this.getComment()
	}

	renderButtons() {
		let menuData = panoramaIcon.concat();
		let menuWidth;
		let imageWidth;
		let fontSize;
		if (this.isPortrait()) {
			menuWidth = deviceHeight / 9;
			imageWidth = deviceHeight / 13;
			fontSize = 13;
		} else {
			menuWidth = deviceHeight / 6;
			imageWidth = deviceHeight / 9;
			fontSize = 10;
		}

		return menuData.map((item, index) => {
			return (
				<View key={index} style={{alignItems: 'center', marginTop: 10, width: menuWidth, height: menuWidth}}>
					<TouchableOpacity onPress={() => item.onPress()}>
						<Image resizeMode={'contain'} style={{width: imageWidth, height: imageWidth}}
							   source={item.image}/>
					</TouchableOpacity>
					<Text style={{fontSize: fontSize, color: '#fff', marginTop: 3}}>{item.text}</Text>
				</View>
			)
		})
	}

	renderWebview() {
		let url = this.work.pano_url;
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

	render() {
		if (!this.activity || !this.work) return <View/>;
		let sharedUrl = activityAddress + "?activity=" + this.activity.id + "&id=" + this.workId;
		let imageUrl = sharedUrl;
		let avatar = this.work.author.avatar_url ? {uri: this.work.author.avatar_url} : Icon.headIcon;
		let totalStar = this.totalStar + '星';
		return (
			<View style={{flex: 1}}>
				{this.renderWebview()}
				<NavigationBar
					style={{position: 'absolute'}}
					title={''}
					backgroundColor={Colors.transparent}
					onLeftButtonPress={() => this.props.navigator.pop()}
					leftButtonIcon={Icon.backWhite}
					rightButtonIcon1={Images.refreshIcon}
					onRightButton1Press={() => this.onFresh()}/>
				{/**菜单栏**/}
				<View style={{
					position: 'absolute',
					alignItems: 'center',
					top: 50,
					bottom: 50,
					right: 0,
					width: this.isPortrait() ? deviceHeight / 9 : deviceHeight / 6,
					height: deviceHeight - 100,
					justifyContent: 'center'
				}}>
					<View style={{alignItems: 'center', marginTop: 10, width: 60, height: 90}}>
						<TouchableOpacity onPress={() => this.likeWork()}>
							<Image resizeMode={'contain'}
								   style={{width: 60, height: 60, justifyContent: 'center', alignItems: 'center'}}
								   source={(this.state.likeState || this.state.isOwner) ? Images.rateIcon : Images.transparentRateIcon}>
							</Image>
						</TouchableOpacity>
						<Text style={{
							color: '#fff',
							marginTop: 3
						}}>{(this.state.likeState || this.state.isOwner) ? totalStar : '点亮'}</Text>
					</View>
					<View style={{alignItems: 'center', marginTop: 10, width: 60, height: 90}}>
						<TouchableOpacity onPress={() => this.onEnterComment()}>
							<Image resizeMode={'contain'} style={{width: 60, height: 60}} source={Images.commentIcon}/>
						</TouchableOpacity>
						<Text style={{
							color: '#fff',
							marginTop: 3
						}}>{this.state.commentCount ? this.state.commentCount + '条' : '暂无'}</Text>
					</View>
					<View style={{alignItems: 'center', marginTop: 10, width: 60, height: 90}}>
						<TouchableOpacity onPress={() => this.setState({showShareModal: true})}>
							<Image resizeMode={'contain'} style={{width: 60, height: 60}} source={Images.shareIcon}/>
						</TouchableOpacity>
						<Text style={{color: '#fff', marginTop: 3}}>分享</Text>
					</View>
				</View>
				<Ranking
					navigator={this.props.navigator}
					ranking={this.work.rank}
					isOwner={this.state.isOwner}
					userId={this.work.author.user_id}
					avatar={avatar}
					userName = {this.work.author.name}
				/>
				<LikeList
					openModal={(likePeopleData) => this.openScoreModal(likePeopleData)}
					dataSource={this.state.likePeopleDataSource}/>
				<PanoramaRateModal
					currentRate={this.state.rateStar}
					visible={this.state.showRateModal}
					onSetRateCount={(index) => {
						this.setState({rateStar: index})
					}}
					onRate={() => this.onRate()}
					onClose={() => this.setState({showRateModal: false})}
					closeRateDialog={() => {
						this.setState({
							showRateModal: false,
							rateStar: 0
						})
					}}/>
				<PanoramaSharedModal
					url={imageUrl}
					thumbImage={this.activity.wechat_share_icon}
					title={this.activity.wechat_share_title}
					description={this.activity.wechat_share_content}
					visible={this.state.showShareModal}
					closeShareDialog={() => this.setState({showShareModal: false})}/>
				<Toast ref={(toast) => this.toast = toast}/>
				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
				<ScoreModal
					enterGeneralUserPage={(userId) => this.enterGeneralUserPage(userId)}
					data={this.state.likePeople}
					closeModal={() => this.closeScoreModal()}
					modalVisible={this.state.scoreModalVisible}/>
				{this.state.isOwner && <PromptModal />}
			</View>
		)
	}

	likeWork() {
		if (this.state.isOwner) {
			this.props.navigator.push({
				id: 'StarTrendPage',
				component: StarTrendPage,
				workId: this.workId,
				activity: this.activity
			})
		} else {
			if (!this.state.likeState) {
				this.setState({
					showRateModal: true,
				})
			} else {
				this.toast.show('您已经评过分啦，赶紧去分享吧！');
			}
		}
	}

	onRate() {
		apiRequest.request(CommunityApiMap.addActivityWorkRate, null, {
			works_id: this.workId,
			rating: this.state.rateStar
		}, (status, response) => {
			if (status) {
				this.setState({
					showRateModal: false,
					rateStar: 0,
					//likeState: true
				})
				this.getActivityUsersWhoLikeWork();
				this.getActivityDetailWork();
				this.toast.show('感谢您的评价');
			}
		})
	}

	onEnterComment() {
		this.props.navigator.push({
			id: 'ActivityCommentPage',
			component: ActivityCommentPage,
			workId: this.workId
		});
	}
}
