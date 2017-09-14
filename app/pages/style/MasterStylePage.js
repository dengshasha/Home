/*
大师风格-->知名设计师进入-->大师风格页面
*/
import React,{Component} from 'react';
import {
  Image,
  Text,
  View,
  Easing,
  ListView,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import * as common from '../../utils/CommonUtils' ;
import SchemeHandler from '../../utils/SchemeHandler' ;
import {ApiRequest, showErrorAlert} from '../../utils/ApiRequest';
import {ApiMap} from '../../constants/Network';
import Colors from '../../constants/Colors' ;
import NavigationBar from '../../components/NavigationBar' ;
import Toast, {DURATION} from 'react-native-easy-toast';
import NoDataDefaultView from '../../components/NoDataDefaultView'
import * as Images from '../../images/style/main';
import DownloadModal from '../../components/DownloadModal';
import SaveDna from '../design/SaveDna';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

export default class MasterStylePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //数据参数
      data : this.props.data ? this.props.data : [],
      //动画参数
      translateValue : new Animated.ValueXY({x:0, y:0}),
      rotateValue : new Animated.Value(0),
      scaleValue : new Animated.Value(0),
      bgViewTranslateValue : new Animated.ValueXY({x:0, y:0}),
      btnOpacityValue : new Animated.Value(0),
      btnNextScaleValue : new Animated.Value(0),
      btnCollectScaleValue : new Animated.Value(0),
      //可拖拽图片的位置
      top: 0,
      left: 0,
      rotateAngle : '0deg',
    }

    this.index  = 1;//分页index
    this.isCollect = '';
    this.data = [];//存放this.state.data
    this.resDataLength = 0; //存放每一次请求的数据长度，用于判断是否调用加载更多

  }

  componentWillMount() {

    !this.state.data.length && this.getDNAs();

    this._panResponder = PanResponder.create({
      //开始触摸：是否愿意成为响应者
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt,gestureState) => true,
      onMoveShouldSetPanResponder: (evt,gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt,gestureState) => true,

      onPanResponderGrant: (evt,gestureState) => {
        //开始手势操作
        this._top = this.state.top
        this._left = this.state.left
      },
      onPanResponderMove: (evt,gestureState) => {
        //在这里获取到手势移动距离
        this.setState({
          top: this._top + gestureState.dy,
          left: this._left + gestureState.dx
        })
        if(gestureState.dx < -10) {
          this.btnAnimation('false')
        } else if(gestureState.dx > 10) {
          this.btnAnimation('true')
        }

        //背后视图跟随手势动画
        if(gestureState.dx > 0 && gestureState.dy > 0) {
          Animated.timing(
            this.state.bgViewTranslateValue,
            {
              toValue : {x: -10, y: -10},
              duration : 700,
              easing : Easing.linear,
            }
          ).start()
        }
        if(gestureState.dx > 0 && gestureState.dy < 0) {
          Animated.timing(
            this.state.bgViewTranslateValue,
            {
              toValue : {x: -10, y: 10},
              duration : 700,
              easing : Easing.linear,
            }
          ).start()
        }
        if(gestureState.dx < 0 && gestureState.dy > 0) {
          Animated.timing(
            this.state.bgViewTranslateValue,
            {
              toValue : {x: 10, y: -10},
              duration : 700,
              easing : Easing.linear,
            }
          ).start()
        }
        if(gestureState.dx < 0 && gestureState.dy < 0) {
          Animated.timing(
            this.state.bgViewTranslateValue,
            {
              toValue : {x: 10, y: 10},
              duration : 700,
              easing : Easing.linear,
            }
          ).start()
        }
      },
      onPanResponderTerminationRequest: (evt,gestureState) => true,
      onPanResponderRelease: (evt,gestureState) => {
        //用户放开了触摸点，手势完成

        this.state.btnOpacityValue.setValue(0)
        this.state.bgViewTranslateValue.setValue({x:0, y:0})
        //手势往左边移动到一定距离，加载下一条数据
        if(this.state.left < -80) {
          this.gestureLoadNextDNA()
        }
        //手势往右边移动到一定距离，收藏并加载下一条数据
        else if (this.state.left > 80) {
          this.gestureCollectDNA()

        } else{
          //手势移动距离不够，将视图返回原点
          this.isCollect = '';
          this.setState({
            top:0,
            left:0,
          })
        }
        //没有新的数据时，无论用户移动了多远，将视图返回原点
        if(this.data.length == 1) {
          this.setState({
            top:0,
            left:0,
          })
        }
      }
    })
  }

  componentDidMount() {

  }

  getDNAs() {
    let apiRequest = new ApiRequest();
    apiRequest.request(ApiMap.getDnas,{index:this.index },null,this.getDNAsCallback.bind(this))
  }

  getDNAsCallback(status,response) {
    if(status) {

      if(response.data && response.data.length !== 0) {
        this.resDataLength = response.data.length;
        this.data = [...response.data,...this.data];
        this.setState({data:this.data});
      }
    }
  }

  renderBackView() {
    let nextDnaData = this.data[1]
    let nextImages = {uri: nextDnaData.images}
    let nextName = nextDnaData.name;

    return(
      /*背后视图*/
      <Animated.View
        {...this._panResponder.panHandlers}
        style={{
          borderWidth:1,
          borderColor:Colors.veryLightGrey,
          borderRadius:3,
          backgroundColor:Colors.white,
          height:470 / 667 * deviceHeight,
          marginHorizontal: 11 / 375 * deviceWidth,
          position:'absolute',
          transform : [
            {translateX:this.state.bgViewTranslateValue.x},
            {translateY: this.state.bgViewTranslateValue.y},
            {scale : this.state.scaleValue},
          ],

      }}>

        <Image source = {nextImages}
          style={{height: 385 / 667 * deviceHeight,width: deviceWidth - 23 / 375 * deviceWidth,borderTopLeftRadius:3,borderTopRightRadius:3,}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:15 / 667 * deviceHeight,paddingHorizontal:10 / 375 * deviceWidth}}>
            <Image source={require('../../images/style/master_icon_yes.png')} style={{opacity:0}}/>
            <Image source={require('../../images/style/master_icon_no.png')} style={{opacity:0}}/>
          </View>
        </Image>
        <View style={{height:85 / 667 * deviceHeight,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:15 / 375 * deviceWidth,}}>
          <View>
            <Text style={{fontSize:18,color:Colors.black}}>{nextName}</Text>
          </View>

        </View>
      </Animated.View>
    )
  }

  renderDNA() {
    let dnaData = this.data[0];

    let images = {uri: dnaData.images}
    let name = dnaData.name;
    let id = dnaData.id;

     return(
        <View style={{flex:1,marginTop: 14 / 667 * deviceHeight}}>

          <Animated.View style={[styles.bgStyle,{width:332 / 375 * deviceWidth,height:480 / 667 * deviceHeight,
            transform : [
              {scale : this.state.scaleValue},
            ],}]}/>
          <Animated.View style={[styles.bgStyle,{width:338 / 375 * deviceWidth,height:475 / 667 * deviceHeight,
            transform : [
              {scale : this.state.scaleValue},
            ],}]}/>

          {/*当数据至少有两条时，才render背后视图*/}
          {this.data.length > 1 && this.renderBackView()}

          {/*前视图*/}
          <Animated.View
            {...this._panResponder.panHandlers}
            style={{
            borderWidth:1,
            borderColor:Colors.veryLightGrey,
            borderRadius:3,
            backgroundColor:Colors.white,
            height:470 / 667 * deviceHeight,
            left:this.state.left,
            marginHorizontal: 11 / 375 * deviceWidth,
            top: this.state.top,
            transform : [
              {translateX : this.state.translateValue.x},
              {translateY : this.state.translateValue.y},
              {rotate : this.state.rotateValue.interpolate({
                inputRange: [0,1],
                outputRange: ['0deg',this.state.rotateAngle]
              })},
            ],

          }}>

            <Image source = {images}
              style={{height: 385 / 667 * deviceHeight,width: deviceWidth - 22 / 375 * deviceWidth,borderTopLeftRadius:3,borderTopRightRadius:3,}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:15 / 667 * deviceHeight,paddingHorizontal:10 / 375 * deviceWidth}}>
                <Animated.Image source={require('../../images/style/master_icon_yes.png')}
                  style={{
                    opacity:this.isCollect === 'true' ? this.state.btnOpacityValue : 0,

                  }}/>
                <Animated.Image source={require('../../images/style/master_icon_no.png')}
                  style={{
                    opacity:this.isCollect === 'false' ? this.state.btnOpacityValue : 0,

                  }}/>
              </View>

            </Image>
            <View style={{height:85 / 667 * deviceHeight,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:15 / 375 * deviceWidth}}>
              <View>
                <Text style={{fontSize:18,color:Colors.black}}>{name}</Text>
                <View style={{borderWidth:1,borderColor:Colors.mainColor,borderRadius: 3,width: 40 / 375 * deviceWidth,alignItems:'center',marginTop:5 / 667 * deviceHeight}}>
                  <Text style={{color:Colors.mainColor,fontSize:12}}>现代</Text>
                </View>
              </View>

              <Text style={{color:Colors.black}}>使用数：<Text style={{color:Colors.mainColor}}>121</Text></Text>
            </View>
          </Animated.View>

          <View style={{flexDirection:'row',justifyContent:'center',marginTop:20 / 667 * deviceHeight}}>
            <TouchableOpacity onPress = {() => this.loadNextDNA()}>
              <Image source={require('../../images/style/master_icon_next_bg.png')} style={{justifyContent:'center',alignItems:'center'}}>
                <Image source={require('../../images/style/master_icon_next.png')}/>
              </Image>
            </TouchableOpacity>
            <TouchableOpacity style={{paddingLeft: 60 / 375 * deviceWidth}} onPress={() => this.showDownloadAlert()}>
              <Image source={Images.download_big_red} />
            </TouchableOpacity>
          </View>
        </View>
    )
  }

  renderDefaultView() {
    return(
      <NoDataDefaultView />
    )
  }

  render(){
    return(
      <View style={{flex:1,backgroundColor:Colors.mainBgColor}}>
        <NavigationBar title={'大师风格'}
          navigator = {this.props.navigator}
          titleColor={Colors.black}
          leftButtonIcon = {require('../../images/common/icon_back_black.png')}
          onLeftButtonPress = {this.onLeftBack.bind(this)}
          logoIcon = {require('../../images/common/logo_black.png')}
          verticalLineColor = {Colors.logoGray}
          rightButtonIcon1 = {require('../../images/common/icon_customer_black.png')}/>

          {this.data.length ? this.renderDNA() : this.renderDefaultView()}

        <Toast ref="toast"/>
        {this.state.showDownloadAlert && <DownloadModal onClick={(download)=>this.modalButtonOnClick(download)}/>}
      </View>
    )
  }

  //按钮加载下一条dna
  loadNextDNA() {
    this.state.btnNextScaleValue.setValue(1.2);
    Animated.spring(
      this.state.btnNextScaleValue,
      {
        toValue : 1,
        friction: 3,
      }
    ).start();

    this.isCollect = 'false';//显示哪一个图标
    this.setState({rotateAngle : '-45deg'});//旋转角度
    let length = this.data.length;
    if(length > 1) {

      this.animation(0,0,-600,10,() => {
        this.state.translateValue.setValue({x:0, y:0});
        this.state.rotateValue.setValue(0);
        this.data.shift();
        this.isCollect = '';
        this.setState({data: this.data});
      });

    } else {
      this.refs.toast.show('已经到底啦！');
    }

    if(length < 3) {
      this.onLoadMore()
    }
  }
  showDownloadAlert( ){
    this.setState({showDownloadAlert: true});
  }

  modalButtonOnClick(download){
    this.setState({showDownloadAlert: !this.state.showDownloadAlert});
    if (download) {
      this.props.navigator.push({id: 'SaveDna', component: SaveDna, params: {selectedDNA: this.data[0]}})
    }
  }

  collectDNA(id) {
    // this.state.btnCollectScaleValue.setValue(1.2);
    // Animated.spring(
    //   this.state.btnCollectScaleValue,
    //   {
    //     toValue : 1,
    //     friction: 3,
    //   }
    // ).start();
    //
    // let apiRequest = new ApiRequest();
    // apiRequest.request(ApiMap.collectDna, {collectId:id}, null, (status, resData) => {
    //   if (status) {
    //     // 动画
    //     this.isCollect = 'true';
    //     this.setState({rotateAngle : '45deg'});//旋转角度
    //     let length = this.data.length;
    //     if(length > 1) {
    //       this.animation(0,0,600,10,() => {
    //         this.state.translateValue.setValue({x:0, y:0});
    //         this.state.rotateValue.setValue(0);
    //         this.data.shift();
    //         this.isCollect = '';
    //         this.setState({data: this.data});
    //       });
    //     } else {
    //       this.refs.toast.show('已经到底啦！');
    //     }
    //
    //     if(this.state.dataIndex > length - 3) {
    //       this.onLoadMore()
    //     }
    //   } else{
    //     showErrorAlert(resData)
    //   }
    // })
  }

  //手势加载下一条dna
  gestureLoadNextDNA() {

    let length = this.data.length;

    if(length > 1) {
      this.data.shift();
      let left = this.state.left;
      let top = this.state.top;
      this.animation(left,top,-520, 10,() => {
        this.state.translateValue.setValue({x:0, y:0});
        this.state.rotateValue.setValue(0);
        this.isCollect = '';
        this.setState({
          left:0,
          top:0,
        })
      });

    } else {
      this.refs.toast.show('已经到底啦！');
    }

    if(length < 3) {
      this.onLoadMore()
    }

  }

  gestureCollectDNA() {
    let id = this.data[0].id;
    let apiRequest = new ApiRequest();
    apiRequest.request(ApiMap.collectDna, {collectId:id}, null, (status, resData) => {
      if (status) {
        let length = this.data.length;

        if(length > 1) {
          this.data.shift();
          let left = this.state.left;
          let top = this.state.top;
          this.animation(left,top,520, 10,() => {
            this.state.translateValue.setValue({x:0, y:0});
            this.state.rotateValue.setValue(0);
            this.isCollect = '';
            this.setState({
              left:0,
              top:0,
            })
          });

        } else {
          this.refs.toast.show('已经到底啦！');
        }

        if(length < 3) {
          this.onLoadMore()
        }
      }
    })
  }

  //拖拽图片时图片上出现的按钮动画
  btnAnimation(isCollect) {
    this.isCollect = isCollect;//显示哪一个图标
    _btnAnimateHandler = Animated.timing(
      this.state.btnOpacityValue,
      {
        toValue : 1,
        duration : 1000,
        easing : Easing.linear,
      }
    ).start()
  }



  animation(initialTranslateX,initialTranslateY,translateX,translateY,animateCallback) {
    this.state.btnOpacityValue.setValue(1),
    this.state.translateValue.setValue({x:initialTranslateX, y:initialTranslateY});
    this.state.rotateValue.setValue(0);
    this.state.scaleValue.setValue(0.9);


    Animated.parallel([
      Animated.timing(
        this.state.rotateValue,
        {
          toValue : 1,
          duration : 500,
          easing : Easing.linear,
        }
      ),
      Animated.timing(
        this.state.translateValue,
        {
          toValue : {x:translateX ,y:translateY},
          duration : 700,
          easing : Easing.linear,
        }
      ),
      Animated.timing(
        this.state.scaleValue,
        {
          toValue : 1,
          duration : 300,
        }
      )
    ]).start(animateCallback)
  }

  onLoadMore() {
    if(this.resDataLength % 20 === 0 && this.resDataLength !== 0) {
      this.index ++;
      this.getDNAs();
    }
  }


  onLeftBack() {
    this.props.navigator.pop();
  }
}

const styles = StyleSheet.create({
  bgStyle:{
    alignSelf:'center',
    borderWidth:1,
    borderColor:Colors.veryLightGrey,
    borderRadius:3,
    backgroundColor:Colors.white,
    position:'absolute',
    top:0,
  },
})
