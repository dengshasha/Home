/**
 * Created by Melody.Deng on 2017/9/6.
 */
import React, { Component } from 'react'
import {
	WebView,
	View,
	TouchableOpacity,
	Image,
	Platform,
	StyleSheet,
	NativeModules,
} from 'react-native'

import DeviceInfo from 'react-native-device-info'

import * as Icon from '../../images/'
import Colors from '../../constants/Colors'
import * as common from '../../utils/CommonUtils'

import Spinner from '../../libs/react-native-loading-spinner-overlay'
import NavigationBar from '../../components/NavigationBar'
import PayPage from '../PayPage';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

export default class WebShoppingCartPage extends Component {
	constructor (props) {
		super(props);
		this.state = {
			title: ''
		}
	}

	//用于监听webview的导航变化
	onNavigationStateChange(navState) {
		//canGoBack|loading|title|url|canGoForward
		this.canGoBack = navState.canGoBack
		this.setState({
			title: navState.title
		})
	}

	//webview返回操作
	goBack() {
		if(this.canGoBack){
			this.webView.goBack()
		}else{
			this.props.navigator.pop()
		}
	}

	//在页面加载成功前设置一个加载视图，若不成功添加：startInLoadingState={true}
	renderLoading() {
		return (
			<Spinner visible={true} text={'加载中，请稍候……'}/>
		)
	}

	onMessage(e){
		let {orderId} = JSON.parse(e.nativeEvent.data);
		console.log('onMessage orderId: ',orderId );
		if (orderId) {
			 this.props.navigator.push({
                        component: PayPage,
                        params: {
                            orderId,
                            onBack: (navigator, status) => {
                                if (!status) {
                                    navigator.pop();
                                }else {
                                	console.log('PayPage failed');
                                }
                            },
                        },
                    });
		 }
	}

	render() {
		const webViewProps = {}
		var injectedJavaScript = '';
		let userAgent = DeviceInfo.getUserAgent()
		userAgent = ~userAgent.indexOf('VidaHouse') ? userAgent : `${userAgent} VidaHouse/${global.userInfo.access_token}/1.0.0`
		if (Platform.OS === 'ios') {
			webViewProps.allowsInlineMediaPlayback = true;
			NativeModules.RNUserAgent.set(userAgent)
			injectedJavaScript =  'window.VidaHouse = {  pay: function (orderId) { window.postMessage(orderId) }  }'
		} else {
			webViewProps.userAgent = userAgent
		}
		let uri;
		if (this.props.originId) {
			uri = `${global.webProductListUrl}?access_token=${global.userInfo.access_token}&schemesId=${this.props.originId}`; //物品清单
		} else if (this.props.from) {
			uri = `${global.webProductListUrl}?access_token=${global.userInfo.access_token}${this.props.from}`; //订单和购物车
		}
		return(
			<View style={{flex: 1}}>
				<NavigationBar
					backgroundColor = {Colors.black}
					title = {this.state.title}
					titleColor = {Colors.white}
					onLeftButtonPress={() => this.goBack()}
					logoIcon={Icon.logoBlack}
					leftButtonIcon={Icon.backWhite}
					navigator = {this.props.navigator}
				/>
				<WebView
					{...webViewProps}
					style={{flex: 1}}
					ref={ref => this.webView = ref}
					source={{uri: uri}}
					injectedJavaScript = {injectedJavaScript}
					javaScriptEnabled={true}
					startInLoadingState={true}
					onMessage = {(e)=>this.onMessage(e)}
					renderLoading = {() => this.renderLoading()}
				    onNavigationStateChange={this.onNavigationStateChange.bind(this)}
				/>

			</View>
		)
	}
}

const styles = StyleSheet.create({
	backBtn: {
		height: 40 / 667 * deviceHeight ,
		left: 10,
		position: 'absolute',
		top: Platform.OS === 'ios' ? 35 : 15,
		width: 40 / 667 * deviceHeight,
	}
});
