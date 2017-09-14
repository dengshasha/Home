/**
 * 2017-6.19 modify by Traveller.
 * 试玩 - 全景引导页，样式修改
 * */
import React, {Component} from 'react';
import {
	Image,
	Text,
	View,
	Alert,
	Modal,
	Platform,
	ListView,
	StyleSheet,
	TouchableHighlight,
	TouchableOpacity,
} from 'react-native';
import * as common from '../utils/CommonUtils' ;
import * as Images from '../images/guide/main';
import SchemeHandler from '../utils/SchemeHandler' ;
import PanoramaTaskHandler from '../utils/PanoramaTaskHandler' ;
import {ApiRequest, showErrorAlert} from '../utils/ApiRequest';
import {ApiMap} from '../constants/Network';
import Colors from '../constants/Colors' ;
import TaskRecords from '../pages/design/TaskRecords';
import EvaluatePage from '../pages/characterTest/EvaluatePage';
import Spinner from '../libs/react-native-loading-spinner-overlay';
const WeChat = require('react-native-wechat');
const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const STYLE_TYPE_SHARED = 'STYLE_TYPE_SHARED';
let apiRequest = new ApiRequest();

class TasteStyle extends Component { // 品味风格
	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			sharedDataSource: ds,
			currentSelect: '',
			fetchingText: ''
		}
		this.sharedStyleData = [];
		this.responseData = null;
	}

	componentDidMount() {
		this.getEvaluateTest();
	}

	/**
	 * 1、从接口 （GET）analysis/v1.0/user/dna/{userid} or analysis/v1.0/user/dna?id={userid} 获取用户已经测试性格结果
	 * 2、得到结果，发送结果到接口：
	 * */
	getEvaluateTest() { // 获取用户性格测试的数据
		let {userId} = global.userInfo;
		this.setState({
			isFetching: true,
			fetchingText: '正在分析您的风格，请稍候'
		})
		apiRequest.request(ApiMap.getUserDnaStyle, {activityDnaUserId: userId}, null, (status, res) => { // 获取已经有的
			if (status) {
				let {dna} = res; // -> dna 用户的性格测试 dna 密码
				apiRequest.request(ApiMap.getRecommendDna, {dnaCode: dna}, null, this.loadRecommendDnaCallback.bind(this)) // ->获取推荐风格
			} else {
				/**
				 * 没有找到用户性格测试的结果，则跳转到 性格测试 页面
				 * */
				this.props.navigator.replace({
					id: 'EvaluatePage',
					component: EvaluatePage,
				})
			}
		})
	}

	loadRecommendDnaCallback(status, response) {
		if(status) {
			if(response.length > 0){
				let bannerDna = response.shift();
				this.responseData = response; // -> 19条数据
				this.setState({ sharedDataSource:　ds.cloneWithRows([bannerDna]), })
			} else { // -> 未找到匹配的风格，再试试吧
				Alert.alert('未找到匹配的风格','再试试吧', [{
					text: '好', onPress: () => this.props.navigator.pop()
				}])
			}
		}else{
			showErrorAlert(response)
		}
		this.setState({
			isFetching: false,
			fetchingText: ''
		})
	}

	chooseDna(dna, rowId) {
		this.setState({
			currentSelect: rowId,
		});
		Alert.alert('应用', '是否将此DNA应用到你的方案中',
			[
				{text: '否', onPress: () => {}},
				{text: '是', onPress: () => this.DnaApplication(dna)} // this.DnaApplication(dna)
			]
		)
	}

	DnaApplication(dna) {
		this.setState({isFetching: true, fetchingText: 'DNA应用中...'})
		PanoramaTaskHandler.postPanoramaTask({ ...SchemeHandler.scheme, id: SchemeHandler.scheme.id, dnaId: dna.id},()=>{
			this.setState({isFetching:false});
			Alert.alert('风格任务递交！','完成',
				[{text: '确认', onPress: () => this.props.navigator.pop()}]
			)
		})
	}

	_renderDnaRow(rowData, sectionId, rowId) {
		let image = SchemeHandler.getScreenshot(rowData, {width: deviceWidth})
		return (
			<TouchableHighlight
				onPress={() => this.chooseDna(rowData, rowId)}
				underlayColor={Colors.mainColor}
				style={{
					alignSelf: 'center',
					backgroundColor: Colors.white,
					borderWidth: 2,
					borderColor: this.state.currentSelect == rowId ? Colors.mainColor : Colors.white,//Colors.white,
					marginTop: 10,
					height: 230 / 667 * deviceHeight,
					width: deviceWidth - 20,
					borderRadius: 5
				}}>
				<View>
					<Image source={{uri: image}}
								 style={{width: deviceWidth - 24, height: 230 / 667 * deviceHeight - 4, borderRadius: 3}}/>
					<View style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						height: 40,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: this.state.currentSelect == rowId ? 'rgba(243,59,88,0.9)' : Colors.white,
					}}>
						<Text style={{
							color: this.state.currentSelect == rowId ? Colors.white : Colors.black,
							fontSize: 16,
						}}>{rowData.name}</Text>
					</View>
				</View>
			</TouchableHighlight>
		)
	}

	render() {
		return (
			<View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.8)'}}>
				<View style={{
					width: deviceWidth,
					justifyContent: 'center',
					alignItems: 'center',
					height: 45
				}}>
					<Text style={{color: '#fff', fontSize: 18}}>
						品味密码</Text>
				</View>
				<TouchableOpacity onPress={() => this.props.navigator.pop()} style={{position: 'absolute', paddingHorizontal: 16, paddingVertical: 14}}>
					<Image source={Images.skipButton} resizeMode={'cover'} style={{width: 37, height: 17}}/>
				</TouchableOpacity>
				<View style={{height: 280}}>
					<ListView
						contentContainerStyle={{marginTop: 10, width: deviceWidth}}
						dataSource={this.state.sharedDataSource}
						enableEmptySections={true}
						renderRow={this._renderDnaRow.bind(this)}/>
				</View>
				<Image source={Images.tasteTry} resizeMode={'cover'} style={{alignSelf: 'center'}}/>
				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
			</View>
		)
	}
}

export class PanoramaGuideModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0,
			modalVisible: props.visible || true,
			showShareModal: false
		}
	}

	componentWillReceiveProps(nextProps) {
		let index = this.state.index + 1;// index -> 4
		let len = lists.length;
		if (index < len && this.state.modalVisible === false) {
			this.setState({modalVisible: true, index})
		}
		if (index >= len) { // -> 流程完毕
			this.setState({modalVisible: false})
		}
	}

	enterNextGuide() {
		let length = lists.length;
		if (this.state.index < length - 1) {
			this.setState({
				index: this.state.index + 1
			})
		} else {
			this.setState({
				modalVisible: false
			})
		}
	}

	isPortrait() {
		return deviceWidth < deviceHeight;
	}

	//右边按钮
	renderButton(index) {
		let imageWidth;
		let fontSize;
		if (this.isPortrait()) {
			menuWidth = deviceHeight / 9;
			imageWidth = deviceHeight / 13;
			fontSize = 13
		} else {
			menuWidth = deviceHeight / 6;
			imageWidth = deviceHeight / 9;
			fontSize = 10
		}
		let commonOnPress; // --> 通用下一步函数
		let buttonText = lists[index].buttonText; // --> 每一步的按钮名称
		if (buttonText === '换风格') {
			commonOnPress = () => this.enterDnaStyle();
		} else if (buttonText === '任务进度') {
			commonOnPress = () => this.enterTask();
		} else if (buttonText === '微信分享') {
			commonOnPress = () => this.showShare360();
		}
		else {
			commonOnPress = () => this.enterNextGuide();
		}
		return (
			<View style={{
				position: 'absolute',
				right: 0,
				width: this.isPortrait() ? deviceHeight / 9 : deviceHeight / 6,
				height: deviceHeight,
				justifyContent: 'center'
			}}>
				<TouchableOpacity
					onPress={commonOnPress}
					style={[lists[index].buttonStyle, {
						position: 'absolute',
						right: 10 / 667 * deviceHeight,
						alignItems: 'center'
					}]}>
					<Image source={lists[index].button} resizeMode={'contain'} style={{width: imageWidth, height: imageWidth}}/>
					<Text style={{fontSize: fontSize, color: '#fff', marginTop: 3}}>{lists[index].buttonText}</Text>
				</TouchableOpacity>
			</View>
		)
	}

	enterDnaStyle() { // --> 进入风格页
		this.setState({modalVisible: false});
		this.props.navigator.push({id: 'TasteStyle', component: TasteStyle, isFirstPlay: true});
	}

	enterTask() { // --> 进入任务页
		this.setState({modalVisible: false});
		this.props.navigator.push({id: 'TaskRecords', component: TaskRecords, isFirstPlay: true});
	}

	showShare360() { // --> 调起微信分享
		this.setState({modalVisible: false});
		this.props.weChat();
	}

	render() {
		let index = this.state.index, length = lists.length, btnText = lists[index].buttonText;
		return (
			<Modal visible={this.state.modalVisible}
						 transparent={true}
						 onRequestClose={() => {}}
						 animationType={'none'}>
				<View
					style={{
						width: deviceWidth,
						height: deviceHeight,
						paddingTop: Platform.OS === 'ios' ? 20 : 0,
						backgroundColor: 'rgba(0, 0, 0, 0.7)'
					}}>
					<View style={{flexDirection: 'row', justifyContent: 'flex-start', paddingTop: 15, paddingHorizontal: 10}}>
						<TouchableOpacity onPress={() => {
                            this.setState({index: length-1})
                            this.props.close()
						}}>
							{index < length && <Image source={Images.skipButton}/>}
						</TouchableOpacity>
					</View>
					<View style={[lists[index].imageStyle, {position: 'absolute', alignSelf: 'center'}]}>
						<Image source={lists[index].image}/>
					</View>
					{lists[index].button && this.renderButton(index)}
					{btnText === '换风格' || btnText === '任务进度' || btnText === '微信分享' ? null : (
						<TouchableOpacity
							onPress={() => this.enterNextGuide()}
							style={styles.knowBtn}>
							<Image source={index === length - 1 ? Images.okButton : Images.nextButton}/>
						</TouchableOpacity>
					)}
					<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
				</View>
			</Modal>
		)
	}
}

const styles = StyleSheet.create({
	knowBtn: {
		alignSelf: 'center',
		bottom: 50 / 667 * deviceHeight,
		position: 'absolute',
	}
})

const lists = [
	{
		image: Images.slide,
		imageStyle: {
			top: 310 / 667 * deviceHeight,
		}
	},
	{
		image: Images.changeStyle,
		imageStyle: {
			top: 340 / 667 * deviceHeight,
		},
		button: Images.changeStyleButton,
		buttonText: '换风格',
		buttonStyle: {
			top: 300 / 667 * deviceHeight,
		}
	},
	{
		image: Images.taskProgress,
		imageStyle: {
			top: 330 / 667 * deviceHeight,
		},
		button: Images.taskProgressButton,
		buttonText: '任务进度',
		buttonStyle: {
			top: 460 / 667 * deviceHeight,
		}
	},
	{
		image: Images.share,
		imageStyle: {
			top: 250 / 667 * deviceHeight,
		},
		button: Images.shareButton,
		buttonText: '微信分享',
		buttonStyle: {
			top: 220 / 667 * deviceHeight,
		}
	},
]
