import React, {Component} from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from "react-native";
import NavigationBar from '../../components/NavigationBar';
import Colors from '../../constants/Colors';

export default class NoDataPage extends Component {
    render() {
        return(
            <View style={{flex:1,}}>
                <NavigationBar
                    backgroundColor={Colors.white}
                    title={'活动'}
                    onLeftButtonPress={this.onLeftBack.bind(this)}
                    leftButtonIcon={require('../../images/common/icon_back_black.png')}
                    rightButtonIcon1={require('../../images/common/icon_customer_black.png')}
                />
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Image source = {require('../../images/common/icon_nodata.png')}/>
                    <Text style={{marginTop:10,fontSize:14}}>暂无活动</Text>
                </View>
            </View>
        )
    }

    onLeftBack() {
        const {navigator} = this.props;
        navigator.pop();
    }
}
