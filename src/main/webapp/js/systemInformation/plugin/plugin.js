/**
 * Created by JawnWu on 2018/8/21.
 */
$(function () {
    var pluginSelectedId = "";
    //插件配置
    var pluginGrid;
    var addPluginBoxDialog;
    $("#pluginTab").click(function () {
        $(window).resize();
    })
    pluginGrid = $("#pluginGrid").jqGrid({
        url: "/microservice/baffle/plugins",
        editurl: 'clientArray',
        mtype: "GET",
        datatype: "json",
        page: 1,
        colNames: ['插件名称', '描述', '类型', '源名称', '类路径', '版本', '操作', ''],
        colModel: [
            {name: 'pluginName', index: 'pluginName', width: 90},
            {name: 'pluginDescribe', index: 'pluginDescribe', width: 90},
            {
                name: 'pluginType', index: 'pluginType', width: 45,
                formatter: function (value, options, rowdata) {
                    if (value == "0") {
                        value = "服务管理";
                    } else if (value == "1") {
                        value = "报文处理";
                    } else if (value == "2") {
                        value = "节点映射处理";
                    } else if (value == "3") {
                        value = "结果处理";
                    }
                    return value;
                }
            },
            {name: 'pluginSourceName', index: 'pluginSourceName', width: 90},
            {name: 'pluginClassPath', index: 'pluginClassPath', width: 90},
            {name: 'pluginVersion', index: 'pluginVersion', width: 45},
            {name: 'operation', index: 'operation', width: 60},
            {name: 'id', hidden: true, width: 90, key: true}
        ],
        viewrecords: true,
        height: 385,
        rowNum: 10,
        rowList: [10, 30, 50],
        rownumWidth: 25,
        autowidth: true,
        pager: 'pluginGridPager',
        jsonReader: {
            root: "data", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
            page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
            total: "totalpages",//总的页数
            records: "total"//总记录数
        },
        gridComplete: function () {
            var ids = pluginGrid.getDataIDs();
            for (var i = 0; i < ids.length; i++) {
                var modify = '<button type="button" data-plugin-id="' + ids[i] + '" data-plugin-btn="updatePlugin" class="btn btn-info-outline" >修改</button>'
                    + '&nbsp;<button type="button" data-plugin-id="' + ids[i] + '" data-plugin-btn="delPlugin" class="btn btn-info-outline" >删除</button>';
                pluginGrid.setRowData(ids[i], {operation: modify});
            }
        },
        loadComplete: function () { // 加载数据
            var records = pluginGrid.getGridParam('records');
            /*if (records == 0 || records == null) {
                pluginGrid.before('<div class="jq-grid-tip">没有相关数据</div>')
            }*/
            setSameHeights();
        }
    });
    //插件配置添加点击
    $("#addPluginBtn").unbind("click").click(function () {
        $("#pluginForm")[0].reset();//清空表单
        addPluginBoxDialog.dialog("open");
        addPluginBoxDialog.attr("data-id", "");
    })
    //插件配置更新
    pluginGrid.off("click", "[data-plugin-btn=updatePlugin]").on("click", "[data-plugin-btn=updatePlugin]", function () {
        var id = $(this).attr("data-plugin-id");
        var rowData = pluginGrid.getRowData(id);
        var $option = $("#pluginType   option:contains(" + rowData.pluginType + ")").map(function () {
            if ($(this).text() == rowData.pluginType) {
                return this;
            }
        });
        if ($option.length > 0) {
            $option.attr("selected", true);
        }
        $("#pluginName").val(rowData.pluginName);
        $("#pluginSourceName").val(rowData.pluginSourceName);
        $("#pluginVersion").val(rowData.pluginVersion);
        $("#pluginDescribe").val(rowData.pluginDescribe);
        $("#pluginClassPath").val(rowData.pluginClassPath);
        addPluginBoxDialog.dialog("open");
        addPluginBoxDialog.attr("data-id", id);
    })
    //插件配置删除
    pluginGrid.off("click", "[data-plugin-btn=delPlugin]").on("click", "[data-plugin-btn=delPlugin]", function () {
        var id = $(this).attr("data-plugin-id");
        $.confirm({
            title: '是否确认删除?',
            content: '温馨提示',
            type: 'blue',
            icon: 'fa fa-warning',
            autoClose: 'cancel|8000',
            buttons: {
                ok: {
                    text: "确定",
                    btnClass: 'btn-danger-outline',
                    keys: ['enter'],
                    action: function () {
                        sendAjax("/microservice/baffle/plugin?id=" + id, "DELETE", null, function (data) {
                            $.alertBox(data.message);
                            pluginGrid.trigger("reloadGrid");
                        })
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
    })
    //新增插件Dialog
    addPluginBoxDialog = $("#addPluginBox").dialog({
        autoOpen: false,
        modal: true,
        height: 600,
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
                var id = $(this).attr("data-id");
                //新增和更新判断
                var ajaxType = "POST";
                if (id != "" && id != null) {
                    ajaxType = "PUT";
                }
                //缺少上传文件名pluginUploadName和路径pluginPath
                //pluginType，0:通信，1:验证，2:结果处理，3:请求包
                var data = {
                    id: id,
                    pluginType: $("#pluginType option:selected").val(),
                    pluginName: $("#pluginName").val(),
                    pluginSourceName: $("#pluginSourceName").val(),
                    pluginVersion: $("#pluginVersion").val(),
                    pluginDescribe: $("#pluginDescribe").val(),
                    pluginUploadName: $("#pluginSourceName").val(),
                    pluginPath: $("#pluginSourceName").val(),
                    pluginClassPath: $("#pluginClassPath").val()
                };
                sendAjax("/microservice/baffle/plugin", ajaxType, JSON.stringify(data), function (data) {
                    if (data.code == "success") {
                        addPluginBoxDialog.dialog("close");
                        pluginGrid.clearGridData().prev().remove();
                        pluginGrid.trigger("reloadGrid");
                    }
                    $.alertBox(data.message);
                })
            },
            "取消": function () {
                addPluginBoxDialog.dialog("close");
            }
        },
        close: function () {
        }
    });
    $("#searchPluginBtn").unbind("click").click(function () {
        var pluginName = $("#searchName").val();
        pluginGrid.clearGridData().prev().remove();
        pluginGrid.setGridParam({  // 重新加载数据
            mtype: "GET",
            datatype: "json",
            postData: {pluginName: pluginName},
            url: "/microservice/baffle/plugins"
        }).trigger("reloadGrid");
    })
    //抽象发送Ajax
    function sendAjax(url, type, data, successFunction) {
        $.ajax({
            url: url,
            type: type,
            async: true,
            dataType: "JSON",
            data: data,
            success: successFunction,
            error: function () {
                $.alertBox("访问出错");
            }
        });
    }

    //应用与上下文配置
    $("#applicationConfigTab").click(function () {
        var pluginListGrid, configGrid, contextGrid, contextGrid2;
        var addContextDialog, conteconfigGridxtDialog;
        var contextGridSelectId = "";
        $(window).resize();
        getPluginAndApplication();
        //插件配置列表
        pluginListGrid = $("#pluginListGrid").jqGrid({
            url: "/microservice/baffle/plugins",
            editurl: 'clientArray',
            mtype: "GET",
            datatype: "json",
            page: 1,
            colNames: ['插件名称', '类型', ''],
            colModel: [
                {name: 'pluginName', index: 'pluginName', width: 80},
                {
                    name: 'pluginType', index: 'pluginType', width: 50,
                    formatter: function (value, options, rowdata) {
                        if (value == "0") {
                            value = "服务管理";
                        } else if (value == "1") {
                            value = "报文处理";
                        } else if (value == "2") {
                            value = "节点映射";
                        } else if (value == "3") {
                            value = "结果处理";
                        }
                        return value;
                    }
                },
                {name: 'id', hidden: true, key: true}
            ],
            viewrecords: false,
            height: 330,
            rowNum: 10,
            rownumWidth: 25,
            autowidth: true,
            pager: 'pluginListGridPager',
            jsonReader: {
                root: "data", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
                page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
                total: "totalpages",//总的页数
                records: "total"//总记录数
            },
            onSelectRow: function (id) {
                pluginSelectedId = id;
                //reload
                configGrid.setGridParam({  // 重新加载数据
                    mtype: "GET",
                    datatype: "JSON",
                    postData: {pluginId: id},
                    url: "/microservice/baffle/plugins/contexts"
                }).trigger("reloadGrid");
            },
            gridComplete: function () {
                $(window).resize();
            },
            loadComplete: function () { // 加载数据
                var records = pluginGrid.getGridParam('records');
                /*if (records == 0 || records == null) {
                    pluginListGrid.before('<div class="jq-grid-tip">没有相关数据</div>')
                }*/
                setSameHeights();
            }
        });
        $("#queryNameBtn").click(function () {
            var pluginName = $("#queryName").val();
            pluginListGrid.setGridParam({  // 重新加载数据
                mtype: "GET",
                datatype: "JSON",
                postData: {pluginName: pluginName},
                url: "/microservice/baffle/plugins"
            }).trigger("reloadGrid");
        })
        //应用与上下文配置列表
        configGrid = $("#configGrid").jqGrid({
            url: "/microservice/baffle/plugins/contexts",
            editurl: 'clientArray',
            mtype: "GET",
            datatype: "json",
            page: 1,
            colNames: ['应用名称', '插件名称', '类型', "停/启用", '创建时间', '操作', '', '', ''],
            colModel: [
                {name: 'baffleAppName', index: 'baffleAppName', width: 100},
                {name: 'pluginName', index: 'pluginName', width: 100},
                {
                    name: 'pluginType', index: 'pluginType', width: 70,
                    formatter: function (value, options, rowdata) {
                        if (value == "0") {
                            value = "服务管理";
                        } else if (value == "1") {
                            value = "报文处理";
                        } else if (value == "2") {
                            value = "节点映射";
                        } else if (value == "3") {
                            value = "结果处理";
                        }
                        return value;
                    }
                },
                {
                    name: 'enableFlag', index: 'enableFlag', width: 60,
                    formatter: function (value, options, rowdata) {
                        if (value == "0") {
                            value = "启用";
                        } else if (value == "1") {
                            value = "停用";
                        } else {
                            value = "";
                        }
                        return value;
                    }
                },
                {
                    name: 'createTime', index: 'createTime', width: 120,
                    formatter: function (value, options, rowdata) {
                        return value != null ? value.substr(0, 4) + "-" + value.substr(4, 2) + "-" + value.substr(6, 2)
                        + " " + value.substr(8, 2) + ":" + value.substr(10, 2) + ":" + value.substr(12, 2) : "";
                    }
                },
                {name: 'operation', width: 120},
                {name: 'id', hidden: true, key: true},
                {name: 'pluginId', hidden: true},
                {name: 'applicationId', hidden: true}
            ],
            multiselect: true,
            viewrecords: false,
            height: 330,
            rowNum: 10,
            rownumWidth: 25,
            autowidth: true,
            pager: 'configGridPager',
            jsonReader: {
                root: "data", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
                page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
                total: "totalpages",//总的页数
                records: "total"//总记录数
            },
            onSelectRow: function (id) {

            },
            gridComplete: function () {
                var ids = configGrid.getDataIDs();
                for (var i = 0; i < ids.length; i++) {
                    var rowData = configGrid.getRowData(ids[i]);
                    var modify = '<button type="button" class="btn btn-info-outline" data-Config-btn="getContext" ' +
                        'data-config-appId="' + rowData.applicationId + '" data-config-pluginId="' + rowData.pluginId
                        + '" >查看</button>'
                        + '&nbsp;<button type="button" data-config-id="' + ids[i] + '" data-config-appId="' + rowData.applicationId
                        + '" data-config-pluginId="' + rowData.pluginId + '" data-Config-btn="updateConfig" class="btn btn-info-outline" >修改</button>'
                        + '&nbsp;<button type="button" data-config-id="' + ids[i] + '" data-config-pluginId="' + rowData.pluginId
                        + '" data-config-appId="' + rowData.applicationId
                        + '" data-Config-btn="delConfig" class="btn btn-info-outline" >删除</button>';
                    configGrid.setRowData(ids[i], {operation: modify});
                }
                $(window).resize();
            },
            loadComplete: function () { // 加载数据
                var records = pluginGrid.getGridParam('records');
                /*if (records == 0 || records == null) {
                    pluginGrid.before('<div class="jq-grid-tip">没有相关数据</div>')
                }*/
                setSameHeights();
            }
        });
        //查询应用系统和插件配置列表
        function getPluginAndApplication() {
            sendAjax("microservice/baffle/plugins/applications", "GET", null, function (data) {
                var str = '<option value="-1" selected="selected">请选择应用系统</option>';
                data = data.data;
                for (var i = 0; i < data.length; i++) {
                    str += '<option value="' + data[i].id + '">' + data[i].baffleAppName + '</option>';
                }
                $("#applicationSelect").empty().append(str);
            })
            sendAjax("microservice/baffle/plugins", "GET", {page: 0, rowNum: 0}, function (data) {
                var str = '<option value="-1" selected="selected">请选择插件配置</option>';
                data = data.data;
                for (var i = 0; i < data.length; i++) {
                    str += '<option value="' + data[i].id + '">' + data[i].pluginName + '</option>';
                }
                $("#pluginSelect").empty().append(str);
            })
        }

        //上下文配置删除
        configGrid.off("click", "[data-Config-btn=delConfig]").on("click", "[data-Config-btn=delConfig]", function () {
            var id = $(this).attr("data-config-id");
            var appId = $(this).attr("data-config-appId");
            var pluginId = $(this).attr("data-config-pluginId");
            $.confirm({
                title: '是否确认删除?',
                content: '温馨提示',
                type: 'blue',
                icon: 'fa fa-warning',
                autoClose: 'cancel|8000',
                buttons: {
                    ok: {
                        text: "确定",
                        btnClass: 'btn-danger-outline',
                        keys: ['enter'],
                        action: function () {
                            sendAjax("/microservice/baffle/plugins/contexts?id=" + id + "&appId=" + appId + "&pluginId="
                                + pluginId, "DELETE", null, function (data) {
                                $.alertBox(data.message);
                                configGrid.trigger("reloadGrid");
                            })
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
        })

        //上下文配置修改点击
        configGrid.off("click", "[data-Config-btn=updateConfig]").on("click", "[data-Config-btn=updateConfig]", function () {
            var pluginId = $(this).attr("data-config-pluginId");
            var appId = $(this).attr("data-config-appId");
            var id = $(this).attr("data-config-id");
            sendAjax("microservice/baffle/plugins/applications", "GET", null, function (data) {
                var str = '<option value="-1" selected="selected">请选择应用系统</option>';
                data = data.data;
                for (var i = 0; i < data.length; i++) {
                    str += '<option value="' + data[i].id + '">' + data[i].baffleAppName + '</option>';
                }
                $("#applicationSelect").empty().append(str);


                $("#pluginSelect").val(pluginId);
                $("#pluginSelect").attr("disabled", true);
                $("#applicationSelect").val(appId);
                $("#applicationSelect").attr("disabled", true);
                addContextDialog.dialog("open");
                addContextDialog.attr("data-id", id);
                sendAjax("microservice/baffle/protocols?baffleAppId="+appId + "&mode=0&rowNum=0&page=0" , "GET", null, function (data) {
                	var str = '<option value="" selected="selected">全部</option>';
                	var protocolInfoId = null;
                	if(data.data != null && data.data.length > 0){
                        data = data.data;
                        for (var i = 0; i < data.length; i++) {
                            str += '<option value="' + data[i].id + '">' + data[i].baffleProName + '</option>';
                        }
                        protocolInfoId = data[0].id;
                	}
                	$("#environmentSelect").empty().append(str);
                    $("#environmentSelect").val(protocolInfoId == null ? "-1" : protocolInfoId);
                	contextGrid.clearGridData().prev().remove();
                    contextGrid.setGridParam({  // 重新加载数据
                        mtype: "GET",
                        datatype: "JSON",
                        postData: {applicationId: appId, pluginId: pluginId, protocolInfoId:protocolInfoId},
                        url: "microservice/baffle/plugins/contexts/list"
                    }).trigger("reloadGrid");
                    $(window).resize(function () {
                        contextGrid.jqGrid('setGridWidth', $(window).width() - 100);// 自动调整表格大小
                    }).resize();
                })
            })

        })

        configGrid.on("click", "[data-Config-btn=getContext]", function () {
            var appId = $(this).attr("data-config-appId");
            var pluginId = $(this).attr("data-config-pluginId");
            sendAjax("microservice/baffle/protocols?baffleAppId="+appId + "&mode=0&rowNum=0&page=0", "GET", null, function (data) {
            	var str = '<option value="" selected="selected">全部</option>';
            	var protocolInfoId = null;
            	if(data.data != null && data.data.length > 0){
                    data = data.data;
                    for (var i = 0; i < data.length; i++) {
                        str += '<option value="' + data[i].id + '">' + data[i].baffleProName + '</option>';
                    }
                    protocolInfoId = data[0].id;
            	}
            	$("#environmentSelect2").empty().append(str);
            	$("#environmentSelect2").val(protocolInfoId == null ? "-1" : protocolInfoId);
            	contextGrid2.clearGridData().prev().remove();
            	contextGrid2.setGridParam({
                    mtype: "GET",
                    datatype: "JSON",
                    postData: {applicationId: appId, pluginId: pluginId, protocolInfoId:protocolInfoId},
                    url: "microservice/baffle/plugins/contexts/list"
                }).trigger("reloadGrid");
            	$(window).resize(function () {
                    contextGrid2.jqGrid('setGridWidth', $(window).width() - 100);// 自动调整表格大小
                }).resize();
            	contextDialog.dialog("open");
            })
            
        })
        //应用系统下拉触发获取该系统的环境并初始化
        $("#applicationSelect").change(function(){
        	var selectAppId = $("#applicationSelect").val();
        	if(selectAppId != null && selectAppId != "-1"){
        		sendAjax("/microservice/baffle/protocols?baffleAppId="+selectAppId + "&mode=0&rowNum=0&page=0", "GET", null, function (data) {
        			if(data.code == "success"){
        				var environment = data.data;
        				if(environment != null && environment.length > 0){
        					var str = '<option value="" selected="selected">全部</option>';
        					for(var i = 0; i < environment.length; i++){
        		                str += '<option value="' + environment[i].id + '">' + environment[i].baffleProName + '</option>';
        		                $("#environmentSelect").empty().append(str);
        					}
        				}
        			}
        		})
        	}
        })
        
        //环境下拉触发更换上下文信息
        $("#environmentSelect").change(function(){
        	var selectEnvId = $("#environmentSelect").val();
        	var selectappId = $("#applicationSelect").val();
        	contextGrid.clearGridData().prev().remove();
            contextGrid.setGridParam({  // 重新加载数据
                mtype: "GET",
                datatype: "JSON",
                postData: {applicationId:selectappId, protocolInfoId:selectEnvId},
                url: "microservice/baffle/plugins/contexts/list"
            }).trigger("reloadGrid");
        })
        
        //环境下拉触发更换上下文信息
        $("#environmentSelect2").change(function(){
        	var selectEnvId = $("#environmentSelect2").val();
        	contextGrid2.clearGridData().prev().remove();
            contextGrid2.setGridParam({  // 重新加载数据
                mtype: "GET",
                datatype: "JSON",
                postData: {protocolInfoId:selectEnvId},
                url: "microservice/baffle/plugins/contexts/list"
            }).trigger("reloadGrid");
        })

        //添加上下文配置
        $("#addConfigBtn").unbind("click").click(function () {
            $("#contextForm")[0].reset();
            contextGrid.clearGridData().prev().remove();
            $("#applicationSelect").attr("disabled", false);
            $("#pluginSelect").attr("disabled", false);
            addContextDialog.dialog("open");
            addContextDialog.attr("data-id", "");
            $(window).resize(function () {
                contextGrid.jqGrid('setGridWidth', $(window).width() - 100);// 自动调整表格大小
            }).resize();
        });
        //查询btn
        $("#searchApplicationBtn").unbind("click").click(function () {
            var baffleAppName = $("#baffleAppName").val();
            //var id = pluginListGrid.
            configGrid.setGridParam({  // 重新加载数据
                mtype: "GET",
                datatype: "JSON",
                postData: {pluginId: pluginSelectedId , baffleAppName : baffleAppName},
                url: "/microservice/baffle/plugins/contexts"
            }).trigger("reloadGrid");
        });

        //上下文配置
        contextGrid = $("#contextGrid").jqGrid({
            //url: "",
            editurl: 'clientArray',
            mtype: "GET",
            datatype: "json",
            page: 1,
            rowNum:50,
            colNames: ['上下文名称', '上下文数据值', '描述',''],
            colModel: [
                {name: 'contextKey', index: 'contextKey', width: 100, editable: true},
                {name: 'contextValue', index: 'contextValue', width: 100, editable: true},
                {name: 'contextDescribe', index: 'contextDescribe', width: 100, editable: true},
                {name: 'id', hidden: true, key: true},
            ],
            viewrecords: false,
            height: '100%',
            autowidth: true,
            caption: '<button type="button" id="delContextBtn" class="btn btn-info-outline pull-right" style="margin-right: 30px;">删除</button><button type="button" id="addContextBtn" class="btn btn-info-outline pull-right" style="margin-right: 30px;">添加</button>',
            jsonReader: {
                root: "data", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
                page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
                total: "totalpages",//总的页数
                records: "total"//总记录数
            },
            ondblClickRow: function (rowId) {
                if (rowId && rowId !== contextGridSelectId) {
                    contextGrid.saveRow(contextGridSelectId);
                    contextGrid.editRow(rowId, {keys: true, focusField: 4});
                    contextGrid.resetSelection();
                    contextGridSelectId = rowId;
                } else {
                    contextGrid.editRow(rowId, {keys: true, focusField: 4});
                }
            },
            gridComplete: function () {

            },
            /*loadComplete: function () { // 加载数据
                var records = contextGrid.getGridParam('records');
                if (records == 0 || records == null) {
                    contextGrid.before('<div class="jq-grid-tip">没有相关数据</div>')
                }
                setSameHeights();
            }*/
        });

        contextGrid2 = $("#contextGrid2").jqGrid({
            //url: "",
            editurl: 'clientArray',
            mtype: "GET",
            datatype: "json",
            page: 1,
            rowNum:50,
            colNames: ['上下文名称', '上下文数据值', '描述',''],
            colModel: [
                {name: 'contextKey', index: 'contextKey', width: 100, editable: true},
                {name: 'contextValue', index: 'contextValue', width: 100, editable: true},
                {name: 'contextDescribe', index: 'contextDescribe', width: 100, editable: true},
                {name: 'id', hidden: true, key: true},
            ],
            viewrecords: false,
            height: '100%',
            autowidth: true,
            jsonReader: {
                root: "data", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
                page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
                total: "totalpages",//总的页数
                records: "total"//总记录数
            },
            ondblClickRow: function (rowId) {
            },
            gridComplete: function () {

            },
            loadComplete: function () { // 加载数据
                var records = contextGrid2.getGridParam('records');
                /*if (records == 0 || records == null) {
                    contextGrid2.before('<div class="jq-grid-tip">没有相关数据</div>')
                }*/
                setSameHeights();
            }
        });

        //上下文配置列表添加行点击
        $("#addContextBtn").unbind("click").click(function () {
            var ids = contextGrid.getDataIDs();
            var idLength = ids.length;
            if (idLength == 0) {
                var id = createNodeId();
                contextGrid.addRowData(id, {}, "first");
                contextGrid.editRow(id, {keys: true, focusField: 4});
                contextGridSelectId = id;
            } else {
                contextGrid.saveRow(contextGridSelectId);
                var lastId = ids[Number(idLength) - 1];
                contextGrid.addRowData(Number(lastId) + 1, {});
                contextGrid.editRow(Number(lastId) + 1, {keys: true, focusField: 4});
                contextGrid.resetSelection();
                contextGridSelectId = Number(lastId) + 1;
            }
        })
        //上下文删除行
        $("#delContextBtn").unbind("click").click(function () {
            var id = contextGrid.getGridParam('selrow');
            confirmBox("确认要删除选择的上下文信息吗？", function () {
                contextGrid.delRowData(id);
            })
        })
        //上下文配置添加与更新弹框
        addContextDialog = $("#addContextBox").dialog({
            autoOpen: false,
            modal: true,
            height: 600,
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
                	contextGrid.saveRow(contextGridSelectId);
                	var pluginId =  $("#pluginSelect option:selected").val();
                	var appId =  $("#applicationSelect option:selected").val();
                	var envId =  $("#environmentSelect option:selected").val();
                	if(pluginId == null || pluginId == "" || pluginId == "-1"){
                		$.alertBox("请选择插件配置！");
                		return;
                	}else if(appId == null || appId == "" || appId == "-1"){
                		$.alertBox("请选择系统！");
                		return;
                	}/*else if(envId == null || envId == "" || envId == "-1"){
                		$.alertBox("请选择系统环境！");
                		return;
                	}*/
                    
                    contextGridSelectId = "";
                    var id = $(this).attr("data-id");
                    //新增和更新判断
                    var ajaxType = "POST";
                    if (id != "" && id != null) {
                        ajaxType = "PUT";
                    }
                    //缺少上传文件名pluginUploadName和路径pluginPath
                    //pluginType，插件类型：0:服务管理，1:报文处理，2:节点映射，3:结果处理
                    var ids = contextGrid.getDataIDs();
                    var rowDatas = [];
                    for (var i = 0; i < ids.length; i++) {
                        var rowData = contextGrid.getRowData(ids[i]);
                        rowDatas.push({
                            contextKey: rowData.contextKey,
                            contextValue: rowData.contextValue,
                            contextDescribe: rowData.contextDescribe,
                            id: rowData.id,
                            pluginId: pluginId,
                            applicationId: appId,
                            protocolInfoId: envId
                        });
                    }
                    var data = {
                        id: id,
                        pluginId: pluginId,
                        applicationId: appId,
                        contexts: rowDatas,
                        enableFlag: '0'
                    };
                    sendAjax("/microservice/baffle/plugins/contexts", ajaxType, JSON.stringify(data), function (data) {
                        if (data.code == "success") {
                            addContextDialog.dialog("close");
                            contextGrid.clearGridData().prev().remove();
                            configGrid.clearGridData().prev().remove();
                            configGrid.trigger("reloadGrid");
                        }
                        $.alertBox(data.message);
                    })
                },
                "取消": function () {
                    addContextDialog.dialog("close");
                }
            },
            close: function () {
            }
        });

        contextDialog = $("#contextBox").dialog({
            autoOpen: false,
            modal: true,
            width: 600,
            height:600,
            show: {
                effect: "blind",
                duration: 1000
            },
            hide: {
                effect: "explode",
                duration: 1000
            },
            buttons: {
                "关闭": function () {
                    contextDialog.dialog("close");
                }
            },
            close: function () {
            }
        });

        //配置列表下拉改变
        $("#pluginSelect").bind("change", function () {
            var pluginId = $(this).val();
            sendAjax("microservice/baffle/plugins/applications?pluginId=" + pluginId, "GET", null, function (data) {
                var str = '<option value="-1" selected="selected">请选择应用系统</option>';
                data = data.data;
                for (var i = 0; i < data.length; i++) {
                    str += '<option value="' + data[i].id + '">' + data[i].baffleAppName + '</option>';
                }
                $("#applicationSelect").empty().append(str);
            })
        });

        //上下文页面的列表，停启用业务系统对应的插件问题
        $('#enableBtn').click(function () {
            enableOrDisableAppPlugin('0', configGrid)
        });
        $('#diableBtn').click(function () {
            enableOrDisableAppPlugin('1', configGrid)
        });

        /**
         *
         * @param enableType  0 : 启用 1：停用
         * @param tableGrid
         */
        function enableOrDisableAppPlugin(enableType, tableGrid) {
            var ids = tableGrid.getGridParam('selarrrow');
            if (ids != null && ids.length > 0) {
                var reqData = {
                    "ids": ids,
                    "enableType": enableType
                };

                sendAjax("/microservice/baffle/plugins/contexts/enableAppPlugin", "post", JSON.stringify(reqData), function (data) {
                    if (data != null) {
                        $.alertBox(data.message);
                    }
                    configGrid.trigger("reloadGrid");
                })
            } else {
                $.alertBox("请先选择要需要停启用的插件！");
            }

        }


    });
    //生成节点id,时间戳+0到4位随机数生成id
    function createNodeId() {
        var a = Math.random, b = parseInt;
        var newRowId = Number(new Date()).toString() + b(1000 * a());
        return newRowId;
    }

    //上传插件
    $("#uploadPluginBtn").click(function () {

        var a = document.createEvent("MouseEvents");//触发fileupload的处理 
        a.initEvent("click", true, true);
        document.getElementById("pluginUpload").dispatchEvent(a);
    });
    $('#pluginUpload').fileupload({
        url: "microservice/baffle/plugin/upload",
        dataType: 'json',
      //  maxFileSize :999999999,
        add: function (e, data) {
          //  console.log(data.originalFiles[0]['size']) ;
            data.submit();
        },
        done: function (e, data) {
            console.log(data);
            var respData = data.result;
            if (respData != null) {
                if (respData.code == "success") {
                    $('#pluginSourceName').val(respData.data);

                } else if (respData.code == "error") {
                    confirmBox(respData.message);
                }
            } else {
                confirmBox("上传失败1");
            }

        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'width',
                progress + '%'
            );
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
    $('#pluginUpload').hide();

    function confirmBox(message, confirmFunction) {
        $.confirm({
            title: '警告',
            content: message,
            type: 'red',
            icon: 'fa fa-warning',
            autoClose: 'cancel|8000',
            buttons: {
                ok: {
                    text: "确定",
                    btnClass: 'btn-danger-outline',
                    keys: ['enter'],
                    action: confirmFunction
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
    }

});