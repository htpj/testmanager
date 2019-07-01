$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';

    var roleGrid;
    var basicUrl = "/json/tm/task/testtask.json";
    //初始化表格
    roleGrid = $("#jqGridRole").jqGrid({
        url: basicUrl,
        editurl: 'clientArray',
        mtype: "GET",
        datatype: "json",
        page: 1,
        colNames: ['', '任务编号', '任务名称', '测试经理', '测试技术经理', '项目经理', '操作'],
        colModel: [
            {name: 'radio', index: 'radio', width: 48},
            {name: 'taskNo', index: 'taskNo', width: 90, key: true},
            {name: 'taskName', index: 'taskName', width: 90},
            {name: 'testManager', index: 'testManager', width: 90},
            {name: 'testTechManager', index: 'testTechManager', width: 100},
            {
                name: 'type', index: 'type', width: 90,
                formatter: function (value, options, rowdata) {
                    if (value != null) {
                        value = (value == "00" ? "查看角色" : "增删改查角色");
                    } else {
                        value = "";
                    }
                    return value;
                }
            },
            {name: 'operation', index: 'operation', width: 100}
        ],
        viewrecords: true,
        height: 385,
        rowNum: 10,
        /* rowList: [10, 30, 50],*/
        rownumWidth: 25,
        autowidth: true,
        pager: 'jqGridPagerRole',
        jsonReader: {
            root: "rows", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
            page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
            total: "totalpages",//总的页数
            records: "total"//总记录数
        },
        gridComplete: function () {
            var ids = roleGrid.getDataIDs();
            console.log("数据ID：" + ids);
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                var operation = '<button type="button" data-id="' + id + '" data-btn="upd" class="btn btn-info-outline">修改</button> '
                    + '<button type="button" data-id="' + id + '" data-btn="del" class="btn btn-info-outline">删除</button>';
                roleGrid.setRowData(ids[i], {operation: operation});
                var radioEl = '<div><label><input class="radio" type="radio" name="radios" ><span></span></label></div>';
                roleGrid.setRowData(ids[i], {radio: radioEl});
            }

        },
        loadComplete: function () { // 加载数据
            console.log("加载完成");
            var re_records = roleGrid.getGridParam('records');
            if (re_records == 0 || re_records == null) {
                roleGrid.before('<div class="jq-grid-tip">没有相关数据</div>')
            }
            setSameHeights();
            // console.log($("#jqGridRole").find("tr[role='row']").length);
            // console.log(roleGrid.find("tr[role=row]"));
        }
    });

    //重新加载表格
    function reloadGrid() {
        var roleName = $("#roleNameQuery").val();
        roleGrid.clearGridData().prev().remove();  // 清空数据
        roleGrid.setGridParam({  // 重新加载数据
            mtype: "GET",
            datatype: "json",
            url: basicUrl + "?name=" + roleName,
            page: 'jqGridPagerRole'
        }).trigger("reloadGrid");
    }

    //根据角色名称查询角色相关信息
    $("#queryRoleBtn").click(function () {
        reloadGrid();
    });

    var addRoleDailog = $("#addRoleBox").dialog({
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
                if ($("select[name=type]").val() == "-1") {
                    $.alertBox("请选择角色类型！");
                    return;
                }

                var dataRow = {

                    "name": $("#roleName").val(),
                    "type": $("select[name=type]").val(),
                    "description": $("#description").val(),
                };
                var requestType;
                var id = addRoleDailog.attr("data-id");
                if (id == null || id == "") {
                    requestType = "POST";
                }
                else {
                    requestType = "PUT";
                    dataRow["id"] = id;
                }

                $.ajax({
                    url: basicUrl,
                    type: requestType,
                    dataType: "json",
                    data: JSON.stringify(dataRow),
                    success: function (data) {
                        $.alertBox(data.message);
                        if (data.code == "success") {
                            reloadGrid();
                            addRoleDailog.dialog("close");
                        }
                    },
                    error: function (data) {
                        $.alertBox(data.message);
                    }
                });
            },
            "取消": function () {
                addRoleDailog.dialog("close");
            }
        },
        close: function () {
        }
    });

    //新增角色
    $("#addRoleBtn").click(function () {
        addRoleDailog.children()[0].reset();//清空弹窗
        addRoleDailog.attr("data-id", "");
        addRoleDailog.dialog("open");
    });

    //删除角色
    roleGrid.on("click", "[data-btn=del]", function () {
        var id = $(this).attr("data-id");
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
                        roleGrid.delRowData(id);
                        $.ajax({
                            url: basicUrl + "?id=" + id,
                            type: "DELETE",
                            dataType: "json",
                            success: function (data) {
                                $.alertBox(data.message);
                                reloadGrid();
                            },
                            error: function (data) {
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

    //修改角色
    roleGrid.on("click", "[data-btn=upd]", function () {
        addRoleDailog.attr("data-id", $(this).attr("data-id"));
        var rowData = roleGrid.getRowData($(this).attr("data-id"));
        var type = (rowData.type == "查看角色" ? "00" : "01");
        $("#roleName").val(rowData.name);
        $("select[name=type]").val(type);
        $("#description").val(rowData.description);
        addRoleDailog.dialog("open");
    });
    //修改角色
    roleGrid.on("click", "tr[role=row]", function () {
        console.log("...");
        var $radio = $(this).find("input[type=radio]").first();
        var checked = $radio.attr("checked");

        if (checked || checked == "checked") {
            $radio.removeAttr("checked");
        } else {
            $radio.attr("checked", "checked");
        }
    });


});