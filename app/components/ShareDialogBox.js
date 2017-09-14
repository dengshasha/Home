import React, {Component} from "react";
import {
    Image,
    Text,
    View,
    Alert,
    TouchableOpacity,
    TouchableHighlight,
    LayoutAnimation
  } from "react-native";
import * as common from '../utils/CommonUtils';
import Colors from '../constants/Colors';
var WeChat = require('react-native-wechat');

var deviceWidth = common.getWidth();
var deviceHeight = common.getHeight();

export default class ShareDialogBox extends Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  static propTypes = {
      url: React.PropTypes.string
  }

  componentDidMount(){
  }

  shareToTimeline(){
        WeChat.shareToTimeline({
          title:'方案全景图分享',
          description: '分享自:玩家生活',
          type: 'news',
          webpageUrl: this.props.url
        })
        .catch((error) => {
          Alert.alert(error.message);
        });
  }
  shareToSession(){
      WeChat.shareToSession({
        title:'方案全景图分享',
        description: '分享自:玩家生活',
        type: 'news',
        webpageUrl: this.props.url
      })
      .catch((error) => Alert.alert(error.message))
 }
  render(){
    return(
      <View style={{position: 'absolute', top: 0, left: 0, height: deviceHeight, width: deviceWidth, alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
          <View style={{height: 360 / 750 * deviceHeight, width: 600 / 1334 * deviceWidth, justifyContent: 'space-around', alignItems: 'center',
            backgroundColor: Colors.white, borderRadius: 5}}>
              <View style = {{flex:2, justifyContent:'center'}}>
                <Text style={{fontSize: 24, color: Colors.black}}>分享至</Text>
              </View>
              <View style={{ flex: 3, flexDirection:'row', alignItems: 'center'  }}>
                <View style = {{flex:1}}/>
                <TouchableOpacity onPress={()=> this.shareToTimeline() } style = {{flex: 2, alignItems: 'center'}}>
                  <Image source={require('../images/dialog/btn_share_friends.png')} />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> this.shareToSession()} style = {{flex: 2, alignItems: 'center'}}>
                  <Image source={require('../images/dialog/btn_share_wechat.png')} />
                </TouchableOpacity>
                <View style = {{flex:1}}/>
             </View>
          </View>
          <TouchableOpacity onPress = {()=>this.props.hideShareModal()} style = {{position: 'absolute', top: (deviceHeight - 300 / 750 * deviceHeight)/2, left: (deviceWidth + 600 / 1334 * deviceWidth)/2 -35}}>
            <Image source = {require('../images/dialog/btn_close.png')} style ={{width: 40 / 750 * deviceHeight , height: 40 / 750 * deviceHeight  }}/>
          </TouchableOpacity>
      </View>
    )
  }

}
