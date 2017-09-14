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

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

export default class SaveScheme extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
          schemeName: '玩家达人'
        }

    }

    componentDidMount() {

    }

    saveScheme(){
      this.setState({isFetching: true, fetchingText: '保存方案中...'})

       SchemeHandler.newScheme(this.state.schemeName, SchemeHandler.scheme,()=>{
         this.setState({isFetching: false })
         this.props.navigator.pop()
       } )
    }

    render() {
      let bgImg = SchemeHandler.getScreenshot(SchemeHandler.scheme, {height: deviceHeight})

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
              <Text style = {{color: 'white', fontSize: 18, backgroundColor: 'transparent', fontWeight:'bold'}}>方案名称</Text>
            </View>
           
            <TextInput
                style={{color: Colors.white, width: deviceWidth-40, height: 40, borderWidth: 1, borderColor: 'white', borderRadius: 5, alignSelf: 'center', marginTop: 50 / 667 * deviceHeight, backgroundColor: Colors.lightGrey}}
                placeholderTextColor={Colors.lightWhite} underlineColorAndroid="transparent"
               onChangeText={(text) => this.setState({schemeName: text})} value={this.state.schemeName}/>
            <TouchableOpacity onPress = {()=> this.saveScheme()} style = {{width: deviceWidth-40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.mainColor, backgroundColor: Colors.mainColor, borderRadius: 5, marginTop: 80}}>
              <Text style= {{color: 'white', fontSize: 18, fontWeight: 'bold'}}>保存方案</Text>
            </TouchableOpacity>
          </View>
          
          <Spinner visible={this.state.isFetching} text={this.state.fetchingText}/>
        </Image>
      )
    }

}
