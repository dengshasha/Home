/**
 * 创建redux状态容器
 * @author cstyles
 */
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import reducers from '../reducers';

/**
 * 格式化异步请求返回数据
 * 请求失败 提取错误信息
 * 请求成功只需要data字段
 * @param store
 */
const format = (store) => (next) => (action) => {
  if (action.payload && action.payload.request instanceof XMLHttpRequest) {
    if (action.error) {
      const {response} = action.payload;
      action.payload = {
        status: response.status,
        statusText: response.statusText,
        error: response.data.error,
        message: response.data.message,
      };
    } else if (action.payload.data) {
      action.payload = action.payload.data;
    }
  }
  return next(action);
};

let middleware = [thunkMiddleware, promiseMiddleware(), format];
if (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
  middleware = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__( applyMiddleware(...middleware));
} else {
  middleware = applyMiddleware(...middleware);
}

export default () => createStore(reducers, middleware)
