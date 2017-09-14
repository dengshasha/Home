import React,{ Component } from 'react';
import {
  Image,
  View,
  Text,
  ListView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import * as common from '../../utils/CommonUtils';
import NavigationBar from '../../components/NavigationBar';
import Colors from '../../constants/Colors';
import * as Images from '../../images/characterTest/main';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import SchemeHandler from '../../utils/SchemeHandler';
import DownloadModal from '../../components/DownloadModal';
import SaveDna from '../design/SaveDna';
import Spinner from '../../libs/react-native-loading-spinner-overlay';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
var apiRequest = new ApiRequest();

export default class RecommendDnaPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dnaDataSource: ds,
      selectedDnaId: 0,
      selectedDna: {},
      isFetching: false,
      fetchingText: '',
    }
    this.bannerDna = {};
    this.responseData = {};
  }

  componentDidMount() {
    this.loadRecommendDna();
  }

  loadRecommendDnaCallback(status, response) {
    if(status) {
      if(response.length > 0){
        this.bannerDna = response.shift();
        this.responseData = response;
        this.setState({ dnaDataSource:　ds.cloneWithRows(response), })
      }
    }
    this.setState({
      isFetching: false,
      fetchingText: ''
    })
  }

  loadRecommendDna() {
    this.setState({
      isFetching: true,
      fetchingText: '推荐风格获取中，请稍候...'
    })
    let params = {
      dnaCode: this.props.route.answers,
    }

    apiRequest.request(ApiMap.getRecommendDna, params, null, this.loadRecommendDnaCallback.bind(this))
  }

  renderRow(rowData, sectionID, rowID) {
    let isSelect = this.state.selectedDnaId == rowData.id;
    let width = (deviceWidth - 30) / 2;
    let image = SchemeHandler.jointImageSize(rowData.Images,{width: width});
    return(
      <View style={{width: width, height: 150 / 667 * deviceHeight, marginLeft: 10 / 375 * deviceWidth,marginTop: 10 / 667 * deviceHeight,}}>
        <TouchableOpacity onPress={() => this.onSelectStyle(rowData, rowID)}>
          <Image source={{uri: rowData.images}} style={{width: width, height: 150 / 667 * deviceHeight,justifyContent:'center',alignItems:'center' }}>
            {isSelect ? <Image source={Images.choose}/> : <Text />}
          </Image>
        </TouchableOpacity>
      </View>
    )
  }

  renderButton() {
    return(
      <TouchableOpacity style={{
        alignItems: 'center',
        backgroundColor: Colors.mainColor,
        bottom: 0,
        height: 50 / 667 * deviceHeight,
        justifyContent: 'center',
        position: 'absolute',
        width: deviceWidth,
        }} onPress = {() => this.showDownloadAlert()}>
        <Text style={{alignSelf: 'center', color: Colors.white, fontSize: 16, fontWeight: 'bold'}}>下载风格</Text>
      </TouchableOpacity>
    )
  }


  render() {
    let image = SchemeHandler.jointImageSize(this.bannerDna.Images,{width: deviceWidth});
    return(
     <View style={{flex:1,backgroundColor:Colors.mainBgColor}}>
      <NavigationBar
        title={'推荐风格'}
        navigator = {this.props.navigator}
        titleColor={Colors.black}
        leftButtonIcon = {require('../../images/common/icon_back_black.png')}
        backgroundColor = {Colors.White}
        onLeftButtonPress = {() => this.onLeftBack()}
        rightButtonIcon1 = {require('../../images/common/icon_customer_black.png')}
        logoIcon = {require('../../images/common/logo_black.png')}
        verticalLineColor = {Colors.black}/>
      <ScrollView style={{backgroundColor:　Colors.mainBgColor}}>
        <View style={{paddingHorizontal: 8}}>
          <Text style={styles.title}>推荐风格</Text>
          <TouchableOpacity style={{width:deviceWidth - 16,　height:　200 / 667 * deviceHeight,
            justifyContent:'center',　alignItems:'center'}} onPress={() => this.onSelectBannerDna()}>
            <Image source={{uri: this.bannerDna.images}} style={{width:deviceWidth - 16,　height:　200 / 667 * deviceHeight,
              justifyContent:'center',　alignItems:'center'}}>
              {this.state.selectedDnaId == this.bannerDna.id ? <Image source={Images.choose}/> : <Text />}
            </Image>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title,　{paddingLeft: 8}]}>更多风格</Text>
        <ListView
          dataSource = {this.state.dnaDataSource}
          contentContainerStyle = {styles.listViewItem}
          enableEmptySections = {true}
          renderRow = {this.renderRow.bind(this)}/>
      </ScrollView>
      {this.state.selectedDnaId > 0 ? this.renderButton() : <View />}
      {this.state.showDownloadAlert && <DownloadModal onClick={(download)=>this.modalButtonOnClick(download)}/>}
      <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
     </View>
    )
  }

  showDownloadAlert(){
    this.setState({
      showDownloadAlert: true
    });
  }

  modalButtonOnClick(download){
    this.setState({
      showDownloadAlert: !this.state.showDownloadAlert
    });
    if (download) {
      this.props.navigator.push({
        id: 'SaveDna',
        component: SaveDna,
        params: {
          selectedDNA: this.state.selectedDna
        }
      })
    }
  }

  onLeftBack() {
    this.props.navigator.pop();
  }

  onSelectStyle(rowData, rowID) {
    if(this.state.selectedDnaId == rowData.id) {
      this.setState({
        selectedDnaId: 0,
        selectedDna: {},
        dnaDataSource:　ds.cloneWithRows(this.responseData),
      })
    } else {
      this.setState({
        selectedDnaId: rowData.id,
        selectedDna: rowData,
        dnaDataSource:　ds.cloneWithRows(this.responseData),
      })
    }
  }

  onSelectBannerDna() {
    if(this.state.selectedDnaId == this.bannerDna.id) {
      this.setState({
        selectedDnaId: 0,
        selectedDna: {},
        dnaDataSource:　ds.cloneWithRows(this.responseData),
      })
    } else {
      this.setState({
        selectedDnaId: this.bannerDna.id,
        selectedDna: this.bannerDna,
        dnaDataSource:　ds.cloneWithRows(this.responseData),
      })
    }
  }
}

const styles = StyleSheet.create({
  listViewItem:{
    alignItems:'flex-start',
    flexDirection:'row',
    flexWrap:'wrap',
    marginBottom: 40 / 667 * deviceHeight,
    marginTop: -10 / 667 * deviceHeight,
    width: deviceWidth,
  },
  title: {
    color:Colors.black,
    paddingVertical: 12 / 667 * deviceHeight,
  }
})
