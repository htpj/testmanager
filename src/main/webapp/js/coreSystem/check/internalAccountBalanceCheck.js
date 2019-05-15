$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    var systemGrid;
    var itemSelected = {};
    var url = "json/internalAccountBalanceCheck.json";
    var colModel = [
        {name: 'institusion', index: 'accountDay', width: 90},
        {name: 'curency', index: 'institutionNo', width: 100},
        {name: 'subject', index: 'subject', width: 100},
        {name: 'internalAccount', index: 'internalAccount', width: 100},
        {name: 'time', index: 'time', width: 100},
        {name: 'date', width: 100},
        {name: 'nowMon',  width: 100},
        {name: 'lastMon', width: 100},
        {name: 'updDate',  width: 100},
       /* {name: 'Modify', index: 'Modify', width: 100},*/
        {name: 'id', key: true, hidden: true}

    ];
    var colNames = ['机构', '币种', '科目号','内部账户','会计日','当前余额',
        '前次记录余额','最后更新日期','时间',  ''];
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
            url: 'json/externalAccountBalancecheck.json?subjectNo='+subjectNo,
            page: 1
        }).trigger("reloadGrid");
    }



});