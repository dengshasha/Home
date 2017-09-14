package com.vidahouse.vidaeasy.netease.entity;

/**
 * Created by jianglin on 17-8-24.
 */


public class LiveInviteMessage{
    private int type;
    private String friendId;
    private String nickName;
    private String content;

    public int getType(){
        return type;
    }
    public void setType(int input){
        this.type = input;
    }
    public String getFriendId(){
        return friendId;
    }
    public void setFriendId(String input){
        this.friendId = input;
    }
    public String getNickName(){
        return nickName;
    }
    public void setNickName(String input){
        this.nickName = input;
    }
    public String getContent(){
        return content;
    }
    public void setContent(String input){
        this.content = input;
    }
}

