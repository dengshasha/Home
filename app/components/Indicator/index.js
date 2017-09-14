/**
 * Indicator 加载提示框
 * @author cstyles
 * @example import instance, {Indicator} from '~/app/components/Indicator'
 * @example instance.show('正在加载...')
 * @example instance.close()
 * @example <IndicatorComponent ref={(instance) => this.indicator = indicator} />
 * @example this.indicator... 同上
 */
import React from 'react';
import RootSiblings from 'react-native-root-siblings';
import Component from './Indicator';

export const Indicator = Component;

export default {
  // indicator 实例
  instance: null,
  /**
   * 展示Indicator
   * @param text {String} 文本内容
   */
  show(text = '') {
    if (!this.instance) {
      new RootSiblings(<Indicator onLoad={(instance) => { // eslint-disable-line
        instance.show(text);
        this.instance = instance;
      }}/>);
    } else {
      this.instance.show(text);
    }
  },
  /**
   * 关闭Indicator
   */
  close() {
    if (this.instance) this.instance.close();
  },
};
