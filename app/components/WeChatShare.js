/**
 * Creaed by Traveller on 2017/3/24.
 *  竖屏微信分享
 */
import React from 'react';
import {
    View,
    Image,
    Text,
    Modal,
    Alert,
    TouchableOpacity
} from 'react-native';
var WeChat = require('react-native-wechat');

import * as common from '../utils/CommonUtils'

export default class WeChatShare extends React.Component {

    constructor(props) {
        super(props);
        this.url = this.getUrl(this.props.url);
        this.state = {
            visible: true,
        }
    }

    static propTypes = {
        visible: React.PropTypes.bool,
        closeShareDialog: React.PropTypes.func,
        url: React.PropTypes.string
    }

    getUrl(panoramaUrl){
      return panoramaUrl && panoramaUrl.replace(/show_inner/,'show').replace('logo=false', 'logo=true')
    }

    shareToTimeline(){
      this.url = this.getUrl(this.props.url);
        WeChat.shareToTimeline({
            title:'方案全景图分享',
            description: '分享自:玩家生活',
            type: 'news',
            thumbImage: 'http://headicon.s.vidahouse.com/Fm-CoESV8Y5kyJYsnMLjNb2dkZxX',
            webpageUrl: this.url
        })
            .catch((error) => {
                Alert.alert(error.message);
            });
    }
    shareToSession(){
      this.url = this.getUrl(this.props.url);
        WeChat.shareToSession({
            title:'方案全景图分享',
            description: '分享自:玩家生活',
            type: 'news',
            thumbImage: 'http://headicon.s.vidahouse.com/Fm-CoESV8Y5kyJYsnMLjNb2dkZxX',
            webpageUrl: this.url
        })
            .catch((error) => Alert.alert(error.message))
    }

    render () {
        let visible = this.props.visible
        return (
            <Modal
                animationType={"slide"}
                transparent={true}
                onRequestClose={() => false}
                visible={visible}>
                <View style={{flex: 1}}>
                    <View style={{
                        width: common.getWidth(),
                        height: common.getHeight(),
                        backgroundColor: '#000',
                        opacity: 0.5,
                    }}>
                    </View>
                    <View
                        style={{
                            alignItems: 'center',
                            width: common.getWidth(),
                            backgroundColor: '#fff',
                            position: 'absolute',
                            bottom: 0,
                            left: 0
                        }}>
                        <Text style={{
                            marginTop: common.adaptHeight(40),
                            marginBottom: common.adaptHeight(20),
                            fontSize: 16
                        }}>
                            分享到
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                margin: common.adaptWidth(20),
                                justifyContent: 'center',
                                width: common.getWidth()
                            }}>
                            <TouchableOpacity
                                onPress={()=> this.shareToTimeline()}
                                style={{alignItems: 'center'}}>
                                <Image
                                    style={{margin: 10}}
                                    resizeMode={'contain'}
                                    source={require('../images/share/btn_share_friends.png')}/>
                                <Text>朋友圈</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=> this.shareToSession()}
                                style={{alignItems: 'center', marginLeft: common.adaptWidth(60)}}>
                                <Image
                                    style={{margin: 10}}
                                    resizeMode={'contain'}
                                    source={require('../images/share/btn_share_wechat.png')}/>
                                <Text>
                                    微信
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={{
                                width: common.adaptWidth(650),
                                height: common.adaptHeight(80),
                                backgroundColor: '#bdbdbd',
                                borderRadius: 5,
                                margin: common.adaptHeight(20),
                                marginBottom: common.adaptHeight(28),
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={this.props.closeShareDialog}>
                            <Text style={{color: '#fff', fontSize: 18}}>取消</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
}
