package com.vidahouse.vidaeasy.netease.utils;

import android.content.Context;

import com.netease.nimlib.sdk.uinfo.model.NimUserInfo;

/**
 * Created by jianglin on 17-8-17.
 */
public class ImCache {

    private static Context context;

    private static String account;

    private static NimUserInfo userInfo;

    public static void clear() {
        account = null;
        userInfo = null;
    }

    public static String getAccount() {
        return account;
    }

    public static void setAccount(String account) {
        ImCache.account = account;
    }

    public static Context getContext() {
        return context;
    }

    public static void setContext(Context context) {
        ImCache.context = context.getApplicationContext();
    }
}
