import './setting'
import React from 'react-native';
const {
  BackAndroid,
  Dimensions,
  Platform,
  Alert,
  InteractionManager
} = React;

import Storage from 'react-native-storage'
import { AsyncStorage } from 'react-native';
import Http from './Http';

console.disableYellowBox = true // 关闭警告

var storage = new Storage({
  // Use AsyncStorage for RN, or window.localStorage for web.
    // If not set, data would be lost after reload.
    storageBackend: AsyncStorage,
// 最大容量，默认值1000条数据循环存储
  size: 1000,
  // 数据过期时间，默认一整天（1000 * 3600 * 24秒）
  defaultExpires: 1000 * 3600 * 24 * 333,
  // 读写时在内存中缓存数据。默认启用。
  enableCache: true
})

global.storage = storage;

export function NaviGoBack(navigator, changeAccountCallback) {
  let route;
  if(navigator && navigator.getCurrentRoutes()) {
    let routes = navigator.getCurrentRoutes();
    route = routes[routes.length - 1];
  }

  if(route.id == 'EvaluatePage' || route.id == 'TestResultPage' || route.id == 'RecommendDnaPage') {
    Alert.alert('提示', '确定要退出性格测试吗?', [{text: '取消'},
      {text: '退出', onPress: ()=>{
        navigator.popToTop();
      }}]
    );
    return true;
  }

	if (navigator && navigator.getCurrentRoutes().length > 1) {
		navigator.pop();
		return true;
  }

	if (navigator && navigator.getCurrentRoutes().length <= 1) {
    if(changeAccountCallback) {
      let actionArr = [
                        {text:'取消', onPress: ()=>{}},
                        {text:'切换账号', onPress: ()=>changeAccountCallback()}
                      ];
      (Platform.OS === 'android') && actionArr.push({text: '退出', onPress: ()=> BackAndroid.exitApp()})
  		Alert.alert('提示', '', actionArr);
    } else {
        Alert.alert('提示', '确定要退出吗?', [{text:'取消', onPress: ()=>{}},
        {text:'退出',onPress: ()=>{
          BackAndroid.exitApp();
        }}]);
  		return true;
    }
	}
  return false;
}

//适配宽高
export const adaptWidth = s => s / 750 * Dimensions.get('window').width;
export const adaptHeight = s => s / 1334 * Dimensions.get('window').height;

export function getWidth() {
  return Dimensions.get('window').width;
}

export function getHeight() {
  /* If footerBar is false, the full screen size is sent */
  let height = Dimensions.get('window').height;
  //return height;
  return Platform.OS === 'ios' ? height : height - 20;
}

export function getNormalHeight() {
  return Dimensions.get('window').height;
}

export function getFooterBarHeight() {
  return 40;
}

export function showErrorAlert(arg0) {
  let modelState = arg0.responseData.modelState;
  let keys = Object.keys(modelState);
  let errorKey = keys[0];
  let errorContent = modelState[errorKey];
  let errorMessage = errorContent[0];
  Alert.alert('注册失败', errorMessage, [{text: '好'},]);
}

export function getWechatAppID() {
  return 'wxf8fe7deeae3bd124';
}

export function getWechatAppSecret() {
  return '8a2fa4aa5dab354408dad58dcbf2b0ee';
}

export function formatDate(ns){
	return new Date(parseInt(ns) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
}

export function formatActivityData(s) {
  let date = new Date(parseInt(s) * 1000);
  let month = date.getMonth()+1;
  if (month < 10) month = '0' + month;
  let days = date.getDate();
	if (days < 10) days = '0' + days;
  let hours = date.getHours();
	if (hours < 10) hours = '0' + hours;
  let minutes = date.getMinutes();
	if (minutes < 10) minutes = '0' + minutes;
  let second = date.getSeconds();
	if (second < 10) second = '0' + second;
  return `${month}-${days}  ${hours}:${minutes}:${second}`;
}

export function formatDateString(ns){
	return new Date(parseInt(ns) * 1000).toLocaleDateString();
}

export function formatTimeString(ns){
	return new Date(parseInt(ns) * 1000).toLocaleTimeString();
}

export function getTimeInterval(_timeSecond){
  let timeSecond = parseInt(_timeSecond);
  let timeMinute = parseInt(timeSecond / 60);
  let timeHour = parseInt(timeMinute / 60);
  let timeDay = parseInt(timeHour / 24);
  let timeMonth = parseInt(timeDay / 30);

  if(timeSecond <= 10) {
    return '刚刚';
  } else if(timeSecond > 10 && timeSecond < 60) {
    return `${timeSecond}秒以前`;
  } else if (timeMinute < 60) {
    return `${timeMinute}分钟以前`;
  } else if (timeHour < 24) {
    return `${timeHour}小时以前`;
  } else if (timeDay < 31) {
    return `${timeDay}天以前`;
  } else if (timeMonth < 12) {
    return `${timeMonth}月以前`;
  } else {
    return '一年前'
  }
}

export function getSafetyJsonObj(jsonObj){
  let _jsonObj;
  try {
    _jsonObj = JSON.parse(jsonObj);
  } catch (e) {
    _jsonObj = jsonObj;
  }

  return _jsonObj;
}

export const http = new Http();

//默认头像
export const avatar = 'http://upload.s.vidahouse.com/FiZ4Lb1iM50BXaoOzyMvp-eIYYcj';

export let showActivityDescript = true;
