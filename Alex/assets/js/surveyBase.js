//后台请求地址
var requestPath = "http://alex-uat.witfort.cn";
/**
 * admin后端应用请求接口前缀
 */
var adminContextPath = requestPath + "/a";
/**
 * 前端应用请求接口前缀
 */
var frontContextPath = requestPath + "/f";
/**
 * 公共
 */
var publicContextPath = requestPath + "/public";


var userinfo = JSON.parse(sessionStorage.getItem('userinfo'))
if (userinfo) {
    $('.account_desc ul').html('<li>' +
        '<a href="order.html" style="color:#fff">' +
        '<img src="' + userinfo.photo + '" alt="" width="20" height="20" style="border-radius:50%">' +
        '<span> ' + userinfo.name + '</span>' +
        '</a>' +
        '</li>' +
        '<li><a href="javascript:;" onclick="quit()">退出</a></li>')
}


$.ajaxSetup({
    global: true, // 默认就是true ，触发全局事件
    type: "post",
    timeout: 10000,
    contentType: 'application/json',
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    statusCode: {
        310: function () { //未登录
            //layer.msg("未登录");  
            location.href = 'login.html?backurl=' + location.href
        },
        404: function () {
            layer.msg("请求路径错误");
        },
        500: function () {
            layer.msg("服务器出了点问题");
        }
    },
    // 同步设置
    //async : false
});
//获取url参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
