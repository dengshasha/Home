package com.vidahouse.vidaeasy.netease;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.netease.nimlib.sdk.AbortableFuture;
import com.netease.nimlib.sdk.NIMClient;
import com.netease.nimlib.sdk.RequestCallback;
import com.netease.nimlib.sdk.auth.AuthService;
import com.netease.nimlib.sdk.auth.LoginInfo;
import com.vidahouse.vidaeasy.R;
import com.vidahouse.vidaeasy.netease.entertainment.activity.LiveInviteActivity;
import com.vidahouse.vidaeasy.netease.im.config.AuthPreferences;
import com.vidahouse.vidaeasy.netease.im.config.UserPreferences;
import com.vidahouse.vidaeasy.netease.utils.ImCache;

/**
 * Created by jianglin on 17-8-17.
 */
public class NimLoginModule extends ReactContextBaseJavaModule {


    private AbortableFuture<LoginInfo> loginRequest;
    private static final String TAG = "NimLoginModule";

    private ReactApplicationContext mContext;

    public NimLoginModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    @Override
    public String getName() {
        return "NimLoginModule";
    }

    @ReactMethod
    public void nimLogin(final String account, final String token, final String VidahouseToken, final String ApiBaseUrl) {
        loginRequest = NIMClient.getService(AuthService.class).login(new LoginInfo(account, token));
        loginRequest.setCallback(new RequestCallback<LoginInfo>() {
            @Override
            public void onSuccess(LoginInfo param) {
                Log.i(TAG, "onSuccess");
                onLoginDone();
                ImCache.setAccount(account);
                saveLoginInfo(account, token, VidahouseToken, ApiBaseUrl);
                // 初始化消息提醒
                NIMClient.toggleNotification(UserPreferences.getNotificationToggle());
                // 初始化免打扰
                NIMClient.updateStatusBarNotificationConfig(UserPreferences.getStatusConfig());
            }

            @Override
            public void onFailed(int code) {
                Log.i(TAG, "onFailed");
                onLoginDone();
                if (code == 302 || code == 404) {
                    Toast.makeText(mContext, R.string.login_failed, Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(mContext, "登录失败: " + code, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onException(Throwable exception) {
                Log.i(TAG, "onException");
                onLoginDone();
            }
        });
    }

    @ReactMethod
    public void nimLogout() {
        NIMClient.getService(AuthService.class).logout();
    }

    @ReactMethod
    public void startLiveModule() {
//        // 该帐号为示例，请先注册
//        String account = "59954ee78deb3c17486143d0";
//        // 以单聊类型为例
//        SessionTypeEnum sessionType = SessionTypeEnum.P2P;
//        String text = "this is an example";
//        // 创建一个文本消息
//        IMMessage textMessage = MessageBuilder.createTextMessage(account, sessionType, text);
//        // 发送给对方
//        NIMClient.getService(MsgService.class).sendMessage(textMessage, false);


        Activity currentActivity = getCurrentActivity();
        try {
            currentActivity.startActivity(new Intent(getCurrentActivity(), LiveInviteActivity.class));
            currentActivity.overridePendingTransition(R.anim.zoom_in, R.anim.zoom_out);
        } catch (Exception e) {
            throw new JSApplicationIllegalArgumentException("不能打开Activity : " + e.getMessage());
        }
    }

    private void onLoginDone() {
        loginRequest = null;
    }

    private void saveLoginInfo(final String account, final String token,
                               final String vidahouseToken, final String apiBaseUrl) {
        AuthPreferences.saveUserAccount(account);
        AuthPreferences.saveUserToken(token);
        AuthPreferences.saveVidahouseToken(vidahouseToken);
        AuthPreferences.saveBaseUrl(apiBaseUrl);
    }
}
