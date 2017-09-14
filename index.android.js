import React, { Component } from 'react';
import {
    AppRegistry,
} from 'react-native';
 
import Root from './app/root';

global.ANDROID_PLATFORM = true;


AppRegistry.registerComponent('VidaEasy', () => Root);
