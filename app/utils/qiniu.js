export default {
  /**
   * 获取七牛token
   * @param slug {String}
   * @returns {Promise}
   */
  getUploadToken(slug) {
    return new Promise((resolve, reject) => {
      axios.get(
          `https://api.vidahouse.com/designing/v1.0/Upload?slug=${slug}&fileName=qiniufile`).
          then(({data}) => resolve(data.token)).
          catch(reject);
    });
  },

  /**
   * 上传图片
   * @param file {Image} 图片文件
   * @param slug {String}
   * @returns {Promise}
   */
  uploadImage(file, slug) {
    const debug = typeof window === 'object' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
        global.originalXMLHttpRequest;

    return new Promise((resolve, reject) => {
      this.getUploadToken(slug).then((token) => {
        const formData = new FormData();
        formData.append('token', token);
        formData.append('file', file);

        // originalXMLHttpRequest 不支持解析本地文件 所以上传前改回XMLHttpRequest
        if (debug) global.XMLHttpRequest = require('XMLHttpRequest');
        axios.post('https://up.qbox.me', formData).then((response) => {
          if (debug) global.XMLHttpRequest = global.originalXMLHttpRequest;
          resolve(`http://${slug}.s.vidahouse.com/${response.data.storageKey}`);
        }).catch((error) => {
          if (debug) global.XMLHttpRequest = global.originalXMLHttpRequest;
          reject(error);
        });
      }).catch(reject);
    });
  },

  /**
   * 七牛图片高级处理
   * @param url {String} 原图地址
   * @param thumbnail {String} 缩放操作
   * @param gravity {String} 重心处理
   * @param crop {String} 裁剪
   * @param rotate {String} 旋转
   * @param format {String} 转换格式
   * @param blur {Number} 高斯模糊
   * @param interlace {Number} 渐进JPG
   * @param quality {Number} 图片质量
   */
  imageMogr(
      url,
      {thumbnail, gravity, crop, rotate, format, blur, interlace, quality}) {
    if (!/\.s\.vidahouse\.com/.test(url)) return;
    const params = {
      thumbnail,
      gravity,
      crop,
      rotate,
      format,
      blur,
      interlace,
      quality,
    };
    let query = '';
    for (const key in params) {
      if (typeof params[key] !== 'undefined') {
        query += `/${key}/${params[key]}`;
      }
    }

    if (query) {
      return `${url}?imageMogr2/auto-orient/strip${query}`;
    }
    return url;
  },

  /**
   * 图片基础处理
   * @param url {String} 原图地址
   * @param mode {Number} 0 - 4 默认0
   * @param w {Number} 宽
   * @param h {Number} 高
   * @param format {String} 转换格式
   * @param interlace {Number} 渐进JPG
   * @param q {Number} 图片质量
   */
  imageView(url, {mode = 0, w, h, format, interlace, q}) {
    if (!/\.s\.vidahouse\.com/.test(url)) return;

    const params = {w, h, format, interlace, q};
    let query = '';
    for (const key in params) {
      if (typeof params[key] !== 'undefined') {
        query += `/${key}/${params[key]}`;
      }
    }

    return `${url}?imageView2/${mode + query}`;
  },

  /**
   * 根据设备获取合适的图片
   * @param url {String} 原图地址
   * @param width {Number} 1dpr图的宽度 默认360
   */
  imageMedia(url, width = 360) {
    return this.imageView(url, {mode: 0, w: width * DEVICE.scale, interlace: 1});
  },
};
