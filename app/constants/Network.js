//web端物品清单测试url
global.webProductListUrl = 'http://shop.v.vidahouse.com:83/client';

const PC_API_TEST    = 'https://api.vidahouse.com:444/';
const PC_API_RELEASE = 'https://api.vidahouse.com/';

const TASK_URL_TEST = 'http://cc.v.vidahouse.com/api/v2.0/Task';
const TASK_URL_RELEASE = 'http://cc.vidahouse.com/api/v2.0/Task';

//社区API
const COMMUNITY_TEST_API = 'http://cm.api.v.vidahouse.com/v2';
const COMMUNITY_RELEASE_API = 'http://api.cm.vidahouse.com/v2';

const ACTIVITY_SHARED_TEST = 'http://activity.v.vidahouse.com/balcony';
const ACTIVITY_SHARED_RELEASE = 'http://activity.vidahouse.com/balcony';


const RECOMMEND_DNA_IP_TEST= 'http://activity.as.v.vidahouse.com/v1.0';
const RECOMMEND_DNA_IP_RELEASE= 'http://activity.as.vidahouse.com/v1.0';

const DNATEMP_TEST = 'http://dnawizard.as.v.vidahouse.com'
const DNATEMP_RELEASE = 'http://dnawizard.as.vidahouse.com'


// 评论|极光推送
const COMMENT_TEST = 'http://cm.api.v.vidahouse.com:82/v2'
const COMMENT_RELEASE = 'http://api.cm.vidahouse.com/v2'

let IP ;
let TASK_URL ;
let COMMUNITY_API ;
let activityAddress ;
let RECOMMEND_DNA_IP;
let DNATEMP_IP;
let COMMENT_IP;


if (0) {
    IP = PC_API_TEST;
    TASK_URL = TASK_URL_TEST;
    COMMUNITY_API = COMMUNITY_TEST_API;
    activityAddress = ACTIVITY_SHARED_TEST;
    RECOMMEND_DNA_IP = RECOMMEND_DNA_IP_TEST;
    DNATEMP_IP = DNATEMP_TEST;
    COMMENT_IP = COMMENT_TEST;
} else {
	IP = PC_API_RELEASE;
	TASK_URL = TASK_URL_RELEASE;
	COMMUNITY_API = COMMUNITY_RELEASE_API;
	activityAddress = ACTIVITY_SHARED_RELEASE;
    RECOMMEND_DNA_IP = RECOMMEND_DNA_IP_RELEASE;
    DNATEMP_IP = DNATEMP_RELEASE;
    COMMENT_IP = COMMENT_RELEASE;
}

const BASE_URL = IP;
/** 登录**/
const LOGIN_URL = IP + 'token';
/** 注册**/
const REGISTER_URL = IP + 'Users/v1.0/Account/Register?mobile=true';
/** 发送登录验证码**/
const LOGIN_VERIFY_URL = IP + 'users/v1.0/account/login';
/** 发送注册验证码**/
const REGISTER_VERIFY_URL = IP + 'Users/v1.0/Account/Challenge';
/** 获取修改密码的令牌**/
const GET_CHANGEPASSWORD_NONCE_URL = IP + 'Users/v1.0/Account/validate';
/** 修改密码**/
const CHANGE_PASSWORD_URL = IP + 'Users/v1.0/Account/forgotpassword';
/** 获取网易云信accountid　和　token**/
const GET_NETEASE_USER_INFO = IP + 'messages/v1.0/im';
/** 获取好友**/
const GET_FRIENDS_URL = IP + 'Friends/v1.0/Friends';
/** 搜索用户**/
const GET_USERS_URL 	= IP + 'Friends/v1.0/Friends?userName=';
// 个人设置
const USER_URL = IP + 'profiles/v1.0/users';
// 上传头像文件
const UPLOAD_URL = IP + 'designing/v1.0/Upload'
/** 添加朋友**/
const ADD_FRIEND_URL  = IP + 'Friends/v1.0/Friends';
/*通过userID获取用户信息*/
const USER_INFO = IP + 'profiles/v1.0/users?userId=';
/** 设计方案**/
const LAYOUT_URL      = IP + 'designing/v1.0/Layout';
/** 设计方案**/
const SCHEMES_URL     = IP + 'designing/v1.0/Schemes';
/** 区域**/
const AREAS_URL				= IP + 'designing/v1.0/Areas';
/** 物品**/
const PRODUCTS_URL    = IP + 'designing/v1.0/Products';
/** 全景图**/
const PANORAMA_URL    = IP + 'designing/v1.0/Upload';
/** DNA**/
const DNA_URL         = IP + 'designing/v1.0/Dna';
/** 材质**/
const MATERIALS_URL   = IP + 'designing/v1.0/Materials';
/** 收藏列表**/
const COLLECTED_PRODUCT_URL  = PRODUCTS_URL  + '/collections';
const COLLECTED_SCHEME_URL   = SCHEMES_URL   + '/collections';
const COLLECTED_MATERIAL_URL = MATERIALS_URL + '/collections';
const COLLECTED_DNA_URL      = DNA_URL       + '/collections';
/*点赞*/
const SCHEME_LIKE = SCHEMES_URL + '/like';
const SCHEME_LIKE_URL = SCHEME_LIKE + '?id=';
/** 收藏或取消收藏具体实例**/
const COLLECT_PRODUCT_URL  = COLLECTED_PRODUCT_URL  + '?versionId=';
const COLLECT_SCHEME_URL   = COLLECTED_SCHEME_URL   + '?id=';
const COLLECT_MATERIAL_URL = COLLECTED_MATERIAL_URL + '?id=';
const COLLECT_DNA_URL      = COLLECTED_DNA_URL       + '?versionId=';
/** 获取WS动态js文件**/
const WS_SCRIPT_URL   = 'http://api.vidahouse.com/messages/hubs';

// 更新data状态数据
const TASK_DATA_URL = TASK_URL + '/Data';
// 获取队列里面的任务的数量
const TASK_QUEUE = TASK_URL + '/stat';

const GET_WECHAT_TOKEN_URL = 'https://api.weixin.qq.com/sns/oauth2/access_token';
// 根据微信token获取用户信息
const GET_WECHAT_USER = 'https://api.weixin.qq.com/sns/userinfo?';
const BIND_WECHAT_URL = 'https://api.vidahouse.com/users/v1.0/account/oauth';

const QINIU_TOKEN        = IP + 'designing/v1.0/Upload';
const UPLOADPANORAMA_URL = IP + 'designing/v1.0/Upload?slug=p360&storageKey=';

// 获取推荐DNA风格
const GET_DNA  = RECOMMEND_DNA_IP + '/user/';
const GET_RECOMMEND_DNA = DNATEMP_IP + '/api/dna/'

const COMMUNITY_MY_IMPORTED_CASES = COMMUNITY_API + '/works/users/';
const COMMUNITY_IMPORTED_CASES = COMMUNITY_API + '/works/search/type';
// 获取用户作品
const COMMUNITY_PUBLISH_CASES = COMMUNITY_API + '/works';
const COMMUNITY_CASE_DETAIL = COMMUNITY_API + '/works/';
// 获取指定用户id的作品
const COMMUNITY_USER_WORKS = COMMUNITY_API + '/works/user';

const COMMUNITY_USER_LOGIN_INFO_URL = COMMENT_IP + '/users/token';
const COMMUNITY_USER_INFO_URL = COMMENT_IP + '/users';
const COMMUNITY_UPDATE_IMAGE = COMMENT_IP + '/users/avatar';
const COMMUNITY_UPDATE_NICKNAME = COMMENT_IP + '/users/nickname';

const COMMUNITY_ADD_COMMENT = COMMENT_IP + '/comment';
const COMMUNITY_BASE_WORKS_URL = COMMUNITY_API + '/Works/'; //{target_id}/comments
// 作品评论相关
const COMMUNITY_WORKS_COMMENT = COMMENT_IP + '/comment/'
const COMMUNITY_COMMENT_REPORT = COMMUNITY_API + '/comments/report';
// 为社区作品点赞
const COMMUITY_WORK_LIKE = COMMUNITY_API + '/works/like'
//提交活动

//获取活动列表
const COMMUNITY_ACTIVITIES  = COMMUNITY_API + '/activities';
//获取特定活动id的活动详情
const COMMUNITY_ACTIVITY  = COMMUNITY_API + '/activity' ; // '加活动ID'
//获取特定作品id的作品详情
const COMMUNITY_ACTIVITY_WORK = COMMUNITY_API + '/activity/works/';
//提交活动作品
const COMMUNITY_POST_ACTIVITY_WORKS = COMMUNITY_ACTIVITY + '/works';
//获取活动作品点赞用户列表
const COMMUNITY_ACTIVITY_USERS_LIKE_WORKS = COMMUNITY_API + '/activity/works/members/liked';
//活动作品点赞
const COMMUNITY_ACTIVITY_LIKE_WORK = COMMUNITY_API + '/activity/works/liked';
//获取活动可供替换的物品
const COMMUNITY_ACTIVITY_ITEMS = COMMUNITY_API + '/activity/item/';
//获取活动可供替换的dna
const COMMUNITY_ACTIVITY_DNA = COMMUNITY_API + '/activity/dna/';
//为某个活动作品添加评论
const COMMUNITY_ACTIVITY_WORK_ADD_COMMENT = COMMUNITY_API + '/activity/works/comment/';
//为某个活动作品添加评分
const COMMUNITY_ACTIVITY_ADD_RATE = COMMUNITY_API + '/activity/works/rating';
//获取某个用户为某个活动的评分
const COMMUNITY_ACTIVITY_GET_USER_RATE_WORK = COMMUNITY_API + '/activity/user/'; //{user_id}/works/{works_id}/rating
//获取指定作品的评分列表
const COMMUNITY_ACTIVITY_GET_WORK_RATE_LIST = COMMUNITY_API + '/activity/works/'; //{works_id}/rating
//获取指定用户的活动作品
const COMMUNITY_ACTIVITY_GET_USER_WORKS_LIST = COMMUNITY_API + '/activity/user/';
//获取特定活动的材质列表
const COMMUNITY_ACTIVITY_MATERIAL = COMMUNITY_ACTIVITY + 	'/material/';

//调查问卷
const EVALUATE_BASE_URL = 'http://websurvey.as.vidahouse.com:9001';

//获取调查问卷题目
const EVALUATE_QUESTIONS_URL = EVALUATE_BASE_URL + '/api/questions';
//提交答卷并得到dna数据
const EVALUATE_QUESTIONS_RESULT_URL = EVALUATE_BASE_URL + '/api/surveys/CalcDnaResult';

//获取极光推送历史消息
const JPUSH_GET_HISTORY_MESSAGE = COMMENT_IP + '/message/history';
//查询|更新用户推送功能
const JPUSH_FUNCTION = COMMENT_IP + '/message/user/setting';

const EvaluateApiMap = {
	getAllQuestions:    {url: EVALUATE_QUESTIONS_URL,        method: 'GET',  name: 'getAllQuestions'},
	getQuestionsResult: {url: EVALUATE_QUESTIONS_RESULT_URL, method: 'POST', name: 'getQuestionsResult'},
};

const JpushApiMap = {
	inquirePushFunction: 		    {url: JPUSH_FUNCTION, 			 		method: 'GET', 			name: 'inquirePushFunction'},
	updatePushFunction: 		    {url: JPUSH_FUNCTION, 					method: 'POST', 		name: 'updatePushFunction'},
	getPushMessage: 			    {url: JPUSH_GET_HISTORY_MESSAGE, 		method: 'GET', 		    name: 'getPushMessage'},
	updatePushMsgReadState: 		{url: JPUSH_GET_HISTORY_MESSAGE, 		method: 'PUT', 		    name: 'updatePushMsgReadState'},
};

const CommunityApiMap = {
	postWorksLike:      {url: COMMUITY_WORK_LIKE,            method: 'POST',  name: 'postWorksLike'},
	getUserWorks:       {url: COMMUNITY_USER_WORKS,          method: 'GET',   name: 'getUserWorks'},
	/*登录使用*/
	getUserLoginInfo:   {url: COMMUNITY_USER_LOGIN_INFO_URL, method: 'GET',   name: 'getUserLoginInfo'},
	addUserLoginInfo:   {url: COMMUNITY_USER_INFO_URL,       method: 'POST',  name: 'addUserLoginInfo'},

	updateImage:        {url: COMMUNITY_UPDATE_IMAGE,        method: 'PATCH', name: 'updateImage'},
	updateNickname:     {url: COMMUNITY_UPDATE_NICKNAME,     method: 'PATCH', name: 'updateNickname'},
	getUserInfo:        {url: COMMUNITY_USER_INFO_URL,       method: 'GET',   name: 'getUserInfo'},

	getImportedCases:   {url: COMMUNITY_IMPORTED_CASES,      method: 'GET',   name: 'getImportedCases'},
	getMyImportedCases: {url: COMMUNITY_MY_IMPORTED_CASES,   method: 'GET',   name: 'getMyImportedCases'},
	publishScheme:      {url: COMMUNITY_PUBLISH_CASES,       method: 'POST',  name: 'publishScheme'},
	getSchemeList:      {url: COMMUNITY_PUBLISH_CASES,       method: 'GET',   name: 'getSchemeList'},
	getScheme:          {url: COMMUNITY_CASE_DETAIL,         method: 'GET',   name: 'getScheme'},

	addComment:         {url: COMMUNITY_ADD_COMMENT,         method: 'POST',  name: 'addComment'},
	deleteComment:      {url: COMMUNITY_ADD_COMMENT,         method: 'DELETE',name: 'deleteComment'},
	getWorksCommentList:{url: COMMUNITY_WORKS_COMMENT,      method: 'GET',   name: 'getWorksCommentList'},
	reportComment:      {url: COMMUNITY_COMMENT_REPORT,      method: 'POST',  name: 'reportComment'},
	getWorksDetail:     {url: COMMUNITY_BASE_WORKS_URL,      method: 'GET',   name: 'getWorksDetail'},
	//活动相关API
	getActivities:                {url: COMMUNITY_ACTIVITIES,                  method: 'GET',    name: 'getActivities'},
	getActivity:                  {url: COMMUNITY_ACTIVITY,                    method: 'GET',    name: 'getActivity'},
	getProduct:                   {url: COMMUNITY_ACTIVITY_ITEMS,              method: 'GET',    name: 'getProduct'},
	getDna:                       {url: COMMUNITY_ACTIVITY_DNA,                method: 'GET',    name: 'getDna'},
	getActivityWork:              {url: COMMUNITY_ACTIVITY_WORK,               method: 'GET',    name: 'getActivityWork'},
	getActivityWorks:             {url: COMMUNITY_ACTIVITY,                    method: 'GET',    name: 'getActivityWorks'},
	getUserActivityWorks:         {url: COMMUNITY_ACTIVITY,                    method: 'GET',    name: 'getUserActivityWorks'},
	postActivityWorks:            {url: COMMUNITY_POST_ACTIVITY_WORKS,         method: 'POST',   name: 'postActivityWorks'},
	likeActivityWork:             {url: COMMUNITY_ACTIVITY_LIKE_WORK,          method: 'POST',   name: 'likeActivityWork'},
	getActivityUsersWhoLikeWork:  {url: COMMUNITY_ACTIVITY_USERS_LIKE_WORKS,   method: 'GET',    name: 'getActivityUsersWhoLikeWork'},
	//
	getActivityWorkComment:       {url: COMMUNITY_WORKS_COMMENT,               method: 'GET',    name: 'getActivityWorkComment'},
	addActivityWorkComment:       {url: COMMUNITY_ADD_COMMENT,   			   method: 'POST',   name: 'addActivityWorkComment'},
	deleteActivityWorkComment:    {url: COMMUNITY_ADD_COMMENT,                 method: 'DELETE', name: 'deleteActivityWorkComment'},

	addActivityWorkRate:          {url: COMMUNITY_ACTIVITY_ADD_RATE,           method: 'POST',  name: 'addActivityWorkRate'},
	getActivityWorkRateOfUser:    {url: COMMUNITY_ACTIVITY_GET_USER_RATE_WORK, method: 'GET',   name: 'getActivityWorkRateOfUser'},
	getActivityWorkRateList:      {url: COMMUNITY_ACTIVITY_GET_WORK_RATE_LIST, method: 'GET',   name: 'getActivityWorkRateList'},
	getActivityUserWorksList:     {url: COMMUNITY_ACTIVITY_GET_USER_WORKS_LIST,method: 'GET',   name: 'getActivityUserWorksList'},

	getDefaultWorks:              {url: COMMUNITY_ACTIVITY,                    method: 'GET',   name: 'getDefaultWorks'},
	getDefaultUploadWorksInfo:    {url: COMMUNITY_ACTIVITY,                    method: 'GET',   name: 'getDefaultUploadWorksInfo'},
	getActivityMaterial:          {url: COMMUNITY_ACTIVITY_MATERIAL,           method: 'GET',   name: 'getActivityMaterial'}
};

const ApiMap = {
	register:          {url: REGISTER_URL,          method: 'POST' , name: 'register'},
	login:             {url: LOGIN_URL,             method: 'POST' , name: 'login'},
	wechatLogin:       {url: LOGIN_URL,             method: 'POST' , name: 'wechatLogin'},
	vertifyLogin:      {url: LOGIN_URL,             method: 'POST' , name: 'vertifyLogin'},
	registerVerify:    {url: REGISTER_VERIFY_URL,   method: 'POST' , name: 'registerVerify'},
	loginVerify:       {url: LOGIN_VERIFY_URL,      method: 'POST' , name: 'loginVerify'},
  getNeteaseUserInfo:{url: GET_NETEASE_USER_INFO, method: 'GET' , name: 'getNeteaseUserInfo'},
	bindWechat:        {url: BIND_WECHAT_URL,       method: 'POST' , name: 'bindWechat'},
	getWechatuUser:    {url: GET_WECHAT_USER,       method: 'GET',   name: 'getWechatuUser'},
	getChangePasswordNonce: {url: GET_CHANGEPASSWORD_NONCE_URL, method: 'POST' , name: 'getChangePasswordNonce'},
	changePassword:    {url: CHANGE_PASSWORD_URL,   method: 'POST' , name: 'changePassword'},
	WSScript:          {url: WS_SCRIPT_URL,         method: 'GET'  , name: 'WSScript'},

	getSchemes:        {url: SCHEMES_URL,           method: 'GET'  , name: 'getSchemes'},
	getScheme:         {url: SCHEMES_URL,           method: 'GET'  , name: 'getScheme'},
	newScheme:         {url: SCHEMES_URL,           method: 'POST' , name: 'newScheme'},
	newTempScheme:     {url: SCHEMES_URL,           method: 'POST' , name: 'newTempScheme'},
	updateScheme:      {url: SCHEMES_URL,           method: 'PUT'  , name: 'updateScheme'},
	deleteScheme:      {url: SCHEMES_URL,           method: 'DELETE',name: 'deleteScheme'},
	publishScheme:     {url: SCHEMES_URL,           method: 'PUT',   name: 'publishScheme'},

	getLayout:         {url: LAYOUT_URL,            method: 'GET'   , name: 'getLayout'},
	updateLayout:      {url: LAYOUT_URL,            method: 'PUT'   , name: 'updateLayout'},
	newLayout:         {url: LAYOUT_URL,            method: 'POST'  , name: 'newLayout'},
	deleteLayout:      {url: LAYOUT_URL,            method: 'DELETE' , name: 'deleteLayout'},

	getProducts:       {url: PRODUCTS_URL,          method: 'GET'  ,  name: 'getProducts'},
	referenceDNA:      {url: SCHEMES_URL,           method: 'POST' ,  name: 'referenceDNA'},
	getProduct:        {url: PRODUCTS_URL,          method: 'GET'  ,  name: 'getProduct'},
	getBoundProduct:   {url: PRODUCTS_URL,          method: 'GET'  ,  name: 'getBoundProduct'},

	saveDna:           {url: DNA_URL,               method: 'POST' ,  name: 'saveDna'},
	getDnas :          {url: DNA_URL,               method: 'GET'  ,  name: 'getDnas'},
	deleteDna:         {url: DNA_URL,               method: 'DELETE', name: 'deleteDna'},
	publishDNA:        {url: DNA_URL,               method: 'PUT',    name: 'publishDNA'},

	getMaterials:      {url: MATERIALS_URL,         method: 'GET'  , name: 'getMaterials'},
	getMaterial:       {url: MATERIALS_URL,         method: 'GET'  , name: 'getMaterial'},

	postTask:          {url: TASK_URL,              method: 'POST' , name: 'postPanoramaTask'},
	patchTask:         {url: TASK_URL,              method: 'patch', name: 'patchTask'},
	cancleTask:        {url: TASK_URL,              method: 'DELETE',name: 'canclePanoramaTask'},
	getTaskResult:     {url: TASK_URL,              method: 'GET'  , name: 'getPanoramaResult'},
	getTaskQueue:      {url: TASK_QUEUE,            method: 'GET',   name: 'getQueue'},
	getPanorama:       {url: PANORAMA_URL,          method: 'GET'  , name: 'getPanorama'},
	collectProduct:    {url: COLLECT_PRODUCT_URL,   method: 'POST' , name: 'collectProduct'},
	collectScheme:     {url: COLLECT_SCHEME_URL,    method: 'POST' , name: 'collectScheme'},
	collectDna:        {url: COLLECT_DNA_URL,       method: 'POST' , name: 'collectDna'},
	collectMaterial:   {url: COLLECT_MATERIAL_URL,  method: 'POST' , name: 'collectMaterial'},
	cancleCollectProduct:  {url: COLLECT_PRODUCT_URL,  method: 'DELETE' , name: 'cancleCollectProduct'},
	cancleCollectScheme:   {url: COLLECT_SCHEME_URL,   method: 'DELETE' , name: 'cancleCollectScheme'},
	cancleCollectDna:      {url: COLLECT_DNA_URL,      method: 'DELETE' , name: 'cancleCollectDna'},
	cancleCollectMaterial: {url: COLLECT_MATERIAL_URL, method: 'DELETE' , name: 'cancleCollectMaterial'},
	collectedProduct:  {url: COLLECTED_PRODUCT_URL,    method: 'GET',     name: 'collectedProduct'},
	collectedScheme:   {url: COLLECTED_SCHEME_URL,     method: 'GET',     name: 'collectedScheme'},
	collectedDna:      {url: COLLECTED_DNA_URL,        method: 'GET',     name: 'collectedDna'},
	collectedMaterial: {url: COLLECTED_MATERIAL_URL,   method: 'GET',     name: 'collectedMaterial'},
	getFriends:        {url: GET_FRIENDS_URL,          method: 'GET' ,    name: 'getFriends'},
	getUsers:          {url: GET_USERS_URL,            method: 'GET' ,    name: 'getUsers'},
	getUser:           {url: USER_INFO,                method: 'GET' ,    name: 'getUser'},
	addFriend:         {url: ADD_FRIEND_URL,           method: 'POST',    name: 'addFriend'},
	uploadPanorma:     {url: UPLOADPANORAMA_URL,       method: 'POST',    name: 'uploadPanorma'},
	likeSchemeList:    {url: SCHEME_LIKE_URL,          method: 'GET',     name: 'likeSchemeList'},
	likeScheme:        {url: SCHEME_LIKE_URL,          method: 'POST',    name: 'likeScheme'},
	cancleLikeScheme:  {url: SCHEME_LIKE_URL,          method: 'DELETE',  name: 'cancleLikeScheme'},
	getWechatToken:    {url: GET_WECHAT_TOKEN_URL,     method: 'POST',    name: 'getWechatToken'},
	getQiniuToken:     {url: QINIU_TOKEN,              method: 'GET',     name: 'getQiniuToken'},
	getUserInfo:       {url: USER_URL,                 method: 'GET',     name: 'getUser'},
	putUser:           {url: USER_URL,                 method: 'PUT',     name: 'putUser'},
	postUploadHead:    {url: UPLOAD_URL,               method: 'POST',    name: 'postUploadHead'},
	getRecommendDna:   {url: GET_RECOMMEND_DNA,        method: 'GET',     name: 'getRecommendDna'},
	getUserDnaStyle:   {url: GET_DNA,                  method: 'GET',     name: 'getUserDnaStyle'},
	putUserDnaStyle:   {url: GET_DNA,                  method: 'put',     name: 'putUserDnaStyle'},
	getTaskSearch:     {url: TASK_URL,                 method: 'GET',     name: 'getTaskSearch'},
	putTaskData:       {url: TASK_DATA_URL,            method: 'PUT',     name: 'putTaskData'}
};

const panoramaUrl = 'http://pano.vidahouse.com/show_inner.html?';
// const panoramaUrl = 'http://test.v.vidahouse.com/alpha/pano_niuniu/show_inner.html?';
export {ApiMap, CommunityApiMap, EvaluateApiMap, panoramaUrl, activityAddress, JpushApiMap, BASE_URL}
