import React, { Component } from 'react'
import {
    View,
    Image,
    Text,
    Modal,
    Alert,
    Keyboard,
    LayoutAnimation,
    TextInput,
    ListView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native'

import * as common from '../../utils/CommonUtils'
import Colors from '../../constants/Colors'
import NavigationBar from '../../components/NavigationBar'
import { ApiMap, CommunityApiMap } from '../../constants/Network'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import PullToRefreshListView from 'react-native-smart-pull-to-refresh-listview'
import Toast, { DURATION } from 'react-native-easy-toast'
import SmartListViewComponent from '../../components/SmartListViewComponent'

import DesignerPage from '../style/DesignerPage'

const apiRequest = new ApiRequest()
const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

class ReportModal extends Component {
    constructor (props) {
        super(props)
    }

    render () {
        return (
            <Modal animationType={'slide'}
                   transparent={true}
                   visible={this.props.modalVisible}
                   onRequestClose={() => console.log('modal has been closed')}>
                <View style={{
                    justifyContent: 'flex-end',
                    backgroundColor: 'rgba(0,0,0,.6)',
                    width: deviceWidth,
                    height: deviceHeight
                }}>

                    <View style={{paddingBottom: 10 / 667 * deviceHeight}}>
                        {(this.props.commentAutherId == global.userInfo.id) &&
                        <TouchableOpacity style={styles.modalBtn} onPress={() => {
                            Alert.alert('提示', '确认删除该评论', [{text: '取消'}, {
                                text: '删除',
                                onPress: () => this.deleteComment()
                            }])
                        }}>
                            <Text style={[styles.modalBtnText, {color: 'red'}]}>删除</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity style={styles.modalBtn} onPress={() => {
                            Alert.alert('提示', '确认举报该评论', [{text: '取消'}, {
                                text: '举报',
                                onPress: () => this.reportComment()
                            }])
                        }}>
                            <Text style={styles.modalBtnText}>举报</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalBtn} onPress={() => this.props.toggleReportModal(false)}>
                            <Text style={styles.modalBtnText}>取消</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    deleteComment () {
        let params = {
            deleteCommentId: this.props.commentId
        }
        apiRequest.request(CommunityApiMap.deleteComment, params, null, this.onDeleteCommentCallback.bind(this))
        this.props.toggleReportModal(false)
    }

    onDeleteCommentCallback (status, responseData) {
        if (status) {
            //处理请求成功事件
            this.props.deleteCallback()
        } else {
            //处理请求失败事件
            showErrorAlert(responseData)
        }
    }

    reportComment () {
        let params = {
            reportCommentId: this.props.commentId,
            reportReason: '非法评论'
        }
        apiRequest.request(CommunityApiMap.reportComment, params, null, this.onReportCommentCallback.bind(this))
        this.props.toggleReportModal(false)
    }

    onReportCommentCallback (status, responseData) {
        if (status) {
            //处理请求成功事件
            console.log('举报成功')
            //this.props.deleteCallback()
        } else {
            //处理请求失败事件
            showErrorAlert(responseData)
        }
    }
}

export default class CommentPage extends Component {
    constructor (props) {
        super(props)
        let ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => {
                return r1 !== r2
            }
        })
        this._renderRow = this._renderRow.bind(this)
        this.communityIndex = 1
        this.data = []
        this.state = {
            modalVisible: false,
            dataSource: ds.cloneWithRows(this.data),
            commentText: '',
            placeHolder: ' 请输入评论内容',
            keyboardSpace: 0,
            replyCommentId: ''
        }
    }

    componentDidMount () {
      Keyboard.addListener('keyboardWillShow', this.updateKeyboardSpace.bind(this));
      Keyboard.addListener('keyboardWillHide', this.resetKeyboardSpace.bind(this));
        this._pullToRefreshListView.beginRefresh()
    }
    componentWillUnmount() {
      Keyboard.removeAllListeners('keyboardWillShow','keyboardWillHide');
    }
    updateKeyboardSpace(frames) {
      const keyboardSpace = (deviceHeight - frames.endCoordinates.screenY) / 2.0;
      LayoutAnimation.linear();
      this.setState({keyboardSpace: keyboardSpace});
    }

    resetKeyboardSpace() {
      this.setState({keyboardSpace: 0});
    }
    requestComment () {
        let params = {
            worksId: this.props.works_id,
            communityIndex: this.communityIndex,
        }
        apiRequest.request(CommunityApiMap.getWorksCommentList, params, null, this.onRequestCommentCallback.bind(this))
    }

    onRequestCommentCallback (status, responseData) {
        let loadedAll
        if (status) {
            if (responseData.data) {
                this.data = [...this.data, ...responseData.data],
                    this.setState({
                        //dataSource:this.state.dataSource.cloneWithRows(this.data.reverse())
                        dataSource: this.state.dataSource.cloneWithRows(this.data)
                    })
                let length = responseData.data.length
                if (this.communityIndex !== 1) {
                    if (length < 20) {
                        loadedAll = true
                        this._pullToRefreshListView.endLoadMore(loadedAll)
                    } else {
                        loadedAll = false
                        this._pullToRefreshListView.endLoadMore(loadedAll)
                    }
                }
            }
            this._pullToRefreshListView.endRefresh()
            //处理请求成功事件
        } else {
            //处理请求失败事件
            showErrorAlert(responseData)
        }
    }

    _renderRow (rowData, sectionID, rowID) {
        console.log('rowData = ', rowData)
        let currentTime = new Date().getTime() / 1000
        let commetTime = rowData.created_at
        let timeInterval = currentTime - commetTime
        let cellHeight = deviceHeight / 5
        if (rowData.in_reply_to_author !== null) {
            cellHeight = deviceHeight / 3
        }
        return (
            <View style={[styles.listViewItem]}>
                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    height: common.adaptWidth(112),
                    justifyContent: 'space-between',
                    paddingVertical: common.adaptWidth(12),
                }}>
                    <View style={{alignItems: 'center', flexDirection: 'row'}}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigator.push({
                            component: DesignerPage,
                            userId: rowData.author.user_id
                        })}>
                            <Image
                                resizeMode={'cover'}
                                source={rowData.author.avatar_url ? {uri: rowData.author.avatar_url} :  require('../../images/user/mine_icon_head.png')}
                                style={{width: common.adaptWidth(64), height:  common.adaptWidth(64), borderRadius: common.adaptWidth(32)}}/>
                        </TouchableWithoutFeedback>
                        <View style={{paddingLeft: 10 / 375 * deviceWidth}}>
                            <Text style={{color: '#4c70ba'}}>{rowData.author.name}</Text>
                            <Text style={{fontSize: 12}}>{common.getTimeInterval(timeInterval)}</Text>
                        </View>
                    </View>
                    {/*<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>*/}
                        {/*<TouchableOpacity>*/}
                            {/*<Image source={require('../../images/share/comment/icon_like.png')}/>*/}
                        {/*</TouchableOpacity>*/}
                        {/*<TouchableOpacity style={{paddingLeft: 25 / 375 * deviceWidth}} onPress={() => {*/}
                            {/*this.setState({placeHolder: `回复 ${rowData.author.name}:`, replyCommentId: rowData.id})*/}
                            {/*this.refs.textinput.focus()*/}
                        {/*}}>*/}
                            {/*<Image source={require('../../images/share/comment/icon_comment.png')}/>*/}
                        {/*</TouchableOpacity>*/}
                        {/*<TouchableOpacity*/}
                            {/*onPress={() => this.toggleReportModal(true, rowData.author.id, rowData.id, rowID)}*/}
                            {/*style={{paddingLeft: 25 / 375 * deviceWidth}}>*/}
                            {/*<Image source={require('../../images/share/comment/icon_more.png')}/>*/}
                        {/*</TouchableOpacity>*/}
                    {/*</View>*/}
                </View>
                {rowData.in_reply_to_author !== null &&
                <View style={{backgroundColor: Colors.veryLightGrey, margin: common.adaptWidth(8), borderRadius: 2}}>
                    <Text style={{
                        fontSize: 14,
                        color: '#4c70ba',
                        margin: common.adaptWidth(6)
                    }}>{rowData.in_reply_to_author.name}</Text>
                    <Text style={{fontSize: 14, margin:  common.adaptWidth(6)}}>{rowData.in_reply_to_content}</Text>
                </View>
                }
                <View style={{marginBottom:  common.adaptWidth(24)}}>
                    <Text style={{fontSize: 14}}>{rowData.content}</Text>
                </View>
            </View>
        )
    }

    _onRefresh = () => {
        this.communityIndex = 1
        this.data = []
        this.requestComment()
    }

    _onLoadMore = () => {
        if (this.data.length && this.data.length % 20 === 0) {
            this.communityIndex++
            this.requestComment()
        } else {
            this._pullToRefreshListView.endLoadMore(true)
        }
    }

    onLeftBack () {
        this.props.navigator.pop()
    }

    //打开举报窗口
    toggleReportModal (visible, userId, commentId, rowId) {
        this.setState({
            modalVisible: visible,
        })
        if (rowId) {
            this.commentId = commentId
            this.deleteRowId = rowId
            this.commentAutherId = userId
            this.deleteRowId = rowId
        }
    }

    //发送评论
    sendComment () {
        if (this.state.commentText.length > 0) {
            let body = {
                target_id: String(this.props.works_id),
                comment_type: 'Works',
                reply_comment_id: Number(this.state.replyCommentId),
                content: this.state.commentText
            }
            apiRequest.request(CommunityApiMap.addComment, null, body, this.onAddCommentCallback.bind(this))
        }
    }

    onAddCommentCallback (status, responseData) {
        if (status) {
            this.setState({commentText: ''})
            this.communityIndex = 1
            this.data = []
            //this._pullToRefreshListView._scrollView.scrollTo({x: 0, y: 0, animated: true});
            this.requestComment()
            //处理请求成功事件
        } else {
            //处理请求失败事件
            showErrorAlert(responseData)
        }
    }

    commentDeleteCallBack () {
        this.refs.toast.show('删除评论成功')
        this.data = [...this.data]
        this.data.splice(this.deleteRowId, 1)
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.data)
        })
    }

    render () {
        return (
            <View style={{flex: 1, backgroundColor: Colors.mainBgColor}}>

                <PullToRefreshListView
                    showsVerticalScrollIndicator={false}
                    ref={(component) => this._pullToRefreshListView = component}
                    viewType={PullToRefreshListView.constants.viewType.listView}
                    contentContainerStyle={{flexWrap: 'wrap'}}
                    initialListSize={20}
                    enableEmptySections={true}
                    dataSource={this.state.dataSource}
                    pageSize={20}
                    renderRow={this._renderRow.bind(this)}
                    renderHeader={(viewState) => SmartListViewComponent._renderHeader(viewState)}
                    renderFooter={(viewState) => SmartListViewComponent._renderFooter(viewState)}
                    onRefresh={this._onRefresh.bind(this)}
                    onLoadMore={this._onLoadMore.bind(this)}
                    pullUpDistance={35}
                    pullUpStayDistance={50}
                    pullDownDistance={35}
                    pullDownStayDistance={50}
                    style={{marginTop: common.adaptWidth(90), marginBottom: common.adaptWidth(75), flex: 1}}/>

                <View style={[styles.textInputContainer,{bottom: this.state.keyboardSpace*2 }]}>
                    <TextInput
                        ref='textinput'
                        style={styles.textInput}
                        placeholder={this.state.placeHolder}
                        value={this.state.commentText}
                        onBlur={() => {
                            this.setState({
                                placeHolder: ' 请输入评论内容',
                                replyCommentId: Number("")
                            })
                        }}
                        placeholderTextColor={Colors.veryLightGrey}
                        underlineColorAndroid="transparent"
                        maxLength={1000}
                        onChangeText={(text) => this.setState({commentText: text})}/>
                    {
                        this.state.commentText.length === 0 ? (
                            <View style={[styles.buttonSend, {borderColor: '#dcdcdc'}]}>
                                <Text style={{color: '#dcdcdc'}}>发送</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => this.sendComment()}>
                                <View style={styles.buttonSend}>
                                    <Text style={{color: Colors.mainColor}}>发送</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                </View>
                <NavigationBar
                    title={'作品评论'}
                    style={{position: 'absolute', top: 0, left: 0}}
                    navigator={this.props.navigator}
                    titleColor={Colors.black}
                    backgroundColor={Colors.white}
                    leftButtonIcon={require('../../images/common/icon_back_black.png')}
                    onLeftButtonPress={() => this.onLeftBack()}
                    logoIcon={require('../../images/common/logo_black.png')}
                    verticalLineColor={Colors.logoGray}/>
                <ReportModal modalVisible={this.state.modalVisible}
                             toggleReportModal={this.toggleReportModal.bind(this)}
                             commentAutherId={this.commentAutherId} commentId={this.commentId}
                             deleteCallback={this.commentDeleteCallBack.bind(this)}/>
                <Toast ref="toast"/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    modalBtn: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.white,
        borderRadius: 5,
        justifyContent: 'center',
        marginBottom: 10 / 667 * deviceHeight,
        height: 55 / 667 * deviceHeight,
        width: 340 / 375 * deviceWidth,
    },
    modalBtnText: {
        color: '#067DEF',
        fontSize: 18,
    },
    listViewItem: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderColor: Colors.veryLightGrey,
        paddingLeft: 10 / 375 * deviceWidth,
        paddingRight: 20 / 375 * deviceWidth,
        width: deviceWidth,
    },
    textInputContainer: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: Colors.mainBgColor,
        height: 55 / 667 * deviceHeight,
        borderTopWidth: 1,
        borderColor: Colors.veryLightGrey,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: deviceWidth,
    },
    textInput: {
        flex: 1,
        alignSelf: 'center',
        backgroundColor: Colors.white,
        borderColor: Colors.veryLightGrey,
        borderRadius: 3,
        borderWidth: 1,
        color: Colors.black,
        marginLeft: 10,
        height: 40
    },
    buttonSend: {
        borderWidth: 1,
        borderColor: Colors.mainColor,
        borderRadius: 5,
        width: 75 / 375 * deviceWidth,
        height: 38,
        marginHorizontal: 10 / 375 * deviceWidth,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
