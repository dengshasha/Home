package com.vidahouse.vidaeasy.netease.entertainment.activity;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Vibrator;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.google.gson.Gson;
import com.vidahouse.vidaeasy.R;
import com.vidahouse.vidaeasy.netease.base.ui.TActivity;
import com.vidahouse.vidaeasy.netease.http.ApiService;
import com.vidahouse.vidaeasy.netease.http.RetrofitClient;
import com.vidahouse.vidaeasy.netease.http.entity.UserProfileModel;
import com.vidahouse.vidaeasy.netease.im.config.AuthPreferences;

import butterknife.Bind;
import butterknife.ButterKnife;
import butterknife.OnClick;
import de.hdodenhof.circleimageview.CircleImageView;
import jp.wasabeef.glide.transformations.BlurTransformation;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;

public class LiveInviteActivity extends TActivity {

    private final static String EXTRA_NICK_NAME = "NICK_NAME";
    private final static String EXTRA_FRIEND_ID = "FRIEND_ID";
    private final static String EXTRA_FROM_ACCOUNT = "EXTRA_FROM_ACCOUNT";

    private static String strInviterName;
    private static String mStrFriendId;

    private Vibrator mVibrator;

    @Bind(R.id.inviter_name)
    TextView inviterTextView;
    @Bind(R.id.inviter_avator)
    CircleImageView avatorImageView;
    @Bind(R.id.live_invite_background)
    ImageView blurImageView;

    @OnClick({R.id.btn_refuse_call, R.id.btn_agree_call})
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.btn_refuse_call:
                finish();
                overridePendingTransition(R.anim.zoom_in, R.anim.zoom_out);
                break;
            case R.id.btn_agree_call:
                Intent intent = getIntent();
                intent.setClass(LiveInviteActivity.this, AudienceActivity.class);
                this.startActivity(intent);
                finish();
                break;
        }
    }

    public static void start(Context context, String nickName, String friendId, String fromAccount) {
        mStrFriendId = friendId;
        strInviterName = nickName;
        Intent intent = new Intent();
        intent.setClass(context, LiveInviteActivity.class);
        intent.putExtra(EXTRA_NICK_NAME, nickName);
        intent.putExtra(EXTRA_FRIEND_ID, friendId);
        intent.putExtra(EXTRA_FROM_ACCOUNT, fromAccount);
        intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        context.startActivity(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.live_invite_activity);
        ButterKnife.bind(this);
        findViews();
        getInviterAvator();
        mVibrator = (Vibrator) getApplication().getSystemService(Service.VIBRATOR_SERVICE);
        mVibrator.vibrate(new long[]{600, 1100, 400, 300, 150, 500}, 0);
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mVibrator.cancel();
    }

    private void findViews() {
        inviterTextView.setText(strInviterName);
        Glide.with(this).load(R.drawable.bg_live_invite_default)
                .bitmapTransform(new BlurTransformation(this, 25))
                .into(blurImageView);
    }

    private void loadimages(String imgUrl) {
        Glide.with(this).load(imgUrl)
                .error(R.drawable.default_invite_call_avator)
                .into(avatorImageView);
        Glide.with(this).load(imgUrl)
                .error(R.drawable.bg_live_invite_default)
                .bitmapTransform(new BlurTransformation(this, 25))
                .into(blurImageView);
    }

    private void getInviterAvator() {
        Retrofit retrofit = RetrofitClient.getClient(AuthPreferences.getBaseUrl());
        ApiService service = retrofit.create(ApiService.class);
        Call<ResponseBody> call = service.queryByUserId(mStrFriendId, AuthPreferences.getVidahouseToken());
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                try {
                    String jsonStr = response.body().string();
                    Gson gson = new Gson();
                    UserProfileModel model = gson.fromJson(jsonStr, UserProfileModel.class);
                    String avatarUrl = model.getAvatar();
                    if(avatarUrl != null && avatarUrl.length() > 0) {
                        loadimages(avatarUrl);
                    }
                } catch (Exception e) {

                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                t.printStackTrace();
            }
        });
    }
}
