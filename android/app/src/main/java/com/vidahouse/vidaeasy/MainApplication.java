package com.vidahouse.vidaeasy;

import android.app.Application;
import android.os.Environment;
import android.text.TextUtils;

import com.BV.LinearGradient.LinearGradientPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.facebook.react.ReactApplication;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.imagepicker.ImagePickerPackage;
import com.jordansexton.react.crosswalk.webview.CrosswalkWebViewPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.netease.nimlib.sdk.NIMClient;
import com.netease.nimlib.sdk.SDKOptions;
import com.netease.nimlib.sdk.auth.LoginInfo;
import com.reactnativecomponent.swiperefreshlayout.RCTSwipeRefreshLayoutPackage;
import com.theweflex.react.WeChatPackage;
import com.vidahouse.vidaeasy.netease.NimLoginPackage;
import com.vidahouse.vidaeasy.netease.im.config.AuthPreferences;
import com.vidahouse.vidaeasy.netease.utils.ImCache;
import com.vidahouse.vidaeasy.netease.utils.SystemUtil;

import java.util.Arrays;
import java.util.List;

import cn.jpush.reactnativejpush.JPushPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
// import in.esseak.react_native_umeng.UmengPackage;

public class MainApplication extends Application implements ReactApplication {

    @Override
    public void onCreate() {
        super.onCreate();
        ImCache.setContext(this);
        NIMClient.init(this, getLoginInfo(), getOptions());
    }

    private boolean SHUTDOWN_TOAST = false;
    private boolean SHUTDOWN_LOG = false;

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new ReactVideoPackage(),
                    new ReactNativeLocalizationPackage(),
                    new IntentReactPackage(),
                    new CrosswalkWebViewPackage(),
                    new WeChatPackage(),
                    new RCTCameraPackage(),
                    new RCTSwipeRefreshLayoutPackage(),
                    new ImagePickerPackage(),
                    new OrientationPackage(),
                    new LinearGradientPackage(),
                    new RNDeviceInfo(),
                    new JPushPackage(SHUTDOWN_TOAST, SHUTDOWN_LOG),
                    new RNViewShotPackage(),
                    new PickerPackage(),
                    new UmengReactPackage(),
                    new NimLoginPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    private LoginInfo getLoginInfo() {
        String account = AuthPreferences.getUserAccount();
        String token = AuthPreferences.getUserToken();

        if (!TextUtils.isEmpty(account) && !TextUtils.isEmpty(token)) {
            ImCache.setAccount(account.toLowerCase());
            return new LoginInfo(account, token);
        } else {
            return null;
        }
    }

    private SDKOptions getOptions() {
        SDKOptions options = new SDKOptions();

        // 如果将新消息通知提醒托管给SDK完成，需要添加以下配置。
//        StatusBarNotificationConfig config = UserPreferences.getStatusConfig();
//        if (config == null) {
//            config = new StatusBarNotificationConfig();
//        }
        // 点击通知需要跳转到的界面
//        config.notificationEntrance = WelcomeActivity.class;
//        config.notificationSmallIconId = R.drawable.ic_stat_notify_msg;
//
//        // 通知铃声的uri字符串
//        config.notificationSound = "android.resource://com.netease.nim.demo/raw/msg";
//        options.statusBarNotificationConfig = config;
//        UserPreferences.setStatusConfig(config);

        // 配置保存图片，文件，log等数据的目录
        String sdkPath = Environment.getExternalStorageDirectory() + "/" + getPackageName() + "/nim/";
        options.sdkStorageRootPath = sdkPath;
       // Log.i("demo", FlavorDependent.getInstance().getFlavorName() + " demo nim sdk log path=" + sdkPath);

        // 配置数据库加密秘钥
        options.databaseEncryptKey = "NETEASE";

        // 配置是否需要预下载附件缩略图
        options.preloadAttach = true;

        // 配置附件缩略图的尺寸大小，
       // options.thumbnailSize = (int) (0.5 * ScreenUtil.screenWidth);

        // 用户信息提供者
        options.userInfoProvider = null;

        // 定制通知栏提醒文案（可选，如果不定制将采用SDK默认文案）
        options.messageNotifierCustomization = null;

        return options;
    }

    private boolean inMainProcess() {
        String packageName = getPackageName();
        String processName = SystemUtil.getProcessName(this);
        return packageName.equals(processName);
    }
}
