/*
 * melody updated on 2017 8 17
 * 添加引导图
 * */
'use strict';

import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Navigator,
	Dimensions,
	InteractionManager,
	Image,
	Modal,
	TouchableWithoutFeedback,
	Platform,
	NativeModules
} from 'react-native';

import Swiper from 'react-native-swiper';
import Video from 'react-native-video';
import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import LoginPage from './loginPage';
import MainPage from '../mainPage';

const deviceWidth = common.getWidth ();
const deviceHeight = common.getHeight ();

export default class SplashScreen extends React.Component {
	constructor (props) {
		super (props);
		this.state = {
			modalVisible: false
		}
		this.loadStart = this.loadStart.bind (this);
		this.setDuration = this.setDuration.bind (this);
		this.setTime = this.setTime.bind (this);
		this.onEnd = this.onEnd.bind (this);
		this.videoError = this.videoError.bind (this);
	}

	componentDidMount () {

	}

	enterMainPage (index) {
		let arrLength = carouselArr.length
		if (index === arrLength - 1) {
			const {navigator, dispatch} = this.props;

			global.storage.load ({
				key: 'userInfo',
			}).then ((ret)=> {
				if (ret.userInfo) {
					global.userInfo = ret.userInfo
                    global.authorization(userInfo.access_token)
					navigator.resetTo ({
						component: MainPage,
						id: 'MainPage'
					});
				} else {
					InteractionManager.runAfterInteractions (() => {
						navigator.resetTo ({
							component: LoginPage,
							id: 'LoginPage'
						});
					});
				}
			}).catch ((err)=> {
				console.log ('setAotoLogin error ==> ', err);
				if (err) {
					InteractionManager.runAfterInteractions (() => {
						navigator.resetTo ({
							id: 'LoginPage',
							component: LoginPage,
						});
					});
				}
			})
		}
	}

	render () {
		let carouselItem = carouselArr.map ((item, index) =>
			<TouchableWithoutFeedback key={index} onPress={() => this.enterMainPage (index)}>
				<Image source={item.image} style={{width: deviceWidth, height: deviceHeight}}/>
			</TouchableWithoutFeedback>
		)
		return (
			<View style={{flex: 1}}>
				<Video
					source={require ('../../images/login/launch.mov')}
					rate={1.0}                   // 0 is paused, 1 is normal.
					volume={1.0}                 // 0 is muted, 1 is normal.
					muted={false}                // Mutes the audio entirely.
					paused={false}               // Pauses playback entirely.
					resizeMode="cover"           // Fill the whole screen at aspect ratio.
					repeat={false}                // Repeat forever.
					onLoadStart={this.loadStart} // Callback when video starts to load
					onLoad={this.setDuration}    // Callback when video loads
					onProgress={this.setTime}    // Callback every ~250ms with currentTime
					onEnd={this.onEnd}           // Callback when playback finishes
					onError={this.onEnd}    // Callback when video cannot be loaded
					style={styles.backgroundVideo}/>
				<Modal
					visible={this.state.modalVisible}
					transparent={false}
					onRequestClose={() => {}}
					animationType={'none'}>
					<View style={styles.modalContainer}>
						<Swiper
							loop={false}
							activeDotStyle={{
								backgroundColor: 'rgba(255, 255, 255, 1)',
								width: 10,
								height: 10,
								borderRadius: 5,
								marginBottom: 10
							}}
							dotStyle={{
								backgroundColor: 'rgba(255, 255, 255, 0.2)',
								width: 10,
								height: 10,
								borderRadius: 5,
								marginBottom: 10
							}}>
							{carouselItem}
						</Swiper>
					</View>
				</Modal>
			</View>
		)
	}

	loadStart () {
	}

	setDuration () {
	}

	setTime () {
	}

	videoError (error) {
		console.log ('videoError:', error);
	}

	onEnd () {
		global.storage.load({
			key: 'isFirstOpenApp',
		}).then((ret)=>{
			//如果有该数据，则表明用户不是第一次打开app

			const {navigator, dispatch} = this.props;

			global.storage.load ({
				key: 'userInfo',
			}).then ((ret)=> {
				if (ret.userInfo) {
					global.userInfo = ret.userInfo
					global.authorization(userInfo.access_token)
					if(Platform.OS === 'android'){

					} else {
					  //todo ios的网易云信登录
					  NativeModules.NetEaseLogin.autoLoginWithAccountId(ret.userInfo.nimAccountId);
					  //...
					}
					navigator.resetTo ({
						component: MainPage,
						id: 'MainPage'
					});
				} else {
					InteractionManager.runAfterInteractions (() => {
						navigator.resetTo ({
							component: LoginPage,
							id: 'LoginPage'
						});
					});
				}
			}).catch ((err)=> {
				console.log ('setAotoLogin error ==> ', err);
				if (err) {
					InteractionManager.runAfterInteractions (() => {
						navigator.resetTo ({
							id: 'LoginPage',
							component: LoginPage,
						});
					});
				}
			})
		}).catch((err)=>{
			//没有找到数据，用户是第一次打开app

			this.setState ((preState, prop) => {
				return {modalVisible: true}
			})
			global.storage.save({
				key: 'isFirstOpenApp',  //注意:请不要在key中使用_下划线符号!
				data: false,
			});

		})

	}

}

var styles = StyleSheet.create ({
	backgroundVideo: {
		marginTop: -50,
		marginBottom: 50,
		height: deviceHeight + 100,
		width: deviceWidth
	},
	modalContainer: {
		width: deviceWidth,
		height: deviceHeight,
	},
});

const carouselArr = [
	{image: require ('../../images/login/carousel1.png')},
	{image: require ('../../images/login/carousel2.png')},
	{image: require ('../../images/login/carousel3.png')},
	{image: require ('../../images/login/carousel4.png')},
]
