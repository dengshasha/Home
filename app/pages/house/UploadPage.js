import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import {connect} from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import CustomHeader from '../../components/CustomHeader';
import indicator from '../../components/Indicator';
import toast from '../../components/Toast';
import {uploadLayoutImage, uploadRoomFigure} from '../../actions/house';
import qiniu from '../../utils/qiniu';
import HouseCreatePage from './CreatePage';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    footer: {
        paddingHorizontal: dp(12),
        paddingBottom: dp(12),
    },
    subtitle: {
        flexDirection: 'row',
        paddingVertical: 10,
        fontSize: fontSize(12),
        color: '#999',
    },
    thumbnail: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ccc',
    },
    thumbnailItem: {
        alignItems: 'center',
        paddingTop: 15,
    },
    thumbnailText: {
        height: 28,
        fontSize: fontSize(13),
        color: '#333',
    },
    thumbnailImage: {
        width: dp(88),
        height: dp(68),
    },
    spacing: {
        marginLeft: dp(10),
    },
    view: {
        flex: 1,
        alignItems: 'center',
    },
    cover: {
        alignItems: 'center',
        justifyContent: 'center',
        width: dp(350),
        height: dp(200),
        marginTop: dp(18),
    },
    coverText: {
        fontSize: fontSize(15),
        color: '#fff',
        backgroundColor: 'transparent',
    },
    button: {
        flexDirection: 'row',
    },
    buttonWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 68,
    },
    buttonText: {
        marginLeft: 8,
        fontSize: fontSize(14),
        color: '#333',
    },
    submit: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: dp(350),
        height: 44,
        marginTop: 8,
        borderRadius: 22,
        backgroundColor: '#f33d5a',
    },
    submitText: {
        fontSize: fontSize(15),
        fontWeight: '700',
        color: '#fff',
    },
    tip: {
        marginTop: 10,
        width: dp(325),
        alignItems: 'flex-start',
    },
    tipText: {
        marginTop: 5,
        fontSize: fontSize(12),
        color: '#999',
    },
});

class UploadPage extends Component {
    constructor(props) {
        super(props);

        const {layoutImage} = this.props.house;
        const rooms = this.props.house.rooms.filter((item)=> item.status)

        this.state = {
            index: 0,
            title: '户型',
            buttonText: layoutImage !== '' && !rooms.find((item) => item.figure === '') ? '下一步' : '确定',
        };
    }

    /**
     * 上传参考图
     * @param index {Number} 0.拍照 1.相册
     * @returns {Promise.<void>}
     */
    async uploadPhoto(index) {
        try {
            const image = await ImagePicker[['openCamera', 'openPicker'][index]]({
                showCropGuidelines: false,
                hideBottomControls: true,
                compressImageMaxWidth: 1920,
                compressImageQuality: 0.8,
            });
            if (!image || !/image\/.*/.test(image.mime)) return toast.show('请上传正确格式的图片。');
            indicator.show('上传中，请稍候...');
            const figure = await qiniu.uploadImage({uri: image.path, type: 'multipart/form-data'}, 'upload');
            await this.props.dispatch(this.state.index === 0 ? uploadLayoutImage(figure) : uploadRoomFigure(figure, this.state.index - 1));

            indicator.close();
            toast.show('上传成功');

            // 当所有参考图都上传完后修改按钮文本
            const {layoutImage} = this.props.house;
            const rooms = this.props.house.rooms.filter((item)=> item.status)
            if (this.state.buttonText === '确定' && layoutImage !== '' && !rooms.find((item) => item.figure === '')) {
                this.setState({buttonText: '下一步'});
            }
        } catch (error) {
            if (error.message !== 'User cancelled image selection') {
                indicator.close();
                toast.show('上传失败');
            }
        }
    }

    /**
     * 切换场景
     * @param index
     */
    toggleRoom(index) {
        if (index !== this.state.index) {
            const item = index === 0 ? {name: '户型'} : this.props.house.rooms[index - 1];
            this.setState({index, title: item.name});
        }
    }

    /**
     * 提交参考图
     * @returns {Promise.<void>}
     */
    async onSubmit() {
        const {layoutImage, rooms} = this.props.house;
        const index = rooms.filter((item)=> item.status).findIndex((item) => item.figure === '');
        const item = rooms[index];
        if (layoutImage === '') {
            toast.show('请上传户型参考图');
            this.toggleRoom(0);
        } else if (item) {
            toast.show(`请上传${item.name}参考图`);
            this.toggleRoom(index + 1);
        } else {
            this.props.navigator.push({component: HouseCreatePage});
        }
    }

    /**
     * 渲染缩略图
     * @param item
     * @param index
     * @returns {XML}
     */
    renderItem(item, index) {
        const source = item.figure === '' ? require('../../images/house/anli.png') : {
            uri: qiniu.imageView(item.figure, {
                mode: 1,
                w: 88 * DEVICE.scale,
                h: 68 * DEVICE.scale,
            }),
        };

        return (
            <TouchableWithoutFeedback
                key={index}
                onPress={() => this.toggleRoom(index)}>
                <View style={[styles.thumbnailItem, index === 0 ? null : styles.spacing]}>
                    <Text style={styles.thumbnailText}
                          numberOfLines={1}>{item.name}</Text>
                    <Image style={styles.thumbnailImage} source={source}/>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    render() {
        const {layoutImage, rooms} = this.props.house;
        const items = [{name: '户型', figure: layoutImage}].concat(rooms.filter((item)=> item.status));
        const hasFigure = items[this.state.index].figure !== '';
        const source = items[this.state.index].figure === '' ? require('../../images/house/anli_big.png') : {
            uri: qiniu.imageView(items[this.state.index].figure, {
                mode: 1,
                w: 350 * DEVICE.scale,
                h: 200 * DEVICE.scale,
            }),
        };

        return (
            <View style={styles.container}>
                <CustomHeader
                    title={this.state.title}
                    onBack={() => this.props.navigator.pop()}/>
                <ScrollView>
                    <View style={styles.view}>
                        <Image style={styles.cover} source={source}>
                            {
                                hasFigure ? null : (
                                    <Text style={styles.coverText}>
                                        {
                                            this.state.index === 0
                                                ? '请上传户型图'
                                                : items[this.state.index].name + '含窗口现场照片'
                                        }
                                    </Text>
                                )
                            }
                        </Image>
                        <View style={styles.button}>
                            <TouchableOpacity style={styles.buttonWrap} onPress={() => this.uploadPhoto(0)}>
                                <Image source={require('../../images/house/icon_camera.png')}/>
                                <Text style={styles.buttonText}>拍摄</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonWrap} onPress={() => this.uploadPhoto(1)}>
                                <Image source={require('../../images/house/icon_photo.png')}/>
                                <Text style={styles.buttonText}>相册</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.submit} onPress={() => this.onSubmit()}>
                            <Text style={styles.submitText}>{this.state.buttonText}</Text>
                        </TouchableOpacity>
                        <View style={styles.tip}>
                            <Text style={styles.tipText}>1. 图片需要平铺方正无明显褶皱,图片尺寸长和宽清晰完整</Text>
                            <Text style={styles.tipText}>2. 墙体明确, 承重墙有颜色填充</Text>
                            <Text style={styles.tipText}>3. 图片四面需要有具体尺寸, 且清晰</Text>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.footer}>
                    <Text style={styles.subtitle}>
                        <Text style={{color: '#f33d5a'}}>当前户型: </Text>
                        {rooms.map((o) => o.name).join(', ')}
                    </Text>
                    <ScrollView style={styles.thumbnail} horizontal={true}>
                        {items.map(this.renderItem.bind(this))}
                    </ScrollView>
                </View>
            </View>
        );
    }
}

export default connect((state) => ({house: state.house}))(UploadPage);
