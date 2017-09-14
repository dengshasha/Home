import React, { Component } from 'react'
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Alert,
    Platform,
    TouchableWithoutFeedback
} from 'react-native'

import * as common from '../utils/CommonUtils'
import Colors from '../constants/Colors'
import * as schemeImages from '../images/scheme/main'
import * as shareImages from '../images/share/main'
var WeChat = require('react-native-wechat')

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

export class PanoramaPageModal extends Component {
    render () {
        return (
            <Modal visible={this.props.modalVisible}
                   transparent={true}
                   onRequestClose={() => {
                   }}
                   animationType={'none'}>
                <View style={{
                    width: deviceWidth,
                    height: deviceHeight,
                    paddingTop: Platform.OS === 'ios' ? 20 : 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }}>

                    <TouchableOpacity
                        onPress={this.props.close}
                        style={{width: deviceWidth, alignItems: 'flex-end', paddingRight: 20, paddingTop: 15}}>
                        <Image source={schemeImages.closeIcon}/>
                    </TouchableOpacity>

                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity style={{justifyContent: 'center'}} onPress={this.props.saveScheme}>
                            <Image source={schemeImages.saveSchemeIcon}/>
                            <Text style={{color: Colors.white, fontSize: 18, marginTop: 10}}>保存方案</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.props.saveStyle}
                            style={{justifyContent: 'center', marginTop: 50 / 667 * deviceHeight}}>
                            <Image source={schemeImages.saveStyleIcon}/>
                            <Text style={{color: Colors.white, fontSize: 18, marginTop: 10}}>保存风格</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Modal>

        )
    }
}

export class PanoramaSharedModal extends Component {
    constructor (props) {
        super(props)
        this.url = this.getUrl(this.props.url)
        this.state = {
            visible: true,
            isInstalled: false
        }
    }

    static propTypes = {
        visible: React.PropTypes.bool,
        closeShareDialog: React.PropTypes.func,
        url: React.PropTypes.string
    }

    componentWillMount () {
        this.wxIsInstalled()
        // this.wxIsOpened();
    }

    // 检查微信是否被安装
    wxIsInstalled () {
        WeChat.isWXAppInstalled()
            .then((isInstalled) => {
                if (isInstalled)
                    this.setState({isInstalled: true})
            })
    }

    wxIsOpened () {
        WeChat.openWXApp()
            .then((isOpened) => {
                if (isOpened)
                    alert('wx opened')
                else
                    alert('wx no')
            })
    }

    getUrl (panoramaUrl) {
        return panoramaUrl && panoramaUrl.replace(/show_inner/, 'show').replace('logo=false', 'logo=true')
    }

    shareToTimeline () {
        this.url = this.getUrl(this.props.url)
        let description = this.props.description ? this.props.description : '分享自:玩家生活'
        let title = this.props.title ? this.props.title : '方案全景图分享'
        if (this.state.isInstalled) { // 微信已安装
            WeChat.shareToTimeline({
                title: title,
                description: description,
                type: 'news',
                thumbImage: this.props.thumbImage,
                webpageUrl: this.url
            }).then(() => {
                this.props.closeShareDialog()
            }).catch((error) => {
                Alert.alert(error.message)
            })
        }
        this.setState({visible: false})
    }

    shareToSession () {
        this.url = this.getUrl(this.props.url)
        let description = this.props.description ? this.props.description : '分享自:玩家生活'
        let title = this.props.title ? this.props.title : '方案全景图分享'
        if (this.state.isInstalled) {// 微信已安装
            WeChat.shareToSession({
                title: title,
                description: description,
                type: 'news',
                thumbImage: this.props.thumbImage,
                webpageUrl: this.url
            }).then(() => {
                this.props.closeShareDialog()
            }).catch((error) => Alert.alert(error.message))
        } else {
            alert('未安装微信App，请安装后再试...')
        }
        this.setState({visible: false})
    }

    render () {
        let visible = this.props.visible
        return (
            <Modal
                animationType={'none'}
                transparent={true}
                onRequestClose={() => false}
                visible={visible}>
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    paddingTop: Platform.OS === 'ios' ? 20 : 0,
                }}>
                    <TouchableOpacity
                        onPress={this.props.closeShareDialog}
                        style={{width: deviceWidth, alignItems: 'flex-end', paddingRight: 20, paddingTop: 15}}>
                        <Image source={schemeImages.closeIcon}/>
                    </TouchableOpacity>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 16, color: Colors.white}}>分享到：</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                margin: common.adaptWidth(20),
                                justifyContent: 'center',
                                width: common.getWidth()
                            }}>
                            <TouchableOpacity
                                onPress={() => this.shareToSession()}
                                style={{alignItems: 'center'}}>
                                <Image
                                    style={{margin: 10}}
                                    resizeMode={'contain'}
                                    source={schemeImages.shareWechatIcon}/>
                                <Text style={{color: Colors.white}}>微信好友</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.shareToTimeline()}
                                style={{alignItems: 'center', marginLeft: common.adaptWidth(30)}}>
                                <Image
                                    style={{margin: 10}}
                                    resizeMode={'contain'}
                                    source={schemeImages.shareCircleIcon}/>
                                <Text style={{color: Colors.white}}>朋友圈</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}

export class PanoramaRateModal extends Component {

    constructor (props) {
        super(props)
    }

    renderStars () {
        let starIcon = []
        for (let i = 1; i <= 5; i++) {
            starIcon.push({
                id: i,
                image: shareImages.rateStar,
            })
        }
        return starIcon.map((item, index) => {
            return (
                <View key={index} style={{alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => {
                        this.props.onSetRateCount(item.id)
                    }}>
                        <Image resizeMode={'contain'} style={{
                            height: 34 / 667 * deviceHeight,
                            width: 34 / 375 * deviceWidth,
                            marginHorizontal: 10 / 375 * deviceWidth
                        }}
                               source={this.props.currentRate >= item.id ? shareImages._rateStar : item.image}/>
                    </TouchableOpacity>
                </View>
            )
        })
    }

    render () {
        let visible = this.props.visible
        return (
            <Modal
                animationType={'none'}
                transparent={true}
                onRequestClose={() => this.props.closeRateDialog()}
                visible={visible}>
                <TouchableWithoutFeedback
                    style={{flex: 1}}
                    onPress={() => {
                        this.props.onClose && this.props.onClose()
                    }}>
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        paddingTop: Platform.OS === 'ios' ? 20 : 0,
                        alignItems: 'center'
                    }}>
                        <Text style={{color: Colors.mainColor, fontSize: 27, marginTop: 220 / 667 * deviceHeight}}>点亮星星评价Ta</Text>
                        <Text style={{
                            color: Colors.white,
                            fontSize: 18,
                            marginTop: 14 / 667 * deviceHeight
                        }}>星星越多评价越高</Text>
                        <View style={{flexDirection: 'row', marginTop: 38 / 667 * deviceHeight}}>
                            {this.renderStars()}
                        </View>
                        {this.props.currentRate > 0 && <TouchableOpacity style={{
                            height: 46 / 667 * deviceHeight,
                            width: 210 / 375 * deviceWidth,
                            backgroundColor: Colors.mainColor,
                            marginTop: 120 / 667 * deviceHeight,
                            borderRadius: 5,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                                                                         onPress={() => {
                                                                             this.props.onRate()
                                                                         }}>
                            <Text style={{color: Colors.white, fontSize: 17}}>点亮</Text>
                        </TouchableOpacity>}
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
}
