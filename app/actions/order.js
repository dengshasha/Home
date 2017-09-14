/**
 * 创建一个订单
 * @param data {Object} 订单信息
 * @returns {{type: string, payload: *}}
 */
export function createOrder (data) {
    return {
        type: 'CREATE_ORDER',
        payload: apiAxios.post('/shopping/orders', data)
    }
}

/**
 * 支付订单
 * @param orderId {String} 订单标号
 * @returns {{type: string, payload: AxiosPromise}}
 */
export function payOrder (orderId) {
    return {
        type: 'PAY_ORDER',
        payload: apiAxios.put('/shopping/orders/checkout', {orderId})
    }
}

/**
 * 获取订单状态
 * @param orderId {String} 订单编号
 * @returns {{type: string, payload}}
 */
export function getOrderStatus (orderId) {
    return {
        type: 'GET_ORDER_STATUS',
        payload: apiAxios.get(`/shopping/orders/${orderId}/status`)
    }
}
