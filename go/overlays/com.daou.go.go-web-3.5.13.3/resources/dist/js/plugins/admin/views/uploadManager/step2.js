define("admin/views/uploadManager/step2",function(require){var e=require("backbone"),t=require("app"),n=require("admin/views/uploadManager/downloadList"),r=require("admin/views/uploadManager/excelUpload"),i=require("i18n!admin/nls/admin");require("GO.util"),require("jquery.go-grid");var s=e.View.extend({tagName:"div",className:"step2",initialize:function(){},render:function(){var e=new r(this.getClassData()),t=new n(this.getClassData());this.$el.html(t.$el),this.$el.append(e.$el),t.render(),e.render(),this.setHelpMessage()},getClassData:function(){return{subjectLang:i["\ud074\ub798\uc2a4"],downloadFormUrl:"ad/api/domaincode/excel/download/form",uploadUrl:"ad/api/domaincode/excel/upload",uploadResultUrl:"ad/api/domaincode/excel/result",downloadAllResultUrl:"ad/api/domaincode/excel/download/result/all",downloadFailResultUrl:"ad/api/domaincode/excel/download/result/fail",downloadListUrl:"ad/api/domaincode/excel/download"}},setHelpMessage:function(){var e="<span class='help' style='margin-left: 5px'><span class='tool_tip'>"+i["\ud074\ub798\uc2a4 \ub2e4\uc6b4\ub85c\ub4dc \ub3c4\uc6c0\ub9d0"]+"<i class='tail_left'></i></span></span>";this.$el.find("#downloadList").after(e);var t="<span class='help' style='margin-left: 5px'><span class='tool_tip'>"+i["\ud074\ub798\uc2a4 \uc5c5\ub85c\ub4dc \ub3c4\uc6c0\ub9d0"]+"<i class='tail_left'></i></span></span>";this.$el.find("#downloadUploadForm").after(t)}});return s});