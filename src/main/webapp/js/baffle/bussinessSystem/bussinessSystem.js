$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    var systemGrid, resourcesGrid;
    var itemSelected = {};
    var userRole = localStorage.getItem("userRole");
    $("#userName").text(localStorage.getItem("userName"));
    if (userRole != "administrator" && userRole != "TestManager") {
    	$("#addSystemBtn").css({ "display": "none" });
        $("#systemSetting").css({ "display": "none" });
    }

    var colModel = [
        {name: 'baffleAppName', index: 'baffleAppName', width: 90},
        {name: 'mode', index: 'mode', width: 100,
            formatter: function (value, options, rowdata) {
                if(value == "0"){
                    value = "同步"
                }else if(value == "1"){
                    value = "同步异步双支持"
                }
                return value;
            }
         },
        {name: 'baffleAppDesc', index: 'baffleAppDesc', width: 100},
        {name: 'baffleAppRemark', index: 'baffleAppRemark', width: 80},
        {name: 'Modify', index: '操作', width: 80},
        {name: 'mode',  hidden: true},
        {name: 'id', key: true, hidden: true}
    ];
    var colNames = ['系统名称', '挡板类型', '描述', '备注', '操作', '', ''];
    systemGrid = initGrid(null,"jqGridSystem",colModel, colNames,
        function (id) {
            businessSystemId = id;
            businessSystemPage = systemGrid.getGridParam("page");
        },
        function () {
            if (userRole == "administrator" || userRole == "TestManager") {
                var ids = systemGrid.getDataIDs();
                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    var modify;
                    modify = '<button type="button" data-id="' + id + '" data-btn="upd" class="btn btn-info-outline">修改</button>&nbsp;'
                        + '<button type="button" data-id="' + id + '" data-btn="del" class="btn btn-info-outline">删除</button>';
                    systemGrid.setRowData(ids[i], {Modify: modify});
                }
            }

        }
    );

    //模拟系统名称查询
    $("#querySystemBtn").on("click", function () {
        reloadSystemGrid();
    });

    //重新加载
    function reloadSystemGrid() {
        var baffleAppName = $("#applicationNameQuery").val() == undefined ? '' :$("#applicationNameQuery").val()
        systemGrid.clearGridData().prev().remove();  // 清空数据
        systemGrid.setGridParam({  // 重新加载数据
            mtype: "GET",
            datatype: "json",
            url: '/microservice/baffle/applications?baffleAppName='+ baffleAppName,
            page: 1
        }).trigger("reloadGrid");
    }

    //修改
    systemGrid.on("click", "[data-btn=upd]", function () {
        var id = $(this).attr("data-id");
        addSystemDialog.attr("data-id", id);
        systemGrid.setSelection(id);
        var rowData = systemGrid.getRowData(id);
        $("#addSystemBox input[name=applicationName]").val(rowData.baffleAppName);
        $("#addSystemBox textarea[name=applicationDescription]").val(rowData.baffleAppDesc);
        $("#addSystemBox textarea[name=remark]").val(rowData.baffleAppRemark);
        $("#addSystemBox select[name=mode]").val(rowData.mode);
        itemSelected = {};
        loadResources(id);
        $(window).resize();
        addSystemDialog.dialog("open");
    });

    //删除
    systemGrid.on("click", "[data-btn=del]", function () {
        confirmBox("是否确定删除?", "温馨提示!",
            function () {
                $.ajax({
                    url: "/microservice/baffle/application?applicationId=" + systemGrid.getGridParam("selrow"),
                    type: "delete",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        if(data.code == 'success'){
                            reloadSystemGrid();
                        }
                        $.alertBox(data.message);
                    },
                    error: function () {
                        $.alertBox("访问出错");
                    }
                });
            })
    })

    // 弹窗
    var addSystemDialog;
    $("#addSystemBtn").click(function () {
        addSystemDialog.children()[0].reset();//重置弹窗
        resourcesGrid.resetSelection();
        itemSelected = {};
        $(window).resize();
        addSystemDialog.dialog("open");
    });
    addSystemDialog = $("#addSystemBox").dialog({
        autoOpen: false,
        modal: true,
        height: 580,
        width: "50%",
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
                if(!$("#addSystemBox select[name=mode]").val() || $("#addSystemBox select[name=mode]").val() == "-1"){
                    $.alertBox("请先选择挡板类型再进行保存操作");
                    return;
                }
                var id = $(this).attr("data-id");
                var applicationName = $("#addSystemBox input[name=applicationName]").val();
                var mode = $("#addSystemBox select[name=mode]").val();
                var applicationDescription = $("#addSystemBox textarea[name=applicationDescription]").val();
                var remark = $("#addSystemBox textarea[name=remark]").val();

                var url = "/microservice/baffle/application";
                var ajaxType = "PUT";
                if (id == "" || id == null || id == undefined) {//新增
                    ajaxType = "POST";
                }
                //获取选中的资源id
                var resources = [];
                var selrowIds = resourcesGrid.getGridParam("selarrrow");
               $.each(itemSelected,function(index,value){
                   if(value != null){
                       resources.push({
                           "applicationId":systemGrid.getGridParam("selrow"),
                           "userId":value
                       });
                   }
               });
               var  dataRow = {
                    "id": id,
                    "baffleAppName": applicationName,
                    "baffleAppDesc": applicationDescription,
                    "mode": mode,
                    "baffleAppRemark": remark,
                    "resources":resources
                };
                ajaxFunction(url,ajaxType,JSON.stringify(dataRow),
                    function (data) {
                        $("#applicationNameQuery").val('');
                        reloadSystemGrid();
                        addSystemDialog.attr("data-id", "");
                        $.alertBox(data.message);
                        if(data.code == "success"){
                            addSystemDialog.dialog("close")
                        }
                    });
            },
            "取消": function () {
                addSystemDialog.dialog("close")
            }
        },
        close: function () {
        }
    });

    resourcesGrid = $("#jqGridResources").jqGrid({
        url: '/microservice/baffle/user?queryType=0&id='+ localStorage.getItem("userId") ,
        editurl: 'clientArray',
        mtype: "GET",
        datatype: "json",
        page: 1,
        colNames: ['', '姓名', '职称', '角色'],
        colModel: [
            {name: 'id', index: 'id', key: true, hidden: true},
            {name: 'name', index: 'name'},
            {name: 'title', index: 'title'},
            {name: 'roleName', index: 'roleName'}
        ],
        viewrecords: true,
        multiselect: true,
        rowNum: 10,
        //rownumWidth: 25,
        height: 300,
        autowidth: true,
        pager: "#jqGridPagerResources",
        jsonReader: {
            root: "data", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
            page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
            total: "totalpages",//总的页数
            records: "total"//总记录数
        },
        gridComplete: function () {
            $.each(itemSelected, function (index, value) {
                if (value != null) {
                    resourcesGrid.setSelection(value, true);
                }
            });
        },
        onSelectRow: function (rowid, status) {
            if (status) {
                itemSelected[rowid] = rowid;
            } else {
                $.each(itemSelected, function (index, value) {
                    if (value == rowid) {
                        itemSelected[rowid] = null;
                    }
                });

            }
        },
        onSelectAll: function (aRowids, status) {
            if (status) {
                for (var i = 0; i < aRowids.length; i++) {
                    itemSelected[aRowids[i]] = aRowids[i];
                }
            } else {
                itemSelected = {};
            }
        },
        loadComplete: function () { // 加载数据
            var re_records = resourcesGrid.getGridParam('records');
            if (re_records == 0 || re_records == null) {
                resourcesGrid.before('<div class="jq-grid-tip">没有相关数据</div>')
            }
            setSameHeights();
        }
    });

    //加载模拟系统对应的资源
    function loadResources(appId) {
        $.ajax({
            url: "/microservice/baffle/user/queryuserhasapplication?userId="+ localStorage.getItem("userId") +"&applicationId=" + appId,
            type: "get",
            dataType: "json",
            async: true,
            success: function (data) {
                resourcesGrid.resetSelection();
                data = data.data;
                for (var i = 0; i < data.length; i++) {
                    resourcesGrid.setSelection(data[i].userId, true);
                    itemSelected[data[i].userId] = data[i].userId;
                }
            },
            error: function () {
                 $.alertBox("访问出错");
            }
        });
    }
});