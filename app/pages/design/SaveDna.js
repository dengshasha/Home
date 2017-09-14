import React  from 'react';
import {
    Text,
    Image,
    View,
    TextInput,
    TouchableOpacity,
} from 'react-native';

import SchemeHandler from '../../utils/SchemeHandler';
import Colors from '../../constants/Colors';
import * as common from '../../utils/CommonUtils'
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import Spinner from '../../libs/react-native-loading-spinner-overlay';
import Toast, {DURATION} from 'react-native-easy-toast';
import MyStyleList from '../style/MyStyleList';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

export default class SaveDna extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.defaultDNA = this.props.selectedDNA;
        this.state = {
          dnaName: '玩家达人'
        }

    }

    componentDidMount() {

    }
    componentWillUnmount(){
      this.timer && clearTimeout(this.timer);
    }

    prepareSaveDna(){
      let areaId ;
      let schemeVersionId ;
      let dnaImages ;
      if (this.defaultDNA ) {
        areaId = this.defaultDNA.areaVersionId;
        schemeVersionId = this.defaultDNA.schemeVersionId;
        dnaImages = this.defaultDNA.Images ? this.defaultDNA.Images : this.defaultDNA.images;
        var body = {};
        let dnaName = this.state.dnaName;
        let dnaDescription = '';
        body = {
          name: dnaName,
          images: dnaImages,
          description:  dnaDescription,
          schemeVersionId: schemeVersionId,
          areaVersionId: areaId
        };
        this.saveDna(body)

      }else{
        this.setState({isFetching: true, fetchingText: 'DNA保存中...'})
        let apiRequest = new ApiRequest();
        SchemeHandler.newScheme('tempScheme', SchemeHandler.scheme, (status, responseData)=>{
          if (status) {
            apiRequest.request(ApiMap.getScheme,{version: responseData.newId},null,(status, res)=>{
                if (status) {
                  areaId = res.data.areas[0].id;
                  schemeVersionId = res.data.id;
                  dnaImages = SchemeHandler.getScreenshot(res.data);
                  var body = {};
                  let dnaName = this.state.dnaName;
                  let dnaDescription = '';
                  body = {
                    name: dnaName,
                    images: dnaImages,
                    description:  dnaDescription,
                    schemeVersionId: schemeVersionId,
                    areaVersionId: areaId
                  };
                  this.saveDna(body)
                } else {
                  showErrorAlert(res)
                }
            })
          } else {
            showErrorAlert(res)
          }
        })

      }

    }

    saveDna(body){
      this.setState({ isFetching: true, fetchingText: '风格保存中,请稍候...' });
      let apiRequest = new ApiRequest();
      apiRequest.request(ApiMap.saveDna, null, body, (status, res)=>{
          this.setState({ isFetching: false, fetchingText: '' });
          if (status) {
            this.refs.toast.show('保存成功');
            this.timer = setTimeout(()=>this.props.navigator.replace({id: 'MyStyleList', component: MyStyleList }) ,1000)
          } else {
            this.refs.toast.show('保存失败');
          }
      })
    }

    render() {
      let bgImg;
      if ( this.defaultDNA) {
        bgImg = this.defaultDNA.Images ? this.defaultDNA.Images : this.defaultDNA.images;
      } else {
         bgImg = SchemeHandler.getScreenshot(SchemeHandler.scheme, {height: deviceHeight});
      }
      return (
        <Image source = {{uri: bgImg}} style = {{ flex: 1 }}>
          <View style={{flex:1, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
            <View style={{
              height: 45 / 667 * deviceHeight,
              marginTop: global.IOS_PLATFORM ? 20 : 10,
              alignItems:'center',
              width: deviceWidth,
              justifyContent:'center'}}>
              <TouchableOpacity
                  style={{left: 15, position:'absolute'}}
                  onPress = {()=> this.props.navigator.pop() }>
                <Image source = {require('../../images/common/icon_back_white.png')}/>
              </TouchableOpacity>
              <Text style = {{color: 'white', fontSize: 18, backgroundColor: 'transparent', fontWeight:'bold'}}>风格名称</Text>
            </View>

            <TextInput
                style={{color: Colors.white, width: deviceWidth-40, height: 40, borderWidth: 1, borderColor: 'white', borderRadius: 5, alignSelf: 'center', marginTop: 50 / 667 * deviceHeight, backgroundColor: Colors.lightGrey}}
                placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"
                onChangeText={(text) => this.setState({dnaName: text})} value={this.state.dnaName}/>
            <TouchableOpacity onPress = {()=> this.prepareSaveDna()} style = {{width: deviceWidth-40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.mainColor, backgroundColor: Colors.mainColor, borderRadius: 5, marginTop: 80}}>
              <Text style= {{color: 'white', fontSize: 18, fontWeight: 'bold'}}>保存风格</Text>
            </TouchableOpacity>
          </View>
          <Toast ref="toast"/>
          <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
        </Image>

      )
    }
}
