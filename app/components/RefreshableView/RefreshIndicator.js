/**
 * 刷新指示器
 * @author cstyles
 * @example <RefreshIndicator pullState={enum(0, 1, 2, 3)} />
 * @description 0: 等待下拉
 * @description 1: 下拉中 触发值 ScrollY < 0
 * @description 2: 下拉完成 触发值 ScrollY < -120
 * @description 3: 加载拉取数据
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Image, Text, Platform } from 'react-native'

const styles = StyleSheet.create({
    indicator: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? -60 : 0,
        left: 0,
        right: 0,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center'
    },
    indicatorIcon: {
        width: 64,
        height: 20
    },
    indicatorText: {
        color: 'rgba(0,0,0,0.3)',
        fontSize: fontSize(12)
    }
})

export default class RefreshIndicator extends Component {
    static propTypes = {
        pullState: PropTypes.oneOf([0, 1, 2, 3]).isRequired
    }

    constructor (props) {
        super(props)

        this.indicator = [
            null,
            <Text style={styles.indicatorText}>下拉刷新</Text>,
            <Text style={styles.indicatorText}>松开刷新</Text>,
            <Image style={styles.indicatorIcon} source={require('./assets/loading.gif')}/>
        ]
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.pullState !== this.props.pullState
    }

    render () {
        return (
            <View style={styles.indicator}>
                {this.indicator[this.props.pullState]}
            </View>
        )
    }
}
