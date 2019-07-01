function login(){
	var username = $("#username").val();
	var password = $("#password").val();
	var data={"username":username,"password":password};
    location.href="index.html";
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
	//		}
	//	});
}

$("#btLogin").click(function(){
	if($("#username").val()!="" && $("#password").val()!=""){
		login();
	}
	else{
		alert("用户名或密码不能为空");
	}
})

$("#username").keypress(function(event){
	if(event.which==13){
		$("#password").focus();
	}
});
$("#password").keypress(function(event){
	if(event.which==13){
		if($("#username").val()!="" && $("#password").val()!=""){
			login();
		}
		else{
			alert("用户名或密码不能为空");
		}
	}
});