package com.vidahouse.vidaeasy.netease.entertainment.constant;

import com.netease.nimlib.sdk.avchat.constant.AVChatType;

/**
 * Created by jianglin on 17-8-17.
 */

public enum LiveType {
    /**
     * 未直播
     */
    NOT_ONLINE(-1),
    /**
     * 视频类型
     */
    VIDEO_TYPE(AVChatType.VIDEO.getValue()),
    /**
     * 语音类型
     */
    AUDIO_TYPE(AVChatType.AUDIO.getValue());

    private int value;

    LiveType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static LiveType typeOfValue(int value) {
        for (LiveType e : values()) {
            if (e.getValue() == value) {
                return e;
            }
        }
        return NOT_ONLINE;
    }
}
