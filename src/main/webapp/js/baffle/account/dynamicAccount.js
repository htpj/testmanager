$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    var systemGrid, resourcesGrid;
    var itemSelected = {};
    var userRole = localStorage.getItem("userRole");
    $("#userName").text(localStorage.getItem("userName"));


    //模拟系统名称查询
    $("#querySystemBtn").on("click", function () {
        reloadSystemGrid();
    });


    // 弹窗
    var addSystemDialog;
    $("#addPrefferAccountBtn").click(function () {
        addSystemDialog.children()[0].reset();//重置弹窗
        resourcesGrid.resetSelection();
        itemSelected = {};
        $(window).resize();
        addSystemDialog.dialog("open");
    });
    addSystemDialog = $("#addPrefferAccountBox").dialog({
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

    resourcesGrid = $("#jqGridPrefferAccount").jqGrid({
        url: '/json/dynamicAccount.json',
        editurl: 'clientArray',
        mtype: "GET",
        datatype: "json",                                          
        page: 1,
        colNames: ['', '交易渠道', '会计日期', '交易日期','交易机构','核心流水号','渠道流水号','交易场景名称','交易币种','交易金额','客户账余额','内部户余额','科目余额','测试人','会计机构','币种','借贷方向','科目号','金额','客户账余额','内部户余额','科目余额','核对的测试骨干','是否正确','业务检查人员','是否正确'],
        colModel: [
            {name: 'id', index: 'id', key: true, hidden: true},
            {name: 'txnChannel', index: 'txnChannel'},
            {name: 'accountDate', index: 'accountDate'},
            {name: 'txnDate', index: 'txnDate'},
            {name: 'txnBank', index: 'txnBank'},
            {name: 'coreNo', index: 'coreNo'},
            {name: 'channelNo', index: 'channelNo'},
            {name: 'txnScenario', index: 'txnScenario'},
            {name: 'moneyType', index: 'moneyType'},
            {name: 'txnAmount', index: 'txnAmount'},
            {name: 'customerAmount', index: 'customerAmount'},
            {name: 'internalAmount', index: 'internalAmount'},
            {name: 'typeAmount', index: 'typeAmount'},
            {name: 'tester', index: 'tester'},
            {name: 'accountOrg', index: 'accountOrg'},
            {name: 'aMoneyType', index: 'aMoneyType'},
            {name: 'direction', index: 'direction'},
            {name: 'accountNo', index: 'accountNo'},
            {name: 'amount', index: 'amount'},
            {name: 'AcustomerAmount', index: 'AcustomerAmount'},
            {name: 'AinternalAmount', index: 'AinternalAmount'},
            {name: 'AtypeAmount', index: 'AtypeAmount'},
            {name: 'coreTester', index: 'coreTester'},
            {name: 'testRight', index: 'testRight'},
            {name: 'businessMan', index: 'businessMan'},
            {name: 'businessRight', index: 'businessRight'}
        ],
        viewrecords: true,
        multiselect: true,
        rowNum: 10,
        //rownumWidth: 25,
        height: 300,
        autowidth: true,
        pager: "#jqGridPrefferAccountPager",
        jsonReader: {
            root: "rows", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
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

});

/**
 * 选择预期核算模型方法
 * @param accountType
 */
function selectAccountType(accountType){
	if(accountType=="0"){
		$("#dynamicAccount").hide();
		$("#scenario").show();
	}else if(accountType=="1"){
		$("#scenario").hide();
		$("#dynamicAccount").show();
	}else{
		alert("不支持预期核算模型");
	}
	
}