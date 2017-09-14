'use strict'

import React, { PropTypes, } from 'react'
import {
    StyleSheet,
    View,
    Image,
    Text,
    Linking,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native'

import * as common from '../utils/CommonUtils'
// import Colors from '../constants/Colors'
 import MainPage from '../pages/mainPage'

const deviceWidth = common.getWidth()
// const deviceHeight = common.getHeight()

class NavigationBar extends React.Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        //not include the height of statusBar on ios platform
        height: PropTypes.number,
        titleColor: PropTypes.string,
        backgroundColor: PropTypes.string,
        leftButtonTitle: PropTypes.string,
        leftButtonTitleColor: PropTypes.string,
        onLeftButtonPress: PropTypes.func,
        rightButtonTitle1: PropTypes.string,
        rightButtonTitle2: PropTypes.string,
        rightButtonTitleColor: PropTypes.string,
        onRightButton1Press: PropTypes.func,
        onRightButton2Press: PropTypes.func
    }

    static defaultProps = {
        height: Platform.OS === 'ios' ? 60 : 40,
        titleColor: '#000',
        backgroundColor: '#f5f3f4',
        leftButtonTitle: null,
        leftButtonTitleColor: '#000',
        verticalLineColor: '#fff',
        rightButtonTitle1: null,
        rightButtonTitle2: null,
        rightButtonTitleColor: '#000'
    }

    componentWillMount () {
        this.state = this._getStateFromProps(this.props)
    }

    componentWillReceiveProps (newProps) {
        let newState = this._getStateFromProps(newProps)
        this.setState(newState)
    }

    shouldComponentUpdate (nextProps, nextState, context) {
        return JSON.stringify([nextState, context]) !== JSON.stringify([this.state, context])
    }

    _getStateFromProps (props) {
        let title = props.title
        let height = props.height
        let titleColor = props.titleColor
        let backgroundColor = props.backgroundColor
        let leftButtonTitle = props.leftButtonTitle
        let leftButtonTitleColor = props.leftButtonTitleColor
        let onLeftButtonPress = props.onLeftButtonPress
        let verticalLineColor = props.verticalLineColor
        let logoIcon = props.logoIcon
        let rightButtonTitle1 = props.rightButtonTitle1
        let rightButtonTitle2 = props.rightButtonTitle2
        let rightButtonTitleColor = props.rightButtonTitleColor
        let onRightButton1Press = props.onRightButton1Press
        let onRightButton2Press = props.onRightButton2Press
        let leftButtonIcon = props.leftButtonIcon
        let rightButtonIcon1 = props.rightButtonIcon1
        let rightButtonIcon2 = props.rightButtonIcon2
        return {
            title,
            height,
            titleColor,
            backgroundColor,
            leftButtonTitle,
            leftButtonTitleColor,
            onLeftButtonPress,
            verticalLineColor,
            logoIcon,
            rightButtonTitle1,
            rightButtonTitle2,
            rightButtonTitleColor,
            onRightButton1Press,
            onRightButton2Press,
            leftButtonIcon,
            rightButtonIcon1,
            rightButtonIcon2
        }
    }

    _renderLeftIcon () {
        if (this.state.leftButtonIcon) {
            return (
                <Image resizeMode={'contain'} style={styles.leftButtonIcon} source={this.state.leftButtonIcon}/>
            )
        }
        return null
    }

    _renderLogo () {
        if (this.state.logoIcon) {
            return (
                <TouchableOpacity onPress={this._enterMainPage.bind(this)}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Image source={this.state.logoIcon}/>
                    </View>
                </TouchableOpacity>

            )
        }
    }

    _enterMainPage () {
        this.props.navigator.popToTop() //resetTo({id:'MainPage',component: MainPage})
    }

    _renderRightIcon1 () {
        if (this.state.rightButtonIcon1) {
            return (
                <Image resizeMode={'contain'} style={styles.rightButtonIcon} source={this.state.rightButtonIcon1}/>
            )
        }
        return null
    }

    _renderRightIcon2 () {
        if (this.state.rightButtonIcon2) {
            return (
                <Image resizeMode={'contain'} style={styles.rightButtonIcon} source={this.state.rightButtonIcon2}/>
            )
        }
        return null
    }

    // 拨打客服
    _call () {
        let url = 'tel:4008219191'
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + url)
            } else {
                return Linking.openURL(url)
            }
        }).catch(err => console.error('An error occurred', err))
    }

    _onLeftButtonPressHandle (event) {
        let onPress = this.state.onLeftButtonPress
        typeof onPress === 'function' && onPress(event)
    }

    _onRightButton1PressHandle (event) {
        let onPress = this.state.onRightButton1Press
        if (typeof onPress === 'function') {
            onPress(event)
        } else {
            // 未传递函数，执行默认函数，拨打电话
            this._call()
        }
    }

    _onRightButton2PressHandle (event) {
        let onPress = this.state.onRightButton2Press
        typeof onPress === 'function' && onPress(event)
    }

    render () {
        return (
            <View style={[styles.container, {
                height: this.state.height,
                backgroundColor: this.state.backgroundColor,
            }, this.props.style]}>
                <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                    <TouchableOpacity onPress={this._onLeftButtonPressHandle.bind(this)}>
                        <View style={styles.leftButton}>
                            {this._renderLeftIcon()}
                            <Text style={[styles.leftButtonTitle, {color: this.state.leftButtonTitleColor}]}>
                                {this.state.leftButtonTitle}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {this._renderLogo()}
                </View>
                <View style={styles.title}>
                    <Text style={[styles.titleText, {color: this.state.titleColor}]} numberOfLines={1}>
                        {this.state.title}
                    </Text>
                </View>

                <View style={{flexDirection: 'row', flex: 1, justifyContent: 'flex-end'}}>
                    <TouchableOpacity onPress={this._onRightButton2PressHandle.bind(this)}>
                        <View style={styles.rightButton}>
                            {this._renderRightIcon2()}
                            <Text style={[styles.rightButtonTitle2, {color: this.state.rightButtonTitleColor}]}>
                                {this.state.rightButtonTitle2}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={this._onRightButton1PressHandle.bind(this)}>
                        <View style={styles.rightButton}>
                            {this._renderRightIcon1()}
                            <Text style={[styles.rightButtonTitle1, {color: this.state.rightButtonTitleColor}]}>
                                {this.state.rightButtonTitle1}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }
}

export default NavigationBar

let styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: deviceWidth,
        //elevation: 2,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
    },
    leftButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding:5,
        height: common.adaptWidth(88),
        width: common.adaptWidth(88)
    },
    leftButtonIcon: {
        marginLeft: 13 / 375 * deviceWidth,
    },
    leftButtonTitle: {
        fontSize: 15
    },
    title: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginLeft: 8,
    },
    titleText: {
        fontSize: 16,
    },
    rightButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8 / 375 * deviceWidth,
    },
    rightButtonIcon: {
        marginRight: 8 / 375 * deviceWidth,
    },
    rightButtonTitle1: {
        fontSize: 14
    },
    rightButtonTitle2: {
        fontSize: 14
    }
})
