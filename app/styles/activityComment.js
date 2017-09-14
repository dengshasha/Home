import {
    StyleSheet
} from 'react-native'

import * as common from '../utils/CommonUtils'
import Colors from '../constants/Colors'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const styles = StyleSheet.create({
    modalBtn: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.white,
        borderRadius: 5,
        justifyContent: 'center',
        marginBottom: 20 / 667 * deviceHeight,
        height: 55 / 667 * deviceHeight,
        width: 340 / 375 * deviceWidth,
    },
    modalBtnText: {
        color: '#067DEF',
        fontSize: 18,
    },
    listViewItem: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderColor: Colors.veryLightGrey,
        paddingLeft: 10 / 375 * deviceWidth,
        paddingRight: 20 / 375 * deviceWidth,
        width: deviceWidth,
    },
    avatar: {
        borderColor: Colors.midGrey,
        borderRadius: 20 / 667 * deviceHeight,
        borderWidth: 1,
        height: 40 / 667 * deviceHeight,
        width: 40 / 667 * deviceHeight,
    },
    leftBtn: {
        alignItems: 'center',
        height: 40 / 667 * deviceHeight,
        justifyContent: 'center',
        width: 40 / 667 * deviceHeight,
    },
    textInputContainer: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: Colors.mainBgColor,
        height: 55 / 667 * deviceHeight,
        borderTopWidth: 1,
        borderColor: Colors.veryLightGrey,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: deviceWidth,
        marginLeft: 2
    },
    textInput: {
        flex: 1,
        alignSelf: 'center',
        backgroundColor: Colors.white,
        borderColor: Colors.veryLightGrey,
        borderRadius: 3,
        borderWidth: 1,
        color: Colors.black,
        marginLeft: 10 ,
        height: 40
    },
    replyContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 2,
        marginVertical: 5 / 667 * deviceHeight,
    },
    replyAuthorName: {
        color: '#4c70ba',
        fontSize: 16,
        margin: 5 / 667 * deviceHeight,
    },
    replyContent: {
        fontSize: 16,
        margin: 5 / 667 * deviceHeight
    },
    buttonSend:{
        borderWidth: 1,
        borderColor: Colors.mainColor,
        borderRadius: 5,
        width: 75 / 375 * deviceWidth,
        height: 38 ,
        marginHorizontal: 10 / 375 * deviceWidth,
        justifyContent: 'center',
        alignItems: 'center'
    },

    refreshIcon: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.white,
        borderRadius: 15 / 667 * deviceHeight,
        height: 30 / 667 * deviceHeight,
        justifyContent: 'center',
        marginTop: 10 / 667 * deviceHeight,
        width: 30 / 667 * deviceHeight,
    },
    tipsContainer: {
        alignItems: 'center',
        height: 60 / 667 * deviceHeight,
        justifyContent: 'center',
        width: deviceWidth,
    },
    tipsText: {
        color: Colors.midGrey,
        fontSize: 12,
    }
})

export default styles
