import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import _ from 'lodash'
import CustomHeader from '../../components/CustomHeader';
import indicator from '../../components/Indicator';
import toast from '../../components/Toast';
import {resetHouse} from '../../actions/house';
import {createLayout, updateLayout} from '../../actions/layout';
import {createOrder} from '../../actions/order';
import qiniu from '../../utils/qiniu';
import PayPage from '../PayPage';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: dp(12),
    },
    title: {
        fontSize: fontSize(16),
        color: '#333',
    },
    price: {
        marginTop: dp(24),
        marginBottom: dp(36),
        fontSize: fontSize(30),
        color: '#f33d5a',
    },
    submit: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 44,
        marginTop: 8,
        borderRadius: 22,
        backgroundColor: '#f33d5a',
    },
    submitText: {
        fontSize: fontSize(15),
        fontWeight: '700',
        color: '#fff',
    },
    rooms: {
        flexDirection: 'row',
        marginTop: 14,
        fontSize: fontSize(12),
        color: '#999',
    },
    footer: {
        paddingHorizontal: dp(12),
        paddingBottom: dp(12),
    },
    thumbnail: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ccc',
    },
    thumbnailItem: {
        alignItems: 'center',
        paddingTop: 15,
    },
    thumbnailText: {
        height: 28,
        fontSize: fontSize(13),
        color: '#333',
    },
    thumbnailImage: {
        width: dp(88),
        height: dp(68),
    },
    spacing: {
        marginLeft: dp(10),
    },
});

class CreatePage extends Component {
    async onSubmit() {
        try {
            indicator.show('正在提交，请稍候...');
            const data = _.cloneDeep(this.props.house);
            data.rooms = JSON.stringify(data.rooms.filter((item)=> item.status).map((item) => {
                delete item.status;
                return item;
            }));
            data.clientName = global.userInfo.userName;
            delete data.id;

            let id = this.props.house.id;

            // 创建户型
            if (!id) {
                id = (await this.props.dispatch(createLayout(data))).action.payload.data.id;
            }
            // 创建订单
            const orderId = (await this.props.dispatch(createOrder({
                type: 30,
                items: JSON.parse(data.rooms).map((item) => {
                    return {
                        correlationId: id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                        extraData: {},
                    };
                }),
            }))).action.payload.items[0].id;
            // 更新户型订单字段
            await this.props.dispatch(updateLayout(id, {orderId, ...data}));

            // 创建户型 和 订单成功 执行支付流程
            this.props.navigator.push({
                component: PayPage,
                params: {
                    orderId,
                    onBack: (navigator, status) => {
                        if (!status) {
                            navigator.pop();
                        } else {
                            this.props.dispatch(resetHouse()); // 申请成功 重置掉信息
                            const routes = navigator.getCurrentRoutes();
                            navigator.popToRoute(routes[routes.length - 5]); // 支付成功返回首页
                        }
                    },
                },
            });
        } catch (error) {
            toast.show(error.response.data.message);
        } finally {
            indicator.close();
        }
    }

    /**
     * 渲染缩略图
     * @param item
     * @param index
     * @returns {XML}
     */
    renderItem(item, index) {
        const source = item.figure === '' ? require(
            '../../images/house/anli.png') : {
            uri: qiniu.imageView(item.figure, {
                mode: 1,
                w: 88 * DEVICE.scale,
                h: 68 * DEVICE.scale,
            }),
        };

        return (
            <View key={index}
                  style={[styles.thumbnailItem, index === 0 ? null : styles.spacing]}>
                <Text style={styles.thumbnailText} numberOfLines={1}>{item.name}</Text>
                <Image style={styles.thumbnailImage} source={source}/>
            </View>
        );
    }

    render() {
        const {layoutImage, rooms} = this.props.house;
        const items = [{name: '户型', figure: layoutImage}].concat(rooms.filter((item)=> item.status));
        const price = rooms.filter((item)=> item.status).reduce((prevItem, item) => ({price: prevItem.price + item.price})).price;

        return (
            <View style={styles.container}>
                <CustomHeader onBack={() => this.props.navigator.pop()}/>
                <View style={styles.body}>
                    <Text style={styles.title}>支付建模费用</Text>
                    <Text style={styles.price}>¥ {price}</Text>
                    <TouchableOpacity
                        style={styles.submit}
                        onPress={() => this.onSubmit()}>
                        <Text style={styles.submitText}>提交订单并支付</Text>
                    </TouchableOpacity>
                    <Text style={styles.rooms}>
                        <Text style={{color: '#f33d5a'}}>当前户型: </Text>
                        {rooms.filter((item)=> item.status).map((o) => o.name).join(', ')}
                    </Text>
                </View>
                <View style={styles.footer}>
                    <ScrollView style={styles.thumbnail} horizontal={true}>
                        {items.map(this.renderItem.bind(this))}
                    </ScrollView>
                </View>
            </View>
        );
    }
}

export default connect((state) => ({house: state.house}))(
    CreatePage);
