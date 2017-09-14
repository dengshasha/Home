/*
created by melody 2017/7/27
支持ListView的下拉刷新和上拉加载更多
使用方法：传入onPullRelease()方法，当下拉刷新成功以后调用resolve()
onLoadMore()方法：在加载更多的时候根据情况修改upPullState的值，
upPullState=0：隐藏加载更多，每次加载完成以后需要将该值重置为0 1：正在加载中 2：没有多余的数据了
pullListText的值就是在没有多余数据时显示在底部的一条提示文字

例：<PullRefreshListView
        onPullRelease = {this.onPullRelease.bind(this)}
        contentContainerStyle = {{flexWrap: 'wrap',}}
        enableEmptySections={true}
        dataSource = {this.state.dataSource}
        renderRow = {this._renderRow.bind(this)}
        onLoadMore = {this._onLoadMore.bind(this)}
        upPullState = {this.state.footState}
        pullListText = {'没有更多评论了~'}
      />

    onPullRelease(resolve) { //下拉刷新数据
        fetch('xxx').then((response) => {
            //其他操作
            resolve()
        })
    }

    _onLoadMore() { //上拉加载更多
        if (this.state.footState != 0) return
        if (this.data.length < this.state.commentTotal) { //满足加载更多条件
            this.setState({ footState: 1 }) //footState = 1:加载中
            //其他操作
        } else {
            this.setState({ footState: 2 })//footState = 2:没有多的数据
        }
    }
*/

import React, { Component, PropTypes } from 'react'
import {
    ActivityIndicator,
    Animated,
    Easing,
    Image,
    ListView,
    PanResponder,
    StyleSheet,
    Text,
    Platform,
    TouchableOpacity,
    View
} from 'react-native'

import * as common from '../utils/CommonUtils'
import Colors from '../constants/Colors'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

export default class PullRefreshListView extends Component {
    static propTypes = {
        upPullState: PropTypes.number,
        onPullRelease: PropTypes.func.isRequired,
        pullListText: PropTypes.string,
        onLoadMore: PropTypes.func,
    }

    static defaultProps = {
        upPullState: 0,
        pullListText: '没有多的数据~'
    }

    constructor(props) {
        super(props)
        this.topIndicatorHeight = 60 //顶部刷新栏的高度
        this.pullOkMargin = 64 //下拉成功的距离
        this.defaultXY = {x: 0, y: this.props.processIconYPosition ? 0 : this.topIndicatorHeight * -1  } //动画初始值
        this.pullState = 0, //下拉刷新 0:隐藏 1：正在下拉 2：下拉完成 3：开始刷新（请求数据）
        this.state = {
            scrollEnabled: false,
            height: 0,
            pullPosition: new Animated.ValueXY(this.defaultXY),
            flag: this.pullState,
        }
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.onShouldSetPanResponder.bind(this), //用户开始触摸的时候，是否愿意成为响应者
            onMoveShouldSetPanResponder: this.onShouldSetPanResponder.bind(this), //如果view不是响应者，那么在触摸点开始移动时再询问一次，是否愿意响应
            onPanResponderGrant: () => {}, //获取响应授权成功时触发
            onPanResponderMove: this.onPanResponderMove.bind(this), //用户正在屏幕上移动手指
            onPanResponderRelease: this.onPanResponderRelease.bind(this),  //操作结束时触发
            onPanResponderTerminate: this.onPanResponderRelease.bind(this), //响应者权利已经交出
        })
        this.setFlag = this.setFlag.bind(this)
        this.onScroll = this.onScroll.bind(this)
        this.setFlag(this.pullState)
    }

    componentWillUpdate(nextProps, nextState) {
        // if (this.pullState == 3) {
        //     this.resetPanResponder()
        // }
    }

    //垂直手势
    isVerticalGesture(x, y) {
        return Math.abs(x) < Math.abs(y)
    }

    //上拉手势
    isUpGesture (x, y) {
        return y < 0 && (Math.abs(x) < Math.abs(y));
    }

    //下拉手势
    isDownGesture(x, y) {
        return y > 0 && Math.abs(x) < Math.abs(y)
    }

    //询问能否响应手势
    onShouldSetPanResponder(event, gesture) {
        //gesture.dx|dy: 手势的横向纵向相对位移
        if (!this.isVerticalGesture(gesture.dx, gesture.dy)) { //不是垂直手势不响应
            return false
        }
        if (!this.state.scrollEnabled) { //Listview还不能滚动
            this.lastY = this.state.pullPosition.y._value;
            return true
        } else {
            return false
        }
    }

    //手势开始移动
    onPanResponderMove(event, gesture) {
        if (this.isDownGesture(gesture.dx, gesture.dy)) {
            this.state.pullPosition.setValue({
                x: 0,
                y: this.lastY + gesture.dy / 2
            })
            if (gesture.dy < this.topIndicatorHeight + this.pullOkMargin) {
                //下拉到一定距离才会触发刷新，这里是正在下拉，还未到位
                this.setFlag(1)
            } else {
                //下拉完成
                this.setFlag(2)
            }
        } else if (this.isUpGesture(gesture.dx, gesture.dy)) {
            if(this.isPullState()) {
                this.resetPanResponder()
            } else {
                this.scroll.scrollTo({x:0, y: gesture.dy * -1})
            }
            return
        }
    }

    //松开手势
    onPanResponderRelease(event, gesture) {
        if (this.pullState == 1) { //没有下拉到位，重置状态
            this.resetPanResponder()
        }
        if (this.pullState == 2) {
            //完成下拉，开始后续操作
            //用户可能下拉了很长距离，先回到初始位置
            Animated.timing(this.state.pullPosition, {
                toValue: {x: 0, y: this.props.processIconYPosition ? this.props.processIconYPosition : 0},
                easing: Easing.linear,
                duration: 400
            }).start(() => {
                this.setFlag(3)
                this.props.onPullRelease(()=>this.resolveHandler())
            })

        }
    }

    //重置
    resetPanResponder() {
        setTimeout(() => {
            this.setFlag(0)
            Animated.timing(this.state.pullPosition, {
                toValue: this.defaultXY,
                easing: Easing.linear,
                duration: 300
            }).start()
        }, 500)

    }

    resolveHandler() {
        if (this.pullState == 3) {
            this.resetPanResponder()
        }
    }

    isPullState() {
        return this.pullState == 1 || this.pullState == 2 || this.pullState == 3
    }

    setFlag(pullState) {
        if (this.pullState != pullState) {
            this.pullState = pullState
            this.renderTopIndicator()
        }
    }

    onLayout(event) {
        /*在页面挂载（mount）或布局改变时调用：{nativeEvent: { layout: {x, y, width, height}}}*/
        if (this.state.height != event.nativeEvent.layout.height) {
            this.scrollContainer.setNativeProps({style: {height: event.nativeEvent.layout.height}})
        }
    }

    onScroll(event) {
        //listview滚动
        if (event.nativeEvent.contentOffset.y <= 0) { //当listview没有发生滚动时，禁用Listview的滚动
            this.setState({scrollEnabled: false})
            let position = event.nativeEvent.contentOffset.y
            this.props.scrollToDown && this.props.scrollToDown(position)
        } else if (!this.isPullState()) { //当刷新视图不处于任何一个刷新状态时，listview恢复滚动
            this.setState({ scrollEnabled: true })
            let position = event.nativeEvent.contentOffset.y
            this.props.scrollToDown && this.props.scrollToDown(position)
        }
    }

    onLoadMore() {
        this.props.onLoadMore && this.props.onLoadMore()
    }

    renderTopIndicator() {
        setTimeout(() => {
            switch(this.pullState) {
                case 1:
                    this.txtPulling && this.txtPulling.setNativeProps({style: styles.show})
                    this.txtPullok && this.txtPullok.setNativeProps({style: styles.hide})
                    this.txtPullrelease && this.txtPullrelease.setNativeProps({style: styles.hide})
                    break
                case 2:
                    this.txtPulling && this.txtPulling.setNativeProps({style: styles.hide})
                    this.txtPullok && this.txtPullok.setNativeProps({style: styles.show})
                    this.txtPullrelease && this.txtPullrelease.setNativeProps({style: styles.hide})
                    break
                case 3:
                    this.txtPulling && this.txtPulling.setNativeProps({style: styles.hide})
                    this.txtPullok && this.txtPullok.setNativeProps({style: styles.hide})
                    this.txtPullrelease && this.txtPullrelease.setNativeProps({style: styles.show})
                    break
                default:
                    //default语句不需要break
                    this.txtPulling && this.txtPulling.setNativeProps({style: styles.hide})
                    this.txtPullok && this.txtPullok.setNativeProps({style: styles.hide})
                    this.txtPullrelease && this.txtPullrelease.setNativeProps({style: styles.hide})
            }
        }, 1)
        return(
            <View style={{justifyContent: 'center', alignItems: 'center', height: this.topIndicatorHeight}}>
                <Text style = {styles.refreshText} ref={(c) => this.txtPulling = c}>下拉刷新</Text>
                <Text style = {styles.refreshText} ref={(c) => this.txtPullok = c}>松开刷新</Text>
                <View ref={(c) => this.txtPullrelease = c}>{/*style = {styles.refreshIcon}*/}
                    <Image source={require('../images/activity/load.gif')} style = {{width: 60, height: 50}}/>
                    {/*<ActivityIndicator size="small" color='#F33B58' />*/}
                </View>
            </View>
        )
    }

    _renderFooter() {
        if (this.props.upPullState == 1) {
            return (
                <View style = {styles.tipsContainer}>
                    <Image source={require('../images/activity/load.gif')} style = {{width: 60, height: 50}}/>
                    {/*<View style = {styles.refreshIcon}>
                        <ActivityIndicator size="small" color='#F33B58' />
                    </View>*/}
                </View>
            )
        } else if (this.props.upPullState == 2) {
            return(
                <View style = {styles.tipsContainer}>
                    <Text style = {styles.tipsText}>{this.props.pullListText}</Text>
                </View>
            )
        }
        return null
    }

    render() {
        return(
            <View style = {styles.allContainer} onLayout = {this.onLayout.bind(this)}>
                <Animated.View style = {this.state.pullPosition.getLayout()}>
                    {this.renderTopIndicator()}
                    <View
                        ref = {(scroll) => this.scrollContainer = scroll}
                        style = {{width: deviceWidth, height: this.state.height}}
                        {...this._panResponder.panHandlers}
                    >
                        <ListView
                            ref = {(scroll) => this.scroll = scroll}
                            scrollEnabled = {this.state.scrollEnabled}
                            onScroll = {this.onScroll}
                            onEndReached = {() => this.onLoadMore()}
                            onEndReachedThreshold = {10}
                            renderFooter = {this._renderFooter.bind(this)}
                            {...this.props}
                        />
                    </View>
                </Animated.View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    allContainer: {
        flex: 1
    },
    hide: {
        position: 'absolute',
        left: 10000
    },
    show: {
        position: 'relative',
        left: 0
    },
    //下拉刷新样式
    refreshText: {
        color: 'rgba(0,0,0,0.3)',
        fontSize: 12,
    },
    refreshIcon: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15 / 667 * deviceHeight,
        height: 30 / 667 * deviceHeight,
        justifyContent: 'center',
        width: 30 / 667 * deviceHeight,
    },
    tipsContainer: {
        alignItems: 'center',
        height: 60 / 667 * deviceHeight,
        justifyContent: 'center',
        width: deviceWidth,
    },
    tipsText: {
        color: Colors.midGrey,
        fontSize: 12,
    },
})
