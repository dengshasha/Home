import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
} from 'react-native';
import WaterfallView from './WaterfallView.js'
import styles from './styles.js';


export default class WaterfallDoubleView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            number: this.props.number,
            displayItemList: [],
        };
    }
    _clearItems() {
        this.refs['waterfallView'].clear();
    }

    componentWillReceiveProps(props){
      this._addItem(props.data)
    }
    _addItem(data) {
        if (window.tmpDataCount < window.tmpData.length - 1) {
            window.tmpDataCount = tmpDataCount + 1;
        } else {
            window.tmpDataCount = 0;
        }
        this.refs['waterfallView'].addItem(data);
    }
    render() {
        return (
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#F5FCFF' }}>
                {/**<TouchableHighlight onPress={this._addItem.bind(this)} style={[styles.button, styles.rowItem]}><Text style={[styles.buttonText]}>Add Item</Text></TouchableHighlight>
                <TouchableHighlight onPress={this._clearItems.bind(this)} style={[styles.button, styles.rowItem]}><Text style={[styles.buttonText]}>Clear Items</Text></TouchableHighlight>**/}
                <WaterfallView dataSource = {this.state.dataSource} ref='waterfallView' number='2' bgColor='#F5FCFF' />
            </View>
        );
    }
};
