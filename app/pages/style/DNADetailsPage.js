import React,{Component} from 'react';
import {
  Image,
  Text,
  View,
  ListView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as common from '../../utils/CommonUtils' ;
import SchemeHandler from '../../utils/SchemeHandler' ;
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import Colors from '../../constants/Colors' ;
import NavigationBar from '../../components/NavigationBar' ;
// import DesignerPage from './DesignerPage';
import Toast, {DURATION} from 'react-native-easy-toast';
import MasterStylePage from './MasterStylePage';
import * as Images from '../../images/style/main';
import DownloadModal from '../../components/DownloadModal';
import SaveDna from '../design/SaveDna';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

export default class DNADetailsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DNADetailsData : this.props.route.DNADetailsData,//存放从大师风格点击跳转过来的一条数据
    }

    this.allData = this.props.route.allData;//存放从大师风格页传过来的所有数据
    this.restData = [];//存放this.allData从当前数据到结束的数据
  }
  render() {
    return(
      <View style={{flex:1}}>
        <NavigationBar title={'James大师-现代001'}
          navigator = {this.props.navigator}
          titleColor={Colors.black}
          leftButtonIcon = {require('../../images/common/icon_back_black.png')}
          onLeftButtonPress = {this.onLeftBack.bind(this)}
          logoIcon = {require('../../images/common/logo_black.png')}
          verticalLineColor = {Colors.logoGray}/>

        <View style={{height:490 / 667 * deviceHeight,backgroundColor:Colors.white,marginHorizontal:10 / 375 * deviceWidth,marginTop:15 / 667 * deviceHeight,borderRadius:5}}>
          <Image source={{uri:this.state.DNADetailsData.images + '?imageView2/0/w/' + deviceWidth*2}}
            style={{width:deviceWidth - 20 / 375 * deviceWidth,height:406 / 667 * deviceHeight,borderTopLeftRadius:5,borderTopRightRadius:5,}}/>
          <View style={{flexDirection:'row',height:65 / 667 * deviceHeight,justifyContent:'space-between',alignItems:'center',paddingHorizontal:10 / 375 * deviceWidth}}>
            <View style={{borderWidth:1,borderColor:Colors.mainColor,borderRadius: 3, padding:3,alignSelf: 'center'}}>
              <Text style={{color:Colors.mainColor,fontSize:12}}>{this.state.DNADetailsData.name}</Text>
            </View>
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity style={{marginRight: 25 / 375 * deviceWidth}} onPress = {() => this.loadNextDNA()}>
                <Image source={require('../../images/style/details_icon_next.png')} />
              </TouchableOpacity>
              <TouchableOpacity onPress = {()=> this.showDownloadAlert() }>
                <Image source={ Images.download_red}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
{/*
        <View style={{
          alignItems:'center',
          backgroundColor:Colors.white,
          flexDirection:'row',
          height: 85 / 667 * deviceHeight,
          justifyContent:'space-between',
          marginHorizontal:10 / 375 * deviceWidth,
          marginTop:5 / 667 * deviceHeight,
          paddingHorizontal:13 / 375 * deviceWidth,
        }}>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity onPress = {this.enterDesignerPage.bind(this)}>
              <Image source = {require('../../images/style/avatar.png')} style={{width:50 / 375 * deviceWidth,height:50 / 375 * deviceWidth}}/>
            </TouchableOpacity>
            <View style={{paddingLeft:13 / 375 * deviceWidth}}>
              <TouchableOpacity onPress = {this.enterDesignerPage.bind(this)}>
                <Text style={{fontSize:16,color:Colors.black}}>Juno Kim</Text>
              </TouchableOpacity>

              <Text style={{fontSize:12,marginTop: 5 / 667 * deviceHeight}}>作品数：76</Text>
            </View>
          </View>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={[styles.buttons,{borderWidth:1,borderColor:Colors.logoGray}]}>
              <Text style={{fontSize:12}}>已关注</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttons,{backgroundColor:Colors.mainColor,marginLeft:14 / 375 * deviceWidth}]}>
              <Text style={{color:Colors.white,fontSize:12}}>联系TA</Text>
            </TouchableOpacity>
          </View>
        </View>*/}
        <Toast ref={(toast) => { this.toast = toast }} />
        {this.state.showDownloadAlert && <DownloadModal onClick={(download)=>this.modalButtonOnClick(download)}/>}
      </View>
    )
  }

  showDownloadAlert( ){
    this.setState({showDownloadAlert: true});
  }

  modalButtonOnClick(download){
    this.setState({showDownloadAlert: !this.state.showDownloadAlert});
    if (download) {
      this.props.navigator.push({id: 'SaveDna', component: SaveDna, params: {selectedDNA: this.state.DNADetailsData}})
    }
  }
  onLeftBack() {
    this.props.navigator.pop();
  }

  enterDesignerPage() {
    // this.props.navigator.push({id:'DesignerPage',component:DesignerPage});
  }

  loadNextDNA() {

    this.allData.map((dataItem,index) => {
      if(this.state.DNADetailsData.id === dataItem.id) {
        this.restData = this.allData.slice(index+1)
      }
    })

    if(this.restData.length !== 0) {
      this.setState({DNADetailsData:this.restData[0]})
    } else {
      this.toast.show('已经到底啦！');
    }
  }
}

const styles = StyleSheet.create({
  buttons:{
    alignItems:'center',
    borderRadius:2,
    height:24 / 667 * deviceHeight,
    justifyContent:'center',
    width:61 / 375 * deviceWidth,
  }
})
