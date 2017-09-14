import React, { Component } from 'react'
import {
	Image,
	Text,
	View,
	WebView,
	Platform,
	ListView,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback
} from 'react-native'
import Toast from 'react-native-easy-toast'
import * as common from '../../utils/CommonUtils'
import SchemeHandler from '../../utils/SchemeHandler'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import Colors from '../../constants/Colors'
import { ApiMap, CommunityApiMap } from '../../constants/Network'
import PullRefreshListView from '../../components/PullRefreshListView'
import NavigationBar from '../../components/NavigationBar'
import { PanoramaSharedModal } from '../../components/Modal'
import PreloadImage from '../../components/PreloadImage'
import CrosswalkWebView from '../../libs/react-native-webview-crosswalk'
import Spinner from '../../libs/react-native-loading-spinner-overlay'
import Orientation from '../../libs/react-native-orientation'
import OthersPanoramaPage from '../activity/OthersPanoramaPage'
import ImportedSchemeDetail from '../activity/ImportedSchemeDetail'
import CommentPage from '../design/CommentPage'
import StylePage from '../style/StylePage'
import MyStyleList from '../style/MyStyleList'
import DesignerPage from '../style/DesignerPage'
import WebShoppingPage from './WebShoppingPage'


import styles from '../../styles/share'
import * as Images from '../../images/share/main'
let deviceWidth = common.getWidth()
let deviceHeight = common.getHeight()

const apiRequest = new ApiRequest()

const productListIcon = require('../../images/scheme/panorama/panorama_product_list.png'); //物品清单图标

const TAB_TYPE_ESSENCE = 'TAB_TYPE_ESSENCE'
const TAB_TYPE_COMMUNITY = 'TAB_TYPE_COMMUNITY'

/**
 * 作品分享-最新全景图的保存DNA风格
 * 1、页面布局
 * 2、根据origin_id获取原始方案的数据
 * 3、备份dna数据
 * 4、保存到自己的风格里面
 */
class SaveWorksDna extends Component {
	constructor (props) {
		super(props)
		this.state = {
			dnaName: '玩家达人',
			isFetching: false,
			fetchingText: ''
		}
	}

	componentWillUnmount () {
		this.timer && clearTimeout(this.timer)
	}

	/**
	 * 1、根据方案的原始id，下载dna
	 * 2、直接取相应数据
	 * 3、备份
	 */
	downloadDna () {
		let {origin_id} = this.props
		let scheme
		// 获取方案
		this.setState({isFetching: true, fetchingText: '正在获取DNA...'})
		apiRequest.request(ApiMap.getScheme, {version: origin_id}, null, (status, res) => {
			this.setState({isFetching: false})
			if (status) {
				// 备份
				this.setState({isFetching: true, fetchingText: '下载DNA...'})
				SchemeHandler.newScheme('tempScheme', res.data, (stat, response) => {
					this.setState({isFetching: false})
					if (stat) {
						let body = {
							schemeVersionId: response.newId,
							name: this.state.dnaName,
							images: SchemeHandler.getScreenshot(res.data),
							description: res.data.description || '',
							areaVersionId: res.data.areas[0].id
						}

						apiRequest.request(ApiMap.saveDna, null, body, (sta, responseData) => {
							if (sta) {
								this.refs.toast.show('保存成功')
								this.timer = setTimeout(() => this.props.navigator.replace({
									component: MyStyleList
								}), 1000)
							} else {
								this.refs.toast.show('保存失败')
							}
						})
					} else {
						showErrorAlert(res)
					}
				})
			} else {
				showErrorAlert(res)
			}
		})
	}

	render () {
		let {thumbnail} = this.props
		return (
			<Image source={{uri: thumbnail}} style={{flex: 1}} resizeMode={'cover'}>
				<NavigationBar
					backgroundColor={'transparent'}
					title={'风格名称'}
					titleColor={'#fff'}
					navigator={this.props.navigator}
					style={{position: 'absolute'}}
					onLeftButtonPress={() => this.props.navigator.pop()}
					leftButtonIcon={require('../../images/common/icon_back_white.png')}
					logoIcon={require('../../images/common/logo_white.png')}
					rightButtonIcon1={require('../../images/common/icon_customer_white.png')}
				/>
				<View style={{
					position: 'absolute',
					top: common.adaptWidth(160),
					width: deviceWidth,
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<TextInput
						placeholderTextColor={Colors.lightWhite}
						autoFocus={true} placeholder={'请填写DNA风格名称'}
						underlineColorAndroid="transparent"
						onChangeText={(text) => this.setState({dnaName: text})}
						value={this.state.dnaName}
						style={{
							color: Colors.white,
							width: deviceWidth - 40,
							height: 40,
							borderWidth: 1,
							borderColor: 'white',
							borderRadius: 5,
							alignSelf: 'center',
							marginTop: common.adaptWidth(100),
							backgroundColor: Colors.lightGrey
						}}/>
					<TouchableOpacity onPress={() => this.downloadDna()} style={{
						width: deviceWidth - 40,
						height: 40,
						alignItems: 'center',
						justifyContent: 'center',
						borderWidth: 1,
						borderColor: Colors.mainColor,
						backgroundColor: Colors.mainColor,
						borderRadius: 5,
						marginTop: 80
					}}>
						<Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>保存风格</Text>
					</TouchableOpacity>
				</View>
				<Toast ref='toast'/>
				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
			</Image>
		)
	}
}

/**
 * 作品分享-最新的作品单项
 */
class TempPano extends Component {

	constructor (props) {
		super(props)
		this.state = {
			panoUrl: '', // 全景图url
			worksData: null,
			showDownAlert: false,
			showShareModal: false //微信分享
		}
	}

	componentDidMount () {
		Orientation.addOrientationListener((orientation) => {
			if (orientation === 'LANDSCAPE') {
				deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getWidth() - 20 : common.getNormalHeight() - 20
				deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() : common.getWidth()
			} else if (orientation === 'PORTRAIT') {
				deviceWidth = common.getNormalHeight() > common.getWidth() ? common.getWidth() : common.getNormalHeight()
				deviceHeight = common.getNormalHeight() > common.getWidth() ? common.getNormalHeight() - 20 : common.getWidth() - 20
			}
		})
		this.getWorksDetail()
	}

	componentWillUnmount () {
		Orientation.removeOrientationListener()
	}

	/**
	 * getWorksDetail
	 * @desc: 获取作品详情
	 */
	getWorksDetail () {
		let {works_id} = this.props
		apiRequest.request(CommunityApiMap.getWorksDetail, {worksId: works_id}, null, (status, res) => {
			if (status) {
				let panoList = SchemeHandler.getPanosUrl(res.panos)
				let panoUrl = SchemeHandler.getImageListPanoramaUrl(panoList)
				delete res.items
				delete res.panos
				this.setState({panoUrl, worksData: res})
			} else {
				showErrorAlert(res)
			}
		})
	}

	/**
	 * 渲染全景图
	 * @param: url 全景图url
	 */
	_renderWebView (url) {

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

	/**
	 * 渲染头像
	 * @param: worksData 作品数据，主要取用户的头像url
	 */
	_renderavater (worksData) {
		let {author} = worksData
		if (author) {
			let avater = author.avatar_url
			return (
				<TouchableOpacity onPress={() => {
					if (avater) {
						this.props.navigator.push({
							component: DesignerPage,
							userId: worksData.author.user_id
						})
					}
				}}>
					<Image
						source={avater ? {uri: author.avatar_url} : require('../../images/user/mine_icon_head.png')}
						style={{
							width: common.adaptWidth(100),
							height: common.adaptWidth(100),
							marginTop: common.adaptWidth(140),
							borderRadius: common.adaptWidth(50),
							borderWidth: 2,
							borderColor: '#fff'
						}}/>
				</TouchableOpacity>
			)
		}
		return null
	}

	/**
	 * 切入评论页面
	 * @param: worksData 作品数据
	 */
	enterCommentPage (worksData) {
		this.props.navigator.push({id: 'CommentPage', component: CommentPage, params: {works_id: worksData.works_id}})
	}

	//跳转到物品清单页面
	enterProductListPage(worksData) {
		this.props.navigator.push({id: 'WebShoppingPage', component: WebShoppingPage, params: {originId: worksData.origin_id}})
	}

	/**
	 * 下载风格提示框
	 * @returns {XML}
	 */
	downloadAlert (worksData) {
		return (
			<View style={{
				position: 'absolute',
				alignItems: 'center',
				justifyContent: 'center',
				top: 0,
				width: deviceWidth,
				height: deviceHeight,
				backgroundColor: 'rgba(0,0,0,.8)',
			}}>
				<View style={{
					alignSelf: 'center',
					alignItems: 'center',
					backgroundColor: 'rgba(255,255,255,0.9)',
					borderRadius: 10,
					height: 180 / 667 * deviceHeight,
					width: deviceWidth - 100 / 375 * deviceWidth
				}}>
					<View style={{flex: 1}}>
						<Text style={{
							fontSize: 20,
							color: Colors.black,
							lineHeight: 40,
							fontWeight: 'bold'
						}}>下载风格套用到我家</Text>
					</View>
					<View style={{flex: 1}}>
						<Text style={{fontSize: 18, color: 'red', lineHeight: 40, fontWeight: 'bold'}}>¥ 0</Text>
					</View>
					<TouchableOpacity style={{flex: 1}}>
						<Text style={{fontSize: 18, color: 'rgb(113,186,246)', lineHeight: 30}}>作品购买协议</Text>
					</TouchableOpacity>

					<View style={{flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'lightgray'}}>
						<TouchableOpacity style={[{
							flex: 1,
							alignItems: 'center',
							justifyContent: 'center',
							padding: 10,
						}, {
							borderRightWidth: 1,
							borderRightColor: 'lightgray'
						}]} onPress={() => this.setState({showDownAlert: false})}>
							<Text style={{fontSize: 18, color: 'rgb(113,186,246)'}}>取消</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{
							flex: 1,
							alignItems: 'center',
							justifyContent: 'center',
							padding: 10,
						}} onPress={() => this.props.navigator.push({
							id: 'saveWorksDna',
							component: SaveWorksDna,
							params: {thumbnail: worksData.thumbnail, origin_id: worksData.origin_id}
						})}>
							<Text style={{fontSize: 18, color: 'rgb(113,186,246)'}}>确定</Text>
						</TouchableOpacity>
					</View>

				</View>
			</View>
		)
	}

	/**
	 * 右侧功能按钮
	 * @param: worksData 作品数据，主要取用户的头像url
	 * 1、下载风格
	 * 2、评论
	 * 3、点赞
	 * 4、分享
	 */
	_renderButtons (worksData) {
		if (worksData) {
			let buttons = [
				// {
				//     text: '下载风格',
				//     icon: Images.save,
				//     onPress: () => this.setState({showDownAlert: true})
				// },
				{
					text: '评论',
					icon: Images.commentIcon,
					onPress: () => this.enterCommentPage(worksData)
				}, {
					text: worksData.like_count + '个赞',
					icon: worksData.is_liked ? Images.hoverLikeIcon :Images.whiteLikeIcon,
					onPress: () => {
						let body = {works_id: worksData.works_id}
						apiRequest.request(CommunityApiMap.postWorksLike, null, body, (status, res) => {
							if (status) {
								this.getWorksDetail()
								this.toast.show('感谢您的点赞')
							} else {
								this.toast.show(res)
							}
						})
					}
				}, {
					text: '分享',
					icon: Images.shareIcon,
					onPress: () => this.setState({showShareModal: true})
				},{
					text: '物品清单',
					icon: productListIcon,
					onPress: () => this.enterProductListPage(worksData)
				}]

			return buttons.map((button, index) => {
				return (
					<TouchableWithoutFeedback key={index} onPress={button.onPress}>
						<View style={{
							justifyContent: 'center',
							alignItems: 'center',
							marginTop: common.adaptWidth(20)
						}}>
							<Image source={button.icon}/>
							<Text style={{color: '#fff'}}>{button.text}</Text>
						</View>
					</TouchableWithoutFeedback>
				)
			})
		}
		return null
	}

	render () {
		let {panoUrl, worksData} = this.state

		return (
			<View style={{flex: 1}}>
				{Boolean(panoUrl) && this._renderWebView(panoUrl)}
				<NavigationBar
					backgroundColor={'transparent'}
					title={''}
					navigator={this.props.navigator}
					style={{position: 'absolute'}}
					onLeftButtonPress={() => this.props.navigator.pop()}
					leftButtonIcon={require('../../images/common/icon_back_white.png')}
					logoIcon={require('../../images/common/logo_white.png')}
					rightButtonIcon1={require('../../images/common/icon_customer_white.png')}
				/>
				<View style={{position: 'absolute', right: common.adaptWidth(20), top: 0}}>
					{Boolean(worksData) && this._renderavater(worksData)}
					<View style={{
						alignItems: 'center',
						marginTop: common.adaptWidth(100)
					}}>
						{this._renderButtons(worksData)}
					</View>
				</View>
				{/*
				 {Boolean(this.state.showDownAlert) && this.downloadAlert(worksData)}
				 */}
				<Toast ref={(toast) => this.toast = toast}/>
				{Boolean(worksData) && <PanoramaSharedModal
					thumbImage={worksData.thumbnail}
					url={panoUrl}
					visible={this.state.showShareModal}
					closeShareDialog={() => this.setState({showShareModal: false})}/>}
			</View>
		)
	}
}

export default class SharePage extends Component {
	constructor (props) {
		super(props)
		let ds = new ListView.DataSource({
			rowHasChanged: (row1, row2) => row1 != row2
		})
		this.state = {
			isFetching: false,
			fetchingText: '',
			essenceDataSource: ds,
			newSchemeData: [],
			tabState: TAB_TYPE_COMMUNITY,
			dataSource: ds,
			footState: 0 //上拉加载更多
		}
		this.communitySchemeIndex = 1
		this.essenceSchemeIndex = 1

		this.essenceSchemeData = []
		this.communityData = []

		this.loadEssenceTime = 0
		this.loadCommunityTime = 0

		// this.collectScheme = this.collectScheme.bind(this);
		// this.likeScheme = this.likeScheme.bind(this);
	}

	componentDidMount () {
		this.loadScheme(TAB_TYPE_COMMUNITY)
	}

	//加载精华|最新方案
	loadScheme (tabState) {

		this.setState({
			tabState: tabState,
			dataSource: this.state.dataSource.cloneWithRows([])
		})

		switch (tabState) {
			case TAB_TYPE_ESSENCE :
				if (this.loadEssenceTime === 0) {
					this.setState({isFetching: true, fetchingText: '加载中，请稍候...'})
					this.getEssenceScheme()
					this.loadEssenceTime++
				} else {
					this.setState({dataSource: this.state.dataSource.cloneWithRows(this.essenceSchemeData)})
				}
				break
			case TAB_TYPE_COMMUNITY :
				if (this.loadCommunityTime === 0) {
					this.setState({isFetching: true, fetchingText: '加载中，请稍候...'})
					this.getCommunityScheme()
					this.loadCommunityTime++
				} else {
					this.setState({dataSource: this.state.dataSource.cloneWithRows(this.communityData)})
				}
				break
		}
	}

	//请求精华 数据
	getEssenceScheme (resolve) {
		apiRequest.request(ApiMap.getSchemes, {index: this.essenceSchemeIndex}, null, (status, response) => {
			this.setState({isFetching: false})
			if (status) {
				resolve && resolve()
				this.essenceSchemeData = [...this.essenceSchemeData, ...response.data]
				this.setState({dataSource: this.state.dataSource.cloneWithRows(this.essenceSchemeData)})
			}
		})
	}

	//请求最新 数据
	getCommunityScheme (resolve) {
		apiRequest.request(CommunityApiMap.getSchemeList, {
			communityIndex: this.communitySchemeIndex,
			order: 'desc'
		}, null, (status, response) => {
			this.setState({isFetching: false, fetchingText: ''})
			if (status) {
				resolve && resolve()
				// 获取到整体数据
				// 截取正确的缩略图 http://designshot.s.vidahouse.com/ 过滤正确的封面数据
				// let filters = this.communityData.filter( scheme => scheme.thumbnail.slice(0, 34) === 'http://designshot.s.vidahouse.com/');
				// 当前索引为1，重新获取
				console.log(response.data)
				let tmpdata = response.data
				this.communityData = [...this.communityData, ...tmpdata]
				this.setState({dataSource: this.state.dataSource.cloneWithRows(this.communityData)})
			} else {
				showErrorAlert(response)
			}
		})
	}

	//下拉刷新
	onPullRelease (resolve) {
		switch (this.state.tabState) {
			case TAB_TYPE_ESSENCE :
				this.essenceSchemeData = []
				this.essenceSchemeIndex = 1
				this.getEssenceScheme(() => {this.hideRefreshLogo(resolve)})
				break
			case TAB_TYPE_COMMUNITY :
				this.communitySchemeIndex = 1
				this.communityData = []
				this.getCommunityScheme(() => this.hideRefreshLogo(resolve))
				break
		}
	}

	//下拉刷新完成回调
	hideRefreshLogo (resolve) {
		this.timer = setTimeout(() => {
			resolve()
			this.toast.show('刷新成功')
		}, 500)
	}

	//加载更多
	_onLoadMore () {
		switch (this.state.tabState) {
			case TAB_TYPE_ESSENCE :
				if (this.essenceSchemeData.length % 20 === 0 && this.essenceSchemeData.length !== 0) {
					this.setState({footState: 1}) //footState = 1:加载中
					this.timer = setTimeout(() => {
						this.essenceSchemeIndex++
						this.getEssenceScheme()
					}, 800)
				} else {
					this.setState({footState: 2})//footState = 2:加载完成
				}
				break
			case TAB_TYPE_COMMUNITY :
				if (this.communityData.length % 20 === 0 && this.communityData.length !== 0) {
					this.setState({footState: 1}) //footState = 1:加载中
					this.timer = setTimeout(() => {
						this.communitySchemeIndex++
						this.getCommunityScheme()
					}, 800)

				} else {
					this.setState({footState: 2})//footState = 2:加载完成
				}
				break
		}
	}

	enterPanoramaPage (scheme) {
		SchemeHandler.scheme = scheme
		this.props.navigator.push({id: 'OthersPanoramaPage', component: OthersPanoramaPage})
	}

	/**
	 * 切入评论页面
	 * @param: worksData 作品数据
	 */
	enterCommentPage (worksData) {
		this.props.navigator.push({id: 'CommentPage', component: CommentPage, params: {works_id: worksData.works_id}})
	}

	enterSchemeDetail (scheme) {
		this.props.navigator.push({id: 'ImportedSchemeDetail', component: ImportedSchemeDetail, params: {scheme}})
	}

	rowOnClick (scheme) {
		this.enterPanoramaPage(scheme)
	}

	_renderHeader () {
		if (this.state.tabState === TAB_TYPE_ESSENCE) {
			return (
				<TouchableOpacity onPress={() => this.props.navigator.push({id: 'StylePage', component: StylePage})}>
					<Image source={require('../../images/activity/banner.png')}
					       resizeMode={'stretch'}
					       style={{width: deviceWidth, height: 225 / 667 * deviceHeight, paddingTop: 20}}/>
				</TouchableOpacity>
			)
		}
		return null
	}

	// 为上传到社区的作品点赞
	forWorksLike (worksId) {
		apiRequest.request(CommunityApiMap.postWorksLike, null, {works_id: worksId}, (status, res) => {
			if (status) {
				this.toast.show('感谢您的点赞')
				this.communityData = []
				this.getCommunityScheme()
			} else {
				this.toast.show(res)
			}
		})
	}

	_renderRow (rowData, sectionID, rowID) {
		if (this.state.tabState === TAB_TYPE_ESSENCE) {// 精华
			let time = rowData.createdUtc.slice(0, 10)
			let images = SchemeHandler.getScreenshot(rowData, {width: deviceWidth})
			return (
				<View style={{marginTop: 10 / 667 * deviceHeight, width: deviceWidth}}>
					<View style={styles.essenceItemContainer}>
						<View style={{
							flexDirection: 'row',
							flex: 1,
							justifyContent: 'space-between',
							alignItems: 'center'
						}}>
							<Text style={{fontSize: 16, color: Colors.black}}>{rowData.name}</Text>
							<Text style={{fontSize: 12}}>{time}</Text>
						</View>
					</View>
					<PreloadImage
						url={images}
						resizeMode="cover"
						onPress={() => this.rowOnClick(rowData)}
						style={{width: deviceWidth, height: common.adaptWidth(420)}}/>
				</View>
			)
		}
		// 最新
		return (
			<View style={{
				width: common.adaptWidth(342),
				marginTop: 10,
				backgroundColor: Colors.white,
				borderRadius: 4,
			}}>
				<PreloadImage
					url={rowData.thumbnail}
					onPress={() => this.props.navigator.push({
						component: TempPano,
						params: {
							works_id: rowData.works_id
						}
					})}
					resizeMode={'cover'}
					style={styles.communityItemPreImg}>
					<Image
						style={styles.communityItemImg}
						source={Boolean(rowData.author) ? {uri: rowData.author.avatar_url} : require('../../images/user/mine_icon_head.png')}
						resizeMode={'cover'}/>
				</PreloadImage>
				<View style={styles.latestItem}>
					{/*点赞*/}
					<TouchableOpacity onPress={ () => this.forWorksLike(rowData.works_id)}>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<Image source={Images.likeIcon} style={{marginRight: common.adaptWidth(20)}}/>
							<Text>{rowData.like_count ? rowData.like_count : 0}</Text>
						</View>
					</TouchableOpacity>
					<View style={{
						height: common.adaptWidth(32),
						borderLeftWidth: 1,
						borderColor: '#dcdcdc',
						marginHorizontal: common.adaptWidth(46)
					}}/>
					{/*评论*/}
					<TouchableOpacity onPress={() => this.enterCommentPage(rowData)}>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<Image source={Images.comment} style={{marginRight: common.adaptWidth(20)}}/>
							<Text>{rowData.comment_count ? rowData.comment_count : 0}</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	render () {
		return (
			<View style={{flex: 1, backgroundColor: Colors.mainBgColor}}>
				<PullRefreshListView
					processIconYPosition={64}
					contentContainerStyle={this.state.tabState === TAB_TYPE_COMMUNITY ? styles.communityListViewContainer : styles.essenceListViewContainer}
					onPullRelease={this.onPullRelease.bind(this)}
					enableEmptySections={true}
					dataSource={this.state.dataSource}
					upPullState={this.state.footState}
					renderRow={this._renderRow.bind(this)}
					onLoadMore={this._onLoadMore.bind(this)}
					renderHeader={this._renderHeader.bind(this)}
					stickySectionHeadersEnabled={false}
				/>
				<View style={styles.tabContainer}>

					<TouchableOpacity style={styles.tabBtn} onPress={() => this.loadScheme(TAB_TYPE_COMMUNITY)}>
						<Text
							style={[styles.tabText, {color: this.state.tabState === TAB_TYPE_COMMUNITY ? Colors.mainColor : Colors.black}]}>最新</Text>
						{this.state.tabState === TAB_TYPE_COMMUNITY && <View style={styles.tabUnderline}/>}
					</TouchableOpacity>

					<TouchableOpacity style={styles.tabBtn} onPress={() => this.loadScheme(TAB_TYPE_ESSENCE)}>
						<Text
							style={[styles.tabText, {color: this.state.tabState === TAB_TYPE_ESSENCE ? Colors.mainColor : Colors.black}]}>精华</Text>
						{this.state.tabState === TAB_TYPE_ESSENCE && <View style={styles.tabUnderline}/>}
					</TouchableOpacity>

					<TouchableOpacity onPress={() => this.props.navigator.pop()}
					                  style={[styles.leftBtn, {marginTop: global.IOS_PLATFORM ? 35 : 15}]}>
						<Image source={require('../../images/common/icon_back_black.png')}/>
					</TouchableOpacity>
				</View>
				<Toast ref={(toast) => this.toast = toast}/>
				<Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
			</View>
		)
	}

}

SharePage.childContextTypes = {
	collectScheme: React.PropTypes.func,
	likeScheme: React.PropTypes.func,
	// enterCommentPage: React.PropTypes.func
}

// 最新--收藏
//collectScheme(collectId, isCollected,chooseTab) {
//   let apiRequest = new ApiRequest();
//   let data;
//   if(chooseTab === 'new'){
//     data = this.state.newSchemeData;
//   }
//   if(chooseTab === 'essence'){
//     data = this.essenceSchemeData;
//   }
//
//   if (isCollected) { //取消收藏
//
//     apiRequest.request(ApiMap.cancleCollectScheme, {collectId}, null, (status, resData) => {
//       if (status) {
//         // isCollected false
//         for (i in data) {
//           if (data[i].id === collectId) {
//
//             data[i].isCollected = false;
//             if(chooseTab == 'new') {
//               this.setState({newSchemeData: [...data]})
//             }
//             if(chooseTab === 'essence') {
//               data[i] = JSON.parse(JSON.stringify(data[i]))
//               this.setState({essenceDataSource: this.state.essenceDataSource.cloneWithRows([...data])})
//             }
//           }
//         }
//       } else {
//           alert('取消收藏方案，网络出错')
//       }
//     })
//   } else {
//
//     apiRequest.request(ApiMap.collectScheme, {collectId}, null, (status, resData) => {
//       if (status) {
//         for (i in data) {
//           if(data[i].id === collectId) {
//
//             data[i].isCollected = true;
//             if(chooseTab == 'new') {
//               this.setState({newSchemeData: [...data]})
//             }
//             if(chooseTab === 'essence') {
//               data[i] = JSON.parse(JSON.stringify(data[i]))
//               this.setState({essenceDataSource: this.state.essenceDataSource.cloneWithRows([...data])})
//             }
//           }
//         }
//       } else {
//         alert('收藏方案，网络出错')
//       }
//     })
//   }
//}