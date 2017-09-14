import {
    StyleSheet,
    Platform
} from 'react-native'

import * as common from '../utils/CommonUtils'
import Colors from '../constants/Colors'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

var bannerHeight = deviceWidth / 2 + 20 ;
var bannerContentHeight = 110 / 667 * deviceHeight
var bannerTopDis = bannerHeight - bannerContentHeight / 2

const styles = StyleSheet.create({
    bannerImg: {
        height: bannerHeight,
        width: deviceWidth,
    },
    bannerContainer: {
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: Colors.veryLightGrey,
      flexDirection: 'row',
      height: bannerContentHeight,
      justifyContent: 'space-around',
    },
    bannerMySchemeImg: {
        borderRadius: 30 / 667 * deviceHeight,
        borderWidth: 1,
        height: 60 / 667 * deviceHeight,
        width: 60 / 667 * deviceHeight,
    },
    bannerRankContainer: {
        alignItems: 'center',
        height: bannerContentHeight - 20,
        justifyContent: 'space-around',
    },
    bannerRankText: {
        color: Colors.black,
    },
    bannerRankNumber: {
        color: Colors.mainColor,
        fontSize: 20,
    },
    rankCircle: {
        alignItems: 'center',
        backgroundColor: Colors.transparent,
        borderColor: Colors.mainColor,
        borderRadius: 30 / 667 * deviceHeight,
        borderWidth: 1,
        height: 60 / 667 * deviceHeight,
        justifyContent: 'center',
        width: 60 / 667 * deviceHeight
    },
    tabContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 60 / 667 * deviceHeight,
        justifyContent: 'space-between',
        paddingHorizontal: 15 / 667 * deviceHeight,
        width: deviceWidth,
    },
    tabBtnTextContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 40 / 667 * deviceHeight,
        justifyContent: 'center',
    },
    tabBtn: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    verticalLine: {
        backgroundColor: Colors.midGrey,
        marginHorizontal: 10 / 667 * deviceHeight,
        height: 15 / 667 * deviceHeight,
        width: 1 ,
    },
    //listview展示方式选择按钮view
    listStyleContainer: {
        flexDirection: 'row',
    },
    listViewContainerStyle: {
        alignItems: 'flex-start', //如果flexWrap不生效添加该属性
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: deviceWidth,
    },
    //列表展示样式，一排两个
    listViewItemContainer1: {
        height: deviceWidth / 2 + 50 / 667 * deviceHeight,

        overflow: 'hidden',
        width: deviceWidth / 2 ,
    },
    avatarAndRateContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 50 / 667 * deviceHeight,
        paddingHorizontal: 10 / 667 * deviceHeight,
    },
    listViewItemImg1: {
        height: deviceWidth / 2 - 20,
        width: deviceWidth / 2 - 5,
    },
    rankContainer: {
        paddingHorizontal: 5,
        position: 'absolute',
        top: 5,
    },
    avatar: {
        borderRadius: 15 / 375 * deviceWidth,
        height: 30 / 375 * deviceWidth,
        width: 30 / 375 * deviceWidth,
    },
    rateContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    rateText: {
        color: Colors.midGrey,
        paddingLeft: 5,
        backgroundColor: 'transparent'
    },
    //列表展示样式，一排三个
    listViewItemContainer2: {
        borderRadius: 5,
        height: deviceWidth / 3 - 10,
        marginTop: 10,
        overflow: 'hidden',
        paddingHorizontal: 5,
        width: deviceWidth / 3 ,
    },
    listViewItemImg2: {
        borderRadius: 5,
        height: deviceWidth / 3 - 10,
        width: deviceWidth / 3 - 10,
    },
    rankIconContainer2: {
        left: 6,
        position: 'absolute',
        top: 6,
    },
    otherRankContainer: {
        alignItems:'center',
        backgroundColor: Colors.mainColor,
        borderRadius: 3,
        paddingHorizontal: 5,
    },
    otherRankText: {
        color:Colors.white,
        fontSize:12,
        backgroundColor: "transparent"
    },
    //页面滚动时的导航栏
    navContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 60 : 40,
        justifyContent: 'space-between',
        paddingHorizontal: 10 / 667 * deviceHeight,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
        position:'absolute',
        top: 0,
        width: deviceWidth,
    },
    logoContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 60 : 40,

    },

    tabContainer1: {
        alignItems: 'center',
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 60 : 40,
        justifyContent: 'center',
    },
    listStyleContainer1: {
        alignItems: 'center',
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 60 : 40,
        justifyContent: 'center',
    }
})

export default styles
