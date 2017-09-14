import React,{Component} from 'react';
import {
  Image,
  Text,
  View,
  Easing,
  ListView,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import * as common from '../../utils/CommonUtils' ;
import SchemeHandler from '../../utils/SchemeHandler' ;
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import Colors from '../../constants/Colors' ;
import NavigationBar from '../../components/NavigationBar' ;
import Toast, {DURATION} from 'react-native-easy-toast';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

//导航栏
class Navigation extends Component {

  render() {
    return(
      <Animated.View>
        <NavigationBar title={'大师风格'}
          navigator = {this.props.navigator}
          titleColor={Colors.black}
          leftButtonIcon = {require('../../images/common/icon_back_black.png')}
          onLeftButtonPress = {this.props.onLeftBack}
          logoIcon = {require('../../images/common/logo_black.png')}
          verticalLineColor = {Colors.logoGray}
          rightButtonIcon1 = {require('../../images/common/icon_customer_black.png')}/>
      </Animated.View>
    )
  }
}

//一级视图--图片
class ImageViewLevelOne extends Component {
  
  render() {
    let dnaData = this.props.DNAData[0];
    let images = {uri: dnaData.images}
    let name = dnaData.name;
    let id = dnaData.id;
    
    return(
      
      <View
        style={{
          borderWidth:1,
          borderColor:Colors.veryLightGrey,
          borderRadius:3,
          backgroundColor:Colors.white,
          height:470 / 667 * deviceHeight,
          marginHorizontal: 11 / 375 * deviceWidth,
          marginTop:15 / 667 * deviceHeight,
      }}>
        <TouchableOpacity onPress = {this.props.enterLevelTwoView}>
          <Image source = {images}
            style={{height: 385 / 667 * deviceHeight,width: deviceWidth - 22 / 375 * deviceWidth,borderTopLeftRadius:3,borderTopRightRadius:3,}}>
          </Image>
        </TouchableOpacity>
        
        <View style={{height:85 / 667 * deviceHeight,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:15 / 375 * deviceWidth}}>
          <View>
            <Text style={{fontSize:18,color:Colors.black}}>{name}</Text>
            <View style={{borderWidth:1,borderColor:Colors.mainColor,borderRadius: 3,width: 40 / 375 * deviceWidth,alignItems:'center',marginTop:5 / 667 * deviceHeight}}>
              <Text style={{color:Colors.mainColor,fontSize:12}}>现代</Text>
            </View>
          </View>

          <Text style={{color:Colors.black}}>使用数：<Text style={{color:Colors.mainColor}}>121</Text></Text>
        </View>
      </View>
    )
  }
}

export default class MasterStylePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DNAData: [],
    }
    this.index = 1;
    this.DNAData = [];//存放this.state.DNAData
  }

  componentWillMount() {
    this.getDNAs()
  }

  getDNAs() {
    let apiRequest = new ApiRequest();
    apiRequest.request(ApiMap.getDnas,{index:this.index,owner:true},null,this.getDNAsCallback.bind(this))
  }

  getDNAsCallback(status,response) {
    if(status) {
      this.DNAData = [...response.data,...this.DNAData];
      this.setState({DNAData:this.DNAData});
    } 
  }

  render() {
    return(
      <View>
        <Navigation 
          onLeftBack = {() => this.onLeftBack()}
          navigator = {this.props.navigator}
          navHeightValue = {this.state.navHeightValue}
          />
        {this.DNAData.length && 
          <ImageViewLevelOne 
            DNAData={this.DNAData}
            enterLevelTwoView = {() => this.enterLevelTwoView()}/> }
      </View>
      
    )
  }

  onLeftBack() {
    this.props.navigator.pop();
  }

  enterLevelTwoView() {
    
  }
}