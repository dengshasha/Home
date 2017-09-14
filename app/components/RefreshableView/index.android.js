/**
 * 可下拉刷新的视图 支持 ScrollView FlatList SectionList
 * @author cstyles
 * @example <RefreshableView type={enum('ScrollView', 'FlatList', 'SectionList')} onRefresh={...}  {...props}/>
 * @description 其他的props请查看官方文档
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, ScrollView, FlatList, SectionList, PanResponder, Animated, Easing } from 'react-native'
import RefreshIndicator from './RefreshIndicator'
import FooterComponent from './FooterComponent'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    fillParent: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        bottom: 0
    }
})

export default class RefreshableView extends Component {
    static propTypes = {
        onRefresh: PropTypes.func.isRequired,
        type: PropTypes.oneOf(['ScrollView', 'FlatList', 'SectionList']),
        loading: PropTypes.bool,
        hasMore: PropTypes.bool
    }

    static defaultProps = {
        type: 'ScrollView'
    }

    constructor (props) {
        super(props)

        this.state = {
            pullTop: new Animated.Value(0),
            pullState: 0,
            containerHeight: 0
        }

        this.scrollEnabled = false

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder.bind(this),
            onPanResponderMove: this.onPanResponderMove.bind(this),
            onPanResponderRelease: this.onPanResponderRelease.bind(this)
        })
    }

    /**
     * 统一设置 ScrollView, FlatList, SectionList 的scrollY
     * @param y
     */
    scrollTo (y) {
        if (this.props.type === 'ScrollView') {
            this.refs.scrollView.scrollTo({y: y})
        } else {
            this.refs.scrollView.scrollToOffset({offset: y})
        }
    }

    /**
     * 设置 ScrollEnabled
     * @param enabled {Boolean}
     */
    setScrollEnabled (enabled) {
        this.scrollEnabled = enabled
        this.refs.scrollView.setNativeProps({scrollEnabled: enabled})
    }

    /**
     * 是否允许触发touch事件
     * @param evt
     * @param dx
     * @param dy
     * @returns {boolean}
     */
    onMoveShouldSetPanResponder (evt, {dx, dy}) {
        // 必须是纵向拉动 且 禁用scroll
        return Math.abs(dx) < Math.abs(dy) && !this.scrollEnabled
    }

    /**
     * 监听touchMove 根据移动距离刷新pullState的值
     * @param event
     * @param dx
     * @param dy
     */
    onPanResponderMove (event, {dx, dy}) {
        if (this.state.pullState === 3) return

        if (dy > 0 && Math.abs(dx) < Math.abs(dy)) {
            this.state.pullTop.setValue(dy)

            if (this.props.loading) return

            if (dy < 64 && this.state.pullState !== 1) {
                this.setState({pullState: 1})
            }

            if (dy > 120 && this.state.pullState !== 2) {
                this.setState({pullState: 2})
            }
        } else if (this.state.pullState === 0) {
            this.scrollTo(dy * -1)
            // 恢复滚动
            if (!this.scrollEnabled) {
                this.setScrollEnabled(true)
            }
        }
    }

    /**
     * 手指释放 回弹及刷新处理
     */
    onPanResponderRelease () {
        if (this.state.pullTop._value !== 0 && this.state.pullState !== 3) {
            this.scrollTo(0)
            Animated.timing(this.state.pullTop, {
                toValue: this.state.pullState === 2 ? 60 : 0,
                easing: Easing.linear,
                duration: 300
            }).start(() => {
                if (this.state.pullState === 2) {
                    this.setState({pullState: 3})
                    this.props.onRefresh(() => {
                        this.setState({pullState: 0})
                        Animated.timing(this.state.pullTop, {
                            toValue: 0,
                            easing: Easing.linear,
                            duration: 300
                        }).start()
                    })
                } else {
                    this.setState({pullState: 0})
                }
            })
        }
    }

    /**
     * 绑定scroll事件 当scrollY === 0 时禁用滚动
     * @param event
     */
    onScroll (event) {
        if (event.nativeEvent.contentOffset.y <= 0 && this.scrollEnabled) {
            this.setScrollEnabled(false)
        }
    }

    /**
     * 获取容器大小
     * @param event
     */
    onLayout (event) {
        const {height} = event.nativeEvent.layout
        if (this.state.containerHeight !== height) {
            this.setState({containerHeight: height})
        }
    }

    render () {
        const {type, loading, hasMore, ...props} = this.props

        return (
            <View style={styles.container} onLayout={this.onLayout.bind(this)}>
                <Animated.View style={{top: this.state.pullTop, marginTop: -60}}>
                    <RefreshIndicator pullState={this.state.pullState}/>
                </Animated.View>
                <Animated.View style={[styles.fillParent, {top: this.state.pullTop}]}>
                    <ScrollView
                        {...this.panResponder.panHandlers}
                        {...props}
                        ref="scrollView"
                        style={{flex: 1}}
                        onScroll={this.onScroll.bind(this)}
                        scrollEventThrottle={10}
                        scrollEnabled={this.scrollEnabled}>
                        {type !== 'ScrollView' ? null : this.props.children}
                        <FooterComponent
                          containerHeight={this.state.containerHeight}
                          dataCount={this.props.data.length}
                          loading={loading && this.state.pullState !== 3}
                          hasMore={hasMore}/>
                    </ScrollView>
                </Animated.View>
            </View>
        )
    }
}
