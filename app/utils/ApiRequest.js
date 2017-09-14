// import {actions} from '../redux/Actions';
// import {apiMap} from '../constants/Network';
import {
	Alert,
	DeviceEventEmitter
} from "react-native";
// import store from '../redux/configure-store';
// import {apiHistory} from '../tool/ApiHistory'
import * as common from './CommonUtils';
import CustomeEvent from '../constants/CustomeEvent'

export class ApiRequest {

	// constructor(props) {
	//   super(props)
	//
	// }
	_getUrl (apiInfo, parameter) {
		var url = apiInfo.url;
		if (parameter) {
			var tempParameter = {};//storageKey
			tempParameter.activityId = parameter.activityId ? parameter.activityId : '';

			tempParameter.userName = parameter.userName ? parameter.userName : '';
			tempParameter.deletTaskId = parameter.deletTaskId ? parameter.deletTaskId : '';

			tempParameter.owner = parameter.owner ? '/owner' : '';
			tempParameter.shared = parameter.shared ? '/shared' : '';
			tempParameter.incoming = parameter.incoming ? '/shared/incoming' : '';

			tempParameter.version = parameter.version ? '/version/' + parameter.version : '';
			tempParameter.id = parameter.id ? '/' + parameter.id : '';

			tempParameter.index = (parameter.index || parameter.size || parameter.keyword || parameter.orderBy ||  parameter.category ) ? '?index=' + (parameter.index ? parameter.index : 1 ) : '';
			tempParameter.size = parameter.size ? '&Size=' + parameter.size : '';
			tempParameter.keyword = parameter.keyword ? '&Keyword=' + parameter.keyword : '';
			tempParameter.orderBy = parameter.orderBy ? '&OrderBy=' + parameter.orderBy : '';

			tempParameter.category = parameter.category ? '&category=' + parameter.category : '';

			tempParameter.userIds = parameter.userIds ? '?userIds=' + parameter.userIds : '';
			tempParameter.referenceDNA = (parameter.schemeVersionId && parameter.dnaVersionId) ? '?schemeVersionId=' + parameter.schemeVersionId + '&dnaVersionId=' + parameter.dnaVersionId : '';
			tempParameter.CCode = parameter.CCode ? '?CCode=' + parameter.CCode : '';
			tempParameter.Nonce = parameter.Nonce ? '?nonce=' + parameter.Nonce : '';
			tempParameter.Code = parameter.Code ? '&Code=' + parameter.Code : '';
			tempParameter.PhoneNumber = parameter.PhoneNumber ? '&phoneNumber=' + parameter.PhoneNumber : '';
			tempParameter.verifyCode = parameter.verifyCode ? '&verifyCode=' + parameter.verifyCode : '';
			tempParameter.boundId = parameter.boundId ? '?boundId=' + parameter.boundId : '';
			tempParameter.collectId = parameter.collectId ? parameter.collectId : '';
			tempParameter.likeId = parameter.likeId ? parameter.likeId : '';
			//wechat
			tempParameter.appid = parameter.appid ? '?appid=' + parameter.appid : '';
			tempParameter.secret = parameter.secret ? '&secret=' + parameter.secret : '';
			tempParameter.code = parameter.code ? '&code=' + parameter.code : '';
			tempParameter.grant_type = parameter.grant_type ? '&grant_type=' + parameter.grant_type : '';

			tempParameter.slug = parameter.slug ? '?slug=' + parameter.slug : '';
			tempParameter.fileName = parameter.fileName ? '&fileName=' + parameter.fileName : '';
			tempParameter.storageKey = parameter.storageKey ? '&storageKey=' + parameter.storageKey : '';

			tempParameter.queue = parameter.queue ? '?queue=' + parameter.queue : '';
			tempParameter.taskId = parameter.taskId ? '&id=' + parameter.taskId : '';
			tempParameter.userInfo = parameter.userInfo ? 'queue=p360&account=' + parameter.userInfo : '';

			tempParameter.publishId = parameter.publishId ? '/publish?id=' + parameter.publishId : '';

			//社区
			tempParameter.communityWorkId = parameter.workId ? parameter.workId : '';
			tempParameter.communityUserId = parameter.communityUserId ? '/' + parameter.communityUserId : '';

			tempParameter.communityTargetId = parameter.communityTargetId ? parameter.communityTargetId : '';
			tempParameter.communitySortType = parameter.communitySortType ? '&sort_type=' + parameter.communitySortType : '';
			tempParameter.communityTargetType = parameter.communityTargetType ? '&target_type=' + parameter.communityTargetType : '';
			tempParameter.communityTargetId_ = parameter.communityTargetId_ ? '&target_id=' + parameter.communityTargetId_ : '';
			tempParameter.deleteCommentId = parameter.deleteCommentId ? '/' + parameter.deleteCommentId : '';
			tempParameter.reportCommentId = parameter.reportCommentId ? '?comment_id=' + parameter.reportCommentId : '';
			tempParameter.reportReason = parameter.reportReason ? '&report_reason=' + parameter.reportReason : '';
			tempParameter.worksId = parameter.worksId ? parameter.worksId : '';
			tempParameter.dnaCode = parameter.dnaCode ? parameter.dnaCode : '';
//v2
			tempParameter.communityWorksOfUserId = parameter.communityWorksOfUserId ? '/user/' + parameter.communityWorksOfUserId + '/works' : '';
			tempParameter.communityWorksOfActivityId = parameter.worksOfActivityId ? '/' + parameter.worksOfActivityId + '/works' : '';
			tempParameter.communitySchemesOfActivityId = parameter.communitySchemesOfActivityId ? '/' + parameter.communitySchemesOfActivityId + '/scheme' : '';
			tempParameter.communityUploadInfoOfActivityId = parameter.communityUploadInfoOfActivityId ? '/' + parameter.communityUploadInfoOfActivityId + '/upload/info' : '';

			tempParameter.activityRatingId = parameter.activityRatingId ? parameter.activityRatingId + '/rating' : '';
			tempParameter.activityWorksId = parameter.activityWorksId ? parameter.activityWorksId + '/rating/trend' : '';

			tempParameter.activityUserId = parameter.activityUserId ? parameter.activityUserId + '/works' : ''; //?user_id=' + parameter.activityUserId + '&limit=20&offset=' + parameter.communityIndex : '';
			//极光
			tempParameter.jpushUserId = parameter.jpushUserId ? '?userID=' + parameter.jpushUserId : '';
			tempParameter.jpushMsgType = parameter.jpushMsgType ? '/' + parameter.jpushMsgType : ''; // '?limit=20&offset=0'
			tempParameter.jpushMsgId = parameter.jpushMsgId ? '/' + parameter.jpushMsgId + '/read' : '';

			tempParameter.communityStart = parameter.communityIndex >= 0 ? '?offset=' + (parameter.communityIndex - 1) * (parameter.communityLength ? parameter.communityLength : 20) : '';
			tempParameter.communityLength = parameter.communityIndex >= 0 ? (parameter.communityLength ? '&limit=' + parameter.communityLength : '&limit=20') : '';
			tempParameter.jpushReadStatus = (parameter.jpushReadStatus !== undefined) ? '&read_status=' + parameter.jpushReadStatus : ''; //未读消息状态
			tempParameter.order = parameter.order ? '&order=' + parameter.order : '';
			tempParameter.activityRating = parameter.activityRatingId ? '&works_id=' + parameter.activityRatingId : '';
			tempParameter.activityUser = parameter.activityUserId ? '&user_id=' + parameter.activityUserId : '';
			tempParameter.activityRateUserId = parameter.activityRateUserId ? parameter.activityRateUserId : '';
			tempParameter.activityRateWorkId = parameter.activityRateWorkId ? '/works/' + parameter.activityRateWorkId + '/rating' : '';

			tempParameter.activityWorkId = parameter.activityWorkId ? parameter.activityWorkId : '';

			tempParameter.activity_id = parameter.activity_id ? '&activity_id=' + parameter.activity_id : '';
			tempParameter.order_condition = parameter.order_condition ? '&order_condition=' + parameter.order_condition : '';
			tempParameter.order_by = parameter.order_by ? '&order_by=' + parameter.order_by : '';

			tempParameter.queueName = parameter.queueName ? '?name=' + parameter.queueName : '';
			tempParameter.account = parameter.account ? '&account=' + parameter.account : '';
			tempParameter.deleteTaskId = parameter.deleteTaskId ? '&id=' + parameter.deleteTaskId : ''

			tempParameter.activityCategory = parameter.activityCategory ? '&category=' + parameter.activityCategory : '';

			tempParameter.activityDnaUserId = parameter.activityDnaUserId ? parameter.activityDnaUserId + '/dna' : '';

			tempParameter.accessToken = parameter.accessToken ? 'access_token=' + parameter.accessToken : '';
			tempParameter.openId = parameter.openId ? '&openid=' + parameter.openId : '';
			Object.values (tempParameter).forEach ((value)=> {
				url += value
			})
		}
		return url;
	}

	_getDataFromResponse (response) {
		let contentTypeArr = response.headers && response.headers.map && response.headers.map["content-type"];
		let contentType = Array.isArray (contentTypeArr) ? contentTypeArr[0] : contentTypeArr;

		if (contentType.includes ('json')) {
			return response.json ()
		} else if (contentType.includes ('text')) {
			return response.text ()
		} else if (contentType.includes ('javascript')) {
			return response.text ()
		}
	}

	_getContentTypeFromResponse (response) {
		let contentTypeArr = response.headers && response.headers.map && response.headers.map["content-type"];
		let contentType = contentTypeArr ? (Array.isArray (contentTypeArr) ? contentTypeArr[0] : contentTypeArr) : 'text';

		if (contentType.includes ('json')) {
			return 'json'
		} else if (contentType.includes ('text')) {
			return 'text'
		} else if (contentType.includes ('javascript')) {
			return 'text'
		}
	}

	_getBody (apiInfo, body) {
		if (apiInfo.name == 'register') {
			return 'client_id=' + body.client_id + "&userName=" + body.userName + '&NickName=' + body.NickName + "&password=" + body.password + "&ConfirmPassword="
				+ body.ConfirmPassword + "&CCode=" + body.CCode + "&PhoneNumber=" + body.PhoneNumber + "&Code=" + body.Code + "&client_secret=" + body.client_secret;
		} else if (apiInfo.name == 'loginVerify') {
			return "CCode=" + body.CCode + "&PhoneNumber=" + body.PhoneNumber;
		} else if (apiInfo.name == 'login') {
			var email = body.email ? '&Email=' + body.email : '';
			var confirmPassword = body.password ? '&ConfirmPassword=' + body.password : '';
			return `client_id=${body.client_id}&grant_type=password&username=${body.username}&password=${body.password}&useSign=0&device_id=${body.device_id}&client_secret=${body.client_secret}`;
		} else if (apiInfo.name == 'vertifyLogin') {
			var ccode = body.ccode ? '&ccode=' + body.ccode : '';
			var verifyCode = body.verifyCode ? '&verifyCode=' + body.verifyCode : '';
			var phoneNumber = body.phoneNumber ? '&phoneNumber=' + body.phoneNumber : '';
			return `client_id=${body.client_id}` + "&grant_type=verifyCode" + ccode + phoneNumber + verifyCode + `&device_id=${body.device_id}&client_secret=${body.client_secret}`;
		} else if (apiInfo.name == 'wechatLogin') {
			var clientSecret = body.clientSecret ? '&client_secret=' + body.clientSecret : '';
			var clientId = body.clientId ? 'client_id=' + body.clientId : '';
			var device_id = body.device_id ? '&device_id=' + body.device_id : '';
			var provider = body.provider ? '&provider=' + body.provider : '';
			var openId = body.openId ? '&openId=' + body.openId : '';
			var appId = body.appId ? '&appId=' + body.appId : '';

			return clientId + "&grant_type=oauth" + provider + appId + openId + "&access_token=" + body.access_token + "&useSign=" + body.useSign + device_id + clientSecret;
		} else if (body) {
			return JSON.stringify (body);
		}
	}

	_getHeader (apiInfo, url) {
		if (url.includes ('https://api.vidahouse.com')) {
			if (apiInfo.name == 'login' || apiInfo.name == 'register' || apiInfo.name == 'loginVerify') {
				return {
					'Accept': 'application/vnd.vidaserver.v2+json+limit',
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept-Encoding': ''
				};
			} else if (global.userInfo) {
				return {
					'Accept': 'application/vnd.vidaserver.v2+json+limit',
					'Content-Type': 'application/json',
					Authorization: `bearer ${global.userInfo.access_token}`,
					'Accept-Encoding': ''
				};//
			} else {
				return {
					'Accept': 'application/vnd.vidaserver.v2+json+limit',
					'Content-Type': 'application/json',
					'Accept-Encoding': ''
				};//
			}
		} else {
			if (global.userInfo) {
				return {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					Authorization: `bearer ${global.userInfo.access_token}`,
					'Accept-Encoding': ''
				};//
			} else {
				return {'Accept': 'application/json', 'Content-Type': 'application/json', 'Accept-Encoding': ''};//
			}
		}

	}

	request (apiInfo, parameter, body, callback) {
		let method = apiInfo.method;
		console.log ('method = ', method);
		let url = this._getUrl (apiInfo, parameter);
		//console.log("url = ", url);
		console.log ("url = ", url);

		let headers = this._getHeader (apiInfo, url);
		console.log ("headers = ", headers);
		let _body = this._getBody (apiInfo, body);
		console.log ('_body = ', _body);
		let isOk;
		let status;
		let timeout = false;
		let contentType;

		const timeoutId = setTimeout (() => {
			timeout = true;

			callback (false, {message: '请求超时'})

		}, 60000);
		fetch (url, {
			method: method,
			headers: headers,
			body: _body,
		})
			.then ((response) => {
				// console.log('ApiRequestResponse:', response );
				isOk = response.ok;
				status = response.status;
				// if ( this._hasResponseData(response)) {
				// return this._getDataFromResponse(response)
				// }
				if (status == 401) {
					DeviceEventEmitter.emit(CustomeEvent.NEED_LOGIN )
				}
				contentType = this._getContentTypeFromResponse (response)
				return response.text ()
			})
			.then ((responseData) => {
				console.log ('ApiRequestResponseData:', responseData);
				if (!timeout) {
					if (responseData.length != 0) {
						switch (contentType) {
							case 'json':
								callback (isOk, common.getSafetyJsonObj (responseData))
								break;
							case 'text':
								callback (isOk, responseData)
								break;
							default:
								callback (isOk, common.getSafetyJsonObj (responseData))
						}
					} else {
						callback (isOk, responseData)
					}
				}
				timeoutId && clearTimeout (timeoutId);

			})
			.catch ((error) => {
				console.log ('ApiRequestError:', error)
				!timeout && callback (false, error)
				timeoutId && clearTimeout (timeoutId);
			});
	}

}
export function showErrorAlert (arg0) {
	// console.log('errorData = ', errorData);
	//
	// let errorTitle = '操作失败！'
	// let errorContent = '网络或服务器异常，请稍后再试！'
	//
	// if(errorData.error){
	//   alertContent = errorData.error;
	// }
	// if(errorData.error_description){
	//   alertContent = errorData.error_description;
	// } else if(errorData.TypeError){
	//   alertContent = errorData.TypeError;
	// } else if (errorData.message) {
	//   alertContent = errorData.message
	// }
	//
	// Alert.alert(errorTitle, alertContent, [{text: '好'},]);
	let errorTitle = '操作失败！';
	let errorMessage = '';
	if (arg0.modelState) {
		let modelState = arg0.modelState;
		let keys = Object.keys (modelState);
		let errorKey = keys[0];
		let errorContent = modelState[errorKey];
		errorMessage = errorContent[0];
	} else if (arg0.message) {
		errorMessage = arg0.message;
	} else if (arg0.message) {
		errorMessage = arg0.Message;
	} else if (arg0.error) {
		errorMessage = arg0.error_description;
	}
	Alert.alert (errorTitle, errorMessage, [{text: '好'},]);

}
