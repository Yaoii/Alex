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
/**
 * 分页数
 */
var pageSize = 12;

/**
 * ajax 全局事件
 * @returns
 */
jQuery.support.cors = true; //判断浏览器是否支持跨域访问
$(document).ajaxStart(function () { // 开始
    layui.use('layer', function () {
        layer.load({
            time: 10 * 1000,
            area: ['50px', '50px']
        });
    })
}).ajaxStop(function () { // 结束
    layer.closeAll('loading');
})

$.ajaxSetup({
    global: true, // 默认就是true ，触发全局事件
    type: "post",
    timeout: 10000,
    contentType: 'application/json',
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true ,
    statusCode: {
        310: function () { //未登录 
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
/**
 * 公共底部html
 */
commonFooter()
/**
 * 用户信息
 */

var userinfo = null
if(window.localStorage){
    userinfo = JSON.parse(localStorage.getItem('userinfo'))
}
if (userinfo) {
    if (!userinfo.photo) {
        userinfo.photo = 'assets/img/girl2.png'
    }   
    $('.account_desc ul').html('<li>' +
        '<a href="order.html" style="color:#fff" target="_blank">' +
        '<img src="' + userinfo.photo + '" alt="" width="20" height="20" style="border-radius:50%">' +
        '<span> ' + userinfo.name + '</span>' +
        '</a>' +
        '</li>' +
        '<li><a href="javascript:;" onclick="quit()">退出</a></li>')
}
//获取url参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
//验证手机号
function isMobileAvailable(mobileInput) {
    var regMobile = /^[1][3,4,5,7,8][0-9]{9}$/;
    return regMobile.test(mobileInput) ? false : true
}
//把HTML格式的字符串转义成实体格式字符串
function escapeHTMLString(str) {
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    return str;
}
//把实体格式字符串转义成HTML格式的字符串
function escapeStringHTML(str) {
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&quot;/g, '"');
    return str;
}

//退出登录
function quit() {
    $.post(frontContextPath + '/wechat/pcLogout.do', function (res) {
        if (res.responeCode == '0') {
            localStorage.removeItem('userinfo')
            //注销成功后回到介绍页
            location.href = 'home.html'
        }
    })
}

//判断发布的日期是不是当前年，是：不显示年
function isCurYear(date) {
    if (date == '') return;
    var year = new Date(date.replace(/-/g, "/")).getFullYear();
    var curYear = new Date().getFullYear();
    if (year == curYear) {
        date = date.substring(5)
    }
    return cutString(date, 3)
}
//去掉字符串后几位
function cutString(str, i) {
    if (str.length > i) {
        str = str.substring(0, str.length - i)
    }
    return str
}

//加载js文件
function loadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function () {
        if (callback != undefined) {
            callback();
        }
    };
    script.src = url;
    document.body.appendChild(script);
}

//获取用户信息
function getUserInfo(callback) {
    $.post(frontContextPath + '/user/userInfo/getUserInfo.do', function (res) {        
        if (res.responeCode == '0') {
            localStorage.setItem('userinfo', JSON.stringify(res.data))
            callback && callback()
        }
    })
}

//获取全部产品 ： 参数type=0 详情页调用； type=1或其他:列表页
function getProduct(data, type, callback) {
    $.get(frontContextPath + '/product/getGoodsList.do', data, function (res) {
        if (res.responeCode == '0') {
            var info = res.data.goodsList;
            if (type == 0) {
                callback(info)
            } else {
                if (info.length > 0) {                    
                    var result = ''
                    info.forEach(function (val) {
                        var _previewImg = '';
                        var smallimg = '';
                        if (val.detailPics.length) {
                            _previewImg = val.detailPics[0];
                            val.detailPics.forEach(function (img, index) {
                                var _curclass = index == 0 ? 'hover' : '';
                                if (index < 5) {
                                    smallimg += '<a href="javscript:;" class="' + _curclass +
                                        '" onmousemove="previewIMG(this,\'' + img +
                                        '\')">' +
                                        '<img src="' + img + '" alt="">' +
                                        '</a>'
                                }
                            })
                        }
                        //收藏
                        var isCollection = val.collectionFlag == '1' ? 'add-liked' : '';
                        //专业公司
                        var isProfessionProduct = val.type == '2' ?'<div class="mianfeibq"><img src="assets/img/mianfeibq.png"></div>':''
                        result += '<li>' +
                            '<div class="pro-img">' +
                            '<div class="thumbImg">' +
                            '<a href="pro-detail.html?id=' + val.id + '" target="_blank">' +
                            '<img src="' + _previewImg + '" alt="">' +
                            '</a>' +
                            '</div>' +
                            '<div class="smallImg">' + smallimg + '</div>' +
                            '</div>' +
                            '<div class="prol-info">' +
                            '<a href="pro-detail.html?id=' + val.id + '" target="_blank">' +
                            '<span class="good-name">' + val.goodsName + '</span>' +
                            '</a>' +
                            '<span class="good-price" style="display:none">￥2865.00</span>' +
                            '</div>' +
                            '<div class="prol-button">' +
                            '<a href="javascript:;" class="add-like ' + isCollection +
                            '" data-id="' + val.id +
                            '">加入收藏</a>' +
                            '<a href="javascript:;" class="add-list" data-id="' + val.id +
                            '" data-defaultSku="' + val.defaultSkuValue + '">加入清单</a>' +
                            '</div>' +
                            isProfessionProduct +
                            '</li>'
                    })
                    $('.noList').hide()
                    $('.pro-ul-list').show().html(result)

                    //加入收藏
                    $('.add-like').click(function () {
                        var _self = $(this);
                        //if (_self.hasClass('add-liked')) return;
                        var _id = $(this).attr('data-id');
                        addLike(_id, function () {
                            _self.addClass('add-liked').text('已收藏')
                        })
                    })

                    //加入清单
                    $('.add-list').click(function () {

                        goodsId = $(this).attr('data-id')
                        productSkuValue = $(this).attr('data-defaultSku')
                        addShopcart()
                    })

                } else {
                    $('.pro-ul-list').hide();
                    $('.noList').show()
                }
                if (callback) {
                    callback(res.data.pages)
                }
            }
        }
    });
}

//头像上传路径获取
function getObjectURL(file) {
    var url = null;
    if (window.createObjectURL != undefined) { // basic
        url = window.createObjectURL(file);
    } else if (window.URL != undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}
//鼠标经过小图切换大图
function previewIMG(self, url) {
    if ($(self).hasClass('hover')) return;
    $(self).addClass('hover').siblings().removeClass('hover');
    $(self).closest('li').find('.thumbImg').find('img').attr('src', url)
}


//公共底部
function commonFooter() {
    $('body').append('<div id="footer">' +
        '<div class="ft_main">' +
        '<div class="ft_nav">' +
        '<a rel="nofollow" href="about.html" class="noborder"> 关于我们</a>' +
        '<cite>/</cite>' +
        '<a rel="nofollow" href="userAgreement.html"> 用户协议</a>' +        
        '<cite>/</cite>' +
        '<a rel="nofollow" href="help.html"> 帮助中心</a>' +
        '<cite>/</cite>' +
        '<a rel="nofollow" href="contact.html" > 联系我们</a>' +        
        '</div>' +
        '<div class="ft_txt">' +
        '<p>' +
        'Copyright 2018, 亚力山大 alexmacedon.com' +
        '</p>' +
        '<p>' +
        '<a rel="nofollow" href="http://www.miitbeian.gov.cn/" target="_blank">粤ICP备1562000号-2</a>' +
        '</p>' +
        '<p class="ft_contact">' +
        '<span>服务时间：09:30-18:00</span>' +
        '<span class="ft_phone">' +
        '客服热线:' +
        '<em>(0755) 8828 3101</em> (温馨提示：请您核对无误后拨出，谢谢！)' +
        '</span>' +
        '</p>' +
        '<p class="flink">' +
        '友情链接：' +
        '<a href="#" target="_blank">牧马人</a>&nbsp;' +
        '<a href="#" target="_blank">宜家家居</a>&nbsp;' +
        '<a href="#" target="_blank">淘宝</a>&nbsp;' +
        '<a href="#" target="_blank">唯品会</a>&nbsp;' +
        '<a href="#" target="_blank">中国家居市场</a>&nbsp;' +
        '</p>' +
        '</div>' +
        '<div class="fsm fsm" rel="nofollow">' +
        '<img src="assets/img/guanzhu_weixin_90.png" alt="微信二维码" width="100">' +
        '<p>' +
        '微信' +
        '<br>扫描关注微信公众号' +
        '</p>' +
        '</div>' +
        '</div>' +
        '</div>');

    //返回顶部
    $('body').append('<a href="javascript:;" id="toTop"><span id="toTopHover"></span></a>')
    loadScript('assets/js/move-top.js', function () {
        loadScript('plugins/jquery/jquery.easing.js', function () {
            $().UItoTop({
                easingType: 'easeOutQuart'
            });
        })
    })
}
//转到问卷调查页面
function goSurvey() {
    if (userinfo) {
        window.open('user-role.html?userId=' + userinfo.id)
    } else {
        window.open('user-role.html')
    }
}
 //重置路由       
 function PostRequest(data) {
     if (data.keyword) {
         data.keyword = encodeURI(encodeURI(data.keyword))
     }
     var str = '';
     for (var item in data) {
         if (data[item] != '') {
             str += item + '=' + data[item] + '&'
         }
     }
     if (str.length > 0) {
         str = str.substring(0, str.length - 1)
     }
     location.href = location.pathname + '?' + str
 }