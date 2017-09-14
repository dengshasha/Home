/*
created by melody
用户获得的星星趋势图
*/

import React, { Component } from 'react'
import {
    View,
    Text,
    Image,
    ListView,
    TouchableOpacity
} from 'react-native'
//导航栏组件
import NavigationBar from '../../components/NavigationBar'

//颜色
import Colors from '../../constants/Colors';
//公用图标
import * as Icon from '../../images/'
//活动图标
import * as Images from '../../images/activity/main'
//样式
import styles from '../../styles/starTrend'

import SpeedCanvas from '../../utils/speedCanvas'

import LikeList from '../../components/LikeList'
import ScoreModal from '../../components/ScoreModal'
import {PanoramaSharedModal} from '../../components/Modal'

//网络请求
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import { CommunityApiMap, activityAddress } from '../../constants/Network'

import DesignerPage from '../style/DesignerPage'

const currentTime = new Date().getTime() / 1000 >> 0 //获取当前时间
var apiRequest = new ApiRequest()

export default class StarTrendPage extends Component {
    constructor(props) {
        super(props)
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
        this.state = {
            timeArr: [], //获取时间戳
            monthArr: [], //获取月份时间戳
            countArr: [], //获取所有星星数量
            work: '',
            subStar: 0, //与排行榜首相差的星星数量
			showShareModal: false, //分享彈框
            likePeopleDataSource: ds,
            scoreModalVisible: false,//評分彈框
            likePeople: '',
        }
        this.likePeopleData = []
        this.workId = this.props.route.workId
        this.activity = this.props.route.activity
        this.usersIndex = 1
    }

    componentDidMount() {
        this.getStarCount()
        this.getRanking()
        this.getChampionWork()
        this.getActivityUsersWhoLikeWork()
    }

    //获取该作品在每天得到的星星数量
    getStarCount() {
        apiRequest.request(CommunityApiMap.getActivityWork, {activityWorksId: this.workId}, null, this.getStarCountCallback.bind(this))
    }

    getStarCountCallback(status, response) {
        if (status) {
            let timeArr = []
            let countArr = []

            if (response.data.length > 0) {
                
                let length = response.data.length
                let arrLength = 0
                //判断活动截止时间是否大于当前时间，如果大于当前时间则只显示到当前时间为止的曲线
                //数组的长度即为活动开始时间到当前时间
                if (response.data[length - 1].time > currentTime) {
                    let subTimestamp = currentTime - response.data[0].time
                    //获取当前时间与活动开始时间之间相隔的天数
                    arrLength = Math.ceil(subTimestamp / (24 * 3600))
                    
                } else {
                    //如果活动已经结束，则显示整个活动时间内的星星曲线
                    arrLength = length + 1
                }

                for (let i = 0; i < arrLength + 1; i++) {
                    timeArr.push(response.data[i].time)
                    countArr.unshift(response.data[i].count)
                }
                this.setState({
                    timeArr: timeArr,
                    countArr: countArr,
                })
                this.getMonth()
            }
        }
    }

    //获取该作品的当前排名
    getRanking() {
        apiRequest.request(CommunityApiMap.getActivityWork, {activityWorkId: this.workId}, null, (status, response) => {
            if (status) {
                this.setState({
                    work: response
                })
            } else {
                showErrorAlert(response)
            }
        })
    }

    //获取排行榜第一作品的详情
    getChampionWork() {
        let param = {
            communityIndex: 1,
            worksOfActivityId: this.activity.id
        }
        apiRequest.request(CommunityApiMap.getActivityWorks, param, null, (status, response)=>{
          if(status) {
            if(response.data.length > 0) {
                let myWorkStar = this.state.work ? this.state.work.rating : 0
                this.setState({
                    subStar: response.data[0].rating - myWorkStar
                })
            }
          }
        })
    }
    
    //获取用户评分列表
    getActivityUsersWhoLikeWork(){
        let param = {
            activityRatingId: this.workId, 
            communityIndex: this.usersIndex, 
            order_condition:'createat', 
            order_by: 'desc'
        }
        apiRequest.request(CommunityApiMap.getActivityWorkRateList, param, null, (status, response)=>{
            if (status) {
                this.likePeopleData = [...this.likePeopleData, ...response.data]

                this.setState({
                    likePeopleDataSource: this.state.likePeopleDataSource.cloneWithRows(this.likePeopleData)
                })
            } else { 
                showErrorAlert(response)
            }
        })
    }

    //评分人列表加载更多
    renderMore() {
        if(this.likePeopleData.length % 20 === 0 && this.likePeopleData.length !== 0) {
            this.usersIndex ++
            this.getActivityUsersWhoLikeWork()
        }
    }

    //获取月份
    getMonth() {
        let timeArr = this.state.timeArr;
        let monthArr = [];
        let month = 0;
        for (let i = 0; i < timeArr.length; i++) {
          month = new Date(timeArr[i] * 1000).getMonth() + 1;
          if (monthArr.indexOf(month) == -1) {
            monthArr.push(month)
          }
        }
        this.setState({monthArr: monthArr})
    }
    
    //關閉活動彈框
    closeScoreModal() {
        this.setState({
            scoreModalVisible: false
        })
    }
    
    //打開評分彈框
    openScoreModal(likePeopleData) {
        this.setState({
            scoreModalVisible: true,
            likePeople: likePeopleData
        })
    }

    enterGeneralUserPage(userId) {
        this.setState({
            scoreModalVisible: false
        })
        this.props.navigator.push({id: 'DesignerPage', component: DesignerPage, userId: userId})
    }

    renderTips() {
        let rank = this.state.work ? this.state.work.rank : '暂无'
        if (rank === 1) {
            return(
                <View style = {styles.tipsContainer}>
                    <Text style = {styles.tipsText}>恭喜你成为榜首，请继续努力</Text>
                </View>
            )
        }
        return(
            <View style = {styles.tipsContainer}>
                <Text style = {styles.tipsText}>距离当前排行榜首还差{this.state.subStar}颗星星</Text>
                <Image source = {Images.redStar}/>
            </View>
        )
    }

    render() {
			let imageUrl = activityAddress + "?activity=" + this.activity.id + "&id=" + this.workId;
        return(
            <View style = {styles.allContainer}>
                <NavigationBar
                    title = {''}
                    backgroundColor = {Colors.transparent}
                    navigator = {this.props.navigator}
                    onLeftButtonPress={() => this.props.navigator.pop()}
                    leftButtonIcon={Icon.backWhite}
                    rightButtonIcon1={Icon.customerWhite}
                    logoIcon = {Icon.logoWhite}/>
                <SpeedCanvas
                    countArr = {this.state.countArr}
                    timeArr = {this.state.timeArr}
                />
                <View style = {{flex: 1}}>
                    <View style = {styles.detailsContainer}>
                        <View style = {styles.rankContainer}>
                            <Text style = {styles.number}>{this.state.work ? this.state.work.rank : '暂无'}</Text>
                            <Text style = {styles.rankText}>当前排名</Text>
                        </View>
                        <View style = {styles.verticalLine1}/>
                        <View style = {styles.rankContainer}>
                            <Text style = {styles.number}>{this.state.work ? this.state.work.rating : '暂无'}</Text>
                            <Text style = {styles.rankText}>点亮总数</Text>
                        </View>
                    </View>
                    {this.renderTips()}
                    <Text style = {styles.userListText}>给您点亮过的好友：</Text>
                    
                    <LikeList
                        openModal = {(likePeopleData) => this.openScoreModal(likePeopleData)}
                        renderMore = {() => this.renderMore()}
                        dataSource = {this.state.likePeopleDataSource}/>
                    <View style = {styles.bottomContainer}>
                        <Text style = {styles.bottomText}>分享给好友帮忙点亮</Text>
                        <View style = {styles.verticalLine2}/>
                        <TouchableOpacity onPress={() => this.setState({showShareModal: true})}>
                            <Image source = {Images.shareIcon}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScoreModal
                    enterGeneralUserPage = {(userId) => this.enterGeneralUserPage(userId)}
                    data = {this.state.likePeople}
                    closeModal = {() => this.closeScoreModal()}
                    modalVisible = {this.state.scoreModalVisible}/>
                <PanoramaSharedModal
                  url = {imageUrl}
                  thumbImage = {this.activity.wechat_share_icon}
                  title = {this.activity.wechat_share_title}
                  description = {this.activity.wechat_share_content}
                  visible = {this.state.showShareModal}
                  closeShareDialog={()=> this.setState({showShareModal: false})}/>
            </View>
        )
    }
}
