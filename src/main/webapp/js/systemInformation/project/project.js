$(document).ready(function () {
    $.jgrid.defaults.width = 1000;
    $.jgrid.defaults.responsive = true;
    $.jgrid.defaults.styleUI = 'Bootstrap';
    
    var projectAndReleaseGrid;
    var basicUrl="/js/systemInformation/project/data.json";
    
    //初始化表格
    var projectAndReleaseGrid = $("#projectAndReleaseGrid").jqGrid({
    	url:basicUrl,
    	editurl: 'clientArray',
    	mtype:"GET",
    	datatype:"json",
    	page:1,
    	colNames:['','名称','描述','','','','操作'],
    	colModel:[
    		{name: 'id', index: 'id',key:true,hidden:true},
    		{name: 'name', index: 'name', width: 90},
    		{name: 'description', index: 'description', width: 90},
    		{name: 'parentId', index: 'parentId',hidden:true},
    		{name: 'level', index: 'level',hidden:true},
    		{name: 'isLeaf', index: 'isLeaf',hidden:true},
    		{name: 'operation',index: 'operation',width: 100}
    	],
    	viewrecords:true,
    	height: 385,
        rowNum: 10,
        rowList: [10, 30, 50],
        rownumWidth: 25,
        autowidth: true,
    	pager:'jqGridPager',
    	treeGrid: true,  
	    treeGridModel: 'adjacency',  
	    ExpandColumn : 'name',
    	tree_root_level:0,
    	jsonReader: {
            root: "data", //root这里的值是rows，意味着它会读取json中的rows键的值，这个值就是真实的数据
            page: "page", //root这里的值是page，意味着它会读取json中的page键的值，当前页号
            total: "totalpages",//总的页数
            records: "total"//总记录数
        },
        treeReader : {
            level_field: "level",
            leaf_field: "isLeaf",
            parent_id_field: "parentId",
            expanded_field: "expanded" 
        },
        gridComplete: function () {
            var ids = projectAndReleaseGrid.getDataIDs();
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i]
                var operation='<button type="button" data-id="' + id + '" data-btn="del" class="btn btn-info-outline">删除</button> ';
                if(projectAndReleaseGrid.getRowData(id).parentId==""){
                	operation = operation +'<button type="button" data-id="' + id + '" data-btn="updProject" class="btn btn-info-outline">修改</button> '
                	          + '<button type="button" data-id="' + id + '" data-btn="addRelease" class="btn btn-info-outline">添加</button>'
                }else{
                	operation += '<button type="button" data-id="' + id + '" data-btn="updRelease" class="btn btn-info-outline">修改</button>';
                }
                projectAndReleaseGrid.setRowData(id, {operation: operation});
            }
        },
        loadComplete: function () { // 加载数据
            var re_records = projectAndReleaseGrid.getGridParam('records');
            if (re_records == 0 || re_records == null) {
            	projectAndReleaseGrid.before('<div class="jq-grid-tip">没有相关数据</div>');
            }
            setSameHeights();
        }
    });
    
    var addProjectDialog = $("#addProjectBox").dialog({
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
    			var rowId=$(this).attr("data-rowId");
    			var projectName=$("input[name=projectName]").val();
    			var projectDescription=$("textarea[name=projectDescription]").val();
    			var releaseName=$("input[name=releaseName]").val();
    			var releaseDescription=$("textarea[name=releaseDescription]").val();
    			var projectData={
    			        "name": projectName,
    			        "description": projectDescription,
    			        "parentId": null,
    			        "level": 0,
    			        "isLeaf": false,
    			        "expanded": true
    			    };
    			if(rowId==null){
    				//新增项目，树节点显示有问题
    				var projectId=createNodeId();
    				projectAndReleaseGrid.addChildNode(projectId,null,projectData);
    			    var releaseData={
    			        "name": releaseName,
    			        "description": releaseDescription,
    			        "parentId": projectId,
    			        "level": 1,
    			        "isLeaf": true,
    			        "expanded": true
    			    };
    			    //projectAndReleaseGrid.addChildNode(createNodeId(),projectId,releaseData);
    				
    			}else{
    				projectAndReleaseGrid.setTreeRow(rowId,projectData);
    			}
    			addProjectDialog.dialog("close");
            },
            "取消": function () {
            	addProjectDialog.dialog("close");
            }
        },
        close: function () {
        }
    });
    
    //添加项目
    $("#addProjectBtn").click(function(){
    	addProjectDialog.children()[0].reset();//清空表格数据
    	addProjectDialog.dialog("open");
    	addProjectDialog.attr("data-rowId",null);
    	$("div[name=releaseName]").show();
    	$("div[name=releaseDescription]").show();
    });
    //修改项目
    projectAndReleaseGrid.on("click","[data-btn=updProject]",function(){
    	addProjectDialog.dialog("open");
    	addProjectDialog.attr("data-rowId",$(this).attr("data-id"));
    	$("div[name=releaseName]").hide();
    	$("div[name=releaseDescription]").hide();
    });
    
    var addReleaseDialog = $("#addReleaseBox").dialog({
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
    		"确定":function(){
    			var rowId=$(this).attr("data-rowId");
    			var operation=$(this).attr("data-operation");
    			var releaseName=$("input[name=releaseBoxReleaseName]").val();
    			var releaseDescription=$("textarea[name=releaseBoxReleaseDescription]").val();
    			var releaseData={
    			        "name": releaseName,
    			        "description": releaseDescription,
    			        "parentId": "8",
    			        "level": 1,
    			        "isLeaf": true,
    			        "expanded": true
    			    };
    			if(operation=="add"){
    				projectAndReleaseGrid.addChildNode(createNodeId(),rowId,releaseData);
    			}else{
    				projectAndReleaseGrid.setTreeRow(rowId,releaseData);
    			}
    			addReleaseDialog.dialog("close");
    		},
    		"取消":function(){
    			addReleaseDialog.dialog("close");
    		}
    	}
    });
    //添加版本
    projectAndReleaseGrid.on("click","[data-btn=addRelease]",function(){
    	addReleaseDialog.dialog("open");
    	addReleaseDialog.attr("data-operation","add");
    	addReleaseDialog.attr("data-rowId",$(this).attr("data-id"));
    });
    //修改版本
    projectAndReleaseGrid.on("click","[data-btn=updRelease]",function(){
    	addReleaseDialog.dialog("open");
    	addReleaseDialog.attr("data-operation","upd");
    	addReleaseDialog.attr("data-rowId",$(this).attr("data-id"));
    });
    //删除节点
    projectAndReleaseGrid.on("click","[data-btn=del]",function(){
    	projectAndReleaseGrid.delTreeNode($(this).attr("data-id"));
    });
    //生成节点id,时间戳+0到4位随机数生成id
    function createNodeId() {
        var a = Math.random, b = parseInt;
        var newRowId = Number(new Date()).toString() + b(1000 * a());
        return newRowId;
    }
});