import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    Modal,
    Platform
} from 'react-native'
import { connect } from 'react-redux'
import ActionSheet from '@expo/react-native-action-sheet'
import ImagePicker from 'react-native-image-crop-picker'
import _ from 'lodash'
import CustomHeader from '../../components/CustomHeader'
import indicator from '../../components/Indicator'
import toast from '../../components/Toast'
import SelectHouseStyle from '../../components/SelectHouseStyle'
import { updateLayout } from '../../actions/layout'
import { createOrder } from '../../actions/order'
import qiniu from '../../utils/qiniu'
import PayPage from '../PayPage'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7'
    },
    id: {
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: dp(12)
    },
    idText: {
        fontSize: fontSize(13),
        color: '#333'
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
        paddingHorizontal: 12,
        backgroundColor: '#fff'
    },
    itemBorder: {
        borderBottomColor: '#e6e6e6',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    itemMargin: {
        flexDirection: 'column',
        marginTop: 10
    },
    labelWrap: {
        width: '100%',
        height: 56,
        justifyContent: 'center'
    },
    label: {
        fontSize: fontSize(15),
        color: '#333'
    },
    text: {
        flex: 1,
        paddingLeft: dp(24),
        textAlign: 'right',
        fontSize: fontSize(13),
        color: '#333'
    },
    image: {
        width: dp(350),
        height: dp(200),
        marginBottom: 12
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 125,
        height: 30,
        marginTop: 8,
        marginBottom: 20,
        borderColor: '#f33d5a',
        borderRadius: 15,
        borderWidth: StyleSheet.hairlineWidth
    },
    buttonText: {
        fontSize: fontSize(14),
        color: '#f33d5a'
    },
    status: {
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 30,
        backgroundColor: '#fff'
    },
    statusTitle: {
        lineHeight: 16,
        fontSize: fontSize(16),
        color: '#333'
    },
    statusIcon: {
        marginVertical: 32
    },
    statusTip: {
        width: dp(300),
        marginVertical: 24,
        lineHeight: 20,
        textAlign: 'center',
        fontSize: fontSize(14),
        color: '#333'
    },
    link: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 125,
        height: 30,
        backgroundColor: '#f33d5a',
        borderRadius: 15
    },
    linkText: {
        fontSize: fontSize(14),
        color: '#fff'
    }
})

const modalStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: Platform.OS === 'ios' ? 64 : 44,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
        backgroundColor: '#fff',
        borderBottomColor: 'rgba(0,0,0,.3)',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    back: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center'
    },
    done: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 62,
        height: 44
    },
    doneText: {
        fontSize: fontSize(14),
        color: '#fff'
    }
})

class OrdersPage extends Component {
    constructor (props) {
        super(props)

        const {id, readOnly} = this.props.route.params
        this.state = {
            readOnly,
            visible: false,
            house: this.props.layout.find((item) => item.id === id)
        }
    }

    /**
     * 按钮点击事件 根据不同状态 处理方式不一样
     * @returns {Promise.<void>}
     */
    async onPress () {
        const {id, orderStatue, approveStatue, height, style, layoutImage, rooms} = this.state.house

        if (orderStatue === 1 && approveStatue === 0) {
            this.props.navigation.goBack() // 返回
        } else {
            if (!/^\d+(\.\d+)?$/.test(height)) return toast.show('请输入正确的楼层高度')
            try {
                indicator.show('正在提交，请等待...')
                let orderId = this.state.house.orderId
                // 重新下一个订单
                if (orderStatue === 0) {
                    orderId = (await this.props.dispatch(createOrder({
                        type: 30,
                        items: rooms.map((item) => {
                            return {
                                correlationId: id,
                                name: item.name,
                                price: item.price,
                                quantity: 1,
                                extraData: {}
                            }
                        })
                    }))).action.payload.items[0].id
                }
                await this.props.dispatch(updateLayout(id, {
                    orderId,
                    height: Number(height),
                    style,
                    layoutImage,
                    rooms: JSON.stringify(rooms),
                    approveStatue: 0 // 审核状态改为0  等待审核
                }))
                // 跳转到支付页面
                if (orderStatue === 0) {
                    indicator.close()
                    this.props.navigator.push({
                        component: PayPage,
                        params: {
                            orderId,
                            onBack: (navigator, status) => {
                                if (!status) {
                                    navigator.pop()
                                } else {
                                    const routes = navigator.getCurrentRoutes()
                                    navigator.popToRoute(routes[routes.length - 3]) // 支付成功返回列表页面
                                }
                            }
                        }
                    })
                } else {
                    this.setState({
                        readOnly: true,
                        house: Object.assign({}, this.state.house, {approveStatue: 0})
                    })
                }
            } catch (error) {
                toast.show(error.response.data.message)
            } finally {
                indicator.close()
            }
        }
    }

    /**
     * 更换参考图
     * @param index {Number} -1:户型参考图 ...rooms index
     * @returns {Promise.<void>}
     */
    async onUpload (index) {
        const house = _.cloneDeep(this.state.house)
        this.refs.actionSheet.showActionSheetWithOptions({
            options: ['拍摄', '从相册选择', '取消'],
            cancelButtonIndex: 2
        }, async (type) => {
            if (type !== 2) {
                try {
                    const image = await ImagePicker[['openCamera', 'openPicker'][type]]({
                        showCropGuidelines: false,
                        hideBottomControls: true,
                        compressImageMaxWidth: 1920,
                        compressImageQuality: 0.8
                    })
                    if (!image || !/image\/.*/.test(image.mime)) return toast.show('请上传正确格式的图片。')
                    indicator.show('上传中，请稍候...')
                    const figure = await qiniu.uploadImage(
                        {uri: image.path, type: 'multipart/form-data'}, 'upload')
                    if (index === -1) {
                        house.layoutImage = figure
                    } else {
                        house.rooms[index].figure = figure
                    }
                    this.setState({house})
                    indicator.close()
                    toast.show('上传成功')
                } catch (error) {
                    if (error.response) {
                        indicator.close()
                        toast.show('上传失败')
                    }
                }
            }
        })
    }

    /**
     * 渲染弹窗
     * @returns {XML}
     */
    renderModal () {
        const house = this.state.house
        let defaultStyle = house.style

        return (
            <Modal
                onRequestClose={() => {}}
                visible={this.state.visible}
                animationType="slide">
                <View style={modalStyle.container}>
                    <View style={modalStyle.header}>
                        <TouchableOpacity style={modalStyle.back}
                                          onPress={() => this.setState({visible: false})}>
                            <Image source={require(
                                '../../images/common/icon_back_black.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={modalStyle.done}
                            onPress={() => this.setState({
                                visible: false,
                                house: Object.assign({}, house, {style: defaultStyle})
                            })}>
                            <Text style={modalStyle.doneText}>
                                确定
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <SelectHouseStyle defaultStyle={defaultStyle}
                                      onChange={(style) => (defaultStyle = style)}/>
                </View>
            </Modal>
        )
    }

    render () {
        const {house, readOnly} = this.state
        const price = house.rooms.reduce((prevItem, item) => ({price: prevItem.price + item.price})).price
        const imageViewParams = {
            mode: 1,
            w: 350 * DEVICE.scale,
            h: 200 * DEVICE.scale
        }

        return (
            <ActionSheet ref="actionSheet" style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <CustomHeader title="订单详情" onBack={() => this.props.navigator.pop()}/>
                    <ScrollView style={styles.container} keyboardDismissMode="on-drag">
                        <View style={styles.id}>
                            <Text style={styles.idText}>
                                订单编号：{house.orderId}
                            </Text>
                        </View>
                        <View style={[styles.item, styles.itemBorder]}>
                            <Text style={styles.label}>订单名称</Text>
                            <Text style={styles.text} numberOfLines={1}>
                                {house.rooms.map((o) => o.name).join(', ')}
                            </Text>
                        </View>
                        <View style={[styles.item, styles.itemBorder]}>
                            <Text style={styles.label}>订单金额</Text>
                            <Text style={[styles.text, {color: '#f33d5a'}]}>¥ {price}</Text>
                        </View>
                        <TouchableOpacity disabled={readOnly} onPress={() => this.setState({visible: true})}>
                            <View style={[styles.item, styles.itemBorder]}>
                                <Text style={styles.label}>户型风格</Text>
                                <Text style={styles.text}>{house.style}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.item}>
                            <Text style={styles.label}>楼层高度（m）</Text>
                            <TextInput
                                editable={!readOnly}
                                style={styles.text}
                                maxLength={3}
                                keyboardType="numeric"
                                placeholder="请输入楼层高度（单位：m）"
                                placeholderTextColor="#b2b2b2"
                                defaultValue={String(house.height)}
                                onChangeText={(height) => this.setState({house: Object.assign({}, house, {height})})}
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"/>
                        </View>
                        <View style={[styles.item, styles.itemMargin]}>
                            <View style={styles.labelWrap}>
                                <Text style={styles.label}>户型图</Text>
                            </View>
                            <Image style={styles.image} source={{uri: qiniu.imageView(house.layoutImage, imageViewParams)}}/>
                            {
                                readOnly ? null : (
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => this.onUpload(-1)}>
                                        <Text style={styles.buttonText}>修改</Text>
                                    </TouchableOpacity>
                                )
                            }
                        </View>
                        {
                            house.rooms.map((item, index) => {
                                return (
                                    <View key={index} style={[styles.item, styles.itemMargin]}>
                                        <View style={styles.labelWrap}>
                                            <Text style={styles.label}>“{item.name}”实景参考照片</Text>
                                        </View>
                                        <Image style={styles.image} source={{uri: qiniu.imageView(item.figure, imageViewParams)}}/>
                                        {
                                            readOnly ? null : (
                                                <TouchableOpacity style={styles.button} onPress={() => this.onUpload(index)}>
                                                    <Text style={styles.buttonText}>修改</Text>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </View>
                                )
                            })
                        }
                        <View style={styles.status}>
                            <Text style={styles.statusTitle}>
                                订单状态:
                                {
                                    house.orderStatue === 0
                                        ? '等待支付'
                                        : house.approveStatue === 0
                                        ? '等待审核'
                                        : house.approveStatue === 2
                                            ? '资料待修改'
                                            : '3D建模成功'
                                }
                            </Text>
                            {
                                house.orderStatue === 0 || house.approveStatue === 0 ? (
                                    <Image style={styles.statusIcon} source={require('../../images/house/status_wait.png')}/>
                                ) : house.approveStatue === 2 ? (
                                    <Text style={styles.statusTip}>{house.remark}</Text>
                                ) : (
                                    <Image style={styles.statusIcon} source={require('../../images/house/status_win.png')}/>
                                )
                            }
                            <Text style={styles.linkText}>
                                {(house.approveStatue === 0 ) ? '完成户型建模预计等待24小时，户型提交问题请联系客服' : ''}
                            </Text>
                            <TouchableOpacity style={styles.link}
                                              onPress={() => this.onPress()}>
                                <Text style={styles.linkText}>
                                    {
                                        house.orderStatue === 0
                                            ? '支付'
                                            : house.approveStatue === 0
                                            ? '返回'
                                            : house.approveStatue === 2
                                                ? '提交修改'
                                                : '查看'
                                    }
                                </Text>
                            </TouchableOpacity>

                        </View>
                        {this.renderModal()}
                    </ScrollView>
                </View>
            </ActionSheet>
        )
    }
}

export default connect((state) => ({layout: state.layout}))(OrdersPage)
