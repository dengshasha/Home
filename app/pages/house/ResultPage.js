import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, Image, Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import CustomHeader from '../../components/CustomHeader'
import WebViewPage from '../WebViewPage'
import qiniu from '../../utils/qiniu'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7'
    },
    item: {
        width: '100%'
    },
    cover: {
        width: dp(375),
        height: dp(210)
    },
    name: {
        height: 58,
        paddingHorizontal: dp(12),
        justifyContent: 'center'
    },
    nameText: {
        fontSize: fontSize(14),
        color: '#212121'
    }
})

class ResultPage extends Component {

    constructor (props) {
        super(props)

        const {id} = this.props.route.params
        this.state = {
            house: this.props.layout.find((item) => item.id === id)
        }
    }

    renderItem (item, index) {
        const source = {
            uri: qiniu.imageView(item.panoCover, {
                mode: 1,
                w: 375 * DEVICE.scale,
                h: 210 * DEVICE.scale
            })
        }

        return (
            <View key={index} style={styles.item}>
                <TouchableOpacity onPress={() => {
                    this.props.navigator.push({
                        component: WebViewPage,
                        params: {
                            title: '区域全景图',
                            url: item.panoUrl.replace('show.html', 'show_inner.html')
                        }
                    })
                }}>
                    <Image source={source} style={styles.cover}/>
                </TouchableOpacity>
                <View style={styles.name}>
                    <Text style={styles.nameText} numberOfLines={1}>{`${this.state.house.title}（${item.name}）`}</Text>
                </View>
            </View>
        )
    }

    render () {
        const rooms = this.state.house.rooms

        return (
            <View style={styles.container}>
                <CustomHeader title="户型详情" onBack={() => this.props.navigator.pop()}/>
                <ScrollView>
                    {rooms.map(this.renderItem.bind(this))}
                </ScrollView>
            </View>
        )
    }
}

export default connect((state) => ({layout: state.layout}))(ResultPage)