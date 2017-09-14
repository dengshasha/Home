package com.vidahouse.vidaeasy.netease.entertainment.helper;

import android.widget.Toast;

import com.netease.nimlib.sdk.avchat.AVChatCallback;
import com.netease.nimlib.sdk.avchat.AVChatManager;
import com.netease.nimlib.sdk.avchat.constant.AVChatType;
import com.netease.nimlib.sdk.avchat.constant.AVChatVideoScalingType;
import com.netease.nimlib.sdk.avchat.model.AVChatData;
import com.vidahouse.vidaeasy.netease.base.util.log.LogUtil;
import com.vidahouse.vidaeasy.netease.utils.ImCache;


/**
 * Created by jianglin on 17-8-17.
 */
public class MicHelper {

    private static final String TAG = MicHelper.class.getSimpleName();

    public static MicHelper getInstance() {
        return InstanceHolder.instance;
    }

    public interface ChannelCallback {
        void onJoinChannelSuccess();

        void onJoinChannelFailed();
    }

    /**************************** 音视频房间操作 **********************************/

    public void joinChannel(String meetingName, boolean isVideo, final ChannelCallback callback) {
        LogUtil.d(TAG, "joinChannel,isVideo:" + isVideo + " meetingName:" + meetingName);
        if (meetingName == null) {
            LogUtil.d(TAG, "meeting name is null,return");
            return;
        }
        AVChatType type = isVideo ? AVChatType.VIDEO : AVChatType.AUDIO;
        LogUtil.d("jianglin", "type:" + type);
        AVChatManager.getInstance().joinRoom2(meetingName, AVChatType.VIDEO, new AVChatCallback<AVChatData>() {
            @Override
            public void onSuccess(AVChatData avChatData) {
                LogUtil.d(TAG, "join channel success");
                Toast.makeText(ImCache.getContext(), "join channel success", Toast.LENGTH_SHORT).show();
                callback.onJoinChannelSuccess();
            }

            @Override
            public void onFailed(int i) {
                LogUtil.e(TAG, "join channel failed, code:" + i);
                Toast.makeText(ImCache.getContext(), "join channel failed, code:" + i, Toast.LENGTH_SHORT).show();
                callback.onJoinChannelFailed();
            }

            @Override
            public void onException(Throwable throwable) {
                LogUtil.e(TAG, "join channel exception, throwable:" + throwable.getMessage());
                Toast.makeText(ImCache.getContext(), "join channel exception, throwable:" + throwable.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    // 离开音视频房间
    public void leaveChannel(boolean isVideoMode, boolean isDisableVideo, boolean isLeaveRoom, String meetingName) {
        LogUtil.d(TAG, "leaveRoom,isVideoMode:" + isVideoMode + " isDisableVideo:" + isDisableVideo + " isLeaveRoom:" + isLeaveRoom + " meetingName:" + meetingName);
        if (meetingName == null) {
            LogUtil.d(TAG, "meeting name is null,return");
            return;
        }
        if (isVideoMode) {
            AVChatManager.getInstance().setupLocalVideoRender(null, false, AVChatVideoScalingType.SCALE_ASPECT_BALANCED);
            AVChatManager.getInstance().stopVideoPreview();
        }
        if (isDisableVideo) {
            AVChatManager.getInstance().disableVideo();
        }
        if (isLeaveRoom) {
            AVChatManager.getInstance().leaveRoom2(meetingName, new AVChatCallback<Void>() {
                @Override
                public void onSuccess(Void aVoid) {
                    LogUtil.d(TAG, "leave channel success");
                    Toast.makeText(ImCache.getContext(), "leave channel success", Toast.LENGTH_SHORT).show();

                }

                @Override
                public void onFailed(int i) {
                    LogUtil.e(TAG, "leave channel failed, code:" + i);
                    Toast.makeText(ImCache.getContext(), "leave channel failed, code:" + i, Toast.LENGTH_SHORT).show();

                }

                @Override
                public void onException(Throwable throwable) {
                    LogUtil.e(TAG, "leave channel exception, throwable:" + throwable.getMessage());
                    Toast.makeText(ImCache.getContext(), "leave channel exception, throwable:" + throwable.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }
        AVChatManager.getInstance().disableRtc();
    }

    /**
     * ************************************ 单例 ***************************************
     */
    static class InstanceHolder {
        final static MicHelper instance = new MicHelper();
    }
}
