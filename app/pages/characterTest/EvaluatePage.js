import React,{Component} from 'react';
import {
  Image,
  Text,
  View,
  Modal,
  ListView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import ViewPager from '../../libs/react-native-viewpager';

import * as common from '../../utils/CommonUtils' ;
import Colors from '../../constants/Colors' ;
import * as Images from '../../images/characterTest/main';
import Toast, {DURATION} from 'react-native-easy-toast';
import TestResultPage from './TestResultPage';
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {EvaluateApiMap} from '../../constants/Network';
import Spinner from '../../libs/react-native-loading-spinner-overlay';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();
var viewPagerDs = new ViewPager.DataSource({pageHasChanged: (p1, p2) => p1 !== p2});
let answerArr = [];
let tempSelectedIds = [];
const maxItems = 3;
var buttonLock = false;
var apiRequest = new ApiRequest();

export default class EvaluatePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questionDetailsDataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      }),
      questionData: [],
      questionDataSource: viewPagerDs.cloneWithPages([]),
      SelectedIds: tempSelectedIds,
      currentPage: 0,
      isFetching: false,
      fetchingText: '',
    }
  }

  componentDidMount() {
    this.setState({
      isFetching: true,
      fetchingText: '问卷获取中，请稍候...'
    })
    apiRequest.request(EvaluateApiMap.getAllQuestions, null, null, (status, response)=>{
      this.setState({
        isFetching: false,
        fetchingText: ''
      })
      if (status) {
        this.setState({
          questionData: response,
          questionDataSource: viewPagerDs.cloneWithPages(response),
        })
      }
    })
  }

  //每一个题的图片列表
  _renderRow(rowData, rowID) {
    let width = (deviceWidth - 60) / 3;
    const isSelect = Array.from(this.state.SelectedIds).indexOf(rowData.Picture.Id) !== -1;
    return(
      <TouchableOpacity key={rowID} style={{marginTop: 15 / 667 * deviceHeight, width: width, height: width, marginLeft: 10, borderRadius: 5}}
        onPress={()=>this.onSelectItem(rowData.Picture)}>
        <Image source={{uri: rowData.Picture.Url}} style={{width: width, height: width, borderRadius: 5, alignItems: 'center', justifyContent: 'center'}}>
          {isSelect ? <Image source={Images.choose}/> : <View/>}
        </Image>
      </TouchableOpacity>
    )
  }

  _renderPage(data, pageID) {
    return(
      <View>
        <View style={{flexDirection: 'row', marginTop: 30 / 667 * deviceHeight, justifyContent: 'center'}}>
          <Image source={Images.tag}/>
          <Text style={{paddingLeft: 10 / 375 * deviceWidth, color: Colors.mainColor, fontSize: 16}}>{data.Title}</Text>
        </View>
        <View style={{width: deviceWidth, height: deviceWidth - 10 / 667 * deviceHeight, marginTop: 60 / 667 * deviceHeight, flexDirection:'row', flexWrap:'wrap', justifyContent:'center', alignItems: 'center'}}>
          {
            //取数组前九项供选择
            data.Options.slice(0, 9).map((image, index)=>this._renderRow(image, index))
          }
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Image source={Images.more}/>
          <Text style={{paddingLeft: 10 / 375 * deviceWidth, color: Colors.black, fontSize: 12}}>{`最多不超过${maxItems}个选项`}</Text>
        </View>
      </View>
    )
  }

  render(){
    return(
      <View style={{height: deviceHeight, width: deviceWidth}}>
        <ViewPager
          dataSource = {this.state.questionDataSource}
          renderPage = {this._renderPage.bind(this)}
          locked = {true}
          onChangePage = {(pageNumber) => this.onChangePage(pageNumber)}
          ref = {(viewPager) => this.viewPager = viewPager}
          dotSize = {10}
          dotViewStyle = {{top: 80 / 667 * deviceHeight, bottom: 470 / 667 * deviceHeight}}
          dotStyle = {{backgroundColor: 'rgba(243, 57, 89, 0.6)', width: 10, height: 10, borderRadius: 5}}
          selectedDotStyle = {{backgroundColor: Colors.mainColor, width: 16, height: 16, borderRadius: 8, top: 7, marginTop: 0, marginLeft: 5}}/>
        <View style={{flexDirection:'row', justifyContent:'center', height: 80 / 667 * deviceHeight,
          paddingVertical: 20 / 667 * deviceHeight}}>
          {this.state.currentPage > 0 && <TouchableOpacity style={styles.preBtn} onPress={()=>this.onPrevious()}>
            <Text style={styles.preBtnText}>上一题</Text>
          </TouchableOpacity>}
          <TouchableOpacity style={[styles.finishBtn, {marginLeft: 20 / 375 * deviceWidth}]} onPress={()=>this.onFinish()}>
            <Text style={styles.finishBtnText}>完成</Text>
          </TouchableOpacity>
        </View>
        <Toast ref="toast"/>
        <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
      </View>
    )
  }

  onPrevious() {
    if(buttonLock){
      return;
    } else {
      buttonLock = true;
    }
    let page = this.state.currentPage - 1;
    this.setState({
      SelectedIds: answerArr[page],
      currentPage: page
    }, ()=>{
      this.viewPager.movePage(-1);
      tempSelectedIds = answerArr[page];
    });
  }

  onFinish() {
    if(buttonLock){
      return;
    } else {
      buttonLock = true;
    }
    let page = this.state.currentPage + 1;
    if(tempSelectedIds.length <= 0) {
      this.refs.toast.show('请至少选择1项');
      buttonLock = false;
      return;
    }
    this.setState({
      SelectedIds: [],
      currentPage: page
    }, ()=>{
      this.modifyAnswerArr(page);
      if(page == this.state.questionData.length){
        buttonLock = false;
        this.setState({
          isFetching: true,
          fetchingText: '品味密码评测中，请稍候...'
        })
        //将二维数组降阶为一维数组
        let newAnswerArr = this.unidimensionalArray(answerArr);
        let body = {
          'pics': newAnswerArr,
        }
        apiRequest.request(EvaluateApiMap.getQuestionsResult, null, body, (status, response)=>{
          if (status) {
            this.setState({
              isFetching: false,
              fetchingText: ''
            })
            this.props.navigator.push({id: 'TestResultPage', component: TestResultPage, answers: response})
          }
        })
      } else {
        this.viewPager.movePage(1);
      }
    });
  }

  //将二维数组降阶为一维数组
  unidimensionalArray (arr) {
    return arr.reduce((p1, p2) => p1.concat(Array.isArray(p2) ? this.unidimensionalArray(p2) : p2), []);
  };

  modifyAnswerArr(pageNumber) {
    if(answerArr.length < pageNumber){
      answerArr.push(tempSelectedIds);
      tempSelectedIds = [];
    } else {
      answerArr.splice(pageNumber - 1, 1, tempSelectedIds);
      tempSelectedIds = [];
    }
  }

  onSelectItem(picture) {
    let id = picture.Id;
    const pos = tempSelectedIds.indexOf(parseInt(id));
    if(pos === -1) {
      if(tempSelectedIds.length >= maxItems) {
        this.refs.toast.show(`最多只能选择${maxItems}项`);
        return;
      }
      //选中
      tempSelectedIds.push(parseInt(id));
    } else {
      //取消选中
      tempSelectedIds.splice(pos, 1);
    }
    this.setState({
      SelectedIds: tempSelectedIds
    });
  }

  onChangePage(pageNumber) {
    this.setState({
      currentPage: pageNumber,
    })
    buttonLock = false;
  }

  enterNextTopic() {
  }
}

const styles = StyleSheet.create({
  listViewItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: deviceWidth,
    paddingLeft: 10,
    paddingRight: 20,
  },
  preBtn: {
    alignItems:'center',
    borderWidth: 1,
    borderColor: Colors.mainColor,
    borderRadius: 5,
    justifyContent: 'center',
    paddingVertical: 10 / 667 * deviceHeight,
    width: 120 / 375 * deviceWidth,
  },
  preBtnText:{
    color: Colors.mainColor,
    fontSize: 16,
  },
  finishBtn: {
    alignItems: 'center',
    backgroundColor: Colors.mainColor,
    borderRadius: 5,
    justifyContent: 'center',
    paddingVertical: 10 / 667 * deviceHeight,
    width: 120 / 375 * deviceWidth,
  },
  finishBtnText: {
    color: Colors.white,
    fontSize: 16,
  },
})
