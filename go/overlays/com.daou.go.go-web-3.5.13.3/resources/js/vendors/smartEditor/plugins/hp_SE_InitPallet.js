nhn.husky.SE_InitPallet = jindo.$Class({

    name : "SE_InitPallet",
    bUsePallet : true,     //팔레트 사용여부
    bUseApprovalType : '',  // 전자결재용 양식에디터 사용여부
    approvalInfo : [],      // 결재방 관련 정보

    $init : function(bUsePallet, bUseApprovalType, approvalInfo){
    	this.nomalArea = jindo.$Element('nomalPallet');
		this.approvalArea = jindo.$Element('approvalPallet');
		this.officialArea = jindo.$Element('officialPallet');

		if(!bUsePallet){
			jindo.$Element(cssquery(".editor_wrap")[0]).css('margin-right','3px');
			return;
		}

		//설정이 없거나, 사용하겠다고 표시한 경우 전자결재용 팔레트 보이도록 처리  nomalPallet, approvalPallet
		if( typeof(bUseApprovalType) == 'undefined' || bUseApprovalType === ''){
			//일반 양식폼
			this.nomalArea.show();
			this.approvalArea.hide();
			this.officialArea.hide();
		}else{
			//결재 양식폼. approvalInfo를 파싱하여 li를 생성후 붙여야함.
			this.nomalArea.hide();
			
			if(bUseApprovalType == 'official'){
				//에디터 높이에 따라 팔레트 높이도 보정함.
				this.approvalArea.hide();
				this.officialArea.show();
				//에디터 높이에 따라 팔레트 높이도 보정함.
				var editorHeight = jindo.$Element('smart_editor2').height();

				jindo.$Element('officialPallet').css("height",(editorHeight-2)+"px");

				var wrapObject = cssquery(".pallet_item_wrap");

				for(var i=0 ; i < wrapObject.length ; i++){
		    		jindo.$Element(wrapObject[i]).css("height",(editorHeight-32)+"px");
		    	}
			}else{
				this.approvalArea.show();
				this.officialArea.hide();
				// #customApprovalWrap 에 아래와 같은 마크업으로 붙임.
				//<li class="custom_approval" data-info=""><span class="ic_pallet"></span><span class="txt" class="custom_approval" data-info="">이름</span></li>
				var eltype1,
					eltype2;

				if (approvalInfo.hasOwnProperty('models')) {
					approvalInfo.each(function(info) {
						var jsonInfo = info.toJSON();
						appendItem(jsonInfo);
					});
				} else {
					for(var i = 0 ; i < approvalInfo.length ; i++){
						appendItem(approvalInfo[i]);
					}
				}

				function appendItem(object) {
					eltype1 = "<li><button class='custom_approval' data-info='"+$Json(object)+"' data-type='type1'>"+
						"<span class='ic_pallet' delete></span>"+
						"<span class='txt' class='custom_approval' data-info='"+$Json(object)+"' data-type='type1'>"+object.name+" - type1</span>"+
						'</button><span class="ic_pallet ic ic_undo"></span></li>';

					eltype2 = "<li><button class='custom_approval' data-info='"+$Json(object)+"' data-type='type2'>"+
						"<span class='ic_pallet'></span>"+
						"<span class='txt' class='custom_approval' data-info='"+$Json(object)+"' data-type='type2'>"+object.name+" - type2</span>"+
						'</button><span class="ic_pallet ic ic_undo"></span></li>';

					jindo.$Element('customApprovalWrap').append($(eltype1)).append($(eltype2));
				}

				for(var i = 0 ; i < 1 ; i++) {

				    // TODO: 다국어 처리
				    var receptionLabel = "수신",
				        receptionData = {
				            "name":"수신",
				            "seq":approvalInfo.length,
				            "maxApprovalCount":7,
				            "isReception" : true,
				            "activities":[]
				        };

				    eltype1 = "<li><button class='custom_approval' data-info='"+$Json(receptionData)+"' data-type='type1'>"+
	                "<span class='ic_pallet'></span>"+
	                "<span class='txt' class='custom_approval' data-info='"+$Json(receptionData)+"' data-type='type1'>" + receptionLabel + " - type1</span>"+
	              '</button><span class="ic_pallet ic ic_undo"></span></li>';

	                eltype2 = "<li><button class='custom_approval' data-info='"+$Json(receptionData)+"' data-type='type2'>"+
	                "<span class='ic_pallet'></span>"+
	                "<span class='txt' class='custom_approval' data-info='"+$Json(receptionData)+"' data-type='type2'>" + receptionLabel + " - type2</span>"+
	              '</button><span class="ic_pallet ic ic_undo"></span></li>';

	                jindo.$Element('receptionApprovalWrap').append($(eltype1)).append($(eltype2));                
				}
				
				//합의 컴포넌트
				for(var i = 0 ; i < 1 ; i++) {

				    // TODO: 다국어 처리
				    var agreementLabel = "합의",
				    	agreementData = {
				            "name":"합의",
				            "seq":approvalInfo.length,
				            "maxApprovalCount":1,
				            "isAgreement" : true,
				            "activities":[]
				        };

				    eltype1 = "<li><button class='custom_agreement' data-info='"+$Json(agreementData)+"' data-type='type1'>"+
	                "<span class='ic_pallet'></span>"+
	                "<span class='txt' class='custom_agreement' data-info='"+$Json(agreementData)+"' data-type='type1'>" + agreementLabel + " - type1</span>"+
	              '</button><span class="ic_pallet ic ic_undo"></span></li>';

	                eltype2 = "<li><button class='custom_agreement' data-info='"+$Json(agreementData)+"' data-type='type2'>"+
	                "<span class='ic_pallet'></span>"+
	                "<span class='txt' class='custom_agreement' data-info='"+$Json(agreementData)+"' data-type='type2'>" + agreementLabel + " - type2</span>"+
	              '</button><span class="ic_pallet ic ic_undo"></span></li>';

	                jindo.$Element('customAgreementWrap').append($(eltype1)).append($(eltype2));                
				}

				//에디터 높이에 따라 팔레트 높이도 보정함.
				var editorHeight = jindo.$Element('smart_editor2').height();

				jindo.$Element('nomalPallet').css("height",(editorHeight-2)+"px");
				jindo.$Element('approvalPallet').css("height",(editorHeight-2)+"px");

				var wrapObject = cssquery(".pallet_item_wrap");

				for(var i=0 ; i < wrapObject.length ; i++){
		    		jindo.$Element(wrapObject[i]).css("height",(editorHeight-32)+"px");
		    	}				
			}
		}
    }
});