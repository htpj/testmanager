$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    var systemGrid;
    var itemSelected = {};
    var url = "json/subjectParamCheck.json";
    var colModel = [
        {name: 'subjectNo', index: 'subjectNo', width: 90},
        {name: 'engNm', index: 'engNm', width: 100},
        {name: 'chineseName', index: 'chineseName', width: 100},
        {name: 'subjectStatus', index: 'subjectStatus', width: 100},
        {name: 'time', index: 'time', width: 100},
        {name: 'Modify', index: 'Modify', width: 100},
        {name: 'id', key: true, hidden: true},
        {name: 'subjectType',  hidden: true},
        {name: 'accountType',  hidden: true},
        {name: 'accountFlag',  hidden: true},
        {name: 'subjectLevel',  hidden: true},
        {name: 'redBalanceFlg',  hidden: true},
        {name: 'parentSubject',  hidden: true},
        {name: 'segmentValue',  hidden: true},
        {name: 'bookkeepingMethod',  hidden: true},
        {name: 'autogenerategeneralLedgerFlg',  hidden: true},
        {name: 'detailedSubjectFlg',  hidden: true},
        {name: 'foreignExchangeRevaluation',  hidden: true},
        {name: 'mainAccountNo',  hidden: true},
        {name: 'balanceSeroMark',  hidden: true},
        {name: 'balanceDirection',  hidden: true},
        {name: 'subjectStatus',  hidden: true},
        {name: 'manualAccounting',  hidden: true}
    ];
    var colNames = ['科目号', '科目英文名', '科目中文名','科目状态','时间', '操作', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    systemGrid = initGrid(url,"jqGridSubject",colModel, colNames,
        function (id) {

        },
        function () {
            var ids = systemGrid.getDataIDs();
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                var modify = '<button type="button" data-id="' + id + '" data-btn="upd" class="btn btn-info-outline">查看</button>&nbsp;';
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

        $("#addSubjectForm input").each(function(index, element) {
           $(this).val(rowData[element.name]);
        });

        $("#addSubjectForm select").each(function(index, element) {
           $(this).val(rowData[element.name]);
        });

        $(window).resize();
        addSubjectBox.dialog("open");
    });

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