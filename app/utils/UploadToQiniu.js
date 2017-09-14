import {ApiRequest, showErrorAlert} from './ApiRequest';
import Slug from '../constants/Slug'
import {ApiMap} from '../constants/Network';
var apiRequest = new ApiRequest();
const QiniuIp = 'http://upload.qiniu.com/' ;

const UploadToQiniu = {

  uploadHeadIcon(file, callback){
    this.getTokenWithSlug(Slug.headicon, (response) => this.request({file, token: response.token} ,callback))
  },

  uploadLayoutImage(file, callback){
    this.getTokenWithSlug(Slug.layout, (response)=> this.request( {file, token: response.token} ,callback))
  },

  uploadDesignshot(file, callback){
    this.getTokenWithSlug(Slug.designshot, (response)=> this.request( {file, token: response.token} ,callback))
  },
  getTokenWithSlug(inputSlug, callback){
    let param = {fileName: 'qiniufile', slug: inputSlug};
    // 获取token
    apiRequest.request(ApiMap.getQiniuToken, param, null, (status, response)=>{
      if (status) {
        callback(response)
      } else {
        showErrorAlert(response)
      }
    })
  },

  _getDataFromResponse(response){
      let contentTypeArr = response.headers && response.headers.map && response.headers.map["content-type"];
      let contentType = Array.isArray(contentTypeArr) ? contentTypeArr[0] : contentTypeArr;
      if ( contentType.includes('json')) {
        return response.json()
      } else if(contentType.includes('text')){
        return response.text()
      } else if(contentType.includes('javascript')){
        return response.text()
      }
  },

  _hasResponseData(response){
      let contentLengthArr = response.headers && response.headers.map && response.headers.map["content-length"];
      let contentLength = contentLengthArr && contentLengthArr[0];
      return contentLength > 0 ;
  },

  request(body, callback){
          let method  = 'POST' ;
          let url     =  QiniuIp;
          let headers = {'Accept': 'application/json', 'content-type': 'multipart/form-data'};
          let formData = new FormData();
          (body.key != null ) && formData.append('key', key);
          formData.append('token', body.token);
          formData.append('file', body.file)

          let isOk;
          let timeout = false;
          const timeoutId = setTimeout(() => {
            timeout = true;
            callback( false, {message: '请求超时'})
          }, 50000);
           fetch(url, {
              method: method,
              headers: headers,
              body: formData,
            })
            .then((response) => {
                console.log('ApiRequestResponse:', response );
                isOk = response.ok;
                if ( this._hasResponseData(response)) {
                  return this._getDataFromResponse(response)
                }
            })
            .then((responseData) => {
               console.log('ApiRequestResponseData:',responseData );
              !timeout && callback( isOk, responseData)
              timeoutId && clearTimeout(timeoutId);
            })
            .catch((error) => {
                console.log('ApiRequestError:', error)
                !timeout && callback( isOk, error)
                timeoutId && clearTimeout(timeoutId);
            });
  },

  showErrorAlert(arg0) {


    let errorTitle = '操作失败！';
    let errorMessage;
    if(arg0.modelState) {
      let modelState = arg0.modelState;
      let keys = Object.keys(modelState);
      let errorKey = keys[0];
      let errorContent = modelState[errorKey];
      errorMessage = errorContent[0];
    } else if (arg0.message) {
      errorMessage = arg0.message;
    } else if(arg0.error) {
      errorMessage = arg0.error_description;
    }
    Alert.alert(errorTitle, errorMessage, [{text: '好'},]);

  }

}

export default UploadToQiniu;
