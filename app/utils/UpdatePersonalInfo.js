/**
 * Created by Traveller on 2017/4/10.
 */

import {ApiMap} from '../constants/Network'
import {ApiRequest} from '../utils/ApiRequest'

const updateUserInfo = (url, body, callback) => {

    if (typeof url != 'object' && typeof body != 'object')
        throw 'updateUserInfo -> url or body must a object';

    let {avatar, storageKey, mime, size} = body;
    let apiRequest = new ApiRequest();
    // 上传个人信息，response 只返回 200 和 true
    apiRequest.request(url, null, {avatar}, (status, res) => {
        if (status) {
            apiRequest.request(ApiMap.postUploadHead, {slug: 'headicon', storageKey: storageKey},
                {
                    FileName: storageKey,
                    Url: avatar,
                    MediaType: mime,
                    Size: size
                },
                (status, response) => {
                    // todo 确认 newId
                })
            callback();
        } else {
            throw `response -> ${JSON.stringify(res)} -> 网络请求失败`
        }
    });
    return;
}

export default updateUserInfo;
