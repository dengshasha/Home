import React, {Component} from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  AsyncStorage,
  Alert,
  Picker,
  Platform,
  ListView,
  ActivityIndicator,
  ProgressBarAndroid,
  ActivityIndicatorIOS,
} from "react-native";

import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import NavigationBar from '../../components/NavigationBar';
import PullToRefreshListView from 'react-native-smart-pull-to-refresh-listview';
import SmartListViewComponent from '../../components/SmartListViewComponent';
import NoDataDefaultView from '../../components/NoDataDefaultView';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const COLLECT_TYPE_PRODUCT = 'COLLECT_TYPE_PRODUCT';
const COLLECT_TYPE_MATERIAL = 'COLLECT_TYPE_MATERIAL';

export default class CollectionProductPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabState: COLLECT_TYPE_PRODUCT,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      hasData:true,
    };
    this.index = 1;
    this.data = [];
    this.onLeftBack = this.onLeftBack.bind(this);
    this.onSelectProduct = this.onSelectProduct.bind(this);
    this.onSelectMaterial = this.onSelectMaterial.bind(this);
  }

  componentDidMount() {
    this._pullToRefreshListView.beginRefresh()
  }

  componentWillUnmount() {
  }

  onCollectedProductCallback(status, responseData){
    if(status){
      this.data = [...responseData.data, ...this.data],
      this.setState({
        dataSource:this.state.dataSource.cloneWithRows(this.data)
      })
      let length = responseData.data.length;
      if(length == 0) {
        this.setState({hasData:false})
      } else {
        if (this.index != 1) {
          if(length < 20) {
            loadedAll = true;
            this._pullToRefreshListView.endLoadMore(loadedAll);
          } else {
            loadedAll = false;
            this._pullToRefreshListView.endLoadMore(loadedAll);
          }
        }
        this._pullToRefreshListView.endRefresh();
        //处理请求成功事件
      }

    } else {
      //处理请求失败事件
      showErrorAlert(responseData);
    }
  }

  onCollectedMaterialCallback(status, responseData){
    if(status){
      this.data = [...responseData.data, ...this.data];
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows([this.data])
      });
      let length = responseData.data.length;
      if (length == 0) {

      } else {
        if (this.index != 1) {
          if(length < 20) {
            loadedAll = true;
            this._pullToRefreshListView.endLoadMore(loadedAll);
          } else {
            loadedAll = false;
            this._pullToRefreshListView.endLoadMore(loadedAll);
          }
        }
        this._pullToRefreshListView.endRefresh();
        //处理请求成功事件
      }

    } else {
      //处理请求失败事件
      showErrorAlert(responseData);
    }
  }

  requestCollection(type){
    let apiRequest = new ApiRequest();
    if(type == COLLECT_TYPE_PRODUCT)
      apiRequest.request(ApiMap.collectedProduct, {index: this.index}, null, this.onCollectedProductCallback.bind(this));
    else if (type == COLLECT_TYPE_MATERIAL)
      apiRequest.request(ApiMap.collectedMaterial, {index: this.index}, null, this.onCollectedMaterialCallback.bind(this));
  }

  _renderRow(rowData, sectionID, rowID, highlightRowFunc){
    let cellWidth = 170 / 375 * deviceWidth;
    let cellHeight = 216 / 667 * deviceHeight;
    let image = rowData.images;
    return(
      <View style={{width: cellWidth, height: cellHeight , alignItems: 'center', margin: 8.75 / 375 * deviceWidth, borderRadius: 5}}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Image resizeMode={'contain'} source={{uri: image}} style={{height: 170 / 667 * deviceHeight, width: 170 / 375 * deviceWidth}}/>
        </View>
        <View style={{flexDirection: 'row', height: 46 / 667 * deviceHeight, width: 170 / 375 * deviceWidth, alignItems: 'center', justifyContent: 'space-between',
          padding: 10 / 667 * deviceHeight, backgroundColor: Colors.white}}>
          <Text style={{ fontSize: 18, color: 'black', textAlign: 'center'}}>{rowData.name}</Text>
          <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center'}} onPress={()=>{}}>
            <Image resizeMode={'contain'} source={require('../../images/user/icon_remove.png')}
              style={{height: 15 / 667 * deviceHeight, width: 15 / 375 * deviceWidth}}/>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  //没有数据时的默认视图
  renderDefaultView() {
    return(
      <NoDataDefaultView />
    )
  }

  renderList() {
    return(
      <PullToRefreshListView
        ref={(component) => this._pullToRefreshListView = component}
        viewType={PullToRefreshListView.constants.viewType.listView}
        contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
        initialListSize={20}
        enableEmptySections={true}
        dataSource={this.state.dataSource}
        pageSize={20}
        renderRow={this._renderRow.bind(this)}
        renderHeader={(viewState) => SmartListViewComponent._renderHeader(viewState)}
        renderFooter={(viewState) => SmartListViewComponent._renderFooter(viewState)}
        onRefresh={this._onRefresh.bind(this)}
        onLoadMore={this._onLoadMore.bind(this)}
        pullUpDistance={35}
        pullUpStayDistance={50}
        pullDownDistance={35}
        pullDownStayDistance={50}/>
    )
  }

  render() {
    const {login, navigator} = this.props;
    return (
      <View style={styles.mainContainer}>
        <NavigationBar
            title={'收藏物品'}
            navigator = {this.props.navigator}
            titleColor={Colors.black}
            backgroundColor={Colors.white}
            onLeftButtonPress={this.onLeftBack}
            leftButtonIcon={require('../../images/common/icon_back_black.png')}
            logoIcon = {require('../../images/common/logo_black.png')}
            verticalLineColor = {Colors.black}
            style={{elevation: 0}}
        />
        <View style={{flex: 1, backgroundColor: Colors.mainBgColor}}>
          <View style={{height: 25, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.white}}>
            <TouchableOpacity style={{height: 25, alignItems: 'center', justifyContent: 'center'}} onPress={this.onSelectProduct}>
              <Text style={{fontSize: 16, color: this.state.tabState == COLLECT_TYPE_PRODUCT ? Colors.mainColor : Colors.black,
                fontWeight:this.state.tabState == COLLECT_TYPE_PRODUCT ? 'bold' : 'normal'}}>物品</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{height: 25, alignItems: 'center', justifyContent: 'center'}} onPress={this.onSelectMaterial}>
              <Text style={{fontSize: 16, color: this.state.tabState == COLLECT_TYPE_MATERIAL ? Colors.mainColor : Colors.black,
                fontWeight:this.state.tabState == COLLECT_TYPE_MATERIAL ? 'bold' : 'normal'}}>设计</Text>
            </TouchableOpacity>
          </View>
          {this.state.hasData ? this.renderList() : this.renderDefaultView()}

        </View>
        <Spinner visible={this.state.isFetching} text={'登录中,请稍后...'}/>
      </View>
    );
  }

  _onRefresh = () => {
    this.index = 1;
    this.data = [];
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows([]),
    });
    this.requestCollection(this.state.tabState)
  }

  _onLoadMore = () => {
    if (this.data.length && this.data.length % 20 == 0) {
      this.index ++
      this.requestCollection(this.state.tabState)
    } else {
      this._pullToRefreshListView.endLoadMore(true);
    }
  }

  onLeftBack() {
    const {navigator} = this.props;
    navigator.pop();
  }

  onSelectProduct() {
    this.setState({
      tabState: COLLECT_TYPE_PRODUCT
    })
    this.requestCollection(COLLECT_TYPE_PRODUCT)
  }

  onSelectMaterial() {
    this.setState({
      tabState: COLLECT_TYPE_MATERIAL
    })
    this.requestCollection(COLLECT_TYPE_MATERIAL)
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    height: deviceHeight,
    width: deviceWidth,
  },
});
