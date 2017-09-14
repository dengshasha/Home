/**
 * Created by Traveller on 2017/4/16.
 * 我的风格列表
 */
import React, { Component } from 'react'
import {
	StyleSheet,
	View,
	Text,
	Image,
	Alert,
	ListView,
	ActivityIndicator,
	ProgressBarAndroid,
	ActivityIndicatorIOS,
	TouchableOpacity,
} from 'react-native'
import PullToRefreshListView from 'react-native-smart-pull-to-refresh-listview'
import Toast from 'react-native-easy-toast'

import * as common from '../../utils/CommonUtils'
import Colors from '../../constants/Colors'
import NavigationBar from '../../components/NavigationBar'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import { ApiMap } from '../../constants/Network'
import SchemeHandler from '../../utils/SchemeHandler'
import SmartListViewComponent from '../../components/SmartListViewComponent'
import * as Icon from '../../images/'
import PullRefreshListView from '../../components/PullRefreshListView'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()
const apiRequest = new ApiRequest()
const IconRemove = require('../../images/user/icon_remove.png')

export default class MyStyleList extends Component {

	constructor (props) {
		super(props)
		this.state = {
			myDnaDataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
			footState: 0,
		}
		this.myDnaIndex = 0
		this.myDnaData = []
	}

	componentDidMount () {
		this._getDnaStyleList()
	}

	// 请求风格列表数据
	_getDnaStyleList (resolve) {
		(this.myDnaIndex === 0) && (this.myDnaIndex = 1)

		apiRequest.request(ApiMap.getDnas, {index: this.myDnaIndex, owner: true}, null, (status, res) => {
			resolve && resolve()
			if (status) {
				(this.myDnaIndex <= 1) ? (this.myDnaData = res.data) : (this.myDnaData = [...this.myDnaData, ...res.data])
				this.setState({
					myDnaDataSource: this.state.myDnaDataSource.cloneWithRows(this.myDnaData),
					footState: 0
				})

			} else {
				showErrorAlert('网络出错！')
			}
		})
	}

	publishDNA (DNADAta) {
		Alert.alert(
			'发布DNA',
			'是否确认将此DNA发布，此操作无法撤销',
			[{text: '取消', onPress: () => {}},
				{
					text: '确认', onPress: () => {
					apiRequest.request(ApiMap.publishDNA, {publishId: DNADAta.id}, null, (status, res) => {
						if (status) {
							this.refs.toast.show('发布成功！')
						} else {
							showErrorAlert('网络错误，请检查网络')
						}
					})
				}
				}
			]
		)
	}

	// 发布方案
	_shcemeRelease (DNADAta) {
		const {type} = global.userInfo
		if (DNADAta.published) {
			return (
				<View style={[styles.releasebtn, {borderColor: Colors.lightGrey}]}>
					<Image source={Icon.grayRelease} resizeMode={'contain'}/>
					<Text style={{color: 'gray', fontSize: 12, margin: 2}}>已发布</Text>
				</View>
			)
		}
		/**
		 * @type 1：普通用户 2：设计师 3：提供商
		 */
		if (type === 2) {
			return (
				<TouchableOpacity
					onPress={() => this.publishDNA(DNADAta)}
					style={[styles.releasebtn, {borderColor: Colors.mainColor}]}>
					<Image source={Icon.redRelease} resizeMode={'contain'}/>
					<Text style={{marginLeft: 2, fontSize: 12, color: Colors.mainColor}}>发布</Text>
				</TouchableOpacity>
			)
		}
		return null
	}

	// 渲染每行
	_renderStyleListItem (rowData) {
		// console.log(rowData.name+':' + rowData.images);
		let styleImgUrl = SchemeHandler.getScreenshot(rowData, {width: deviceWidth})

		return (
			<View style={styles.styleListItem}>
				{/*风格截图*/}
				<Image
					source={{uri: styleImgUrl}}
					resizeMode={'cover'}
					style={styles.listItemImg}>
					<View style={{top: 10, left: 10}}>
						<View style={styles.labelRadiusWrap}>
							<View style={styles.labelRadius}/></View>
						<View style={styles.labelNameWrap}>
							<Text
								style={{color: Colors.white, fontSize: 12, marginHorizontal: 12}}>{rowData.name}</Text>
						</View>
					</View>
				</Image>
				<View style={styles.listItemBar}>
					{/*标签*/}
					<View style={styles.listItemBabel}>
						<Text style={{color: Colors.mainColor, fontSize: 10,}}>
							{rowData.description ? rowData.description : '现代风格'}
						</Text>
					</View>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						{this._shcemeRelease(rowData)}
						{/*删除按钮*/}
						<TouchableOpacity
							onPress={() => this._removeDna(rowData.id)}
							style={styles.listItemRemove}>
							<Image
								resizeMode={'cover'}
								source={IconRemove}/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		)
	}

	// 加载更多风格
	_onLoadMore = () => {
		if (this.state.footState !== 0) return
		if (this.myDnaData.length && this.myDnaData.length % 20 === 0) {
			this.myDnaIndex++
			this._getDnaStyleList()
			this.setState({footState: 1}) //footState = 1:加载中
		} else {
			this.setState({footState: 2})//footState = 2:加载完成
			// this._pullToRefreshListView.endLoadMore(true);
		}
	}

	// 根据 id 删除DNA风格
	_removeDna (id) {
		if (!id) {
			showErrorAlert('当前dna不存在！')
			return
		}
		Alert.alert(
			'删除DNA',
			'是否确认将此DNA删除，此操作无法撤销',
			[{text: '取消', onPress: () => {}}, {text: '确认', onPress: () => this.deleteDNA(id)}]
		)

	}


	deleteDNA (id) {
		apiRequest.request(ApiMap.deleteDna, {version: id}, null, (status, res) => {
			if (status) {
				let lastData = this.myDnaData.filter((dna, index) => dna.id != id)
				this.setState({myDnaDataSource: this.state.myDnaDataSource.cloneWithRows(lastData)})
				this.refs.toast.show('删除成功！')
				this.myDnaData = lastData
			} else {
				showErrorAlert('网络错误，请检查网络')
			}
		})
	}

	onpullRelease (resolve) {
		this.myDnaIndex = 1
		this.myDnaData = []
		this._getDnaStyleList(resolve)
	}

	render () {
		return (
			<View style={styles.mainContainer}>

				<PullRefreshListView
					processIconYPosition={60}
					onPullRelease={this.onpullRelease.bind(this)}
					enableEmptySections={true}
					dataSource={this.state.myDnaDataSource}
					upPullState={this.state.footState}
					renderRow={this._renderStyleListItem.bind(this)}
					onLoadMore={this._onLoadMore.bind(this)}
					stickySectionHeadersEnabled={false}
				/>
				<NavigationBar
					title={'我的风格'}
					backgroundColor={'#fff'}
					navigator={this.props.navigator}
					onLeftButtonPress={() => this.onLeftBack()}
					leftButtonIcon={require('../../images/common/icon_back_black.png')}
					rightButtonIcon1={require('../../images/common/icon_customer_black.png')}
					logoIcon={require('../../images/common/logo_black.png')}
					verticalLineColor={Colors.black}
					style={{position: 'absolute', top: 0}}
				/>
				{/*<PullToRefreshListView
				 ref={(component) => this._pullToRefreshListView = component}
				 viewType={PullToRefreshListView.constants.viewType.listView}
				 initialListSize={20}
				 enableEmptySections={true}
				 dataSource={this.state.myDnaDataSource}
				 pageSize={20}
				 renderRow={this._renderStyleListItem.bind(this)}
				 renderHeader={(viewState) => SmartListViewComponent._renderHeader(viewState)}
				 renderFooter={(viewState) => SmartListViewComponent._renderFooter(viewState)}
				 onRefresh={this._getDnaStyleList.bind(this)}
				 onLoadMore={this._onLoadMore}
				 pullUpDistance={35}
				 pullUpStayDistance={50}
				 pullDownDistance={35}
				 pullDownStayDistance={50}/>*/}
				<Toast ref="toast"/>
			</View>
		)
	}

	onLeftBack () {
		const {navigator} = this.props
		navigator.pop()
	}
}

const styles = StyleSheet.create({
	releasebtn: {
		marginLeft: 5,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 2,
		paddingHorizontal: 2,
	},
	mainContainer: {
		height: deviceHeight,
		width: deviceWidth,
		backgroundColor: Colors.mainBgColor
	},
	styleListItem: {
		marginTop: common.adaptHeight(26),
		backgroundColor: Colors.white
	},
	listItemImg: {
		width: common.adaptWidth(750),
		height: common.adaptHeight(362)
	},
	listItemBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginHorizontal: common.adaptWidth(20),
		marginVertical: common.adaptWidth(10)
	},
	listItemBabel: {
		borderWidth: 1,
		borderColor: Colors.mainColor,
		borderRadius: common.adaptWidth(4),
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 1,
		paddingHorizontal: 3
	},
	listItemRemove: {
		height: common.adaptHeight(80),
		width: common.adaptWidth(60),
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 5
	},
	loadMore: {
		height: 35,
		width: deviceWidth,
		justifyContent: 'center',
		alignItems: 'center',
	},
	labelRadiusWrap: {
		width: 10,
		height: 10,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 5,
		backgroundColor: '#000'
	},
	labelRadius: {
		width: 4,
		height: 4,
		borderRadius: 2,
		opacity: 0.8,
		backgroundColor: '#fff'
	},
	labelNameWrap: {
		marginLeft: 5,
		marginTop: -2,
		top: common.adaptHeight(20),
		left: common.adaptWidth(20),
		backgroundColor: Colors.black,
		opacity: 0.8,
		position: 'absolute',
		borderTopRightRadius: 6,
		borderBottomLeftRadius: 6,
	}
})

