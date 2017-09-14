/**
 * 自定义导航
 * @author cstyles
 * @props title {String} 标题
 * @props headerLeft {Function|Element} 导航栏左边组件
 * @props headerRight {Function|Element} 导航栏右边组件
 * @props opacity {Number|Object} 导航栏透明度
 * @props onBack {Function} 返回按钮点击事件 传递该参数才显示返回按钮
 */
import React, { Component } from 'react'
import { Platform } from 'react-native'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native'

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 64 : 44,
    backgroundColor: '#fff',
    borderBottomColor: 'rgba(0,0,0,.3)',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  floor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  box: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    zIndex: 2,
    height: 44,
  },
  title: {
    position: 'absolute',
    left: 44,
    right: 44,
    bottom: 0,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: fontSize(16),
    fontWeight: '400',
    color: '#222',
    backgroundColor: 'transparent',
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: 'transparent',
  },
})

export default class CustomHeader extends Component {
  static propTypes = {
    title: PropTypes.string,
    headerLeft: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element,
      PropTypes.array,
    ]),
    headerRight: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element,
      PropTypes.array,
    ]),
    onBack: PropTypes.func,
  }

  static defaultProps = {
    opacity: 1,
  }

  renderHeaderLeft () {
    const {onBack} = this.props
    const elements = []

    if (onBack) {
      // 返回上一页按钮
      elements.push(
        <TouchableOpacity key="back" onPress={onBack}>
          <View style={styles.back}>
            <Image source={require(
              '../../images/common/icon_back_black.png')}/>
          </View>
        </TouchableOpacity>,
      )
    }

    return elements
  }

  render () {
    const {title, headerLeft, headerRight} = this.props

    return (
      <View style={[styles.container]}>
        <View style={styles.box}>
          <View style={[styles.menu, {left: 0}]}>
            {headerLeft ? headerLeft() : this.renderHeaderLeft()}
          </View>
          <View style={styles.title}>
            <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
          </View>
          <View style={[styles.menu, {right: 0}]}>
            {headerRight
              ? typeof headerRight === 'function'
                ? headerRight()
                : headerRight
              : null}
          </View>
        </View>
      </View>
    )
  }
}
