'use strict';

import React from 'react';
import {
  StyleSheet,
  View,
  Navigator,
  Image,
  TouchableOpacity,
  Text
} from 'react-native';

import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import NavigationBar from '../../components/NavigationBar';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();


export default class AreaSelectPage extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
    };
    this.onLeftBack = this.onLeftBack.bind(this);
  }

  componentDidMount() {

  }

  render() {
    return(
    <View style={styles.mainContainer}>
      <NavigationBar title={'国家/地区选择'} titleColor={Colors.black}
        backgroundColor={Colors.white} onLeftButtonPress={this.onLeftBack}
        leftButtonIcon={require('../../images/common/icon_back_black.png')}/>
      <TouchableOpacity style={styles.areaItem} onPress={this.onSelect.bind(this, 86, '中国大陆')}>
        <Text style={{fontSize: 16, color: Colors.black, marginLeft: 24 / 1334 * deviceWidth}}>中国大陆</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.areaItem} onPress={this.onSelect.bind(this, 886, '台 湾')}>
        <Text style={{fontSize: 16, color: Colors.black, marginLeft: 24 / 1334 * deviceWidth}}>台 湾</Text>
      </TouchableOpacity>
    </View>
    )
  }

  onSelect(ccode, area) {
    const {route, navigator} = this.props;
    route.onSelect(ccode, area);
    navigator.pop();
  }

  onLeftBack() {
    const {navigator} = this.props;
    navigator.pop();
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: '#F0F0F0',
  },
  areaItem:{
    width: deviceWidth,
    height: 91 / 1334 * deviceHeight,
    marginTop: 30 / 1334 * deviceHeight,
    backgroundColor: Colors.white,
    justifyContent: 'center'
  }
});
