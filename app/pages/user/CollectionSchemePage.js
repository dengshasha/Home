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

import {connect} from 'react-redux';
import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import NavigationBar from '../../components/NavigationBar';
import PullToRefreshListView from 'react-native-smart-pull-to-refresh-listview';
import SmartListViewComponent from '../../components/SmartListViewComponent';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const COLLECT_TYPE_SCHEME = 'COLLECT_TYPE_SCHEME';
const COLLECT_TYPE_DNA = 'COLLECT_TYPE_DNA';

export default class CollectionSchemePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collectType: this.props.route.collectType,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
    };
    this.index = 1;
    this.data = [];
    this.onLeftBack = this.onLeftBack.bind(this);
  }

  componentDidMount() {
    this._pullToRefreshListView.beginRefresh()
  }

  onCollectedDnaCallback(status, responseData){
    if(status){
      this.data = [...responseData.data, ...this.data],
      this.setState({
        dataSource:this.state.dataSource.cloneWithRows(this.data)
      })
      let length = responseData.data.length;
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
    } else {
      //处理请求失败事件
      showErrorAlert(responseData);
    }
  }

  onCollectedSchemeCallback(status, responseData){
    if(status){
      this.data = [...responseData.data, ...this.data];
      this.setState({
        dataSource:this.state.dataSource.cloneWithRows(this.data)
      })
      let length = responseData.data.length;
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
    } else {
      //处理请求失败事件
      showErrorAlert(responseData);
    }
  }

  requestCollection(type){
    let apiRequest = new ApiRequest();
    if(type == COLLECT_TYPE_DNA)
      apiRequest.request(ApiMap.collectedDna, {index: this.index}, null, this.onCollectedDnaCallback.bind(this));
    else if (type == COLLECT_TYPE_SCHEME)
      apiRequest.request(ApiMap.collectedScheme, {index: this.index}, null, this.onCollectedSchemeCallback.bind(this));
  }

  renderRow(rowData, sectionID, rowID, highlightRowFunc){
    let cellWidth = deviceWidth;
    let cellHeight = 241 / 667 * deviceHeight;
    let image = rowData.images;
    return(
      <View style={{width: cellWidth, height: cellHeight , alignItems: 'center',}}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Image source={{uri: image}} style={{height: 180 / 667 * deviceHeight, width: deviceWidth}}/>
        </View>
        <View style={{height: 61 / 667 * deviceHeight, width: deviceWidth, alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: Colors.white}}>
          <View style={{flex: 1, width: deviceWidth, alignItems: 'flex-start'}}>
            <Text style={{ fontSize: 18, color: 'black', textAlign: 'left', marginLeft: 15 / 375 * deviceWidth}}>{rowData.name}</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row', width: deviceWidth, alignItems: 'center', justifyContent: 'flex-end'}}>
            <Image resizeMode={'contain'} source={require('../../images/user/icon_collection.png')}
              style={{height: 15 / 667 * deviceHeight, width: 15 / 375 * deviceWidth, marginRight: 5 / 375 * deviceWidth}}/>
            <Text style={{ fontSize: 14, color: Colors.lightGrey, textAlign: 'left', marginRight: 8 / 375 * deviceWidth}}>0</Text>
            <Image resizeMode={'contain'} source={require('../../images/user/icon_like.png')}
              style={{height: 15 / 667 * deviceHeight, width: 15 / 375 * deviceWidth, marginRight: 5 / 375 * deviceWidth}}/>
            <Text style={{ fontSize: 14, color: Colors.lightGrey, textAlign: 'left', marginRight: 8 / 375 * deviceWidth}}>0</Text>
            <Image resizeMode={'contain'} source={require('../../images/user/icon_message.png')}
              style={{height: 15 / 667 * deviceHeight, width: 15 / 375 * deviceWidth, marginRight: 5 / 375 * deviceWidth}}/>
            <Text style={{ fontSize: 14, color: Colors.lightGrey, textAlign: 'left', marginRight: 8 / 375 * deviceWidth}}>0</Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    const {navigator} = this.props;
    let title;
    if(this.state.collectType == COLLECT_TYPE_SCHEME)
      title = '收藏方案'
    else if(this.state.collectType == COLLECT_TYPE_DNA)
      title = '收藏风格'
    return (
      <View style={styles.mainContainer}>
        <NavigationBar
            title={title}
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
        <PullToRefreshListView
          ref={(component) => this._pullToRefreshListView = component}
          viewType={PullToRefreshListView.constants.viewType.listView}
          contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
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
    this.requestCollection(this.state.collectType)
  }

  _onLoadMore = () => {
    if (this.data.length && this.data.length % 20 == 0) {
      this.index ++
      this.requestCollection(this.state.collectType)
    } else {
      this._pullToRefreshListView.endLoadMore(true);
    }
  }

  onLeftBack() {
    const {navigator} = this.props;
    navigator.pop();
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    height: deviceHeight,
    width: deviceWidth,
  },
});
