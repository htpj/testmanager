$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    var systemGrid;
    var itemSelected = {};
    var url = "json/generalLedgerImport.json";
    var colModel = [
        {name: 'accountDay', index: 'accountDay', width: 90},
        {name: 'institutionNo', index: 'institutionNo', width: 100},
        {name: 'subject', index: 'subject', width: 100},
        {name: 'curency', index: 'curency', width: 100},
        {name: 'time', index: 'time', width: 100},
        {name: 'Modify', index: 'Modify', width: 100},
        {name: 'id', key: true, hidden: true},
        {name: 'yesterday',  hidden: true},
        {name: 'yesterday1',  hidden: true},
        {name: 'today',  hidden: true},
        {name: 'today1',  hidden: true},
        {name: 'totalmon',  hidden: true},
        {name: 'totalmon1',  hidden: true},
        {name: 'totalnum',  hidden: true},
        {name: 'totalnum1',  hidden: true},
        {name: 'lastMon1',  hidden: true},
        {name: 'nowMon',  hidden: true},
        {name: 'nowMon1',  hidden: true},
        {name: 'nownum',  hidden: true},
        {name: 'nownum1',  hidden: true},
        {name: 'lastMonMon',  hidden: true},
        {name: 'lastMonMon1',  hidden: true},
        {name: 'monMon',  hidden: true},
        {name: 'lastMon22',  hidden: true},
        {name: 'lastMon23',  hidden: true},
        {name: 'lastMonMon11',  hidden: true},
        {name: 'lastMonMon12',  hidden: true},
        {name: 'lastnum22',  hidden: true},
        {name: 'lastnum23',  hidden: true},
        {name: 'lastyearMon',  hidden: true},
        {name: 'yearmon',  hidden: true},
        {name: 'lastyearMon1',  hidden: true},
        {name: 'yearmon1',  hidden: true},
        {name: 'yearnum',  hidden: true},
        {name: 'yearnum1',  hidden: true},
        {name: 'lastyearMon2',  hidden: true},
        {name: 'lastyearMon21',  hidden: true},
        {name: 'yearmon21',  hidden: true},
        {name: 'yearmon2',  hidden: true},
        {name: 'yearnum2',  hidden: true},
        {name: 'yearnum21',  hidden: true},
        {name: 'user',  hidden: true},
        {name: 'updTm',  hidden: true}
    ];
    var colNames = ['会计日', '核算机构号', '科目号','货币','时间', '操作',
    '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','',''];
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