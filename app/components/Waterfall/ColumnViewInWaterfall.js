import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import WaterfallItem from './WaterfallItem.js';
import styles from './styles.js';
export default ColumnView = React.createClass({
  getInitialState: function () {
    return {
      totalHeight: 0,
      dataSource: [],
    };
  },
  getHeight: function () {
    let totalHeight = 0;
    for (let i = 0; i < this.state.dataSource.length; ++i) {
      totalHeight += this.refs['wfItem_' + i].getHeight();
    }
    return totalHeight;
  },
  addItem: function (item) {
    let dataSource = [ ...this.state.dataSource, ...item];
    this.setState({dataSource});
  },
  clearData: function () {
    this.state.dataSource.splice(0, this.state.dataSource.length);
    this.setState({});
  },
  _showItems: function () {
    let items = [];
    for (let i = 0; i < this.state.dataSource.length; ++i) {
      items.push(<WaterfallItem source={this.state.dataSource[i]}
                                width={this.props.width}
                                height = {this._getCellHeight(i)}
                                col={this.props.columnIndex}
                                row={i}
                                key={'wfItem_' + i}
                                rekey={'wfItem_' + i}
                                ref={'wfItem_' + i}
                                navigator={this.props.navigator}/>);
    }
    return items;
  },
  _getCellHeight(index){
    let ratioIndex = index % window.heightRatio.length + this.props.columnIndex;
    (ratioIndex >= window.heightRatio.length) && (ratioIndex = ratioIndex - window.heightRatio.length)
    return this.props.width * window.heightRatio[ratioIndex]
  },
  render: function () {
    return (
      <View
        ref='thisView'
        style={{ flexDirection: 'column', backgroundColor: this.props.bgColor, width: this.props.width }}>
        {this._showItems()}
      </View>
    );
  },

});
