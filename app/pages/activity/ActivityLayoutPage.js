/*
created by melody
选择活动布局页面
*/
import React, { Component } from 'react';
import {
  Image,
  Text,
  View,
  ListView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  NativeModules
} from 'react-native';

import Spinner from '../../libs/react-native-loading-spinner-overlay'
import Toast from 'react-native-easy-toast';
import * as common from '../../utils/CommonUtils'
import SchemeHandler from '../../utils/SchemeHandler'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import { ApiMap, CommunityApiMap } from '../../constants/Network'
import Colors from '../../constants/Colors'
import NavigationBar from '../../components/NavigationBar'
import * as Images from '../../images/activity/main'
import * as Icon from '../../images/'
import styles from '../../styles/activityLayout'
import ActivityPanoramaPage from './ActivityPanoramaPage'

var UMNative = NativeModules.UMNative;

export default class ActivityLayoutPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [], //活动方案
      uploadData: [], //用户上传方案数据
      isFetching: false,
      fetchingText: '',
    }
    this.activityId = this.props.route.activityId
  }

  componentWillMount () {
    this.getActivityOfScheme()
    this.getActivityOfUserScheme()
    UMNative.onPageBegin('ActivityLayoutPage')
  }

  componentWillUnmount () {
    UMNative.onPageEnd('ActivityLayoutPage')
  }

  //获取该活动里的布局
  getActivityOfScheme() {
    let apiRequest = new ApiRequest()
    apiRequest.request(CommunityApiMap.getActivity, {communitySchemesOfActivityId: this.activityId}, null, (status, response) => {
      if(status) {
        this.setState({
          data: response.data
        })
      } else {
        console.log('ERROR!', response.data)
      }
    })
  }

  //获取用户是否已参加过该方案的比赛
  getActivityOfUserScheme() {
    let apiRequest = new ApiRequest()
    apiRequest.request(CommunityApiMap.getActivity, {communityUploadInfoOfActivityId: this.activityId}, null, (status, response) => {
      if(status) {
        this.setState({
          uploadData: response.data
        })
      }
    })
  }

  //获取方案详情
  getSchemeDetails(schemeId, callback) {
    let apiRequest = new ApiRequest()
    this.setState({ isFetching: true, fetchingText: '方案加载中，请稍候...' })
    apiRequest.request(ApiMap.getScheme, {version: schemeId}, null, (status, response)=>{
     this.setState({ isFetching: false });
      if (status) {
       SchemeHandler.scheme = response.data;   // 获取活动物品数据数组
       callback && callback()
      }
    })
  }

  layoutOnclick(layoutData){
    let leftTimes = layoutData.submit_count;
    if(this.state.uploadData.length !== 0) {
      this.state.uploadData.map((item) => {
        if (item.scheme_id  == layoutData.origin_id) {
          leftTimes = layoutData.submit_count - item.count;
        }
      })
    }

    if (leftTimes == 0) {
      this.toast.show('已参加活动 不可重复参加');
    } else {
      this.enterActivityPanoramaPage(layoutData)
    }
  }

  //跳转到开始活动页面前需要先获取到全景图
  enterActivityPanoramaPage(layout) {
    this.getSchemeDetails(layout.origin_id, () => {
      this.props.navigator.push({
        id: 'ActivityPanoramaPage',
        component: ActivityPanoramaPage,
        activityId: this.activityId,
        originSchemeId: layout.origin_id
      })
    })
  }

  //渲染用户是否参赛
  renderJoinText(layoutData) {
    let leftTimes = layoutData.submit_count
    if(this.state.uploadData.length !== 0) {
      this.state.uploadData.map((item) => {
        if (item.scheme_id  === layoutData.origin_id) {
          leftTimes = layoutData.submit_count - item.count
        }
      })
    } 
    let text = '剩余发布次数：'+ leftTimes+'次'
    return <Text style = {{color: 'gray', marginLeft: 15}}>{text}</Text>
  }

  //渲染方案视图
  renderLayoutData() {
    const lists = this.state.data.map((item, index) =>
      <TouchableOpacity
        key = {index}
        style = {styles.layoutContentContainer}
        onPress = {() => this.layoutOnclick(item) }>
        <Image source = {{uri: item.thumbnail}} style = {styles.layoutImage}/>
        <View style = {styles.layoutStageContainer}>
          <Text>{item.title}</Text>
        </View>
        {this.renderJoinText(item)}
      </TouchableOpacity>
    )
    return(
      <View style = {styles.layoutConainer}>
        {lists}
      </View>
    )
  }

  render() {
    return(
      <View style={{flex: 1}}>
        <NavigationBar
          title = {''}
          navigator = {this.props.navigator}
          backgroundColor = {Colors.white}
          leftButtonIcon = {Icon.backBlack}
          logoIcon = {Icon.logoBlack}
          verticalLineColor = {Colors.black}
          onLeftButtonPress = {()=> this.props.navigator.pop()}
          rightButtonIcon1 = {Icon.customerBlack}
        />
        <ScrollView style = {styles.allContainer} showsVerticalScrollIndicator={false}>
          <View style = {styles.chooseTextContainer}>
            <View style = {styles.horizontalLine} />
            <Text style = {styles.chooseText}>选择一个布局开始游戏吧</Text>
            <View style = {styles.horizontalLine} />
          </View>
          
          <Text style = {styles.tipsText}>每一个布局只能发布一次哦{'\n'}参赛结果以最好的名次为准</Text>
          
          {this.renderLayoutData()}

        </ScrollView>
        <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
        <Toast ref = {(toast) => this.toast = toast}/>
      </View>
    )
  }
}
