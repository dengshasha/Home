package com.vidahouse.vidaeasy;

import android.content.Intent;
import android.content.res.Configuration;
import android.media.projection.MediaProjectionManager;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.Display;

import com.facebook.react.ReactActivity;
import com.google.gson.Gson;
import com.netease.nimlib.sdk.NIMClient;
import com.netease.nimlib.sdk.Observer;
import com.netease.nimlib.sdk.msg.MsgServiceObserve;
import com.netease.nimlib.sdk.msg.model.IMMessage;
import com.umeng.analytics.MobclickAgent;
import com.vidahouse.vidaeasy.netease.entertainment.activity.LiveInviteActivity;
import com.vidahouse.vidaeasy.netease.entity.LiveInviteMessage;

import java.util.List;

import cn.jpush.android.api.JPushInterface;

public class MainActivity extends ReactActivity {

    private MediaProjectionManager mediaProjectionManager;
    private static final int REQUESTRESULT = 0x100;

    public static boolean isForeground = false;
    private static final String TAG = "MainActivity";

    private static final int MESSAGE_TYPE_INVITE_LIVE = 7;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        JPushInterface.setDebugMode(false);
        JPushInterface.init(this);

        //registerMessageReceiver();  // used for receive msg
        initData();
        MobclickAgent.openActivityDurationTrack(false);
        registerObservers(true);
    }

    @Override
    protected void onPause() {
        super.onPause();
        isForeground = false;
        JPushInterface.onPause(this);
        MobclickAgent.onPause(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        isForeground = true;
        JPushInterface.onResume(this);
        MobclickAgent.onResume(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        registerObservers(false);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "VidaEasy";
    }

    private void initData() {
        mediaProjectionManager = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
        Display display = getWindowManager().getDefaultDisplay();
        DisplayMetrics outMetric = new DisplayMetrics();
        display.getMetrics(outMetric);
        Intent intent = new Intent(mediaProjectionManager.createScreenCaptureIntent());
        startActivityForResult(intent, REQUESTRESULT);
    }

    private Observer<List<IMMessage>> incomingMessageObserver =
            new Observer<List<IMMessage>>() {
                @Override
                public void onEvent(List<IMMessage> messages) {
                    // 处理新收到的消息，为了上传处理方便，SDK 保证参数 messages 全部来自同一个聊天对象。
                    IMMessage lastMsg = messages.get(messages.size() - 1);
                    String inviterAccount = lastMsg.getFromAccount();
                    Gson gson = new Gson();
                    LiveInviteMessage msg = gson.fromJson(lastMsg.getContent(), LiveInviteMessage.class);
                    if(msg != null && msg.getType() == MESSAGE_TYPE_INVITE_LIVE) {
                        LiveInviteActivity.start(MainActivity.this, msg.getNickName(), msg.getFriendId(), inviterAccount);
                    }
                }
            };

    private void registerObservers(boolean register) {
        MsgServiceObserve service = NIMClient.getService(MsgServiceObserve.class);
        service.observeReceiveMessage(incomingMessageObserver, register);
    }
}
