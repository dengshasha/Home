import {
    StyleSheet,
    Platform,
} from 'react-native'

import * as common from '../utils/CommonUtils' 
import Colors from '../constants/Colors' 

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const listviewImage2Margin = 10 / 375 * deviceWidth 
const listviewImage2Width = (deviceWidth - listviewImage2Margin * 4) / 2

const styles = StyleSheet.create({
    allContainer: {
        backgroundColor: Colors.mainBgColor,
        flex: 1,
    },
    //头部view
    headerContainer: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        height: 235 / 667 * deviceHeight,
        justifyContent: 'center',
        width: deviceWidth,
    },
    headerBg: {
        height: 159 / 667 * deviceHeight,
        width: deviceWidth,
    },
    headerBgCover: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        height: 159 / 667 * deviceHeight,
        position: 'absolute',
        top: 0,
        width: deviceWidth,
    },
    avatar: {
        alignSelf: 'center',
        borderRadius: 37 / 667 * deviceHeight,
        height: 74 / 667 * deviceHeight,
        top: -37 / 667 * deviceHeight,
        width: 74 / 667 * deviceHeight,
    },
    username: {
        alignSelf: 'center',
        color: Colors.black,
        fontSize: 16,
        top: -35 / 667* deviceHeight
    },
    //选择活动/方案view
    categoryContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 40 / 667 * deviceHeight,
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
        borderRadius: 2,
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
        right: 10,
        top: 10, 
    },
    rankOtherNumberContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        borderRadius: 3, 
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    rankOtherNumberText: {
        color: Colors.white,
        fontSize: 14,
    }
    
})

export default styles