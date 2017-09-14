import React,{Component} from 'react';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Animated,
} from 'react-native';

import NavigationBar from '../../components/NavigationBar';
import Colors from '../../constants/Colors';
import * as common from '../../utils/CommonUtils' ;
import SchemeHandler from '../../utils/SchemeHandler';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();




export default class ProductDetailsPage extends Component {
	constructor(props) {
		super(props);
		this.state = {

			likestate:false,
		};

	}
	componentWillMount() {

	}
	_renderPage(data, pageID) {
       return (
           <Image
               source={data}
               style={styles.page}/>
       );
   }

	render() {
		let likeIconImg = this.state.likestate ? require('../../images/design/like-after.png') : require('../../images/design/like.png');
		let images = this.props.itemData.images;
		let imagesWidth = deviceWidth - 60 / 375 * deviceWidth;
		images = SchemeHandler.jointImageSize(images,{width:parseInt(imagesWidth)});

		return(
			<View style={{flex:1}}>
				<NavigationBar
					title = {'物品详情'}
					titleColor = {Colors.black}
					backgroundColor = {Colors.white}
					onLeftButtonPress = {()=> this.props.navigator.pop()}
					leftButtonIcon = {require('../../images/common/icon_back_black.png')}
					/>
				<View style = {styles.contentContainer}>
					<View style={styles.productImage}>

						<Image source = {{uri:images}} style = {{width : imagesWidth,height : imagesWidth}}/>
					</View>


					<View style={styles.productText}>


						<View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:25 / 667 * deviceHeight,}}>
							<Text style={{fontSize:18,color:'#181818',}}>扫描作品</Text>
							<View style={{flexDirection:'row'}}>
								<TouchableOpacity onPress = { this.toggleLikeState.bind(this) }>
									<Image source={likeIconImg}/>
								</TouchableOpacity>
								<TouchableOpacity style={{marginLeft:15 / 375 * deviceWidth}}>
									<Image source={require('../../images/common/share.png')}/>
								</TouchableOpacity>
							</View>

						</View>

						<View style={{flexDirection:'row',paddingTop:20 / 667 * deviceHeight,}}>

							<Text style={styles.JapaneseStyle}> </Text>
							<Image source={require('../../images/design/position.png')} style={styles.positionIcon}/>
							<Text>来自玩家生活</Text>

						</View>
						<View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:20 / 667 * deviceHeight,}}>
							<View style = {{flexDirection:'row'}}>
								<Text style = {{fontSize:16,color:'#181818',}}>宝贝评价&nbsp;(129)&nbsp;&nbsp;</Text>
								<Image source = {require('../../images/design/star.png')} style={{marginTop:5 / 667 * deviceHeight,}}/>
							</View>

							<TouchableOpacity style={{}}>
								<Text style={{textDecorationLine:'underline'}}>更多好评></Text>
							</TouchableOpacity>

						</View>
					</View>
				</View>
			</View>
		)
	}
	toggleLikeState() {
		this.setState({
		    likestate : ! this.state.likestate
		})
	}
}

const styles = StyleSheet.create({
	contentContainer:{
		backgroundColor:'#fff',
		borderRadius:5,
		elevation:4,
		flex:1,
		marginTop:20 / 667 * deviceHeight,
		marginLeft:10 / 375 * deviceWidth,
		marginRight:10 / 375 * deviceWidth,
		marginBottom:10 / 667 * deviceHeight,
		shadowColor : Colors.DARK_GREY,
		shadowOffset : {width:0,height:0},
		shadowOpacity: 1,
    	shadowRadius: 3,
	},
	productImage:{
		backgroundColor: '#fff',
		borderBottomWidth:1,
		borderColor:'#f7f7f7',
		flex:2,
		marginLeft:15 / 375 * deviceWidth,
		marginRight:15 / 375 * deviceWidth,
	},
	page:{
        flex: 1,
        resizeMode: 'contain',
	},
	productText:{
		flex:1,
		paddingLeft:15 / 375 * deviceWidth,
		paddingRight: 15 / 375 * deviceWidth,
	},
	JapaneseStyle:{
		borderWidth:1,
		borderColor:Colors.mainColor,
		borderRadius:4,
		color:Colors.mainColor,
		padding:2,
	},
	positionIcon:{
		marginLeft:25 / 375 * deviceWidth,
		marginRight:5 / 375 * deviceWidth,
		marginTop:5 / 667 * deviceHeight,
	},
})
