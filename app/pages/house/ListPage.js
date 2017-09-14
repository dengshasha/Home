import React, { Component } from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import CustomHeader from '../../components/CustomHeader'
import RefreshableView from '../../components/RefreshableView'
import toast from '../../components/Toast'
import { getLayoutList, resetLayoutList } from '../../actions/layout'
import qiniu from '../../utils/qiniu'
import HouseOrdersPage from './OrdersPage'
import HouseResultPage from './ResultPage'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7'
    },
    item: {
        marginBottom: 12,
        backgroundColor: '#e6e6e6'
    },
    cover: {
        justifyContent: 'flex-end',
        width: '100%',
        height: dp(230)
    },
    room: {
        paddingHorizontal: dp(12),
        paddingVertical: 6,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    roomText: {
        fontSize: fontSize(12),
        color: '#fff'
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 55,
        paddingHorizontal: dp(12),
        backgroundColor: '#fff'
    },
    barWrap: {
        flexDirection: 'row'
    },
    tag: {
        justifyContent: 'center',
        height: 22,
        paddingHorizontal: 12,
        marginRight: 24,
        borderColor: '#f33d5a',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 4
    },
    tagText: {
        fontSize: fontSize(13),
        color: '#f33d5a'
    },
    priceWrap: {
        height: 24,
        justifyContent: 'center'
    },
    price: {
        fontSize: fontSize(13),
        color: '#f33d5a'
    },
    status: {
        fontSize: fontSize(14),
        color: '#999'
    },
    link: {
        marginLeft: 12,
        fontSize: fontSize(14),
        color: '#f33d5a',
        textDecorationLine: 'underline'
    }
})

class ListPage extends Component {
    constructor (props) {
        super(props)

        this.state = {
            loading: false,
            hasMore: true
        }
        this.page = 0 // 当前页数
    }

    componentDidMount () {
        this.init = async () => {
            await this.props.dispatch(resetLayoutList()) // 清空数据
            this.page = 0
            this.setState({
                loading: false,
                hasMore: true
            }, () => this.loadData())
        }
        setTimeout(this.init, 0)
    }

    /**
     * 加载数据
     * @returns {Promise.<void>}
     */
    async loadData () {
        if (this.state.loading || !this.state.hasMore) return
        try {
            this.setState({loading: true})
            await this.props.dispatch(getLayoutList(global.userInfo.userName, ++this.page, 100))
            this.setState({loading: false})
            this.setState({
                hasMore: this.props.layout.length % 100 === 0,
                loading: false
            })
        } catch (error) {
            --this.page
            this.setState({loading: false})
            toast.show(error.response.data.message)
        }
    }

    /**
     * 刷新
     * @param next
     * @returns {Promise.<void>}
     */
    async onRefresh (next) {
        this.page = 0
        this.setState({hasMore: true}, async () => {
            await this.loadData()
            next()
        })
    }

    /**
     * 渲染每一列
     * @param item
     * @returns {XML}
     */
    renderItem (item, index) {
        const source = {
            uri: qiniu.imageView(item.layoutImage, {
                mode: 1,
                w: 350 * DEVICE.scale,
                h: 200 * DEVICE.scale
            })
        }
        const price = item.rooms.reduce(
            (prevItem, item) => ({price: prevItem.price + item.price})).price

        return (
            <View style={styles.item} key={index}>
                <Image style={styles.cover} source={source}>
                    <View style={styles.room}>
                        <Text style={styles.roomText}>{item.rooms.map((o) => o.name).join(', ')}</Text>
                    </View>
                </Image>
                <View style={styles.bar}>
                    <View style={styles.barWrap}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{item.style}</Text>
                        </View>
                        <View style={styles.priceWrap}>
                            <Text style={styles.price}>
                                ¥ <Text style={{
                                fontSize: fontSize(16),
                                fontWeight: '700'
                            }}>{price}</Text>
                            </Text>
                        </View>
                    </View>
                    <View style={styles.barWrap}>
                        {
                            item.orderStatue === 0 ? [
                                <Text style={styles.status} key="1">等待支付</Text>,
                                <TouchableOpacity
                                    key="2"
                                    onPress={() => {
                                        this.props.navigator.push({
                                            component: HouseOrdersPage,
                                            params: {
                                                id: item.id
                                            }
                                        })
                                    }}>
                                    <Text style={styles.link}>立即支付</Text>
                                </TouchableOpacity>
                            ] : item.approveStatue === 0 ? (
                                <Text style={styles.status}>资料审核中</Text>
                            ) : item.approveStatue === 2 ? [
                                <Text style={styles.status} key="1">资料不符合</Text>,
                                <TouchableOpacity
                                    key="2"
                                    onPress={() => {
                                        this.props.navigator.push({
                                            component: HouseOrdersPage,
                                            params: {
                                                id: item.id
                                            }
                                        })
                                    }}>
                                    <Text style={styles.link}>修改资料</Text>
                                </TouchableOpacity>
                            ] : item.isCompleted ? [
                                <Text style={styles.status} key="1">3D建模成功</Text>,
                                <TouchableOpacity
                                    key="2"
                                    onPress={() => {
                                        this.props.navigator.push({
                                            component: HouseResultPage,
                                            params: {
                                                id: item.id
                                            }
                                        })
                                    }}>
                                    <Text style={styles.link}>查看</Text>
                                </TouchableOpacity>
                            ] : (
                                <Text style={styles.status}>建模制作中</Text>
                            )
                        }
                    </View>
                </View>
            </View>
        )
    }

    render () {
        return (
            <View style={styles.container}>
                <CustomHeader title="我的申请" onBack={() => this.props.navigator.pop()}/>
                <RefreshableView
                    data={this.props.layout}
                    loading={this.state.loading}
                    hasMore={this.state.hasMore}
                    onRefresh={this.onRefresh.bind(this)}
                    onEndReached={this.loadData.bind(this)}
                    onEndReachedThreshold={0.1}>
                    {this.props.layout.map(this.renderItem.bind(this))}
                </RefreshableView>
            </View>
        )
    }
}

export default connect((state) => ({user: state.user, layout: state.layout}))(ListPage)
