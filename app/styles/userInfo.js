import {
    StyleSheet,
    Platform,
} from 'react-native'

import * as common from '../utils/CommonUtils' 
import Colors from '../constants/Colors' 

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const styles = StyleSheet.create({
    modalText: {
      alignItems:'center',
      alignSelf:'center',
      color:Colors.black,
      fontSize:14,
      lineHeight: 25,
      justifyContent:'center',
    },
    modalButton:{
      alignItems:'center',
      alignSelf:'center',
      backgroundColor: Colors.mainColor,
      borderRadius: 20,
      marginTop: 30 / 667 * deviceHeight,
      paddingVertical: 10 / 667 * deviceHeight,
      width: 240 / 375 * deviceWidth,
    },
    mainContainer: {
        backgroundColor: Colors.mainBgColor,
        flex: 1,
        width: deviceWidth,
    },
    gradient: {
        width: deviceWidth,
        height: 220 / 667 * deviceHeight,
        alignItems: 'center',
    },
    avatar: {
        marginTop: 8 / 375 * deviceWidth,
        width: 100 / 375 * deviceWidth,
        height: 100 / 375 * deviceWidth,
        borderRadius: 50 / 375 * deviceWidth,
    },
    username: {
        fontSize: 18,
        color: Colors.white,
        marginTop: 10 / 667 * deviceHeight,
        backgroundColor: 'transparent'
    },

    listItem: {
	    alignSelf: 'center',
	    height: 60 / 667 * deviceHeight,
        width: 351 / 375 * deviceWidth,
        flex:1,
        backgroundColor: Colors.white,
        borderRadius: 10 / 667 * deviceHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    listItem1: {
        elevation: 1,
        marginBottom: 10 / 667 * deviceHeight,
        shadowColor: Colors.lightGrey,
        shadowOffset: {x: 0, y: 0},
        shadowOpacity: 0.5,
        shadowRadius: 1,
    },
    listItemLeftContainer: {
        alignItems: 'center', 
        flexDirection: 'row', 
        justifyContent: 'space-around'
    },
    listItemText: {
        fontSize: 16,
        color: Colors.black,
        marginLeft: 16 / 375 * deviceWidth                          
    },
    listItemImg: {
        marginLeft: 16 / 375 * deviceWidth,
    },
    arrowImg: {
        width: 15 / 375 * deviceWidth,
        height: 15 / 667 * deviceHeight,
        marginRight: 16 / 375 * deviceWidth
    },
    dottedLine: {
	    alignSelf: 'center',
        height: 0 ,
        width: 330 / 375 * deviceWidth,
        backgroundColor: Colors.transparent,
        borderColor:Colors.mostLightGray,
        borderWidth:1,
        borderStyle:'dashed',               
    },
    circleMaskLB: {
        position: 'absolute',
        left: -10 / 375 * deviceWidth,
        bottom: -10 / 667 * deviceHeight,
        width: 20 / 375 * deviceWidth,
        height: 20 / 667 * deviceHeight,
        borderRadius: 10 / 667 * deviceHeight,
        backgroundColor: Colors.mainBgColor
    },
    circleMaskRB: {
        position: 'absolute',
        right: -10 / 375 * deviceWidth,
        bottom: -10 / 667 * deviceHeight,
        width: 20 / 375 * deviceWidth,
        height: 20 / 667 * deviceHeight,
        borderRadius: 10 / 667 * deviceHeight,
        backgroundColor: Colors.mainBgColor
    },
    circleMaskLT: {
        position: 'absolute',
        left: -10 / 375 * deviceWidth,
        top: -10 / 667 * deviceHeight,
        width: 20 / 375 * deviceWidth,
        height: 20 / 667 * deviceHeight,
        borderRadius: 10 / 667 * deviceHeight,
        backgroundColor: Colors.mainBgColor
    },
    circleMaskRT: {
        position: 'absolute',
        right: -10 / 375 * deviceWidth,
        top: -10 / 667 * deviceHeight,
        width: 20 / 375 * deviceWidth,
        height: 20 / 667 * deviceHeight,
        borderRadius: 10 / 667 * deviceHeight,
        backgroundColor: Colors.mainBgColor
    },
    
    msgPrompt: {
        backgroundColor: Colors.mainColor,
        borderRadius: 3,
        height: 6,
        left: common.adaptWidth(165),
        position: 'absolute',
        top: 3,
        width: 6,
    }
})

export default styles