import React,{Component} from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	ListView,
	TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {ApiRequest, showErrorAlert} from '../utils/ApiRequest';
import {ApiMap} from '../constants/Network';
import * as common from '../utils/CommonUtils';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

var selectedRow;
var preRow;
class CloudsDnaSelect extends Component{
	constructor(props) {
		super(props);
		this.index = 1;
		this.state = {
			dataSource:  new ListView.DataSource ({
					rowHasChanged : (row1,row2) => {
						var result = row1 !== row2 | selectedRow == row2 | preRow == row2;
						return true;
					}
				}),
			selectedRowID:'',
			ListViewData: [],
			selectedRowData:'',
		}
	}
	componentDidMount() {
		
		if(this.props.isClouds === 'true') {
			this.onLoadCloudsDNA();
		} else{
			this.onLoadMyDNA();
		}                                                                              
  	}
  	
	onLoadCloudsDNACallback(status,response) {
		if(status){
			//服务器有数据将cloneWithRows(data) 修改：cloneWithRows(response.data)，将页尾data删除
			this.setState({
				dataSource : this.state.dataSource.cloneWithRows(response.data),
				ListViewData: response.data
			});
			
		}
	}
	onLoadCloudsDNA() {
		
  		let apiRequest = new ApiRequest();
  		apiRequest.request(ApiMap.getDnas, {index:this.index}, null, this.onLoadCloudsDNACallback.bind(this));
	}
	onLoadMyDNACallback(status,response) {
		if(status){	
			this.setState({
				dataSource : this.state.dataSource.cloneWithRows(response.data),
				ListViewData: response.data
			});
		}
	}
	onLoadMyDNA() {
		
  		let apiRequest = new ApiRequest();
  		apiRequest.request(ApiMap.getDnas, {index:this.index,owner:true}, null, this.onLoadMyDNACallback.bind(this));
	}
	selectDNA(rowData,rowID) {
		selectedRow = rowData;
		this.state.selectedRowData = rowData;
		this.setState({ 
			selectedRowID: rowID,
			dataSource: this.state.dataSource.cloneWithRows( this.state.ListViewData),
		},() => {
			preRow = rowData
		})
	}
	renderImage(rowID) {
		
		if(this.state.selectedRowID === rowID) {
			return(
				<View style = {styles.scrollCover}>
					<Image source = {require('../images/common/selected.png')} style = {styles.scrollSelectedIcon}/>
				</View>
			)
		}
	}
	renderRow(rowData,sectionID,rowID) {
		return(
			<TouchableOpacity onPress = {()=> this.selectDNA(rowData, rowID)}>
				<Image source = {{uri:rowData.images}} style = {styles.scrollImg}>
					{this.renderImage(rowID)}
				</Image>
			</TouchableOpacity>
		)
	}
	render() {
		return(
			<ListView 
				dataSource = {this.state.dataSource}
				renderRow = {this.renderRow.bind(this)}/>
		)
	}
} 
const styles = StyleSheet.create({
	scrollImg:{
		alignSelf:'center',
		borderRadius: 5,
		height: 215 / 667 * deviceHeight,
		marginTop:20 / 667 * deviceHeight,
		width: 350 / 375 * deviceWidth, 
	},
	scrollCover:{
		alignItems:'center',
		backgroundColor:'rgba(0,0,0,.5)',
		height: 215 / 667 * deviceHeight,
		justifyContent:'center',
		position:'absolute',
		width: 350 / 375 * deviceWidth, 
	},
	scrollSelectedIcon:{
		height:40,
		width:40,
	}
})
function mapStateToProps(state) {
  const {tempScheme} = state;
  return {
    tempScheme,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(CloudsDnaSelect)