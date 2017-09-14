/**
 * 可下拉刷新的视图 支持 ScrollView FlatList SectionList
 * @author cstyles
 * @example <RefreshableView type={enum('ScrollView', 'FlatList', 'SectionList')} onRefresh={...}  {...props}/>
 * @description 其他的props请查看官方文档
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, ScrollView, Animated } from 'react-native'
import RefreshIndicator from './RefreshIndicator'
import FooterComponent from './FooterComponent'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent'
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
            scrollY: new Animated.Value(0),
            pullState: 0, // 下拉状态 0: 等待下拉 1: 下拉中 2: 下拉完成 3: 开始刷新
            containerHeight: 0
        }

        this.animatedEvent = Animated.event([
            {
                nativeEvent: {
                    contentOffset: {
                        y: this.state.scrollY
                    }
                }
            }
        ])
    }

    componentDidMount () {
        this.state.scrollY.addListener(({value}) => this.onScroll(value))
    }

    componentWillUnmount () {
        this.state.scrollY.removeAllListeners()
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
     * 绑定scroll事件 根据scrollY刷新pullState的值
     * @param y
     */
    onScroll (y) {
        if (this.props.loading) return

        if (y >= 0 && this.state.pullState !== 0) {
            this.setState({pullState: 0})
        }

        if (this.state.pullState === 3 || this.state.pullState === -1) return

        if (y < -120 && this.state.pullState !== 2) {
            this.setState({pullState: 2})
        } else if (y > -120 && y < 0 && this.state.pullState !== 1) {
            this.setState({pullState: 1})
        }
    }

    /**
     * 手指释放 检测是否能触发refresh
     */
    onResponderRelease () {
        if (this.state.pullState === 2) {
            this.scrollTo(-60)
            this.setState({pullState: 3})
            this.props.onRefresh(() => {
                this.scrollTo(0)
                this.setState({pullState: -1})
            })
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
        const {loading, hasMore, ...props} = this.props

        return (
            <View style={styles.container} onLayout={this.onLayout.bind(this)}>
                <ScrollView
                    {...props}
                    ref="scrollView"
                    style={{flex: 1}}
                    onScroll={this.animatedEvent}
                    scrollEventThrottle={10}
                    scrollEnabled={this.state.pullState !== 3}
                    onResponderRelease={this.onResponderRelease.bind(this)}>
                    <RefreshIndicator pullState={Math.max(this.state.pullState, 0)}/>
                    {this.props.children}
                    <FooterComponent
                      containerHeight={this.state.containerHeight}
                      dataCount={this.props.data.length}
                      loading={loading && this.state.pullState !== 3}
                      hasMore={hasMore}/>
                </ScrollView>
            </View>
        )
    }
}
