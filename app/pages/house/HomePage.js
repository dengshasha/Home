import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    KeyboardAvoidingView,
    Keyboard,
} from 'react-native';
import {connect} from 'react-redux';
import CustomHeader from '../../components/CustomHeader';
import toast, {Toast} from '../../components/Toast';
import {
    resetHouse,
    addRoomByName,
    addRoomByIndex,
    removeRoom,
    updateHouseHeight,
} from '../../actions/house';
import HouseStylePage from './StylePage';
import HouseListPage from './ListPage';

const styles = StyleSheet.create({
    next: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 62,
        height: 44,
    },
    nextText: {
        fontSize: fontSize(14),
        color: '#666',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        flex: 1,
        marginTop: 26,
        flexDirection: 'row',
    },
    body: {
        width: dp(375),
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    foot: {
        paddingTop: 12,
        paddingHorizontal: dp(36),
    },
    tip: {
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: 'transparent',
    },
    tipText: {
        fontSize: fontSize(13),
        color: '#333',
    },
    link: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 46,
    },
    linkText: {
        fontSize: fontSize(14),
        color: '#999',
        textDecorationLine: 'underline',
    },
    header: {
        alignItems: 'center',
        width: 100 * DEVICE.vw,
        paddingTop: dp(24),
    },
    h1: {
        marginBottom: 4,
        fontSize: fontSize(16),
        fontWeight: '500',
        color: '#333',
    },
    h2: {
        marginTop: 6,
        fontSize: fontSize(14),
        color: '#999',
    },
    input: {
        width: dp(300),
        marginLeft: dp(37.5),
        marginTop: 12,
        marginBottom: 4,
    },
    item: {
        alignItems: 'center',
        height: dp(100) + 25,
        marginLeft: dp(18.75),
        marginBottom: 12,
    },
    itemText: {
        maxWidth: dp(90),
        fontSize: fontSize(14),
        color: '#333',
    },
    itemMoney: {
        color: '#f33d5a',
        fontSize: fontSize(20),
    },
    box: {
        alignItems: 'center',
        justifyContent: 'space-between',
        width: dp(100),
        height: dp(100),
        paddingTop: dp(20),
        paddingBottom: dp(12),
        borderRadius: 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#d9d9d9',
    },
    button: {
        paddingTop: 10,
    },
    buttonText: {
        fontSize: fontSize(13),
        textDecorationLine: 'underline',
    },
});

const inputStyles = StyleSheet.create({
    input: {
        width: '100%',
        height: 40,
        textAlign: 'center',
        fontSize: fontSize(14),
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#d9d9d9',
    },
});

const buttonStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f33d5a',
        shadowColor: 'rgba(204,99,121,1)',
        shadowOpacity: 0.5,
        shadowRadius: 2.5,
        shadowOffset: {
            height: 2,
        },
    },
    text: {
        fontSize: fontSize(15),
        fontWeight: '700',
        color: '#fff',
    },
});

const modalStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    head: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: dp(300),
        marginTop: -38,
    },
    close: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: 38,
        height: 38,
    },
    box: {
        width: dp(300),
        paddingHorizontal: dp(36),
        paddingBottom: 24,
        paddingTop: 36,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    input: {
        marginBottom: 18,
    },
    tip: {
        alignItems: 'center',
        marginBottom: 32,
    },
    tipText: {
        fontSize: fontSize(15),
        color: '#333',
    },
});

class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            text: '',
            height: this.props.house.height,
        };

        this.props.dispatch(resetHouse())
    }

    /**
     * 点击下一步
     * @returns {Promise.<void>}
     */
    async next() {
        const {rooms} = this.props.house;
        if (this.state.height === '') {
            toast.show('请输入楼层高度');
        } else if (!/^\d+(\.\d+)?$/.test(this.state.height)) {
            toast.show('请输入正确的楼层高度');
        } else if (rooms.filter((item) => item.status).length === 0) {
            toast.show('请添加区域');
        } else {
            const height = Number(this.state.height);
            if (height !== this.props.house.height) {
                await this.props.dispatch(updateHouseHeight(height));
            }
            this.props.navigator.push({component: HouseStylePage});
        }
    }

    /**
     * 添加房间
     * @returns {Promise.<void>}
     */
    async addRoom() {
        const {rooms} = this.props.house;
        if (this.state.text === '') {
            this.modalToast.show('请输入新增区域的名称', true);
        } else if (rooms.filter(
                (item) => item.status && item.name === this.state.text).length !==
            0) {
            this.modalToast.show('已添加同名的区域了', true);
        } else {
            if (/客餐厅|主卧|次卧/.test(this.state.text)) {
                const index = rooms.findIndex((item) => item.name === this.state.text);
                await this.props.dispatch(addRoomByIndex(index));
            } else {
                await this.props.dispatch(addRoomByName(this.state.text));
            }

            this.setState({visible: false});
        }
    }

    /**
     * 渲染新增房间弹窗
     * @returns {XML}
     */
    renderAddModal() {
        return (
            <Modal
                visible={this.state.visible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => this.setState({visible: true})}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View behavior="padding" style={modalStyles.container}>
                        <View style={modalStyles.head}>
                            <TouchableOpacity
                                style={modalStyles.close}
                                onPress={() => this.setState({visible: false})}>
                                <Image source={require('../../images/house/icon_del.png')}/>
                            </TouchableOpacity>
                        </View>
                        <KeyboardAvoidingView behavior="padding"
                                              keyboardVerticalOffset={30}>
                            <View style={modalStyles.box}>
                                <View style={modalStyles.tip}>
                                    <Text style={modalStyles.tipText}>
                                        每新增一个区域需支付
                                        <Text style={{fontSize: fontSize(12), color: '#f33d5a'}}>
                                            ¥</Text>
                                        <Text style={{
                                            fontWeight: '700',
                                            color: '#f33d5a',
                                        }}>58</Text>
                                    </Text>
                                </View>
                                <TextInput
                                    style={[inputStyles.input, modalStyles.input]}
                                    maxLength={6}
                                    underlineColorAndroid="transparent"
                                    autoCapitalize="none"
                                    placeholder="请输入新增区域的名称"
                                    placeholderTextColor="#b2b2b2"
                                    onChangeText={(text) => this.setState({text})}/>
                                <TouchableOpacity
                                    style={buttonStyles.container}
                                    onPress={() => this.addRoom()}>
                                    <Text style={buttonStyles.text}>确定</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                        <Toast ref={(toast) => (this.modalToast = toast)}/>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }

    /**
     * 渲染头部
     * @returns {XML}
     */
    renderHeader() {
        return (
            <View style={styles.header}>
                <Text style={styles.h1}>召唤您手机里的家装设计“狮”</Text>
                <Text style={styles.h2}>只需上传户型图，超逼真立体房型即刻呈现</Text>
                <Text style={styles.h2}>在线预览完整家装设计效果！</Text>
                <TextInput
                    style={[inputStyles.input, styles.input]}
                    maxLength={3}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    keyboardType="numeric"
                    placeholder="请输入楼层高度（单位：m）"
                    placeholderTextColor="#b2b2b2"
                    value={this.state.height}
                    onChangeText={(height) => this.setState({height})}/>
            </View>
        );
    }

    /**
     * 渲染尾部
     * @returns {XML}
     */
    renderFooter() {
        return (
            <View style={styles.foot}>
                <TouchableOpacity
                    style={buttonStyles.container}
                    onPress={() => this.setState({visible: true, text: ''})}>
                    <Text style={buttonStyles.text}>新增房间</Text>
                </TouchableOpacity>
                <View style={styles.tip}>
                    <Text style={styles.tipText}>
                        每新增一个区域需支付
                        <Text style={{fontSize: fontSize(12), color: '#f33d5a'}}> ¥</Text>
                        <Text style={{fontWeight: '700', color: '#f33d5a'}}>58</Text>
                    </Text>
                </View>
                <View style={styles.link}>
                    <TouchableOpacity
                        onPress={() => this.props.navigator.push(
                            {component: HouseListPage})}>
                        <Text style={styles.linkText}>我的申请记录</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    /**
     * 渲染房间信息
     * @param item
     * @param index
     * @returns {XML}
     */
    renderItem(item, index) {
        return (
            <View style={styles.item} key={index}>
                <View style={styles.box}>
                    <Text
                        style={[
                            styles.itemText,
                            {color: item.status ? '#333' : '#b2b2b2'}]}
                        numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={[
                        styles.itemMoney,
                        {color: item.status ? '#f33d5a' : '#b2b2b2'}]}>
                        ¥<Text style={{
                        fontWeight: '700',
                        fontSize: fontSize(26),
                    }}> {item.price}</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        if (item.status) {
                            this.props.dispatch(removeRoom(index));
                        } else {
                            this.props.dispatch(addRoomByIndex(index));
                        }
                    }}>
                    <Text style={[
                        styles.buttonText,
                        {color: item.status ? '#999' : '#f33d5a'},
                    ]}>
                        {item.status ? '删除' : '添加'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <CustomHeader
                    onBack={() => this.props.navigator.pop()}
                    headerRight={() => {
                        return (
                            <TouchableOpacity
                                style={styles.next}
                                onPress={() => this.next()}>
                                <Text style={styles.nextText}>下一步</Text>
                            </TouchableOpacity>
                        );
                    }}/>
                {this.renderHeader()}
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={true}>
                    <View style={styles.body}>
                        {
                            this.props.house.rooms.map(this.renderItem.bind(this))
                        }
                    </View>
                </ScrollView>
                {this.renderFooter()}
                {this.renderAddModal()}
            </View>
        );
    }
}

export default connect((state) => ({house: state.house}))(HomePage);
