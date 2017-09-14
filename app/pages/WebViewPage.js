import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    WebView,
    Text,
    Image,
    TouchableOpacity,
    Platform,
    Dimensions,
    NativeModules,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {PanoramaSharedModal} from '../components/Modal';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    view: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: Platform.OS === 'ios' ? 64 : 44,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
        borderBottomColor: '#cfcfcf',
        borderBottomWidth: 1 / Dimensions.get('window').scale,
        backgroundColor: '#fff',
    },
    button: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        position: 'absolute',
        left: 44,
        right: 44,
        bottom: 0,
        textAlign: 'center',
        lineHeight: 44,
        fontSize: 16,
    },
});

/**
 * jssdk
 * @example window.addEventListener('VidaHouseReady', ...)
 * @example VidaHouse.setShareInfo({url, title, image, description}) // 设置分享信息
 */
const script = `
(function () {
  if (window.VidaHouse) return
  window.VidaHouse = {
    showShareModal: function () {
      window.postMessage(JSON.stringify({
        type: 'showShareModal'
      }))
    },
    setShareInfo: function (shareInfo) {
      window.postMessage(JSON.stringify({
        type: 'setShareInfo',
        data: shareInfo
      }))
    }
  }
    // 派发VidaHouseReady事件
    window.dispatchEvent(new CustomEvent('VidaHouseReady'))
    var addEventListener = EventTarget.prototype.addEventListener // eslint-disable-line
    EventTarget.prototype.addEventListener = function (type, fn, capture) {
        if (type === 'VidaHouseReady' && typeof fn === 'function') {
            fn()
        } else {
            addEventListener.call(this, type, fn, capture)
        }
    }
})()
`;

export default class WebViewPage extends Component {
    constructor(props) {
        super(props);

        const {title, shareInfo, url} = this.props.route.params;

        this.state = {
            url,
            title,
            shareInfo,
            accessToken: global.userInfo.access_token,
            shareModalVisible: false,
            shareIconVisible: Boolean(shareInfo),
        };
        this.history = [];
    }

    onBack() {
        if (this.history.length > 1) {
            this.refs['WEBVIEW'].goBack();
            this.history.pop();
        } else {
            this.props.navigator.pop();
        }
    }

    onNavigationStateChange(navState) {
        if (!this.state.title) this.setState({title: navState.title});
        // 当前url 不在队列中 添加进记录
        if (this.history[this.history.length - 1] !== navState.url) {
            this.history.push(navState.url);
        }

        // 每张页面都需要重新设置分享信息
        this.setState({
            shareIconVisible: false,
            shareInfo: this.props.shareInfo,
        });
    }

    onMessage(event) {
        const {type, data} = JSON.parse(event.nativeEvent.data);

        switch (type) {
            case 'showShareModal': // 打开分享弹窗
                if (this.state.shareIconVisible) {
                    this.setState({
                        shareModalVisible: true,
                    });
                }
                break;
            case 'setShareInfo': // 设置分享信息
                this.setState({
                    shareIconVisible: true,
                    shareInfo: data,
                });
                break;
        }
    }

    render() {
        const webViewProps = {};
        let ua = DeviceInfo.getUserAgent();
        ua = ~ua.indexOf('VidaHouse')
            ? ua
            : `${ua} VidaHouse/${global.userInfo.access_token}/1.0.0`;
        if (Platform.OS === 'ios') {
            webViewProps.allowsInlineMediaPlayback = true;
            NativeModules.RNUserAgent.set(ua);
        } else {
            webViewProps.userAgent = ua;
        }

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => this.onBack()}>
                        <View style={styles.button}>
                            <Image source={require('../images/common/icon_back_black.png')}/>
                        </View>
                    </TouchableOpacity>
                    <Text numberOfLines={1} style={styles.title}>{this.state.title}</Text>
                    {
                        !this.state.shareIconVisible ? null : (
                            <TouchableOpacity
                                onPress={() => this.setState({shareModalVisible: true})}>
                                <View style={styles.button}>
                                    <Image source={require('../images/common/share.png')}/>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                </View>
                <WebView
                    {...webViewProps}
                    ref="WEBVIEW"
                    onMessage={this.onMessage.bind(this)}
                    onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                    mediaPlaybackRequiresUserAction={false}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    injectedJavaScript={script}
                    style={styles.view}
                    source={{uri: this.state.url}}/>
                {
                    !this.state.shareInfo ? null : (
                        <PanoramaSharedModal
                            url={this.state.shareInfo.url}
                            thumbImage={this.state.shareInfo.image}
                            title={this.state.shareInfo.title}
                            description={this.state.shareInfo.description}
                            visible={this.state.shareModalVisible}
                            closeShareDialog={() => this.setState({shareModalVisible: false})}/>
                    )
                }
            </View>
        );
    }
}

