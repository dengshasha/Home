/**
 * Created by Melody.Deng on 2017/9/12.
 */
import {
	StyleSheet,
	Platform
} from 'react-native'

import * as common from '../utils/CommonUtils'
import Colors from '../constants/Colors'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

//上方物品图片的宽度
const productWidth = (deviceWidth - 90 / 375 * deviceWidth) / 2; //mainContainer的左右边距10 * 2 + replaceContainer的宽 70 = 90
//listView物品图片的宽度
const listViewProductWidth = (deviceWidth - 70 / 375 * deviceWidth) / 4; //listViewContainer的左右边距15 * 2 + 图片之间的边距（4张图片）5 * 4 * 2 = 70


const styles = StyleSheet.create({
	showImageContainer: {
		backgroundColor: Colors.white,
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 15 / 667 * deviceHeight,
		paddingHorizontal: 10 / 375 * deviceWidth,
	},
	commonProductContainer: {
		alignItems: 'center',
		borderColor: Colors.veryLightGrey,
		borderRadius: 4,
		borderWidth: 1,
		height: productWidth - 20,
		justifyContent: 'center',
		marginTop: 20 / 667 * deviceHeight,
		width: productWidth,
	},
	commonProductImage: {
		borderColor: Colors.veryLightGrey,
		borderRadius: 4,
		borderWidth: 1,
		height: productWidth - 20,
		width: productWidth,
	},
	shareBtn: {
		alignItems: 'center',
		height: 45 / 667 * deviceHeight,
		justifyContent: 'center',
		position: 'absolute',
		right: 0,
		top: 0,
		width: 45 / 667 * deviceHeight,
	},
	replaceContainer: {
		alignItems: 'center',
		height: productWidth - 20,
		justifyContent: 'center',
		marginTop: 20 / 667 * deviceHeight,
		width: 70 / 375 * deviceWidth
	},
	textContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		height: 50 / 667 * deviceHeight,
		justifyContent: 'space-between',
		width: productWidth,
	},
	purchaseButton: {
		alignItems: 'center',
		backgroundColor: '#FE9B30',
		borderRadius: 2,
		paddingVertical: 2,
		justifyContent: 'center',
		paddingHorizontal: 10,
	},
	replaceBtnContainer: {
		alignItems: 'center',
		backgroundColor: Colors.white,
		height: 60 / 667 * deviceHeight,
		justifyContent: 'center',
		width: deviceWidth,
	},
	replaceBtn:{
		alignItems:'center',
		backgroundColor:Colors.mainColor,
		borderRadius: 3,
		height: 45 / 667 * deviceHeight,
		justifyContent:'center',
		width: deviceWidth - 90 / 375 * deviceWidth,
	},
	replaceBtnText:{
		alignSelf: 'center',
		letterSpacing: 15,
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
	btnAndListViewContainer: {
		backgroundColor: Colors.white,
		marginTop: 10 / 667 * deviceHeight,
		flex: 1,
		width: deviceWidth,
	},
	chooseBtnContainer: {
		alignItems: 'center',
		flexDirection:'row',
		justifyContent:'center',
		paddingTop: 10 / 667 * deviceHeight,
		width: deviceWidth,
	},
	chooseBtn: {
		alignItems: 'center',
		padding: 5 / 375 * deviceWidth,
		justifyContent: 'center'
	},
	chooseIcon: {
		position: 'absolute',
		top: 3,
		right: 3
	},
	verticalLine: {
		backgroundColor: '#cdcdcd',
		height: 12 / 667 * deviceHeight,
		marginHorizontal: 10 / 375 * deviceWidth,
		width: 1,
	},
	listViewContainer: {
		//alignItems: 'flex-start', //如果flexWrap不生效添加该属性
		alignSelf: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		paddingHorizontal: 15 / 385 * deviceWidth,
		width: deviceWidth,
	},
	productBtn: {
		height: listViewProductWidth,
		margin: 5 / 375 * deviceWidth,
		width: listViewProductWidth,
	},
	productImage: {
		borderColor: Colors.veryLightGrey,
		borderRadius: 4,
		borderWidth: 1,
		height: listViewProductWidth,
		width: listViewProductWidth,
	}
})

export default styles