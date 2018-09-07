var goodsId = '', //加入清单的产品   
    productSkuValue = '', //加入清单的产品默认属性
    productSkuValueDesc = []; //加入清单的产品定制属性
$(function () {
    var shopcart = '<div id="fileModal" style="display:none">' +
        '<div class="my-filelist">' +
        '<ul class="file-list"></ul>' +
        '<a href="javasrcipt:;" class="create-new" onclick="addNewfile()">' +
        '<i class="icon-addnew"></i>' +
        '<span>创建清单</span>' +
        '</a>' +
        '</div>' +
        '</div>';
    $('body').append(shopcart)
    getBillList()

})

//获取清单列表
function getBillList(callback) {
    $.get(frontContextPath + '/order/getBillList.do', {
        pageNum: 1,
        pageSize: 1000
    }, function (res) {
        if (res.responeCode == '0') {
            res = res.data.billList;
            if (res.length > 0) {
                var _tempStr = ''
                res.forEach(function (val) {
                    _tempStr += '<li>' +
                        '<span class="name">' + val.billName + '</span>' +
                        '<a href="javascript:;" class="btn-default-main js-add" data-id="' + val.billId + '">加入清单</a>' +
                        '</li>';
                })
                $('.file-list').html(_tempStr)
            } 
            if (callback) {
                callback()
            }
        }
    })
}

//创建新清单
function createBill(billName, callback) {
    $.get(frontContextPath + '/order/createBill.do', {
        billName: billName
    }, function (res) {
        if (res.responeCode == '0') {
            // layer.msg('清单创建成功');
            getBillList()
            callback()
        } else {
            layer.msg(res.responeMsg)
        }
    })
}

//加入收藏
function addLike(goodsId, callback) {
    $.get(frontContextPath + '/user/favorite/addCollection.do', {
        goodsId: goodsId
    }, function (res) {
        if (res.responeCode == '0') {
            callback()
            layer.msg('收藏成功')
        } else {
            layer.msg(res.responeMsg)
        }
    })
}

//加入清单
function addShopcart() {
    getBillList(function () {       
        var str = $('#fileModal').html();
        $('html').attr('style', 'margin-right:10px').addClass('dialog-lock-hide')
        layer.open({
            title: '加入清单',
            type: 1,
            skin: '', //加上边框
            area: ['400px'], //宽高
            content: '<div class="addBillModal">' + str + '</div>'
        });
         if ($('.file-list li').length==0){
            createBill('我的清单',function(){
                layer.closeAll('loading');
            })
         }
    });
    //关闭弹窗后移除样式
    $('body').on('click', '.layui-layer-close', function () {
        $('html').attr('style', 'margin-right:0').removeClass('dialog-lock-hide')
    })
}


//打开创建清单窗口
function addNewfile() {
    //prompt层
    layer.prompt({
        title: '创建清单',
        formType: 0
    }, function (text, index) {
        createBill(text, function () {
            layer.close(index);
        })
    });
}

//将产品加入清单
$('body').on('click', '.js-add', function () {
    var self = $(this)
    if ($(this).hasClass('btn-default-main')) {
        var billId = $(this).attr('data-id');
        var goodsNum = $('#proNum').val() || 1
        var data = {
            "billId": billId,
            "goodsNum": goodsNum,
            "goodsId": goodsId,
            "productSkuValue": productSkuValue,
            "productSkuValueDesc": productSkuValueDesc
        }
        $.ajax({
            url: frontContextPath + '/order/addGoodsToBill.do',
            type: 'post',
            data: JSON.stringify(data),
            success: function (res) {
                if (res.responeCode == '0') {
                    self.text('已加入').removeClass('btn-default-main').addClass('btn-default-secondary')
                } else {
                    layer.msg(res.responeMsg)
                }
            }
        })
    }
})