const defaultState = []

export default function (state = defaultState, action) {
    switch (action.type) {
        case 'RESET_LAYOUT_LIST_FULFILLED':
            state = []
            break

        case 'GET_LAYOUT_LIST_FULFILLED':
            const listData = action.payload.data.data.map((item) => {
                item.rooms = JSON.parse(item.rooms)
                return item
            })
            state = action.meta.page === 1 ? listData : state.concat(listData)
            break

        case 'UPDATE_LAYOUT_FULFILLED':
            const updateData = action.payload.data
            updateData.rooms = JSON.parse(updateData.rooms)
            state = state.map((item) => item.id === updateData.id ? updateData : item)
            break
    }

    return state
}
