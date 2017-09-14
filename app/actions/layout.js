/**
 * 清空掉户型列表信息
 * @returns {{type: string, payload: Promise}}
 */
export function resetLayoutList () {
    return {
        type: 'RESET_LAYOUT_LIST',
        payload: new Promise((resolve) => resolve())
    }
}

/**
 * 创建户型
 * @param title {String} 标题
 * @param clientName {String} 用户名 user.userInfo.phone
 * @param height {Number} 楼层高度
 * @param style {String} 风格
 * @param rooms {Object} 房间信息
 * @param layoutImage {String} 户型图
 * @returns {{type: string, payload: (AxiosPromise | *)}}
 */
export function createLayout ({title = '', clientName, height, style, rooms, layoutImage}) {
    return {
        type: 'CREATE_LAYOUT',
        payload: businessAxios.post('/api/LayoutApply', {title, clientName, height, style, rooms, layoutImage})
    }
}

/**
 * 修改户型信息 (添加订单信息，修改状态 ...)
 * @param id {String} 户型id
 * @param data {Object} 需要修改的信息
 * @returns {{type: string, payload: (*|AxiosPromise)}}
 */
export function updateLayout (id, data) {
    return {
        type: 'UPDATE_LAYOUT',
        payload: businessAxios.patch(`/api/LayoutApply/${id}`, data)
    }
}

/**
 * 获取我的户型信息列表
 * @param clientName {String} 用户名 user.userInfo.phone
 * @param page {Number} 当前页数
 * @param pageCount {Number} 每页条数
 * @returns {{type: string, payload}}
 */
export function getLayoutList (clientName, page, pageCount = 20) {
    return {
        type: 'GET_LAYOUT_LIST',
        meta: {
            page
        },
        payload: businessAxios.get('/api/LayoutApply/', {
            params: {
                clientName,
                skip: (page - 1) * pageCount,
                take: pageCount
            }
        })
    }

}
