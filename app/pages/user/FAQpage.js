/**
 * Created by Traveller on 2017/3/28.
 * 常见问题
 */
import React from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity
} from 'react-native';
import Colors from '../../constants/Colors';
import NavigationBar from '../../components/NavigationBar'
import * as common from '../../utils/CommonUtils';

const deviceWidth = common.getWidth();

const Up = require('../../images/common/up.png')
const Down = require('../../images/common/down.png')


export default class FAQpage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showHouseType: false,
            showProduct: false,
            showVip: false,
            showSaveScheme: false,
        }
    }

    onLeftBack() {
        this.props.navigator.pop()
    }


    render() {
        return (
            <View style={{flex: 1, backgroundColor: Colors.mainBgColor}}>
                <NavigationBar
                    title={'常见问题'}
                    titleColor={Colors.black}
                    backgroundColor={Colors.white}
                    onLeftButtonPress={() => this.onLeftBack()}
                    leftButtonIcon={require('../../images/common/icon_back_black.png')}
                    rightButtonIcon2={require('../../images/common/icon_customer_black.png')}
                />

                <View style={{margin: 8}}/>
                <TouchableHighlight onPress={() => this.setState({showHouseType: !this.state.showHouseType})}
                                    style={{backgroundColor: '#fff'}}
                                    underlayColor={'#dcdcdc'} activeOpacity={0.8}>
                    <View style={styles.oneLine}>
                        <Text style={styles.textTitle}>如何申请户型？</Text>
                        <Image source={this.state.showHouseType ? Down : Up}
                               resizeMode={'contain'}
                               style={{height: common.adaptHeight(26), width: common.adaptWidth(16)}}/>
                    </View>
                </TouchableHighlight>
                {this.state.showHouseType
                    ? <Text style={{padding: common.adaptWidth(25)}}>
                        填写信息分为必填信息和选填信息：必填信息有“*”标识，是完成 会员注册必须填写的；客户根据意愿填写。
                    </Text>
                    : null
                }


                <View style={styles.line}/>

                <TouchableHighlight onPress={() => this.setState({showProduct: !this.state.showProduct})}
                                    style={{backgroundColor: '#fff'}}
                                    underlayColor={'#dcdcdc'} activeOpacity={0.8}>
                    <View style={styles.oneLine}>
                        <Text style={styles.textTitle}>如何替换物品？</Text>
                        <Image source={this.state.showProduct? Down : Up}
                               resizeMode={'contain'}
                               style={{height: common.adaptHeight(26), width: common.adaptWidth(16)}}/>
                    </View>
                </TouchableHighlight>
                {this.state.showProduct
                    ? <Text style={{padding: common.adaptWidth(25)}}>
                        填写信息分为必填信息和选填信息：必填信息有“*”标识，是完成 会员注册必须填写的；客户根据意愿填写。
                    </Text>
                    : null
                }

                <View style={styles.line}/>

                <TouchableHighlight onPress={() => this.setState({showVip:!this.state.showVip})}
                                    style={{backgroundColor: '#fff'}}
                                    underlayColor={'#dcdcdc'} activeOpacity={0.8}>
                    <View style={styles.oneLine}>
                        <Text style={styles.textTitle}>如何成为玩家生活的会员？</Text>
                        <Image source={this.state.showVip ? Down : Up}
                               resizeMode={'contain'}
                               style={{height: common.adaptHeight(26), width: common.adaptWidth(16)}}/>
                    </View>
                </TouchableHighlight>
                {this.state.showVip
                    ? <Text style={{padding: common.adaptWidth(25)}}>
                        填写信息分为必填信息和选填信息：必填信息有“*”标识，是完成 会员注册必须填写的；客户根据意愿填写。
                    </Text>
                    : null
                }


                <View style={styles.line}/>

                <TouchableHighlight onPress={() => this.setState({showSaveScheme: !this.state.showSaveScheme})}
                                    style={{backgroundColor: '#fff'}}
                                    underlayColor={'#dcdcdc'} activeOpacity={0.8}>
                    <View style={styles.oneLine}>
                        <Text style={styles.textTitle}>如何保存方案？</Text>
                        <Image source={this.state.showSaveScheme? Down : Up}
                               resizeMode={'contain'}
                               style={{height: common.adaptHeight(26), width: common.adaptWidth(16)}}/>
                    </View>
                </TouchableHighlight>
                {this.state.showSaveScheme
                    ? <Text style={{padding: common.adaptWidth(25)}}>
                        填写信息分为必填信息和选填信息：必填信息有“*”标识，是完成 会员注册必须填写的；客户根据意愿填写。
                    </Text>
                    : null
                }

            </View>
        )
    }
}

const styles = StyleSheet.create({
    oneLine: {
        backgroundColor: '#fff',
        width: deviceWidth,
        height: common.adaptHeight(106),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 20
    },
    textTitle: {color: '#262626', fontSize: 16},
    line: {borderWidth: 0.2, width: deviceWidth, borderColor: '#e6e6e6'},
});
