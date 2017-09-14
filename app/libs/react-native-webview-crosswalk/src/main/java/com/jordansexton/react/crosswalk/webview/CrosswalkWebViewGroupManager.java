package com.jordansexton.react.crosswalk.webview;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.common.annotations.VisibleForTesting;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.bridge.Callback;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.uimanager.UIManagerModule;
import org.xwalk.core.XWalkNavigationHistory;
import org.xwalk.core.XWalkView;
import org.xwalk.core.JavascriptInterface;

import javax.annotation.Nullable;
import java.util.Map;
import android.util.Log;
import android.os.SystemClock;

public class CrosswalkWebViewGroupManager extends ViewGroupManager<CrosswalkWebView> {

    public static final int GO_BACK = 1;

    public static final int GO_FORWARD = 2;

    public static final int RELOAD = 3;

    @VisibleForTesting
    public static final String REACT_CLASS = "CrosswalkWebView";

    private ReactApplicationContext mReactContext;

    private static final String BLANK_URL = "about:blank";
    private Callback wechatCallback = null;
    private EventDispatcher eventDispatcher;
    private CrosswalkWebView mView;

    public CrosswalkWebViewGroupManager (ReactApplicationContext reactContext) {
        mReactContext = reactContext;
    }

    @Override
    public String getName () {
        return REACT_CLASS;
    }

    @Override
    public CrosswalkWebView createViewInstance (ThemedReactContext context) {
        CrosswalkWebView crosswalkWebView = new CrosswalkWebView(mReactContext, mReactContext.getCurrentActivity());
        context.addLifecycleEventListener(crosswalkWebView);
        return crosswalkWebView;
    }

    @Override
    public void onDropViewInstance(CrosswalkWebView view) {
        super.onDropViewInstance(view);
        mReactContext.removeLifecycleEventListener((CrosswalkWebView) view);
        view.onDestroy();
    }

    @ReactProp(name = "source")
    public void setSource(final CrosswalkWebView view, @Nullable ReadableMap source) {
      if (source != null) {
        if (source.hasKey("html")) {
          final String html = source.getString("html");
          mReactContext.getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run () {
              view.load(null, html);
            }
          });
          return;
        }
        if (source.hasKey("uri")) {
          final String url = source.getString("uri");
          mReactContext.getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run () {
              view.load(url, null);
            }
          });
          return;
        }
      }
      setUrl(view, BLANK_URL);
    }


    @ReactProp(name = "injectedJavaScript")
    public void setInjectedJavaScript (XWalkView view, @Nullable String injectedJavaScript) {
        ((CrosswalkWebView) view).setInjectedJavaScript(injectedJavaScript);
    }

    @ReactProp(name = "url")
    public void setUrl (final CrosswalkWebView view, @Nullable final String url) {
        mReactContext.getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run () {
                view.load(url, null);
            }
        });
    }

    @ReactProp(name = "localhost")
    public void setLocalhost (CrosswalkWebView view, Boolean localhost) {
        view.setLocalhost(localhost);
    }

    @ReactProp(name = "javascriptInterface")
    public void javascriptInterface (final CrosswalkWebView view, @Nullable final String flag) {
        mReactContext.getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run () {
                mView = view;
                view.addJavascriptInterface(new JsInterface(), flag);
            }
        });
    }


    @Override
    public
    @Nullable
    Map<String, Integer> getCommandsMap () {
        return MapBuilder.of(
            "goBack", GO_BACK,
            "goForward", GO_FORWARD,
            "reload", RELOAD
        );
    }

    @Override
    public void receiveCommand (CrosswalkWebView view, int commandId, @Nullable ReadableArray args) {
        switch (commandId) {
            case GO_BACK:
                view.getNavigationHistory().navigate(XWalkNavigationHistory.Direction.BACKWARD, 1);
                break;
            case GO_FORWARD:
                view.getNavigationHistory().navigate(XWalkNavigationHistory.Direction.FORWARD, 1);
                break;
            case RELOAD:
                view.reload(XWalkView.RELOAD_NORMAL);
                break;
        }
    }

    @Override
    public Map getExportedCustomDirectEventTypeConstants () {
        return MapBuilder.of(
            NavigationStateChangeEvent.EVENT_NAME,
            MapBuilder.of("registrationName", "onNavigationStateChange"),
            //ErrorEvent.EVENT_NAME,
            //MapBuilder.of("registrationName", "onError"),
            WechatEvent.EVENT_NAME,
            MapBuilder.of("registrationName", "onShowWeChat")
        );
    }

    public class JsInterface {

      public JsInterface() {
      }

      @JavascriptInterface
      public void showWeChat() {
        eventDispatcher = mReactContext.getNativeModule(UIManagerModule.class).getEventDispatcher();
        eventDispatcher.dispatchEvent(
            new WechatEvent(
                mView.getId(),
                SystemClock.uptimeMillis()
            )
        );
      }
  }
}
