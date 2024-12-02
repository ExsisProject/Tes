/* dependency: GO.Editor, nhn.husky.EZCreator */
(function(root, $) {	
	
	var defaultLang = 'ko';
	var defaultTheme = 'detail';
	var defaultContextRoot = '/';
	GO.Editor.registry('SmartEditor', {
		type: GO.Editor.TYPE_HTML,
		afterFilter: [removeEmptyStringFilter], 
		contentSetter: setEditorContent, 
		contentGetter: getEditorContent, 
		
		defaults: function() {
			return {
				contextRoot : defaultContextRoot, 
				lang : defaultLang,
				resizable: true,	// 입력창 크기 조절바 사용 여부 (true:사용/ false:사용하지 않음) 
				theme: defaultTheme,
				onLoad: function() {}, 
				onUnload: function() {},
				useToolbar: true, 
				usePallet : false,				// 양식편집기용 파레트 사용 여부
				bUseApprovalType : '',			// 보고서용 : '', 전자결재용 : 'approval', 공문발송용 : 'official'
				content : '',
				approvalInfo : {}
			}
		},  
		
		oEditors: [], 
		editorWrapFrame: null, 
		editorWrapContent: null, 
		editorFrame: null, 
		editorContent: null, 
		editorFontInfo : null,
		
		/**
		 * @Override
		 * @name: initialize
		 */
		initialize: function(ctx, options) {
			options.lang = convertStandardLocaleCode(options.lang);
			if(isSupportSmartEditor()) {
				this.__super__.initialize.call(this, ctx, options);
			} else {
				console.warn('SmartEditor가 설치되지 않았습니다.');
			}
		}, 
		
		destroy: function() {
			this.oEditors = [];
			this.$el.siblings('iframe').remove();
			this.onUnload(this);
		}, 
		
		/**
		 * @Override
		 * @name: render
		 */
		render: function() {			
			var _this = this;
			//TO DO 파일을 최초에 한번만 호출하도록 리팩토링
            $.getJSON(this.options.contextRoot + "resources/js/conf/editor/editor.config.json", function(data){
              _this.editorFontInfo = data;
              nhn.husky.EZCreator.createInIFrame(convertToSEOptions.call(_this, _this.options));
              return _this;
            });
		}, 		
		
		/**
		 * @Override
		 * @name: getContent
		 * @description: 에디터 로드시 콜백
		 */
		onLoad: function() {
			var selector = '#' + this.idAttr;
			    		
			this.editorWrapFrame = $("#modeHtmlWrapper iframe:eq(0)");
			this.editorWrapContent = this.editorWrapFrame.contents();
			this.editorFrame = this.editorWrapContent.find("#se2_iframe");
			this.editorContent = this.editorFrame.contents();
			
			this.editorWrapContent.find("#writeModeSelect,#writeLetterSelect,#writeTemplateSelect")
				.mouseover(function() {
					$(this).addClass("hover");
				})
				.mouseout(function() {
					$(this).removeClass("hover");
				});
			
			setDefaultFont.call(this);
    		
    		// content 옵션이 있을 경우 
    		if(this.options['content']) {
    			this.setContent(this.options['content']);
    		}
			
			// TODO: 삭제 대상(호환성을 위해서...)
			if(!window.oEditors) {
				window.oEditors = this.oEditors;
			}
			
			// TODO: 삭제 대상(호환성을 위해서...)
			$(selector)
				.addClass('targetEditor')
				.data('smarteditor-ref', this.oEditors);

			/**
			 * 디자인팀 요청사항. 에디터의 min-width 를 제거해달라는 요청인데,
			 * min-width 는 smart editor core 에서 삽입하고 있는 기본 속성이라 옵션으로 제거 할 수 없다.
			 * load 가 완료된 후 제거하도록 하자.
			 */
			//if (this.options.theme == 'detail') {
			//	var iframe = this.$el.siblings('iframe')[0];
			//	var style = iframe.contentWindow.document.getElementById('smart_editor2').style;
			//	style.cssText = style.cssText.replace(/(min-width:).+?(;[\s]?|$)/gi, '');
			//}

			this.options.onLoad(this);
		}, 
		
		focus: function() {
			getEditorObj.call(this).exec("FOCUS");
		}, 
		
		/**
		 * 
		 * [ 구조 ]
		 * #modeHtmlWrapper
		 * 	iframe
		 * 		#document
		 * 			#se2_iframe
		 */
		applyTemplate: function(oTemplateManager) {
			
			this.__super__.applyTemplate.apply(this, arguments);
			
			var self = this;
			var editorObj = getEditorObj.call(this);
			var templateInfo = {};
			var header = oTemplateManager.getHeader();
			var footer = oTemplateManager.getFooter();
			var bgImg = oTemplateManager.getBackgroundImg();
			
			if(header) {
				this.editorWrapContent.find("#paperTopRow").html(header).show();
			}
			
			if(footer) {
				this.editorWrapContent.find("#paperBottomRow").html(footer).show();
			}
			
			this.editorWrapContent.find("textarea.se2_input_htmlsrc").css({"height":"300px","width":"600px"});
					
			oTemplateManager.setFrameHeight(this.editorWrapFrame.height());
			this.editorWrapFrame.css("height","600px");
			
			var editorContainerObj = this.editorWrapContent.find("div.husky_seditor_editing_area_container");
			oTemplateManager.setEditorHeight(editorContainerObj.height());
			editorContainerObj.css("height","300px");
			
			var frameStyle = { "width": "600px", "height": "300px"};
			var bodyStyle = { "height":"270px", "margin":"10px 25px"};
			
			if(bgImg) {
				frameStyle.background = bodyStyle.background = "url('" + bgImg + "') repeat-y scroll left top transparent";
			}
			
			this.editorFrame.css(frameStyle);
			this.editorContent.find("body").css(bodyStyle);
			
			setTimeout(function() {
				editorObj.exec("MSG_EDITING_AREA_RESIZE_STARTED");
				editorObj.exec("RESIZE_EDITING_AREA_BY", [0, 0]);
				editorObj.exec("MSG_EDITING_AREA_RESIZE_ENDED");
				editorObj.exec("FOCUS");
			}, 500);
			
		},
		
		removeTemplate: function(oTemplateManager) {
			this.editorWrapContent.find("#paperTopRow").hide().empty();
			this.editorWrapContent.find("#paperBottomRow").hide().empty();
			this.editorWrapContent.find("textarea.se2_input_htmlsrc").css("width","");
			this.editorWrapContent.find("div.husky_seditor_editing_area_container").css({"width":"100%","height":oTemplateManager.getEditorHeight()});
			
			this.editorFrame.css({"width":"100%","height":"100%","background":"none"});
			this.editorContent.find("body").css({
				"background":"none",
				"height": oTemplateManager.getEditorHeight(), 
				"margin":""
			});
			
			this.focus();
		}, 
		
		/**
		 * HTML 타입 컨텐츠를 반환
		 */
		getHTMLContent: function() {
			return this.getContent();
		}, 
		
		/**
		 * MIME으로 컨텐츠를 반환
		 * 	- 스마트에디터는 지원안하므로 HTML 컨텐츠를 반환
		 */
		getMIMEContent: function() {
			return this.getContent();
		}
	});
	
	function removeEmptyStringFilter(content) {
		var result = content;
		
		var regx = /(\<br\>|\<p\>&nbsp;\<\/p\>){1}$/;
		if (regx.test(result)) { 
			result = result.replace(regx,'');
		}
		return result;
	}
	
	function setEditorContent(content, isAppend) {
		var editorObj = getEditorObj.call(this);
		
		if(!editorObj) {
			return;
		}
		
		if(isAppend || false) {
			getEditorObj.call(this).exec("PASTE_HTML", [content]);
		} else {
			getEditorObj.call(this).setContents(content);
		}
	}
	
	function getEditorContent() {
		return getEditorObj.call(this).getContents();
	}
	
	function getFontList(locale) {
		return {
			"ko": [
		        ["돋움,Dotum","돋움"],
		        ["돋움체,DotumChe,Sans-serif","돋움체"],
		        ["굴림,Gulim,Sans-serif","굴림"],
		        ["굴림체,GulimChe,Sans-serif","굴림체"],
		        ["바탕,Batang,serif","바탕"],
		        ["바탕체,BatangChe,serif","바탕체"],
		        ["궁서,Gungsuh,serif","궁서"],
		        ["Arial","Arial"],
		        ["Tahoma","Tahoma"],
		        ["Times New Roman","Times New Roman"],
		        ["Verdana","Verdana"],
		        ["맑은 고딕,malgun gothic","맑은 고딕"],
		        ["MS PGothic","MS PGothic"]
			],

			"en": [
				["dotum","dotum"],
				["AppleGothic","AppleGothic"],
				["Arial","Arial"],
				["Helvetica","Helvetica"],
				["sans-serif","sans-serif"]
	        ],

	        "ja": [
				["MS PGothic","MS PGothic"],
				["Osaka","Osaka"],
				["Arial","Arial"],
				["Comic Sans MS","Comic Sans MS"],
				["Courier New","Courier New"],
				["Tahoma","Tahoma"],
				["Times New Roman","Times New Roman"],
				["Verdana","Verdana"]
            ],

            "zh_CN": [
              	["dotum","dotum"],
				["AppleGothic","AppleGothic"],
				["Arial","Arial"],
				["Helvetica","Helvetica"],
				["sans-serif","sans-serif"]
			],

			"zh_TW": [
              	["dotum","dotum"],
				["AppleGothic","AppleGothic"],
				["Arial","Arial"],
				["Helvetica","Helvetica"],
				["sans-serif","sans-serif"]
			],
			
			"vi": [
				["dotum","dotum"],
				["AppleGothic","AppleGothic"],
				["Arial","Arial"],
				["Helvetica","Helvetica"],
				["sans-serif","sans-serif"]
	        ]
		}[locale];
	}

	function mergeFontList(fontList, addFontList){

        var lastFontList = fontList.concat(addFontList);

        // smarteditor.font.json 파일에 addFontList가 없으면 기본 폰트리스트만 반환(예전 파일유지)
        return (addFontList) ? lastFontList : fontList;

    }

	function setDefaultFont() {
		var instance = getEditorObj.call(this);
		var curLang = this.options.lang;

		var defaultFont = this.editorFontInfo[convertStandardLocaleCode(curLang)].defaultFont;
        var defaultFontSize = this.editorFontInfo[convertStandardLocaleCode(curLang)].defaultFontSize;

        if(defaultFont){
        	//에디터 iframe안의 body부분에 폰트와 폰트사이즈를 세팅        	
            instance.setDefaultFont(defaultFont,(defaultFontSize) ? parseInt(defaultFontSize) : 9);
            
            //에디터 UI상에 디폴트폰트와 사이즈를 세팅
            //body에 스타일을 set하는것과는 다르게 "맑은 고딕" 처럼 중간에 한칸 띄어쓰기로 문자열을 세팅해야 제대로 선택이 된다.(smarteditor 특성같음)
            setTimeout(function() {
              instance.exec("MSG_STYLE_CHANGED", ["fontFamily", defaultFont]);
              instance.exec("MSG_STYLE_CHANGED", ["fontSize", (defaultFontSize) ? defaultFontSize+"pt" : "9pt"]);
            },500);
        }
    }

	function convertToSEOptions(options) {
		return {
			oAppRef: this.oEditors,
			// 외부에서 변경하지 못하도록 한다.
			elPlaceHolder: this.idAttr,
			sSkinURI: options && options.sSkinURI ? options.sSkinURI : getEditorSkinPath(options.contextRoot, options.theme),
			htParams: {
				// 툴바 사용 여부 (true:사용/ false:사용하지 않음)
				bUseToolbar: options.useToolbar,
				// 입력창 크기 조절바 사용 여부 (true:사용/ false:사용하지 않음)
				bUseVerticalResizer: options.resizable,
				// 모드 탭(Editor | HTML | TEXT) 사용 여부 (true:사용/ false:사용하지 않음)
				bUseModeChanger: true,

				SE2M_FontName: {
					aDefaultFontList: mergeFontList(getFontList(convertStandardLocaleCode(options.lang)), this.editorFontInfo[convertStandardLocaleCode(options.lang)].additionalFont)
				}, 
				
				// [GO-16373] 보고 > 내용 작성 중 페이지에서 이탈할 때 윈도 Alert 이 뜨는 현상
				// http://dev.naver.com/projects/smarteditor/forum/20794 참고
				fOnBeforeUnload : function(){}, 
				
				/* 여기서 부터는 GO 커스터마이징 */
				// 팔레트 사용 여부 (true:사용/ false:사용하지 않음) default: false
				bUsePallet: options.usePallet, 
				// 전자결재용 에디터 사용여부
				bUseApprovalType: options.bUseApprovalType, 
				//팔레트에 보여줄 결재 정보 json
				approvalInfo: options.approvalInfo, 
				// locale code
				locale: convertStandardToSmartEditorLocaleCode(options.lang)
			}, 
			fOnAppLoad: this.options.fOnAppLoad || _.bind(this.onLoad, this), 
			fCreator: "createSEditor2"
		}
	}
	
	function getEditorSkinPath(contextRoot, theme) {
    	return contextRoot + 'smarteditor/'+ theme + '-skin';
    }

	/**
	 * mail과 go 에서 사용하는 로케일이 다름.
	 * mail : ko, jp, en,    cn,    tw
	 * go   : ko, ja, en, zh-cn, zh-tw
	 */
	function convertStandardLocaleCode(code) { // 잘못된 케이스가 더 있다면 추가 바람.
		return {
			'ko': 'ko', 'en': 'en', 'ja': 'ja',// 공통
			'jp': 'ja', 'cn': 'zh_CN', 'tw': 'zh_TW',// 메일
			'zh-cn': 'zh_CN', 'zh-tw': 'zh_TW', 'vi' : 'vi' // DO
		}[code] || code;
	}

	function convertStandardToSmartEditorLocaleCode(code) {
		return {'ko': 'ko_KR', 'ja': 'ja_JP', 'en': 'en_US', 'zh_CN': 'zh_CN', 'zh_TW': 'zh_TW', 'vi' : 'vi'}[code];
	}

	function getEditorObj() {
		return this.oEditors.getById[this.idAttr];
	}
	
	function isSupportSmartEditor() {
		return root.nhn && root.nhn.husky && root.nhn.husky.EZCreator;
	}
		
})(this, jQuery);