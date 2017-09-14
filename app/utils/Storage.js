import { AsyncStorage } from 'react-native'
import Storage from 'react-native-storage'

var storage = new Storage({
    size: 1000, //最大容量
    storageBackend: AsyncStorage, //存储引擎，不指定的话重启后数据会丢失
    defaultExpires: null, //设置过期时间，为Null永不过期
    enableCache: true, //读写时在内存中缓存数据
})

global.storage = storage

export var SaveJPushMsg = {
    onCreateData(data) {
        if (global.userInfo) {
            this.getHistoricalNews(data, (res) => {
                storage.save({
                    key: global.userInfo.user_id,
                    id: 'JPushMsg',
                    data: res,
                    expires: null
                })
            })
        }
    },

    getHistoricalNews(message, callback) {
        storage.load ({
            key: global.userInfo.user_id,
            id: 'JPushMsg'
        }).then (ret => {
            callback([...ret, message])
        }).catch(err => {
            switch (err.name) {
                case 'NotFoundError':
                    callback([message])
                    break
                case 'ExpiredError':
                    break
            }
        })
    },
    
    //生成uuid
    // generateUUID() {
    //     let date = new Date().getTime()
    //     let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    //         let random = (date + Math.random() * 16) % 16 | 0
    //         date = Math.floor(date / 16)
    //         return (c == 'x' ? random : (random&0x7 | 0x8)).toString(16)
    //     })
    //     return uuid
    // }
}
