import React, { Component } from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import ColumnView from './ColumnViewInWaterfall.js';
import * as common from '../../utils/CommonUtils';
import ViewPager from 'react-native-viewpager';
import SchemeHandler from '../../utils/SchemeHandler';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

window.heightRatio = [ 0.85, 1.22, 1.1, 1.2, 1.12,1.08];
window.tmpDataCount = 0;

const ProductListView = require('../../images/scheme/normal/productListView.png');

export default class WaterfallView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            number: 2,
            displayItemList: [],
            pageNumber: 1,
        };
    }

    componentWillReceiveProps(props){
      if (props.data != this.props.data){
        this.addItem(props.data);
      }
    }
    shouldComponentUpdate( nextProps, nextState, context ){
      //只有当路由栈顶为 mainPage时才重新渲染瀑布流
      if ( nextProps.navigator.getCurrentRoutes().length == 1) {
        return true;
      } else {
        return false;
      }
    }
    _getViews() {
        let width = (require('Dimensions').get('window').width) / this.state.number;
        let viewsInside = [];
        for (let i = 0; i < this.state.number; i++) {
            viewsInside.push(<ColumnView width={width} height = {this._getCellHeight(i)} columnIndex = {i} ref={'viewsInside_' + i} key={'viewsInside_' + i}
              navigator={this.props.navigator}/>);
        }
        return viewsInside;
    }
    _getCellHeight(i){
      return this.width * window.heightRatio[i % window.heightRatio.length]
    }
    _getShortestViewIndex() {
        let order = 0;
        let minHeight = this.refs['viewsInside_' + 0].getHeight();
        for (let i = 0; i < this.state.number; i++) {
            let tmpHeight = this.refs['viewsInside_' + i].getHeight();
            if (minHeight > tmpHeight) {
                minHeight = tmpHeight;
                order = i;
            }
        }
        return order; //this.refs['viewsInside_' + order];
    }
    _getLongestViewIndex() {
        return (this._getShortestViewIndex() ? 0 : 1)
    }
    clear() {
        for (let i = 0; i < this.state.number; i++) {
            this.refs['viewsInside_' + i].clearData();
        }
    }

    addItem(items) {
      // if (window.tmpDataCount < window.tmpData.length - 1) {
      //     window.tmpDataCount = tmpDataCount + 1;
      // } else {
      //     window.tmpDataCount = 0;
      // }

        this.state.displayItemList.push(items);
        let index = 0;
        let shortestViewData = [];
        let longestViewData = []
        // let length = Object.keys(this.dataSource).length;
        let _this = this;
        items && items.length && items.forEach((item, itemIndex)=>{
             (itemIndex % _this.state.number == 0) ? shortestViewData.push(item) : longestViewData.push(item)
          })

        this.refs['viewsInside_' + this._getShortestViewIndex()].addItem(shortestViewData);
        this.refs['viewsInside_' + this._getLongestViewIndex()].addItem(longestViewData);
        // shortestView.addItem(shortestViewData);
        // longestView.addItem(longestViewData);
    }

    _onScroll(e){
      let invisibleViewHeight =  this.contentHeight - e.nativeEvent.contentOffset.y - deviceHeight;
      if (this.shouldLoadMore && invisibleViewHeight <= 5 && invisibleViewHeight >= -10) {
          this.props.loadMore()
      }
    }
    _onContentSizeChange(contentWidth, contentHeight){
       this.contentHeight = contentHeight
    }

    render() {
        return (
            <ScrollView
                ref = 'ScrollView'
                style = {{flex:1}}
                removeClippedSubviews = {true}
                scrollEventThrottle = {300}
                overScrollMode = {'always'}
                onScroll = {(e)=>this._onScroll(e)}
                onContentSizeChange = {(contentWidth, contentHeight)=>this._onContentSizeChange(contentWidth, contentHeight)}>
                <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
                    {this._getViews()}
                </View>
            </ScrollView>
        );
    }
};

const styles = StyleSheet.create({
	viewPager:{
		backgroundColor:'white',
		width: deviceWidth,
		height: deviceWidth * 0.6
	}
})
