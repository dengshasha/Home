import {
    StyleSheet,
    Platform,
} from 'react-native'

import * as common from '../utils/CommonUtils' 
import Colors from '../constants/Colors' 

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const styles = StyleSheet.create({
    modalContainer: {
        width: deviceWidth,
        height: deviceHeight,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        alignItems: 'center',
        backgroundColor: Colors.transparent,
        height: 460 / 667 * deviceHeight,
        marginTop: 150 / 667 * deviceHeight,
        width: deviceWidth
    },
    avatar: {
        borderColor: Colors.white,
        borderRadius: 48 / 667 * deviceHeight,
        borderWidth: 4,
        height: 96 / 667 * deviceHeight,
        position: 'absolute',
        top: 0,
        width: 96 / 667 * deviceHeight,
    },
    modalWhiteContainer: {
        backgroundColor: Colors.white,
        borderRadius: 5,
        height: 220 / 667 * deviceHeight,
        marginTop: 48 / 667 * deviceHeight,
        width: 250 / 375 * deviceWidth,
    },
    closeBtn: {
        alignItems: 'center',
        right: 0,
        height: 35 / 667 * deviceHeight,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 30 / 375 * deviceWidth,
    },
    WhiteContent: {
        alignItems: 'center',
        marginTop: 50 / 667 * deviceHeight,
    },
    username: {
        backgroundColor: Colors.transparent,
        color: Colors.black,
        fontSize: 18,
        lineHeight: 25,
    },
    whiteText: {
        backgroundColor: Colors.transparent,
        fontSize: 16,
        lineHeight: 30,
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 15 / 667 * deviceHeight,
    },
    star: {
        marginHorizontal: 5,
    },
    button: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.white,
        borderColor: Colors.mainColor,
        borderRadius: 3,
        borderWidth: 1,
        height: 45 / 667 * deviceHeight,
        justifyContent: 'center',
        width: 200 / 375 * deviceWidth,
    },
    buttonText: {
        backgroundColor: Colors.transparent,
        color: Colors.mainColor,
        fontSize: 16,
    }

})

export default styles