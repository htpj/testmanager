//全局定义系统列表选中id和当前选中的页数
var businessSystemId = null, businessSystemPage = 1;/*
$("#userName1").text(localStorage.getItem("userName"));*/
// 同一个url，加载不同html以及js
function openPage(page, script) {
    if (script != undefined) {
        $("#openPageBox").load(page, function () {
            loadjscssfile(script, "js");
        });
    }
}

// tab切换方法
function tabSwitch(now, div) {
    now.find("a").addClass("active").parent().siblings().find("a").removeClass("active");
    now.parents("[data-name=" + div + "]").find(".tab-content>div").eq(now.index()).show().siblings().hide();
}

//js加载插入html页面
function loadjscssfile(filename, filetype) {
    if (filename != null && filename != undefined) {
        if (filetype == "js") { //if filename is a external JavaScript file
            var fileref = document.createElement('script')
            fileref.setAttribute("type", "text/javascript")
            fileref.setAttribute("src", filename)
        } else if (filetype == "css") { //if filename is an external CSS file
            var fileref = document.createElement("link")
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("href", filename)
        }
        if (typeof fileref != "undefined") {
            var header = document.getElementsByTagName("head")[0];
            header.appendChild(fileref)
        }
    }
}

$(function () {
    openPage($('#openPage').find('li').eq(0).attr("data-page") + ".html", $('#openPage').find('li').eq(0).attr("data-script"))
    $("#openPage").on("click", "li", function (event) {
        event.stopPropagation();
        if ($(this).find("ul").length > 0) {
            //$(this).addClass("active");
            $("#openPage li").removeClass("active");
            if ($(this).hasClass("open")) {
                $(this).find("ul").attr("style", "height: 0px;");
                $(this).find("ul").attr("aria-expanded", false);
                $(this).removeClass("open");
                $(this).find("ul").removeClass("in");
            } else {
                $(this).addClass("open");
                /*$(this).find("ul").addClass("in")*/
                $(this).find("ul").attr("aria-expanded", true);
                $(this).find("ul").attr("style", "");
                $(this).find("ul").addClass("in")
            }
        } else if ($(this).parent().parent("li").length > 0) {
            $(this).parent().parent("li").removeClass("active");
            $(this).parent().parent("li").addClass("active");
            $(this).parent().find("li").removeClass("active");
            $(this).addClass("active");
        } else {
            $("#openPage li").removeClass("open");
            $("#openPage li").removeClass("active");
            $("#itemUl").attr("style", "height: 0px;");
            $("#itemUl").attr("aria-expanded", false);
            $(this).addClass("active");
        }


        openPage($(this).attr("data-page") + ".html", $(this).attr("data-script"))
    })
    // tab切换
    $(document).on("click", "[data-name=testTab] li", function () {
        tabSwitch($(this), "testTab")
    })
    // 消息提示
    $.extend({
        alertBox: function (alertMsg, time, posiTopH) {
            if (time == undefined) {
                time = 2000;
            }
            var tempAlertBox = $('<div id="alertBox" style="min-width:200px;padding:10px 20px;background:#666;position:absolute;text-align:center;color:#fff;border-radius:4px;display:block;z-index:999999;">' + alertMsg + '</div>');
            $(tempAlertBox).appendTo('body');
            var scollHeight = $(document).scrollTop(),
                windowHeight = $(window).height(),
                windowWidth = $(window).width(),
                alertBoxWidth = $(tempAlertBox).width() + 40,
                alertBoxHeight = $(tempAlertBox).height() + 20,
                posiLeft = (windowWidth - alertBoxWidth) / 2;
            var posiTop = 0;
            if (posiTopH == undefined) {
                posiTop = (windowHeight - alertBoxHeight) / 2 + scollHeight;
            } else {
                posiTop = (windowHeight - alertBoxHeight) / 2 + scollHeight + posiTopH;
            }
            $(tempAlertBox).css({"left": posiLeft + "px", "top": posiTop + "px"});
            setTimeout("$('#alertBox').remove()", time);
        },

    });
})
//重写dialog默认将对话框内容添加到id为openPageBox元素下
$.widget("ui.dialog", $.ui.dialog, {
    _create: function () {
        this.options.appendTo = "#openPageBox";
        //alert('create');
        this._super();
        this._superApply();
    }
});
//设置ajax全局属性
/*$.ajaxSetup({
	headers:{
		accessToken:localStorage.getItem("accessToken"),//将token放到请求头中
	},
	complete:function(data){
        if(data.status == 401){
            location.href="/login.html";
        }else if(data.status == 500){
            location.href="/500.html";
        }else if(data.status == 404){
            location.href="/404.html";
        }else if(data.status == 403  ){
            location.href="/403.html";
        }
	}
});*/
//登出
$("#logout").click(function () {
    $.ajax({
        url: "/microservice/baffle/user/logout",
        type: "get",
        success: function () {
            location.href = "/login.html";
        }
    });
});

//系统设置
$("#systemSetting").click(function () {
    showPage("settingPage");
    $("#headerMenu a").removeClass("active");
});
$("#baffleManage").click(function () {
    showPage("openPage");
    $("#headerMenu a").removeClass("active");
});
//接口测试
/*$("#tdm").click(function(){
	showPage("openPage");
});*/
/*//UI自动化
$("#autoUI").click(function(){
	showPage("autoUIPage");
});
//数据统计
$("#dataStatistics").click(function(){
	showPage("dataStatisticsPage");
	$("#headerMenu a").removeClass("active");
});
//数据库测试
$("#dbTest").click(function(){
	showPage("dbTestPage");
});*/

//个人信息
var userInfoBox = "";
$("#personalInfo").click(function () {
    if (userInfoBox == "") {
        userInfoBox = document.getElementById("userInfoBox").outerHTML;
    }
    else {
        $("#hideBox").append(userInfoBox);
    }
    if ($("#userInfoBox.ui-dialog-content.ui-widget-content").length == 0) {
        //初始化弹框
        $("#userInfoBox").dialog({
            appendTo: "#hideBox",
            autoOpen: false,
            modal: true,
            height: 480,
            width: 600,
            show: {
                effect: "blind",
                duration: 1000
            },
            hide: {
                effect: "explode",
                duration: 1000
            },
            buttons: {
                "保存": function () {
                    var id = localStorage.getItem("userId");
                    var location = $("#userInfoBox  input[name=location]").val();
                    var username = $("#userInfoBox input[name=username]").val();
                    var password = $("#userInfoBox input[name=password]").val();
                    var postData = {
                        "id": id,
                        "location": location,
                        "username": username,
                    };
                    if (password != "") {
                        postData.password = password;
                    }
                    $.ajax({
                        url: "/microservice/baffle/user",
                        type: "put",
                        dataType: "json",
                        data: JSON.stringify(postData),
                        success: function (data) {
                            $.alertBox(data.message);
                            localStorage.setItem("userName", username);
                            localStorage.setItem("location", location);
                            //回显用户名
                            $("#userName").text(localStorage.getItem("userName"));
                            $("#userInfoBox").dialog("close");
                        },
                        error: function (data) {
                            data = JSON.parse(data),
                                $.alertBox(data.message);
                        }
                    });
                },
                "关闭": function () {
                    $("#userInfoBox").dialog("close");
                }
            },
            close: function () {

            }
        });
    }

    //初始化弹框信息
    $("input[name=name]").val(localStorage.getItem("name"));
    $("input[name=title]").val(localStorage.getItem("title"));
    $("input[name=location]").val(localStorage.getItem("location"));
    $("input[name=username]").val(localStorage.getItem("userName"));
    $("input[name=role]").val(localStorage.getItem("userRole"));
    $("#userInfoBox").dialog("open");
});

//headerMenu切换效果
$("#headerMenu").on("click", "a", function () {
    if ($(this).hasClass("active")) {
        return;
    } else {
        $("#headerMenu a").removeClass("active");
        $(this).addClass("active");
    }
})

//显示指定页面
function showPage(page) {
    $("#autoUIPage").hide();
    $("#openPage").hide();
    $("#settingPage").hide();
    $("#dbTestPage").hide();
    $("#dataStatisticsPage").hide();

    $("#" + page).show();
    $("#" + page).on("click", "li", function () {
        if ($(this).hasClass("active")) {
            return;
        } else {
            $("#" + page + " li").removeClass("active");
            $(this).addClass("active");
        }
        openPage($(this).attr("data-page") + ".html", $(this).attr("data-script"));
    });

    $("#" + page + " li").removeClass("active");
    $("#" + page).find("li").eq(0).addClass("active");
    openPage($('#' + page).find('li').eq(0).attr("data-page") + ".html", $('#' + page).find('li').eq(0).attr("data-script"));
}


function confirmBox(title, content, actionFun) {
    $.confirm({
        title: title,//'提示!',
        content: content,//'该模拟系统的数据库配置有误，请重新配置！',
        icon: 'fa fa-info',
        type: 'red',
        autoClose: 'cancel|8000',
        buttons: {
            ok: {
                text: '确定',
                btnClass: 'btn-info-outline',
                keys: ['enter'],
                action: actionFun
            },
            cancel: {
                text: "取消",
                btnClass: 'btn-info-outline',
                keys: ['esc'],
                action: function () {

                }
            }
        }
    });
}

//抽象发送Ajax
function ajaxFunction(url, type, data, successFunction) {
    $.ajax({
        url: url,
        type: type,
        /*async: true,*/
        dataType: "JSON",
        data: data,
        success: successFunction,
        error: function () {
            $.alertBox("访问出错");
        }
    });
}


function initGrid(url, gridId, colModel, colNames, onSelectRowFunction, gridCompleteFunction) {
    if(url == null || url == ''){
        url='json/generalCheckSubject.json';
    }
    var systemGrid = $("#"+gridId).jqGrid({
        url: url,
        editurl: 'clientArray',
        mtype: "GET",
        datatype: "json",
        page: businessSystemPage,
        colNames: colNames,
        colModel: colModel,
        height: '100%',
        rowNum: 10,
        rownumWidth: 25,
        autowidth: true,
        pager: "#"+gridId+"Pager",
        /*jsonReader: {
            root: "data", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
            page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
            total: "totalpages",//总的页数
            records: "total"//总记录数
        },*/
        gridComplete: gridCompleteFunction,
        onSelectRow: onSelectRowFunction,
        loadComplete: function () { // 加载数据
            var records = $("#"+gridId).getGridParam('records');
            if (records == 0 || records == null) {
                $("#"+gridId).before('<div class="jq-grid-tip">没有相关数据</div>')
            }
            if (businessSystemId != null) {
                if(gridId == "appConGrid" || gridId == "jqGridSystem" || gridId == "appGrid" || gridId == "jqGrid"){
                    $("#"+gridId).setSelection(businessSystemId)

                }
            }
            setSameHeights();
        }
    });
    return systemGrid;
}
