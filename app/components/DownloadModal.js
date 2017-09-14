import React,{Component} from 'react';
import {
  Image,
  Text,
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as common from '../utils/CommonUtils' ;
import SchemeHandler from '../utils/SchemeHandler' ;
import {ApiRequest, showErrorAlert} from '../utils/ApiRequest';
import {ApiMap} from '../constants/Network';
import Colors from '../constants/Colors' ;
import * as Images from '../images/style/main';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

export default class DownloadModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: true,
    }
  }

  onCancle(){
    this.props.onClick && this.props.onClick()
  }

  ensure(){
    this.props.onClick && this.props.onClick(true) 
  }

  render() {
    return (
      <View style = {{ position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, width: deviceWidth, height: deviceHeight, backgroundColor:'rgba(0,0,0,.8)',}}>
        <View style={styles.modalContainer}>

          <View style = {{flex: 1}}>
            <Text style={{fontSize: 20, color: Colors.black,lineHeight: 40, fontWeight:'bold'}}>下载风格套用到我家</Text>
          </View>
          <View style = {{flex: 1}}>
            <Text style={{fontSize: 18, color: 'red',lineHeight: 40, fontWeight:'bold'}}>¥ 0</Text>
          </View>
          <TouchableOpacity style = {{flex: 1}}>
            <Text style={{fontSize: 18, color: 'rgb(113,186,246)',lineHeight: 30 }}>作品购买协议</Text>
          </TouchableOpacity>

        <View style = {{flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'lightgray'}}>
          <TouchableOpacity style = {[styles.modalButton,{borderRightWidth: 1,
          borderRightColor: 'lightgray'}]} onPress = {() => this.onCancle()}>
            <Text style={{fontSize: 18, color: 'rgb(113,186,246)' }}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {styles.modalButton} onPress = {() =>this.ensure()}>
            <Text style={{fontSize: 18, color: 'rgb(113,186,246)' }}>确定</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
    )
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    alignSelf:'center',
    alignItems:'center',
    backgroundColor:'rgba(255,255,255,0.9)',
    borderRadius: 10,
    height: 180 / 667 * deviceHeight,
    width: deviceWidth - 100 / 375 * deviceWidth
  },
  modalButton:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },

})
