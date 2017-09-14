
'use strict';
import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ART,
} from 'react-native';
const {Surface, Shape, Path, Group, Text} = ART;
import * as common from './CommonUtils' ;

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const h = 225;
const curvature = 2;//二次贝塞尔曲线曲率控制参数
const step = 45 ;//一次推进10距离单位
const stepNum = Math.floor(deviceWidth / step);//屏幕宽度可容纳几个速率峰值的显式

let speedCount = 300;
let speedCountHandle = -1;
const debugMsg = true;

var times = 1; //曲线图倍数
//T只需要一个坐标，其控制点已由前面的Q的控制点控制（控制方式为对称控制，比如Q5 20, 10 20 T15 35，相当于Q5 20, 10 20 T15 20,15 35）
//因此起点坐标(0,0)Q终点坐标(10,20)与T坐标(15,35)组成一条二次平滑贝塞尔曲线，
//（平滑的意思是Q终点坐标并不是作为下一条贝塞尔曲线的起点，而是通过T坐标使Q终点坐标再次延伸一点至T坐标，构成贝塞尔曲线的顺滑结尾，并以T坐标为下一条贝塞尔曲线的起点坐标）
//Q终点坐标的控制点坐标的获取方案为：取起点坐标与Q终点坐标的X轴坐标的中点为X，取Q终点坐标的Y轴坐标为Y
//T坐标的获取方案为：取相邻两个Q终点坐标的X轴坐标与Y轴坐标的终点坐标为X和Y
//例如：const _path = new Path("M0 0 Q5 20, 10 20 T15 35, Q17.5 50, 20 50 T25 25, Q27.5 0, 30 0 T35 0, Q37.5 0, 40 0 T45 15, Q47.5 30, 50 30 T55 20, Q57.5 10, 60 10 T65 5, Q67.5 0, 70 0");
var speedCanvas = React.createClass({
    getDefaultProps(){
        return ({
            speed: 0
        });
    },
    getInitialState(){
        return ({
            speedLevel: 1,//速率档位 1档(0-h) 2档(h-2h) 3档(2h-3h) 4档(3h-4h) 5档(4h-5h)... h一般为100多
            speedStr: ' ',
            speedArr: [],//[[10,20,[5,20],[15,35]],[20,50,[17.5,50],[25,25]],[30,0,[27.5,0],[35,0]],[40,0,[37.5,0],[45,15]],[50,30,[47.5,30],[55,20]],[60,10,[57.5,10],[65,5]],[70,0,[67.5,0],[72.5,0]]] 第一个为坐标，第二个为速率，第三个为Q控制点坐标，第四个为T坐标
            topPointArr: [],
            coordinateArr: [],
            countArr: [],
            curveLength: 0,
            dateArr: []

        })
    },

    componentDidMount(){

    },
    componentWillReceiveProps(props){
      this.getTime(props.timeArr, props.countArr)
    },

    getTime(timeArr, countArr) {
      let dateArr = []
      let month = 0, day = 0, date = 0
      //获取月份和天
      for (let i = 0; i < timeArr.length; i++) {
        month = new Date(timeArr[i] * 1000).getMonth() + 1
        day = new Date(timeArr[i] * 1000).getDate()
        date = month + '.' + day
        dateArr.push (date)
      }
      this.setState({
        curveLength: dateArr.length,
        dateArr: dateArr,
      })
      this.receiveSpeed(countArr)
    },

    receiveSpeed(countArr){
        //保证最新的速率曲线在数组的第一位
        //let countArr = [1,10,19,5]
        this.state.speedArr = [];
        
        let _speedLevel = 1;
        this.state.speedLevel = 1;//若不重置此值，则speedLevel记录最高档，速率曲线图不会随着档位的下降而自动以该档位的最高速率填满画布
        
          for (let j = 0; j < countArr.length; j++) {
            if (countArr[j] < 20) {
              times = 10
            }
            if ( 20 < countArr[j] < 40) {
              times = 5
            } 
            console.log('===================', countArr)
            this.state.speedArr.splice(0, 0, [step, countArr[j] * times]);
            let _currLength = this.state.speedArr.length;
            for (let i = 0; i < _currLength; i++) {
                this.state.speedArr[i][0] = (i + 1) * step;//重置X轴坐标为10,20,30...
            
            }
            this.checkSpeedArr();
          }
    },
    //确定各个速率点以及各速率点的Q、T点
    checkSpeedArr(){
        let _speedArr = this.state.speedArr;
        for (let i = 0, j = _speedArr.length; i < j; i++) {
            if (i > 0) {
                _speedArr[i].length > 2 ? _speedArr[i].splice(2) : null;
                _speedArr[i].push([_speedArr[i - 1][3][0] + (_speedArr[i][0] - _speedArr[i - 1][3][0]) / curvature, _speedArr[i][1]]);//添加当前坐标的控制点(Q坐标的控制点)
                if (_speedArr[i + 1] !== undefined) {
                    _speedArr[i].push([_speedArr[i][0] + (_speedArr[i + 1][0] - _speedArr[i][0]) / curvature * (curvature - 1), _speedArr[i][1] + (_speedArr[i + 1][1] - _speedArr[i][1]) / 2]);//添加T坐标点
                }
                else {
                    _speedArr[i].push([_speedArr[i][0] + (_speedArr[i][0] - _speedArr[i][2][0]), 0]);//添加T坐标点，当其为最后一个坐标点时候，需要与X轴闭合
                }
            }
            else {
                _speedArr[i].push([_speedArr[i][0] / curvature, _speedArr[i][1]]);//添加当前坐标的控制点(Q坐标的控制点)
                if (_speedArr[i + 1] !== undefined) {
                    _speedArr[i].push([_speedArr[i][0] + (_speedArr[i + 1][0] - _speedArr[i][0]) / curvature * (curvature - 1), _speedArr[i][1] + (_speedArr[i + 1][1] - _speedArr[i][1]) / 2]);//添加T坐标点
                }
                else {
                    _speedArr[i].push([_speedArr[i][0] + (_speedArr[i][0] - _speedArr[i][2][0]), 0]);//添加T坐标点，当其为最后一个坐标点时候，需要与X轴闭合
                }
            }
        }
        this.checkSpeedStr();
    },
    //右下角坐标系的转换，以右下角为坐标系统的映射方式为：(0,0)=>(deviceWidth,h) (5,10)=>(deviceWidth-5,h-10)
    checkSpeedStr(){
        let _str = "M" + 0 + " " + h + " ";
        let _speedArr = [].concat(JSON.parse(JSON.stringify(this.state.speedArr)));//拷贝一下数组，用于将坐标系转换成右下角坐标系
        let _topPointArr = [];
        let _speedLevel = this.state.speedLevel;
        for (let i = 0, j = _speedArr.length; i < j; i++) {

            let topPointItem = {
              speedValue: _speedArr[i][1],
              timeValue: this.state.dateArr[i],
              x: (_speedArr[i][0] - 10),
              y: (h - _speedArr[i][1] / _speedLevel) - 25
            }
            _topPointArr.push(topPointItem);
            _str += "Q" + (_speedArr[i][2][0]) + " " + (h - _speedArr[i][2][1] / _speedLevel) + ", " + (_speedArr[i][0]) + " " + (h - _speedArr[i][1] / _speedLevel);
            if (_speedArr[i][3] !== undefined) {
                _str += " T" + (_speedArr[i][3][0]) + " " + (h - _speedArr[i][3][1] / _speedLevel) + ", ";
            }
        }
        this.setState({
          speedStr: _str,
          topPointArr: _topPointArr
        });
    },
    render() {
        const _path = new Path(this.state.speedStr);
        let tmpArr = [].concat(this.state.topPointArr);
        let lastItem = tmpArr.pop();
        let surfaceWidth;
        if(lastItem != undefined) {
          surfaceWidth = lastItem.x + 20; //this.state.curveLength * 45 + 20;
        } else {
          surfaceWidth = 0;
        }

        let pointNumView = this.state.topPointArr.map((item, index)=>{
          return(
            <Text x={item.x} y={item.y} font={`13px "Helvetica Neue", "Helvetica", Arial`}
              fill="white" key = {index}>
              {`${item.speedValue == 0 ? '' : item.speedValue / times}`}
            </Text>
          )
        });

        let coordinateView = this.state.topPointArr.map((item, index)=>{
          return(
            <Text x={item.x - 5} y={h + 10} font={`11px "Helvetica Neue", "Helvetica", Arial`}
              fill="#ccc" key = {index}>
              {`${item.timeValue}`}
            </Text>
          )
        });

        let lineView = this.state.topPointArr.map((item, index)=>{
          const path = new Path()
            .moveTo(item.x + 10, item.y + 25)
            .lineTo(item.x + 10, h);
          return(
            <Shape d={path} stroke="#ffffff33" strokeWidth={1} key = {index}/>
          )
        });

        let pointView = this.state.topPointArr.map((item, index)=>{
          const path = new Path()
            .moveTo(item.x + 10, item.y + 22)
            .arc(0, 6, 3)
          return(
            <Shape d={path} stroke="#ffffff" strokeWidth={2} fill="#ffffff" key = {index}/>
          )
        });

        let dottedPath = new Path()
        .moveTo(0, h)
        .lineTo(surfaceWidth, h);

        return (
          <ScrollView
              showsHorizontalScrollIndicator = {false}
              horizontal={true}
              style={Styles.canvasWrap}>
                <Surface width={surfaceWidth} height={deviceHeight / 2 }>
                    {pointNumView}
                    {lineView}
                    <Shape d={_path} stroke="rgba(110,48,140)" strokeWidth={2} fill="rgba(110,48,140,0.4)"/>
                    <Shape d={dottedPath} stroke="#ffffff22" strokeWidth={3} strokeDash={[1, 20]}/>
                    {/*<Shape d={dottedPath} stroke="#ffffff55" strokeWidth={6} strokeDash={[1, 150]}/>*/}
                    {coordinateView}
                    {pointView}
                </Surface>
            </ScrollView>


        );
    }
});

var Styles = StyleSheet.create({
    canvasWrap: {
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        backgroundColor: '#1C1E37',
        flex: 1,
        height: deviceHeight / 2,
    }
});

module.exports = speedCanvas;
