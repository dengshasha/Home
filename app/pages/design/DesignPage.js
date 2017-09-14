/**
 * 2017-06-05 17:51 修改 by Traveller
 * app 1.2.1 版本 开始设计页面
 */
import React, {Component} from 'react';
import {
	Image,
	Text,
	View,
	Alert,
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
} from 'react-native';
import Swiper from 'react-native-swiper';
// 常量对象
import * as Colors from '../../constants/Colors';
import {ApiMap, CommunityApiMap} from '../../constants/Network';
// 工具
import * as common from '../../utils/CommonUtils';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import * as Images from '../../images/'
// 组件
import NavigationBar from '../../components/NavigationBar';
import PreloadImage from '../../components/PreloadImage';
// 页面
import ApplicationTypePage from './ApplicationTypePage';
import ActivityPage from '../activity/ActivityPage';
import ActivityDescriptionPage from '../activity/ActivityDescriptionPage'
import HomePage from '../house/HomePage'

//常量方法
const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

export default class DesignPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activityBanner: []
		};

		this.designType = [
			{text: '客厅',  imgUrl: Images.livingRoom},
			{text: '主卧', imgUrl: Images.mainBedroom},
			{text: '次卧', imgUrl: Images.secondBedroom},
			{text: '餐厅',  imgUrl: Images.dingroom},
			{text: '儿童房', imgUrl: Images.childroom},
			{text: '书房', imgUrl: Images.studyroom},
			{text: '厨房',  imgUrl: Images.kitchen},
			{text: '阳台',  imgUrl: Images.balcony},
			{text: '卫生间', imgUrl: Images.toilet},
		]
	}

	componentDidMount() {
		this.getActivityBanner();
	}

	// 房间类型
	_renderType() {
		return this.designType.map((item, index) => {
			let text = item.text;
			return (
				<TouchableOpacity
					key={index}
					onPress={() => Alert.alert(
						`您还没有关于自己的${text}哦`,
						'快去申请一个属于自己的户型吧！',
						[
							{text: '知道啦', onPress: () => {}},
							{text: '去申请', onPress: () => this.enterNewDesignPage()}]
					)}
				>
					<View style={{
						alignItems: 'center',
						width: 100,
						height: 30,
						margin: 1
					}}>
						<Image source={item.imgUrl} resizeMode={'contain'} style={{width: 75, height: 75,}}/>
						<Text>{text}</Text>
					</View>
				</TouchableOpacity>
			)
		})
	}

	// 获取活动banner
	getActivityBanner () {
		let apiRequest = new ApiRequest();
		apiRequest.request(CommunityApiMap.getActivities, null, null, (status, response) => {
			if (status) {
				let data = response.data.filter( item => item.end_time > Date.now() / 1000)
				this.setState({activityBanner: data})
			}
		})
	}



	back() {
		this.props.navigator.pop()
	}

	// 根据活动 id 进入对应的活动页面
	enterActivityPage(activityId) {
		this.props.navigator.push({id: 'ActivityPage', component: ActivityPage, activityId})
	}

	enterActivityDescriptionPage(activity) {
		this.props.navigator.push({
			id: 'ActivityDescriptionPage',
			component: ActivityDescriptionPage,
			activity: activity
		})
	}

	enterNewDesignPage() {
		this.props.navigator.push({id: 'HomePage', component: HomePage})
	}

    render() {
        return (
			<View style={{flex: 1,}}>
				<NavigationBar
					style={{position: 'absolute', zIndex: 99}}
					title={'来做设计'}
					navigator={this.props.navigator}
					titleColor={Colors.white}
					backgroundColor={'transparent'}
					onLeftButtonPress={() => this.back()}
					leftButtonIcon={require('../../images/common/icon_back_white.png')}
					logoIcon={require('../../images/common/logo_white.png')}
					rightButtonIcon1={require('../../images/common/icon_customer_white.png')}
				/>
				<View>
                    {/*轮播banner*/}
					<Swiper autoplay
							style={{position: 'absolute'}}
							height={common.adaptHeight(450)}
							width={deviceWidth}>
                        {
                            this.state.activityBanner.map( (item, index) => {
                                /**
                                 * 返回活动轮播图列表
                                 * @cover_url: anner轮播高清图链接url
                                 * @id: 对应活动Id
                                 */
                                let {cover_url, id} = item;
                                return (
									<PreloadImage
										url={cover_url}
										key={index}
										onPress={() => this.enterActivityDescriptionPage(item)}
										style={{width: deviceWidth, height: common.adaptHeight(426)}}/>
                                )
                            })}
					</Swiper>

                    {/*九宫格房型布局*/}
					<View style={{
                        marginTop: 10,
                        alignSelf: 'center',
                        flexWrap: 'wrap',
                        flexDirection: 'row',
                        height: common.adaptHeight(220)
                    }}>
                        {this._renderType()}
					</View>
				</View>
                {/*申请户型按钮*/}
				<TouchableOpacity style={{marginTop: common.adaptHeight(450)}}
								  onPress={() => this.enterNewDesignPage()}>
					<View style={{
                        backgroundColor: Colors.mainColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: common.adaptWidth(560),
                        alignSelf: 'center',
                        borderRadius: 25,
                        height: 40
                    }}>
						<Text style={{color: '#fff', fontSize: 16}}>申请户型</Text>
					</View>
				</TouchableOpacity>
			</View>
        )
    }
}
