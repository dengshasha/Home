import React, {Component} from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  WebView,
} from "react-native";
import * as common from '../../utils/CommonUtils' ;
import NavigationBar from '../../components/NavigationBar' ;
import Colors from '../../constants/Colors' ;

import content from '../../constants/agreement';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

class ServicePage extends Component {
  constructor(props) {
    super(props);
    this.onLeftBack = this.onLeftBack.bind(this);
  }

  render() {
    let html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
          <title>Document</title>
      </head>
      <body>
          ${content}
      </body>
      </html>`
    return(
      <View style={{flex:1,backgroundColor: Colors.mainBgColor}}>
        <NavigationBar title={'用户协议'}
          backgroundColor = {Colors.white}
          titleColor = {Colors.black}
          leftButtonIcon = {require('../../images/common/icon_back_black.png')}
          onLeftButtonPress = {this.onLeftBack}
          rightButtonIcon1 = {require('../../images/common/icon_customer_black.png')}/>
        <WebView 
          style = {{width: deviceWidth, flex: 1, overflow: 'hidden', backgroundColor: Colors.mainBgColor}}
          scalesPageToFit = {true}
          source = {{html: html}}/>
      </View>
    )
  }



  onLeftBack() {
    this.props.navigator.pop();
  }
}

const htmlContent = ''
export default ServicePage;
