import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Modal,
  Text,
} from 'react-native';

import GiftedSpinner from 'react-native-gifted-spinner';
import * as common from '../../utils/CommonUtils';
import Colors from '../../constants/Colors';

const deviceWidth = common.getWidth();
const deviceHeight = common.getHeight();

const SIZES = ['small', 'normal', 'large'];

export default class Spinner extends React.Component {

  constructor(props) {
    super(props);

    this.state = { visible: this.props.visible }
  }

  static propTypes = {
    visible: React.PropTypes.bool,
    color: React.PropTypes.string,
    size: React.PropTypes.oneOf(SIZES),
    overlayColor: React.PropTypes.string,
    floatColor: React.PropTypes.string,
  };

  static defaultProps = {
    visible: false,
    color: Colors.mainColor,
    size: 'large', // 'normal',
    overlayColor: 'rgba(0, 0, 0, 0.15)',
    floatColor: 'rgba(0, 0, 0, 0.55)',
  };

  close() {
    this.setState({ visible: false })
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps
    this.setState({ visible })
  }

  _renderSpinner() {
    const { visible } = this.state

    if (!visible)
      return (
        <View />
      );

    // once RN version is released for this pull request
    // then we will integrate this `"Normal"` styleAttr property as default
    //let styleAttr = 'Normal';

    let styleAttr = 'Inverse';
    let size = 'large';

    switch (this.props.size) {
    case 'small':
      styleAttr = 'SmallInverse';
      size = 'small';
      break;
    case 'large':
      styleAttr = 'LargeInverse';
      size = 'large';
      break;
    }

    return (
      <View style={styles.container} key={'spinner' + Date.now()}>
        <View style={[styles.background, {backgroundColor: this.props.overlayColor}]}>
          <View style={[styles.float, {backgroundColor:this.props.floatColor}]}>
            <GiftedSpinner
              color={this.props.color}
              style={{marginTop: 5 / 667 * deviceHeight}}
              size={size}
              styleAttr={styleAttr}/>
            <Text style={{color: Colors.white, fontSize: 14, marginTop: 17 / 667 * deviceHeight}}>{this.props.text}</Text>
          </View>
        </View>
      </View>
    );

  }

  render() {
    return this._renderSpinner();
  }

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  float: {
    height: 108 / 667 * deviceHeight,
    width: 187 / 375 * deviceWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
   }
});
