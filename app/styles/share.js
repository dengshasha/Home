import {
    StyleSheet,
    Platform,
} from 'react-native'

import * as common from '../utils/CommonUtils'
import Colors from '../constants/Colors'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const styles = StyleSheet.create({
    communityListViewContainer: {
        alignItems: 'flex-start',
        backgroundColor: '#F7F7F7',
        borderRadius: 4,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        margin: 10,
        paddingBottom: 10 / 667 * deviceHeight,
        width: deviceWidth - 20,
    },
    essenceListViewContainer: {
        marginTop: 10,
    },
    leftBtn: {
        left: 5,
        marginTop: global.IOS_PLATFORM ? 20 : 0,
        position: 'absolute',
        padding: 10,
    },
    essenceItemContainer: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        flexDirection: 'row',
        height: 55 / 667 * deviceHeight,
        justifyContent: 'space-between',
        paddingHorizontal: 10 / 375 * deviceWidth
    },
    communityItemPreImg: {
        // borderRadius: 4,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        height: common.adaptWidth(274),
        position: 'relative',
        width: '100%',
    },
    communityItemImg: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: common.adaptWidth(54) / 2,
        height: common.adaptWidth(54),
        left: 5,
        position: 'absolute',
        top: 5,
        width: common.adaptWidth(54),
    },
    tabContainer: {
        position: 'absolute',
        alignItems: 'center',
        backgroundColor: Colors.white,
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 64 : 44,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
        justifyContent: 'center',
        width: deviceWidth,
    },
    tabBtn: {
        alignItems: 'center',
        height: 44,
        justifyContent: 'center',
        width: deviceWidth / 2,
    },
    tabText: {
        fontSize: 16,
    },
    tabUnderline: {
        backgroundColor: Colors.mainColor,
        bottom: 0,
        height: 2,
        position: 'absolute',
        width: 80,
    },
    latestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: common.adaptWidth(84)
    }
})

export default styles
