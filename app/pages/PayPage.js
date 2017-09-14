/**
 * 支付页面
 * @author cstyles
 */
import React, {Component} from 'react';
import {
    StyleSheet, View, Text, Image, TouchableOpacity, Modal, Platform,
} from 'react-native';
import {connect} from 'react-redux';
import * as WeChat from 'react-native-wechat';
import CustomHeader from '../components/CustomHeader';
import indicator from '../components/Indicator';
import toast from '../components/Toast';
import {payOrder, getOrderStatus} from '../actions/order';
import * as common from '../utils/CommonUtils' ;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    item: {
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#fff',
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 62,
        height: 70,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    type: {
        fontWeight: '700',
        fontSize: fontSize(16),
        color: '#212121',
    },
    desc: {
        marginTop: 3,
        fontSize: fontSize(12),
        color: '#b2b2b2',
    },
    arrow: {
        width: 20,
        justifyContent: 'center',
    },
});

const modalStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    box: {
        width: dp(300),
        padding: 22,
        backgroundColor: '#fff',
        borderRadius: 6,
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: '700',
        fontSize: fontSize(16),
        color: '#333',
    },
    tip: {
        marginTop: 8,
        lineHeight: 18,
        fontSize: fontSize(13),
        color: '#999',
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        width: dp(116),
        height: 30,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#bfbfbf',
        borderRadius: 4,
    },
    highlight: {
        borderColor: '#f33d5a',
        backgroundColor: '#f33d5a',
    },
    text: {
        fontSize: fontSize(14),
        color: '#333',
    },
});

class PayPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
        };
    }

    /**
     * 验证支付状态
     * @returns {Promise.<void>}
     */

     componentWillUnmount(){
         WeChat.registerApp (common.getWechatAppID ());
     }

    async validatePayStatus (cancel) {
        this.setState({visible: false})

        indicator.show('正在验证订单...')
        try {
            const {orderId, onBack} = this.props.route.params
            const {status} = (await this.props.dispatch(getOrderStatus(orderId))).action.payload.data

            indicator.close()
            if (status === 30) {
                toast.show('支付成功')
                onBack && onBack(this.props.navigator, true)
            } else if (!cancel) {
                toast.show('支付失败: 如果已经付款，请联系客服。')
            }
        } catch ({response}) {
            indicator.close()
            toast.show(response.data.message)
        }
    }

    /**
     * 微信支付
     * @returns {Promise.<void>}
     */
    async weixinPay() {
        try {
            if ((await WeChat.isWXAppInstalled())) {
                const {orderId} = this.props.route.params;
                indicator.show('正在提交订单...');

                const {extraData} = (await this.props.dispatch(payOrder(orderId))).action.payload.data;
                if (Platform.OS === 'android') extraData.timeStamp = String(extraData.timeStamp); // android 要求字符为string

                delete extraData.codeUrl;
                indicator.close();
                setTimeout(() => this.setState({visible: true}), 0);

                WeChat.registerApp(extraData.appId);
                WeChat.pay(extraData).catch(({message}) => {
                    this.setState({visible: false});
                    toast.show(`支付失败: ${message === '-2' ? '用户放弃支付' : '服务器繁忙'}`);
                });
            } else {
                toast.show('未安装微信客户端');
            }
        } catch ({response}) {
            indicator.close();
            toast.show(response.data.message);
        }
    }

    /**
     * 渲染支付弹窗
     * @returns {XML}
     */
    renderModal() {
        return (
            <Modal
                visible={this.state.visible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => false}>
                <View style={modalStyles.container}>
                    <View style={modalStyles.box}>
                        <Text style={modalStyles.title}>支付提示</Text>
                        <Text style={modalStyles.tip}>1.
                            请在微信中完成支付，如果您已支付成功，请点击“已成功支付”按钮。</Text>
                        <Text style={modalStyles.tip}>2.
                            如果您还未安装微信6.0.2以上版本，请点击“取消”按钮，并选择其他支付方式。 </Text>
                        <View style={modalStyles.button}>
                            <TouchableOpacity
                                style={modalStyles.item}
                                onPress={() => this.validatePayStatus(true)}>
                                <Text style={modalStyles.text}>取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[modalStyles.item, modalStyles.highlight]}
                                onPress={() => this.validatePayStatus(false)}>
                                <Text style={[modalStyles.text, {color: '#fff'}]}>已完成支付</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    render() {
        const {onBack} = this.props.route.params;
        return (
            <View style={styles.container}>
                <CustomHeader
                    title="选择支付方式"
                    onBack={() => {
                        onBack ? onBack(this.props.navigator, false) : this.props.navigator.pop();
                    }}/>
                <TouchableOpacity style={styles.item} onPress={() => this.weixinPay()}>
                    <View style={styles.icon}>
                        <Image source={require('../images/pay/icon_wx.png')}/>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.type}>微信支付</Text>
                        <Text style={styles.desc}>仅安装微信6.0.2即以上版本客户端使用</Text>
                    </View>
                    <View style={styles.arrow}>
                        <Image source={require('../images/pay/arrow_right.png')}/>
                    </View>
                </TouchableOpacity>
                {this.renderModal()}
            </View>
        );
    }
}

export default connect((state) => state)(PayPage);
