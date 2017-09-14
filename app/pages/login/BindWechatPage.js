/**
 * BindWechatPae
 * @desc: 绑定微信
 * @updator: traveller
 * @updateDate: 2017-8-3
 * @updateContent: 删除多余的组件引入，45-47行 var 改为const
 */

import React, {Component} from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import {ApiMap} from '../../constants/Network';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import MainPage from '../mainPage';
var CryptoJS = require("crypto-js");
import DeviceInfo from 'react-native-device-info';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const BUTTON_STATUS_SEND_VERTIFICATION = '发送验证码';
const BUTTON_STATUS_RESEND_VERTIFICATION = '重新发送';

const VERTIFY_STATE_LOGIN = '登录验证码';
const VERTIFY_STATE_REGISTER = '注册验证码';

const ERROR_MESSAGE_INVALID_USERNAME_OR_PHONE_NUM = '用户名或者手机号码无效。';

const COUNT_DOWN_NUM = 60;

const apiRequest = new ApiRequest();

const uniqueID = DeviceInfo.getUniqueID();
const clientKey = '58eaf257a78df92264ed8eb8';
const client_id = '58eaf248a78df92264ed8eb7';

export default class BindWechatPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      vertifyNum: '',
      vertifyButtonText: BUTTON_STATUS_SEND_VERTIFICATION,
      countDownNum: COUNT_DOWN_NUM,
      isNeedSend: true,
      secureTextEntry: true,
      secureTextEye: false,
      isFetching: false,
      fetchingText: '',
      nickName: ''
    };
    this.onLeftBack = this.onLeftBack.bind(this);
    this.onVertify = this.onVertify.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onSecureTextEye = this.onSecureTextEye.bind(this);
    this.vertifyState = '';
  }

  componentDidMount() {
    if(this.state.isNeedSend){
      this.startCountdown();
      //发送验证码API
      apiRequest.request(ApiMap.loginVerify, null, {CCode: this.props.route.ccode, PhoneNumber: this.props.route.phoneNumber}, this.onLoginVerifyCallback.bind(this))
    }
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  onLoginVerifyCallback(status, responseData){
    if(status){
      //处理请求成功事件
      this.vertifyState = VERTIFY_STATE_LOGIN;
      this.setState({
        isFetching: false,
        fetchingText: ''
      })
    } else {
      //处理请求失败事件
      if(responseData.modelState && responseData.modelState.userNameOrPhoneNumber) {
        let index = responseData.modelState.userNameOrPhoneNumber.indexOf(ERROR_MESSAGE_INVALID_USERNAME_OR_PHONE_NUM);
        //如果登录验证发送失败，说明手机号未注册，这时，启动注册逻辑，并不在前端展示。
        if(index >= 0){
          //发送注册验证码
          apiRequest.request(ApiMap.registerVerify, {CCode: this.props.route.ccode, PhoneNumber: this.props.route.phoneNumber}, null, this.onRegisterVerifyCallback.bind(this))
        }
      }
    }
  }

  onRegisterVerifyCallback(status, responseData){
    this.setState({
      isFetching: false,
      fetchingText: ''
    })
    if(status){
      //处理请求成功事件
      this.vertifyState = VERTIFY_STATE_REGISTER;
    } else {
      //处理请求失败事件
    }
  }

  onRegisterCallback(status, responseData){
    if(status){
      //处理请求成功事件
      let hmacUrl = `client_id=${client_id}&grant_type=verifyCode&ccode=${this.props.route.ccode}&phoneNumber=${this.props.route.phoneNumber}&verifyCode=${this.state.vertifyNum}&device_id=${uniqueID}`;
      let hmac = CryptoJS.HmacSHA1(hmacUrl, clientKey);
      let clientSecret = CryptoJS.enc.Base64.stringify(hmac)
      clientSecret = clientSecret.indexOf("+") >= 0 ? clientSecret.replace(/\+/g, '-') : clientSecret ;
      clientSecret = clientSecret.indexOf("/") >= 0 ? clientSecret.replace(/\//g, '_') : clientSecret ;
      apiRequest.request(ApiMap.vertifyLogin, null, {client_id: client_id, grant_type: 'verifyCode', ccode: this.props.route.ccode, phoneNumber: this.props.route.phoneNumber,
        verifyCode: this.state.vertifyNum, device_id: uniqueID, client_secret: clientSecret}, this.onLoginCallback.bind(this))
    } else {
      //处理请求失败事件
      this.setState({
        isFetching: false,
        fetchingText: ''
      })
      showErrorAlert(responseData);
    }
  }

  onLoginCallback(status, responseData){
    if(status){
      //处理请求成功事件
      global.userInfo = responseData
      global.storage.save({
        key: 'userInfo',  //注意:请不要在key中使用_下划线符号!
          data: { userInfo: responseData },
      });

      apiRequest.request(ApiMap.bindWechat, null, {OAuthProvider: 'wechat', Openid: this.props.route.openId, AppId: common.getWechatAppID(),
        AccessToken: this.props.route.wechatToken}, this.onBindWechatCallback.bind(this))
    } else {
      //处理请求失败事件
      this.setState({
        isFetching: false,
        fetchingText: ''
      })
      showErrorAlert(responseData);
    }
  }

  onBindWechatCallback(status, responseData){
    this.setState({
      isFetching: false,
      fetchingText: ''
    })
    if(status){
      this.props.navigator.resetTo({
        id: "MainPage",
        component: MainPage
      });
      //处理请求成功事件
    } else {
      //处理请求失败事件
      showErrorAlert(responseData);
    }
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  renderVertifyButton() {
    return (this.state.isNeedSend ?
      <TouchableOpacity style={styles.vertifyButton} onPress={this.onVertify}>
        <Text style={{fontSize: 10, color: Colors.mainColor}}>{this.state.vertifyButtonText}</Text>
      </TouchableOpacity> :
      <View style={styles.vertifyButton} >
        <Text style={{fontSize: 10, color: Colors.mainColor}}>{this.state.countDownNum + 's'}</Text>
      </View>
    )
  }

  render() {
    const {login, navigator} = this.props;
    let reg = new RegExp("(\\d{3})(\\d{4})(\\d{4})");
    let phoneNumber = this.props.route.phoneNumber.replace(reg, "$1****$3");
    return (
      <Image style={[styles.mainContainer, {marginBottom: this.state.keyboardSpace, marginTop: this.state.keyboardSpace*(-1)}]}
        source={require('../../images/login/login_bg.png')}>

        <View style={{height: deviceHeight, width: deviceWidth, flexDirection: 'column', alignItems: 'center'}}>

        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 20, color: Colors.white, marginTop: 60 / 667 * deviceHeight}}>已向</Text>
          <Text style={{fontSize: 20, color: Colors.mainColor, marginTop: 60 / 667 * deviceHeight}}>{phoneNumber}</Text>
          <Text style={{fontSize: 20, color: Colors.white, marginTop: 60 / 667 * deviceHeight}}>发送验证码</Text>
        </View>


          <View style={{marginTop: 90 / 667 * deviceHeight}}>

            <View style={[styles.inputContainer, {height: 45 / 667 * deviceHeight, marginTop: 18 / 667 * deviceHeight, justifyContent: 'space-between', alignItems: 'center',
              borderBottomWidth: 1, borderBottomColor: Colors.white}]}>
              <Image style={{width: 20 / 375 * deviceWidth, height: 20 / 667 * deviceHeight}} source={require('../../images/login/icon_phone.png')}/>
              <TextInput style={{color: Colors.white, width: 190 / 375 * deviceWidth}} placeholder = '请输入您收到的验证码' maxLength = {6} value={this.state.vertifyNum}
                onChangeText={(text) => this.setState({vertifyNum: text})} placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"/>
              {this.renderVertifyButton()}
            </View>
            {this.vertifyState == VERTIFY_STATE_REGISTER &&
            <View>
              <View style={[styles.inputField, {width: 285 / 375 * deviceWidth, marginTop: 18 / 667 * deviceHeight}]}>
                <Image style={{width: 20 / 375 * deviceWidth, height: 20 / 667 * deviceHeight}}
                source={require('../../images/login/icon_user.png')}/>
                <TextInput style={{color: Colors.white, width: 759 / 375 * deviceWidth}} placeholder='请输入您的昵称' underlineColorAndroid="transparent"
                  onChangeText={(text) => this.setState({nickName: text})} placeholderTextColor={Colors.lightWhite} value={this.state.nickName}/>
              </View>

              <View style={[styles.inputField, {width: 285 / 375 * deviceWidth, marginTop: 18 / 667 * deviceHeight}]}>
                <Image style={{width: 20 / 375 * deviceWidth, height: 20 / 667 * deviceHeight}}
                source={require('../../images/login/icon_lock.png')}/>
                <TextInput style={{color: Colors.white, width: 759 / 375 * deviceWidth}}
                  placeholder='请输入您的密码' onChangeText={(text) => this.setState({password: text})} secureTextEntry={this.state.secureTextEntry}
                  placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent" value={this.state.password}/>
                <TouchableOpacity style={{width: 22 / 375 * deviceWidth, height: 30 / 667 * deviceHeight, position: 'absolute',
                  right: 0, top: 13 / 667 * deviceHeight}} onPress={this.onSecureTextEye}>
                  <Image resizeMode={'contain'} style={{width: 20 / 375 * deviceWidth, height: 13 / 667 * deviceHeight}}
                    source={this.state.secureTextEye ? require('../../images/login/icon_eye_close.png') : require('../../images/login/icon_eye_open.png')}/>
                </TouchableOpacity>
              </View>
            </View>}

          </View>

          <TouchableOpacity style={styles.button} onPress={this.onLogin}>
            <Text style={{fontSize: 17, color: 'white', fontWeight: '300'}}>登 录</Text>
          </TouchableOpacity>

        </View>
        <TouchableOpacity style={{position: 'absolute', top: 0, left: 0, padding: 25 / 667 * deviceHeight}} onPress={()=>this.onLeftBack()}>
          <Image source={require('../../images/common/icon_back_white.png')} />
        </TouchableOpacity>
        <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
      </Image>
    );
  }

  checkFields() {
    if(this.state.vertifyNum.length == 0){
      Alert.alert('提示', '验证码不能为空喔', [{text: '好'},]);
      return false;
    }
    if(this.state.vertifyNum.length != 6){
      Alert.alert('提示', '请输入6位验证码', [{text: '好'},]);
      return false;
    }
    if(this.vertifyState == VERTIFY_STATE_REGISTER && this.state.nickName.length == 0){
      Alert.alert('提示', '昵称不能为空', [{text: '好'},]);
      return false;
    }
    if(this.vertifyState == VERTIFY_STATE_REGISTER && this.state.password.length == 0){
      Alert.alert('提示', '密码不能为空', [{text: '好'},]);
      return false;
    }
    return true;
  }

  onLogin() {
    if (this.checkFields()) {
      this.setState({
        isFetching: true,
        fetchingText: '手机绑定中，请稍候...'
      })
      if(this.vertifyState == VERTIFY_STATE_LOGIN) {
        let hmacUrl = `client_id=${client_id}&grant_type=verifyCode&ccode=${this.props.route.ccode}&phoneNumber=${this.props.route.phoneNumber}&verifyCode=${this.state.vertifyNum}&device_id=${uniqueID}`;
        let hmac = CryptoJS.HmacSHA1(hmacUrl, clientKey);
        let clientSecret = CryptoJS.enc.Base64.stringify(hmac)
        clientSecret = clientSecret.indexOf("+") >= 0 ? clientSecret.replace(/\+/g, '-') : clientSecret ;
        clientSecret = clientSecret.indexOf("/") >= 0 ? clientSecret.replace(/\//g, '_') : clientSecret ;
        apiRequest.request(ApiMap.vertifyLogin, null, {client_id: client_id, grant_type: 'verifyCode', ccode: this.props.route.ccode, phoneNumber: this.props.route.phoneNumber,
          verifyCode: this.state.vertifyNum, device_id: uniqueID, client_secret: clientSecret}, this.onLoginCallback.bind(this))
      } else if(this.vertifyState == VERTIFY_STATE_REGISTER) {
        let hmacUrl = `client_id=${client_id}&userName=${this.state.phoneNum}&NickName=${this.state.nickName}&password=${this.state.password}&ConfirmPassword=${this.state.password}&CCode=${this.state.ccode}&PhoneNumber=${this.state.phoneNum}&Code=${this.state.vertifyNum}&useSign=0`;
        let hmac = CryptoJS.HmacSHA1(hmacUrl, clientKey);
        let clientSecret = CryptoJS.enc.Base64.stringify(hmac)
        clientSecret = clientSecret.indexOf("+") >= 0 ? clientSecret.replace(/\+/g, '-') : clientSecret ;
        clientSecret = clientSecret.indexOf("/") >= 0 ? clientSecret.replace(/\//g, '_') : clientSecret ;
        let body = {
            client_id: client_id, userName: this.props.route.phoneNumber, NickName: this.state.nickname, password: this.state.password, ConfirmPassword: this.state.password,
            CCode: this.props.route.ccode, PhoneNumber: this.props.route.phoneNumber, Code: this.state.vertifyNum, client_secret: clientSecret
        };
        apiRequest.request(ApiMap.register, null, body, this.onRegisterCallback.bind(this))
      } else {
        Alert.alert('提示', '请先发送手机验证码', [{text: '好'}]);
      }
    }
  }

  onVertify() {
    if(this.state.isNeedSend){
      this.startCountdown();
      this.hasSent = true;
      this.setState({
        isFetching: true,
        fetchingText: '验证码发送中，请稍候...'
      })
      //发送验证码API
      apiRequest.request(ApiMap.loginVerify, null, {CCode: this.props.route.ccode, PhoneNumber: this.props.route.phoneNumber}, this.onLoginVerifyCallback.bind(this))
    }
  }

  startCountdown() {
    let countDownNum = this.state.countDownNum - 1
    this.setState({
      countDownNum: countDownNum,
      isNeedSend: false
    })
    this.interval = setInterval(() => {
        countDownNum -= 1
        if (countDownNum === 0) {
          this.interval && clearInterval(this.interval);
          this.setState({
            countDownNum: COUNT_DOWN_NUM,
            vertifyButtonText: BUTTON_STATUS_RESEND_VERTIFICATION,
            isNeedSend: true
          })
        } else {
          this.setState({
            countDownNum: countDownNum,
            isNeedSend: false
          })
        }
    }, 1000)
  }

  onSecureTextEye() {
    this.setState({
      secureTextEntry: !this.state.secureTextEntry,
      secureTextEye: !this.state.secureTextEye,
    })
  }

  onLeftBack() {
    const {navigator} = this.props;
    navigator.pop();
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
    height: 45 / 667 * deviceHeight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center'
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 41 / 667 * deviceHeight,
    width: 285 / 375 * deviceWidth,
    marginTop: 82 / 667 * deviceHeight,
    borderRadius: 3,
    backgroundColor: Colors.mainColor
  },
  vertifyButton: {
    height: 24 / 667 * deviceHeight,
    width: 69 / 375 * deviceWidth,
    borderWidth: 1,
    borderColor: Colors.mainColor,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
