import React,{Component} from 'react';
import {
  Image,
  Text,
  View,
  ScrollView,
  NativeModules,
  WebView,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native'
import Colors from '../../constants/Colors'
import NavigationBar from '../../components/NavigationBar'
import * as common from '../../utils/CommonUtils'
import * as Icon from '../../images/'
import ActivityLayoutPage from './ActivityLayoutPage'
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest'
import {ApiMap, CommunityApiMap} from '../../constants/Network'
import ActivityPage from './ActivityPage'

var UMNative = NativeModules.UMNative;

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();
var apiRequest = new ApiRequest();
export default class ActivityDescriptionPage extends Component {
  constructor(props) {
    super(props);
    this.activity = this.props.route.activity
  }
  componentWillMount() {
    UMNative.onPageBegin('ActivityDescriptionPage')
    let routes = this.props.navigator.getCurrentRoutes()
    let preRoute = routes[routes.length-2]
    if (preRoute.id !== 'ActivityPage') {
      this.getMySchemes((status, response)=>{
        if (status && response.data.length) {
          this.enterActivityPage()
        }
      })
    }

  }

  componentWillUnmount() {
    UMNative.onPageEnd('ActivityDescriptionPage')
  }

  getMySchemes(callback) {
    apiRequest.request(CommunityApiMap.getUserActivityWorks, {
      communityIndex: 1,
      activity_id: this.activity.id,
      communityWorksOfUserId: global.userInfo.user_id
    }, null, callback)
  }

  enterActivityPage(){
    this.props.navigator.replace({id:'ActivityPage', component: ActivityPage, activityId: this.activity.id})
  }
  enterActivityLayoutPage(){
    this.props.navigator.replace({id:'ActivityLayoutPage', component: ActivityLayoutPage, activityId: this.activity.id})
  }

  onLeftBack() {
    this.props.navigator.pop();
  }

  render() {
    let htmlContent = '<!DOCTYPE html><html lang="en"><head>' +
          '<meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">' +
          '<meta charset="UTF-8"><title>Document</title>'+
          '<style>html{width: 100%;} body{width: 100%; height: 100%; margin: 0;} h5{margin: 0; padding: 0;} p{margin-top: 0;} img {max-width: 100%; height: auto; border-radius: 10px;}</style>' +
          '</head><body><div style="margin: 0 20px;">' +
          this.activity.rule +
          '</div></body></html>'

    return(
      <View style={{flex: 1}}>
        <TouchableOpacity onPress={()=> this.enterActivityLayoutPage()}
          style = {{width: deviceWidth, height: 250 / 667 * deviceHeight}}>
          <Image source={{uri: this.activity.column_url }} style={{width: deviceWidth, height: 250 / 667 * deviceHeight,}}/>
        </TouchableOpacity>
        <WebView
          style = {{width: deviceWidth, flex: 1, overflow: 'hidden'}}
          scalesPageToFit = {true}
          source = {{html: htmlContent}}/>
        <NavigationBar title={'活动'}
          titleColor = {Colors.white}
          backgroundColor = {Colors.transparent}
          navigator = {this.props.navigator}
          leftButtonIcon = {Icon.backWhite}
          logoIcon = {Icon.logoWhite}
          rightButtonIcon1={Icon.icon_join}
          rightButtonTitle1={'参赛活动'}
          rightButtonTitleColor={Colors.white}
          onRightButton1Press={() => this.enterActivityPage()}
          onLeftButtonPress = {this.onLeftBack.bind(this)}
          style = {{position: 'absolute', top:0, left:0}}/>

      </View>
    )
  }

}
