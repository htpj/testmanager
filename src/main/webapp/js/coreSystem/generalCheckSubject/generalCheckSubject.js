$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    var systemGrid, resourcesGrid;
    var itemSelected = {};

    var colModel = [
        {name: 'subjectNo', index: 'subjectNo', width: 90},
        {name: 'subjectLevel', index: 'subjectLevel', width: 100},
        {name: 'isCheck', index: 'isCheck', width: 100},
        {name: 'Modify', index: 'Modify', width: 100},
        {name: 'id', key: true, hidden: true}
    ];
    var colNames = ['科目号', '科目级别', '是否参加总分核对', '操作', ''];
    systemGrid = initGrid(null,"jqGridSubject",colModel, colNames,
        function (id) {
            businessSystemId = id;
            businessSystemPage = systemGrid.getGridParam("page");
        },
        function () {
                var ids = systemGrid.getDataIDs();
                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    var modify = '<button type="button" data-id="' + id + '" data-btn="upd" class="btn btn-info-outline">修改</button>&nbsp;'
                        + '<button type="button" data-id="' + id + '" data-btn="del" class="btn btn-info-outline">删除</button>';
                    systemGrid.setRowData(ids[i], {Modify: modify});
                }

        }
    );

    //模拟系统名称查询
    $("#querySystemBtn").on("click", function () {
        reloadSystemGrid();
    });

    //重新加载
    function reloadSystemGrid() {
        var subjectNo = $("#subjectNoQuery").val() == undefined ? '' :$("#subjectNoQuery").val()
        systemGrid.clearGridData().prev().remove();  // 清空数据
        systemGrid.setGridParam({  // 重新加载数据
            mtype: "GET",
            datatype: "json",
            url: 'json/generalCheckSubject.json?subjectNo='+subjectNo,
            page: 1
        }).trigger("reloadGrid");
    }

    //修改
    systemGrid.on("click", "[data-btn=upd]", function () {
        var id = $(this).attr("data-id");
        addSubjectBox.attr("data-id", id);
        systemGrid.setSelection(id);
        var rowData = systemGrid.getRowData(id);
        $("#addSubjectBox input[name=subjectNo]").val(rowData.subjectNo);
        $("#addSubjectBox input[name=subjectLevel]").val(rowData.subjectLevel);
        $("#addSubjectBox select[name=isCheck]").val(rowData.isCheck);
        $(window).resize();
        addSubjectBox.dialog("open");
    });

    //删除
    systemGrid.on("click", "[data-btn=del]", function () {
        confirmBox("是否确定删除?", "温馨提示!",
            function () {
                systemGrid.delRowData(systemGrid.getGridParam("selrow"));
            })
    })

    // 弹窗
    var addSubjectBox;
    $("#addBtn").click(function () {
        addSubjectBox.children()[0].reset();//重置弹窗
        itemSelected = {};
        $(window).resize();
        addSubjectBox.dialog("open");
    });
    addSubjectBox = $("#addSubjectBox").dialog({
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
                if(!$("#addSubjectBox input[name=subjectNo]").val() || !$("#addSubjectBox input[name=subjectLevel]").val() ){
                    $.alertBox("数据格式有误，请修正后再保存");
                    return;
                }
                var id = $(this).attr("data-id");
                var subjectNo = $("#addSubjectBox input[name=subjectNo]").val();
                var subjectLevel = $("#addSubjectBox input[name=subjectLevel]").val();
                var isCheck = $("#addSubjectBox select[name=isCheck]").val();

                var  dataRow = {
                    "id": id,
                    "subjectNo": subjectNo,
                    "subjectLevel": subjectLevel,
                    "isCheck": isCheck
                };
                var ajaxType = "PUT";
                if (id == "" || id == null || id == undefined) {//新增
                    ajaxType = "POST";
                    dataRow.id =  createNodeId();
                    systemGrid.addRowData(dataRow.id , dataRow);
                }else{
                    systemGrid.setRowData(id , dataRow);
                }
                addSubjectBox.dialog("close");
            },
            "取消": function () {
                addSubjectBox.dialog("close");
            }
        },
        close: function () {
        }
    });

    //生成节点id,时间戳+0到4位随机数生成id
    function createNodeId() {
        var a = Math.random, b = parseInt;
        var newRowId = Number(new Date()).toString() + b(1000 * a());
        return newRowId;
    }
});