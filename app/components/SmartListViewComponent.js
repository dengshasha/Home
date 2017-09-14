import React, {Component} from "react";
import {
  View,
  Text,
  Platform,
  ActivityIndicator,
  ProgressBarAndroid,
  ActivityIndicatorIOS,
} from "react-native";

import PullToRefreshListView from 'react-native-smart-pull-to-refresh-listview';
import * as common from '../utils/CommonUtils';

const deviceWidth = common.getWidth();

export default SmartListViewComponent = {

  _renderHeader(viewState) {
        let {pullState, pullDistancePercent} = viewState
        let {refresh_none, refresh_idle, will_refresh, refreshing,} = PullToRefreshListView.constants.viewState
        pullDistancePercent = Math.round(pullDistancePercent * 100)
        switch(pullState) {
            case refresh_none:
                return (
                    <View style={{height: 35, width: deviceWidth, justifyContent: 'center', alignItems: 'center'}}>
                        <Text>下拉刷新</Text>
                    </View>
                )
            case refresh_idle:
                return (
                    <View style={{height: 35, width: deviceWidth, justifyContent: 'center', alignItems: 'center'}}>
                        <Text>下拉刷新{pullDistancePercent}%</Text>
                    </View>
                )
            case will_refresh:
                return (
                    <View style={{height: 35, width: deviceWidth, justifyContent: 'center', alignItems: 'center'}}>
                        <Text>释放刷新{pullDistancePercent > 100 ? 100 : pullDistancePercent}%</Text>
                    </View>
                )
            case refreshing:
                return (
                    <View style={{flexDirection: 'row', height: 35, width: deviceWidth, justifyContent: 'center', alignItems: 'center'}}>
                        {this._renderActivityIndicator()}<Text>刷新中,请稍候...</Text>
                    </View>
                )
        }
    },

    _renderFooter (viewState){
        let {pullState, pullDistancePercent} = viewState
        let {load_more_none, load_more_idle, will_load_more, loading_more, loaded_all, } = PullToRefreshListView.constants.viewState
        pullDistancePercent = Math.round(pullDistancePercent * 100)
        switch(pullState) {
            case load_more_none:
                return (
                    <View style={{height: 35, width: deviceWidth, justifyContent: 'center', alignItems: 'center'}}>
                        <Text>上滑加载更多</Text>
                    </View>
                )
            case load_more_idle:
                return (
                    <View style={{height: 35, width: deviceWidth, justifyContent: 'center', alignItems: 'center'}}>
                        <Text>上滑加载更多{pullDistancePercent}%</Text>
                    </View>
                )
            case will_load_more:
                return (
                    <View style={{height: 35, width: deviceWidth, justifyContent: 'center', alignItems: 'center'}}>
                        <Text>释放加载更多{pullDistancePercent > 100 ? 100 : pullDistancePercent}%</Text>
                    </View>
                )
            case loading_more:
                return (
                    <View style={{flexDirection: 'row', height: 35, width: deviceWidth, justifyContent: 'center', alignItems: 'center'}}>
                        {this._renderActivityIndicator()}<Text>加载中, 请稍候...</Text>
                    </View>
                )
            case loaded_all:
                return (
                    <View style={{height: 35, width: deviceWidth, justifyContent: 'center', alignItems: 'center'}}>
                        <Text>没有更多内容</Text>
                    </View>
                )
        }
    },

    _renderActivityIndicator() {
        return ActivityIndicator ? (
            <ActivityIndicator
                style={{marginRight: 10,}}
                animating={true}
                color={'#ff0000'}
                size={'small'}/>
        ) : Platform.OS == 'android' ?
            (
            <ProgressBarAndroid
                style={{marginRight: 10,}}
                color={'#ff0000'}
                styleAttr={'Small'}/>

            ) :  (
            <ActivityIndicatorIOS
                style={{marginRight: 10,}}
                animating={true}
                color={'#ff0000'}
                size={'small'}/>
        )
    }
}
