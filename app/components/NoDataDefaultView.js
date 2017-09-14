import React , {Component} from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet
} from "react-native"

import * as common from '../utils/CommonUtils' 
import * as Icon from '../images/'
import Colors from '../constants/Colors'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

export default class NoDataDefaultView extends Component  {
  constructor(props) {
    super(props)

  }

  render(){
    return(
      <View style = {styles.nodataContainer}>
          <Image source = {Icon.nodataIcon} />
          <Text style = {styles.nodataText}>{this.props.noDataText ? this.props.noDataText : '暂无数据'}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  nodataContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  nodataText: {
    color: Colors.midGrey,
    fontSize: 14,
    marginTop: 10 / 667 * deviceHeight,
  },
})
