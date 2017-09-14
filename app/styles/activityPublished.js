import {
    StyleSheet,
    Platform,
} from 'react-native'

import * as common from '../utils/CommonUtils' 
import Colors from '../constants/Colors' 

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const styles = StyleSheet.create({
    rankingContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        borderRadius: 40 / 667 * deviceHeight,
        borderColor: Colors.white,
        flexDirection: 'row',
        height: 65 / 667 * deviceHeight,
        justifyContent: 'space-between',
        right: 10,
        position: 'absolute',
        top: Platform.OS === 'ios' ? 80 : 60,
        width: 160 / 667 * deviceHeight,
    },
    authorAvatar: {
       borderRadius: 31 / 667 * deviceHeight,
       height: 62 / 667 * deviceHeight,
       width: 62 / 667 * deviceHeight,
       borderColor: Colors.white,
       borderWidth: 3,
    },
    rankingTextContainer: {
        alignItems: 'center',
        justifyContent: 'center', 
        marginLeft: 20,
        width: 73 / 667 * deviceHeight,
    },
    ownerRankingContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        borderRadius: 30,
        borderColor: Colors.white,
        height: 55,
        right: 10,
        position: 'absolute',
        top: Platform.OS === 'ios' ? 80 : 60,
        justifyContent: 'center',
        width: 110 / 375 * deviceWidth,
    },
    ranking: {
        color: Colors.white,
        fontSize: 18,
    },
    likeListBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48 / 375 * deviceWidth,
    },
    authorNameContainer: {
        alignItems: 'center',
        backgroundColor: '#2B426E',
        borderRadius: 10,
        justifyContent: 'center',
        
        overflow: 'hidden',
        position: 'absolute',
        top: 40 / 375 * deviceWidth,
        width: 44 / 375 * deviceWidth,
    },
    authorName: {
        color: Colors.white,
        fontSize: 10,
        overflow: 'hidden',
    },
    avatar: {
        borderRadius: 22 / 375 * deviceWidth, 
        borderWidth: 1, 
        borderColor: Colors.white, 
        height: 44 / 375 * deviceWidth, 
        marginLeft: 3,
        width: 44 / 375 * deviceWidth, 
    },
    //提示分享框
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: deviceWidth,
        height: deviceHeight,
        paddingBottom: 100 / 667 * deviceHeight,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
    },
	promptModalImg: {
		alignItems: 'flex-end',
		justifyContent: 'center',
		paddingRight: 35
	},
	promptCloseBtn: {
//		position: 'absolute',
//		top: 55 / 667 * deviceHeight,
//		right: 35 / 667 * deviceHeight,
		height: 40 / 667 * deviceHeight,
		width: 40 / 667 * deviceHeight,
	}
})

export default styles