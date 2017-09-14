/**
 * Toast (简短的消息提示框，支持自定义位置、持续时间。)
 * @author cstyles
 * @example import toast, {Toast} from '~/app/components/Toast'
 * @example toast.show('注册成功')
 * @example toast.show('注册成功', true)
 * @example toast.close()
 * @example <Toast ref={(instance) => this.toast = instance} />
 * @example this.toast... 同上
 */
import React from 'react'
import RootSiblings from 'react-native-root-siblings'
import Component from './Toast'

export const Toast = Component

export default {
    // toast 实例
    instance: null,
    /**
     * 展示Toast
     * @param text {String} 文本
     * @param locking {Boolean} 是否锁定在头部 默认:false
     */
    show (text, locking = false) {
        if (!this.instance) {
            new RootSiblings(<Component onLoad={(instance) => {  // eslint-disable-line
                instance.show(text, locking, false)
                this.instance = instance
            }}/>)
        } else {
            this.instance.show(text, locking, false)
        }
    },
    /**
     * 关闭Toast
     */
    close () {
        if (this.instance) this.instance.close()
    }
}
