import React from 'react';
import {Provider} from 'react-redux';
import App from './pages/app';
import configureStore from './utils/configureStore';

if (!__DEV__) {
  global.console = {...console, warn: () => {}, log: () => {}};
}

const store = configureStore();

class Root extends React.Component {

  componentWillUnmount() {
    global.storage.clearMapForKey('activityList');
  }

  render() {
    return (
        <Provider store={store}>
          <App/>
        </Provider>
    );
  }
}

export default Root;
