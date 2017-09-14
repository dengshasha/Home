import React, { Component } from 'react'
import {
	StyleSheet,
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	Alert,
	NativeModules,
	Platform
} from 'react-native'

import LayoutAnimation from 'LayoutAnimation'
import Keyboard from 'Keyboard'
import * as common from '../../utils/CommonUtils'
import Colors from '../../constants/Colors'
import Spinner from '../../libs/react-native-loading-spinner-overlay'
import RegisterPage from './registerPage'
import { ApiMap, CommunityApiMap, BASE_URL } from '../../constants/Network'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import GetUserInfo from '../../utils/GetUserInfo'
import MainPage from '../mainPage'
import ChangePasswordPage from './changePasswordPage'
import AreaSelectPage from './AreaSelectPage'
var WeChat = require('react-native-wechat')
import BindPhoneNumberPage from './BindPhoneNumberPage'
import Toast, { DURATION } from 'react-native-easy-toast'
var CryptoJS = require('crypto-js')
import DeviceInfo from 'react-native-device-info'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()
const apiRequest = new ApiRequest()
const publicAccount = {username: 'test1', password: 'Qq@qq.com0'}

export default class LoginPage extends Component {

	constructor (props) {
		super(props)
		this.state = {
			username: '',
			password: '',
			ccode: '+86', //区号
			area: '中国大陆',
			phoneNum: '',
			secureTextEntry: true,
			secureTextEye: false,
			isFetching: false,
			fetchingText: '',
			isWXAppInstalled: false
		}
		this.onLogin = this.onLogin.bind(this)
		this.onWechatLogin = this.onWechatLogin.bind(this)
		this.onSecureTextEye = this.onSecureTextEye.bind(this)
		this.onRegister = this.onRegister.bind(this)
		this.onForgetPassword = this.onForgetPassword.bind(this)
		this.onSelectArea = this.onSelectArea.bind(this)
		this.onSelect = this.onSelect.bind(this)
	}

	componentDidMount () {
		WeChat.isWXAppInstalled()
			.then((result) => {
				if (result)
					this.setState({isWXAppInstalled: true})
			}).catch((e) => { })
		Keyboard.addListener('keyboardWillShow', this.updateKeyboardSpace.bind(this))
		Keyboard.addListener('keyboardWillHide', this.resetKeyboardSpace.bind(this))
	}

	componentWillUnmount () {
		Keyboard.removeAllListeners('keyboardWillShow', 'keyboardWillHide')
	}

	onLoginCallback (status, responseData) {
		this.setState({isFetching: false })
		if (status) {
			global.userInfo = responseData
			// 获取用户数据
			apiRequest.request(ApiMap.getUserInfo, null, null, (status, res) => {
				if (status) {
					global.userInfo = Object.assign({}, responseData, res)  // -> api 后台服务 用户Id
					//处理请求成功事件
					global.storage.save({
						key: 'userInfo',  //注意:请不要在key中使用_下划线符号!
						data: {userInfo: global.userInfo},
					})
					global.authorization(global.userInfo.access_token)
					//尝试获取社区用户信息,检查用户是否与社区关联过
					apiRequest.request(ApiMap.getNeteaseUserInfo, null, null, this.onGetNeteaseUserInfoCallBack.bind(this))
					apiRequest.request(CommunityApiMap.getUserLoginInfo, null, null, this.onGetUserLoginInfoCallBack.bind(this));
				} else {
					showErrorAlert(res)
				}
			})
		}else {
			showErrorAlert(responseData)
		}
	}


	onWechatTokenCallback (status, responseData) {
		if (status) {
			//判断是否绑定过微信
			this.onConfirmIfBindWechat(responseData)
		} else {
			//处理请求失败事件
			this.setState({isFetching: false,})

			showErrorAlert(responseData)
		}
	}

	onIfBindCallback (status, responseData) {
		if (status) {
			global.userInfo = responseData
			// 获取用户数据
			apiRequest.request(ApiMap.getUserInfo, null, null, (status, res) => {
				if (status) {
					global.userInfo = Object.assign({}, responseData, res)  // -> api 后台服务 用户Id
					//处理请求成功事件
					global.storage.save({
						key: 'userInfo',  //注意:请不要在key中使用_下划线符号!
						data: {userInfo: global.userInfo},
					})
					global.authorization(global.userInfo.access_token)
					apiRequest.request(ApiMap.getNeteaseUserInfo, null, null, this.onGetNeteaseUserInfoCallBack.bind(this));
					//尝试获取社区用户信息,检查用户是否与社区关联过
					apiRequest.request(CommunityApiMap.getUserLoginInfo, null, null, this.onGetUserLoginInfoCallBack.bind(this));
				}
			})
		}
	}

	onAddUserLoginInfoCallBack (status, responseData) {
		if (status) {
			apiRequest.request(CommunityApiMap.getUserLoginInfo, null, null, this.onGetUserLoginInfoCallBack.bind(this))
		} else {
			this.setState({isFetching: false, fetchingText: ''})
		}
	}

	onGetUserLoginInfoCallBack (status, responseData) {
		//关联过,直接登录
		if (status) {
			global.userInfo = Object.assign({}, global.userInfo, responseData)
			global.storage.save({
				key: 'userInfo',  //注意:请不要在key中使用_下划线符号!
				data: {userInfo: Object.assign({}, global.userInfo, responseData)},
			})
			this.setState({isFetching: false, fetchingText: ''})
			this.props.navigator.resetTo({id: 'MainPage', component: MainPage})
		} else {
			//没关联过,先关联
			let body = {'nick_name': global.userInfo.userName, 'user_role': 'Designer'}
			apiRequest.request(CommunityApiMap.addUserLoginInfo, null, body, this.onAddUserLoginInfoCallBack.bind(this))
		}
	}

   onGetNeteaseUserInfoCallBack (status, responseData) {
       if (status) {
	       if (Platform.OS === 'android') {
	           NativeModules.NimLoginModule.nimLogin(responseData.accountId, responseData.token, `bearer ${global.userInfo.access_token}`, BASE_URL)
           } else {
               //todo ios的网易云信登录
			   NativeModules.NetEaseLogin.loginWithAccountId(responseData.accountId, responseData.token, global.userInfo.access_token)
            }
        } else {
           //处理请求失败事件
           this.setState({isFetching: false,})
           showErrorAlert(responseData)
        }
 	}
	updateKeyboardSpace (frames) {
		const keyboardSpace = (deviceHeight - frames.endCoordinates.screenY) / 2.0
		LayoutAnimation.linear()
		this.setState({keyboardSpace: keyboardSpace})
	}

	resetKeyboardSpace () {
		this.setState({keyboardSpace: 0})
	}

	renderThirdPlatform () {
		if (this.state.isWXAppInstalled) {
			return (
				<TouchableOpacity style={{marginTop: 20 / 667 * deviceHeight}} onPress={this.onWechatLogin}>
					<Image resizeMode={'contain'} source={require('../../images/login/icon_wechat.png')}/>
				</TouchableOpacity>
			)
		}
	}

	checkPhoneNum () {
		if (this.state.phoneNum.length == 0) {
			Alert.alert('提示', '请输入账户名', [{text: '好'},])
			return false
		}
		if (this.state.phoneNum.length > 11) {
			Alert.alert('提示', '请输入有效的手机号码', [{text: '好'},])
			return false
		}
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/
		if (!myreg.test(this.state.phoneNum)) {
			Alert.alert('提示', '请输入有效的手机号码', [{text: '好'},])
			return false
		}
		return true
	}

	onSecureTextEye () {
		this.setState({
			secureTextEntry: !this.state.secureTextEntry,
			secureTextEye: !this.state.secureTextEye,
		})
	}

	onRegister () {
		const {navigator} = this.props
		navigator.push({
			id: 'RegisterPage',
			component: RegisterPage,
		})
	}

	onSelectArea () {
		const {navigator} = this.props
		navigator.push({
			id: 'AreaSelectPage',
			component: AreaSelectPage,
			onSelect: this.onSelect,
		})
	}

	onForgetPassword () {
		const {navigator} = this.props
		navigator.push({
			id: 'ChangePasswordPage',
			component: ChangePasswordPage,
		})
	}

	onSelect (ccode, area) {
		this.setState({
			ccode: '+' + ccode,
			area: area,
		})
	}

	onWechatLogin () {
		this.handleWechatLogin('snsapi_userinfo', common.getWechatAppSecret())
	}

	handleWechatLogin (scope, state) {
		WeChat.sendAuthRequest(scope, state)
			.then((result) => {
				if (result.state == common.getWechatAppSecret() && result.errCode == 0) {
					this.setState({
						isFetching: true,
						fetchingText: '登录中，请稍候...'
					})
					let params = {
						appid: common.getWechatAppID(),
						secret: common.getWechatAppSecret(),
						code: result.code,
						grant_type: 'authorization_code'
					}
					//获取微信的token
					apiRequest.request(ApiMap.getWechatToken, params, null, this.onWechatTokenCallback.bind(this))
				}
			})
			.catch((e) => {
				this.setState({
					isFetching: false,
					fetchingText: ''
				})
			})
	}

	onLogin () {
		this.setState({isFetching: true, fetchingText: '登录中，请稍候...'})
		let uniqueID = DeviceInfo.getUniqueID()
		let clientKey = '58eaf257a78df92264ed8eb8'
		let clientId = '58eaf248a78df92264ed8eb7'
		let hmacUrl = `client_id=${clientId}&grant_type=password&username=${this.state.phoneNum}&password=${this.state.password}&useSign=0&device_id=${uniqueID}`
		let hmac = CryptoJS.HmacSHA1(hmacUrl, clientKey)
		let clientSecret = CryptoJS.enc.Base64.stringify(hmac)
		clientSecret = clientSecret.indexOf('+') >= 0 ? clientSecret.replace(/\+/g, '-') : clientSecret
		clientSecret = clientSecret.indexOf('/') >= 0 ? clientSecret.replace(/\//g, '_') : clientSecret

		let body = {
			client_id: clientId,
			grant_type: 'password',
			username: this.state.phoneNum,
			password: this.state.password,
			useSign: 0,
			device_id: uniqueID,
			client_secret: clientSecret
		}
		apiRequest.request(ApiMap.login, null, body, this.onLoginCallback.bind(this))
	}

	onConfirmIfBindWechat (wechatData) {

		let wechatDataJO = common.getSafetyJsonObj(wechatData)
		let appId = common.getWechatAppID()
		let uniqueID = DeviceInfo.getUniqueID()
		let clientKey = '58eaf257a78df92264ed8eb8'
		let clientId = '58eaf248a78df92264ed8eb7'

		let hmacUrl = `client_id=${clientId}&grant_type=oauth&provider=wechat&appId=${appId}&openId=${wechatDataJO.openid}&access_token=${wechatDataJO.access_token}&useSign=0&device_id=${uniqueID}`
		let hmac = CryptoJS.HmacSHA1(hmacUrl, clientKey)
		let clientSecret = CryptoJS.enc.Base64.stringify(hmac)
		clientSecret = clientSecret.indexOf('+') >= 0 ? clientSecret.replace(/\+/g, '-') : clientSecret
		clientSecret = clientSecret.indexOf('/') >= 0 ? clientSecret.replace(/\//g, '_') : clientSecret

		let body = {
			clientId,
			clientSecret,
			useSign: 0,
			device_id: uniqueID,
			provider: 'wechat',
			appId: appId,
			openId: wechatDataJO.openid,
			access_token: wechatDataJO.access_token
		}
		this.openId = wechatDataJO.openid
		this.wechatToken = wechatDataJO.access_token

		apiRequest.request(ApiMap.wechatLogin, null, body, this.onIfBindCallback.bind(this))
	}

	render () {
		const {login, navigator} = this.props
		return (
			<Image style={[styles.mainContainer, {
				marginBottom: this.state.keyboardSpace,
				marginTop: this.state.keyboardSpace * (-1)
			}]}
			       source={require('../../images/login/login_bg.png')}>
				<View style={{height: deviceHeight, width: deviceWidth, marginTop: '20%', alignItems: 'center'}}>
					<Text style={{fontSize: 30, color: Colors.white, marginTop: 10 / 667 * deviceHeight}}>玩家生活</Text>

					<View style={{marginTop: 60 / 667 * deviceHeight}}>

						<View style={styles.inputContainer}>
							<View style={{
								width: 58 / 375 * deviceWidth, flexDirection: 'row', alignItems: 'center',
								borderBottomWidth: 1, borderBottomColor: Colors.white
							}}>
								<TouchableOpacity style={{
									height: 30 / 667 * deviceHeight,
									width: 70 / 375 * deviceWidth,
									flexDirection: 'row',
									alignItems: 'center',
									marginLeft: 3 / 375 * deviceWidth
								}}
								                  onPress={this.onSelectArea}>
									<View style={{
										height: 92 / 667 * deviceHeight,
										alignItems: 'center',
										justifyContent: 'center'
									}}>
										<Text style={{fontSize: 14, color: Colors.white}}>{this.state.ccode}</Text>
									</View>
									<Image style={{
										width: 7 / 375 * deviceWidth,
										height: 13 / 667 * deviceHeight,
										marginLeft: 5 / 375 * deviceWidth
									}}
									       source={require('../../images/login/icon_right.png')}/>
								</TouchableOpacity>
							</View>
							<View style={[styles.inputField, {
								width: 206 / 375 * deviceWidth,
								marginLeft: 20 / 375 * deviceWidth
							}]}>
								<Image
									source={require('../../images/login/icon_phone.png')}/>
								<TextInput style={{
									color: Colors.white,
									width: 185 / 375 * deviceWidth,
									marginLeft: 5 / 375 * deviceWidth
								}}
								           placeholder='用户名/邮箱/手机号' placeholderTextColor={Colors.lightWhite}
								           underlineColorAndroid="transparent"
								           onChangeText={(text) => this.setState({phoneNum: text})}
								           value={this.state.phoneNum}/>
							</View>
						</View>

						<View style={[styles.inputField, {width: 285 / 375 * deviceWidth,}]}>
							<Image
								source={require('../../images/login/icon_lock.png')}/>
							<TextInput style={{
								color: Colors.white,
								width: 200 / 375 * deviceWidth,
								marginLeft: 5 / 375 * deviceWidth
							}}
							           placeholder='请输入您的密码' onChangeText={(text) => this.setState({password: text})}
							           secureTextEntry={this.state.secureTextEntry}
							           placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"
							           value={this.state.password}/>
							<TouchableOpacity style={{
								width: 22 / 375 * deviceWidth, height: 30 / 667 * deviceHeight, position: 'absolute',
								right: 0, top: 13 / 667 * deviceHeight
							}} onPress={this.onSecureTextEye}>
								<Image resizeMode={'contain'} style={{paddingTop: 30 / 667 * deviceHeight}}
								       source={this.state.secureTextEye ? require('../../images/login/icon_eye_close.png') : require('../../images/login/icon_eye_open.png')}/>
							</TouchableOpacity>
						</View>
					</View>

					<View style={{
						width: 285 / 375 * deviceWidth,
						height: 25 / 667 * deviceHeight,
						marginTop: 15 / 667 * deviceHeight,
						justifyContent: 'space-between',
						alignItems: 'center',
						flexDirection: 'row'
					}}>
						<TouchableOpacity style={{height: 27 / 667 * deviceHeight}} onPress={this.onRegister}>
							<Text
								style={{fontSize: 11, color: 'white', justifyContent: 'center', alignItems: 'center',}}>立即注册!</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{height: 27 / 667 * deviceHeight}} onPress={this.onForgetPassword}>
							<Text
								style={{fontSize: 11, color: 'white', justifyContent: 'center', alignItems: 'center',}}>忘记密码?</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity style={styles.button} onPress={this.onLogin}>
						<Text style={{fontSize: 17, color: 'white', fontWeight: '300'}}>登 录</Text>
					</TouchableOpacity>
					<View style={{
						width: 285 / 375 * deviceWidth,
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginTop: 80 / 667 * deviceHeight
					}}>
						<View style={{
							height: 1 / 667 * deviceHeight,
							width: 95 / 375 * deviceWidth,
							backgroundColor: Colors.white
						}}/>
						<Text style={{fontSize: 12, color: 'white', justifyContent: 'center', alignItems: 'center',}}>合作平台登录</Text>
						<View style={{
							height: 1 / 667 * deviceHeight,
							width: 95 / 375 * deviceWidth,
							backgroundColor: Colors.white
						}}/>
					</View>

					{this.renderThirdPlatform()}
				</View>
				<Toast ref="toast"/>
				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
			</Image>
		)
	}
}

const styles = StyleSheet.create({
	mainContainer: {
		height: deviceHeight,
		width: deviceWidth,
		flexDirection: 'row'
	},
	inputContainer: {
		flexDirection: 'row',
		width: 285 / 375 * deviceWidth
	},
	inputField: {
		height: 49 / 667 * deviceHeight,
		borderBottomWidth: 1,
		borderBottomColor: Colors.white,
		flexDirection: 'row',
		alignItems: 'center',

	},
	button: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 41 / 667 * deviceHeight,
		width: 285 / 375 * deviceWidth,
		marginTop: 40 / 667 * deviceHeight,
		borderRadius: 3,
		backgroundColor: Colors.mainColor
	},
})
