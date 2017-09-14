/**
 * ListFooterComponent 为 FlatList 和 SectionList 提供
 * @author styles
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Image, Text } from 'react-native'

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 0,
        overflow: 'hidden'
    },
    loading: {
        width: 64,
        height: 20
    },
    null: {
        marginTop: 12,
        fontSize: fontSize(14),
        color: 'rgba(0,0,0,0.5)'
    },
    text: {
        fontSize: fontSize(12),
        color: 'rgba(0,0,0,0.3)'
    }
})

export default class FooterComponent extends Component {
    static propTypes = {
        loading: PropTypes.bool.isRequired, // 是否加载
        hasMore: PropTypes.bool.isRequired, // 是否还有更多数据
        dataCount: PropTypes.number.isRequired, // 数据条数
        containerHeight: PropTypes.number.isRequired // 容器高度
    }

    render () {
        if (this.props.dataCount === 0) {
            return (
                <View style={[styles.container, {height: this.props.containerHeight}]}>
                    {
                        this.props.loading ? (
                            <Image style={styles.loading} source={require('./assets/loading.gif')}/> // 第一次加载数据
                        ) : [
                            <Image key="icon" source={require('./assets/null.png')}/>,
                            <Text key="text" style={styles.null}>暂无数据</Text>
                        ] // 没有数据
                    }
                </View>
            )
        } else {
            if (!this.props.hasMore) { // 没有更多数据
                return (
                    <View style={[styles.container, {height: 60}]}>
                        <Text style={styles.text}>没有更多的数据了~</Text>
                    </View>
                )
            } else { // 加载更多数据
                return (
                    <View style={[styles.container, {height: this.props.loading ? 60 : 0}]}>
                        <Image style={styles.loading} source={require('./assets/loading.gif')}/>
                    </View>
                )
            }
        }
    }
}
