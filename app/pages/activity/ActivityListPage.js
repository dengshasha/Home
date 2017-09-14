import React, {Component} from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ListView,
  NativeModules
} from "react-native";
import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import {ApiMap, CommunityApiMap} from '../../constants/Network';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import NavigationBar from '../../components/NavigationBar';
import PreloadImage from '../../components/PreloadImage'
import ActivityPage from './ActivityPage';
import ActivityDescriptionPage from './ActivityDescriptionPage'
import * as Icon from '../../images/';
var UMNative = NativeModules.UMNative;

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const TYPE_EXPIRED_ACTIVITY = 'TYPE_EXPIRED_ACTIVITY';
const TYPE_CURRENT_ACTIVITY = 'TYPE_CURRENT_ACTIVITY';

const currentTime = new Date().getTime() / 1000 >> 0;

export default class ActivityListPage extends Component {
  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({
      rowHasChanged: (r1,r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
     });
    this.state = {
      dataSource: ds,
      isFetching: false,
    };
    this.onLeftBack = this.onLeftBack.bind(this);
    this.allActivityData = [];
    this.renderRow = this.renderRow.bind(this);
  }

  componentDidMount() {
    this.onLoadActivities();
    UMNative.onPageBegin('ActivityListPage')

  }

  componentWillUnmount() {
    UMNative.onPageEnd('ActivityListPage')
  }

  onLoadActivities() {
    this.setState({
      isFetching: true,
      fetchingText: '活动获取中，请稍候...'
    })
    let apiRequest = new ApiRequest();
    apiRequest.request(CommunityApiMap.getActivities, null, null, (status, response) => {
      this.setState({
        isFetching: false,
        fetchingText: ''
      })
      if(status) {
        this.allActivityData = response.data;
        this.setState({
          dataSource: this.state.dataSource.cloneWithRowsAndSections(this._genRow())
        })
      }
    })
  }

  _genRow() {
    let currentData = [];
    let expiredData = [];
    let data = this.allActivityData;
    let results = {};
    for (let i = 0; i < data.length; i++) {
      if(data[i].end_time > currentTime) {
        currentData.push(data[i]);
      } else {
        expiredData.push(data[i]);
      }
    }
    results = {
      "当前活动": currentData,
      "往期活动": expiredData,
    };

    return results
  }

  enterActivityPage(activityId) {
    this.props.navigator.push({id:'ActivityPage', component: ActivityPage, activityId: activityId})
  }

  enterActivityDescriptionPage(activity) {
		this.props.navigator.push({
			id: 'ActivityDescriptionPage',
			component: ActivityDescriptionPage,
			activity: activity
		})
	}

  renderCurrentOnPress(rowData, sectionID, rowID) {
    return (
        <PreloadImage
          url={rowData.column_url}
          onPress={()=> this.enterActivityDescriptionPage(rowData)}
          style={{width: deviceWidth, height: 200 / 375 * deviceWidth}}
        />
    )
  }

  renderExpiredOnPress(rowData) {
    return (
			<PreloadImage
        isTouched={false}
        url={rowData.column_url}
        resizeMode={'contain'}
        style={{width: deviceWidth, height: 200 / 375 * deviceWidth}}
      />
    )
  }

  renderRow(rowData, sectionID, rowID) {
    let time = common.formatDateString(rowData.end_time);
    return (
      <View style = {{height: 250 / 375 * deviceWidth, width: deviceWidth,}}>
        {sectionID == "当前活动" ? this.renderCurrentOnPress(rowData, sectionID, rowID) : this.renderExpiredOnPress(rowData, sectionID, rowID)}
        <View
          style = {{
            alignItems: 'flex-end',
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderColor: Colors.veryLightGrey,
            justifyContent: 'center',
            height: 50 / 375 * deviceWidth,
            paddingHorizontal: 10,
            width: deviceWidth,
          }}
        >
          <Text>截止时间：{time}</Text>
        </View>
      </View>
    )
  }

  _renderHeader(sectionData, sectionID) {
    return(
      <View style = {{height: 50 / 667 * deviceHeight, paddingLeft: 15, flexDirection: 'row', alignItems: 'center'}}>
        <View style = {{backgroundColor: Colors.mainColor,height: 20 / 667 * deviceHeight,width: 2,}}></View>
        <Text style = {{color: Colors.black, fontSize: 16,fontWeight: 'bold', paddingLeft: 5,}}>{sectionID}</Text>
      </View>
    )

  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavigationBar
            title={'活动'}
            titleColor={Colors.black}
            backgroundColor={Colors.white}
            onLeftButtonPress={this.onLeftBack}
            leftButtonIcon={Icon.backBlack}
            rightButtonIcon1={Icon.customerBlack}
        />

          <ListView
            stickySectionHeadersEnabled = {false}
            enableEmptySections = {true}
            dataSource = {this.state.dataSource}
            renderRow  = {this.renderRow}
            renderSectionHeader = {(sectionData, sectionID) => this._renderHeader(sectionData, sectionID)}
          />
        <Spinner visible={this.state.isFetching} text={'加载中,请稍候...'}/>
      </View>
    );
  }

  onLeftBack() {
    const {navigator} = this.props;
    navigator.pop();
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: Colors.mainBgColor,
    flex: 1,
    width: deviceWidth,
  },
});
