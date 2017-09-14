import React, { Component } from 'react'
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Modal,
    Platform,
} from 'react-native'

import * as common from '../utils/CommonUtils'
import Colors from '../constants/Colors'
import * as Icon from '../images/'
import * as Images from '../images/share/main'
import styles from '../styles/scoreModal'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

export default class ScoreModal extends Component {

    enterGeneralUserPage(userId) {
        this.props.enterGeneralUserPage(userId)
    }

    renderStar () {
        let starArr = []
        for (let i = 0; i < this.props.data.rating; i ++) {
            starArr.push({
                id: i
            })
        }
        const starList = starArr.map((item) =>
            <Image key = {item.id} source = {Images.dialogStarIcon} style = {styles.star}/>
        )

        return(
            <View style = {styles.starContainer}>
                {starList}
            </View>
        )
    }

    render() {
        let author = this.props.data ? this.props.data.author : ''
        let rating = this.props.data ? this.props.data.rating : ''
        let userId = author ? author.user_id : ''
        let avatar = (author && author.avatar_url) ? {uri: author.avatar_url} : Icon.headIcon
        let name = author ? author.name : ''
        return(
            <Modal visible = {this.props.modalVisible}
              transparent = {true}
              onRequestClose = {() => {}}
              animationType = {'none'}>
              <View style={styles.modalContainer}>
                <View style = {styles.modalContent}>
                    <View style = {styles.modalWhiteContainer}>
                        <TouchableOpacity style = {styles.closeBtn} onPress = {this.props.closeModal}>
                            <Image source = {Images.closeIcon}/>
                        </TouchableOpacity>
                        <View style = {styles.WhiteContent}>
                            <Text style = {styles.username}>{name}</Text>
                            <Text style = {styles.whiteText}>Ta为方案点亮了</Text>{/*{rating}颗星*/}
                        </View>
                        {this.renderStar()}
                        <TouchableOpacity style = {styles.button} onPress = {() => this.enterGeneralUserPage(userId)}>
                            <Text style = {styles.buttonText}>进入TA的个人主页</Text>
                        </TouchableOpacity>
                    </View>
                    <Image source = {avatar} style = {styles.avatar}/>
                </View>
              </View>
            </Modal>
        )
    }
}
