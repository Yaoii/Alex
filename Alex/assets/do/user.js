$('#avator').html('<div class="avatar-box">' +
    '<label for="userImageUpload">' +
    '<img src="' + userinfo.photo + '" alt="" id="headUrl">' +
    '<span>编辑头像</span>' +
    '</label>' +
    '<input type="file" name="file" id="userImageUpload" accept="image/*"  style="display: none;">' +
    '</div>' +
    '<div class="personal-info">' +
    '<a>' + userinfo.name + '</a>' +
    '</div>')

//修改头像
function saveHeadimg(res) {
    $('#headUrl').attr('src', res)
    $post(USER + 'updateUserInfo', {
        headImage: res,
        updateType: 1
    }, function (res) {
        webToast('头像修改成功')
    })
}

//图像上传
$('#userImageUpload').fileupload({
    url: frontContextPath + "/file/uploadImage.do",
    type: 'POST',
    formData: null,
    change: function (e, data) {
        var file = data.files[0];
        if (file.size > 2 * 1024 * 1024) {
            layer.msg(file.name + " 文件大小超过2M,请重新选择");
            return false;
        }
        // 开头为image/
        var reg = /^image\//
        if (!reg.test(file.type)) {
            layer.msg(file.name + " 不是图片格式");
            return false;
        }
        layer.load(3)
    },
    done: function (e, response) { //设置文件上传完毕事件的回调函数        
        layer.closeAll('loading')
        alert('111') 
        if (true) {
            $('#headUrl').attr('src', response.result.data.fullUrl)
            updateUserInfo(response.result.data.relativePath)
        }       
    },
});
//更新用户信息
function updateUserInfo(photo) {
    $.post(frontContextPath + '/user/userInfo/updateUserInfo.do?photo=' + photo, function (res) {        
        if(res.responeCode=='0'){
            getUserInfo()
        }
    })
}

