/**
 * Created by Traveller on 2017/6/12.
 * 预加载图片
 * 图片未加载成功，显示默认图片
 */
import React from 'react';
import {Image, View, TouchableWithoutFeedback} from 'react-native';
import * as imgs from '../images/';

export default class PreloadImage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			imgUrl: props.url
		}
	}

	/**PreloadImage 加载默认图片
	 * @url:(string) 网络远程图片的地址
	 * @style:(object) 图片样式
	 * @onPress:(function) 触控点击方法
	 * @resizeMode:(string) 图片拉伸格式：['cover', 'contain', 'stretch', 'repeat', 'center']
	 * @touchableStyle:(object) 触控区域样式
	 * @staticImage:(number) 静态默认样式
	 * */
	static propTypes = {
		url: React.PropTypes.string.isRequired,
		style: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.number]),
		isTouched: React.PropTypes.bool,
		onPress: React.PropTypes.func,
		resizeMode: React.PropTypes.string,
		touchableStyle: React.PropTypes.object,
		staticImage: React.PropTypes.number
	}

	static defaultProps = {
		onPress: () => {
		},
		isTouched: true
	}
	// 开始加载
	loadStart() {
		// console.log('-----start loading Image');
	}

	// 加载成功
	loadOk() {
		// console.log('-----ok loading Image');
		this.setState({loaded: true});
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.url !== nextProps.url) { //url 改变，引起重新渲染，图片标志位重置
			this.setState({loaded: false, imgUrl: nextProps.url})
		}
	}

	render() {
		if (!this.props.isTouched) {
			return (
				<Image source={{uri: this.state.imgUrl}}
					   resizeMode={this.props.resizeMode} style={[this.props.style]}
					   onLoadStart={() => this.loadStart()}
					   onLoad={ () => this.loadOk()}>
					{this.state.loaded
						? null
						: (<Image resizeMode={'stretch'}
								  source={this.props.staticImage || imgs.defaultImg}
								  style={[this.props.style]}/>)}
				</Image>
			)
		}
		return (
			<TouchableWithoutFeedback onPress={this.props.onPress} >
				<View style={[this.props.touchableStyle]}>
					<Image source={{uri: this.state.imgUrl}}
						   resizeMode={this.props.resizeMode} style={[this.props.style]}
						   onLoadStart={() => this.loadStart()}
						   onLoad={ () => this.loadOk()}>
						{this.state.loaded
							? null
							: (<Image resizeMode={'stretch'} source={this.props.staticImage || imgs.defaultImg}
									  style={[this.props.style]}/>)}
					</Image>
					{this.props.children}
				</View>
			</TouchableWithoutFeedback>
		)
	}
}
