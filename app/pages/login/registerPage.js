import React, {Component} from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  AsyncStorage,
  Alert,
  TouchableHighlight,
  Picker,
  Platform
} from "react-native";

import LayoutAnimation from 'LayoutAnimation';
import {strings} from '../../utils/Translation';
import Keyboard from 'Keyboard';
import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import Toast, {DURATION} from 'react-native-easy-toast';
import NavigationBar from '../../components/NavigationBar' ;
import AreaSelectPage from './AreaSelectPage';
import ServicesPage from './ServicesPage';
var CryptoJS = require("crypto-js");
var WeChat = require('react-native-wechat');

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

var STORAGE_KEY_LOGIN = 'Login';

const BUTTON_STATUS_SEND_VERTIFICATION = '发送验证码';
const BUTTON_STATUS_RESEND_VERTIFICATION = '重新发送';

const ERROR_MESSAGE_INVALID_USERNAME_OR_PHONE_NUM = '用户名或者手机号码无效。';

const COUNT_DOWN_NUM = 60;

const apiRequest = new ApiRequest()

export default class registerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      ccode: '86', //区号
      area: '中国大陆',
      phoneNum: '',
      nickname: '',
      vertifyNum: '',
      vertifyButtonText: BUTTON_STATUS_SEND_VERTIFICATION,
      countDownNum: COUNT_DOWN_NUM,
      isNeedSend: true,
      hasSent: false,
      secureTextEntry: true,
      secureTextEye: false,
      isFetching: false,
      fetchingText: '',
    };
    this.hasSent = false;
    this.onRegister = this.onRegister.bind(this);
    this.onVertify = this.onVertify.bind(this);
    this.onSecureTextEye = this.onSecureTextEye.bind(this);
    this.onSelectArea = this.onSelectArea.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onLeftBack = this.onLeftBack.bind(this);
    this.enterServicesPage = this.enterServicesPage.bind(this);
  }

  componentDidMount() {
    Keyboard.addListener('keyboardWillShow', this.updateKeyboardSpace.bind(this));
    Keyboard.addListener('keyboardWillHide', this.resetKeyboardSpace.bind(this));
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
    Keyboard.removeAllListeners('keyboardWillShow','keyboardWillHide');
  }

  updateKeyboardSpace(frames) {
    const keyboardSpace = (deviceHeight-frames.endCoordinates.screenY) / 2.0;
    LayoutAnimation.linear();
    this.setState({keyboardSpace: keyboardSpace});
  }

  resetKeyboardSpace() {
    this.setState({keyboardSpace: 0});
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
    const { register, navigator} = this.props;
    return (
      <Image style={[styles.mainContainer, {marginBottom: this.state.keyboardSpace, marginTop: this.state.keyboardSpace*(-1)}]}
        source={require('../../images/login/login_bg.png')}>

        <View style={{height: deviceHeight, width: deviceWidth, flexDirection: 'column', alignItems: 'center'}}>
          <NavigationBar title={'注册'}
            backgroundColor = {Colors.transparent}
            titleColor = {Colors.white}
            leftButtonIcon = {require('../../images/common/icon_back_white.png')}
            onLeftButtonPress = {this.onLeftBack}/>
          <Text style={{fontSize: 30, color: Colors.white, marginTop: 58 / 667 * deviceHeight}}>玩家生活</Text>

          <View style={{marginTop: 65 / 667 * deviceHeight}}>

            <View style={styles.inputContainer}>
              <View style={{ width: 58 / 375 * deviceWidth, flexDirection: 'row', alignItems: 'center',
                borderBottomWidth: 1, borderBottomColor: Colors.white}}>
                <TouchableOpacity style={{height: 30 / 667 * deviceHeight, width: 70 / 375 * deviceWidth, flexDirection: 'row', alignItems: 'center',
                  marginLeft: 3 / 375 * deviceWidth}}
                  onPress={this.onSelectArea}>
                  <View style={{height: 92 / 667 * deviceHeight, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontSize: 14, color: Colors.white}}>{'+' + this.state.ccode}</Text>
                  </View>
                  <Image style={{width: 7 / 375 * deviceWidth, height: 13 / 667 * deviceHeight, marginLeft: 5 / 375 * deviceWidth}}
                    source={require('../../images/login/icon_right.png')}/>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputField, {width: 206 / 375 * deviceWidth, marginLeft: 20 / 375 * deviceWidth}]}>
                <Image
                  source={require('../../images/login/icon_phone.png')}/>
                <TextInput style={{color: Colors.white, width: 185 / 375 * deviceWidth, marginLeft: 5 / 375 * deviceWidth}}
                  placeholder='请输入手机号码'  placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"
                  onChangeText={(text) => this.setState({phoneNum: text})} value={this.state.phoneNum}/>
              </View>
            </View>

            <View style={[styles.inputContainer, {justifyContent: 'space-between', alignItems: 'center',marginTop:10 / 667 * deviceHeight,
              borderBottomWidth: 1, borderBottomColor: Colors.white,}]}>
              <Image source={require('../../images/login/icon_phone.png')}/>
              <TextInput style={{color: Colors.white, height:49/667 * deviceHeight,width: 190 / 375 * deviceWidth}} placeholder = '请输入您收到的验证码' maxLength = {6} value={this.state.vertifyNum}
                onChangeText={(text) => this.setState({vertifyNum: text})} placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"/>
              {this.renderVertifyButton()}
            </View>

            <View style={[styles.inputField, {width: 285 / 375 * deviceWidth, marginTop:10 / 667 * deviceHeight}]}>
              <Image
                source={require('../../images/login/icon_user.png')}/>
              <TextInput style={{color: Colors.white, width: 135 / 375 * deviceWidth, marginLeft: 5 / 375 * deviceWidth}}
                placeholder='请输入您的昵称' maxLength = {30} placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"
                onChangeText={(text) => this.setState({nickname: text})} value={this.state.nickname}/>
            </View>

            <View style={[styles.inputField, {width: 285 / 375 * deviceWidth,marginTop:10 / 667 * deviceHeight}]}>
              <Image
              source={require('../../images/login/icon_lock.png')}/>
              <TextInput style={{color: Colors.white, width: 280 / 375 * deviceWidth}}
                placeholder='8-16位大小写字母加数字' onChangeText={(text) => this.setState({password: text})} secureTextEntry={this.state.secureTextEntry}
                placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent" value={this.state.password}/>
              <TouchableOpacity style={{width: 22 / 375 * deviceWidth, height: 30 / 667 * deviceHeight, position: 'absolute',
                right: 0, top: 13 / 667 * deviceHeight}} onPress={this.onSecureTextEye}>
                <Image resizeMode={'contain'} style={{paddingTop:30 / 667 * deviceHeight}}
                  source={this.state.secureTextEye ? require('../../images/login/icon_eye_close.png') : require('../../images/login/icon_eye_open.png')}/>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={this.onRegister}>
            <Text style={{fontSize: 17, color: 'white', fontWeight: '300'}}>注 册</Text>
          </TouchableOpacity>
          <Text style={{marginTop:20 / 667 * deviceHeight,color:Colors.lightWhite}}>注册视为同意<Text onPress={this.enterServicesPage} style={{color:Colors.mainColor}}>玩家生活</Text>服务条款</Text>
        </View>
        {/*<TouchableOpacity style={{position: 'absolute', top: 0, left: 0, padding: 25 / 667 * deviceHeight}} onPress={()=>this.onLeftBack()}>
          <Image source={require('../../images/common/icon_back_white.png')} />
        </TouchableOpacity>*/}
        <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
        <Toast ref="toast"/>
      </Image>
    );
  }

  checkPhoneNum() {
    if(this.state.phoneNum.length == 0) {
      Alert.alert('提示', '请输入手机号码', [{text: '好'},]);
      return false;
    }
    if(this.state.phoneNum.length > 11) {
      Alert.alert('提示', '请输入有效的手机号码', [{text: '好'},]);
      return false;
    }
    // var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    // if(!myreg.test(this.state.phoneNum)) {
    //   Alert.alert('提示', '请输入有效的手机号码', [{text: '好'},]);
    //   return false;
    // }
    return true;
  }

  onSecureTextEye() {
    this.setState({
      secureTextEntry: !this.state.secureTextEntry,
      secureTextEye: !this.state.secureTextEye,
    })
  }

  onSelectArea() {
    const {navigator} = this.props;
    navigator.push({
      id: "AreaSelectPage",
      component: AreaSelectPage,
      onSelect: this.onSelect,
    });
  }

  enterServicesPage() {
    this.props.navigator.push({id:'ServicesPage',component:ServicesPage});
  }

  onSelect(ccode, area) {
    this.setState({
      ccode: ccode,
      area: area,
    })
  }

  onRegisterCallback( status, responseData){
    this.setState({
      isFetching: false,
      fetchingText: ''
    })
    if(status){
      //处理请求成功事件
      this.refs.toast.show('注册成功');
      const {navigator} = this.props;
      navigator.pop();
    } else {
      //处理请求失败事件
      showErrorAlert(responseData);
    }
  }

  onRegister() {
    const {registerVerify} = this.props;
      if(this.hasSent) {
        this.setState({ isFetching: true, fetchingText: '注册中，请稍候...' });
        let clientKey = '58eaf257a78df92264ed8eb8';
        let client_id = '58eaf248a78df92264ed8eb7';

        let hmacUrl = `client_id=${client_id}&userName=${this.state.phoneNum}&NickName=${this.state.nickname}&password=${this.state.password}&ConfirmPassword=${this.state.password}&CCode=${this.state.ccode}&PhoneNumber=${this.state.phoneNum}&Code=${this.state.vertifyNum}&useSign=0`;
        let hmac = CryptoJS.HmacSHA1(hmacUrl, clientKey);
        let clientSecret = CryptoJS.enc.Base64.stringify(hmac)
        clientSecret = clientSecret.indexOf("+") >= 0 ? clientSecret.replace(/\+/g, '-') : clientSecret ;
        clientSecret = clientSecret.indexOf("/") >= 0 ? clientSecret.replace(/\//g, '_') : clientSecret ;

        let body = {
            client_id, userName: this.state.phoneNum, NickName: this.state.nickname, password: this.state.password, ConfirmPassword: this.state.password,
            CCode: this.state.ccode, PhoneNumber: this.state.phoneNum, Code: this.state.vertifyNum, client_secret: clientSecret
        };
        apiRequest.request(ApiMap.register, null, body, this.onRegisterCallback.bind(this));
      } else {
        Alert.alert('提示', '请先发送手机验证码', [{text: '好'}]);
      }
  }

  onVertifyCallback(status, responseData){
    this.setState({
      isFetching: false,
      fetchingText: ''
    })
    if(status){
      this.refs.toast.show('发送成功');
      //处理请求成功事件
    } else {
      //处理请求失败事件
      showErrorAlert(responseData);
    }
  }

  onVertify() {
    if(this.checkPhoneNum() && this.state.isNeedSend){
      this.startCountdown();
      this.hasSent = true;
      this.setState({
        isFetching: true,
        fetchingText: '验证码发送中，请稍候...'
      })
      //发送验证码API
      apiRequest.request(ApiMap.registerVerify, {CCode: this.state.ccode, PhoneNumber: this.state.phoneNum}, null, this.onVertifyCallback.bind(this));
    }
  }

  onLeftBack() {
    const {navigator} = this.props;
    navigator.pop();
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
    alignItems: 'center'
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
  vertifyButton: {
    height: 32 / 667 * deviceHeight,
    width: 69 / 375 * deviceWidth,
    borderWidth: 1,
    borderColor: Colors.mainColor,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
