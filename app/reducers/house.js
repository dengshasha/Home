import _ from 'lodash'

const defaultState = {
  height: '',
  style: '',
  layoutImage: '',
  rooms: [{
    name: '客餐厅',
    price: 258,
    figure: '',
    status: true
  }, {
    name: '主卧',
    price: 58,
    figure: '',
    status: true
  }, {
    name: '次卧',
    price: 58,
    figure: '',
    status: true
  }]
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case 'RESET_HOUSE_FULFILLED':
      state = defaultState
      break

    case 'ADD_ROOM_BY_NAME_FULFILLED':
      state = _.cloneDeep(state)
      state.rooms.push({
        name: action.payload.name,
        price: 80,
        figure: '',
        status: true
      })
      break

    case 'ADD_ROOM_BY_INDEX_FULFILLED':
      state = _.cloneDeep(state)
      state.rooms[action.payload.index].status = true
      break

    case 'REMOVE_ROOM_FULFILLED':
      const {index} = action.payload
      state = _.cloneDeep(state)
      if (index < 3) {
        state.rooms[index].status = false
      } else {
        state.rooms.splice(index, 1)
      }
      break

    case 'UPDATE_HOUSE_HEIGHT_FULFILLED':
      state = Object.assign({}, state, {height: action.payload.height})
      break

    case 'UPDATE_HOUSE_STYLE_FULFILLED':
      state = Object.assign({}, state, {style: action.payload.style})
      break

    case 'UPLOAD_LAYOUT_IMAGE_FULFILLED':
      state = Object.assign({}, state, {layoutImage: action.payload.figure})
      break

    case 'UPLOAD_ROOM_FIGURE_FULFILLED':
      state = _.cloneDeep(state)
      state.rooms[action.payload.index].figure = action.payload.figure
      break

    case 'CREATE_LAYOUT_FULFILLED':
      state = Object.assign({id: action.payload.data.id}, state)
      break
  }

  return state
}
