/**
 * Created by Melody.Deng on 2017/9/1.
 */
import {
	StyleSheet,
	Platform,
} from 'react-native'

import * as common from '../utils/CommonUtils'
import Colors from '../constants/Colors'

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const listviewImage2Margin = 10 / 375 * deviceWidth;
const listviewImage2Width = (deviceWidth - listviewImage2Margin * 4) / 2;

const bannerHeight = 170 / 667 * deviceHeight; //顶部背景图片高度

const styles = StyleSheet.create({
	allContainer: {
		backgroundColor: Colors.mainBgColor,
		flex: 1,
	},
	//头部view
	headerContainer: {
		alignItems: 'center',
		backgroundColor: Colors.white,
		height: 245 / 667 * deviceHeight,
		justifyContent: 'center',
		width: deviceWidth,
	},
	headerBg: {
		height: bannerHeight,
		width: deviceWidth,
	},
	headerBgCover: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		height: bannerHeight,
		position: 'absolute',
		top: 0,
		width: deviceWidth,
	},
	headAvatar: {
		alignSelf: 'center',
		borderRadius: 37 / 667 * deviceHeight,
		height: 74 / 667 * deviceHeight,
		top: -37 / 667 * deviceHeight,
		width: 74 / 667 * deviceHeight,
	},
	headUsername: {
		alignSelf: 'center',
		color: Colors.black,
		fontSize: 16,
		top: -35 / 667* deviceHeight
	},
	//特约设计师头部view
	headerContainer1: {
		alignItems: 'center',
		backgroundColor: '#333',
		justifyContent: 'center',
		height: 245 / 667 * deviceHeight,
		width: deviceWidth,
	},
	headAvatar1: {
		borderRadius: 50 / 667 * deviceHeight,
		height: 100 / 667 * deviceHeight,
		width: 100 / 667 * deviceHeight,
	},
	headUsername1: {
		color: Colors.white,
		fontSize: 18,
		paddingVertical: 5 / 667 * deviceHeight,
	},
	designerVContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	designerText: {
		color: '#FFC400',
		fontSize: 10,
	},
	//选择活动/方案view
	categoryContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		height: 50 / 667 * deviceHeight,
		justifyContent: 'space-between',
		paddingHorizontal: 10 / 375 * deviceWidth,
		width: deviceWidth,
	},
	//listview展示方式选择按钮view
	listStyleContainer: {
		flexDirection: 'row',
	},
	//listview的contentContainerStyle
	listviewStyle: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		flexWrap: 'wrap',
		width: deviceWidth,
	},
	//listview第一种排列方式（一行一个）
	listviewContainerStyle1: {
		backgroundColor: Colors.white,
		height:220 / 667 * deviceHeight,
		marginHorizontal: 15 / 375 * deviceWidth,
		marginTop: 10 / 667 * deviceHeight,
		width: deviceWidth - 30 / 375 * deviceWidth,
	},
	listviewImage1: {
		borderRadius: 4,
		height: 220 / 667 * deviceHeight,
		width: deviceWidth - 30 / 375 * deviceWidth,
	},
	//listview第二种排列方式（一行二个）
	listviewContainerStyle2: {
		height: 150 / 667 * deviceHeight,
		marginTop: 10 / 667 * deviceHeight,
		marginHorizontal: listviewImage2Margin,
		width: listviewImage2Width,
	},
	listviewImage2: {
		borderRadius: 4,
		height: 150 / 667 * deviceHeight,
		width: listviewImage2Width,
	},
	//排名view
	rankContainer: {
		position: 'absolute',
		right: 6,
		top: 6,
	},
	rankQueenIcon: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	rankQueenText: {
		backgroundColor: Colors.transparent,
		color: Colors.white,
		fontSize: 12,
		paddingRight: 5,
	},
	otherRankContainer: {
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		borderRadius: 3,
		paddingHorizontal: 5,
		paddingVertical: 2,
	},
	otherRankText: {
		color: Colors.white,
		fontSize: 12,
	},
	//dna作品
	listViewDNAContainer1: {
		alignItems: 'center',
		backgroundColor: Colors.white,
		width: deviceWidth,
	},
	listViewDNAImage1: {
		borderRadius: 5,
		height: deviceWidth - 30,
		width: deviceWidth - 30,
	},
	listViewDNATextContainer1: {
		alignItems: 'flex-end',
		height: 40 / 667 * deviceHeight,
		justifyContent: 'center',
		width: deviceWidth - 30
	}
})

export default styles