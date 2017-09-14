package com.jordansexton.react.crosswalk.webview;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

class WechatEvent extends Event<WechatEvent> {

    public static final String EVENT_NAME = "wechat";

    protected WechatEvent (int viewTag, long timestampMs) {
        super(viewTag);
    }

    @Override
    public String getEventName () {
        return EVENT_NAME;
    }

    @Override
    public void dispatch (RCTEventEmitter rctEventEmitter) {
        rctEventEmitter.receiveEvent(getViewTag(), getEventName(), serializeEventData());
    }

    private WritableMap serializeEventData () {
        WritableMap eventData = Arguments.createMap();
        return eventData;
    }
}
