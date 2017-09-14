import {ApiMap,panoramaUrl} from '../constants/Network';
import {ApiRequest, showErrorAlert} from './ApiRequest';
import {Base64} from './base64';

var apiRequest = new ApiRequest()

var LayoutTaskHandler = {
  currentTaskStatck: [],
  taskHistroy: [],
  //请求全景图渲染任务
 updateLayoutTaskId(layout, taskId){
   let tempLayout ;
   let extraData
   if (layout.extraData) {
      extraData = JSON.parse(layout.extraData) ;
      extraData && (extraData.ccid = taskId) ;
   } else {
     extraData = {ccid: taskId} ;
   }
   tempLayout = {...layout, extraData: JSON.stringify(extraData)}
   apiRequest.request(ApiMap.updateLayout, null, tempLayout, (status, responseData)=>{
      if (status) {

      } else {
        showErrorAlert(responseData);
      }
   })
 },

 postLayoutTask(layout){
    let body = {Queue:'layout', Data: JSON.stringify({layoutId: layout.id})};
    apiRequest.request(ApiMap.postTask, {}, body, (status, responseData)=>{
       if (status) {
            this.updateLayoutTaskId(layout, responseData.Id)
           let newTask = { ...body, Layout: layout, Id: responseData.Id, CreateTime: new Date()/1000} ;
           this.currentTaskStatck.push(newTask) ;
           this.getTaskRecordesFromLocalStorage( newTask, (tasks, theTask)=> this.saveTaskRecorde(tasks, theTask))
           //渲染任务存到 storage
       } else {
         showErrorAlert(responseData);
       }
    })
 },

  refreshTaskProcess(callback){
    this.currentTaskStatck.map((item, index, items)=>{
      apiRequest.request(ApiMap.getTaskResult, { queue: 'layout', taskId: item.Id}, null, (status, responseData)=>{
        if (status) {
          //结果存到 storage的渲染任务中
          if(responseData.IsSuccessed){
              // 遍历当前任务 删除已完成任务 ；
              (items.indexOf(item) > -1) && items.splice(index, 1) ;

              //更新layout数据
              apiRequest.request(ApiMap.getLayout, {version: item.Layout.id}, null, (status, responseData)=>{
                 if (status) {
                   let tempRecorde = { ...item, Layout: responseData};
                   let lastTask = this.taskRecordeFilter(this.taskHistroy, tempRecorde);
                   callback(lastTask)
                   //把结果更新到总的任务记录 和 本地
                   this.saveTaskRecorde(this.taskHistroy, tempRecorde) ;
                 } else {
                   showErrorAlert(responseData);
                 }
              })
          }else {

          }
          let tempRecorde = { ...item, ...responseData}
          let lastTask = this.taskRecordeFilter(this.taskHistroy, tempRecorde);
          callback(lastTask)

          //把结果更新到总的任务记录 和 本地
          this.saveTaskRecorde(this.taskHistroy, tempRecorde) ;
        } else {
          showErrorAlert(responseData);
        }
      })
    })
  },

//从本地进行取出任务记录
  getTaskRecordesFromLocalStorage(params, getStorageDataCallback){
    global.userInfo
    && global.userInfo.userName
    && global.storage.load({
      key: global.userInfo.userName,
      id: 'layoutTask',
    }).then((ret)=>{
      this.taskHistroy = ret;

      //遍历本地存储的没有任务 取出没有解决的任务 放到待处理任务队列
      !params && ret.map((item, index, items)=>{
        if(!item.result && !item.ErrorMsg && !item.IsSuccessed){
          this.currentTaskStatck = this.taskRecordeFilter(this.currentTaskStatck , item)
        }
      })
      getStorageDataCallback( ret, params)
    }).catch((err)=>{
      console.log('getTaskRecordesFromLocalStorage error ==> ', err);
      getStorageDataCallback( [], params)
      if(err){

      }
    })
  },

//添加或者更新 总的任务记录
  saveTaskRecorde(tasks, theTask){
    tasks = this.taskRecordeFilter(tasks, theTask)
    this.taskHistroy = tasks ;

    global.userInfo &&
    global.userInfo.userName &&
    global.storage.save({
       key: global.userInfo.userName,  //注意:请不要在key中使用_下划线符号!
       id: 'layoutTask',
       data: tasks
    });
  },

//更新或添加指定任务栈的任务记录
  taskRecordeFilter(tasks, theTask){
    let isRecorded = false ;
    tasks.map((item, index, items)=>{
        if (item &&  item.Id == theTask.Id) {
          isRecorded = true ;
          items[index] = JSON.parse(JSON.stringify(theTask))  ;
        }
    })
    !isRecorded && (tasks = [ theTask, ...tasks]) ;
    return [...tasks]
  }

}
export default LayoutTaskHandler
