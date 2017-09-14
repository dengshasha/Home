/**
 * update by Traveller 2017-6.22
 * 1、获取来自ActivityPanoramaPage的全景图数据，呈现全景图
 * 2、点击拍摄，全景图截图，
 * */
import React, {Component} from "react";
import {
	View,
	Text,
	Image,
	Modal,
	WebView,
	Platform,
	Alert,
	TouchableOpacity,
} from "react-native";
import Orientation from 'react-native-orientation';
import Toast from 'react-native-easy-toast';
import NavigationBar from '../../components/NavigationBar';
import ApplicationTypePage from '../design/ApplicationTypePage';
import PanoramaTaskHandler from '../../utils/PanoramaTaskHandler';
import SchemeHandler from '../../utils/SchemeHandler';
import ImagePicker from 'react-native-image-crop-picker';
import {takeSnapshot} from "../../libs/react-native-view-shot";
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import UploadToQiniu from '../../utils/UploadToQiniu';
import {CommunityApiMap} from '../../constants/Network';
import CrosswalkWebView from '../../libs/react-native-webview-crosswalk';
import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import Spinner from '../../libs/react-native-loading-spinner-overlay/index';
import ActivityPublishedPage from './ActivityPublishedPage'
import SharePage from '../share/SharePage';
import * as Icon from '../../images/';

var deviceWidth = common.getWidth();
var deviceHeight = common.getHeight();

const apiRequest = new ApiRequest();

export default class Shot extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			fetchingText: '',
			file: '',
			shotVisible: false,
			previewSource: {},
			error: null,
		};
		this.task = props.route.taskScheme
	}

	componentWillMount() {
		this.didFocusSubscription = this.props.navigator.navigationContext.addListener('didfocus', (event) => {
			if (event._data.route.id != 'Shot') {
				Orientation.lockToPortrait();
			} else {
				Orientation.unlockAllOrientations();
			}
		});
		Orientation.addOrientationListener((orientation) => {
			if (orientation == 'LANDSCAPE') {
				deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getWidth() - 20 : common.getNormalHeight() - 20;
				deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() : common.getWidth();
			} else if (orientation == 'PORTRAIT') {
				deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getWidth() : common.getNormalHeight();
				deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() - 20 : common.getWidth() - 20;
			}
		})
	}

	componentDidMount() {
	}

	componentWillUnmount() {
		Orientation.lockToPortrait();
		Orientation.removeOrientationListener();
	}

	isPortrait() {
		return deviceWidth < deviceHeight;
	}

	// 获取全景图url
	getViewUrl() {
		let url;
		if (this.props.actionType === 'common') {
			// 获取普通全景图url
			url = SchemeHandler.getPanoramaUrl(this.task);
		} else {
			// 获取活动的全景图url
			let result = JSON.parse(this.task.result);
			url = PanoramaTaskHandler.getResultPanorama(result.viewUrl);
		}

		return url;
	}

	renderWebview() {
		let tmpUrl = this.getViewUrl();
		let url = tmpUrl.replace('bar=show', 'bar=hide&logo=false');
		if (Platform.OS === 'ios') {
			return (
				<WebView
					style={{flex: 1}}
					ref="webview"
					javaScriptEnabled={true}
					source={{uri: url}}>
				</WebView>
			)
		} else if (Platform.OS === 'android') {
			return (
				<CrosswalkWebView
					ref="webview"
					localhost={false}
					style={{flex: 1}}
					url={url}/>
			)
		}
	}

	// 确认截图
	shot() {
		let viewRef = this.refs.webview;
		takeSnapshot(viewRef, {
			format: "jpeg",
			quality: 1.0
		}).then(uri => {
				console.log("Image saved to", uri);  // todo 上传七牛
				ImagePicker.openCropper({
					path: uri,
					width: parseInt(deviceWidth),
					height: parseInt(deviceWidth),
					mime: 'image/jpeg',
					hideBottomControls: true
				}).then(image => {
					this.setState({
						previewSource: {uri: image.path}, shotVisible: true
					});
				}).catch(e => console.log(e));
			}, error => console.log("Oops, snapshot failed", error)
		);
	}

	// 取消重拍
	_cancleRetake = () => {
		this.setState({shotVisible: false});
		const {previewSource} = this.state;
		ImagePicker.cleanSingle(previewSource ? previewSource.uri : {}).then(() => {
			console.log(`removed tmp image ${previewSource.uri} from tmp directory`);
		}).catch(e => {
			console.log(e)
		})
	};

	// 上传
	_uploadPreview = () => {
		this.setState({isFetching: true, fetchingText: ' 发布中...，请稍后 '});
		const {previewSource} = this.state;
		let file = {uri: previewSource.uri, type: 'multipart/form-data'};
		UploadToQiniu.uploadDesignshot(file, (status, res) => {
			if (status && res.storageKey) {
				let previewImg = "http://designshot.s.vidahouse.com/" + res.storageKey;
				// 发布到活动
				if (this.props.actionType === 'common') {
					this.releaseCommonScheme(previewImg);
				} else {
					this.releaseSchemeToActicity(previewImg);
				}
			} else {
				showErrorAlert(' 上传失败，请检查网络是否通畅 ');
				this.props.navigator.pop();
				this.setState({isFetching: false});
			}
		})
	};

	// 发布方案到活动中
	releaseSchemeToActicity = (previewImg) => {
		let {id, data, result} = this.task;
		let tempData = JSON.parse(data);
		let tempResult = common.getSafetyJsonObj(result);
		let viewUrl = tempResult && tempResult.viewUrl;
		let schemeId = PanoramaTaskHandler.getResultNewSchemeId(viewUrl) ? PanoramaTaskHandler.getResultNewSchemeId(viewUrl) : tempData.schemeId;

		let body = {
			scheme_id: schemeId,
			origin_scheme_id: tempData.originSchemeId,
			activity_id: tempData.activityId,
			works_img: previewImg,
			pano_url: PanoramaTaskHandler.getResultPanorama(viewUrl).replace(/bar=show/, 'bar=hide'),
		};
		apiRequest.request(CommunityApiMap.postActivityWorks, null, body, (status, res) => {
			if (this.state.isFetching) this.setState({isFetching: false});
			if (status) {
				if (res.error_code && res.error_code !== 0) {
					Alert.alert('发布失败！', res.error_msg, [{text: '确定', onPress: () => this.props.navigator.pop()}])
				} else {
					// todo tempData 对象值
					let updatedData = Object.assign({}, tempData, {released: true})
					let stringifyData = JSON.stringify(updatedData)
					this.setState({shotVisible: false});
					PanoramaTaskHandler.patchTask(id, {data: stringifyData}, () => {
 					    setTimeout(() => {
							Alert.alert(' 发布成功 ', '试试看你家阳台吧', [
								{
									text: '下次再说', onPress: () => {
									this.props.navigator.pop();
									this.props.navigator.replace({
										id: 'ActivityPublishedPage',
										component: ActivityPublishedPage,
										params: {activityId: tempData.activityId, workId: res.works_id}
									})
								}
								}, {
									text: '了解详情', onPress: () => {
										this.props.navigator.pop();
										this.props.navigator.replace({
											id: 'ApplicationTypePage',
											component: ApplicationTypePage
										})
									}
								}
							])
						}, 500)
					})
				}
			}
		})
	};

	// 解析具体方案里的数据
	resloveProdution() {
		let task = this.task;
		let area = task.areas[0]; // 取第一个区域
		let images = JSON.parse(task.images); // 全景图数组
		let panos = []; // 发布的全景图
		let items = []; // 发布的物品
		let thumbs = images.screenshots; // 缩略图字符串
		let productArr = SchemeHandler.getSchemeProduct(area.products); // 已经取得物品数组
		let p360s = images.p360s; // p360s 的全景数据
		let name = task.name, origin_id = task.id, intro = task.description; // 方案名称，id, 简介

		if (p360s && p360s.length !== 0) { // 遍历取得panos的数据
			for (let i = 0; i < p360s.length; i++) {
				let camposes = p360s[i].campos.split(',');
				panos[i] = {
					pano_url: p360s[i].p360,
					thumbnail: thumbs[i] || '',
					x: camposes[0],
					y: camposes[1],
					z: camposes[2]
				}
			}
		} else {
			if (images.p360) {
                panos.push(images.p360)
			} else {
                showErrorAlert('全景图p360不存在')
            }
		}

		if (productArr && productArr.length !== 0) {  // 遍历取得物品数据
			for (let i = 0; i < productArr.length; i++) {
				items[i] = {
					owner_oauthId: productArr[i].ownerId, //pc端中的拥有者 ,
					image_url: productArr[i].images, //图片截图
					type_id: productArr[i].categoryId, //分类id
					introduce: productArr[i].description, // 描述
					name: productArr[i].name //名称
				};
			}
		} else {
			showErrorAlert('物品数据不存在')
		}

		return {name, origin_id, intro, panos, items};
	}

	/**
	 * 发布通用活动 func
	 {
		"name": "string",        // name:        方案名称
		"upload_type": "IMPORT", // 待定: 默认
		"origin_id": 0,          // id:          方案id
		"thumbnail": "string",       // cover:       封面截图url
		"style_id": 0,           // 待定: 默认
		"intro": "string",       // description: 描述
		"upload_type": 'IMPORT',
		"thumbnail": "string",
		"style_id": 0,
		"style_name": "string",
		"images": "string",
		"images_thumbnail": "string",
		"panos": [
			{
				"id": 0,
				"works_id": 0,
				"pano_url": "string", // panoUrl:    全景图url
				"thumbnail": "string",//thumbnail:  缩略图
				"x": 0,               // x: 坐标 x
				"y": 0,               // y: 坐标 y
				"z": 0,               // z: 坐标 z
				"order": 0
			}
		],
		"items": [               // 物品列表 从区域area遍历获取数据
			{
				"id": 0,             // 待定
				"works_id": 0,        // 待定
				"owner_oauthId": 0,   // ownerId
				"image_url": "string",// images: 图片截图
				"typeId": 0,         // categoryId: 分类id
				"introduce": "string",// description: 描述
				"name": "string"     // name：名称
			}
		]
	}
	 @param cover: 全景图的封面截图
	 */
	releaseCommonScheme = (thumbnail) => {
		let {name, origin_id, intro, panos, items} = this.resloveProdution();
		let body = {
			name,
            upload_type: 'IMPORT',
			origin_id,
            thumbnail,
            intro,
            style_id: 0,
            style_name: '',
            images: thumbnail,
            images_thumbnail: thumbnail,
            panos,
            items
        };

		apiRequest.request(CommunityApiMap.publishScheme, null, body, (status, res) => {
			if (this.state.isFetching) this.setState({isFetching: false});
			if (status) {
				if (res.error_code && res.error_code !== 0) {
					Alert.alert('发布失败！', res.error_msg, [{text: '确定', onPress: () => this.props.navigator.pop()}])
				} else {
					this.toast.show('封面拍摄成功，发布成功！');
					setTimeout(() => {
						this.setState({shotVisible: false});
						this.props.navigator.pop();
						this.props.navigator.replace({id: 'sharePage', component: SharePage})
					}, 500);
				}
			} else {
				showErrorAlert(res)
			}
		})
	};

	render() {
		return (
			<View style={{flex: 1}}>

				<View style={{width: deviceWidth, height: deviceHeight}}>
					{this.renderWebview()}
					<NavigationBar
						title={""}
						style={{position: 'absolute', left: 0, top: 0}}
						backgroundColor={Colors.transparent}
						navigator={this.props.navigator}
						onLeftButtonPress={() => this.props.navigator.pop()}
						leftButtonIcon={Icon.backWhite}/>
				</View>
				<View style={{
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					position: 'absolute',
					bottom: 0,
				}}>
					<TouchableOpacity onPress={() => this.shot()} style={{
						width: deviceWidth,
						height: common.adaptHeight(100),
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<Text style={{color: Colors.white, fontSize: 14, backgroundColor: Colors.transparent}}>拍摄</Text>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					onPress={ () => this.setState({shotVisible: false})}
					style={{position:'absolute', width: deviceWidth, height: deviceHeight, top:this.state.shotVisible ? 0 : deviceHeight}}>
					<View style={{
						flex: 1,
						backgroundColor: 'rgba(0,0,0,0.8)',
						justifyContent: 'center',
						alignItems: 'center'
					}}>
						<View style={{
							alignItems: 'center',
							backgroundColor: '#fff',
							height: deviceWidth,
							width: deviceWidth - 50,
							borderRadius: 4,
							position: 'relative'
						}}>
							<Text style={{
								color: '#000',
								fontSize: 18,
								marginTop: 26,
								marginBottom: 18,
								fontWeight: 'bold'
							}}>想用这张图作为封面吗？</Text>
							<Image source={this.state.previewSource} style={{width: 200, height: 200}}
								   resizeMode={'cover'}/>
							<View style={{
								flexDirection: 'row',
								position: 'absolute',
								bottom: 0,
								left: 0,
								borderTopWidth: 1,
								borderTopColor: '#cdcdcd'
							}}>
								<TouchableOpacity
									onPress={this._cancleRetake}
									style={{
										width: (deviceWidth - 50) / 2,
										height: 50,
										justifyContent: 'center',
										alignItems: 'center'
									}}>
									<Text style={{color: '#000'}}>重拍</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={this._uploadPreview}
									style={{
										width: (deviceWidth - 50) / 2,
										height: 50,
										justifyContent: 'center',
										alignItems: 'center',
										borderLeftWidth: 1,
										borderLeftColor: '#cdcdcd'
									}}>
									<Text style={{color: '#000'}}>确认并发布</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
					<Toast ref={(toast) => this.toast = toast}/>
					<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
				</TouchableOpacity>
			</View>
		)
	}
}
