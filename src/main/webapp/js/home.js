$(document).ready(function () {
    // Handler for .ready() called.
//	showPage("settingPage");
//	$("#headerMenu a").removeClass("active");
    queryMenu();
});

function addMenu(menu, parentId) {

    if (menu.child != null && menu.child.length > 0) {
        var eli = "<li isLeaf=false><a href=\"javascript:;\"> <i class=\"fa fa-user\"></i>"
            + menu.name + "<i class=\"fa arrow\"></i></a>"
            + "<ul class=\"sidebar-nav collapse \" id=\"" + menu.id + "\"></ul></li>";
        $("#" + parentId).append(eli);
        for (var i = 0; i < menu.child.length; i++) {
            addMenu(menu.child[i], menu.id);
        }
    } else {
        var eli = "<li class='active' data-page=\"" + menu.dataPage + "\" data-script=\""
            + menu.dataScript + "\" isLeaf=true>"
            + "<a href=\"javascript:;\"> <i class=\"fa\"></i>"
            + menu.name + "</a></li>";
        $("#" + parentId).append(eli);
    }
}
function onClickBind(menuId) {
    $("#" + menuId).on("click", "li", function (event) {
        if ($(this).attr("isLeaf") == "true") {
            openPage($(this).attr("data-page") + ".html", $(this).attr("data-script"))
        } else {
            var liClass = $(this).attr("class");
            console.log("菜单："+liClass);
            if (liClass && liClass.indexOf("open") >= 0) {
                $(this).removeClass("open");
                $(this).children("a").attr("aria-expanded", false);
                $(this).children("ul").removeClass("in");
                $(this).children("ul").attr("aria-expanded", false);
            } else {
                $(this).addClass("open");
                $(this).children("a").attr("aria-expanded", true);
                $(this).children("ul").addClass("in");
                $(this).children("ul").attr("aria-expanded", true);
            }
        }
        event.stopPropagation();    //  阻止事件冒泡

    });

}
function queryMenu() {
    $.getJSON("json/home.json", function (data) {

        for (var i = 0; i < data.length; i++) {
            addMenu(data[i], "testTaskPage");
        }
        onClickBind("testTaskPage");
        // settingPage("settingPage");
    });


    // $.ajax({
    // url:"/microservice/baffle/user/login",
    // type:"post",
    // data:JSON.stringify(data),
    // success: function(data){
    // data=JSON.parse(data);
    // if(data.code=="success"){
    // localStorage.setItem("accessToken",data.accessToken);
    // localStorage.setItem("userId",data.userId);
    // localStorage.setItem("userName",data.userName);
    // localStorage.setItem("userRole",data.userRole);
    // localStorage.setItem("name",data.name);
    // localStorage.setItem("location",data.location);
    // localStorage.setItem("title",data.title);
    // location.href="index.html";
    // $("#userName1").text(data.userName);
    // }
    // else{
    // alert(data.message);
    // }
    // },
    // error: function(data){
    // alert("访问出错！");
    // }
    // });
}

// $("#btLogin").click(function() {
// if ($("#username").val() != "" && $("#password").val() != "") {
// login();
// } else {
// alert("用户名或密码不能为空");
// }
// })
//
// $("#username").keypress(function(event) {
// if (event.which == 13) {
// $("#password").focus();
// }
// });
// $("#password").keypress(function(event) {
// if (event.which == 13) {
// if ($("#username").val() != "" && $("#password").val() != "") {
// login();
// } else {
// alert("用户名或密码不能为空");
// }
// }
// });
