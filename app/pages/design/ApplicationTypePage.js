import React,{Component} from 'react';
import {
  Image,
  Text,
  Modal,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import UploadToQiniu from '../../utils/UploadToQiniu';
import * as common from '../../utils/CommonUtils' ;
import LayoutTaskHandler from '../../utils/LayoutTaskHandler' ;
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import Colors from '../../constants/Colors' ;
import NavigationBar from '../../components/NavigationBar' ;
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import Toast from 'react-native-easy-toast';
import TaskRecords from './TaskRecords';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const addLayoutImg = require('../../images/design/application/icon_add_red.png');
const addAreaImg = require('../../images/design/application/icon_add_gray.png');

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
        onRequestClose = {() => console.log('you close modal')}
        transparent = {true}
        animationType = {'slide'}>
        <View style = {{
          width: deviceWidth,
          height: deviceHeight,
          backgroundColor:'rgba(0,0,0,.8)',}}>
          <View style={{
            alignSelf:'center',
            alignItems:'center',
            backgroundColor:Colors.white,
            borderRadius: 10,
            height: 460 / 667 * deviceHeight,
            marginTop : 50 / 667 * deviceHeight,
            paddingHorizontal : 15 / 375 * deviceWidth,
            width: deviceWidth - 40 / 375 * deviceWidth
          }}>
            <Image source = {require('../../images/design/application/icon_dialog.png')}  style = {{alignSelf:'center',marginTop: 30 / 667 * deviceHeight}}/>

            <Text style={styles.modalText}>
              &nbsp;&nbsp;我们将根据您上传的户型资料，帮您制作3D模型图，您可以通过玩家生活APP，来设计您的家，更换您喜欢的风格和物品。
            </Text>
            <TouchableOpacity style = {styles.modalButton} onPress = {() => this.setState({modalVisible:!this.state.modalVisible})}>
              <Text style = {styles.modalButtonText}>开始上传</Text>
            </TouchableOpacity>
          </View>

        </View>

      </Modal>

    )
  }
}

export default class ApplicationTypePage extends Component{
  constructor(props) {
    super(props);
    this.state = {
      layoutImgSource : '',
      areaImgSource : {}
    }
  }

  selectLayoutImageCallback(response) {

    if(response.didCancel) {
      console.log('user cancelled photo picker');
    } else if(response.error) {
      console.log('ImagePicker error:', response.error);
    } else if(response.customButton) {
      console.log('user tapped customButton:', response.customButton);
    } else {
      //将response的结果，调用请求上传到七牛
      Image.getSize(response.uri,(width,height) => {
        if(width < 500 || height < 500) {
          alert('图片尺寸小于500x500，请重新选择！')
        } else {
          this.setState({'layoutImgSource': response.uri})
        }
      })
    }
  }

  selectLayoutImage() {
    const options = {
      title:'上传户型',
      takePhotoButtonTitle:'拍摄',
      chooseFromLibraryButtonTitle:'从相册选择',
      cancelButtonTitle:'取消',
      quality: 1,
      allowsEditing:true,
    };
    ImagePicker.showImagePicker(options, response => this.selectLayoutImageCallback(response))
  }

  selectAreaImageCallback(response,area){
    if(response.didCancel) {
      console.log('user cancelled photo picker');
    } else if(response.error) {
      console.log('ImagePicker error:',response.error);
    } else if(response.customButton) {
      console.log('user tapped customButton:',response.customButton);
    } else {
      switch(area) {
        case 'parlor' :
          let parlorImgSource =  {...this.state.areaImgSource, 'parlorImgSource':response.uri}
          this.setState({areaImgSource:parlorImgSource })

          break;
        case 'bedroom' :
          this.setState({areaImgSource : Object.assign(this.state.areaImgSource,{'bedroomImgSource':response.uri}) })

          break;
        case 'restaurant' :
          this.setState({areaImgSource : Object.assign(this.state.areaImgSource,{'restaurantImgSource':response.uri}) })
          //this.setState({...this.state.areaImgSource, 'restaurantImgSource':response.uri} )

          break;
        default :
          return false
      }
    }
  }

  selectAreaImage(area) {
    const options = {
      title:'上传客厅',
      takePhotoButtonTitle:'拍摄',
      chooseFromLibraryButtonTitle:'从相册选择',
      cancelButtonTitle:'取消',
      quality: 1,
      allowsEditing:true,
    };
    ImagePicker.showImagePicker(options, response => this.selectAreaImageCallback(response,area))
  }

  uploadAllImage() {
    let layoutImgFile = {uri: this.state.layoutImgSource, type: 'multipart/form-data'};
    if (layoutImgFile.uri){
      this.uploadLayoutImage(layoutImgFile);
    }
  }

  uploadLayoutImage(layoutImgFile) {
      this.setState({ isFetching: true, fetchingText: '户型图上传中' });
      UploadToQiniu.uploadLayoutImage(layoutImgFile, (status, res) => {
      this.setState({ isFetching: false })
      if (status && res.storageKey) {
        this.setState({ isFetching: false });
        //提交任务操作
        let layout = 'http://upload.s.vidahouse.com/'+ res.storageKey;

        this.layoutImg = {layout};
        this.layout = { name: "testLayout" }
        this.uploadAreasImage()

      }else{
        this.setState({ isFetching: false });
        this.refs.toast.show('户型图上传失败');
      }
    })
  }

  uploadAreasImage(){
    let areaImgTmp = Object.values(this.state.areaImgSource);
    let index = 0;
    this.areaImage = [];
    (areaImgTmp.length != 0) && areaImgTmp.map((element)=>{
      // if(element) {
        this.setState({ isFetching: true, fetchingText: '区域图上传中' });
        let item = {uri: element, type: 'multipart/form-data'}
        UploadToQiniu.uploadLayoutImage(item, (status, res) => {
          index++ ;
          if (status && res.storageKey) {
            this.areaImage.push('http://upload.s.vidahouse.com/'+ res.storageKey)
            console.log('上传成功')
          }else{
            console.log('上传区域失败')
          }
          if (index == areaImgTmp.length) {
            this.newLayoutTask()
          }
        })
      // }
    })
    if (!areaImgTmp.length) {
      this.newLayoutTask()
    }
  }

  newLayoutTask(){

    this.layoutImg.refers = this.areaImage
    this.layout.images= JSON.stringify(this.layoutImg );

    let apiRequest = new ApiRequest();
    this.setState({ isFetching: true, fetchingText: '户型图上传中' });
    apiRequest.request(ApiMap.newLayout, null, this.layout, (status, res)=>{
      this.setState({ isFetching: false })
      if (status) {
        let Layout = { ...this.layout, id: res.newId , name: 'mylayout'}
        LayoutTaskHandler.postLayoutTask(Layout);
        this.refs.toast.show('户型上传成功');
        Alert.alert('提交成功 请耐心等待…','完成户型建模预计等待24小时，户型提交问题请联系客服',[{text: '取消', onPress: ()=>{}},{text:'确定', onPress:()=>{
          this.props.navigator.push({id: 'TaskRecords', component: TaskRecords})

        }}])

        // this.props.navigator.pop()
      }else{
        this.refs.toast.show('户型上传失败');
      }
    });
  }

  render() {

    return(
      <View style={{flex:1}}>
        <NavigationBar title={'提交户型图'}
          navigator = {this.props.navigator}
          titleColor = {Colors.black}
          leftButtonIcon = {require('../../images/common/icon_back_black.png')}
          onLeftButtonPress = {this.onLeftBack.bind(this)}
          logoIcon = {require('../../images/common/logo_black.png')}
          verticalLineColor = {Colors.logoGray}
          rightButtonIcon1={require('../../images/common/icon_customer_black.png')}/>
        <View style={{flex:1}}>
          <Text style={styles.addText}>添加户型图（必填）</Text>
          <View style={{height:155 / 667 * deviceHeight,backgroundColor:Colors.white,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
            <TouchableOpacity onPress={() => this.selectLayoutImage()}>
              <Image
                source={this.state.layoutImgSource ? {uri: this.state.layoutImgSource} : addLayoutImg}
                style={{width:105 / 375 * deviceWidth,height:95 / 667 * deviceHeight}} resizeMode = {'contain'}/>
            </TouchableOpacity>

            <View style={{paddingLeft:15 / 375 * deviceWidth}}>
              <Text>1.图片尺寸不能小于500x500</Text>
              <Text style={{marginTop:20 / 667 * deviceHeight}}>2.平面图需垂直拍摄</Text>
            </View>
          </View>
          <Text style={styles.addText}>添加房间实景图片（选填）</Text>
          <View style={{height:328 / 667 * deviceHeight,backgroundColor:Colors.white}}>
            <View style={{height:157 / 667 * deviceHeight,marginHorizontal:10 / 375 * deviceWidth,borderBottomWidth:1,borderBottomColor:Colors.veryLightGrey}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',height:45 / 667 * deviceHeight,alignItems:'center'}}>
                <Text style={{color:Colors.black}}>示例照片</Text>
                <Text>请参考示例图片进行上传</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Image source={require('../../images/design/application/sample_img1.png')}/>
                <Image source={require('../../images/design/application/sample_img2.png')}/>
                <Image source={require('../../images/design/application/sample_img3.png')}/>
              </View>
            </View>
            <View style={{height:171 / 667 * deviceHeight,marginHorizontal:10 / 375 * deviceWidth,}}>
              <TouchableOpacity style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center',
                backgroundColor:Colors.mainColor,
                height:25,
                width:80 / 375 * deviceWidth,
                borderRadius:3,
                marginVertical:10 / 667 * deviceHeight}}>
                <Image source={require('../../images/design/application/icon_add_white.png')}/>
                <Text style={{color:Colors.white,paddingLeft:5,fontSize:12}}>新增区域</Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <TouchableOpacity onPress={() => this.selectAreaImage('parlor')}>
                  <Image style={styles.addAreaImg} resizeMode = {'contain'}
                    source={this.state.areaImgSource.parlorImgSource ? {uri:this.state.areaImgSource.parlorImgSource} : addAreaImg}>
                    <Text style={styles.addAreaImgText}>客厅1</Text>
                  </Image>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectAreaImage('bedroom')}>
                  <Image style={styles.addAreaImg} resizeMode = {'contain'}
                    source={this.state.areaImgSource.bedroomImgSource ? {uri:this.state.areaImgSource.bedroomImgSource} : addAreaImg}>
                    <Text style={styles.addAreaImgText}>卧室1</Text>
                  </Image>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectAreaImage('restaurant')}>
                  <Image style={styles.addAreaImg} resizeMode = {'contain'}
                    source={this.state.areaImgSource.restaurantImgSource ? {uri:this.state.areaImgSource.restaurantImgSource} : addAreaImg}>
                    <Text style={styles.addAreaImgText}>餐厅1</Text>
                  </Image>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress = {() => this.uploadAllImage()}
            style={{position:'absolute',bottom:0,width:deviceWidth,height:45 / 667 * deviceHeight,backgroundColor:Colors.mainColor,justifyContent:'center',alignItems:'center'}}>
            <Text style={{color:Colors.white,fontSize:18}}>提交建模</Text>
          </TouchableOpacity>
        </View>
        <Toast ref="toast"/>
        <ModalView />
        <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
      </View>
    )
  }

  onLeftBack() {
    this.props.navigator.pop();
  }
}

const styles = StyleSheet.create({
  modalText: {
    color:Colors.black,
    lineHeight: 30,
  },
  modalButton:{
    alignItems:'center',
    alignSelf:'center',
    backgroundColor:'#F1365C',
    borderRadius:30,
    height:40,
    justifyContent:'center',
    marginTop: 30 / 667 * deviceHeight,
    width:200 / 375 * deviceWidth,
  },
  modalButtonText:{
    color:'#fff',
    fontSize:18,
  },
  addText:{
    color:Colors.black,
    paddingVertical: 12 / 667 * deviceHeight,
    paddingLeft: 10 / 375 * deviceWidth,
  },
  addAreaImg:{
    justifyContent:'flex-end',
    alignItems:'center',
    width: 105 / 375 * deviceWidth,
    height: 90 / 667 * deviceHeight,
  },
  addAreaImgText:{
    color:'#d5d5d5',
    marginBottom:3,
    fontSize:12,
    backgroundColor: 'transparent'
  }

})
