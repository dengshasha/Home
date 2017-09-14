package com.vidahouse.vidaeasy.netease.im.ui.barrage;

import android.text.TextPaint;

/**
 * Created by jianglin on 17-8-17.
 */
public class BarrageTextTask {
    // build
    private String text;
    private int line;
    private int duration;
    private float x;
    private float y;
    private float deltaX;
    private float length;
    private TextPaint paint;

    // inner
    private float runX;
    private boolean hasFree;

    public BarrageTextTask(String text, int line, int color, int size, int duration, float x, float y, float deltaX) {
        this.text = text;
        this.line = line;
        this.duration = duration;
        this.x = x;
        this.y = y;
        this.deltaX = deltaX;
        this.paint = new TextPaint();
        this.paint.setTextSize(size);
        this.paint.setColor(color);
        this.length = paint.measureText(text);
        this.runX = 0.0f;
        this.hasFree = false;
    }

    public void updatePosition() {
        runX += deltaX;
        x -= deltaX;
    }

    public boolean canFreeLine() {
        if (hasFree) {
            return false;
        }

        if (runX > length + 60.0f) {
            hasFree = true;
            return true;
        }

        return false;
    }

    public boolean isEnd() {
        return x < -1 * length; // 是否应该结束
    }

    public String getText() {
        return text;
    }

    public int getLine() {
        return line;
    }

    public int getDuration() {
        return duration;
    }

    public float getX() {
        return x;
    }

    public float getY() {
        return y;
    }

    public TextPaint getPaint() {
        return paint;
    }
}
