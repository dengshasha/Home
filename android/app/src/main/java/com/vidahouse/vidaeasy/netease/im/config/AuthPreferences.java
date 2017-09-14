package com.vidahouse.vidaeasy.netease.im.config;

import android.content.Context;
import android.content.SharedPreferences;

import com.vidahouse.vidaeasy.netease.utils.ImCache;

/**
 * Created by jianglin on 17-8-17.
 */
public class AuthPreferences {
    private static final String KEY_NIM_ACCOUNT = "account";
    private static final String KEY_NIM_TOKEN = "token";
    private static final String KEY_VIDAHOUSE_TOKEN = "vidahouse_token";
    private static final String KEY_BASE_URL = "common_base_url";


    public static void saveUserAccount(String account) {
        saveString(KEY_NIM_ACCOUNT, account);
    }

    public static String getUserAccount() {
        return getString(KEY_NIM_ACCOUNT);
    }

    public static void saveUserToken(String token) {
        saveString(KEY_NIM_TOKEN, token);
    }

    public static String getUserToken() {
        return getString(KEY_NIM_TOKEN);
    }

    public static void saveVidahouseToken(String token) {
        saveString(KEY_VIDAHOUSE_TOKEN, token);
    }

    public static String getVidahouseToken() {
        return getString(KEY_VIDAHOUSE_TOKEN);
    }

    public static void saveBaseUrl(String url) {
        saveString(KEY_BASE_URL, url);
    }

    public static String getBaseUrl() {
        return getString(KEY_BASE_URL);
    }

    private static void saveString(String key, String value) {
        SharedPreferences.Editor editor = getSharedPreferences().edit();
        editor.putString(key, value);
        editor.commit();
    }

    private static String getString(String key) {
        return getSharedPreferences().getString(key, null);
    }

    static SharedPreferences getSharedPreferences() {
        return ImCache.getContext().getSharedPreferences("Demo", Context.MODE_PRIVATE);
    }
}
