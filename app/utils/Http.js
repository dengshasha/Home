/**
 * Created by Traveller on 2017/7/10.
 * 封装HTTPRequest的get,post,put,delete,patch
 */
import * as C from './LogUtil';
export default class Http {

	get = (url, params, callback) => {
		let _url = this._getUrl(url, params);

		C.Log('http url-->' , _url);
		let ok;
		return fetch(_url, {method: "GET", headers: this._getHeader()})
			.then( response => {
				ok = response.ok;
				return response.json();
			})
			.then( responseData => {
				C.Log('http GET responseData-->' , responseData);
				callback(ok, responseData);
			})
			.catch( err => {
				C.Log('http GET err-->' , err);
				if (callback) callback(false, '网络错误');
			})
	};

	post = () => {};

	put = (url, params, body, callback) => {
		let _url = this._getUrl(url, params);

		C.Log('http url-->' , _url);
		let ok;
		return fetch(_url, {method: "PUT", headers: this._getHeader(), body: this._getBody(body)})
			.then( response => {
				ok = response.ok;
				return response.json();
			})
			.then( responseData => {
				C.Log('http PUT responseData-->' , responseData);
				callback(ok, responseData);
			})
			.catch( err => C.Log('http GET err-->' , err))
	};

	// ---->
	_getHeader = () => {
		if(global.userInfo){
			return {
				"Accept"          : "application/json",
				"Content-Type"    : "application/json",
				"Authorization"   : "bearer " + global.userInfo.access_token,
				"Accept-Encoding" : ""
			};
		} else {
			return {
				"Accept"          : "application/json",
				"Content-Type"    : "application/json",
				"Accept-Encoding" : ""
			};
		}
	};

	_getBody = (_body) => JSON.stringify(_body);

	_getUrl = (_url, _params) => {
		if (typeof(_url) !== 'string') console.error('url must be String');
		if (_params) {
			let paramsArray = [];
			Object.keys(_params).map(key => paramsArray.push(key + '=' + _params[key]));
			if (_url.search(/\?/) === -1) {
				_url += '?' + paramsArray.join('&')
			} else {
				_url += paramsArray.join('&')
			}
		}
		return _url;
	}

}
