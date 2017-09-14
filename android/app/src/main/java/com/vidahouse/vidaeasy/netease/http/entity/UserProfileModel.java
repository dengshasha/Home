package com.vidahouse.vidaeasy.netease.http.entity;

/**
 * Created by jianglin on 17-9-1.
 */

public class UserProfileModel {
    private String userId;

    private String username;

    private String nick;

    private String realName;

    private String avatar;

    private String email;

    private String mobile;

    private String address;

    private int appearanceId;

    private String gender;

    private int type;

    public void setUserId(String userId){
        this.userId = userId;
    }
    public String getUserId(){
        return this.userId;
    }
    public void setUsername(String username){
        this.username = username;
    }
    public String getUsername(){
        return this.username;
    }
    public void setNick(String nick){
        this.nick = nick;
    }
    public String getNick(){
        return this.nick;
    }
    public void setRealName(String realName){
        this.realName = realName;
    }
    public String getRealName(){
        return this.realName;
    }
    public void setAvatar(String avatar){
        this.avatar = avatar;
    }
    public String getAvatar(){
        return this.avatar;
    }
    public void setEmail(String email){
        this.email = email;
    }
    public String getEmail(){
        return this.email;
    }
    public void setMobile(String mobile){
        this.mobile = mobile;
    }
    public String getMobile(){
        return this.mobile;
    }
    public void setAddress(String address){
        this.address = address;
    }
    public String getAddress(){
        return this.address;
    }
    public void setAppearanceId(int appearanceId){
        this.appearanceId = appearanceId;
    }
    public int getAppearanceId(){
        return this.appearanceId;
    }
    public void setGender(String gender){
        this.gender = gender;
    }
    public String getGender(){
        return this.gender;
    }
    public void setType(int type){
        this.type = type;
    }
    public int getType(){
        return this.type;
    }
}
