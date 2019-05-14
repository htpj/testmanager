$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    var internalAccountParam;
    var itemSelected = {};
    var url = "json/internalAccountParam.json";

    var colModel = [
        {name: 'name', index: 'name', width: 90},
        {name: 'success', index: 'success', width: 100},
        {name: 'fail', index: 'fail', width: 100},
        {name: 'createTm', index: 'createTm', width: 100},
        {name: 'id', key: true, hidden: true}
    ];
    var colNames = ['文件名', '导入成功条数', '导入失败条数', '创建时间',''];
    internalAccountParam = initGrid(url,"internalAccountParam",colModel, colNames,
        function (id) {

        },
        function () {

        }
    );

    //模拟系统名称查询
    $("#queryBtn").on("click", function () {
        reloadinternalAccountParam();
    });

    //重新加载
    function reloadinternalAccountParam() {
        var subjectNo = $("#nameQuery").val() == undefined ? '' :$("#nameQuery").val()
        internalAccountParam.clearGridData().prev().remove();  // 清空数据
        internalAccountParam.setGridParam({  // 重新加载数据
            mtype: "GET",
            datatype: "json",
            url: url,
            page: 1
        }).trigger("reloadGrid");
    }
    //生成节点id,时间戳+0到4位随机数生成id
    function createNodeId() {
        var a = Math.random, b = parseInt;
        var newRowId = Number(new Date()).toString() + b(1000 * a());
        return newRowId;
    }

    $("#uploadBtn").off().on("click", function () {
        console.log("上传");
        var a = document.createEvent("MouseEvents");
        a.initEvent("click", true, true);
        document.getElementById("fileUpload").dispatchEvent(a);
    })
    $("#fileUpload").fileupload({
        url: null,//"/microservice/baffle/fieldUpload/message",
        //dataType: "json",
        add: function (e, data) {
            console.log("上传开始");
            /*var acceptFileTypes = /\/(xls|txt|xlsx)$/i;
          if (data.originalFiles[0]['type'].length && !acceptFileTypes.test(data.originalFiles[0]['type'])) {
               $.alertBox("上传文件类型错误！");
               return;
           }*/
            var fileName = data.originalFiles[0]['name'];
            if(fileName.indexOf("txt") > 0|| fileName.indexOf("xlsx") > 0|| fileName.indexOf("xls") > 0){
                var data = {
                    id : createNodeId(),
                    name : fileName,
                    success : 123121,
                    fail : 0,
                    createTm : new Date().Format("yyyy-MM-dd hh:mm:ss")
                }
                internalAccountParam.addRowData(data.id , data);
            }else{
                $.alertBox("上传文件类型错误,只能上传.txt,.xlsx或者.xls的文件！");
            }
           // data.submit();

        },
        done: function (e, data) {
            console.log("上传结束");
        },
        progressall: function (e, data) {

        }
    }).prop("disabled", !$.support.fileInput).parent().addClass($.support.fileInput ? undefined : "disabled");
});