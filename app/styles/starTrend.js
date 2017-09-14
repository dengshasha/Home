import {
    StyleSheet,
    Platform,
} from 'react-native'

import * as common from '../utils/CommonUtils' 
import Colors from '../constants/Colors' 

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const styles = StyleSheet.create({
    allContainer: {
        backgroundColor: '#1C1E37',
        height: deviceHeight,
        width: deviceWidth,
    },
    detailsContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 100 / 667 * deviceHeight,
        justifyContent: 'center',
        //marginTop: 30 / 667 * deviceHeight,
    },
    rankContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    verticalLine1: {
        backgroundColor: Colors.white,
        height: 30 / 667 * deviceHeight,
        marginHorizontal: 40 / 667 * deviceHeight,
        width: 1,
    },
    number: {
        color: Colors.white,
        fontSize: 35,
    },
    rankText: {
        color: Colors.white,
        fontSize: 14,
    },
    tipsContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 40 / 667 * deviceHeight,
        justifyContent: 'center',
    },
    tipsText: {
        color: Colors.white,
        fontSize: 16,
        paddingRight: 10 / 375 * deviceWidth,
    },
    userListText: {
        bottom: 120 / 667 * deviceHeight,
        color: Colors.white, 
        paddingLeft: 10, 
        position: 'absolute', 
    },
    bottomContainer: {
        alignItems: 'center',
        backgroundColor: '#0F0F1B',
        bottom: 0,
        flexDirection: 'row',
        height: 55 / 667 * deviceHeight,
        justifyContent: 'center',
        position: 'absolute',
        width: deviceWidth,
    },
    verticalLine2: {
        backgroundColor: Colors.white,
        height: 16 / 667 * deviceHeight, 
        marginHorizontal: 20 / 667 * deviceHeight,
        width: 1,
    },
    bottomText: {
        color: Colors.white,
        fontSize: 16
    },
    chooseMonthButton: {
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 60 : 40,
        justifyContent: 'center',
        position: 'absolute',
        top: Platform.OS === 'ios' ? 20 : 0,
    },
    chooseMonthContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderRadius: 5,
        paddingVertical: 5,
        position: 'absolute',
        top: Platform.OS === 'ios' ? 80 : 40,
        width: 60 / 375 * deviceWidth,
    },
    chooseMonthText: {
        lineHeight: 25,
    }
})

export default styles