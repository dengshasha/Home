
package fr.greweb.reactnativeviewshot;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.os.Environment;
import android.util.DisplayMetrics;
import android.view.View;
import android.os.Environment;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.Image;
import android.media.ImageReader;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import java.io.FileOutputStream;
import java.io.FileNotFoundException;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.GuardedAsyncTask;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.nio.ByteBuffer;
import android.net.Uri;

public class RNViewShotModule extends ReactContextBaseJavaModule implements ActivityEventListener{

    private final ReactApplicationContext reactContext;
    private MediaProjection mediaProjection;
    private VirtualDisplay mVirtualDisplay;
    private MediaProjectionManager mediaProjectionManager;
    private static final int REQUESTRESULT = 0x100;
    private int mWidth;
    private int mHeight;
    private int mScreenDensity;
    private ImageReader mImageReader;
    private Image image;

    public RNViewShotModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "RNViewShot";
    }

    @ReactMethod
    public void takeSnapshot(int tag, ReadableMap options, Promise promise) {
        image = mImageReader.acquireLatestImage();
        int width = image.getWidth();
        int height = image.getHeight();
        final Image.Plane[] planes = image.getPlanes();
        final ByteBuffer buffer = planes[0].getBuffer();
        int pixelStride = planes[0].getPixelStride();
        int rowStride = planes[0].getRowStride();
        int rowPadding = rowStride - pixelStride * width;
        Bitmap bitmap = Bitmap.createBitmap(width+rowPadding/pixelStride, height,
                Bitmap.Config.ARGB_8888);
        bitmap.copyPixelsFromBuffer(buffer);
        bitmap = Bitmap.createBitmap(bitmap, 0, 0, width, height);
        saveImage(bitmap, promise);
        image.close();
    }

    public void saveImage(Bitmap bmp, Promise promise) {
        File appDir = new File(this.reactContext.getFilesDir().getPath());
        if (!appDir.exists()) {
            appDir.mkdir();
        }
        String fileName = System.currentTimeMillis()+ ".png";
        File file = new File(appDir, fileName);
        try {
            FileOutputStream fos = new FileOutputStream(file);
            bmp.compress(Bitmap.CompressFormat.PNG, 100, fos);
            fos.flush();
            fos.close();
            String uri = Uri.fromFile(file).toString();
            promise.resolve(uri);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


        @Override
        public void onNewIntent(Intent newIntent) {
            //    super.onNewIntent(newIntent);
        }

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

            if (resultCode == getCurrentActivity().RESULT_OK && requestCode == 0x100) {
                mediaProjectionManager = (MediaProjectionManager) activity.getSystemService(this.reactContext.MEDIA_PROJECTION_SERVICE);
                Display display = activity.getWindowManager().getDefaultDisplay();
                DisplayMetrics outMetric = new DisplayMetrics();
                display.getMetrics(outMetric);
                mScreenDensity = (int) outMetric.density;
                mWidth = display.getWidth();
                mHeight = display.getHeight();
                mImageReader = ImageReader.newInstance(mWidth, mHeight, PixelFormat.RGBA_8888, 2);
                mediaProjection = mediaProjectionManager.getMediaProjection(resultCode,data);
                mVirtualDisplay = mediaProjection.createVirtualDisplay("mediaprojection", mWidth, mHeight,
                    mScreenDensity, DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, mImageReader.getSurface(), null, null);

            }
        }
    }
