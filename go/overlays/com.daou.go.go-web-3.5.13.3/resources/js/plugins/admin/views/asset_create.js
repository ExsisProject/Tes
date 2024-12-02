define([
    "jquery", 
    "backbone", 
    "app",  
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
	"i18n!asset/nls/asset",
    "hgn!admin/templates/asset_create",
    "admin/views/asset_group_list",
    "hgn!board/templates/board_create_manager",
    "hgn!admin/templates/asset_modify",
    "admin/models/base_model",
    "jquery.go-orgslide",
    "jquery.go-sdk",
    "jquery.go-validation",
    "jquery.go-popup"
], 

function(
	$, 
	Backbone,
	App, 
	commonLang,
	adminLang,
	assetLang,
	TplAssetCreate,
	TplGroupList,
	TplBoardCreateManager,
	TplAssetModify,
	AssetModel
) {
	var lang = {
		'asset_basic_info' : adminLang['기본정보'],
		'asset_add_info' : adminLang['자산 등록정보'],
		'asset_name' : adminLang['자산명'],
		'book_setting' : adminLang['예약/대여 설정'],
		'loop_reservation_setting' : adminLang['반복예약 허용'],
		'asset_rent' : adminLang['대여'],
		'asset_book' : adminLang['예약'],
		'asset_rent_info' : adminLang['대여로 설정시, 반납 예정일을 설정하지 않습니다.'],
		'asset_time' : adminLang['사용 시간'],
		'asset_week' : adminLang['사용 요일'],
		'asset_mon' : adminLang['월'],
		'asset_tue' : adminLang['화'],
		'asset_wed' : adminLang['수'],
		'asset_thu' : adminLang['목'],
		'asset_fri' : adminLang['금'],
		'asset_sat' : adminLang['토'],
		'asset_sun' : adminLang['일'],
		'asset_cal' : adminLang['캘린더 연동'],
		'asset_use' : adminLang['사용함'],
		'asset_no_use' : adminLang['사용안함'],
		'asset_use_info' : adminLang['캘린더에서 일정 등록시, 자산 예약을 사용할 것인지 설정합니다.'],
		'asset_use_auth' : adminLang['이용 권한'],
		'asset_use_all' : adminLang['전체 허용'],
		'asset_use_part' : adminLang['일부만 허용'],
		'asset_save' : commonLang['저장'],
		'asset_cancel' : commonLang['취소'],
		'asset_manager' : adminLang['운영자'],
		'asset_manager_select' : adminLang['운영자 추가'],
		'alert_admin_add' : adminLang['운영자를 추가하셔야 합니다.'],
		'alert_no_change' : adminLang['예약/대여 설정은 나중에 변경하실 수 없습니다.'],
		'alert_calendar' : adminLang['캘린더에서 일정 등록시, 예약을 사용할 것인지 설정합니다.'],
		'no_title' : adminLang['자산명을 입력하셔야합니다.'],
		'alert_length' : adminLang['0자이상 0이하 입력해야합니다.'],
		'asset_stop' : adminLang['사용 중지'],
		'asset_stop_confirm' : adminLang['기존에 예약했던 데이터가 삭제됩니다.<br>중지하시겠습니까?'],
		'asset_delete' : adminLang['자산 삭제'],
		'asset_delete_confirm' : adminLang['자산 데이터가 삭제됩니다.<br>삭제하시겠습니까?'],
		'asset_delete' : commonLang['삭제'],
		'asset_modify' : commonLang['저장'],
		'asset_no_owner' : adminLang['미지정'],
		'asset_stop_alert' : adminLang['자산의 사용을 중지합니다.'],
		'asset_delete_alert' : adminLang['자산에 대한 모든 데이터를 삭제합니다.'],
		'add_manager_alert' : adminLang['열람자를 추가해주세요.'],
		'asset_time_alert' : adminLang['시간 설정'],
		'modify' : commonLang['수정'],
		'del' : commonLang['삭제'],
		'asset_allow_anonym' : assetLang['익명허용'],
		'allow': commonLang['허용'],
		'disallow': commonLang['허용하지 않음'],
		'always_anonym': assetLang['항상 익명으로 예약']
	};
	var instance = null;
	var manageList = Backbone.View.extend({
		unbindEvent: function() {
			this.$el.off("click", "input[name=type]:radio");
			this.$el.off("click", "input[name=share]:radio");
			this.$el.off("click", "span[data-btntype='publicDelete']");
			this.$el.off("click", "span[data-btntype='publicModify']");
			this.$el.off("click", "#selectManager");
			this.$el.off("click", "ul.name_tag li span.ic_del");
			this.$el.off("click", "span.btn[data-btntype='submit']");
			this.$el.off("click", "span.btn[data-btntype='modify']");
			this.$el.off("click", "span.btn_nega[data-btntype='cancel']");
			this.$el.off("click", "#deleteFlag");
			this.$el.off("click", "#statusFlag");
			this.$el.off("click", "#statusFlag");
			this.$el.off("click", "input[name=allowAnonym]");
			
		},
		bindEvent : function() {
			
			this.$el.on("click", "input[name=type]:radio", $.proxy(this.toggleTypeRadio, this));
			this.$el.on("click", "input[name=share]:radio", $.proxy(this.togglePublicRadio, this));
			this.$el.on("click", "span[data-btntype='publicDelete']", $.proxy(this.deletePublicRange, this));
			this.$el.on("click", "span[data-btntype='publicModify']", $.proxy(this.modifyPublicRange, this));
			this.$el.on("click", "#selectManager", $.proxy(this.addManager, this));
			this.$el.on("click", "ul.name_tag li span.ic_del", $.proxy(this.deleteMember, this));
			this.$el.on("click", "span.btn[data-btntype='submit']", $.proxy(this.createAsset, this));
			this.$el.on("click", "span.btn[data-btntype='modify']", $.proxy(this.modifyAsset, this));
			this.$el.on("click", "span.btn_nega[data-btntype='cancel']", $.proxy(this.cancelAsset, this));
			this.$el.on("click", "#deleteFlag", $.proxy(this.checkDeleteFlag, this));
			this.$el.on("click", "#statusFlag", $.proxy(this.checkStatusFlag, this));
			this.$el.on("click", "#DayOfWeek span input", $.proxy(this.checkWeek, this));
			this.$el.on("click", "input[name=allowAnonym]", $.proxy(this._onClickAnonymOption, this));
		},
		checkWeek : function(){
			var inputcheckEl = $('#DayOfWeek span input:checked');
			if(inputcheckEl.length < 2){
				inputcheckEl.attr('disabled',true);
			}else{
				inputcheckEl.attr('disabled',false);
			}
		},
		checkStatusFlag : function(){
			if($('#statusFlag').is(':checked')){
				 $.goConfirm( lang.asset_stop, lang.asset_stop_confirm, function() {
					 $('#statusFlag').attr("checked", true);
					 return false;
				 });
				 $('#statusFlag').attr("checked", false);
			}else{
				$('#statusFlag').attr("checked", false);
			}
		},
		checkDeleteFlag : function(){
			 if($('#deleteFlag').is(':checked')){
				 $.goCaution( lang.asset_delete, lang.asset_delete_confirm, function() {
					 $('#deleteFlag').attr('checked',true);
					 $('#statusFlag').attr("disabled", true);
					 return false;
				 });
				 $('#deleteFlag').attr('checked',false);
			 }else{
				 $('#statusFlag').attr("disabled", false);
			 }
		},
		initialize: function(options) {
			this.options = options || {};
			this.assetId = this.options.assetId;
		},
		render : function() {
			this.unbindEvent();
			this.bindEvent();
			
			this.sendCheck = false;
			var tmpl;
			if(this.assetId){
				this.assetModel = new AssetModel({
					id : this.assetId,
					urlRoot : GO.contextRoot + "ad/api/asset"
				});
				this.assetModel.fetch({
					async : false
				});
				this.assetData = this.assetModel.toJSON();
				var type = function(){
					if(this.useRental){
						return false;
					}
					return true;
				};
				tmpl = TplAssetModify({
						dataset:this.assetData,
						type:type,
						lang:lang
					});
				this.$el.html(tmpl);
				this.initModifyForm(this.assetData);
			}else{
				tmpl = TplAssetCreate({
					lang:lang
					});
				this.$el.html(tmpl);				
			}			 
			
		},
		initModifyForm :function(data){
			
			var _this = this;
			
			if(data.availabilityDate){
				$('#startTime').val(data.availabilityDate.startTime);
				$('#endTime').val(data.availabilityDate.endTime);
				
				var dayOfWeek = $("#DayOfWeek").find("input");
				$.each(data.availabilityDate.ableDays.split(''), function(k,v){
					if(v == "1") {
						dayOfWeek[k].checked = true;
					}
				});
				
				this.$el.find('input[name="useCalendar"][value="'+data.availabilityDate.useCalendar+'"]').attr('checked', true);
				
				this.checkWeek();
				
			}else{
				this.setDisable(true);
			}
			
			this.$el.find('input[name="share"][value="'+data.publicFlag+'"]').attr('checked', true);
			
			$.each(data.managers, function(k,v) {
				_this.setManager(v.user);
			});			
			
			if(!data.publicFlag){
				$(".option_display").show();
				 $("#partPublicWrap").show();
				 $("#groupUl").show();
				 TplGroupList.render({id:"#partPublicWrap",type:"add"});
				 $.each(data.owners, function(k,v){
					 _this.setJointOwners(v);
				 });
			}
			
			if(data.status == "STOP"){
				$("#statusFlag").attr('checked',true);
			}

            if(!!data.allowLoopReservation) {
                $('#allowLoopReservation').trigger('click');
            } else {
                $('#disallowLoopReservation').trigger('click');
            }

			if(!!data.allowAnonym) {
				$('#allowAnonym').trigger('click');
				$('#alwaysAnonym').prop('checked', !!data.alwaysAnonym);
			} else {
				$('#disallowAnonym').trigger('click');
			}
		},
		setManager : function(managers){
			
			var targetEl = $('#assetManagerList');
			if(managers && !targetEl.find('li[data-id="'+managers.id+'"]').length) {
				targetEl.find('li.creat').before(TplBoardCreateManager($.extend(managers, { lang : lang })));
			}else{
				$.goAlert('', adminLang["이미 운영자로 지정"]);
			}
		},
		setJointOwners : function(jointOwners){
			var targetEl = $('#groupUl');
			var liList;
			
			if(jointOwners.ownerShip == "MASTER"){
				return;
			}
			var ownerInfo = jointOwners.ownerInfo.split("|");
			var ownerInfoLang, ownerDetail;

			ownerInfoLang = ownerInfo[0];
			ownerDetail   = ownerInfo[1];
			if (ownerInfo == "") {
				ownerInfoLang = lang.asset_no_owner;
				ownerDetail = lang.asset_no_owner;
			}
						
			liList = "<li data-code='"+jointOwners.ownerId+"'>"+
						  "<span class='major'>["+ownerInfoLang+" : "+ownerDetail+"]</span>"+
						  "<span class='btn_border'><span class='ic ic_edit' title='"+lang.modify+"' data-btntype='publicModify'></span></span>"+
						  "<span class='btn_border'><span class='ic ic_delete' title='"+lang.del+"' data-btntype='publicDelete'></span></span>"+
					  "</li>";
			targetEl.append(liList);
		},
		setOwners : function(sharedFlag){
			var owners = [];
			
			if(sharedFlag == "false"){
				var sharedListPart = $('#groupUl').find('li');
				if(sharedListPart.length < 1){
					return false;
				}
				sharedListPart.each(function(){
					owners.push({
						ownerShip : 'MODERATOR',
						ownerType : 'DomainCode', 
						ownerId : $(this).attr('data-code')						
					});
				});
				
			}
			return owners;
		},
		setManagerIds : function(){
			var managerIds =[];
			var managerIdPart = $('#assetManagerList').find('li[data-id]');
			
			managerIdPart.each(function(){
				managerIds.push($(this).attr('data-id'));
			});
			return managerIds;
		},
		getAvailabilityData : function(){
			var startTime = $('#startTime').val();
			var endTime = $('#endTime').val();
			var dayOfWeek = $("#DayOfWeek").find("input");
			var weekStr = "";
			dayOfWeek.each(function(){
				if($(this).attr("checked")){
					weekStr = weekStr + "1";
				}else{
					weekStr = weekStr + "0";
				}
			});
			var useCalendar = $('input[name=useCalendar]:radio:checked').val();
			var availabilityDate;
			availabilityDate = {
					startTime : startTime,
					endTime : endTime,
					ableDays : weekStr,
					useCalendar : useCalendar,
					timeInterval : 'A_HOUR'
			};
			return availabilityDate;
		},
		timeIntervalValidator : function(startTime, endTime) {
			if (startTime >= endTime) {
				$.goMessage(lang.asset_time_alert);
				return false;
			}
			return true;
		},
		createAsset : function(){
			var _this = this;
			
			if(this.sendCheck){
				return;
			}

			this.sendCheck = true;
			var name = $.trim($('#name').val());
			var useRental = $('input[name="type"]:radio:checked').val();
			
			if($.trim(name) == ''){
				$.goMessage(lang.no_title);
				this.sendCheck = false;
				return;
			}
			
			if(!$.goValidation.isCheckLength(2,100,name)){
				$.goMessage(App.i18n(lang['alert_length'], {"arg1":"2","arg2":"100"}));
				$("#name").focus();
				this.sendCheck = false;
				return;
			}
			
			var availabilityDate = this.getAvailabilityData();
			// 예약 시간 Validate
			if(!this.timeIntervalValidator(availabilityDate.startTime, availabilityDate.endTime)) {
				this.sendCheck = false;
				return;
			}

			var publicFlag = $('input[name=share]:radio:checked').val();
			var owners = this.setOwners(publicFlag);
			
			if(!owners){
				this.sendCheck = false;
				$.goMessage(lang.add_manager_alert);
				return;
			}
			
			var managerIds  = this.setManagerIds();
			
			if($('#assetManagerList').find('li').length < 2){
				$.goMessage(lang.alert_admin_add);
				this.sendCheck = false;
				return;
			}

            var allowAnonym = $('#allowAnonym').is(':checked');
            var alwaysAnonym = allowAnonym && $('#alwaysAnonym').is(':checked');
			var allowLoopReservation = $('#allowLoopReservation').is(':checked');
			if (useRental === "true") {
				allowLoopReservation = false;
			}
			var url = GO.contextRoot + "ad/api/asset";				
			var data = {
                name:name,
                useRental:useRental,
                availabilityDate:availabilityDate,
                publicFlag:publicFlag,
                managerIds:managerIds,
                owners:owners,
                allowAnonym: allowAnonym,
                alwaysAnonym: alwaysAnonym,
				allowLoopReservation: allowLoopReservation,
            };
			
			$.ajax(url, {
				type : 'POST',
                contentType: 'application/json',
                data : JSON.stringify(data),
				success : function(rs) {
					if(rs.code == 200) {
						App.router.navigate('/asset', true);
					}
				},

                complete: function() {
                    _this.sendCheck = false;
                }
			});
		},
		modifyAsset : function(){
			var _this = this;
			var assetId = $("#assetId").val();
			var name = $("#name").val();

            if(this.sendCheck){
                return;
            }
            this.sendCheck = true;

			if($.trim(name) == ''){
				$.goMessage(lang.no_title);
				return;
			}
			
			if(!$.goValidation.isCheckLength(2,100,name)){
				$.goMessage(App.i18n(lang['alert_length'], {"arg1":"2","arg2":"100"}));
				$("#name").focus();
				return;
			}
			
			var status = "ACTIVE";
			if($('#statusFlag').is(':checked')){
				status = "STOP";
			}
			var availabilityDate = this.getAvailabilityData();
			// 예약 시간 Validate
			if(!this.timeIntervalValidator(availabilityDate.startTime, availabilityDate.endTime)) {
				return;
			}

			var publicFlag = $('input[name=share]:radio:checked').val();
			var owners = this.setOwners(publicFlag);
			if (!owners) {
				$.goMessage(lang.add_manager_alert);
				return; 
			}

            var managerIds  = this.setManagerIds();
			
			if($('#assetManagerList').find('li').length < 2){
				$.goMessage(lang.alert_admin_add);
				return;
			}

            var allowAnonym = $('#allowAnonym').is(':checked');
            var alwaysAnonym = allowAnonym && $('#alwaysAnonym').is(':checked');
			var allowLoopReservation = $('#allowLoopReservation').is(':checked');

			var qryType = 'PUT';
			var url = GO.contextRoot + "ad/api/asset/"+assetId;
			var data = {};
			
			if($('#deleteFlag').is(':checked')){
				qryType = 'DELETE';
				this.modifyAction(url,qryType,data);
			}else{
                data = {
                    name:name,
                    status:status,
                    availabilityDate:availabilityDate,
                    publicFlag:publicFlag,
                    managerIds:managerIds,
                    owners:owners,
                    allowAnonym: allowAnonym,
                    alwaysAnonym: alwaysAnonym,
					allowLoopReservation: allowLoopReservation
                };
				this.modifyAction(url,qryType,data);
			}
		},		
		modifyAction : function(url,qryType,data){
            var _this = this;

			$.ajax(url, {
				type : qryType,
                contentType: 'application/json',
                data : JSON.stringify(data),
				success : function(rs) {
					if(rs.code == 200) {
						App.router.navigate('/asset', true);
					}
				},

                complete: function() {
                    _this.sendCheck = false;
                }
			});
		},
		cancelAsset : function(){
			App.router.navigate('/asset', true);
		},
		addManager : function(e){
			var _this = this;
			var popupEl = $.goOrgSlide({
				header : lang.asset_manager_select,
				desc : '',
				callback : _this.setManager,
				target : e,
				isAdmin : true,
				contextRoot : GO.contextRoot
			});
		},
		deleteMember : function(e) {
			$(e.currentTarget).parents('li').remove();
		},
		modifyPublicRange : function(e){
			$(e.currentTarget).parents('li').first().after('<li></li>');
			TplGroupList.render({id:$(e.currentTarget).parents('li').first().next('li'),type:"save"});
			$(e.currentTarget).parents('li').first().find('span.btn_border').css("display","none");
		},
		deletePublicRange : function(e){
			$(e.currentTarget).parents('li').first().remove();			
		},
		togglePublicRadio : function(e){
			 var radioVal = this.$el.find('input[name=share]:radio:checked').val();
			 if(radioVal == "false"){
				 $(".option_display").show();
				 $("#partPublicWrap").show();
				 $("#groupUl").show();
				 TplGroupList.render({id:"#partPublicWrap",type:"add"});
			 }else{
				 $(".option_display").hide();
				 $("#partPublicWrap").hide();
				 $("#groupUl").hide();
			 }
		},
		toggleTypeRadio : function(e){
			 var typeVal = this.$el.find('input[name=type]:radio:checked').val();
			 if(typeVal == "false"){
				 this.setDisable(false);
				 $('#loopReservation').show();
			 }else{
				 this.setDisable(true);
				 $('#loopReservation').hide();
			 }
		},
		setDisable : function(boolean){
			$('#startTime').attr("disabled", boolean);
			$('#endTime').attr("disabled", boolean);
			$('#DayOfWeek').find('input').attr("disabled", boolean);
			$('input[name=useCalendar]:radio').attr("disabled", boolean);
			
		},

		_onClickAnonymOption: function(e) {
            var $target = $(e.currentTarget);

			if($target.val() === 'true') {
				$('#alwaysAnonymOption').show();
			} else {
				$('#alwaysAnonymOption').hide();
			}
		}
	});
	return manageList;
});
