/*created by melody on 2017/7/13
活动--用户评分列表
*/
import React, { Component } from "react"
import {
 View,
 Text,
 Image,
 StyleSheet,
 ListView,
 TouchableOpacity,
} from "react-native"

import * as common from '../utils/CommonUtils'
import * as Icon from '../images/'
import Colors from '../constants/Colors'

var deviceWidth = common.getWidth()
var deviceHeight = common.getHeight()

//点赞人列表
export default class LikeList extends Component {
    constructor(props) {
      super(props)
    }

    openModal(rowData) {
      this.props.openModal(rowData)
    }

    _renderRow(rowData, sectionID, rowID) {
        let avatar = rowData.author.avatar_url ? {uri: rowData.author.avatar_url} : Icon.headIcon
        return(
          <TouchableOpacity onPress = {() => this.openModal(rowData)}>
            <Image source = {avatar} style={styles.avatar}/>
          </TouchableOpacity>
        )
    }

    render() {
        return(
            <View style = {{
                bottom: 55 / 667 * deviceHeight,
                height: 55 / 667 * deviceHeight,
                position: 'absolute',
                width: deviceWidth,
            }}>
                <ListView
                    contentContainerStyle = {{paddingHorizontal: 10}}
                    showsHorizontalScrollIndicator = {false}
                    showsVerticalScrollIndicator = {false}
                    horizontal = {true}
                    dataSource = {this.props.dataSource}
                    enableEmptySections = {true}
                    onEndReached = {this.props.renderMore}
                    renderRow = {this._renderRow.bind(this)}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    avatar: {
        borderRadius: 18 / 375 * deviceWidth, 
        borderWidth: 1, 
        borderColor: Colors.white, 
        height: 36 / 375 * deviceWidth, 
        marginLeft: 3,
        width: 36 / 375 * deviceWidth, 
    }
})
