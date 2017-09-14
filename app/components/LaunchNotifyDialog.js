import React,{Component} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform
} from 'react-native';
import * as common from '../utils/CommonUtils';
import Colors from '../constants/Colors';
import * as Images from '../images/characterTest/main';
import * as imgs from '../images/';
import EvaluatePage from '../pages/characterTest/EvaluatePage';
import ActivityListPage from '../pages/activity/ActivityListPage';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const MODAL_TYPE_GUIDE = 'MODAL_TYPE_GUIDE';
const MODAL_TYPE_EVALUATE = 'MODAL_TYPE_EVALUATE';
const MODAL_TYPE_ACTIVITY = 'MODAL_TYPE_ACTIVITY';

var modalTypeFirstArr = [
  // MODAL_TYPE_EVALUATE,
  MODAL_TYPE_ACTIVITY,
];

var modalTypeCommonArr = [
  MODAL_TYPE_ACTIVITY,
];

export default class LaunchNotifyDialog extends Component{
	constructor(props) {
		super(props);
		this.state = {
      modalVisible: true,
      modalType: '',
    };
    this.modalTypeArr = [];
	}

  componentDidMount(){
    global.storage.load({
      key: 'isFirstLogin',
    }).then((ret)=>{
      //深拷贝
      this.modalTypeArr = modalTypeCommonArr.concat();
      this.onNextModal();
    }).catch((err)=>{
      //深拷贝
      this.modalTypeArr = modalTypeFirstArr.concat();
      this.onNextModal();
    })
    global.storage.save({
      key: 'isFirstLogin',  //注意:请不要在key中使用_下划线符号!
      data: false,
    });
  }

  setModalVisible(visible, func) {
    this.setState({
      modalVisible: visible
    }, ()=>{
      if(func)
        func()
    });
  }

  onNextModal() {
    if(this.modalTypeArr.length > 0) {
      if(!this.state.modalVisible)
        this.setModalVisible(true)
      this.onSkipModal();
    } else {
      this.onCloseModal();
    }
  }

  onSkipModal() {
    let type = this.modalTypeArr.shift();
    this.setState({
      modalType: type
    });
  }

  onCloseModal() {
    this.setModalVisible(false)
  }

  //性格测试弹框
  renderEvaluateModal() {

    return (
      <View style={{
        width: deviceWidth,
        height: deviceHeight,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 / 667 * deviceHeight}}>
          <View/>
          <Image source={Images.logo} style={{marginTop: 15 / 667 * deviceHeight,}}/>
          <TouchableOpacity style={styles.modalSkipBtn} onPress={()=>this.onNextModal()}>
            <Text style={{color: Colors.white, fontSize: 14}}>跳过</Text>
          </TouchableOpacity>
        </View>

        <View style={{
          alignSelf: 'center',
          alignItems: 'center',
          backgroundColor: Colors.white,
          borderRadius: 5,
          height: 520 / 667 * deviceHeight,
          marginTop: 20 / 667 * deviceHeight,
          width: deviceWidth - 40 / 375 * deviceWidth
        }}>

          <Image source = {Images.modalBg} style={{marginVertical: 20 / 667 * deviceHeight, width: 301 / 375 * deviceWidth, height: 186 / 667 * deviceHeight}} />
          <Text style={styles.modalText}>性冷淡北欧风？还是高逼格新中式？</Text>
          <Text style={styles.modalText}>精致派新古典？还是艺术感后现代？{'\n'}</Text>
          <Text style={styles.modalText}>也许你真的选不出喜欢哪一种。</Text>
          <Text style={styles.modalText}>但小V比你更懂你，一个品味测评后，</Text>
          <Text style={styles.modalText}>小V会为你解密，替你选择。</Text>

          <TouchableOpacity style={styles.modalButton} onPress={() => this.enterEvaluatePage()}>
            <Text style={{color: Colors.white, fontSize: 20}}>马上开始</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  //活动提醒弹框
  renderActivityModal() {
    let activityTipsContent = this.props.activityTipsContent
    let activityTipsImg = this.props.activityTipsImg ? {uri: this.props.activityTipsImg} : imgs.defaultImg
    return (
      <View style = {styles.modalContainer}>
        <View style={{height: 442 / 667 * deviceHeight, width: 327 / 375 * deviceWidth, backgroundColor: '#E7E8E8', borderRadius: 15, alignItems: 'center'}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: Colors.black, marginTop: 25 / 667 * deviceHeight}}>游戏活动</Text>
          <TouchableOpacity onPress = {() => this.enterActivityPage()}>
            <Image source = {activityTipsImg} style={{height: 186 / 667 * deviceHeight, width: 302 / 375 * deviceWidth,
              marginTop: 15 / 667 * deviceHeight, marginBottom: 22 / 667 * deviceHeight, borderRadius: 10}}/>
          </TouchableOpacity>
          <View>
            <Text style = {{color: Colors.black, lineHeight: 22}}>{activityTipsContent}</Text>
          </View>

        </View>
        <TouchableOpacity onPress = {() => this.onNextModal()}>
          <Image source = {require('../images/main/firstLogin_close.png')} style = {styles.closeIcon}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderModal() {
		if (this.state.modalType == MODAL_TYPE_EVALUATE) {
      return(
        this.renderEvaluateModal()
      )
    } else if (this.state.modalType == MODAL_TYPE_ACTIVITY) {
      return(
        this.renderActivityModal()
      )
    }
  }

	render() {
		return (
			<Modal
				visible = {this.state.modalVisible}
				transparent = {true}
				onRequestClose = {() => {}}
				animationType = {'slide'}>
        {this.renderModal()}
			</Modal>
		)
	}

  enterGuidePage() {
    // this.setModalVisible(false, ()=>{
    //   this.props.navigator.push({
    //     id: 'GuidePage',
    //     component: GuidePage,
    //     onNextModal: this.onNextModal.bind(this)
    //   })
    // });
  }

  enterEvaluatePage() {
    this.setModalVisible(false, ()=>{
      this.props.navigator.push({
        id: 'EvaluatePage',
        component: EvaluatePage,
        onNextModal: this.onNextModal.bind(this)
      })
    });
  }

  enterActivityPage() {
    this.setModalVisible(false, ()=>{
      this.props.navigator.push({
        id: 'ActivityListPage',
        component: ActivityListPage,
        onNextModal: this.onNextModal.bind(this),
        PanoramaUrl: '',
      })
    });
  }
}

const styles = StyleSheet.create({
	modalContainer:{
		backgroundColor: 'rgba(0,0,0,.6)',
		flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
	},
	modalBg:{
		alignSelf: 'center',
		marginTop: 70 / 667 * deviceHeight,
	},
	text:{
		fontSize: 16,
		lineHeight: 30,
		marginTop: 160 / 667 * deviceHeight,
		paddingLeft: 18 / 375 * deviceWidth,
		paddingRight: 18 / 375 * deviceWidth,
	},
	button:{
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: '#F1365C',
		borderRadius: 30,
		height: 45,
		justifyContent: 'center',
		marginTop: 30 / 667 * deviceHeight,
		width: 170 / 375 * deviceWidth,
	},
	buttonText:{
		color: '#fff',
		fontSize: 22,
		fontWeight: 'bold',
	},
	closeIcon:{
		alignSelf: 'center',
		marginTop: 50 / 667 * deviceHeight,
	},
  modalText: {
    alignItems:'center',
    alignSelf:'center',
    color:Colors.black,
    fontSize:14,
    lineHeight: 25,
    justifyContent:'center',
  },
  modalButton:{
    alignItems:'center',
    alignSelf:'center',
    backgroundColor: Colors.mainColor,
    borderRadius: 20,
    marginTop: 30 / 667 * deviceHeight,
    paddingVertical: 10 / 667 * deviceHeight,
    width: 240 / 375 * deviceWidth,
  },
  modalSkipBtn: {
    alignSelf:'flex-end',
    alignItems:'center',
    backgroundColor:'#484B50',
    borderRadius: 22,
    height: 44,
    justifyContent:'center',
    marginRight:10,
    width: 44,
  }
})
