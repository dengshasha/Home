/**
 * Created by Traveller on 2017/3/13.
 * 物品清单页面
 */
import React  from 'react';
import {
	Text,
	View,
	Alert,
	ListView,
	WebView,
	TouchableOpacity,
	Platform
} from 'react-native';
import ScrollableTabBar, {DivisionalTabBar} from 'react-native-scrollable-tab-view';
import cache from '../../utils/cache';
import SchemeHandler from '../../utils/SchemeHandler';
import PanoramaTaskHandler from '../../utils/PanoramaTaskHandler';
import NavigationBar from '../../components/NavigationBar'
import Colors from '../../constants/Colors';
import {showErrorAlert} from '../../utils/ApiRequest';
import * as common from '../../utils/CommonUtils'
import ProductReplacePage from './ProductReplacePage';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import CrosswalkWebView from '../../libs/react-native-webview-crosswalk';
import QrCodeScan from './QrCodeScan';
import PreloadImage from '../../components/PreloadImage'
import TaskRecords from './TaskRecords';
const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();
// 放大图标
// const ProductListView = require('../../images/scheme/normal/productListView.png');

export default class ProductListPage extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => true});
		this.productDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => true});
		this.tmpProduct = SchemeHandler.productInit(SchemeHandler.scheme);
		this.productDataSource = this.productDataSource.cloneWithRows(this.tmpProduct.schemeProduct);
		this.dataSource = this.dataSource.cloneWithRows(this.tmpProduct.wallMaterials.filter( item => item.materialId !== 86)); // 过滤materialId == 86 (闹钟问题)
		this.productPosition = 0;
		this.meterialPosition = 0;
		this.state = {
			tabIndex: cache.productListPage.tabIndex,
			isProduct: cache.productListPage.tabIndex === 0 // 判断物品还是材质，
		};
	}

	componentDidMount() {
		global.IOS_PLATFORM && this.tabView.goToPage(this.state.tabIndex)
	}

	onProductScroll(event) {
		this.productPosition = event.nativeEvent.contentOffset.y;
	}

	onMeterialScroll(event) {
		this.meterialPosition = event.nativeEvent.contentOffset.y;
	}

	_renderRow(rowData, sectionID, rowID) {
		let imageUrl = rowData.images + '?imageView2/0/w/' + parseInt(deviceWidth * 2).toString();
		let imageSize = parseInt((deviceWidth - 40) / 2);
		return (
			<PreloadImage
				url={imageUrl}
				onPress={() => this.onProductReplace(rowData)}
				style={{width: imageSize, height: imageSize}}
				touchableStyle={{width: imageSize, height: imageSize, margin: 5}}
			/>
		)
	}

	renderWebview() {
		let url = SchemeHandler.getPanoramaUrl().replace(/bar=show/, 'bar=hide');;
		if (Platform.OS === 'ios') {
			return (
				<WebView
					ref="webview"
					javaScriptEnabled={true}
					source={{uri: url}}>
				</WebView>
			)
		} else if (Platform.OS === 'android') {
			return (
				<CrosswalkWebView
					localhost={false}
					style={{flex: 1}}
					url={url}/>
			)
		}
	}

	render() {
		return (
			<View style={{alignItems: 'center', flex: 1, backgroundColor: Colors.mainBgColor}}>
				<View style={{width: deviceWidth, height: deviceHeight}}>
					<View style={{width: deviceWidth, height: deviceWidth * (9 / 16)}}>
						{this.renderWebview()}
						<TouchableOpacity style={{
							position: 'absolute',
							alignSelf: 'center',
							backgroundColor: 'rgba(243,59,88,0.6)',
							width: deviceWidth - 40,
							height: 35,
							bottom: 10,
							borderRadius: 5,
							justifyContent: 'center',
							alignItems: 'center'
						}} onPress={() => this.onUpdateScheme()}>
							<Text style={{fontSize: 16, color: '#fefefe'}}>
								递交任务
							</Text>
						</TouchableOpacity>
					</View>
					{/*递交任务按钮*/}
					<ScrollableTabBar
						renderTabBar={() => <DivisionalTabBar style={{backgroundColor: Colors.white, height: 35}}/>}
						onChangeTab={(obj) => this.onChangeTab(obj)}
						tabBarTextStyle={{fontSize: 16,}}
						initialPage = {this.state.tabIndex}
						tabBarActiveTextColor={Colors.mainColor}
						tabBarUnderlineStyle={{backgroundColor: Colors.transparent, height: 2}}
						ref={(tabView) => {
							this.tabView = tabView;
						}}>

						<View tabLabel='可换物品'>
							<ListView
								ref = {(productListView) => this.productListView = productListView}
								onScroll = {(event) => this.onProductScroll(event)}
								style={{width: deviceWidth, padding: 10,}}
								showsHorizontalScrollIndicator={false}
								dataSource={this.productDataSource}
								initialListSize={200}
								renderRow={this._renderRow.bind(this) }
								contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}/>
						</View>
						<View tabLabel='可换材质'>
							<ListView
								ref = {(meterialListView) => this.meterialListView = meterialListView}
								onScroll = {(event) => this.onMeterialScroll(event)}
								style={{width: deviceWidth, padding: 10,}}
								showsHorizontalScrollIndicator={false}
								dataSource={this.dataSource}
								initialListSize={200}
								renderRow={this._renderRow.bind(this) }
								contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}/>
						</View>
					</ScrollableTabBar>

				</View>
				<NavigationBar
					title={''}
					style={{position: 'absolute', backgroundColor: 'transparent'}}
					titleColor={Colors.white}
					onLeftButtonPress={() => this.onLeftBack()}
					leftButtonIcon={require('../../images/common/icon_back_white.png')}
					onRightButton1Press={() => this.enterScanPage() }
					rightButtonIcon1={require('../../images/design/scan.png')}
				/>

				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>

			</View>
		)
	}

	onChangeTab(obj) {
		cache.productListPage.tabIndex = obj.i;
		if(this.state.tabIndex === 0) {
			this.productListView.scrollTo({y: this.props.route.productPosition})
		} else if(this.state.tabIndex === 1) {
			this.meterialListView.scrollTo({y: this.props.route.meterialPosition})
		}
		// 识别是否是物品或者材质
		if (obj.i === 0) {
			this.setState({isProduct: true})
		} else {
			this.setState({isProduct: false})
		}
	}

	enterScanPage() {
		this.props.navigator.push({id: 'QrCodeScan', component: QrCodeScan})
	}

	// 确定递交任务
	onMakeRender(activityId, originSchemeId) {
		this.setState({
			isFetching: true,
			fetchingText: '任务提交中，请稍后...'
		})
		let scheme = SchemeHandler.scheme; // -> 替换过后的新方案、
		SchemeHandler.newScheme('tempScheme', scheme, (status, responseData) => {
			this.setState({
				isFetching: false,
				fetchingText: ''
			})
			if (status) {
				// todo api返回的渲染次数，如果超过api的渲染次数，不应向c-center递交渲染任务
				PanoramaTaskHandler.postPanoramaTask({...scheme, id: responseData.newId, activityId, originSchemeId, userTags: activityId && `activity+${activityId}`}, () => {
					Alert.alert('任务递交成功！', '点击查看，移至任务列表',
						[
							{text: '继续设计', onPress: () => this.props.navigator.pop()},
							{text: '查看', onPress: () => this.props.navigator.replace({id: 'TaskRecords', component: TaskRecords})}
						])
				});

			} else {
				showErrorAlert(responseData)
			}
		})
	}

	onUpdateScheme() {
		// this.setState({schemeContentData: this.tmpProduct.schemeProduct.concat(this.tmpProduct.wallMaterials) });
		// this.refs['RenderConfirmPage'].setModalVisible(true);
		let { activityId, originSchemeId } = this.props.route;
		Alert.alert('', '确认提交渲染任务吗', [
			{text: '取消', onPress: () => {}},
			{text: '确定', onPress: () => this.onMakeRender(activityId, originSchemeId)}
		])
	}

	onLeftBack() {
		this.props.navigator.pop()
	}

	// onFullScreen() {
	// 	this.props.navigator.pop()
		// let panoramaUrl = SchemeHandler.getPanoramaUrl(SchemeHandler.scheme);
		// this.props.navigator.push({id: 'PanoramaPage', component: PanoramaPage, panoramaUrl: panoramaUrl})
	// }

	onProductReplace(productData) {
		this.props.navigator.replace({
			id: 'ProductReplacePage', component: ProductReplacePage, productData,
			productPosition: this.productPosition, meterialPosition: this.meterialPosition,
			originSchemeId: this.props.route.originSchemeId,
			activityId: this.props.route.activityId, actionType: this.props.route.actionType ||'common',
			params: {isProduct: this.state.isProduct}
		})
	}
}

