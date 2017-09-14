package com.vidahouse.vidaeasy.netease.http;

/**
 * Created by jianglin on 17-8-31.
 */

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Query;

public interface ApiService {

    @GET("profiles/v1.0/users")
    Call<ResponseBody> queryByUserId(@Query("userId") String userId,
                                     @Header("Authorization") String authorization);

}
