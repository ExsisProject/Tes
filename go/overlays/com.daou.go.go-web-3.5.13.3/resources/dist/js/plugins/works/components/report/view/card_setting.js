define("works/components/report/view/card_setting",function(require){var e=require("backbone"),t=require("hgn!works/components/report/template/card_setting"),n=require("calendar/views/color_picker"),r=require("i18n!nls/commons"),i=require("i18n!works/nls/works"),s=require("i18n!admin/nls/admin"),o=Hogan.compile(['<option value="SUM">{{{lang.\ud569\uacc4}}}</option>','<option value="AVG">{{{lang.\ud3c9\uade0}}}</option>','<option value="COUNT">{{{lang.\uac1c\uc218}}}</option>','<option value="MAX">{{{lang.\ucd5c\ub300\uac12}}}</option>','<option value="MIN">{{{lang.\ucd5c\uc18c\uac12}}}</option>'].join("")),u=Hogan.compile(['<option value="DONE" DONE>{{{lang.\uc0ac\uc6a9\uc548\ud568}}}</option>','<option value="SAME_DAY" SAME_DAY>{{{lang.\uc9c1\uc804\uc77c \ub3d9\uc77c \uae30\uac04}}}</option>','<option value="ONE_DAY_AGO" ONE_DAY_AGO>{{{lang.\uc9c1\uc804\uc77c}}}</option>','<option value="ONE_YEAR_AGO" ONE_YEAR_AGO>{{{lang.\uc774\uc804 \uc5f0\ub3c4}}}</option>','<option value="CUSTOM" CUSTOM>{{{lang.\uc0ac\uc6a9\uc790 \uc124\uc815}}}</option>'].join("")),a={"\uc77c":i["\uc77c"],"\ucef4\ud3ec\ub10c\ud2b8":i["\ucef4\ud3ec\ub10c\ud2b8"],"\uc9d1\uacc4 \ubc29\uc2dd":i["\uc9d1\uacc4 \ubc29\uc2dd"],"\ud569\uacc4":i["\ud569\uacc4"],"\uac1c\uc218":i["\uac1c\uc218"],"\ud3c9\uade0":i["\ud3c9\uade0"],"\ucd5c\ub300\uac12":i["\ucd5c\ub300\uac12"],"\ucd5c\uc18c\uac12":i["\ucd5c\uc18c\uac12"],"\uc804\uccb4":r["\uc804\uccb4"],"\uc774\uc804 \uc5f0\ub3c4":i["\uc774\uc804 \uc5f0\ub3c4"],"\uc9c1\uc804\uc77c":i["\uc9c1\uc804\uc77c"],"\uc9c1\uc804\uc77c \ub3d9\uc77c \uae30\uac04":i["\uc9c1\uc804 \ub3d9\uc77c \uae30\uac04"],"\uc0ac\uc6a9\uc548\ud568":r["\uc0ac\uc6a9\uc548\ud568"],"\ucd5c\uadfc 30\uc77c\uac04":s["\ucd5c\uadfc 30\uc77c\uac04"],"\ucd5c\uadfc 7\uc77c\uac04":s["\ucd5c\uadfc 7\uc77c\uac04"],"\uc0c9\uc0c1":r["\uc0c9\uc0c1"],"\uc0c9\uc0c1 \ubcc0\uacbd":r["\uc0c9\uc0c1 \ubcc0\uacbd"],"\ub370\uc774\ud130":i["\ub370\uc774\ud130"],"\uc0ac\uc6a9\uc790 \uc124\uc815":s["\uc0ac\uc6a9\uc790 \uc124\uc815"],"\ubbf8\ub9ac\ubcf4\uae30":r["\ubbf8\ub9ac\ubcf4\uae30"],"\uc0c8 \uce74\ub4dc":i["\uc0c8 \uce74\ub4dc"],"\uc774\ub984":r["\uc774\ub984"],"\uce74\ub4dc":i["\uce74\ub4dc"],"\uc9d1\uacc4 \uae30\uac04":i["\uc9d1\uacc4 \uae30\uac04"],"\ube44\uad50 \uae30\uac04":i["\ube44\uad50 \uae30\uac04"],"\uc81c\ubaa9\uc740 0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4":GO.i18n(s["\uc81c\ubaa9\uc740 0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"20"})};return e.View.extend({events:{'click span[id="stateColor"]':"toggleColorPickerByWorks","change #aggRangeOption":"toggleAggRangeOption","change #compareRangeOption":"toggleCompareRangeOption","change #title":"_validateTitle","change #cid":"_onChangeCid"},initialize:function(e){this.model=e.model,this.appletId=e.appletId,this.fields=e.fields,this.chartFields=this.fields.getChartFields(),$.datepicker.setDefaults($.datepicker.regional[GO.config("locale")])},render:function(){return this.$el.html(t({lang:a,title:this.model.get("title"),aggStartDate:this.model.get("aggStartDate"),aggEndDate:this.model.get("aggEndDate"),compareStartDate:this.model.get("compareStartDate"),compareEndDate:this.model.get("compareEndDate"),model:this.model,chartFields:this.chartFields.toJSON()})),this._load(),this},toggleColorPickerByWorks:function(e){n.show(e.target,"works")},onChangeStateColor:function(e,t){this.setColer(e.target,t)},setColer:function(e,t){$(e).attr("class","chip"),$(e).addClass("bgcolor"+t),$(e).attr("color",t)},save:function(){this.model.set("title",this.$("#title").val()),this.model.set("cid",this.$("#cid").val()),this.model.set("method",this.$("#method").val()),this.model.set("aggRangeOption",this.$("#aggRangeOption").val()),this.model.set("compareRangeOption",this.$("#compareRangeOption").val()),this.model.set("color",this.$("#stateColor").attr("color")),this.model.set("aggStartDate",this.$("#aggStartDate").val()),this.model.set("aggEndDate",this.$("#aggEndDate").val()),this.model.set("compareStartDate",this.$("#compareStartDate").val()),this.model.set("compareEndDate",this.$("#compareEndDate").val())},isValid:function(){return this._validateTitle()?!0:!1},_validateTitle:function(){var e=this.$el.find("#title").val();return e.length<1||e.length>20?($.goError(GO.i18n(r["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:1,arg2:20}),this.$("#title"),!1,!0),!1):!0},_onChangeCid:function(){var e=this.$el.find("#cid :selected").attr("data-value-type");"NUMBER"===e?(this.$el.find("#method").children().remove(),this.$el.find("#method").append(o.render({lang:a}))):(this.$el.find("#method").children().not("[value=COUNT]").remove(),this.$el.find("#method").val("COUNT"))},_load:function(){this.setColer(this.$("#stateColor"),this.model.get("color")),this.$("#cid").val(this.model.get("cid")),this.$("#method").val(this.model.get("method")),this.$("#cid").trigger("change"),this.$("#aggRangeOption").val(this.model.get("aggRangeOption")),this.$("#compareRangeOption").val(this.model.get("compareRangeOption")),this.$("#aggRangeOption").trigger("change"),this.$("#compareRangeOption").trigger("change"),this.$el.on("changed:chip-color.works",".chip",$.proxy(this.onChangeStateColor,this)),this.initDatepicker(),this.setDiffrenceBetween(this.model.get("aggStartDate"),this.model.get("aggEndDate"),this.$("#aggDiffDate")),this.setDiffrenceBetween(this.model.get("compareStartDate"),this.model.get("compareEndDate"),this.$("#compareDiffDate"))},toggleAggRangeOption:function(){var e=this.$("#aggRangeOption").val();"CUSTOM"==e?(this.$("#aggRangeCustomWrap").show(),this.aggStartDate=this.$("#aggStartDate").val(),this.aggEndDate=this.$("#aggEndDate").val()):this.$("#aggRangeCustomWrap").hide(),"ALL"==e?(("SAME_DAY"==this.$("#compareRangeOption").val()||"ONE_YEAR_AGO"==this.$("#compareRangeOption").val())&&this.$("#compareRangeOption").val("DONE"),this.$("option[ONE_YEAR_AGO]").remove(),this.$("option[SAME_DAY]").remove()):("WEEK"==e?(this.aggStartDate=GO.util.now().add("days",-6).format("YYYY-MM-DD"),this.aggEndDate=GO.util.now().format("YYYY-MM-DD")):"MONTH"==e&&(this.aggStartDate=GO.util.now().add("days",-29).format("YYYY-MM-DD"),this.aggEndDate=GO.util.now().format("YYYY-MM-DD")),this.$("#compareRangeOption").children().remove(),this.$("#compareRangeOption").append(u.render({lang:a})),this.$("#compareRangeOption").val(this.model.get("compareRangeOption"))),this.toggleCompareRangeOption()},toggleCompareRangeOption:function(){var e=this.$("#aggRangeOption").val(),t=this.$("#compareRangeOption").val();if("CUSTOM"==t)this.$("#compareRangeCustomWrap").show(),this.$("#compareStartDate").attr("disabled",!1),this.$("#compareEndDate").attr("disabled",!1);else if("ALL"==e||"DONE"==t)this.$("#compareRangeCustomWrap").hide();else{this.$("#compareRangeCustomWrap").show(),this.$("#compareStartDate").attr("disabled",!0),this.$("#compareEndDate").attr("disabled",!0);var n=this.getDiffrenceBetween(this.aggStartDate,this.aggEndDate);"SAME_DAY"==t?(this.$("#compareStartDate").val(GO.util.toMoment(this.aggStartDate).add("days",-1).add("days",n).format("YYYY-MM-DD")),this.$("#compareEndDate").val(GO.util.toMoment(this.aggStartDate).add("days",-1).format("YYYY-MM-DD"))):"ONE_DAY_AGO"==t?(this.$("#compareStartDate").val(GO.util.toMoment(this.aggEndDate).add("days",-1).add("days",n).format("YYYY-MM-DD")),this.$("#compareEndDate").val(GO.util.toMoment(this.aggEndDate).add("days",-1).format("YYYY-MM-DD"))):"ONE_YEAR_AGO"==t&&(this.$("#compareStartDate").val(GO.util.toMoment(this.aggStartDate).add("years",-1).format("YYYY-MM-DD")),this.$("#compareEndDate").val(GO.util.toMoment(this.aggEndDate).add("years",-1).format("YYYY-MM-DD"))),this.setDiffrenceBetween(this.$("#compareStartDate").val(),this.$("#compareEndDate").val(),this.$("#compareDiffDate"))}},initDatepicker:function(){var e=this;this.$("#aggStartDate").datepicker({dateFormat:"yy-mm-dd",changeMonth:!0,changeYear:!0,yearSuffix:"",onClose:function(t){t&&(e.$("#aggEndDate").datepicker("option","minDate",t),e.aggStartDate=t,e.aggEndDate=e.$("#aggEndDate").val(),e.setDiffrenceBetween(e.aggStartDate,e.aggEndDate,e.$("#aggDiffDate")),e.toggleCompareRangeOption())}}),this.$("#aggEndDate").datepicker({dateFormat:"yy-mm-dd",changeMonth:!0,changeYear:!0,yearSuffix:"",minDate:e.model.get("aggStartDate"),onClose:function(t){t&&(e.aggStartDate=e.$("#aggStartDate").val(),e.aggEndDate=t,e.setDiffrenceBetween(e.aggStartDate,e.aggEndDate,e.$("#aggDiffDate")),e.toggleCompareRangeOption())}}),this.$("#compareStartDate").datepicker({dateFormat:"yy-mm-dd",changeMonth:!0,changeYear:!0,yearSuffix:"",onClose:function(t){if(t){e.$("#compareEndDate").datepicker("option","minDate",t);var n=e.$("#compareEndDate").val();e.setDiffrenceBetween(t,n,e.$("#compareDiffDate"))}}}),this.$("#compareEndDate").datepicker({dateFormat:"yy-mm-dd",changeMonth:!0,changeYear:!0,yearSuffix:"",minDate:e.model.get("compareStartDate"),onClose:function(t){if(t){var n=e.$("#compareStartDate").val();e.setDiffrenceBetween(n,t,e.$("#compareDiffDate"))}}})},getDiffrenceBetween:function(e,t){return GO.util.toMoment(e).diff(GO.util.toMoment(t),"day")},setDiffrenceBetween:function(e,t,n){var r=-this.getDiffrenceBetween(e,t)+1;n.html(r+" "+i["\uc77c"])}})});