import React from 'react';
import ReactNative from 'react-native';

const {
	StyleSheet,
	Navigator,
	BackAndroid,
	View,
} = ReactNative;

import * as common from '../utils/CommonUtils' ;
import storage from '../utils/Storage';

import SplashScreen from '../pages/login/splash' ;
import MessagePage from '../pages/user/MessagePage';
import Orientation from 'react-native-orientation';

import JPushModule from 'jpush-react-native';
import {JPushAddHandle, JPushRemoveHandle} from '../utils/JPushModule';


var WeChat = require ('react-native-wechat');

var _navigator, _route;
export default class App extends React.Component {
	constructor (props) {
		super (props);
		this.renderScene = this.renderScene.bind (this);
		this.goBack = this.goBack.bind (this);
		BackAndroid.addEventListener ('hardwareBackPress', this.goBack);
		WeChat.registerApp (common.getWechatAppID ());
	}

	componentWillMount () {
		Orientation.lockToPortrait ();
	}

	componentDidMount () {
		
		JPushAddHandle (() => {
			_navigator.push ({
				id: 'MessagePage',
				component: MessagePage
			})
		})
	}

	componentWillUnmount () {

	}


	goBack () {
		return common.NaviGoBack (_navigator);
	}

	renderScene (route, navigator) {
		let Component = route.component;
		_navigator = navigator;
		_route = route;
		return (
			<Component navigator={navigator} {...route.params} route={route}/>
		);
	}

	configureScene (route, routeStack) {
		return Navigator.SceneConfigs.FadeAndroid;
	}

	render () {
		return (
			<View style={{flex: 1}}>
				<Navigator
					ref='navigator'
					style={styles.navigator}
					configureScene={this.configureScene}
					renderScene={this.renderScene}
					initialRoute={{
						component: SplashScreen,
						id: 'SplashScreen'
					}}/>
			</View>
		);
	}
}

const styles = StyleSheet.create ({
	navigator: {
		flex: 1
	},
});
