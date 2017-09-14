/**
 * Created by Traveller on 2017/6/14.
 * 渲染进度条
 */
import React from 'react';
import {
	View,
	Text,
	Animated
} from 'react-native'
import * as common from '../utils/CommonUtils';
import PanoramaTaskHandler from '../utils/PanoramaTaskHandler';
const deviceWidth = common.getWidth();
export default class ProcessBlock extends React.Component {
	/**
	 * 进度动画块
	 * 1、渲染任务第一次进行，尝试80%的进度量，需求在30s内完成动画效果
	 * 2、任务进行中，进行页面的重载或者退出再进入的时候，动画效果不改变
	 * 3、添加是否在渲染进程中状态
	 * */
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	static propTypes = {
		animateStyle: React.PropTypes.object
	};

	componentWillMount() {
	}

	componentDidMount() {
		this.animationStateUpdate();
	}

	componentWillReceiveProps(nextProps) {
		this.animationStateUpdate();
	}

	// 动画更新
	animationStateUpdate() {
		this.animateValue = new Animated.Value(0.1 * deviceWidth / 1) //动画起始对象
		this.processBlock = Animated.timing(this.animateValue, {
			toValue:  deviceWidth,
			duration: 60000
		})
		let {isSuccessed, errorMsg, processSeconds, timeoutInSeconds, takeTime} = this.props.scheme;
		if (isSuccessed === false) { // 渲染任务未完成
			if (errorMsg && errorMsg.length !== 0) {
				this.animateValue.setValue(deviceWidth -20);
			} else {
				switch (takeTime) {
					case 0: {
						this.animateValue.setValue(0.15 * deviceWidth / 1);
					}
						break;
					default: {
						let pix = processSeconds / 60; // 进度时间 / 超时时间 = 百分比
						if (pix < 0.1 && pix >= 0) {
							this.processBlock.start();
						} else if (pix < 1 && pix >= 0.1) { // 未超时，进度跟着走
							this.animateValue.setValue(pix * deviceWidth /1);
							this.processBlock.start();
						} else {
							this.animateValue.setValue(0.95 * deviceWidth /1);
						}
					}
				}
			}
		}
	}

	render() {
		return (
			<Animated.View
				style={{
					...this.props.animateStyle,
					width: this.animateValue,
					position: 'absolute',
					height: 100,
					top: 0,
					left: 0,
				}}
			>
				{this.props.children}
			</Animated.View>
		);
	}

}