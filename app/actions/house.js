/**
 * 重置房子信息
 * @returns {{type: string, payload: Promise}}
 */
export function resetHouse () {
    return {
        type: 'RESET_HOUSE',
        payload: new Promise((resolve) => resolve())
    }
}

/**
 * 添加房间信息
 * @param name {String} 房间名称
 * @returns {{type: string, payload: Promise}}
 */
export function addRoomByName (name) {
    return {
        type: 'ADD_ROOM_BY_NAME',
        payload: new Promise((resolve) => resolve({name}))
    }
}

/**
 * 添加房间信息
 * @param index {Index} 房间序号
 * @returns {{type: string, payload: Promise}}
 */
export function addRoomByIndex (index) {
    return {
        type: 'ADD_ROOM_BY_INDEX',
        payload: new Promise((resolve) => resolve({index}))
    }
}

/**
 * 删除房间
 * @param index {Number} 房间序号
 * @returns {{type: string, payload: Promise}}
 */
export function removeRoom (index) {
    return {
        type: 'REMOVE_ROOM',
        payload: new Promise((resolve) => resolve({index}))
    }
}

/**
 * 修改楼层高度
 * @param height
 * @returns {{type: string, payload: Promise}}
 */
export function updateHouseHeight (height) {
    return {
        type: 'UPDATE_HOUSE_HEIGHT',
        payload: new Promise((resolve) => resolve({height}))
    }
}

/**
 * 修改房子风格
 * @param style {String} 风格
 * @returns {{type: string, payload: Promise}}
 */
export function updateHouseStyle (style) {
    return {
        type: 'UPDATE_HOUSE_STYLE',
        payload: new Promise((resolve) => resolve({style}))
    }
}

/**
 * 上传户型图
 * @param figure {String} 图片地址
 * @returns {{type: string, payload: Promise}}
 */
export function uploadLayoutImage (figure) {
    return {
        type: 'UPLOAD_LAYOUT_IMAGE',
        payload: new Promise((resolve) => resolve({figure}))
    }
}

/**
 * 上传房间参考图
 * @param figure {String} 图片地址
 * @param index {Number} 房间序号
 * @returns {{type: string, payload: Promise}}
 */
export function uploadRoomFigure (figure, index) {
    return {
        type: 'UPLOAD_ROOM_FIGURE',
        payload: new Promise((resolve) => resolve({figure, index}))
    }
}
