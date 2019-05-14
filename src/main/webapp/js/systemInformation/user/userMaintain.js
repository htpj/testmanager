$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    
    var userGrid;
    var basicUrl="/microservice/baffle/user";
    var roleUrl="/microservice/baffle/role";
    userGrid = $("#jqGridUser").jqGrid({
    	url:basicUrl,
    	editurl: 'clientArray',
    	mtype:"GET",
    	datatype:"json",
    	page:1,
    	colNames:['用户ID','姓名','用户名','','角色','','职称','地址','操作'],
    	colModel:[
    		{name: 'id', index: 'id', width: 90,key:true},
    		{name: 'name', index: 'name', width: 90},
    		{name: 'username',index: 'username',width: 90},
    		{name: 'password', index: 'password', hidden: true},
    		{name: 'roleName', index: 'roleName', width: 90},
    		{name: 'roleId', index: 'roleId', hidden: true},
    		{name: 'title', index: 'title', width: 90},
    		{name: 'location', index: 'location', width: 90},
    		{name: 'operation',index: 'operation',width: 100}
    	],
    	viewrecords:true,
    	height: 385,
        rowNum: 10,
       /* rowList: [10, 30, 50],*/
        rownumWidth: 25,
        autowidth: true,
    	pager:'jqGridPagerUser',
    	jsonReader: {
            root: "data", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
            page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
            total: "totalpages",//总的页数
            records: "total"//总记录数
        },
        gridComplete: function () {
            var ids = userGrid.getDataIDs();
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i]
                var operation = '<button type="button" data-id="' + id + '" data-btn="upd" class="btn btn-info-outline">修改</button> '
                    + '<button type="button" data-id="' + id + '" data-btn="del" class="btn btn-info-outline">删除</button>';
                userGrid.setRowData(ids[i], {operation: operation});
            }
        },
        loadComplete: function () { // 加载数据
            var re_records = userGrid.getGridParam('records');
            if (re_records == 0 || re_records == null) {
            	userGrid.before('<div class="jq-grid-tip">没有相关数据</div>')
            }
            setSameHeights();
        }
    });
    
    //重新加载表格
    function reloadGrid(){
    	var name = $("#nameQuery").val();
    	var userName = $("#userNameQuery").val();
    	userGrid.clearGridData().prev().remove();  // 清空数据
        userGrid.setGridParam({  // 重新加载数据
            mtype: "GET",
            datatype: "json",
            url: basicUrl +"?name="+name+ "&userName="+userName
        }).trigger("reloadGrid");
    }
    
    //根据角色名称查询角色相关信息
    $("#queryUserBtn").click(function(){
    	reloadGrid();
    });
    
    var addUserDailog = $("#addUserBox").dialog({
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
            "确定": function () {
            	if($("select[name=role]").val() == "-1"){
                    $.alertBox("请选择角色类型！");
                    return;
                }
            	var roleName=$("select[name=role]").find("option:selected").text();
            	var roleId=$("select[name=role]").val();
            	if(roleId=="-1"){
            		roleName=null;
            		roleId=null;
            	}
            	var dataRow={
            		/*"id":id,*/
            		"name":$("input[name=name]").val(),
            		"title":$("input[name=title]").val(),
            		"role":roleName,
            		"location":$("input[name=location]").val(),
            		"username":$("input[name=username]").val(),
            		"password":$("input[name=password]").val(),
            		"roleId":roleId
            	};
                var id = addUserDailog.attr("data-id");
            	var requestType = "POST";
            	if(id ==null || id ==""){
                    requestType = "POST";
            	}
            	else{
                    dataRow["id"] = id;
            		requestType="PUT";
            	}
            	$.ajax({
            		url:basicUrl,
            		type:requestType,
            		data:JSON.stringify(dataRow),
            		success: function(data){
            			data=JSON.parse(data);
            			$.alertBox(data.message);
            			if(data.code=="success"){
            				reloadGrid();
            				addUserDailog.dialog("close");
            			}
            		},
            		error: function(data){
            			data = JSON.parse(data);
            			$.alertBox(data.message);
            		}
            	});
            },
            "取消": function () {
            	addUserDailog.dialog("close");
            }
        },
        close: function () {
        }
    });
    
    //加载角色，设置select
    function loadRole(roleId){
    	$.ajax({
    		url:roleUrl,
    		type:"GET",
    		dataType:"json",
    		async: true,
    		success: function(data){
    			data = data.data;
    			$("select[name=role]").empty();
    			$("select[name=role]").append(' <option value="-1">请选择角色</option>');
    			if(data != null && data.length > 0){
                    for(var i=0;i<data.length;i++){
                        var option='<option value="'+data[i].id+'">'+data[i].name+'</option>';
                        $("select[name=role]").append(option);
                    }
                    if(roleId!=null&&roleId!=""){
                        $("select[name=role]").val(roleId);
                    }
                }

    			//打开添加用户的对话框
    			addUserDailog.dialog("open");
    		},
    		error: function(data){
    			$.alert("请求失败");
    		}
    	});
    }
    
    //新增用户
    $("#addUserBtn").click(function(){
    	addUserDailog.attr("data-id","");
    	addUserDailog.children()[0].reset();//清空弹窗
    	loadRole("");  //加载角色
    	addUserDailog.dialog("open");
    })
    
    //删除用户
    userGrid.on("click","[data-btn=del]",function(){
    	var id=$(this).attr("data-id");
        $.confirm({
            title: '是否确定删除?',
            content: '请谨慎操作!',
            type: 'blue',
            icon: 'fa fa-warning',
            autoClose: 'cancel|8000',
            buttons: {
                ok: {
                    text: "确定",
                    btnClass: 'btn-danger-outline',
                    keys: ['enter'],
                    action: function () {
	                    	$.ajax({
	                		url:basicUrl+"?id="+id,
	                		type:"DELETE",
	                		dataType:"json",
	                		success: function(data){
	                			$.alertBox(data.message);
	                			reloadGrid();
	                		},
	                		error: function(data){
	                			$.alertBox(data.message);
	                		}
	                	});
                    }
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
    });
    
    //修改用户相关信息
    userGrid.on("click","[data-btn=upd]",function(){
    	var rowData = userGrid.getRowData($(this).attr("data-id"));
    	addUserDailog.attr("data-id",rowData.id);
    	addUserDailog.dialog("open");
    	$("input[name=name]").val(rowData.name);
		$("input[name=title]").val(rowData.title);
		$("input[name=location]").val(rowData.location);
		$("input[name=username]").val(rowData.username);
		$("input[name=password]").val(rowData.password);
		loadRole(rowData.roleId);//加载角色
    });
});