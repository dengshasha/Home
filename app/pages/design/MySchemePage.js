import React,{Component} from 'react';
import {
  Image,
  Text,
  View,
  Alert,
  ListView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import Toast from 'react-native-easy-toast'
import * as common from '../../utils/CommonUtils' ;
import SchemeHandler from '../../utils/SchemeHandler' ;
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap, CommunityApiMap} from '../../constants/Network';
import Colors from '../../constants/Colors' ;
import NavigationBar from '../../components/NavigationBar' ;
import PanoramaPage from './PanoramaPage' ;
import ScrollableTabBar,{DivisionalTabBar,} from '../../libs/react-native-scrollable-tab-view';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import NoDataDefaultView from '../../components/NoDataDefaultView';
import PullRefreshListView from '../../components/PullRefreshListView';
import PreloadImage from '../../components/PreloadImage';
import ActivityPublishedPage from '../activity/ActivityPublishedPage';
import * as Icon from '../../images/';
import Shot from '../activity/Shot';
const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const apiRequest = new ApiRequest();

const TAB_TYPE_MINE = 'TAB_TYPE_MINE'
const TAB_TYPE_FRIEND = 'TAB_TYPE_FRIEND'
const TAB_TYPE_ACTIVITY = 'TAB_TYPE_ACTIVITY'
const TAB_TYPE_OTHER = 'TAB_TYPE_OTHER'

export default class MySchemePage extends Component {
  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = {
      dataSource: ds,
        hasData: true, //是否有数据标志位
        tabState: TAB_TYPE_MINE,
        footState: 0,
        isActivity: false,
      }
      this.onTabFocus = 0; //给每个tab做一个标记，从前往后为0 1 2。。。

      this.mySchemeIndex = 1;
      this.friendSchemeIndex = 1;
      this.activitySchemeIndex = 1;
      this.otherSchemeIndex = 1;

      this.mySchemeData = [];
      this.friendSchemeData = [];
      this.activitySchemeData = [];
      this.otherSchemeData = [];

      this.loadMineTime = 0
      this.loadFriendTime = 0
      this.loadActivityTime = 0
      this.loadOtherTime = 0
    }

    componentDidMount(){
      this.loadScheme(TAB_TYPE_MINE)
    }

    loadScheme(tabState) {
      let preState = this.state.tabState
      this.setState({
        tabState: tabState
      })
      switch (tabState) {
        case TAB_TYPE_MINE :
        this.onTabFocus = 0
        if (this.loadMineTime === 0) {
          this.setState({ isFetching: true, fetchingText: '加载中，请稍候...' })
          this.requestMyScheme()
          this.loadMineTime ++
        } else {
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.mySchemeData),
            isActivity: false,
          })
          if (this.mySchemeData.length) {
            this.setState({ hasData: true })
          } else {
            this.setState({ hasData: false })
          }
        }
        break
        case TAB_TYPE_FRIEND :
        this.onTabFocus = 1
        if (this.loadFriendTime === 0) {
          this.setState({ isFetching: true, fetchingText: '加载中，请稍候...' })
          this.requestFriendScheme()
          this.loadFriendTime ++
        } else {
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.friendSchemeData),
            isActivity: false,
          })
          if (this.friendSchemeData.length) {
            this.setState({ hasData: true })
          } else {
            this.setState({ hasData: false })
          }
        }
        break
        case TAB_TYPE_ACTIVITY :
        this.onTabFocus = 2
        if (this.loadActivityTime === 0) {
          this.setState({ isFetching: true, fetchingText: '加载中，请稍候...' })
          this.requestActivityScheme()
          this.loadActivityTime ++
        } else {
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.activitySchemeData),
            isActivity: true,
          })
          if (this.activitySchemeData.length) {
            this.setState({ hasData: true })
          } else {
            this.setState({ hasData: false })
          }
        }
        break
        case TAB_TYPE_OTHER :
        this.onTabFocus = 3
        if (this.loadOtherTime === 0) {
          this.setState({ isFetching: true, fetchingText: '加载中，请稍候...' })
          this.requestOtherScheme()
          this.loadOtherTime ++
        } else {
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.otherSchemeData),
            isActivity: false,
          })
          if (this.otherSchemeData.length) {
            this.setState({ hasData: true })
          } else {
            this.setState({ hasData: false })
          }
        }
        break
      }
    }

  //网络请求加载我的方案
  requestMyScheme(callback){
    apiRequest.request(ApiMap.getSchemes, {index: this.mySchemeIndex, owner: true}, null, (status, res) => {
      this.setState({ isFetching: false })
      if (status) {
        callback && callback()
        if(res.data.length == 0) {
          this.setState({hasData: false})
        } else {
          this.setState({hasData: true})
        }
        this.mySchemeData = [ ...this.mySchemeData, ...res.data]
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this.mySchemeData),
          isActivity: false,
        })
      }
    })
  }

  //网络请求加载好友方案
  requestFriendScheme(callback){
    apiRequest.request(ApiMap.getSchemes, {index: this.friendSchemeIndex, shared: true}, null, (status, res)=>{
      this.setState({ isFetching: false });
      if (status) {
        callback && callback()
        if (res.data.length == 0) {
          this.setState({hasData: false})
        } else {
          this.setState({hasData: true})
        }
        this.friendSchemeData = [ ...this.friendSchemeData, ...res.data]
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this.friendSchemeData),
          isActivity: false,
        });
      } else {

      }
    })
  }

  //网络请求加载活动方案
  requestActivityScheme(callback) {
    let body = {
      activityUserId: global.userInfo.user_id,
      communityIndex: this.activitySchemeIndex,
      order_by: 'desc'
    };
    apiRequest.request(CommunityApiMap.getActivityWorkRateOfUser, body, null, (status, response) => {
      this.setState({ isFetching: false });
      if(status) {
        console.log(response)
        callback && callback()
        if (response.data.length == 0) {
          this.setState({hasData: false})
        } else {
          this.setState({hasData: true})
        }
        this.activitySchemeData = [...this.activitySchemeData, ...response.data]
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this.activitySchemeData),
          isActivity: true,
        })
      }
    })
  }

  //网络请求加载其他方案
  requestOtherScheme(callback){
    apiRequest.request(ApiMap.getSchemes,{index: this.friendSchemeIndex, incoming: true},null,(status, res)=>{
      this.setState({ isFetching: false });
      if (status) {
        callback && callback()
        if(res.data.length == 0) {
          this.setState({hasData: false})
        } else {
          hasData: true
        }
        this.otherSchemeData = [ ...this.otherSchemeData, ...res.data]
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this.otherSchemeData),
          isActivity: false,
        })
      } else {

      }
    })
  }

  //下拉刷新
  onPullRelease(resolve) {
    switch (this.state.tabState) {
      case TAB_TYPE_MINE :
      this.mySchemeIndex = 1
      this.mySchemeData = []
      this.requestMyScheme(() => {this.hideRefreshLogo(resolve)})
      break
      case TAB_TYPE_FRIEND :
      this.friendSchemeIndex = 1
      this.friendSchemeData = []
      this.requestFriendScheme(() => {this.hideRefreshLogo(resolve)})
      break
      case TAB_TYPE_ACTIVITY :
      this.activitySchemeIndex = 1
      this.activitySchemeData = []
      this.requestActivityScheme(() => {this.hideRefreshLogo(resolve)})
      break
      case TAB_TYPE_OTHER :
      this.otherSchemeIndex =  1
      this.otherSchemeData = []
      this.requestOtherScheme(() => {this.hideRefreshLogo(resolve)})
      break
    }
  }

  //下拉刷新完成回调
  hideRefreshLogo(resolve){
    this.timer = setTimeout(() => {
      resolve()
      this.toast.show('刷新成功')
    }, 500)
  }

  //上拉加载更多
  _onLoadMore() {
    switch (this.state.tabState) {
      case TAB_TYPE_MINE :
      if (this.mySchemeData.length % 20 === 0 && this.mySchemeData.length !== 0) {
          this.setState({footState: 1}) //footState = 1:加载中
          this.timer = setTimeout(() => {
            this.mySchemeIndex ++;
            this.requestMyScheme();
          }, 800)
        } else {
          this.setState({ footState: 2 })//footState = 2:加载完成
        }
        break
        case TAB_TYPE_FRIEND :
        if (this.friendSchemeData.length % 20 === 0 && this.friendSchemeData.length !== 0) {
          this.setState({footState: 1}) //footState = 1:加载中
          this.timer = setTimeout(() => {
            this.friendSchemeIndex ++;
            this.requestFriendScheme();
          }, 800)
        } else {
          this.setState({ footState: 2 })//footState = 2:加载完成
        }
        break
        case TAB_TYPE_ACTIVITY :
        if (this.activitySchemeData.length % 20 === 0 && this.activitySchemeData.length !== 0) {
          this.setState({footState: 1}) //footState = 1:加载中
          this.timer = setTimeout(() => {
            this.activitySchemeIndex ++;
            this.requestActivityScheme();
          }, 800)
        } else {
          this.setState({ footState: 2 })//footState = 2:加载完成
        }
        break
        case TAB_TYPE_OTHER :
        if (this.otherSchemeData.length % 20 === 0 && this.otherSchemeData.length !== 0) {
          this.setState({footState: 1}) //footState = 1:加载中
          this.timer = setTimeout(() => {
            this.otherSchemeIndex ++;
            this.requestOtherScheme();
          }, 800)
        } else {
          this.setState({ footState: 2 })//footState = 2:加载完成
        }
        break
      }
    }


    requestMyImportedCases(){
      apiRequest.request(CommunityApiMap.getMyImportedCases, null, null, (status, response)=>{
        if(status) {
          this.importedCases = response.works_ids
        }
      })
    }

    enterPanoramaPage(scheme){
      SchemeHandler.scheme = scheme
      this.props.navigator.push({id: 'PanoramaPage', component: PanoramaPage});
    }

    enterActivityPublishedPage(rowData) {
      this.props.navigator.push({
        id: 'ActivityPublishedPage',
        component: ActivityPublishedPage,
        params: {workId: rowData.id, activityId: rowData.activity_id}
      })
    }

    newTempScheme(scheme){
      SchemeHandler.newScheme('tempScheme', scheme, (status, responseData)=>{
        if (status ) {
          let apiRequest = new ApiRequest();
          apiRequest.request(ApiMap.getScheme,{version: responseData.newId},null,(status, res)=>{
            this.setState({ isFetching: false, fetchingText: '' });
            if (status) {
             this.enterPanoramaPage(res.data)
           }
         })
        }
      })
    }

    rowOnClick(scheme){
      if (this.onTabFocus == 0) {
        this.enterPanoramaPage(scheme)
      } else{
        this.setState({ isFetching: true, fetchingText: '方案提取中' })
        let apiRequest = new ApiRequest();
        apiRequest.request(ApiMap.getScheme,{version: scheme.id},null,(status, res)=>{
          this.setState({ isFetching: false })
          if (status) {
            this.newTempScheme(res.data)
          }
        })
      }
    }

//删除方案
deleteScheme(schemeData){
  Alert.alert('删除方案', '确定删除此方案？删除后不可撤销',[
    {text: '取消', onPress: ()=>{}},
    {text: '确定', onPress: ()=>{
      let apiRequest = new ApiRequest();
      apiRequest.request(ApiMap.deleteScheme,{version: schemeData.id},null,(status, res)=>{
        if (status) {
          let mySchemeData = this.mySchemeData.filter((scheme, index) => scheme.id != schemeData.id);
          this.setState({mySchemeDataSource: this.state.mySchemeDataSource.cloneWithRows(mySchemeData)});
          this.refs.toast.show('方案删除成功！');
          this.mySchemeData = mySchemeData;
        }
      })
    }}
    ])
}

//发布方案
publishScheme(schemeData){
    /**
     * 1、根据 id 获取指定方案详情，存到 task;
     * 2、将 task 发送到 shot.js 进行全景图处理 和 数据解析
     * */
    //this.releaseCommonScheme();
     Alert.alert('方案发布', '方案还没有封面！',[
      {text: '再看看', onPress: () => {}},
      {text: '去拍摄', onPress: () => {
        this.setState({
          isFetching: true,
          fetchingText: '全景图准备中，马上就来...'
        });
        apiRequest.request(ApiMap.getScheme, {version: schemeData.id}, null, (status, responseData) => {
          this.setState({isFetching: false});
          if(status) {
            let taskScheme = responseData.data;
            this.props.navigator.push({id: 'shot', component: Shot, taskScheme, params: {actionType: 'common'}})
          } else {
            showErrorAlert(responseData)
          }
        })
      }}
      ])
   }

   onPublishSchemeCallBack(status, responseData){
    this.setState({
      isFetching: false,
      fetchingText: ''
    })
    if(status){

    } else {
      showErrorAlert(responseData);
    }
  }

  isImported(rowData){
    let isImported = false;
    this.importedCases && this.importedCases.map((item, index, items)=>{
      if (item.id == rowData.id) {
        isImported = true;
      }
    })
    return isImported
  }



  // 发布方案
  _shcemeRelease (schemeData, isImported) {
    if (isImported) {
      return (
        <View style={[styles.releasebtn,{borderColor: Colors.lightGrey}]}>
        <Image source={Icon.grayRelease} resizeMode={'cover'}/>
        <Text style = {{color: 'gray', fontSize: 12, margin:2}}>已发布</Text>
        </View>
        )
    } else if(this.onTabFocus== 0){
      return (
        <TouchableOpacity
        onPress={() => this.publishScheme(schemeData)}
        style={[styles.releasebtn,{borderColor: Colors.mainColor}]}>
        <Image source={Icon.redRelease} resizeMode={'cover'}/>
        <Text style={{
          margin: 2,
          fontSize: 12,
          color: Colors.mainColor
        }}>发布</Text>
        </TouchableOpacity>
        );
    }
  }

  //渲染listview视图
  _renderSchemeRow(rowData, sectionId, rowId){
    let time = rowData.createdUtc.slice(0,10)
    let image = SchemeHandler.getScreenshot(rowData, {width: deviceWidth})
    let isImported =  this.isImported(rowData)
    return (
      <View style={ styles.listItemContainer }>
      <View style={styles.listItemImg}>
      <Text style={{color:Colors.black,fontSize:16,fontWeight:'bold'}}>{rowData.name}</Text>
      <View style={{flexDirection:'row',alignItems:'center'}}>
      <Text style={{fontSize:12}}>{time}</Text>
      {this._shcemeRelease(rowData, isImported)}
      {  (this.onTabFocus==0) &&
       (
        <TouchableOpacity
        onPress={() => this.deleteScheme(rowData)}
        style={{paddingLeft: 15}}>
        <Image source={Icon.deleteIcon}/>
        </TouchableOpacity>
        )
     }
     </View>
     </View>
     <PreloadImage
     url={image}
     onPress={()=> this.rowOnClick(rowData)}
     style={{width:deviceWidth,height: 225 / 667 * deviceHeight}}
     />

        {/*<View style={{flexDirection:'row',justifyContent:'space-around',paddingVertical: 10 / 667 * deviceHeight}}>
         <TouchableOpacity style={{flexDirection:'row'}}>
            <Image source={require('../../images/scheme/myscheme/icon_like.png')}/>
            <Text style={{paddingLeft:6 / 375 * deviceWidth}}>213</Text>
          </TouchableOpacity>
          <View style={{width:1,height:15,backgroundColor:Colors.veryLightGrey}}/>
          <TouchableOpacity style={{flexDirection:'row'}}>
            <Image source={require('../../images/scheme/myscheme/icon_collection.png')}/>
            <Text style={{paddingLeft:6 / 375 * deviceWidth}}>213</Text>
          </TouchableOpacity>
        </View>*/}
        </View>
        )
  }

  //渲染活动 listview视图
  _renderActivitySchemeRow(rowData, sectionId, rowId) {
    let date = new Date(rowData.created_at * 1000)
    let time = date.getFullYear() + '-' + date.getUTCMonth() + '-' + date.getDate()
    let image = rowData.works_img
    return (
      <View style={ styles.listItemContainer }>
        <View style={styles.listItemImg}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={{fontSize:12}}>{time}</Text>
        </View>
      </View>
      <PreloadImage
        url={image}
        onPress={() => this.enterActivityPublishedPage(rowData)}
        style={{width:deviceWidth,height: 225 / 667 * deviceHeight}}
      />
      </View>
    )
  }

  render() {
    return(
      <View style={{flex:1, backgroundColor:Colors.mainBgColor}}>
      {this.state.hasData ?
        <PullRefreshListView
        style = {{marginTop: 20}}
        processIconYPosition = {90}
        onPullRelease = {this.onPullRelease.bind(this)}
        enableEmptySections={true}
        dataSource={this.state.dataSource}
        upPullState = {this.state.footState}
        renderRow={this.state.isActivity ? this._renderActivitySchemeRow.bind(this) : this._renderSchemeRow.bind(this)}
        onLoadMore = {this._onLoadMore.bind(this)}
        />
        : <NoDataDefaultView />
      }
      <View style = {{position: 'absolute' }}>
      <NavigationBar
      title={'方案'}
      style={{elevation: 0}}
      backgroundColor={'#fff'}
      navigator = {this.props.navigator}
      onLeftButtonPress={() => this.props.navigator.pop()}
      leftButtonIcon={Icon.backBlack}
      rightButtonIcon1={Icon.customerBlack}
      logoIcon = {Icon.logoBlack}
      verticalLineColor = {Colors.black}
      />
      <View style = {styles.tabContainer}>
      <TouchableOpacity style = {styles.tabBtn} onPress = {() => this.loadScheme(TAB_TYPE_MINE)}>
      <Text style = {[styles.tabText, {color: this.state.tabState === TAB_TYPE_MINE ? Colors.black : Colors.midgrey}]}>我的</Text>
      <View style = {[styles.tabUnderline, {backgroundColor: this.state.tabState === TAB_TYPE_MINE ? Colors.mainColor : Colors.transparent}]}/>
      </TouchableOpacity>
      <TouchableOpacity style = {styles.tabBtn} onPress = {() => this.loadScheme(TAB_TYPE_FRIEND)}>
      <Text style = {[styles.tabText, {color: this.state.tabState === TAB_TYPE_FRIEND ? Colors.black : Colors.midgrey}]}>好友</Text>
      <View style = {[styles.tabUnderline, {backgroundColor: this.state.tabState === TAB_TYPE_FRIEND ? Colors.mainColor : Colors.transparent}]}/>
      </TouchableOpacity>
      <TouchableOpacity style = {styles.tabBtn} onPress = {() => this.loadScheme(TAB_TYPE_ACTIVITY)}>
      <Text style = {[styles.tabText, {color: this.state.tabState === TAB_TYPE_ACTIVITY ? Colors.black : Colors.midgrey}]}>活动</Text>
      <View style = {[styles.tabUnderline, {backgroundColor: this.state.tabState === TAB_TYPE_ACTIVITY ? Colors.mainColor : Colors.transparent}]}/>
      </TouchableOpacity>
      <TouchableOpacity style = {styles.tabBtn} onPress = {() => this.loadScheme(TAB_TYPE_OTHER)}>
      <Text style = {[styles.tabText, {color: this.state.tabState === TAB_TYPE_OTHER ? Colors.black : Colors.midgrey}]}>其他</Text>
      <View style = {[styles.tabUnderline, {backgroundColor: this.state.tabState === TAB_TYPE_OTHER ? Colors.mainColor : Colors.transparent}]}/>
      </TouchableOpacity>
      </View>
      </View>


      <Toast ref = {(toast) => this.toast = toast}/>
      <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>

      </View>

      )
  }

}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flexDirection: 'row',
    height: 35 / 667 * deviceHeight,
    justifyContent: 'space-around',
    paddingHorizontal: 20 / 667 * deviceHeight,
    width: deviceWidth,
  },
  tabBtn: {
    alignItems: 'center',
    flex: 1,
  },
  tabUnderline: {
    height: 3,
    marginTop: 3,
    width: 50 / 667 * deviceHeight,
  },
  releasebtn: {
    marginLeft: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 4,
  },
  listItemContainer: {
    backgroundColor:Colors.white,
    borderWidth:1,
    borderColor:Colors.veryLightGrey,
    marginTop: 15 / 667 * deviceHeight,
    width:deviceWidth,
  },
  listItemImg: {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems: 'center',
    height: 45 / 667 * deviceHeight,
    paddingHorizontal:10 / 375 * deviceWidth,
  }
})
