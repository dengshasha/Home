/**
 * Created by Traveller on 2017/3/28.
 * 关于我们页面
 */
import React from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity
} from 'react-native';
import Colors from '../../constants/Colors';
import NavigationBar from '../../components/NavigationBar'
import * as common from '../../utils/CommonUtils';

export default class About extends React.Component {
    constructor(props) {
        super(props);
    }

    onLeftBack() {
        this.props.navigator.pop()
    }


    render() {
        return (
            <View style={{flex: 1,backgroundColor: Colors.mainBgColor}}>
                <NavigationBar
                    title={'关于我们'}
                    titleColor={Colors.black}
                    backgroundColor={Colors.white}
                    onLeftButtonPress={() => this.onLeftBack()}
                    leftButtonIcon={require('../../images/common/icon_back_black.png')}
                    
                />

                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        margin: common.adaptWidth(30),
                        backgroundColor: '#fff'
                    }}>
                    {/*标题*/}
                    <Text style={{fontSize: 30, color: '#535353',marginTop: common.adaptHeight(70),marginBottom: 5}}>玩家生活</Text>
                    {/*分割线*/}
                    <View style={{borderBottomWidth: 1, borderColor: '#e6e6e6', width: common.adaptWidth(620)}}/>

                    {/*具体内容*/}
                    <Text style={{width: common.adaptWidth(620), marginTop: common.adaptHeight(60)}}>
                        玩家生活是专为室内设计师开发的人工智能设计工具和 互动分享平台。我们突破性地将VR、AR、人工智能等 核心科技与电子商务相结合，并将商业版图扩展至 B2B，B2C，O2O和F2O领域。
                    </Text>
                </View>
            </View>
        )
    }
}
