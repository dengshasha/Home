/**
 * 户型风格选择
 * @author cstyles
 * @example <SelectHouseStyle defaultStyle={...} onChange={...} />
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    height: dp(78, true),
    justifyContent: 'center',
  },
  titleText: {
    fontSize: fontSize(16),
    color: '#333',
  },
  box: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#eaeaea',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
  },
  cover: {
    width: dp(330, true),
    height: dp(186, true),
  },
  tagWrap: {
    height: dp(68, true),
    paddingHorizontal: dp(12),
    justifyContent: 'center',
  },
  tag: {
    fontSize: fontSize(15),
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '70%',
    height: dp(120, true),
  },
  buttonIcon: {
    width: dp(60, true),
    height: dp(60, true),
  },
});

export default class SelectHouseStyle extends Component {
  static propTypes = {
    defaultStyle: PropTypes.string.isRequired,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.items = [
      {
        cover: require('./assets/dny.jpg'),
        tag: '东南亚',
      }, {
        cover: require('./assets/ygfq.jpg'),
        tag: '异国风情',
      }, {
        cover: require('./assets/os.jpg'),
        tag: '欧式',
      }, {
        cover: require('./assets/rs.jpg'),
        tag: '日式',
      }, {
        cover: require('./assets/xd.jpg'),
        tag: '现代',
      }, {
        cover: require('./assets/xqx.jpg'),
        tag: '小清新',
      }];

    this.state = {
      index: Math.max(
          this.items.findIndex((item) => item.tag === this.props.defaultStyle),
          0),
    };
  }

  componentDidMount() {
    if (this.props.defaultStyle === '') {
      this.props.onChange &&
      this.props.onChange(this.items[this.state.index].tag);
    }
  }

  /**
   * 切换风格
   * @param num {Number}
   */
  toggleStyle(num) {
    const len = this.items.length - 1;
    let index = this.state.index + num;
    index = index < 0 ? len : index;
    index = index > len ? 0 : index;

    this.setState({index});
    this.props.onChange && this.props.onChange(this.items[index].tag);
  }

  render() {
    const item = this.items[this.state.index];

    return (
        <View style={styles.container}>
          <View style={styles.title}>
            <Text style={styles.titleText}>请选择3D房间建模风格</Text>
          </View>
          <View style={styles.box}>
            <View style={styles.card}>
              <Image style={styles.cover} source={item.cover}/>
              <View style={styles.tagWrap}>
                <Text style={styles.tag}>当前风格：<Text
                    style={{color: '#F33D5A'}}>{item.tag}</Text></Text>
              </View>
            </View>
          </View>
          <View style={styles.button}>
            <TouchableOpacity onPress={() => this.toggleStyle(-1)}>
              <Image style={styles.buttonIcon} source={require(
                  '../../images/house/icon_prev.png')}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.toggleStyle(1)}>
              <Image style={styles.buttonIcon} source={require(
                  '../../images/house/icon_next.png')}/>
            </TouchableOpacity>
          </View>
        </View>
    );
  }
}
