import {
    Platform,
} from 'react-native'

import JPushModule from 'jpush-react-native'

import { SaveJPushMsg } from './Storage'


// setTimeout(()=> {
    // console.log('setLocalNotification');
    // let data = {"msg_content":"{\"message_type\":\"activity_comment\",\"user_id\":\"153473264648\",\"msg\":\"{\\\"works_id\\\":258,\\\"activity_name\\\":\\\"空中花园改造家\\\",\\\"activity_id\\\":22,\\\"rating_author_name\\\":997089585450,\\\"rating_author_id\\\":\\\"朱明\\\",\\\"rating\\\":5.0}\"}","title":"activity_comment"};
    // JPushModule.setLocalNotification(Date.now()+5000 , '你收到一条未读消息', 0, '启动', 'notificationIdentify', data,null)
// },10)

export function JPushAddHandle(openCallback) {
   if (Platform.OS === 'android') {
       //在调用其它接收通知的接口之前，先调用这个接口
       JPushModule.notifyJSDidLoad(() => {})
   }

   //接收自定义消息
   JPushModule.addReceiveCustomMsgListener((map) => {
	   console.log('接收到自定义消息了')
	   let data
        if (Platform.OS === 'ios') {
            data = JSON.parse(map.content)//获取数据：{'message_type': 'xxx'}
	        SaveJPushMsg.onCreateData(data)
            JPushModule.setLocalNotification(Date.now()+2000 , '你收到一条未读消息', 0, '启动', 'notificationIdentify', data,null)
        } else if (Platform.OS === 'android'){
            data = JSON.parse(map.message)//获取数据：{'message_type': 'xxx'}
	        SaveJPushMsg.onCreateData(data)
        }
   })

   //接收通知事件
   JPushModule.addReceiveNotificationListener((map) => {
       console.log('接收到通知了')
   })

   //打开接收到的通知事件
   JPushModule.addReceiveOpenNotificationListener(() => {
       console.log('跳转啦啦啦')
       //在该事件里可以跳转到某个具体页面
       openCallback && openCallback()
   })
}

export function JPushRemoveHandle() {
    JPushModule.removeReceiveCustomMsgListener()
    JPushModule.removeReceiveNotificationListener()
    JPushModule.removeReceiveOpenNotificationListener()
    JPushModule.clearAllNotifications()
}
