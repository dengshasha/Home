import { ApiMap, panoramaUrl } from '../constants/Network'
import { ApiRequest, showErrorAlert } from './ApiRequest'
import SchemeHandler from './SchemeHandler'
import { Base64 } from './base64'

var apiRequest = new ApiRequest()

var PanoramaTaskHandler = {
    currentTaskStatck: [],
    taskHistroy: [],
    renderTasks: [],
    taskCount: 0,

    //请求全景图渲染任务
    postPanoramaTask(scheme, callback){
        let {id, dnaId, activityId, userTags, originSchemeId} = scheme
        let body = {
            queue: 'p360',
            userAccount: global.userInfo.userName,
            userTags,
            data: JSON.stringify({
                schemeId: id,
                suite: SchemeHandler.hasMutableCaptures(scheme),
                dnaId: dnaId,
                activityId,
                originSchemeId,
                released: false
            })
        }

        apiRequest.request(ApiMap.postTask, {}, body, (status, responseData) => {
            if (status) {
                if (callback) callback()
            } else {
                showErrorAlert(responseData)
            }
        })
    },

    /**
     * 刷新任务记录
     * @param pages 获取渲染记录的页数 默认第一页
     * @param callback 回调函数
     */
    refreshTaskProcess(pages, callback){
        /**
         * 调用新的接口，获取渲染队列的任务
         * */
        apiRequest.request(ApiMap.getTaskSearch, {
            queue: 'p360',
            account: global.userInfo.userName,
            pages: pages ? pages : 1
        }, null, (status, tasksData) => {
            if (status) {
                this.renderTasks = tasksData.data;
                this.taskCount = tasksData.count
                // 取得渲染队列里的数据 过滤掉删除的任务
                if (callback) callback()
            }
        })
    },

    /**
     *
     * @param taskId 渲染任务id
     * @param patchObj 更新对象
        {
          "id": 1,
          "businessId": 2,
          "queue": "sample string 3",
          "data": "sample string 4",
          "result": "sample string 5",
          "createTime": 16,
          "takeTime": 7,
          "finishTime": 8,
          "processSeconds": 0,
          "workerId": 9,
          "uniqueId": "sample string 10",
          "isSuccessed": true,
          "errorMsg": "sample string 12",
          "userAccount": "sample string 13",
          "userTags": [
            "sample string 1",
            "sample string 2"
          ],
          "timeOutSeconds": 14,
          "statue": 0,
          "isChecked": true,
          "gmtCreate": 16,
          "gmtModify": 17
        }
     * @param callback
     */
    patchTask(taskId, patchObj, callback) {
        if (typeof patchObj !== 'object') console.error('patchObj must ba an Object')
        apiRequest.request(ApiMap.patchTask, {id: taskId}, patchObj, (status, res) => {
            if (status) {
                if (callback) {
                    callback()
                }
            } else {
                console.log(res)
            }
        })
    },

    // 从本地删除渲染任务
    deletePanoramaTask(deleteTaskId, callback) {
        // todo 从数据库中删除渲染数据
        apiRequest.request(ApiMap.cancleTask, {deleteTaskId}, null, (status) => {
            if (status) {
                if (callback) callback()
            } else {
                showErrorAlert(status)
            }
        })
    },

    // 重新渲染任务
    rePostPanoramaTask(scheme, callback) {
        let {data} = scheme
        let body = {queue: 'p360', userAccount: global.userInfo.userName, data: data, userTags: scheme.userTags}
        apiRequest.request(ApiMap.postTask, null, body, (status, resData) => {
            if (status) {
                // 删除失败的任务
                this.deletePanoramaTask(scheme.id, () => {
                    if (callback) callback()
                })
            }
        })
    },

    getPanoramaResult(str){
        let images
        try {
            if (!str.includes('http://pano.vidahouse.com')) {
                let tempPanoramaUrl = str.split('&')[0]
                if (tempPanoramaUrl.length == 28) {
                    images = panoramaUrl + 'res=' + tempPanoramaUrl + '&resType=p&bar=show'
                } else if (str.length > 28) {
                    images = (new Base64()).decode(tempPanoramaUrl)
                }
            }
            return images
        } catch (e) {
            return panoramaUrl
        } finally {

        }
    },

    getResultPanorama(str){
        let images
        try {
            if (!str.includes('http://pano.vidahouse.com')) {
                let tempStr = str.split('&')[0]
                if (tempStr.length == 28) {
                    images = panoramaUrl + 'res=' + tempStr + '&resType=p&bar=show&logo=false'
                } else if (str.length > 28) {
                    images = panoramaUrl.split('&')[0] + 'res=' + tempStr + '&resType=sd&bar=show&logo=false'
                }
            }
            return images
        } catch (e) {
            return panoramaUrl
        }
    },
    getResultNewSchemeId(str){
        try {
            if (!str.includes('http://pano.vidahouse.com')) {
                let params = str.split('&')
                let newSchemeId
                if (params.length === 2) {
                    newSchemeId = params[1].split('=')[params[1].split('=').length - 1]
                    return newSchemeId
                }
            }
            return null
        } catch (e) {
            return null
        }
    },
}
export default PanoramaTaskHandler
