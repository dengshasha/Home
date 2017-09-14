import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import CustomHeader from '../../components/CustomHeader';
import SelectHouseStyle from '../../components/SelectHouseStyle';
import {updateHouseStyle} from '../../actions/house';
import HouseUploadPage from './UploadPage';

const styles = StyleSheet.create({
    next: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 62,
        height: 44,
    },
    nextText: {
        fontSize: fontSize(14),
        color: '#666',
    },
});

let self;

class StylePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            style: '',
        };

        self = this;
    }

    /**
     * 点击下一步
     * @returns {Promise.<void>}
     */
    async next() {
        await this.props.dispatch(updateHouseStyle(this.state.style));
        this.props.navigator.push({component: HouseUploadPage});
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <CustomHeader onBack={() => this.props.navigator.pop()}
                              headerRight={() => {
                                  return (
                                      <TouchableOpacity style={styles.next}
                                                        onPress={() => this.next()}>
                                          <Text style={styles.nextText}>下一步</Text>
                                      </TouchableOpacity>
                                  );
                              }}/>
                <SelectHouseStyle
                    defaultStyle={this.state.style}
                    onChange={(style) => this.setState({style})}/>
            </View>
        );
    }
}

export default connect((state) => ({house: state.house}))(StylePage);
