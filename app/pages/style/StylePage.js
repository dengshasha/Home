import React,{Component} from 'react';
import {
  Image,
  Text,
  View,
  Modal,
  ListView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as common from '../../utils/CommonUtils' ;
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import Colors from '../../constants/Colors' ;
import PullToRefreshListView from 'react-native-smart-pull-to-refresh-listview';
import NavigationBar from '../../components/NavigationBar' ;
import DesignerPage from './DesignerPage';
import DNADetailsPage from './DNADetailsPage';
import MasterStylePage from './MasterStylePage';
import * as Images from '../../images/style/main';
import SmartListViewComponent from '../../components/SmartListViewComponent';
import PreloadImage from '../../components/PreloadImage';
import DownloadModal from '../../components/DownloadModal';
import SaveDna from '../design/SaveDna';
import Spinner from '../../libs/react-native-loading-spinner-overlay';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

class ModalView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: true,
    }
  }
  render() {
    return (
      <Modal
        visible = {this.state.modalVisible}
        transparent = {true}
        onRequestClose = {() => {}}
        animationType = {'slide'}>
        <View style = {{
          width: deviceWidth,
          height: deviceHeight,
          backgroundColor:'rgba(0,0,0,.8)',}}>
          <View style={{
            alignSelf:'center',
            alignItems:'center',
            backgroundColor:'rgba(255,255,255,0.9)',
            borderRadius: 10,
            height: 470 / 667 * deviceHeight,
            marginTop : 60 / 667 * deviceHeight,
            paddingHorizontal : 15 / 375 * deviceWidth,
            width: deviceWidth - 40 / 375 * deviceWidth
          }}>
            <Text style={{fontSize: 20,color:Colors.black,lineHeight: 40,alignSelf:'center',fontWeight:'bold'}}>大师风格</Text>
            <Image source = {Images.mainModalBg} style={{marginVertical: 10 / 667 * deviceHeight}}/>

            <Text style={styles.modalText}>
            装修风格迟迟举棋不定，{'\n'}
            想要自己DIY，也想要参考大师的设计灵感？{'\n'}

            现在，你可以直接站在大师肩膀上，{'\n'}
            把<Text style={{color:Colors.mainColor}}>最顶尖的设计DNA</Text>套用到你的家，{'\n'}
            把各种风格尝试遍，还不赶紧试一试？

            </Text>

          </View>
          <TouchableOpacity style = {styles.modalButton} onPress = {() => this.setState({modalVisible:!this.state.modalVisible})}>
            <Image source = {Images.mainClose}/>
          </TouchableOpacity>
        </View>

      </Modal>
    )
  }
}

class Header extends Component {

  render() {
    return(
      <View>
        <TouchableOpacity onPress = {()=>this.props.enterMasterStylePage()}>
          <Image source={require('../../images/style/master_header.gif')} style={{width: deviceWidth, height: 210 / 667 * deviceHeight}} />

        </TouchableOpacity>
        <Text style={{paddingLeft:15 / 375 * deviceWidth,paddingTop: 15 / 667 * deviceHeight,color:Colors.black,fontSize:16,}}>全球风格</Text>
      </View>
    )
  }
}

export default class StylePage extends Component {
  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({
        rowHasChanged: (r1,r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1,s2) => s1 !== s2,
      });
    this.data = [];
    this.state = {
      dataSource : ds,
      isFetching : false,
      fetchText : '',
    }
    this.data = [];
    this.index = 1;
    this._renderRow = this._renderRow.bind(this)
    this._onRefresh = this._onRefresh.bind(this)
    this._onLoadMore = this._onLoadMore.bind(this)
  }

  componentDidMount() {
    let apiRequest = new ApiRequest();
    this.setState({
      isFetching: true,
      fetchText: '加载中，请稍候...'
    })

    apiRequest.request(ApiMap.getDnas, {index:this.index}, null, this.getStyleCallback.bind(this))
  }

  getRows() {
    let dataObj = {header: [1], body: this.data}
    return dataObj
  }


  getStyle() {
    let apiRequest = new ApiRequest();
    apiRequest.request(ApiMap.getDnas,{index:this.index},null,this.getStyleCallback.bind(this))
  }

  getStyleCallback(status,response) {
    this.setState({
      isFetching: false,
      fetchText: ''
    })
    if(status) {
      this.data = [...this.data, ...response.data];
      this.setState({dataSource:this.state.dataSource.cloneWithRowsAndSections(this.getRows())})
      let length = response.data.length;
      if(this.index > 1) {
        if(length < 20) {
          loadedAll = true;
          this._pullToRefreshListView.endLoadMore(loadedAll);
        } else{
          loadedAll = false;
          this._pullToRefreshListView.endLoadMore(loadedAll);
        }
        this._pullToRefreshListView.endRefresh();
      }

    } else {
      //处理请求失败事件
      showErrorAlert(response);
    }
  }


  showDownloadAlert(dnaData){
    this.selectedDNA = dnaData;
    this.setState({showDownloadAlert: true});
  }

  modalButtonOnClick(download){
    this.setState({showDownloadAlert: !this.state.showDownloadAlert});
    if (download) {
      this.props.navigator.push({id: 'SaveDna', component: SaveDna, params: {selectedDNA: this.selectedDNA}})
    }
  }

  _renderRow(rowData,sectionID,rowID,highlightRowFunc) {
    if (sectionID == 'header') {
      return <Header enterMasterStylePage = {()=> this.enterMasterStylePage()}/>
    }
    return(
      <View style={{marginTop:15 / 667 * deviceHeight,backgroundColor:Colors.white}}>
        <PreloadImage
          url={rowData.images + '?imageView2/0/w/' + deviceWidth}
          onPress = {() => this.enterDNADetailsPage(rowData)}
          style={{width:deviceWidth, height:181 / 667 * deviceHeight}}
        />
        <View style = {{flexDirection:'row',
          justifyContent:'space-between',
          height:50 / 667 * deviceHeight,
          paddingHorizontal:10 / 375 * deviceWidth,
          alignItems:'center'}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
          {/*
            <TouchableOpacity onPress = {this.enterDesignerPage.bind(this)}>
              <Image source={require('../../images/style/avatar.png')} style={{width: 35 / 375 * deviceWidth,height:35 / 375 * deviceWidth}}/>
            </TouchableOpacity>
          */}

            <View style={{paddingLeft:15 / 375 * deviceWidth}}>
              <TouchableOpacity onPress = {this.enterDesignerPage.bind(this)}>
                <Text style={{color:Colors.black,fontSize:16,}}>{rowData.name}</Text>
              </TouchableOpacity>

              {/*<View style={{borderWidth:1,borderColor:Colors.mainColor,borderRadius: 3,width: 40 / 375 * deviceWidth,alignItems:'center',marginTop:5 / 667 * deviceHeight}}>
                <Text style={{color:Colors.mainColor,fontSize:12}}>现代</Text>
              </View>*/}
            </View>
          </View>
          <TouchableOpacity onPress = {()=> this.showDownloadAlert(rowData)}>
            <Image source={Images.download_gray}/>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  render() {
    return(
      <View style={{flex:1, backgroundColor:Colors.mainBgColor}}>
        <PullToRefreshListView
          ref={(component) => this._pullToRefreshListView = component}
          viewType={PullToRefreshListView.constants.viewType.listView}
          initialListSize={20}
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          pageSize={20}
          renderRow={this._renderRow}
          renderHeader={(viewState) => SmartListViewComponent._renderHeader(viewState)}
          renderFooter={(viewState) => SmartListViewComponent._renderFooter(viewState)}
          onRefresh={this._onRefresh}
          onLoadMore={this._onLoadMore}
          pullUpDistance={35}
          pullUpStayDistance={50}
          pullDownDistance={35}
          pullDownStayDistance={50}/>
        <NavigationBar
          style={{position:'absolute',}}
          title={''}
          leftButtonIcon = {require('../../images/common/icon_back_white.png')}
          backgroundColor = {Colors.transparent}
          onLeftButtonPress = {() => this.onLeftBack()}
          rightButtonIcon1 = {require('../../images/common/icon_customer_white.png')}/>
        {this.state.showDownloadAlert && <DownloadModal onClick={(download)=>this.modalButtonOnClick(download)}/>}
        <Spinner visible={this.state.isFetching} text={this.state.fetchText}/>
      </View>
    )
  }

  _onRefresh() {
    this.getStyle()
  }

  enterDesignerPage() {
    // this.props.navigator.push({id:'DesignerPage',component:DesignerPage});
  }

  enterDNADetailsPage(rowData) {
    this.props.navigator.push({id:'DNADetailsPage',component:DNADetailsPage,DNADetailsData:rowData,allData:this.data});
  }

  enterMasterStylePage() {
    this.props.navigator.push({id:'MasterStylePage', component:MasterStylePage});
  }

  onLeftBack() {

    this.props.navigator.pop();
  }

  _onLoadMore(){
    if (this.data.length % 20 == 0 && this.data.length) {
          this.index ++
          this.getStyle()
    } else{
      this._pullToRefreshListView.endLoadMore(true)
    }
  }
}

const styles = StyleSheet.create({
  modalText: {
    color:Colors.black,
    lineHeight: 30,
    paddingHorizontal: 10 / 375 * deviceWidth,
  },
  modalButton:{
    alignItems:'center',
    alignSelf:'center',
    marginTop: 50 / 667 * deviceHeight,
  },

})
