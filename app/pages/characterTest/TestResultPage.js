/**
 * Update by Traveller 2017-6-20
 * 新增问卷DNA结果，put到用户相关风格
 * */
import React, { Component } from 'react'
import {
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Toast from 'react-native-easy-toast'
import * as common from '../../utils/CommonUtils'
import { ApiMap } from '../../constants/Network'
import { ApiRequest, showErrorAlert } from '../../utils/ApiRequest'
import Colors from '../../constants/Colors'
import RecommendDnaPage from './RecommendDnaPage'

const deviceWidth = common.getWidth()
const deviceHeight = common.getHeight()

const lineWidth = 220 / 375 * deviceWidth//白色线条长度
const linePercentage = lineWidth / 10//白色线条十分之一的长度
const apiRequest = new ApiRequest()
export default class TestResultPage extends Component {

    constructor (props) {
        super(props)
        let answers = this.props.route.answers
        var answersArr = new Array()
        answersArr = answers.split('') //字符分割
        for (index in answersArr) {
            optionsItem[index].resultNum = answersArr[index]
        }
    }

    componentDidMount () {
        /**
         * 1、获取用户的userId
         * 2、根据userId获取用户风格数据
         * */
        let {answers} = this.props.route // --> 用户问卷答案
        let {userId} = global.userInfo // --> 用户
        let body = {id: userId, dna: answers}
        apiRequest.request(ApiMap.putUserDnaStyle, {activityDnaUserId: global.userInfo.userId}, body, (status, res) => {
            if (status) {
                this.toast.show(' 风格分析成功 ')
            } else {
                showErrorAlert('获取风格时，网络发生错误')
            }
        })
    }

    renderOptions () {
        return optionsItem.map(function (row, index) {
            return <View key={index} style={styles.options}>
                <View style={styles.optionsText}>
                    <Text style={{color: Colors.white}}>{row.leftText}</Text>
                </View>
                <View style={styles.lineContainer}>
                    <LinearGradient
                        start={{x: 0.0, y: 0.0}}
                        end={{x: 1, y: 0.0}}
                        locations={[0, 0.5, 1]}
                        colors={['#24242C', '#fff', '#24242C']}
                        style={styles.whiteLine}>
                        <LinearGradient
                            start={{x: 0.0, y: 0.0}}
                            end={{x: 1, y: 0.5}}
                            locations={[0, 0.5, 1]}
                            colors={['#172746', '#456DC4', '#4371E0']}
                            style={[styles.blueLine, {width: linePercentage * row.resultNum}]}
                        />
                    </LinearGradient>
                    <View style={[styles.location, {left: linePercentage * row.resultNum - 8}]}>
                        <Image source={require('../../images/characterTest/icon_box.png')} style={styles.box}>
                            <Text style={styles.digital}>{row.resultNum}</Text>
                        </Image>
                        <Image source={require('../../images/characterTest/icon_dot.png')} style={styles.dots}/>
                    </View>
                </View>
                <View style={styles.optionsText}>
                    <Text style={{color: Colors.white}}>{row.rightText}</Text>
                </View>
            </View>
        })
    }

    render () {
        return (
            <View style={{flex: 1, backgroundColor: '#1A1B1F'}}>
                <View style={{alignSelf: 'center', marginVertical: 20 / 667 * deviceHeight}}>
                    <Text style={{color: 'white', fontSize: 18}}>您的品味密码结果</Text>
                </View>
                {this.renderOptions()}
                <TouchableOpacity style={styles.button} onPress={() => this.enterRecommendSchemePage()}>

                    <Text style={{fontSize: 18, color: Colors.white}}>查看推荐风格</Text>
                </TouchableOpacity>
                <Toast ref={(toast) => this.toast = toast}/>
            </View>
        )
    }

    enterRecommendSchemePage () {
        this.props.navigator.push({
            id: 'RecommendDnaPage',
            component: RecommendDnaPage,
            answers: this.props.route.answers
        })
    }
}

const styles = StyleSheet.create({
    options: {
        flexDirection: 'row',
        height: 60 / 667 * deviceHeight,
    },
    lineContainer: {
        height: 60 / 667 * deviceHeight,
        width: lineWidth,
    },
    location: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
    },
    whiteLine: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        height: 2,
        justifyContent: 'center',
        marginTop: 29 / 667 * deviceHeight,
    },
    blueLine: {
        height: 2,
        left: 0,
        position: 'absolute',
    },
    optionsText: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    dots: {
        marginTop: 4,
    },
    box: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    digital: {
        color: Colors.white,
        top: -2,
        backgroundColor: 'transparent'
    },
    button: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#456DC4',
        borderRadius: 5,
        height: 50 / 667 * deviceHeight,
        justifyContent: 'center',
        marginTop: 20 / 667 * deviceHeight,
        width: 150 / 375 * deviceWidth,
    }
})

var optionsItem = [
    {
        leftText: '东方',
        rightText: '西方',
        resultNum: 0,
    }, {
        leftText: '简单',
        rightText: '复杂',
        resultNum: 0,
    }, {
        leftText: '塑料',
        rightText: '金属',
        resultNum: 0,
    }, {
        leftText: '精致',
        rightText: '粗糙',
        resultNum: 0,
    }, {
        leftText: '小型',
        rightText: '大型',
        resultNum: 0,
    }, {
        leftText: '女性',
        rightText: '男性',
        resultNum: 0,
    }, {
        leftText: '圆润',
        rightText: '刚硬',
        resultNum: 0,
    }, {
        leftText: '0岁',
        rightText: '100岁',
        resultNum: 0,
    },
]
