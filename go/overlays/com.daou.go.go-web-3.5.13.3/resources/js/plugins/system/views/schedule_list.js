define("system/views/schedule_list",function(require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var scheduleListTmpl = require("hgn!system/templates/schedule_list");
    var emptyTmpl = require("hgn!system/templates/list_empty");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    require("jquery.go-grid");

    var tmplVal = {
            label_breadcrumb : adminLang["스케줄 관리"],
            label_execution : adminLang['실행'],
            label_job_name : adminLang['job name'],
            label_job_group : adminLang['job group'],
            label_prev_fire_time : adminLang['prev Fire Time'],
            label_next_fire_time : adminLang['next Fire Time'],
            label_host_name : adminLang['host name'],
            label_local_schedule : adminLang['local schedule'],
            label_description : adminLang['Description']
    };
    var scheduleList = Backbone.View.extend({

        events : {
            "click span.btn_execution" : "executeJob"
        },

        initialize : function() {
            this.dataTable = null;
        },

        render : function() {
            $('.breadcrumb .path').html(adminLang["스케줄 관리"]);
            this.$el.empty();
            this.$el.html(scheduleListTmpl({
                    lang : tmplVal,
                }));    
            this.renderScheduleList({targetEl : "#globalScheduleList", type : "global"});
            this.renderScheduleList({targetEl : "#adminScheduleList", type : "admin"});
            this.renderScheduleList({targetEl : "#adminSerialScheduleList", type : "admin/serial"});
            this.getHostNames();
        },

		renderScheduleList : function(options) {
			var self = this;
			this.dataTable = $.goGrid({
				el : options.targetEl,
				method : 'GET',
				url : GO.contextRoot + 'ad/api/scheduler/'+ options.type +'/jobs',
				emptyMessage : emptyTmpl({
					label_desc : adminLang["표시할 데이터 없음"]
				}),
				pageUse : false,
				sDomUse : false,
				checkbox : false,
				displayLength : 999,
				sDomType : 'admin',
				columns : [
					{ mData: "name", bSortable: false, sClass: "name", fnRender : function(obj) {
							return obj.aData.name;
						}},
					{ mData: null, bSortable: false, fnRender : function(obj) {
							return adminLang[obj.aData.name];
						}},
					{ mData: "group", bSortable: false, sClass: "group", fnRender : function(obj) {
							return obj.aData.group;
						}},
					{ mData: null, bSortable: false, fnRender : function(obj) {
							if(obj.aData.prevFireTime == undefined) return "";
							return GO.util.basicDate2(obj.aData.prevFireTime);
						}},
					{ mData: "nextFireTime", bSortable: false, fnRender : function(obj) {
							return GO.util.basicDate2(obj.aData.nextFireTime);
						}},
					{ mData: null, sWidth: '140px', bSortable: false, fnRender : function(obj) {
							var settingBtn = "<td class='align_c set last'>"+
								"<span class='btn_s btn_execution'>"+adminLang['실행']+"</span>"+
								"</td>";
							return settingBtn;
						}}
				],
				fnDrawCallback : function(obj) {
				}
			});
		},
        getHostNames : function(){
            url = GO.contextRoot + "ad/api/system/host";
            $.go(url,'' , {
                qryType : 'GET',                
                responseFn : function(response) {
                    if(response.code == 200){
                        for(var i = 0 ; i < response.data.length; i++){
                            $('select#hostName').append('<OPTION value="'+response.data[i].hostName+'">'+response.data[i].hostName+'</OPTION>');
                        }
                    }
                },
                error: function(response){
                    
                }
            });
        },
        executeJob : function(e){
            var hostName = $(e.currentTarget).parents('form').find('#hostName option:selected').val(),
                jobName = $(e.currentTarget).parents('tr').find('td.name').text(),
                jobGroup = $(e.currentTarget).parents('tr').find('td.group').text(),
                tableName = $(e.currentTarget).parents('form').attr('class');
            
            var param = {
                    "hostName" : hostName,
                    "jobName" : jobName,
                    "jobGroup" : jobGroup
            };
            
            url = GO.contextRoot + "ad/api/scheduler/"+tableName+"/invoke";
            $.go(url, JSON.stringify(param), {
                qryType : 'POST',    
                contentType : 'application/json',
                responseFn : function(response) {
                    $.goMessage(App.i18n(adminLang["{{arg1}} 실행 성공"],{"arg1": jobName}));
                    this.render();
                },
                error: function(response){
                    $.goMessage(App.i18n(adminLang["{{arg1}} 실행 실패"],{"arg1": jobName}));
                }
            });
        }
    },{
        __instance__: null
    });

    return scheduleList;
});
