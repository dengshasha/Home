/**
 * Toast组件
 * @author cstyles
 * @updater traveller
 * @content 1、调整上下居中样式
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Animated, Text, Platform} from 'react-native';

const styles = StyleSheet.create({
  container: {
    top: 64,
    left: 0,
    right: 0,
    overflow: 'hidden',
    position: 'absolute',
    backgroundColor: '#F33D5A',
  },
  textWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: fontSize(12),
  },
});

export default class Toast extends Component {
  static propTypes = {
    onLoad: PropTypes.func // load事件回调
  };

  constructor(props) {
    super(props);

    this.state = {
      isShow: false,
      text: '',
      locking: false,
      heightValue: new Animated.Value(0),
    };
    this.isAndroid = Platform.OS !== 'ios';
  }

  componentDidMount() {
    this.props.onLoad && this.props.onLoad(this);
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  /**
   * 展示Toast 公共函数
   * @param text {String} 文本
   * @param locking {Boolean} 是否锁定在头部 默认:false
   * @param inModal {Boolean} 是否是modal的子组件
   */
  show(text, locking = false, inModal = true) {
    const duration = this.isAndroid ? 2200 : 1500; // 展示时间

    this.setState({
      isShow: true,
      text,
      locking,
    });

    Animated.timing(this.state.heightValue, {
      toValue: 26 + (locking && !(this.isAndroid && inModal) ? 20 : 0),
      duration: 300,
    }).start(() => {
      this.isShow = true;
      if (duration !== 0) this.close(duration);
    });
  }

  /**
   * 关闭Toast 公共函数
   * @param duration {Number} 关闭延迟时间 默认:0
   */
  close(duration = 0) {
    if (!this.isShow && !this.state.isShow) return;

    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      Animated.timing(this.state.heightValue, {
        toValue: 0,
        duration: 300,
      }).start(() => {
        this.setState({isShow: false});
        this.isShow = false;
      });
    }, duration);
  }

  render() {
    return !this.state.isShow ? null : (
        <Animated.View
            style={[
              styles.container, {
                top: this.state.locking ? 0 : 64,
                height: this.state.heightValue,
              }]}
            pointerEvents="none">
          <View style={styles.textWrap}>
            <Text style={styles.text} numberOfLines={1}>{this.state.text}</Text>
          </View>
        </Animated.View>
    );
  }
}
