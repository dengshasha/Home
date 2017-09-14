package com.vidahouse.vidaeasy.netease.entertainment.activity;

import android.Manifest;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.Toast;

import com.netease.nimlib.sdk.avchat.AVChatManager;
import com.netease.nimlib.sdk.avchat.AVChatStateObserver;
import com.netease.nimlib.sdk.avchat.constant.AVChatResCode;
import com.netease.nimlib.sdk.avchat.constant.AVChatUserRole;
import com.netease.nimlib.sdk.avchat.constant.AVChatVideoCaptureOrientation;
import com.netease.nimlib.sdk.avchat.constant.AVChatVideoCropRatio;
import com.netease.nimlib.sdk.avchat.constant.AVChatVideoQuality;
import com.netease.nimlib.sdk.avchat.constant.AVChatVideoScalingType;
import com.netease.nimlib.sdk.avchat.model.AVChatAudioFrame;
import com.netease.nimlib.sdk.avchat.model.AVChatCameraCapturer;
import com.netease.nimlib.sdk.avchat.model.AVChatNetworkStats;
import com.netease.nimlib.sdk.avchat.model.AVChatParameters;
import com.netease.nimlib.sdk.avchat.model.AVChatSessionStats;
import com.netease.nimlib.sdk.avchat.model.AVChatSurfaceViewRenderer;
import com.netease.nimlib.sdk.avchat.model.AVChatVideoFrame;
import com.vidahouse.vidaeasy.R;
import com.vidahouse.vidaeasy.netease.base.ui.TActivity;
import com.vidahouse.vidaeasy.netease.base.util.log.LogUtil;
import com.vidahouse.vidaeasy.netease.entertainment.helper.MicHelper;
import com.vidahouse.vidaeasy.netease.im.ui.dialog.EasyAlertDialogHelper;
import com.vidahouse.vidaeasy.netease.permission.MPermission;
import com.vidahouse.vidaeasy.netease.permission.annotation.OnMPermissionDenied;
import com.vidahouse.vidaeasy.netease.permission.annotation.OnMPermissionGranted;
import com.vidahouse.vidaeasy.netease.permission.annotation.OnMPermissionNeverAskAgain;
import com.vidahouse.vidaeasy.netease.permission.util.MPermissionUtil;

import java.util.List;
import java.util.Map;


/**
 * Created by jianglin on 17-8-17.
 */
public class AudienceActivity extends TActivity implements AVChatStateObserver {

    private static final String TAG = AudienceActivity.class.getSimpleName();

    private final static String EXTRA_NICK_NAME = "NICK_NAME";
    private final static String EXTRA_FRIEND_ID = "FRIEND_ID";
    private final static String EXTRA_FROM_ACCOUNT = "EXTRA_FROM_ACCOUNT";

    protected final int LIVE_PERMISSION_REQUEST_CODE = 100;

    private String meetingName;//要加入的音视频房间
    private String inviterFriendId;//邀请者的好友Id
    private String inviterAccount;//邀请者的好友Account

    private boolean isMicOn;//判断当前麦克风状态是否开启

    // view
    private AVChatSurfaceViewRenderer videoRender;
    private ViewGroup liveFinishLayout;
    private View closeBtn;
    private View micBtn;
    private View liveFinishBtn;
    private TextView finishTipText;
    private TextView finishNameText;
    private TextView preparedText;
    private TextView micBtnStatus;

    private AVChatCameraCapturer mVideoCapturer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.audience_activity);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);   //应用运行时，保持屏幕高亮，不锁屏
        registerAudienceObservers(true);
        parseIntent();
        findViews();
        requestLivePermission(); // 申请APP基本权限.同意之后，请求拉流
    }

    @Override
    protected void onDestroy() {
        registerAudienceObservers(false);
        super.onDestroy();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        requestLivePermission(); // 申请APP基本权限.同意之后，请求拉流
    }

    @Override
    public void onBackPressed() {
        finishLive();
    }

    protected void findViews() {
        videoRender = findView(R.id.video_render);
        videoRender.setZOrderMediaOverlay(false);
        videoRender.setVisibility(View.GONE);

        closeBtn = findView(R.id.close_btn);
        closeBtn.setOnClickListener(buttonClickListener);

        micBtn = findView(R.id.mic_btn);
        micBtn.setOnClickListener(buttonClickListener);
        micBtnStatus = findView(R.id.mic_btn_status) ;

        liveFinishBtn = findView(R.id.finish_close_btn);
        liveFinishBtn.setOnClickListener(buttonClickListener);

        liveFinishLayout = findView(R.id.live_finish_layout);
        finishTipText = findView(R.id.finish_tip_text);
        finishTipText.setText(R.string.loading);
        finishNameText = findView(R.id.finish_master_name);
        finishNameText.setText(meetingName);
        preparedText = findView(R.id.prepared_text);
    }

    @Override
    protected void initData() {
        isMicOn = true;
    }

    private void parseIntent() {
        meetingName = getIntent().getStringExtra(EXTRA_NICK_NAME);
        inviterFriendId = getIntent().getStringExtra(EXTRA_FRIEND_ID);
        inviterAccount = getIntent().getStringExtra(EXTRA_FROM_ACCOUNT);
        LogUtil.i("jianglin", "AudienceActivity inviterFriendId = " + inviterFriendId);

    }

    private void finishLive() {
        logoutChatRoom();
    }

    // 离开聊天室
    private void logoutChatRoom() {
        EasyAlertDialogHelper.createOkCancelDiolag(this, null, getString(R.string.finish_confirm),
                getString(R.string.confirm), getString(R.string.cancel), true,
                new EasyAlertDialogHelper.OnDialogActionListener() {
                    @Override
                    public void doCancelAction() {

                    }

                    @Override
                    public void doOkAction() {
                        MicHelper.getInstance().leaveChannel(true, true, true, meetingName);
                        mVideoCapturer = null;
                        finish();
                    }
                }).show();
    }

    private void registerAudienceObservers(boolean register) {
        AVChatManager.getInstance().observeAVChatState(this, register);
    }

    private View.OnClickListener buttonClickListener = new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            switch (v.getId()) {
                case R.id.close_btn:
                    finishLive();
                    break;
                case R.id.finish_close_btn:
                    finish();
                    break;
                case R.id.mic_btn:
                    setMicStatus(isMicOn);
                    break;
//                case R.id.switch_btn:
//                    mVideoCapturer.switchCamera();
//                    break;
            }
        }
    };

    // 权限控制
    protected static final String[] LIVE_PERMISSIONS = new String[]{
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.READ_PHONE_STATE};

    protected void requestLivePermission() {
        MPermission.with(this)
                .addRequestCode(LIVE_PERMISSION_REQUEST_CODE)
                .permissions(LIVE_PERMISSIONS)
                .request();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        MPermission.onRequestPermissionsResult(this, requestCode, permissions, grantResults);
    }

    @OnMPermissionGranted(LIVE_PERMISSION_REQUEST_CODE)
    public void onLivePermissionGranted() {
        Toast.makeText(AudienceActivity.this, "授权成功", Toast.LENGTH_SHORT).show();
        doMicLinking();
    }

    @OnMPermissionDenied(LIVE_PERMISSION_REQUEST_CODE)
    public void onLivePermissionDenied() {
        List<String> deniedPermissions = MPermission.getDeniedPermissions(this, LIVE_PERMISSIONS);
        String tip = "您拒绝了权限" + MPermissionUtil.toString(deniedPermissions) + "，无法开启直播";
        Toast.makeText(AudienceActivity.this, tip, Toast.LENGTH_SHORT).show();
        finish();
    }

    @OnMPermissionNeverAskAgain(LIVE_PERMISSION_REQUEST_CODE)
    public void onLivePermissionDeniedAsNeverAskAgain() {
        List<String> deniedPermissions = MPermission.getDeniedPermissionsWithoutNeverAskAgain(this, LIVE_PERMISSIONS);
        List<String> neverAskAgainPermission = MPermission.getNeverAskAgainPermissions(this, LIVE_PERMISSIONS);
        StringBuilder sb = new StringBuilder();
        sb.append("无法开启直播，请到系统设置页面开启权限");
        sb.append(MPermissionUtil.toString(neverAskAgainPermission));
        if (deniedPermissions != null && !deniedPermissions.isEmpty()) {
            sb.append(",下次询问请授予权限");
            sb.append(MPermissionUtil.toString(deniedPermissions));
        }
        Toast.makeText(AudienceActivity.this, sb.toString(), Toast.LENGTH_LONG).show();
    }

    private void setMicStatus(boolean micStatus) {
        if (micStatus) {
            isMicOn = false;
            micBtnStatus.setBackground(getResources().getDrawable(R.drawable.ic_mic_off));
            AVChatManager.getInstance().muteLocalAudio(true);

        } else {
            isMicOn = true;
            micBtnStatus.setBackground(getResources().getDrawable(R.drawable.ic_mic_on));
            AVChatManager.getInstance().muteLocalAudio(false);
        }
    }

    // 开始加入音视频房间，与主播连麦
    private void doMicLinking() {
        // 加入音视频房间
        liveFinishLayout.setVisibility(View.GONE);
        joinChannel();
    }

    // 显示直播已结束布局
    private void showFinishLayout() {
        liveFinishLayout.setVisibility(View.VISIBLE);
        finishTipText.setText(R.string.live_finish);
    }

    /*********************** join channel ***********************/

    protected void joinChannel() {
        AVChatManager.getInstance().enableRtc();
        //摄像头
//        if (mVideoCapturer == null) {
//            mVideoCapturer = AVChatVideoCapturerFactory.createCameraCapturer();
//            mVideoCapturer.setAutoFocus(true);
//            AVChatManager.getInstance().setupVideoCapturer(mVideoCapturer);
//        }
        AVChatParameters parameters = new AVChatParameters();
        parameters.setBoolean(AVChatParameters.KEY_SESSION_LIVE_MODE, false);
        parameters.setInteger(AVChatParameters.KEY_SESSION_MULTI_MODE_USER_ROLE, AVChatUserRole.NORMAL);
        parameters.setInteger(AVChatParameters.KEY_VIDEO_FIXED_CROP_RATIO, AVChatVideoCropRatio.CROP_RATIO_NONE);
        int videoOrientation = getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT ? AVChatVideoCaptureOrientation.ORIENTATION_PORTRAIT : AVChatVideoCaptureOrientation.ORIENTATION_LANDSCAPE_RIGHT;
        parameters.setInteger(AVChatParameters.KEY_VIDEO_CAPTURE_ORIENTATION, videoOrientation);
        parameters.setBoolean(AVChatParameters.KEY_VIDEO_ROTATE_IN_RENDING, true);
        parameters.setInteger(AVChatParameters.KEY_VIDEO_QUALITY, AVChatVideoQuality.QUALITY_HIGH);
        AVChatManager.getInstance().setParameters(parameters);

        AVChatManager.getInstance().enableVideo();
        AVChatManager.getInstance().startVideoPreview();
        MicHelper.getInstance().joinChannel(meetingName, true, new MicHelper.ChannelCallback() {

            @Override
            public void onJoinChannelSuccess() {
                // 打开扬声器
                AVChatManager.getInstance().setSpeaker(true);
                preparedText.setVisibility(View.GONE);
                videoRender.setVisibility(View.VISIBLE);
            }

            @Override
            public void onJoinChannelFailed() {
                showFinishLayout();
            }
        });
    }
    /************************* AVChatStateObserver *****************************/

    @Override
    public void onTakeSnapshotResult(String s, boolean b, String s1) {

    }

    @Override
    public void onConnectionTypeChanged(int i) {

    }

    @Override
    public void onAVRecordingCompletion(String s, String s1) {

    }

    @Override
    public void onAudioRecordingCompletion(String s) {

    }

    @Override
    public void onLowStorageSpaceWarning(long l) {

    }

    @Override
    public void onFirstVideoFrameAvailable(String s) {

    }

    @Override
    public void onVideoFpsReported(String s, int i) {

    }

    @Override
    public void onLeaveChannel() {

    }

    @Override
    public void onJoinedChannel(int i, String s, String s1, int i1) {
        if (i == AVChatResCode.JoinChannelCode.OK) {
            AVChatManager.getInstance().setSpeaker(true);
        }
    }

    @Override
    public void onUserJoined(String s) {
        if(s.equals(inviterAccount)) {
            AVChatManager.getInstance().setupRemoteVideoRender(inviterAccount, videoRender, false, AVChatVideoScalingType.SCALE_ASPECT_FIT);
        }
    }

    @Override
    public void onUserLeave(String s, int i) {
        if (s.equals(inviterAccount)) {
            MicHelper.getInstance().leaveChannel(true, true, true, meetingName);
            mVideoCapturer = null;
            showFinishLayout();
        }
    }

    @Override
    public void onProtocolIncompatible(int i) {

    }

    @Override
    public void onDisconnectServer() {

    }

    @Override
    public void onNetworkQuality(String s, int i, AVChatNetworkStats avChatNetworkStats) {

    }

    @Override
    public void onCallEstablished() {
        AVChatManager.getInstance().enableAudienceRole(false);
    }

    @Override
    public void onDeviceEvent(int i, String s) {

    }

    @Override
    public void onFirstVideoFrameRendered(String s) {
        if (liveFinishLayout.getVisibility() == View.VISIBLE) {
            liveFinishLayout.setVisibility(View.GONE);
        }
    }

    @Override
    public void onVideoFrameResolutionChanged(String s, int i, int i1, int i2) {

    }

    @Override
    public boolean onVideoFrameFilter(AVChatVideoFrame frame, boolean maybeDualInput) {
        return true;
    }

    @Override
    public boolean onAudioFrameFilter(AVChatAudioFrame avChatAudioFrame) {
        return true;
    }

    @Override
    public void onAudioDeviceChanged(int i) {

    }

    @Override
    public void onReportSpeaker(Map<String, Integer> map, int i) {

    }

    @Override
    public void onAudioMixingEvent(int i) {

    }

    @Override
    public void onSessionStats(AVChatSessionStats avChatSessionStats) {

    }

    @Override
    public void onLiveEvent(int i) {
        Toast.makeText(AudienceActivity.this, "onLiveEvent:" + i, Toast.LENGTH_SHORT).show();
    }
}
