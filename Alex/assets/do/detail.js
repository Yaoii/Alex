var goodsId = getUrlParam('id')

//ajax返回的sku值
var productPrices = {}
//返回  红色|大码：199.00     
var priceDate = {}
//保存最后的组合结果信息 红色：{price:[..]}
var SKUResult = {}
var defaultMaxPrice = 0;
var defaultMinPrice = 0;

$(function () {

    getDetail(function () {

        //点击规格
        $('#pro-Skulist .sku').each(function () {
            var self = $(this);
            var attr_id = self.attr('ican') + self.attr('ival');
            if (!SKUResult[attr_id]) {
                self.addClass('disabled');
            }
            updataState()
        }).click(function () {
            var self = $(this);
            if (!self.hasClass('disabled')) {
                //选中自己，兄弟节点取消选中
                self.toggleClass('cur').siblings().removeClass('cur');
                if ($('.other-sku.cur').length == 0) {
                    updataState()
                }
            }
            $(this).closest('.skuItem').siblings('.sku-other-input').hide()
        });
        //点击高端定制
        $('#pro-Skulist .other-sku').click(function () {
            if ($(this).hasClass('cur')) {
                $(this).removeClass('cur')
                $(this).closest('.skuItem').siblings('.sku-other-input').hide()
                if ($('.other-sku.cur').length == 0) {
                    updataState()
                }
            } else {
                $(this).addClass('cur').siblings('li').removeClass('cur')
                $('.price label').attr('style', 'font-size:24px').text('定制价');
                $(this).closest('.skuItem').siblings('.sku-other-input').show()
                $(this).closest('.skuItem').siblings('.sku-other-input').find('input').focus()
            }
        })

        //点击收藏
        $('.add-like').click(function () {
            var _self = $(this);
            addLike(goodsId, function () {
                _self.addClass('add-liked').text('已收藏')
            })
        })
        //点击加入清单
        $('.btn-buy').click(function () {
            
            if ($('#pro-Skulist .cur').length != $('#pro-Skulist .skuItem').length) {
                layer.msg('亲，请选择属性')
                return;
            }
           
            var flag = true

            //判断高端定制的文本框是否为空
            $('.other-sku.cur').each(function () {
                var otherDesc = $(this).closest('.skuItem').siblings('.sku-other-input').find('input')
                if ($.trim(otherDesc.val()) == '') {
                    flag = false;
                    layer.msg('请输入备注')
                    otherDesc.focus()
                    otherDesc.css('border-color', '#f00')
                }
            })
            if (flag) {

                //选中的规格
                productSkuValue = '';
                productSkuValueDesc = [];

                if ($('.other-sku.cur').length == 0) {
                    //属性
                    $('.sku.cur').each(function () {
                        productSkuValue += $(this).attr('ican') + $(this).attr('ival') + '|'
                    })
                    productSkuValue = productSkuValue.substr(0,productSkuValue.length-1)
                } else {
                    //高度定制
                    $('.other-sku.cur').each(function () {
                        var _desc = $(this).closest('.skuItem').siblings('.sku-other-input').find('input').val()
                        productSkuValueDesc.push({
                            skuTypeId: $(this).attr('ican'),
                            skuTypeValue: '',
                            skuTypeDesc: _desc
                        })
                    })
                    $('.sku.cur').each(function () {
                        productSkuValueDesc.push({
                            skuTypeId: $(this).attr('ican'),
                            skuTypeValue: $(this).attr('ival'),
                            skuTypeDesc: ''
                        })
                    })
                }               
                addShopcart()
            }
        })

        //高端定制修改样式
        $('.sku-other-input input').on('focus', function () {
            $(this).css('border-color', '#f1eded')
        })
    });
})

//获取产品详情
function getDetail(callback) {
    $.get(frontContextPath + '/product/getGoodsInfo.do', {
        goodsId: goodsId
    }, function (res) {       
        if (res.responeCode == '0') {
            res = res.data;           
            //缩略图        
            if (res.detailPics && res.detailPics.length) {
                $('#preview .jqzoom').html('<img jqimg="' + res.detailPics[0].fileUrl + '" src="' + res.detailPics[0].fileUrl + '" />')
                res.detailPics.forEach(function (val) {
                    $('.spec-scroll ul').append('<li><img bimg="' + val.fileUrl + '" src="' + val.fileUrl + '"></li>')
                })
                $('.pro_topdiv').show()
                $('#detail-bottom').show()
                initImgZoom()
                //鼠标经过预览图片函数
                $('.spec-scroll img').hover(function () {
                    $("#preview .jqzoom img").attr({
                        "src": $(this).attr("src"),
                        "jqimg": $(this).attr("bimg")
                    })
                })
            }
            //基本信息
            $('.pro_base_info .title').text(res.goodsName)
            $('#typeName').text(res.typeName)
            $('#goodsInfo').html(escapeStringHTML(res.goodsInfo))
            if (res.collectionFlag == '1') {
                $('.add-like').addClass('add-liked')
            }
            //Cad图纸:非普通用户允许下载图纸            
            if (res.cadList.length > 0 && userinfo.userType!='3'&&res.type=='2') {               
                $('.download-cad').attr('href', res.cadList[0].fileUrl).show()
            }
            defaultMaxPrice = res.maxPrice;
            defaultMinPrice = res.minPrice;

            //规格
            if (res.skuList && res.skuList.length) {
                //商品属性列
                var result = '';
                res.skuList.forEach(function (val) {
                    //属性值
                    if (val.skuValueList.length > 0) {
                        var skuVal = '';
                        val.skuValueList.forEach(function (item) {
                            skuVal += '<li ival="' + item.id + '" ican="' + item.skuTypeId + '" class="sku">' + item.descpt + '</li>';
                        })
                        if (true) {
                            skuVal += '<li  ival="" ican="' + val.id + '" class="other-sku" style="margin-right:0;">高端定制</li>'
                        }
                        skuVal = '<ul class="fl">' + skuVal + '</ul>'
                    }
                    result += '<div><div class="skuItem">' +
                        '<span class="leftspan fl">' + val.descpt + '</span>' + skuVal +
                        '</div><div class="sku-other-input"><input type="text" placeholder="备注"></div></div>'
                })
                $('#pro-Skulist').append(result)

                productPrices = res.productPrices;
                initSKU()
                callback()
            }
            //产品参数
            if (res.productParams && res.productParams.length) {
                res.productParams.forEach(function (val) {
                    $('#productParams').append('<li>' + val.key + ':' + val.value + '</li>').show()
                })
            }            
        }
    })
}

function updataState() {
    //已经选择的节点
    var selectedObjs = $('#pro-Skulist .cur');
    if (selectedObjs.length) {
        //获得组合key价格
        var selectedIds = [];
        selectedObjs.each(function () {
            selectedIds.push($(this).attr('ican') + $(this).attr('ival'));
        });

        selectedIds.sort(function (value1, value2) {
            return parseInt(value1) - parseInt(value2);
        });

        var len = selectedIds.length;
        var prices = SKUResult[selectedIds.join('|')].price;
        var maxPrice = Math.max.apply(Math, prices);
        var minPrice = Math.min.apply(Math, prices);
        $('.price label').removeAttr('style');
        $('.price label').text(maxPrice > minPrice ? minPrice + "-" + maxPrice : maxPrice);

        //用已选中的节点验证待测试节点 underTestObjs
        $("#pro-Skulist .sku").not(selectedObjs).not(self).each(function () {
            var siblingsSelectedObj = $(this).siblings('.cur');
            var testAttrIds = []; //从选中节点中去掉选中的兄弟节点
            if (siblingsSelectedObj.length) {
                var siblingsSelectedObjId = siblingsSelectedObj.attr('ican') + siblingsSelectedObj.attr('ival');
                for (var i = 0; i < len; i++) {
                    (selectedIds[i] != siblingsSelectedObjId) && testAttrIds.push(selectedIds[i]);
                }
            } else {
                testAttrIds = selectedIds.concat();
            }
            testAttrIds = testAttrIds.concat($(this).attr('ican') + $(this).attr('ival'));
            testAttrIds.sort(function (value1, value2) {
                return parseInt(value1) - parseInt(value2);
            });
            if (!SKUResult[testAttrIds.join('|')]) {
                $(this).addClass('disabled');
            } else {
                $(this).removeClass('disabled');
            }
        });
    } else {
        $('.price label').removeAttr('style');
        //设置默认价格        
        if (defaultMinPrice != defaultMaxPrice) {
            $('.price label').text(defaultMinPrice + '-' + defaultMaxPrice);
        } else {
            $('.price label').text(defaultMinPrice);
        }
    }

}

//修改产品数数量
function changeNum(i) {
    var num = parseInt($('#proNum').val())
    if (num == 1 && i < 0) {
        return;
    }
    if (num == 99 && i > 0) {
        return;
    }
    num += i;

    $('#proNum').val(num)
}

//初始化得到结果集 SKUResult
function initSKU() {
    var i, j, skuKeys = getSkUkey(productPrices)
    for (i = 0; i < skuKeys.length; i++) {
        var skuKey = skuKeys[i]; //一条SKU信息key
        var sku = priceDate[skuKey]; //一条SKU信息value                
        var skuKeyAttrs = skuKey.split("|"); //SKU信息key属性值数组

        skuKeyAttrs.sort(function (value1, value2) {
            return parseInt(value1) - parseInt(value2);
        });

        //对每个SKU信息key属性值进行拆分组合
        var combArr = combInArray(skuKeyAttrs);
        for (j = 0; j < combArr.length; j++) {
            add2SKUResult(combArr[j], sku);
        }

        //结果集接放入SKUResult
        SKUResult[skuKeyAttrs.join("|")] = {
            price: [sku.price]
        }
    }
}
//把组合的key放入结果集SKUResult
function add2SKUResult(combArrItem, sku) {
    var key = combArrItem.join("|");
    if (SKUResult[key]) { //SKU信息key属性·
        SKUResult[key].price.push(sku.price)
    } else {
        SKUResult[key] = {
            price: [sku.price]
        };
    }
}
/**
 * 从数组中生成指定长度的组合
 * 方法: 先生成[0,1...]形式的数组, 然后根据0,1从原数组取元素，得到组合数组
 */
function combInArray(aData) {
    if (!aData || !aData.length) {
        return [];
    }

    var len = aData.length;
    var aResult = [];

    for (var n = 1; n < len; n++) {
        var aaFlags = getCombFlags(len, n);
        while (aaFlags.length) {
            var aFlag = aaFlags.shift();
            var aComb = [];
            for (var i = 0; i < len; i++) {
                aFlag[i] && aComb.push(aData[i]);
            }
            aResult.push(aComb);
        }
    }
    return aResult;
}

/**
 * 得到从 m 元素中取 n 元素的所有组合
 * 结果为[0,1...]形式的数组, 1表示选中，0表示不选
 */
function getCombFlags(m, n) {
    if (!n || n < 1) {
        return [];
    }

    var aResult = [];
    var aFlag = [];
    var bNext = true;
    var i, j, iCnt1;

    for (i = 0; i < m; i++) {
        aFlag[i] = i < n ? 1 : 0;
    }

    aResult.push(aFlag.concat());

    while (bNext) {
        iCnt1 = 0;
        for (i = 0; i < m - 1; i++) {
            if (aFlag[i] == 1 && aFlag[i + 1] == 0) {
                for (j = 0; j < i; j++) {
                    aFlag[j] = j < iCnt1 ? 1 : 0;
                }
                aFlag[i] = 0;
                aFlag[i + 1] = 1;
                var aTmp = aFlag.concat();
                aResult.push(aTmp);
                if (aTmp.slice(-n).join("").indexOf('0') == -1) {
                    bNext = false;
                }
                break;
            }
            aFlag[i] == 1 && iCnt1++;
        }
    }
    return aResult;
}
//获取key值
function getSkUkey(obj) {
    var keys = []
    if (obj.length > 0) {
        obj.forEach(function (val) {
            keys.push(val.productSkuValue)
            priceDate[val.productSkuValue] = {
                'price': val.price
            };
        })
        productSkuValue = productSkuValue.substr(0, productSkuValue.length - 1)
    }
    return keys
}