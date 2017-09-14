import React from 'react-native';
import Root from './app/root';

global.IOS_PLATFORM = true;
const {
	AppRegistry,
} = React;

AppRegistry.registerComponent('VidaEasy', () => Root);
