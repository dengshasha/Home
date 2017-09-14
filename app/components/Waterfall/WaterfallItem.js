import React, {Component} from 'react';
import {
    TouchableOpacity,
    Image,
    View,
    Text
} from 'react-native';
import * as common from '../../utils/CommonUtils';
import * as images from '../../images/'
import styles from './styles.js';
import SchemeHandler from '../../utils/SchemeHandler';
import Colors from '../../constants/Colors';
import {ApiMap, CommunityApiMap} from '../../constants/Network';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import OthersPanoramaPage from '../../pages/activity/OthersPanoramaPage';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();
const apiRequest = new ApiRequest();

// 收藏
const MainCollectH = require('../../images/share/icon_collection_after.png');
const MainCollect = require('../../images/share/icon_collection_white.png');
//点赞
const MainLikeH = require('../../images/share/icon_like_red_after.png');
const MainLike = require('../../images/share/icon_like_red.png');

export default class WaterfallItem extends React.Component {
    constructor(props) {
        super(props);
        this.dataSource = this.props.source;
        this.state = {
            width: props.width,
            height: props.height,
            isCollected: '',
        };
    }

    getHeight() {
        return this.state.height;
    }

    requestWorksDetail() {
      let params = {
        worksId: this.dataSource.works_id
      }
      apiRequest.request(CommunityApiMap.getWorksDetail, params, null, this.onRequestWorksDetailCallback.bind(this))
    }

    onRequestWorksDetailCallback(status, responseData) {
      if(status){
        //处理请求成功事件
        this.props.navigator.push({id: 'OthersPanoramaPage', component: OthersPanoramaPage, PanoramaUrl: responseData.pano_url.split(',')[0]});
      } else {
        //处理请求失败事件
        showErrorAlert(responseData);
      }
    }

    render() {
        let bottomViewHeight = 30;
        let size = this.state.width - 10 / this.state.height - bottomViewHeight < 16 / 9 ?
            {width: this.state.width - 10} :
            {height: this.state.height - bottomViewHeight};
        let avatar = this.dataSource.avatar_url ? {uri: this.dataSource.avatar_url} : images.headIcon;
        let image = this.dataSource && this.dataSource.thumbnail;
        this.state.isCollected = this.dataSource.isCollected;
        return (
            <View>
                <TouchableOpacity style={{height: this.state.height, paddingTop: 15, paddingLeft: 10}} onPress={()=>this.requestWorksDetail()}>
                    <Image
                        source={{uri: image + '?imageView2/0/w/' + deviceWidth}}
                        style={{
                            width: this.state.width - 20,
                            height: this.state.height}}>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',height: this.state.height - 20,paddingHorizontal:10}}>
                            <TouchableOpacity
                                style={{alignItems: 'center',flexDirection:'row'}}
                                onPress={() => this.context.collectScheme(this.dataSource.id, this.dataSource.isCollected,'new')}>
                                <Image source={this.dataSource.isCollected ? MainCollectH : MainCollect} />
                                <Text style={{color:Colors.white,fontSize:12,paddingLeft:3, backgroundColor: 'transparent'}}> </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=> this.context.enterCommentPage(this.dataSource)}
                                style={{alignItems: 'center',flexDirection:'row'}}>
                                <Image source={require('../../images/share/icon_comment.png')}/>
                                <Text style={{color:Colors.white,fontSize:12,paddingLeft:3,backgroundColor: 'transparent'}}> </Text>
                            </TouchableOpacity>
                        </View>
                    </Image>
                </TouchableOpacity>
                <View style={{height:35,
                    borderBottomLeftRadius:5,
                    borderBottomRightRadius:5,
                    backgroundColor:'#fff',
                    marginHorizontal:10,
                    flexDirection: 'row',
                    paddingHorizontal:10,
                    justifyContent: 'space-between',
                    alignItems: 'center'}}>
                    <TouchableOpacity style={{flexDirection: 'row', borderRadius: 12}} onPress={() => {}}>
                        <Image source={ avatar } style={{width: 25, height: 25, borderRadius: 12}}/>
                    </TouchableOpacity>
                    <View style={{width:1,height:16,backgroundColor:Colors.veryLightGrey}}></View>
                    <TouchableOpacity
                        style={{alignItems: 'center',flexDirection:'row'}}
                        onPress={() => this.context.likeScheme(this.dataSource.id, this.dataSource.isLiked,'new')}>
                        <Image source={this.dataSource.isLiked ? MainLikeH : MainLike}/>
                        <Text style={{paddingLeft:5,fontSize:12}}> </Text>
                    </TouchableOpacity>

                </View>

            </View>
        );
    }
};

WaterfallItem.contextTypes = {
    collectScheme: React.PropTypes.func,
    likeScheme: React.PropTypes.func,
    enterCommentPage: React.PropTypes.func
}
