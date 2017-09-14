import React, {Component, PropTypes} from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	TouchableOpacity,
	Modal,
	Animated,
	ScrollView,
	Platform
} from "react-native";
import * as common from '../../utils/CommonUtils';
import * as Images from '../../images/';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import Colors from '../../constants/Colors';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import NavigationBar from '../../components/NavigationBar';
import LinearGradient from 'react-native-linear-gradient';
import CollectionProductPage from './CollectionProductPage';
import CollectionSchemePage from './CollectionSchemePage';
import SettingPage from './SettingPage';
import MySchemePage from '../design/MySchemePage';
import MyStyleList from '../style/MyStyleList';
import TaskRecords from '../design/TaskRecords';
import {JpushApiMap} from '../../constants/Network'
import EvaluatePage from '../characterTest/EvaluatePage';
import ActivityListPage from '../activity/ActivityListPage';
import WebShoppingPage from '../share/WebShoppingPage';


import MessagePage from './MessagePage';
import styles from '../../styles/userInfo';

const deviceWidth = common.getWidth ();
const deviceHeight = common.getHeight ();

const shoppingIcon = require('../../images/user/icon_shopping_cart.png');
const orderIcon = require('../../images/user/icon_order.png');

class CharacterTextModal extends Component {
	render () {
		return (
			<Modal visible={this.props.modalVisible}
			       transparent={true}
			       onRequestClose={() => {}}
			       animationType={'none'}>
				<View style={{
					width: deviceWidth,
					height: deviceHeight,
					paddingTop: Platform.OS === 'ios' ? 20 : 0,
					backgroundColor: 'rgba(0, 0, 0, 0.9)'
				}}>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						marginTop: 20 / 667 * deviceHeight
					}}>
						<TouchableOpacity style={{paddingLeft: 15 / 375 * deviceWidth}}
						                  onPress={this.props.closeCharacterTextModal}>
							<Image source={require ('../../images/common/icon_back_white.png')}/>
						</TouchableOpacity>
						<Image source={require ('../../images/characterTest/logo.png')}/>
						<View />
					</View>

					<View style={{
						alignSelf: 'center',
						alignItems: 'center',
						backgroundColor: Colors.white,
						borderRadius: 5,
						height: 520 / 667 * deviceHeight,
						marginTop: 30 / 667 * deviceHeight,
						width: deviceWidth - 40 / 375 * deviceWidth
					}}>
						<Image
							source={require ('../../images/characterTest/modal_bg.png')}
							style={{marginVertical: 20 / 667 * deviceHeight}}
						/>

						<Text style={styles.modalText}>性冷淡北欧风？还是高逼格新中式？</Text>
						<Text style={styles.modalText}>精致派新古典？还是艺术感后现代？{'\n'}</Text>
						<Text style={styles.modalText}>也许你真的选不出喜欢哪一种。</Text>
						<Text style={styles.modalText}>但小V比你更懂你，一个品味测评后，</Text>
						<Text style={styles.modalText}>小V会为你解密，替你选择。</Text>

						<TouchableOpacity style={styles.modalButton} onPress={this.props.enterEvaluatePage}>
							<Text style={{color: Colors.white, fontSize: 20}}>马上开始</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		)
	}
}

export default class UserInfo extends Component {
	constructor (props) {
		super (props);
		this.state = {
			colorTop: '#FD7B5D',
			colorBottom: '#F14561',
			avatar: global.userInfo.avatar_url || global.userInfo.avatar,
			user: null,
			userName: global.userInfo.name || global.userInfo.userName,
			modalVisible: false,
			hasUnreadMsg: false, //是否有未读消息
		};
		this.onLeftBack = this.onLeftBack.bind (this);
		this.onSetting = this.onSetting.bind (this);
	}

	componentDidMount () {
		this.didFocusSubscription = this.props.navigator.navigationContext.addListener ('didfocus', event => {
			if (event._data.route.id == 'UserInfo') {
				this.getUnreadMessage ()
				let {avatar, avatar_url, userName, name} = global.userInfo;
				let tempAvatar = avatar_url || avatar;
				let tempName = name || userName;
				this.setState ({avatar: tempAvatar, userName: tempName, user: global.userInfo})
			}
		})
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

	enterWebShoppingCartPage() {
		this.props.navigator.push({component: WebShoppingPage, id: 'WebShoppingPage', params:{from: '#/cart'}})
	}

	enterOrderPage() {
		this.props.navigator.push({component: WebShoppingPage, id: 'WebShoppingPage', params:{from: '#/orders'}})
	}

	render () {
		let avatar = this.state.avatar ? {uri: this.state.avatar} : Images.headIcon

		return (
			<View style={{flex:1}}>
				<ScrollView style={styles.mainContainer}>
					<LinearGradient
						start={{x: 0.9, y: 0.2}} end={{x: 0, y: 1}}
						colors={[this.state.colorTop, this.state.colorBottom]}
						style={styles.gradient}>

						<View style={{alignItems: 'center', marginTop: Platform.OS == 'ios' ? 60 : 40}}>
							<Image source={avatar} style={styles.avatar}/>
							<Text style={styles.username}>{this.state.userName}</Text>
						</View>
					</LinearGradient>

					<TouchableOpacity
						style={[styles.listItem, styles.listItem1, {marginTop: 10 / 667 * deviceHeight}]}
						onPress={() => this.onMyTask ()}>
						<View style={styles.listItemLeftContainer}>
							<Image resizeMode={'contain'} style={styles.listItemImg}
							       source={Images.taskIcon}/>
							<Text style={styles.listItemText}>任务</Text>
						</View>
						<Image resizeMode={'contain'} style={styles.arrowImg}
						       source={Images.rightArrowIcon}/>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.listItem, styles.listItem1]}
					                  onPress={() => this.openCharacterTextModal ()}>
						<View style={styles.listItemLeftContainer}>
							<Image resizeMode={'contain'} style={styles.listItemImg}
							       source={Images.testIcon}/>
							<Text style={styles.listItemText}>品味密码</Text>
						</View>
						<Image resizeMode={'contain'} style={styles.arrowImg}
						       source={Images.rightArrowIcon}/>
					</TouchableOpacity>
					<View>
						<TouchableOpacity style={styles.listItem}
						                  onPress={() => this.enterWebShoppingCartPage()}>
							<View style={styles.listItemLeftContainer}>
								<Image resizeMode={'contain'} style={styles.listItemImg}
								       source={shoppingIcon}/>
								<Text style={styles.listItemText}>购物车</Text>
							</View>
							<Image resizeMode={'contain'} style={styles.arrowImg}
							       source={Images.rightArrowIcon}/>
						</TouchableOpacity>
						<View style={styles.dottedLine}/>
						<TouchableOpacity style={styles.listItem}
						                  onPress={() => this.enterOrderPage()}>
							<View style={styles.circleMaskLB}/>
							<View style={styles.circleMaskRB}/>
							<View style={styles.circleMaskLT}/>
							<View style={styles.circleMaskRT}/>
							<View style={styles.listItemLeftContainer}>
								<Image resizeMode={'contain'} style={styles.listItemImg}
								       source={orderIcon}/>
								<Text style={styles.listItemText}>订单</Text>
							</View>
							<Image resizeMode={'contain'} style={styles.arrowImg}
							       source={Images.rightArrowIcon}/>
						</TouchableOpacity>
					</View>
					<TouchableOpacity style={[styles.listItem, {marginTop: 10 / 667 * deviceHeight}]} onPress={() => this.onMyScheme ()}>
						<View style={styles.circleMaskLB} />
						<View style={styles.circleMaskRB} />
						<View style={styles.listItemLeftContainer}>
							<Image resizeMode={'contain'} style={styles.listItemImg}
							       source={Images.schemeIcon}/>
							<Text style={styles.listItemText}>方案</Text>
						</View>
						<Image resizeMode={'contain'} style={styles.arrowImg}
						       source={Images.rightArrowIcon}/>
					</TouchableOpacity>
					<View style={styles.dottedLine}/>
					<TouchableOpacity style={styles.listItem} onPress={() => this.enterMyStyleList ()}>
						<View style={styles.circleMaskLB}/>
						<View style={styles.circleMaskRB}/>
						<View style={styles.circleMaskLT}/>
						<View style={styles.circleMaskRT}/>
						<View style={styles.listItemLeftContainer}>
							<Image resizeMode={'contain'} style={styles.listItemImg}
							       source={Images.styleIcon}/>
							<Text style={styles.listItemText}>风格</Text>
						</View>
						<Image resizeMode={'contain'} style={styles.arrowImg}
						       source={Images.rightArrowIcon}/>
					</TouchableOpacity>
					<View style={styles.dottedLine}/>
					<TouchableOpacity
						style={styles.listItem}
						onPress={() => this.onCollectedProducts ()}>
						<View style={styles.circleMaskLT}/>
						<View style={styles.circleMaskRT}/>
						<View style={styles.listItemLeftContainer}>
							<Image resizeMode={'contain'} style={styles.listItemImg}
							       source={Images.productIcon}/>
							<Text style={styles.listItemText}>物品</Text>
						</View>
						<Image resizeMode={'contain'} style={styles.arrowImg}
						       source={Images.rightArrowIcon}/>
					</TouchableOpacity>



					{/*<TouchableOpacity style={[styles.listItem, styles.listItem1]} onPress={() => this.enterActivityPage ()}>
					 <View style={styles.listItemLeftContainer}>
					 <Image resizeMode={'contain'} style={styles.listItemImg}
					 source={Images.activityIcon}/>
					 <Text style={styles.listItemText}>活动</Text>
					 </View>
					 <Image resizeMode={'contain'} style={styles.arrowImg}
					 source={Images.rightArrowIcon}/>
					 </TouchableOpacity>*/}
					{/*<TouchableOpacity
					 style={[styles.listItem, styles.listItem1]}
					 onPress={() => this.onMyTask()}>
					 <View style={styles.listItemLeftContainer}>
					 <Image resizeMode={'contain'} style={styles.listItemImg}
					 source={Images.roomIcon}/>
					 <Text style={styles.listItemText}>户型</Text>
					 </View>
					 <Image resizeMode={'contain'} style={styles.arrowImg}
					 source={Images.rightArrowIcon}/>
					 </TouchableOpacity>*/}
					<TouchableOpacity
						style={[styles.listItem, styles.listItem1, {marginTop: 10 / 667 * deviceHeight}]}
						onPress={() => this.enterMessagePage ()}>
						<View style={styles.listItemLeftContainer}>
							<Image resizeMode={'contain'} style={styles.listItemImg}
							       source={Images.msgRedIcon}/>
							<Text style={styles.listItemText}>消息 </Text>
							{this.state.hasUnreadMsg && <View style={styles.msgPrompt}/>}
						</View>
						<Image resizeMode={'contain'} style={styles.arrowImg}
						       source={Images.rightArrowIcon}/>
					</TouchableOpacity>

					<Spinner visible={this.state.isFetching} text={'登录中,请稍候...'}/>
					<CharacterTextModal
						enterEvaluatePage={this.enterEvaluatePage.bind (this)}
						closeCharacterTextModal={this.closeCharacterTextModal.bind (this)}
						modalVisible={this.state.modalVisible}/>
				</ScrollView>
				<NavigationBar
					backgroundColor={'transparent'}
					title={''}
					style={{position: 'absolute', top: 0}}
					onLeftButtonPress={this.onLeftBack}
					onRightButton2Press={this.onSetting}
					leftButtonIcon={require ('../../images/common/icon_back_white.png')}
					rightButtonIcon2={require ('../../images/common/MeSetting.png')}
					rightButtonIcon1={require ('../../images/common/icon_customer_white.png')}
				/>
			</View>

		);
	}

	enterActivityPage () {
		this.props.navigator.push ({
			id: 'ActivityListPage',
			component: ActivityListPage,
		})
	}

	enterMessagePage () {
		this.props.navigator.push ({
			id: 'MessagePage',
			component: MessagePage,
		})
	}

	openCharacterTextModal () {
		this.setState ({modalVisible: true})
		// this.props.navigator.push({
		//   id: 'WebViewPage',
		//   component: WebViewPage,
		//   params: {
		//     title: '品味密码',
		//     url: 'http://activity.vidahouse.com/cohabit'
		//   }
		// })
	}

	closeCharacterTextModal () {
		this.setState ({modalVisible: false})
	}

	enterEvaluatePage () {
		this.setState ({modalVisible: false}, () => {
			this.props.navigator.push ({
				id: 'EvaluatePage',
				component: EvaluatePage,
			})
		})
	}

	onCollectedProducts () {
		const {navigator} = this.props;
		navigator.push ({
			id: "CollectionProductPage",
			component: CollectionProductPage,
		})
	}

	onCollectedScheme (collectType) {
		const {navigator} = this.props;
		navigator.push ({
			id: "CollectionSchemePage",
			component: CollectionSchemePage,
			collectType: collectType,
		})
	}

	onMyScheme () {
		const {navigator} = this.props;
		navigator.push ({
			id: "MySchemePage",
			component: MySchemePage,
		})
	}

	enterMyStyleList () {
		const {navigator} = this.props;
		navigator.push ({
			id: "MyStyleList",
			component: MyStyleList,
		})
	}

	onMyTask () {
		const {navigator} = this.props;
		navigator.push ({
			id: "TaskRecords",
			component: TaskRecords,
		})
	}

	onLeftBack () {
		const {navigator} = this.props;
		navigator.pop ();
	}

	onSetting () {
		const {navigator} = this.props;
		navigator.push ({
			id: "SettingPage",
			component: SettingPage,
			params: this.state.user
		})
	}

	componentWillUnmount () {
		this.didFocusSubscription.remove ();
	}
}
