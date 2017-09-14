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
  Picker,
  Platform
} from "react-native";

import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import {ApiMap} from '../../constants/Network';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import NavigationBar from '../../components/NavigationBar';
import AreaSelectPage from './AreaSelectPage';
import BindWechatPage from './BindWechatPage';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

export default class BindPhoneNumberPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ccode: '86', //区号
      area: '中国大陆',
      phoneNum: '',
    };
    this.onLeftBack = this.onLeftBack.bind(this);
    this.onSelectArea = this.onSelectArea.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <Image style={[styles.mainContainer, {marginBottom: this.state.keyboardSpace, marginTop: this.state.keyboardSpace*(-1)}]}
        source={require('../../images/login/login_bg.png')}>
        <View style={{height: deviceHeight, width: deviceWidth, flexDirection: 'column', alignItems: 'center'}}>
          <Text style={{fontSize: 20, color: Colors.white, marginTop: 83 / 667 * deviceHeight}}>授权成功！ 请验证手机</Text>

          <View style={styles.inputContainer}>
            <View style={{height: 40 / 667 * deviceHeight, width: 108 / 375 * deviceWidth, flexDirection: 'row', alignItems: 'center',
              borderBottomWidth: 1, borderBottomColor: Colors.white}}>
              <View style={{height: 92 / 667 * deviceHeight, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 14, color: Colors.white}}>+{this.state.ccode}</Text>
              </View>
              <View style={{height: 13 / 667 * deviceHeight, width: 1 / 375 * deviceWidth, marginLeft: 3 / 375 * deviceWidth, backgroundColor: Colors.white}}></View>
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
                placeholder='请输入您的手机号' maxLength = {30} placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"
                onChangeText={(text) => this.setState({phoneNum: text})} value={this.state.phoneNum}/>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={()=>this.onNext()}>
            <Text style={{fontSize: 17, color: 'white', fontWeight: '300'}}>下一步</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{position: 'absolute', top: 0, left: 0, padding: 25 / 667 * deviceHeight}} onPress={()=>this.onLeftBack()}>
          <Image source={require('../../images/common/icon_back_white.png')} />
        </TouchableOpacity>
        <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
      </Image>
    );
  }

  onNext() {
    if(this.checkPhoneNum()){
      const {navigator} = this.props;
      navigator.push({
        id: "BindWechatPage",
        component: BindWechatPage,
        phoneNumber: this.state.phoneNum,
        ccode: this.state.ccode,
        openId: this.props.route.openId,
        wechatToken: this.props.route.wechatToken,
      });
    }
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

  onLeftBack() {
    const {navigator} = this.props;
    navigator.pop();
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
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if(!myreg.test(this.state.phoneNum)) {
      Alert.alert('提示', '请输入有效的手机号码', [{text: '好'},]);
      return false;
    }
    return true;
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
    width: 285 / 375 * deviceWidth,
    marginTop: 100/ 667 * deviceHeight,
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
    marginTop: 40 / 667 * deviceHeight,
    borderRadius: 3,
    backgroundColor: Colors.mainColor
  },
});
