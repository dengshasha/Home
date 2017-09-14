import React, {Component} from "react";
import {
  View,
  Text,
  Image,
  WebView,
  Platform,
  TouchableOpacity,
} from "react-native";
import SchemeHandler from '../../utils/SchemeHandler' ;
import * as common from '../../utils/CommonUtils';
import {ApiRequest} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import Orientation from 'react-native-orientation';
import SaveScheme from '../design/SaveScheme'
import SaveDna from '../design/SaveDna'
import WeChatShare from '../../components/WeChatShare';
import CrosswalkWebView from '../../libs/react-native-webview-crosswalk';

var WeChat = require('react-native-wechat');
var deviceWidth = common.getWidth();
var deviceHeight = common.getHeight();

export default class ImportedSchemeDetail extends Component {
  constructor(props){
    super(props);
    this.state = {
      showShareModal: false,
      showSuccessAnimation: false
    }
  }

  componentWillMount(){

    this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
        if (event._data.route.id != 'OthersPanoramaPage') {
          Orientation.lockToPortrait();
        } else {
          Orientation.unlockAllOrientations();

        }
    });

    WeChat.isWXAppInstalled()
    .then((isInstalled) =>
          !isInstalled ? (this.modalVisible = false) : (this.modalVisible = true)
    )
    Orientation.addOrientationListener((orientation)=>{
      if(orientation == 'LANDSCAPE'){
        deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getWidth() - 20 : common.getNormalHeight() - 20;
        deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() : common.getWidth();
      } else if (orientation == 'PORTRAIT') {
        deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getWidth() : common.getNormalHeight();
        deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() - 20: common.getWidth() - 20;
      }
      this.setState({})
    })
  }

  componentDidMount(){
    // let apiRequest = new ApiRequest();
    // apiRequest.request(ApiMap.getScheme,{version: SchemeHandler.scheme.id},null,(status, res)=>{
    //     if (status) {
    //       SchemeHandler.scheme = res.data ;
    //     } else {
    //       this.props.navigator.pop()
    //     }
    // })
  }

  componentWillUnmount(){
    Orientation.lockToPortrait()
    Orientation.removeOrientationListener()
  }

  isPortrait(){
    return deviceWidth < deviceHeight;
  }

  renderButtons(){
    let menuData = [
      {
        image: require('../../images/scheme/panorama/icon_save_dna.png'),
        onPress: ()=>this.props.navigator.push({id: 'SaveDna', component: SaveDna}),
        text: '收藏风格'
      },
      {
        image: require('../../images/scheme/panorama/icon_collect_dna.png'),
        onPress: ()=>this.props.navigator.push({id: 'SaveScheme', component: SaveScheme}),
        text: '收藏方案'
      },
      {
        image: require('../../images/scheme/panorama/icon_thumbs_up.png'),
        onPress: ()=>this.likeScheme(),
        text: '点赞'
      },
      {
        image: require('../../images/scheme/panorama/share.png'),
        onPress: ()=>this.setState({showShareModal: true}),
        text: '分享'
      }
    ]
    let menuWidth ;
    let imageWidth ;
    let fontSize ;
    if (this.isPortrait()) {
      // menuData.push(taskMenu)
      menuWidth = deviceHeight / 9 ;
      imageWidth = deviceHeight / 13 ;
      fontSize = 13
    }else {
      menuWidth = deviceHeight / 6 ;
      imageWidth = deviceHeight / 9 ;
      fontSize = 10
    }

    return menuData.map((item, index)=>{
        return(
          <View key = {index} style = {{alignItems: 'center', marginTop: 5, width: menuWidth, height: menuWidth}}>
            <TouchableOpacity onPress = {()=>item.onPress()}>
              <Image resizeMode={'contain'} style = {{width: imageWidth, height: imageWidth}} source = {item.image}/>
            </TouchableOpacity>
            <Text style = {{ fontSize: fontSize, color: '#fff', marginTop: 3}}>{item.text}</Text>
          </View>
        )
    })
  }

  renderWebview() {
    let url = SchemeHandler.getImageListPanoramaUrl(this.props.scheme.pano_url) ;
    if(Platform.OS === 'ios'){
      return(
        <WebView
          ref="webview"
          javaScriptEnabled={true}
          source={{uri: url}}>
        </WebView>
      )
    }else if(Platform.OS === 'android'){
      return(
          <CrosswalkWebView
            localhost={false}
            style={{flex: 1}}
            url={url}/>
      )
    }
  }

  render() {
    let url = SchemeHandler.getImageListPanoramaUrl(this.props.scheme.pano_url) ;
    return(
      <View style = {{flex: 1}}>
        {this.renderWebview()}
        {/** 导航条**/}
        <View style = {{position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',top: this.isPortrait()?20:0, left: 0, right: 0, height: 44, width: deviceWidth}}>
          <TouchableOpacity style = {{paddingLeft: 10}} onPress = {()=> this.props.navigator.pop()}>
            <Image style = {{margin: 5}} source = {require('../../images/common/icon_back_white.png')}/>
          </TouchableOpacity>
        </View>
        {/**菜单栏**/}
        <View style = {{position: 'absolute', top: 5, right: 0, width: this.isPortrait() ? deviceHeight/9 : deviceHeight/6, height: deviceHeight, justifyContent: 'center'}}>
          {this.renderButtons()}
        </View>
        <WeChatShare
          url={url}
          visible={this.state.showShareModal}
          closeShareDialog={()=> this.setState({showShareModal: false})}/>
      </View>
    )
  }

  onLikeCallback(status, responseData){
    if (status) {
      alert('点赞成功');
      SchemeHandler.scheme.isLiked = true;
    } else {
        alert('点赞方案，网络出错')
    }
  }

  likeScheme() {
    let isLiked = SchemeHandler.scheme.isLiked;
    if (isLiked) { //取消点赞
      alert('已经点赞')
    } else {
      let likeId = SchemeHandler.scheme.id;
      let apiRequest = new ApiRequest();
      apiRequest.request(ApiMap.likeScheme, {likeId}, null, this.onLikeCallback.bind(this))
    }
  }
}
