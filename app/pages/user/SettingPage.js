/**
 * SettingPage.js
 * @desc: 个人设置页面
 * @author: traveller
 * @update: 2017-8-3
 * @updateContent: 户型地址，改为添加微信绑定
 * melody updated by 2017-8-17: 添加新消息通知
 */
import React from 'react'
import {
    View,
    Alert,
    Image,
    Text,
    Modal,
    Linking,
    StyleSheet,
    ScrollView,
    Switch,
    Platform,
    TouchableHighlight,
    TouchableOpacity
} from 'react-native'
import ImagePicker from 'react-native-image-picker'
import * as WeChat from 'react-native-wechat'
import Toast from 'react-native-easy-toast'
import Spinner from '../../libs/react-native-loading-spinner-overlay'
import * as common from '../../utils/CommonUtils'
import UploadToQiniu from '../../utils/UploadToQiniu'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'

import Colors from '../../constants/Colors'
import { ApiMap, CommunityApiMap, JpushApiMap } from '../../constants/Network'

import LoginPage from '../login/loginPage'
import ChangePasswordPage from '../login/changePasswordPage'

import NavigationBar from '../../components/NavigationBar'
import EditNickName from '../../components/EditNickName'
import FAQPage from './FAQpage'
import About from './About'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()
const apiRequest = new ApiRequest()

const RightArrow = require('../../images/community/icon_right.png')

export default class SettingPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			phoneShow: false,
			avatarSource: props.avatar_url || props.avatar,
			userName: props.userName,
			nick_name: props.name,
			isBindWechat: false,
			isFetching: false,
			fetchingText: '',
			wechatNickName: '',
			showDownloadAlert: false,
			switchState: true, //是否接收消息通知
		}
	}

	componentWillMount() {
		//获取用户设置消息提醒
		let token = global.userInfo.Authorization
		apiRequest.request(JpushApiMap.inquirePushFunction, {token: token}, null, (status, response) => {
			if (status) {
				this.setState({switchState: response.is_push})
			}
		})
	}

	// 弹出客服电话
	setPhoneShow(visiable) {
		this.setState({phoneShow: visiable})
	}

	// 弹出修改头像
	selectPhotoTapped() {
		const options = {
			title: '修改头像',
			takePhotoButtonTitle: '拍摄',
			chooseFromLibraryButtonTitle: '从相册选择',
			cancelButtonTitle: '取消',
			quality: 0.8,
			maxWidht: 400,
			maxHeight: 400,
			noData: true,
			allowsEditing: false,
		};
		ImagePicker.showImagePicker(options, response => this.chooseImgCallback(response))
	}

	// 选择头像
	chooseImgCallback(response) {

		if (response.didCancel) {
			console.log('user cancelled photo picker');
		} else if (response.error) {
			console.log('ImagePicker error:', response.error);
		} else if (response.customButton) {
			console.log('user tapped customButton:', response.customButton);
		} else {
			//将response的结果，调用请求上传到七牛
			let file = {uri: response.uri, type: 'multipart/form-data'};
			UploadToQiniu.uploadHeadIcon(file, (status, res) => {
				if (status && res.storageKey) {
					let avatarSource = `http://headicon.s.vidahouse.com/${res.storageKey}`;
					let body = {
						"img_url": avatarSource,
					}
//					let params = {
//						communityUserId: global.userInfo.user_id
//					}
					apiRequest.request(CommunityApiMap.updateImage, null, body, (status, responseData) => {
						global.userInfo = Object.assign({}, global.userInfo, {avatar: avatarSource});
						global.storage.save({
							key: 'userInfo',  //注意:请不要在key中使用_下划线符号!
							data: {userInfo: Object.assign({}, global.userInfo, {avatar: avatarSource})},
						});
						this.setState({avatarSource: avatarSource})
					});
				} else {
					throw '-- 上传头像失败 --';
				}
			})
		}
	}

	// 返回
	onLeftBack() {
		this.props.navigator.pop()
	}

	// 退出登录
	signout() {
		global.storage.save({
			key: 'userInfo',  //注意:请不要在key中使用_下划线符号!
			data: {userInfo: null},
		});
		global.userInfo = null;
		global.storage.clearMapForKey('activityList' )
		this.props.navigator.resetTo({id: 'LoginPage', component: LoginPage});
	}

	// 关于我们
	enterAboutPage = () => {
		this.props.navigator.push({id: 'about', component: About})
	};

	// 常见问题
	enterFAQPage = () => {
		this.props.navigator.push({id: 'FAQ', component: FAQPage})
	};

	//忘记密码
	enterChangePasswordPage() {
		this.props.navigator.push({id: 'ChangePasswordPage', component: ChangePasswordPage})
	}

	// 拨打客服
	call() {
		let url = 'tel:4008219191';
		Linking.canOpenURL(url).then(supported => {
			if (!supported) {
				console.log('Can\'t handle url: ' + url);
			} else {
				return Linking.openURL(url);
			}
		}).catch(err => console.log('An error occurred', err));
	}

	modalButtonOnClick(ensure, nickName) {
		this.setState({showDownloadAlert: !this.state.showDownloadAlert});
		let body = {
			nick_name: nickName
		};
		if (ensure) {
			apiRequest.request(CommunityApiMap.updateNickname, null, body, (status, responseData) => {
				if (status) {
					global.userInfo = Object.assign({}, global.userInfo, {name: nickName});
					global.storage.save({
						key: 'userInfo',  //注意:请不要在key中使用_下划线符号!
						data: {userInfo: Object.assign({}, global.userInfo, {name: nickName})},
					});
					this.setState({nick_name: nickName})
				} else {
					showErrorAlert(responseData)
				}
			});
		}
	}

	showEditAlert() {
		this.setState({showDownloadAlert: true});
	}

	/**
	 * @name: 确认绑定微信
	 * @param: wechatData 微信返回的数据, 带这token 去绑定后端
	 */
	confirmBindWechatforApi (wechatData) {
		let {openid, access_token} = common.getSafetyJsonObj(wechatData);
		let body = {
			openid,
			accessToken: access_token,
			oAuthProvider: 'wechat',
			appId: common.getWechatAppID()
		}
		// 请求后端绑定微信结果
		apiRequest.request(ApiMap.bindWechat, null, body, (status, res) => {
			if (status) {
				let params = {
					accessToken: access_token,
					openId: openid
				}
				// 请求用户微信 的基本信息
				apiRequest.request(ApiMap.getWechatuUser, params, null, (status, res) => {
					if (status) {
						let {nickname} = common.getSafetyJsonObj(res)
						this.setState({wechatNickName: nickname, isBindWechat: true})
						this.refs.toast.show(' 微信关联成功 ')
					} else {
						showErrorAlert(res)
					}
				})
			} else {
				showErrorAlert(res)
			}
		})
	}

	/**
	 * 1、this.confirmBindWechat()
	 * 微信登录授权请求 WeChat.sendAuthRequest(scope, state) => result => 获取微信登录token() => Wechatdata => step 2
	 *
	 * 2、this.confirmBindWechatforApi(wechatData)
	 * 获取微信的token => bindWechat()  => 微信绑定的结果 => 如果绑定过，isBind = true => step 3
	 * | 否则没有绑定 isBind = false => step 4
	 * 3、获取已经绑定用户微信的用户信息，用户的微信昵称呈现在微信栏里，
	 * 4、通过流程，绑定微信
	 */

	confirmBindWechat() {
		let scope = "snsapi_userinfo"; //获取用户个人信息
		let state = common.getWechatAppSecret(); // 用于保持请求和回调的状态，授权请求后原样带回给第三方
		// 发起微信APP授权登录
		WeChat.sendAuthRequest(scope, state).then( result => {
			if (result) {
				let {state, errCode, code} = result;
				if (state === common.getWechatAppSecret() && errCode === 0) { // 授权成功
					this.setState({
						isFetching: true,
						fetchingText: '关联登录中，请稍候...'
					})
					let params = {
						code,
						appid: common.getWechatAppID(),
						secret: common.getWechatAppSecret(),
						grant_type: 'authorization_code'
					}
					// 请求微信token
					apiRequest.request(ApiMap.getWechatToken, params, null, (status, res) => {
						this.setState({
							isFetching: false
						})
						if (status) { // 请求微信成功，后端绑定App
							this.confirmBindWechatforApi(res) // 确认绑定微信
						} else {
							showErrorAlert(res);
						}
					});
				} else if (errCode === -2) { // 用户取消
					this.refs.toast.show(' 取消绑定 ')
				}
			}
		}).catch(e => {
			showErrorAlert(e)
			// this.refs.toast.show(' 已经取消绑定 ')
		})

	}

	// 绑定微信
	bindWechat() {
		if (this.state.isBindWechat) {
			this.refs.toast.show(' 已绑定微信，玩的开心 ', 1000)
		} else {
			this.confirmBindWechat()
		}
	}

	// 调起微信
	wechatBind() {
		// 验证微信是否被安装
		WeChat.isWXAppInstalled().then(isInstalled => {
			if (isInstalled) { // 微信已安装
				let body = {
					OAuthProvider: 'wechat',
					Openid: this.props.route.openId,
					AppId: common.getWechatAppID(),
					AccessToken: this.props.route.wechatToken
				}
				apiRequest.request(ApiMap.bindWechat, null, body, () => {
				})
			} else { // 未安装
				Alert.alert('没有安装微信', '请先安装微信客户端再进行登录', [
					{text: '确定'}
				])
			}
		})
	}

	//消息通知
	changeReceiveMessage(value) {
	  	let body = {
	    	is_push: value
	  	}
		apiRequest.request(JpushApiMap.updatePushFunction, null, body, (status, response) => {
			if (status) {
				this.setState((preState, prop) => {
					return {switchState: !preState.switchState}
				})
			} else {
				showErrorAlert(response)
			}
		})

	}

	render() {
		return (
			<View style={{flex: 1, backgroundColor: Colors.mainBgColor}}>
				<NavigationBar
					title={'设置'}
					navigator={this.props.navigator}
					titleColor={Colors.black}
					backgroundColor={Colors.white}
					onLeftButtonPress={() => this.onLeftBack()}
					leftButtonIcon={require('../../images/common/icon_back_black.png')}
					logoIcon={require('../../images/common/logo_black.png')}
					verticalLineColor={Colors.black}
				/>
				<ScrollView style={{height: deviceHeight}}>
					{/*头像*/}
					<TouchableHighlight onPress={() => this.selectPhotoTapped()}
										style={{backgroundColor: '#fff', marginTop: common.adaptWidth(24)}}
										underlayColor={'#dcdcdc'} activeOpacity={0.8}>
						<View style={styles.oneLine}>
							<Text style={styles.textTitle}>修改头像</Text>

							<Image source={{uri: this.state.avatarSource ? this.state.avatarSource : common.avatar}}
								   resizeMode={'stretch'}
								   style={{
									   height: common.adaptWidth(70),
									   width: common.adaptWidth(70),
									   borderRadius: 12
								   }}/>

						</View>
					</TouchableHighlight>

					<View style={styles.line}/>

					{/*昵称*/}
					<TouchableHighlight
						style={{backgroundColor: '#fff'}}
						underlayColor={'#dcdcdc'}
						activeOpacity={0.8}
						onPress={() => this.showEditAlert()}>
						<View style={styles.oneLine}>
							<Text style={styles.textTitle}>昵称</Text>
							<Text>{this.state.nick_name}</Text>
						</View>
					</TouchableHighlight>

					<View style={styles.line}/>

					{/*性别*/}
					<TouchableHighlight style={{backgroundColor: '#fff'}}
										underlayColor={'#dcdcdc'} activeOpacity={0.8}>
						<View style={styles.oneLine}>
							<Text style={styles.textTitle}>性别</Text>
							<Text>未知</Text>
						</View>
					</TouchableHighlight>

					{/*微信绑定*/}
					<TouchableHighlight
						style={{marginTop: common.adaptWidth(20)}}
						underlayColor={'#dcdcdc'}
						activeOpacity={0.8}
						onPress={() => this.bindWechat()}>
						<View style={styles.oneLine}>
							<Text style={styles.textTitle}>微信</Text>
							{
								this.state.isBindWechat
									? (<View><Text>{this.state.wechatNickName}</Text></View>)
									: (<View style={{flexDirection: 'row', alignItems: 'center'}}>
									<Text style={{marginRight: common.adaptWidth(10), fontSize: 12}}>未认证</Text>
									<Image source={RightArrow}
										   resizeMode={'contain'}
										   style={{height: common.adaptWidth(26), width: common.adaptWidth(16)}}/>
								</View>)
							}
						</View>
					</TouchableHighlight>
					<View style={styles.line}/>
					{/*新消息通知*/}
					<View>
						<View style={styles.oneLine}>
							<Text style={styles.textTitle}>新消息通知</Text>
							<Switch
								value = {this.state.switchState}
								onTintColor = {Colors.mainColor}
								thumbTintColor = {Colors.white}
								tintColor = {Colors.lightGrey}
								onValueChange = {(value) => { this.changeReceiveMessage(value) }}/>
						</View>
					</View>
					<View style={styles.line}/>
					{/*修改密码*/}
					<TouchableHighlight
						style={{marginBottom: common.adaptWidth(20)}}
						underlayColor={'#dcdcdc'}
						activeOpacity={0.8}
						onPress={() => this.enterChangePasswordPage()}>
						<View style={styles.oneLine}>
							<Text style={styles.textTitle}>修改密码</Text>
							<Image source={RightArrow}
								   resizeMode={'contain'}
								   style={{height: common.adaptWidth(26), width: common.adaptWidth(16)}}/>
						</View>
					</TouchableHighlight>

					{/*常见问题*/}
					<TouchableHighlight onPress={() => this.enterFAQPage()}
										style={{backgroundColor: '#fff'}}
										underlayColor={'#dcdcdc'} activeOpacity={0.8}>
						<View style={styles.oneLine}>
							<Text style={styles.textTitle}>常见问题</Text>
							<Image source={RightArrow}
								   resizeMode={'contain'}
								   style={{height: common.adaptWidth(26), width: common.adaptWidth(16)}}/>
						</View>
					</TouchableHighlight>

					<View style={styles.line}/>

					{/*客服电话*/}
					<TouchableHighlight onPress={() => {
						global.ANDROID_PLATFORM && this.setState({phoneShow: true});
						!global.ANDROID_PLATFORM && this.call()
					}}
										style={{backgroundColor: '#fff'}}
										underlayColor={'#dcdcdc'} activeOpacity={0.8}>
						<View style={styles.oneLine}>
							<Text style={styles.textTitle}>客服电话</Text>
							<Text>400-821-9191</Text>
						</View>
					</TouchableHighlight>
					{/*客服弹窗*/}
					<Modal
						animationType={"fade"}
						transparent={true}
						visible={this.state.phoneShow}
						onRequestClose={() => {
							console.log("Modal has been closed.")
						}}
						style={{backgroundColor: '#000', flex: 1}}
					>
						<View style={{backgroundColor: '#000', flex: 1, opacity: 0.6}}/>
						<View style={{
							position: 'absolute',
							top: (deviceHeight - common.adaptWidth(500)) / 2,
							left: deviceWidth / 2 - common.adaptWidth(250),
							backgroundColor: '#fefefe',
							overflow: 'hidden',
							borderRadius: common.adaptWidth(10),
							width: common.adaptWidth(500),
							height: common.adaptWidth(250)
						}}>

							{/*电话*/}
							<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
								<Text style={{fontSize: 20, color: '#262626'}}>400-821-9191</Text>
							</View>

							{/*按钮*/}
							<View style={{flexDirection: 'row'}}>
								<TouchableOpacity
									style={styles.phoneButton}
									onPress={() => {
										this.setPhoneShow(!this.state.phoneShow)
									}}>
									<Text>取消</Text>
								</TouchableOpacity>

								<View style={{
									height: common.adaptWidth(70),
									borderLeftWidth: 1,
									borderColor: '#e6e6e6'
								}}/>

								<TouchableOpacity
									style={styles.phoneButton}
									onPress={() => {
										this.call()
										this.setPhoneShow(!this.state.phoneShow)
									}}>
									<Text>呼叫</Text>
								</TouchableOpacity>
							</View>

						</View>
					</Modal>


					<View style={styles.line}/>

					{/*关于我们*/}
					<TouchableHighlight onPress={() => this.enterAboutPage()}
										style={{backgroundColor: '#fff'}}
										underlayColor={'#dcdcdc'} activeOpacity={0.8}>
						<View style={styles.oneLine}>
							<Text style={styles.textTitle}>关于我们</Text>
							<Image source={RightArrow}
								   resizeMode={'contain'}
								   style={{height: common.adaptWidth(26), width: common.adaptWidth(16)}}/>
						</View>
					</TouchableHighlight>

					{
						global.ANDROID_PLATFORM
							? (<View>
							{/*当前版本*/}
							<TouchableHighlight style={{marginTop: common.adaptWidth(20)}}
												underlayColor={'#dcdcdc'} activeOpacity={0.8}>
								<View style={styles.oneLine}>
									<Text style={styles.textTitle}>当前版本</Text>
									<Text>V2.0.0</Text>
								</View>
							</TouchableHighlight>

							<View style={styles.line}/>

							{/*版本更新*/}
							<TouchableHighlight underlayColor={'#dcdcdc'} activeOpacity={0.8}>
								<View style={styles.oneLine}>
									<Text style={styles.textTitle}>版本更新</Text>
								</View>
							</TouchableHighlight>
						</View>)
							: null
					}

					<TouchableOpacity style={styles.signout} onPress={this.signout.bind(this)}>
						<Text style={{fontSize: 18, color: Colors.mainColor}}>退出登录</Text>
					</TouchableOpacity>
				</ScrollView>
				<EditNickName
					modalVisible = {this.state.showDownloadAlert}
					nickName={this.state.nick_name}
					onClick={(ensure, nickName) => this.modalButtonOnClick(ensure, nickName)}/>
				<Toast ref="toast"/>
				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
    oneLine: {
        backgroundColor: '#fff',
        width: deviceWidth,
        height: common.adaptWidth(96),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 20
    },
    textTitle: {color: '#262626', fontSize: 16},
    line: {borderWidth: 0.3, width: deviceWidth, borderColor: '#e6e6e6'},
    addressFont: {fontSize: 13, color: '#808080'},
    signout: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        height: 50 / 667 * deviceHeight,
        justifyContent: 'center',
        marginTop: 10 / 667 * deviceHeight,
        width: deviceWidth,
    },
    phoneButton: {
        flex: 1,
        width: common.adaptWidth(250),
        height: common.adaptWidth(70),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#e6e6e6',
    },
    // 修改头像 弹窗按钮
    avatar: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        height: common.adaptWidth(110),
        width: common.adaptWidth(680)
    },
    borderRadius: {
        borderRadius: common.adaptWidth(10),
    },
    avatarDialogText: {
        fontSize: 17,
        color: '#067DEF'
    }
})
