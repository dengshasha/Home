/**
 * Created by Melody.Deng on 2017/9/11.
 */

import React, {Component} from 'react';
import {
	View,
	Text,
	Image,
	WebView,
	TouchableOpacity,
	StyleSheet,
	ListView,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import NavigationBar from '../../components/NavigationBar';
import Colors from '../../constants/Colors';
import * as common from '../../utils/CommonUtils';
import {ApiMap, CommunityApiMap} from '../../constants/Network';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import SchemeHandler from '../../utils/SchemeHandler';
import ProductListPage from './ProductListPage';

import PreloadImage from '../../components/PreloadImage';
import * as Icon from '../../images/';
import {PanoramaSharedModal } from '../../components/Modal';
import styles from '../../styles/productReplace';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();
const apiRequest = new ApiRequest();

//listView物品图片的宽度
const listViewProductWidth = (deviceWidth - 70 / 375 * deviceWidth) / 4; //listViewContainer的左右边距15 * 2 + 图片之间的边距（4张图片）5 * 4 * 2 = 70


//分享图标
const shareIcon = require('../../images/design/icon_share.png');
//替换后图标
const replaceIcon = require('../../images/design/icon_replace.png');
//选择图标
const chooseIcon = require('../../images/design/icon_choose.png');

const TAB_TYPE_RECOMMEND = 'TAB_TYPE_RECOMMEND';
const TAB_TYPE_COLLECTION = 'TAB_TYPE_COLLECTION';

var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 != row2});

class TaoBaoWebView extends Component {
	constructor(props){
		super(props);
	}

	render() {
		return (
			<View style={{flex: 1}}>
				<NavigationBar
					title = {'淘宝连接'}
					logoIcon = {Icon.logoBlack}
					verticalLineColor = {Colors.black}
					titleColor = {Colors.black}
					backgroundColor = {Colors.white}
					onLeftButtonPress = {()=>this.props.navigator.pop()}
					rightButtonIcon1 = {Icon.customerBlack}
					leftButtonIcon = {Icon.backBlack} />
				<WebView source ={{uri: this.props.taobaoWebUrl}}/>
			</View>
		);
	}
}

export default class ProductReplacePage extends Component {

	constructor (props) {
		super(props);

		this.state = {
			dataSource: ds,
			isFetching: false,
			fetchingText: '',
			tempItem: '', //替换物品的临时数据
			tabState: TAB_TYPE_RECOMMEND, //收藏夹|推荐
			showShareModal: false, //分享弹框
			shareReplaceProduct: true, //左边是被替换的图片，右边是替换的图片，打开分享弹框时需要标识分享的物品是被替换的还是替换的，为true代表是替换的图片
			selectedId: -1, //选中的物品|材质id
		};
		this.actionType = this.props.route.actionType; //'common': 普通方案 'activity': 活动方案
		this.activityId = this.props.route.activityId; //方案Id
		this.productData = this.props.route.productData; // 当前显示的物品数据对象
		this.isProduct = this.props.isProduct; //识别是物品还是材质

		this.collectionData = []; //普通收藏的物品|材质数据
		this.recommendData = []; //普通推荐的物品|材质数据
		this.recommendIndex = 1; //普通推荐的材质|物品索引
		this.collectionIndex = 1; //普通收藏的材质|物品索引
		this.activityData = []; //活动材质|物品数据
		this.activityIndex = 1; //活动材质|物品索引
	}

	componentDidMount() {
		this.onLoadData()
	}

	onLoadData() {
		switch (this.actionType) {
			case 'activity' : // 活动,没有收藏物品或材质，只请求精选的数据
				this.requestActivityData();
				break;
			case 'common' : // 普通
				if (this.state.tabState === TAB_TYPE_RECOMMEND){ //请求推荐的物品或者材质
					this.requestCommonData();
				} else { // 请求收藏的物品或者材质,只有普通方案才有收藏
					this.requestCollectionData();
				}
				break;
			default: return;
		}
	}

	//获取活动物品|材质
	requestActivityData() {
		let apiUrl = '';
		let params = {
			activityCategory: this.productData.categoryId,
			communityIndex: this.activityIndex,
			activityId: this.activityId
		};
		if (this.isProduct) { // 物品 product
			apiUrl = CommunityApiMap.getProduct;
			this.setState({isFetching: true, fetchingText: '正在为您准备更多物品...'});
		} else {
			apiUrl = CommunityApiMap.getActivityMaterial;
			this.setState({isFetching: true, fetchingText: '正在为您准备更多材质...'});
		}

		apiRequest.request(apiUrl, params, null, (status, response) => {
			this.setState({isFetching: false, fetchingText: ''});
			if (status) {
				this.activityData = [...this.activityData, ...response.data];
				this.setState({
					dataSource: this.state.dataSource.cloneWithRows(this.activityData),
					total: response.total
				});
			} else {
				showErrorAlert(response);
			}
		})
	}

	//获取普通的推荐方案|物品
	requestCommonData() {
		let apiUrl = '';
		let params = {
			category: this.productData.categoryId,
			index: this.recommendIndex,
		};
		if (this.isProduct) { // 物品
			apiUrl = ApiMap.getProducts;
			this.setState({isFetching: true, fetchingText: '精选物品获取中，请稍候...'});
		} else { // 材质
			apiUrl = ApiMap.getMaterials;
			this.setState({isFetching: true, fetchingText: '精选材质获取中，请稍候...'});
		}
		apiRequest.request(apiUrl, params, null, (status, response) => {
			this.setState({isFetching: false, fetchingText: ''});
			if (status) {
				this.recommendData = [...this.recommendData, ...response.data];
				this.setState({dataSource: this.state.dataSource.cloneWithRows(this.recommendData), total: response.count})
			} else {
				showErrorAlert(response);
			}
		})
	}

	//获取普通的收藏方案|物品
	requestCollectionData() {
		let apiUrl = '';
		let params = {
			category: this.productData.categoryId,
			index: this.collectionIndex,
		};

		if (this.isProduct) { // 物品
			apiUrl = ApiMap.collectedProduct;
			this.setState({isFetching: true, fetchingText: '收藏物品获取中，请稍候...'});
		} else { // 材质
			apiUrl = ApiMap.collectedMaterial;
			this.setState({isFetching: true, fetchingText: '收藏材质获取中，请稍候...'});
		}
		apiRequest.request(apiUrl, params, null, (status, response) => {
			this.setState({isFetching: false, fetchingText: ''});
			if (status) {
				this.collectionData = [...this.collectionData, ...response.data];
				this.setState({dataSource: this.state.dataSource.cloneWithRows(this.collectionData), total: response.count})
			} else {
				showErrorAlert(response);
			}
		})
	}

	//切换收藏夹|精选
	onShowChange(tabState) {
		this.setState({tabState: tabState});
		switch (tabState) {
			case TAB_TYPE_COLLECTION: // todo 收藏
				this.collectionData = [];
				this.collectionIndex = 1;
				this.requestCollectionData();
				break;
			case TAB_TYPE_RECOMMEND:
				this.recommendData = [];
				this.recommendIndex = 1;
				this.requestCommonData(); // todo 推荐
				break;
		}
	}

	//加载更多
	onLoadMore() {
		switch (this.actionType) {
			case 'activity' : // 活动,没有收藏物品或材质，只请求精选的数据
				if (this.state.total > this.activityData.length) {
					this.activityIndex++;
					this.requestActivityData();
				}
				break;
			case 'common' : // 普通
				if (this.state.tabState === TAB_TYPE_RECOMMEND && this.state.total > this.recommendData.length){ //请求推荐的物品或者材质
					this.recommendIndex++;
					this.requestCommonData();
				} else { // 请求收藏的物品或者材质,只有普通方案才有收藏
					if (this.state.total > this.collectionData.length) {
						this.collectionIndex++;
						this.requestCollectionData();
					}
				}
				break;
			default: return;
		}

	}

	//选择物品
	chooseProduct(item, rowId){
		let data = [];
		switch (this.actionType) {
			case 'activity' : // 活动,没有收藏物品或材质，只请求精选的数据
				data = this.activityData;
				break;
			case 'common' : // 普通
				if (this.state.tabState === TAB_TYPE_RECOMMEND){ //请求推荐的物品或者材质
					data = this.recommendData
				} else { // 请求收藏的物品或者材质,只有普通方案才有收藏
					data = this.collectionData
				}
				break;
			default: return;
		}
		this.setState({
			tempItem: item,
			selectedId: rowId,
			dataSource: ds.cloneWithRows(data)
		});
	}

	//替换物品
	onApply() {
		let newTmpScheme;
		let theItem =  this.state.tempItem.origin_id ? {...this.state.tempItem, id: this.state.tempItem.origin_id} : this.state.tempItem;
		if (this.props.isProduct) {
			newTmpScheme = SchemeHandler.modifyProduct({  // 替换过的新方案
				scheme: SchemeHandler.scheme, // 原始方案
				item: this.productData,       // 替换前的物品
				DNAItem: theItem});         // 替换后的物品
		} else {
			newTmpScheme = SchemeHandler.modifyMaterial({
				scheme: SchemeHandler.scheme,
				item: this.productData,
				DNAItem: theItem});
		}
		SchemeHandler.scheme = newTmpScheme ; // -> 新方案 bug 只能进行两次次替换
		this.props.navigator.replace({
			id: 'ProductListPage',
			component: ProductListPage,
			activityId: this.props.route.activityId,
			originSchemeId: this.props.route.originSchemeId,
			actionType: this.props.route.actionType
		});
	}

	onLeftBack () {
		this.props.navigator.replace({
			id: 'ProductListPage',
			component: ProductListPage,
			activityId: this.props.route.activityId,
			originSchemeId: this.props.route.originSchemeId,
			actionType: this.props.route.actionType,
			productPosition: this.props.route.productPosition,
			meterialPosition: this.props.route.meterialPosition,
		});
	}

	_renderRow(rowData, sectionId, rowId) {
		let imageUrl = rowData.images + '?imageView2/0/w/' + (parseInt(listViewProductWidth) * 2).toString();
		return(
			<TouchableOpacity style={styles.productBtn} onPress={() => this.chooseProduct(rowData, rowId)}>
				<PreloadImage
					isTouched={false}
					style={styles.productImage}
					url={imageUrl}
					resizeMode={'contain'}
				/>
				{this.state.selectedId == rowId ? <Image source={chooseIcon} style={styles.chooseIcon} /> : <Text />}
			</TouchableOpacity>
		)
	}

	render () {
		//被替换的物品|材质（左边）
		let imageUrl = this.productData.images + '?imageView2/0/w/' + parseInt(common.getWidth() * 2).toString();
		//替换的物品|材质（右边）
		let replaceImgUrl = this.state.tempItem && this.state.tempItem.images + '?imageView2/0/w/' + parseInt(common.getWidth() * 2).toString();

		return (
			<View style={{flex: 1, backgroundColor: Colors.mainBgColor}}>
				<NavigationBar
					title={'物品替换'}
					logoIcon={Icon.logoBlack}
					verticalLineColor={Colors.black}
					navigator={this.props.navigator}
					titleColor={Colors.black}
					backgroundColor={Colors.white}
					onLeftButtonPress={()=>this.onLeftBack()}
					rightButtonIcon1={Icon.customerBlack}
					leftButtonIcon={Icon.backBlack}/>
				<View style={styles.showImageContainer}>
					<View>{/*左边物品图片展示view*/}
						<View style={styles.commonProductContainer}>
							<PreloadImage
								isTouched={false}
								url={imageUrl}
								style={styles.commonProductImage}
							/>
							<TouchableOpacity style={styles.shareBtn}
							                  onPress={() => this.setState({showShareModal: true, shareReplaceProduct: false})}>
								<Image source={shareIcon}/>
							</TouchableOpacity>
						</View>
						<View style={styles.textContainer}>
							<Text style={{color: Colors.black, fontSize: 14}}>{this.productData.name}</Text>
							<TouchableOpacity style = {styles.purchaseButton}
							                  onPress={() => this.props.navigator.push({
								                  component: TaoBaoWebView,
								                  params: {taobaoWebUrl: this.state.tempItem.taobao_link ? this.state.tempItem.taobao_link : 'https://www.taobao.com'}
							                  })}>
								<Text style = {{color: Colors.white}}>购买地址</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.replaceContainer}>{/*图片之间替换文字view*/}
						<Image source={replaceIcon} />
						<Text style={{fontSize: 10, marginTop: 10 / 667 * deviceHeight}}>替换后</Text>
					</View>
					<View>{/*右边物品图片展示view*/}
						<View style={styles.commonProductContainer}>
							{this.state.tempItem ?
								<View>
									<PreloadImage
										isTouched={false}
										url={replaceImgUrl}
										style={styles.commonProductImage}
									/>
									<TouchableOpacity style={styles.shareBtn}
									                  onPress={() => this.setState({showShareModal: true, shareReplaceProduct: true})}>
										<Image source={shareIcon}/>
									</TouchableOpacity>
								</View>
								:
								<Text style={{color: Colors.lightGrey}}>
									请选择列表内{'\n'}
									物品进行替换
								</Text>
							}
						</View>
						{this.state.tempItem ?
							<View style={styles.textContainer}>
								<Text style={{color: Colors.black, fontSize: 14}}>{this.state.tempItem ? this.state.tempItem.name : ''}</Text>
								<TouchableOpacity style = {styles.purchaseButton}>
									<Text style = {{color: Colors.white}}>购买地址</Text>
								</TouchableOpacity>
							</View>
							:
							<Text />
						}
					</View>
				</View>{/*end of showImageContainer*/}

				{/*替换按钮*/}
				<View style={styles.replaceBtnContainer}>
					{this.state.tempItem
						?
						<TouchableOpacity style={styles.replaceBtn} onPress={() => this.onApply()}>
							<Text style={styles.replaceBtnText}>替&nbsp;&nbsp;换</Text>
						</TouchableOpacity>
						:
						<View style={[styles.replaceBtn,{backgroundColor: '#cdcdcd'}]}>
							<Text style={styles.replaceBtnText}>替&nbsp;&nbsp;换</Text>
						</View>
					}
				</View>
				<View style={styles.btnAndListViewContainer}>
					{/*收藏夹|精选按钮View*/}
					{this.actionType === 'common' &&
						<View style={styles.chooseBtnContainer}>
							<TouchableOpacity onPress={()=>this.onShowChange(TAB_TYPE_COLLECTION)} style={styles.chooseBtn}>
								<Text style={{
									color: this.state.tabState === TAB_TYPE_COLLECTION ? Colors.mainColor : '#cdcdcd',
									fontSize:16,
									fontWeight: 'bold',
								}}>收藏夹</Text>
							</TouchableOpacity>
							<View style={styles.verticalLine} />
							<TouchableOpacity onPress={()=>this.onShowChange(TAB_TYPE_RECOMMEND)} style={styles.chooseBtn}>
								<Text style={{
									color: this.state.tabState === TAB_TYPE_RECOMMEND ? Colors.mainColor : '#cdcdcd',
									fontSize: 16,
									fontWeight: 'bold',
								}}>精选</Text>
							</TouchableOpacity>
						</View>
					}
					<ListView
						enableEmptySections={true}
						initialListSize={30}
						dataSource={this.state.dataSource}
						renderRow={this._renderRow.bind(this)}
						onEndReached={this.onLoadMore.bind(this)}
						onEndReachedThreshold = {50}
						contentContainerStyle={styles.listViewContainer}/>
				</View>

				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
				<Toast ref={(toast) => this.toast = toast}/>
				{/*shareReplaceProduct为true代表是替换的图片*/}
				<PanoramaSharedModal
					url={this.state.shareReplaceProduct ? replaceImgUrl : imageUrl}
					visible={this.state.showShareModal}
					closeShareDialog={() => this.setState({showShareModal: false})}/>
			</View>
		)
	}
}


