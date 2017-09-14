/**
 * 加载提示框
 * @author cstyls
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Animated,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  content: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 8,
  },
  centering: {
    margin: 5,
    transform: [{scale: 1.5}],
  },
  text: {
    textAlign: 'center',
    marginTop: 8,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: fontSize(15),
    color: '#fff',
  },
});

export default class Indicator extends Component {
  static propTypes = {
    onLoad: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      isShow: false,
      text: '',
      opacityValue: new Animated.Value(1),
    };
  }

  componentDidMount() {
    this.props.onLoad && this.props.onLoad(this);
  }

  show(text) {
    this.setState({
      isShow: true,
      text,
    });

    Animated.timing(this.state.opacityValue, {
      toValue: 1,
      duration: 300,
    }).start(() => {
      this.isShow = true;
    });
  }

  close() {
    if (!this.isShow && !this.state.isShow) return;

    Animated.timing(this.state.opacityValue, {
      toValue: 0,
      duration: 300,
    }).start(() => {
      this.setState({isShow: false});
      this.isShow = false;
    });
  }

  render() {
    return !this.state.isShow ? null : (
        <Animated.View
            style={[styles.container, {opacity: this.state.opacityValue}]}>
          <View style={styles.content}>
            <ActivityIndicator
                style={styles.centering}
                color={'#fff'}/>
            {
              this.state.text === '' ? null : ( <Text style={[
                  styles.text,
                ]}>{this.state.text}</Text>
              )
            }

          </View>
        </Animated.View>
    );
  }
}
