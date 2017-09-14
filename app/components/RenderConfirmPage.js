import React,{Component} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  Dimensions,
  PixelRatio,
  InteractionManager
} from 'react-native';

import * as common from '../utils/CommonUtils';
import Colors from '../constants/Colors';
import Swiper from 'react-native-swiper';
import GiftedSpinner from 'react-native-gifted-spinner';;

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();
const swiperItemWidth = 210 / 375 * deviceWidth;
const swiperItemHeight = 150 / 667 * deviceHeight;

export default class RenderConfirmPage extends Component{
	constructor(props) {
		super(props);
		this.state = {modalVisible: false};
	}

	setModalVisible(visible) {
		this.setState ({modalVisible: visible});
	}

	render() {
		return (
			<Modal
				visible = {this.state.modalVisible}
				transparent = {true}
				onRequestClose = {()=>{alert(PixelRatio.get())}}
				animationType = {'slide'}>
				<View style = {styles.modalContainer}>
					<View style = {styles.modalBg}>
						<Text style = {styles.text}>确定要递交任务吗?</Text>
            {this.props.productData.length > 0 ?
            <Swiper showsButtons showsPagination={false} width={swiperItemWidth} height={swiperItemHeight}>
              {this.props.productData.map((item, index, items)=>{
                let image = {uri: item.images + '?imageView2/0/w/' + (parseInt(swiperItemHeight)*2).toString()};
                return(
                  <View style={styles.swiperItem} key={index}>
                    <Image resizeMode={'contain'} source={image} style={{width: swiperItemHeight, height: swiperItemHeight}}/>
                  </View>)
              })}
            </Swiper> :
            <View style = {{width: swiperItemHeight, height: swiperItemHeight, alignItems: 'center', justifyContent: 'center'}}>
              <GiftedSpinner
                color={Colors.mainColor}
                size={'large'}
                styleAttr={'Inverse'}/>
            </View>}
						<TouchableOpacity style = {styles.button} onPress = {()=>InteractionManager.runAfterInteractions(()=>{this.props.makeRender()})}>
							<Text style = {styles.buttonText}>确定</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity onPress = {()=>this.setModalVisible(!this.state.modalVisible)}>
						<Image source = {require('../images/dialog/firstLogin_close.png')} style = {styles.closeIcon}/>
					</TouchableOpacity>
				</View>
			</Modal>
		)
	}
}

const styles = StyleSheet.create({
	modalContainer:{
		backgroundColor: 'rgba(0, 0, 0, .6)',
		flex: 1,
	},
	modalBg:{
		alignSelf: 'center',
		marginTop: 111 / 667 * deviceHeight,
    height: 318 / 667 * deviceHeight,
    width: 295 / 375 * deviceWidth,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 5
	},
	text:{
		fontSize: 20,
    color: Colors.black,
		marginTop: 39 / 667 * deviceHeight,
    marginBottom: 10 / 667 * deviceHeight,
		paddingLeft: 18 / 375 * deviceWidth,
		paddingRight: 18 / 375 * deviceWidth,

	},
	button:{
		alignItems:'center',
		alignSelf:'center',
		backgroundColor:'#F1365C',
		borderRadius:30,
		height:45,
		justifyContent:'center',
		marginTop: 30 / 667 * deviceHeight,
		width:170 / 375 * deviceWidth,
	},
	buttonText:{
		color:'#fff',
		fontSize:22,
		fontWeight:'bold',
	},
	closeIcon:{
		alignSelf:'center',
		marginTop:50 / 667 * deviceHeight,
	},
  swiperItem: {
    height: swiperItemHeight,
    width: swiperItemWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
