/**
 * 初始化配置
 * @author cstyles
 */
import {Text, Dimensions, PixelRatio, Platform} from 'react-native';
import axios from 'axios';

let {width, height} = Dimensions.get('window');
const _ = Math.min(width, height);
height = Math.max(width, height);
width = _;
const vw = width / 100;
const vh = height / 100;
const fontScale = 1;

// 开发，测试环境中可以通过 DevTools 查看网络请求
if (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ && global.originalXMLHttpRequest) {
  global.XMLHttpRequest = global.originalXMLHttpRequest;
}

/**
 * 挂载全局设备信息
 * @type {{
 * width: {Number} 宽,
 * height: {Number} 高,
 * scale {Number} dor,
 * vw: {Number} 相对于宽度, 宽度 = 100vw,
 * vh: {Number} 相对于高度, 高度 = 100vh
 * }}
 */
global.DEVICE = {
  width,
  height,
  scale: Dimensions.get('window').scale,
  vw,
  vh,
};

/**
 * 自适应解决方案 px 2 dp
 * @param px {Number} 设计图像素
 * @param useHeight {Boolean} 是否使用高度比
 * @returns {number}
 */
global.dp = function(px, useHeight = false) {
  return px * (useHeight ? height / 667 : width / 375);
};

// 设置Text allowFontScaling
if (Platform.OS === 'ios') Text.defaultProps.allowFontScaling = false;
/**
 * 解决字体大小受系统字体大小缩放问题
 * @param px
 * @returns {number}
 */
global.fontSize = function(px) {
  return px / fontScale;
};

const instances = []; // axios实例集

/**
 * 生成各个接口系统axios实例
 * @param baseURL {String} host
 * @returns {AxiosInstance}
 */
function factory(baseURL) {
  const instance = axios.create({
    baseURL,
    headers: {
      Accept: /api\.vidahouse/.test(baseURL) ? 'application/vnd.vidaserver.v2+json+limit' : 'application/json',
    },
    transformResponse: [
      function(data) {
        try {
          if (typeof data === 'string') data = JSON.parse(data);
        } catch (e) {
        }

        // 临时处理接口数据格式不统一问题
        if (data.error || data.modelState || data.ModelState) {
          let message;
          const modelState = data.modelState || data.ModelState;
          if (modelState) {
            message = modelState[Object.keys(modelState)[0]][0];
          } else {
            message = data.error_description || data.message || data.Message;
          }

          return {
            error: data.error || data.modelState,
            message: message,
          };
        }

        return data;
      }],
  });

  // 添加默认错误信息
  instance.interceptors.response.use((response) => response, (error) => {
    const {response} = error;
    if (response && /^[45]/.test(response.status) &&
        (response.data === '' || /<html>|<!DOCTYPE/.test(response.data))) {
      error.response.data = {
        message: '服务器繁忙，请稍后再试。',
      };
    } else if (response && /^[45]/.test(response.status) && response.data &&
        response.data.msg) {
      response.data.message = response.data.msg;
      delete response.data.msg;
    } else if (!response) {
      error.response = {
        data: {
          message: error.toString(),
        },
      };
    }

    // 错误信息未包含中文 统一错误信息
    if (!/[\u4E00-\u9FFF]+/g.test(response.data.message)) {
      response.data.message = '服务器繁忙，请稍后再试。';
    }

    return Promise.reject(error);
  });

  instances.push(instance);

  return instance;
}

/**
 * 重新授权接口
 * @param accessToken
 */
function authorization(accessToken) {
  for (const instance of instances) {
    instance.defaults.headers.common['Authorization'] = `bearer ${accessToken}`;
  }
}

global.axios = axios
global.apiAxios = factory('https://api.vidahouse.com');
global.businessAxios = factory('http://layout.v.vidahouse.com');

// 授权挂载到全局
global.authorization = authorization;
