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
import AreaSelectPage from './AreaSelectPage';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import Toast, {DURATION} from 'react-native-easy-toast'

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const BUTTON_STATUS_SEND_VERTIFICATION = '发送验证码';
const BUTTON_STATUS_RESEND_VERTIFICATION = '重新发送';

const ERROR_MESSAGE_INVALID_USERNAME_OR_PHONE_NUM = '用户名或者手机号码无效。';

const COUNT_DOWN_NUM = 60;

const SUB_VIEW_TYPE_VERTIFY = 'vertifyView';
const SUB_VIEW_TYPE_PASSWORD = 'passwordView';

export default class ChangePasswordPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ccode: '86', //区号
      area: '中国大陆',
      phoneNum: '',
      password: '',
      confirmPassword: '',
      secureTextEntry1: true,
      secureTextEye1: false,
      secureTextEntry2: true,
      secureTextEye2: false,
      vertifyNum: '',
      vertifyButtonText: BUTTON_STATUS_SEND_VERTIFICATION,
      countDownNum: COUNT_DOWN_NUM,
      isNeedSend: 'true',
      subViewType: SUB_VIEW_TYPE_VERTIFY,
      isFetching: false,
      fetchingText: '',
    };
    this.nonce = '';
    this.onConfirm = this.onConfirm.bind(this);
    this.onVertify = this.onVertify.bind(this);
    this.onSelectArea = this.onSelectArea.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onLeftBack = this.onLeftBack.bind(this);
    this.onSecureTextEye1 = this.onSecureTextEye1.bind(this);
    this.onSecureTextEye2 = this.onSecureTextEye2.bind(this);
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

  renderSubView() {
    if(this.state.subViewType == SUB_VIEW_TYPE_VERTIFY){
      return this.renderVertifyView()
    } else if(this.state.subViewType == SUB_VIEW_TYPE_PASSWORD){
      return this.renderPasswordView()
    }
  }

  renderPasswordView() {
    return(
      <View style={{marginTop: 105 / 667 * deviceHeight}}>

        <View style={[styles.inputField, {width: 285 / 375 * deviceWidth, marginTop: 18 / 667 * deviceHeight}]}>
          <Image style={{width: 20 / 375 * deviceWidth, height: 20 / 667 * deviceHeight}}
          source={require('../../images/login/icon_lock.png')}/>
          <TextInput style={{color: Colors.white, width: 759 / 375 * deviceWidth}}
            placeholder='请输入您的密码' onChangeText={(text) => this.setState({password: text})} secureTextEntry={this.state.secureTextEntry1}
            placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent" value={this.state.password}/>
          <TouchableOpacity style={{width: 22 / 375 * deviceWidth, height: 30 / 667 * deviceHeight, position: 'absolute',
            right: 0, top: 13 / 667 * deviceHeight}} onPress={this.onSecureTextEye1}>
            <Image resizeMode={'contain'} style={{width: 20 / 375 * deviceWidth, height: 13 / 667 * deviceHeight}}
              source={this.state.secureTextEye1 ? require('../../images/login/icon_eye_close.png') : require('../../images/login/icon_eye_open.png')}/>
          </TouchableOpacity>
        </View>

        <View style={[styles.inputField, {width: 285 / 375 * deviceWidth, marginTop: 18 / 667 * deviceHeight}]}>
          <Image style={{width: 20 / 375 * deviceWidth, height: 20 / 667 * deviceHeight}}
            source={require('../../images/login/icon_lock.png')}/>
          <TextInput style={{color: Colors.white, width: 759 / 375 * deviceWidth}}
            placeholder='请再次输入您的密码' onChangeText={(text) => this.setState({confirmPassword: text})} secureTextEntry={this.state.secureTextEntry2}
            placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent" value={this.state.confirmPassword}/>
          <TouchableOpacity style={{width: 22 / 375 * deviceWidth, height: 30 / 667 * deviceHeight, position: 'absolute',
            right: 0, top: 13 / 667 * deviceHeight}} onPress={this.onSecureTextEye2}>
            <Image resizeMode={'contain'} style={{width: 20 / 375 * deviceWidth, height: 13 / 667 * deviceHeight}}
              source={this.state.secureTextEye2 ? require('../../images/login/icon_eye_close.png') : require('../../images/login/icon_eye_open.png')}/>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderVertifyView() {
    return(
      <View style={{marginTop: 105 / 667 * deviceHeight}}>

        <View style={[styles.inputContainer]}>
          <View style={{height: 40 / 667 * deviceHeight, width: 108 / 375 * deviceWidth, flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: Colors.white}}>
            <View style={{height: 92 / 667 * deviceHeight, width: 30 / 375 * deviceWidth, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{fontSize: 14, color: Colors.white}}>{'+' + this.state.ccode}</Text>
            </View>
            <TouchableOpacity style={{height: 30 / 667 * deviceHeight, width: 70 / 375 * deviceWidth, flexDirection: 'row', alignItems: 'center',
              marginLeft: 3 / 375 * deviceWidth}}
              onPress={this.onSelectArea}>
              <Text style={{fontSize: 14, color: Colors.white}}>{this.state.area}</Text>
              <Image style={{width: 7 / 375 * deviceWidth, height: 13 / 667 * deviceHeight, marginLeft: 3 / 375 * deviceWidth}}
                source={require('../../images/login/icon_right.png')}/>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputField, {width: 156 / 375 * deviceWidth, marginLeft: 20 / 375 * deviceWidth}]}>
            <Image style={{width: 20 / 375 * deviceWidth, height: 20 / 667 * deviceHeight}}
              source={require('../../images/login/icon_phone.png')}/>
            <TextInput style={{color: Colors.white, width: 135 / 375 * deviceWidth, marginLeft: 5 / 375 * deviceWidth}}
              placeholder='请输入手机号码' maxLength = {30} placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"
              onChangeText={(text) => this.setState({phoneNum: text})} value={this.state.phoneNum}/>
          </View>
        </View>

        <View style={[styles.inputContainer, {height: 40 / 667 * deviceHeight, marginTop: 18 / 667 * deviceHeight, justifyContent: 'space-between', alignItems: 'center',
          borderBottomWidth: 1, borderBottomColor: Colors.white,}]}>
          <Image style={{width: 20 / 375 * deviceWidth, height: 20 / 667 * deviceHeight}} source={require('../../images/login/icon_phone.png')}/>
          <TextInput style={{color: Colors.white, width: 190 / 375 * deviceWidth}} placeholder = '请输入您收到的验证码' maxLength = {6} value={this.state.vertifyNum}
            onChangeText={(text) => this.setState({vertifyNum: text})} placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"/>
          {this.renderVertifyButton()}
        </View>
        <Toast ref="toast"/>
      </View>
    )
  }

  render() {
    const {navigator} = this.props;
    return (
      <Image style={[styles.mainContainer, {marginBottom: this.state.keyboardSpace, marginTop: this.state.keyboardSpace*(-1)}]}
        source={require('../../images/login/login_bg.png')}>

        <View style={{height: deviceHeight, width: deviceWidth, flexDirection: 'column', alignItems: 'center'}}>

          <Text style={{fontSize: 30, color: Colors.white, marginTop: 60 / 667 * deviceHeight}}>玩家生活</Text>
          {this.renderSubView()}
          <TouchableOpacity style={styles.button} onPress={this.onConfirm}>
            <Text style={{fontSize: 17, color: 'white', fontWeight: '300'}}>确 认</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{position: 'absolute', top: 20, left: 20, padding:5}} onPress={()=>this.onLeftBack()}>
          <Image source={require('../../images/common/icon_back_white.png')} />
        </TouchableOpacity>
        <Toast ref="toast"/>
        <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
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
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if(!myreg.test(this.state.phoneNum)) {
      Alert.alert('提示', '请输入有效的手机号码', [{text: '好'},]);
      return false;
    }
    return true;
  }

  onSecureTextEye1() {
    this.setState({
      secureTextEntry1: !this.state.secureTextEntry1,
      secureTextEye1: !this.state.secureTextEye1,
    })
  }
  onSecureTextEye2() {
    this.setState({
      secureTextEntry2: !this.state.secureTextEntry2,
      secureTextEye2: !this.state.secureTextEye2,
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

  onSelect(ccode, area) {
    this.setState({
      ccode: ccode,
      area: area,
    })
  }

  onConfirmCallback(status, responseData){
    this.setState({
      isFetching: false,
      fetchingText: ''
    })
    if(status){
      //处理请求成功事件
      this.nonce = responseData.nonce;
      this.setState({
        subViewType: SUB_VIEW_TYPE_PASSWORD,
      })
    } else {
      //处理请求失败事件
      showErrorAlert(responseData);
    }
  }

  onChangeCallback(status, responseData){
    this.setState({
      isFetching: false,
      fetchingText: ''
    })
    if(status){
      //处理请求成功事件
      this.refs.toast.show('密码修改成功');
      this.props.navigator.pop();
    } else {
      //处理请求失败事件
      showErrorAlert(responseData);
    }
  }

  onConfirm() {
    if(this.hasSent) {
      let apiRequest = new ApiRequest()
      if(this.state.subViewType == SUB_VIEW_TYPE_VERTIFY){
        this.setState({
          isFetching: true,
          fetchingText: '验证码校验中，请稍候...'
        })
        apiRequest.request(ApiMap.getChangePasswordNonce, {CCode: this.state.ccode, PhoneNumber: this.state.phoneNum, 'Code': this.state.vertifyNum},
          null, this.onConfirmCallback.bind(this));
      } else if(this.state.subViewType == SUB_VIEW_TYPE_PASSWORD){
        this.setState({
          isFetching: true,
          fetchingText: '密码修改中，请稍候...'
        })
        apiRequest.request(ApiMap.changePassword, {Nonce: encodeURIComponent(this.nonce)}, {NewPassword: this.state.password, ConfirmPassword: this.state.confirmPassword},
        this.onChangeCallback.bind(this))
      }
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
      //发送验证码API
      this.setState({
        isFetching: true,
        fetchingText: '验证码发送中，请稍候...'
      })
      let apiRequest = new ApiRequest()
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
        countDownNum = countDownNum -= 1
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
    height: 40 / 667 * deviceHeight,
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
    marginTop: 102 / 667 * deviceHeight,
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
