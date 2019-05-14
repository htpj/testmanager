$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    var systemGrid;
    var itemSelected = {};
    var url = "json/transactionSubpoenaHistoryCheck.json";
    var colModel = [
        {name: 'accountingDay', index: 'subjectNo', width: 90},
        {name: 'voucherNo', index: 'engNm', width: 100},
        {name: 'orderNo', index: 'chineseName', width: 100},
        {name: 'processingBatchNo', index: 'subjectStatus', width: 100},
        {name: 'time', index: 'time', width: 100},
        {name: 'Modify', index: 'Modify', width: 100},
        {name: 'id', key: true, hidden: true},
        {name: 'logNo',  hidden: true},
        {name: 'system',  hidden: true},
        {name: 'txnCode',  hidden: true},
        {name: 'txnCode1',  hidden: true},
        {name: 'txnDate',  hidden: true},
        {name: 'txnTm',  hidden: true},
        {name: 'txnBank',  hidden: true},
        {name: 'txnAccount',  hidden: true},
        {name: 'txnUser',  hidden: true},
        {name: 'terminalNo',  hidden: true},
        {name: 'channelNo',  hidden: true},
        {name: 'correctFlg',  hidden: true},
        {name: 'oriTxnDate',  hidden: true},
        {name: 'oriSummonsNo',  hidden: true},
        {name: 'onlineUpdateFlag',  hidden: true},
        {name: 'txnType',  hidden: true},
        {name: 'isManualSubpoena',  hidden: true},
        {name: 'date1',  hidden: true},
        {name: 'systemNo1',  hidden: true},
        {name: 'sysKey',  hidden: true},
        {name: 'type',  hidden: true},
        {name: 'no1',  hidden: true},
        {name: 'subjectNo',  hidden: true},
        {name: 'currency',  hidden: true},
        {name: 'isCredit',  hidden: true},
        {name: 'money',  hidden: true},
        {name: 'date2',  hidden: true},
        {name: 'fileType',  hidden: true},
        {name: 'productType',  hidden: true},
        {name: 'no3',  hidden: true},
        {name: 'no4',  hidden: true},
        {name: 'mainNo',  hidden: true},
        {name: 'type4',  hidden: true},
        {name: 'type5',  hidden: true},
        {name: 'no5',  hidden: true},
        {name: 'mianNo2',  hidden: true},
        {name: 'no8',  hidden: true},
        {name: 'no9',  hidden: true},
        {name: 'redType',  hidden: true},
        {name: 'no10',  hidden: true},
        {name: 'no11',  hidden: true},
        {name: 'type11',  hidden: true},
        {name: 'type12',  hidden: true},
        {name: 'type13',  hidden: true},
        {name: 'type33',  hidden: true},
        {name: 'type14',  hidden: true},
        {name: 'type15',  hidden: true},
        {name: 'type16',  hidden: true},
        {name: 'type17',  hidden: true},
        {name: 'type18',  hidden: true},
        {name: 'type19',  hidden: true},
        {name: 'type20',  hidden: true},
        {name: 'type21',  hidden: true},
        {name: 'type22',  hidden: true},
        {name: 'type23',  hidden: true},
        {name: 'type24',  hidden: true},
        {name: 'type25',  hidden: true},
        {name: 'type26',  hidden: true},
        {name: 'type27',  hidden: true},
        {name: 'type28',  hidden: true},
        {name: 'date11',  hidden: true},
        {name: 'no21',  hidden: true},
        {name: 'no22',  hidden: true},
        {name: 'no23',  hidden: true},
        {name: 'no25',  hidden: true},
        {name: 'no27',  hidden: true},
        {name: 'updTm',  hidden: true}
    ];
    var colNames = ['会计日', '传票号', '传票套内顺序号','准实时加工批次号','时间', '操作',
       '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','',];
    systemGrid = initGrid(url,"internalAccount",colModel, colNames,
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