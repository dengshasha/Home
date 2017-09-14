/**
 * Created by Traveller on 2017/4/13.
 * 获取用户更多详情信息，并持久化存储到storage中
 */
import { ApiMap } from '../constants/Network';
import { ApiRequest, showErrorAlert } from '../utils/ApiRequest';

export default GetUserInfo = (cb) => {
    let apiRequest =  new ApiRequest();
     return apiRequest.request(ApiMap.getUserInfo, null, null, (status, res) => {
        let avatar = res.avatar;
        if (status && avatar) {
            global.userInfo = Object.assign({}, global.userInfo, res);
            global.storage.save({
                key: 'userInfo',  //注意:请不要在key中使用_下划线符号!
                data: { userInfo: Object.assign({}, global.userInfo, res) },
            });
            cb && cb();
        }
    })
}
