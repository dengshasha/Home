﻿/**
import React, { Component } from 'react';
import {
    TouchableOpacity ,
    Dimensions ,
    StyleSheet ,
    Vibration ,
    Animated ,
    Easing ,
    Alert ,
    Image ,
    Text ,
    View
} from 'react-native';

import Camera from 'react-native-camera';
import * as common from '../../utils/CommonUtils';

//import {actions} from '../redux/Actions';


import SchemeHandler from '../../utils/SchemeHandler';




var deviceWidth = common.getWidth();




    constructor(props){
        super(props) ;
        this.state={
            scanTranslte:new Animated.Value(165 / 667 * deviceHeight),
            avatarSource:null,
         }
         this.onLeftBack = this.onLeftBack.bind(this);
     }
         this.scanLineAnimation();
     }
     scanLineAnimation(){
         Animated.sequence([
             Animated.timing(this.state.scanTranslte,{toValue: 420 / 667 * deviceHeight, duration: 3000 , easing: Easing.linear}),
             Animated.timing(this.state.scanTranslte,{toValue: 165 / 667 * deviceHeight, duration: 3000 , easing: Easing.linear})
         ]).start(()=>this.scanLineAnimation()) ;
     }
     componentWillUnmount(){
         this.camera && this.camera.shouldQR();
     }
     onBarCodeRead(result){
         Vibration.vibrate();
         if(this.props.onBarCodeRead) {
             this.props.onBarCodeRead(result, ()=>{this.camera.shouldQR();
             });
         } else if( result.data && (result.data.indexOf('productVersionId') >= 0 || result.data.indexOf('materialVersionId') >= 0) ){
              let data = JSON.parse(result.data);
               this.scanSuccess(data);
           } else {
               this.props.navigator.pop();
           }
       }
       scanSuccess(arg){
           let apiRequest = new ApiRequest()
           if (arg.productVersionId) {
                apiRequest.request(ApiMap.getProduct, { version: arg.productVersionId }, null ,this.getProductCallback.bind(this))
            }else if(arg.materialVersionId) {
                apiRequest.request(ApiMap.getMaterial , { version: arg.materialVersionId }, null ,this.getMaterialCallback.bind(this))
            }
        }
        getProductCallback(status,reponse) {
            if(status) {
                // let tempScheme = SchemeHandler.modifyProductByCategory(SchemeHandler.scheme, reponse.data)
                // SchemeHandler.scheme = tempScheme;
                this.props.navigator.replace({id:'ProductDetailsPage',component:ProductDetailsPage,params:{itemData:reponse.data}})
            } else {
        }
        getMaterialCallback(status,reponse) {
            if(status) {
                // let tempScheme = SchemeHandler.modifyMaterialByCategory(SchemeHandler.scheme, reponse.data)
                //  SchemeHandler.scheme = tempScheme;
                  this.props.navigator.replace({id:'ProductDetailsPage',component:ProductDetailsPage, params:{itemData:reponse.data}})
              } else {
        }
        selectPhotoTapped(){
            const options = {
                title:'选择图片',
                takePhotoButtonTitle:'拍摄',
                chooseFromLibraryButtonTitle:'从相册选择',
                cancelButtonTitle:'取消',
                quality:0.5,
                maxWidht:300,
                maxHeight:300,
                allowsEditing:true,
                noData: true
            };
            ImagePicker.showImagePicker(options,response => this.chooseImgCallback(response))
        }
        chooseImgCallback(response) {
            if(response.didCancel) {
                console.log('user cancelled photo picker');
            } else if(response.error) {
                console.log('ImagePicker error:',response.error);
            } else if(response.customButton) {
                console.log('user tapped customButton:',response.customButton);
            } else {
                if(global.ANDROID_PLATFORM) {
                    source = {uri:response.uri,isStatic:true};
                } else {
                    source = {uri:response.uri.replace('file://',''),isStatic:true};
                }
                this.setState({avatarSource:source});
            }
        }
        render() {
            return (
                <View style={{flex:1}}>
                <Camera
                    style={{flex: 1}}
                    type={Camera.constants.Type.back}
                    orientation = { Camera.constants.Orientation.portrait }
                    ref={(cam)=>{this.camera = cam}}
                    defaultOnFocusComponent={true}
                    onBarCodeRead={this.onBarCodeRead.bind(this)}/>
                <Image
                     resizeMode='stretch'
                     source={require('../../images/design/bg_qrcode.png')}
                     style={{position: 'absolute',
                     left: 0, right: 0,bottom:0, width: deviceWidth, height: deviceHeight,justifyContent:'space-between',alignItems:'flex-end',}}>
                     backgroundColor = {'rgba(255,255,255,0)'}
                     onLeftButtonPress={this.onLeftBack}
                     eftButtonIcon={require('../../images/common/icon_back_white.png')}
                     rightButtonTitle1={'相册'}
                     onRightButton1Press = {this.selectPhotoTapped.bind(this)}
                     rightButtonTitleColor = {'#fff'}/>
                 <Text style = {styles.prompt}>将二维码/条码放入框中，即可进行扫描</Text>
                 </Image>
                 </View>
             );
        }
        onLeftBack() {
            const {navigator} = this.props;
            navigator.pop();
        }
        const styles = StyleSheet.create({
            prompt:{
                alignSelf:'center',
                color:Colors.lightWhite,
                fontSize:16,
                paddingBottom:150,
            },