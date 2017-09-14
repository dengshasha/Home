import {
    StyleSheet
} from 'react-native'

import * as common from '../utils/CommonUtils'
import Colors from '../constants/Colors'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const layoutConainerWidth = (deviceWidth - 30) / 2

const styles = StyleSheet.create({
    allContainer: {
        backgroundColor: Colors.mainBgColor,
        flex: 1,
    },
    chooseTextContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 75 / 667 * deviceHeight,
        justifyContent: 'center',
    },
    horizontalLine: {
        backgroundColor: Colors.darkGrey,
        height: 2,
        width: 15 / 375 * deviceWidth,
    },
    chooseText: {
        color: Colors.darkGrey,
        fontSize: 16,
        marginHorizontal: 12 / 375 * deviceWidth,
    },
    tipsBg: {
        alignSelf: 'center',
    },
    tipsText: {
        backgroundColor: 'transparent',
        alignSelf: 'center',
        color: Colors.midGrey,
        fontSize: 12,
        lineHeight: 25,
    },
    layoutConainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 20 / 667 * deviceHeight,
        paddingHorizontal: 5,
        width: deviceWidth,
    },
    layoutContentContainer: {
        // alignItems: 'center',
        // borderColor: Colors.veryLightGrey,
        borderRadius: 3,
        elevation: 1,
        height: 220 / 667 * deviceHeight,
        marginHorizontal: 5,
        marginTop: 10 / 667 * deviceHeight,
        shadowColor: Colors.veryLightGrey,
        shadowRadius: 1,
        shadowOffset: {x: 0, y: 0},
        shadowOpacity: 0.8,
        width: layoutConainerWidth,
    },
    layoutImage: {
        borderRadius: 3,
        height: 150 / 667 * deviceHeight,
        width: layoutConainerWidth, //170 / 375 * deviceWidth,
    },
    layoutStageContainer: {
        alignItems: 'center',
        // borderTopWidth: 1,
        // borderColor: Colors.veryLightGrey,
        flexDirection: 'row',
        height: 35 / 667 * deviceHeight,
        justifyContent: 'space-between',
        marginTop: 5 / 667 * deviceHeight,
        paddingHorizontal: 15 / 375 * deviceWidth,
        width: layoutConainerWidth,
    },
    countText: {
        color: 'gray', 
        fontSize: 12,
        marginLeft: 15 / 375 * deviceWidth,
    },
})

export default styles
