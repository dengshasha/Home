import React, {Component} from 'react';
import {
	Image,
	Text,
	View,
	Modal,
	TextInput,
	StyleSheet,
	Platform,
	TouchableOpacity,
} from 'react-native'
import * as common from '../utils/CommonUtils' ;
import Colors from '../constants/Colors' ;


const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

export default class EditNickName extends Component {
	constructor (props) {
		super(props);
		this.state = {
			value: this.props.nickName,
		}
	}

	onCancle () {
		this.props.onClick && this.props.onClick()
	}

	ensure () {
		this.props.onClick && this.props.onClick(true, this.state.value)
	}

	render () {
		return (
			<Modal
				visible={this.props.modalVisible}
				transparent={true}
				onRequestClose={() => {}}
				animationType={'none'}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={{fontSize: 18, color: Colors.black,}}>编辑昵称</Text>
						<TextInput
							style={{width: '100%', marginVertical: 10, marginHorizontal: 10}}
							underlineColorAndroid={'transparent'}
							defaultValue={this.state.value}
							onChangeText={(text) => this.setState({value: text})}
							value={this.state.value}/>

						<View style={{flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'lightgray'}}>
							<TouchableOpacity style={[styles.modalButton, {
								borderRightWidth: 1,
								borderRightColor: 'lightgray'
							}]} onPress={() => this.onCancle()}>
								<Text style={{fontSize: 18, color: 'rgb(113,186,246)'}}>取消</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalButton} onPress={() =>this.ensure()}>
								<Text style={{fontSize: 18, color: 'rgb(113,186,246)'}}>确定</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		)
	}
}

const styles = StyleSheet.create({
	modalContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		width: deviceWidth,
		height: deviceHeight,
		paddingTop: Platform.OS === 'ios' ? 20 : 0,
		backgroundColor: 'rgba(0, 0, 0, 0.8)'
	},
	modalContent: {
		alignSelf: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.9)',
		borderRadius: 10,
		padding: 10,
		//height: 250 / 667 * deviceHeight,
		width: deviceWidth - 100 / 375 * deviceWidth
	},
	modalButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10,
	},

})
