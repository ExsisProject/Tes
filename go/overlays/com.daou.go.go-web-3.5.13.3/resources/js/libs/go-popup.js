/**
 * @version	0.0.1
 * @require 	jQuery , go-style.css
 * @author 	hyungmin@daou.co.kr
 *
 * ex)
 * 		$.goPopup({
			header : lang['board_share_state_tiny'],
			contents : 'html OR text~~ '
			width : 480,
			buttons: [{
				btype : 'confirm',
				btext : lang['confirm'],
				callback : function() {
					alert(1);
				}
			}]
		});
 *
 */
(function($) {
	var GP = $.goPopup = function () {
		return GP.render(arguments[0]);
	};

	var locale = $('meta[name="locale"]').attr('content');
	$.extend(GP,{
		defaultLocale : 'ko',
		locale : locale || '',
		i18n : {
			'ko' : {
				"확인" : "확인",
		        "이동" : "이동",
		        "저장" : "저장",
		        "닫기" : "닫기",
		        "취소" : "취소",
		        "삭제" : "삭제",
		        "검색" : "검색"
			},
			'ja' : {
				"확인" : "確認",
				"이동" : "移動",
				"저장" : "保存",
				"닫기" : "閉じる",
				"취소" : "キャンセル",
				"삭제" : "削除",
				"검색" : "検索"
			},
			'en' : {
				"확인" : "OK",
				"이동" : "Move",
				"저장" : "Save",
				"닫기" : "Close",
				"취소" : "Cancel",
				"삭제" : "Delete",
				"검색" : "Search"
			},
			'zh_CN' : {
				"확인" : "确认",
				"이동" : "移动",
				"저장" : "保存",
				"닫기" : "关闭",
				"취소" : "取消",
				"삭제" : "删除",
				"검색" : "搜索"
			},
			'zh_TW' : {
				"확인" : "確認",
				"이동" : "移動",
				"저장" : "保存",
				"닫기" : "關閉",
				"취소" : "取消",
				"삭제" : "刪除",
				"검색" : "搜索"
			},
			'vi' : {
				"확인" : "Xác nhận",
				"이동" : "Di chuyển",
				"저장" : "Lưu",
				"닫기" : "Đóng",
				"취소" : "Hủy",
				"삭제" : "Xóa",
				"검색" : "Tìm kiếm"
			}
		}
	});

	if(!GP.locale || !GP.i18n.hasOwnProperty(GP.locale)){GP.locale = GP.defaultLocale;}

	$.extend(GP,{
		version : '1.6.4',
		defaults : {
			pid : 'gpopupLayer',
			targetEl : '.go_body',
			width : 400,
			height : '',
			top : "50%",
			modal : true,
			draggable : true,
			closeIconVisible : true,
			btype : {
				"normal" : "btn_minor_s",
				"caution" : "btn_caution_s",
				"confirm" : "btn_major_s",
				"normal2" : "btn_bk"
			},
			buttons : {
				'ok' : { btext : GP.i18n[GP.locale]['확인'], btype : 'confirm' },
				'move' : { btext : GP.i18n[GP.locale]['이동'], btype : 'confirm' },
				'save' : { btext : GP.i18n[GP.locale]['저장'], btype : 'confirm' },
				'close' : { btext : GP.i18n[GP.locale]['닫기'], btype : 'normal' },
				'cancel' : { btext : GP.i18n[GP.locale]['취소'], btype : 'normal' },
				'del' : { btext : GP.i18n[GP.locale]['삭제'], btype : 'caution' },
				'search' : { btext : GP.i18n[GP.locale]['검색'], btype : 'confirm' }
			},
			tpl : {
				'wrap' : [
				   '<div class="go_popup {pclass}" id="{pid}" data-id="{generateUUID}" data-close="false" style="display:none" data-layer>',
				   '<header>',
				   '    <h1>{header}</h1>',
				   '    {headerHtml}',
				   '    <a id="go_popup_close_icon" class="btn_layer_x" style="display:none" data-bypass title="{closeText}"><span class="ic"></span><span class="txt"></span></a>',
				   '</header>',
					'<div class="content">{pTitle}{message}<span id="popupContent">{contents}</span></div>{buttonwrap}</div>'
				 ],
				'wrapSearch' : [
	                '<div class="go_popup detail_search_wrap{pclass}" data-id="{generateUUID}" style="display:" data-layer>',
	                '<div class="detail_search">', '<header><h1>{header}</h1>',
	                '<a class="btn_layer_x" data-bypass><span class="ic"></span><span class="txt">{closeText}</span></a>',
	                '</header>','<span class="layer_tail_top"><i></i></span>',
					'<div class="content go_renew"><span id="popupContent">{contents}</span></div>', '{buttonwrap}', '</div>','</div>'
                ],
			    'pTitle' : '<p class="q">{pTitle}</p>',
			    'message' : '<p class="add">{message}</add>',
			    'buttonwrap' : '<footer class="btn_layer_wrap"></footer>',
			    'button' : '<a class="{bclass}" data-bypass style="margin-right:5px" title="{btext}"><span class="ic"></span><span class="txt">{btext}</span></a>',
			    'overlay' : '<div id="popOverlay" class="overlay" data-id="{generateUUID}"></div>'
			}
		},
		error : function(message, targetEl, isClear, fadeOut) {
			var isPop = targetEl ? false : true;

			if(isClear) {
				$(targetEl).siblings('.go_error').remove();
				return false;
			}

			if(isPop) {
				GP.slideMessage(message,"caution");
			} else {
				messageTpl = ['<span class="alert_wrap wrap_desc_top go_error go_renew"><span class="desc caution">',message,'</span></span>'];
				var errorEl = messageTpl.join('');
				if (fadeOut){errorEl = $(errorEl).delay(3000).fadeOut(500, function() {$(this).remove();});}
				$(targetEl).siblings('.go_error').remove().end().after(errorEl);
			}

			return;
		},

		/*
		 *  deprecate : goMessage 는 향후 사용하지 않을 계획입니다. -> slideMessage 로 전환
		 */
		message : function(message) {
			GP.slideMessage(message);
			return;
		},
		slideMessage : function(message,stype) {
			$("#go_slideMessage").remove();
		    var messageTpl;
			if(stype == "caution") {
				messageTpl = ['<div id="go_slideMessage" class="layer_toast" style="display:none"><div class="alert_wrap go_error"><div class="content"><span class="txt">',message,'</span></div></div></div>'];
			} else {
				messageTpl = ['<div id="go_slideMessage" class="layer_toast" style="display:none"><div class="alert_wrap"><div class="content"><span class="txt">',message,'</span></div></div></div>'];
			}
		    $(messageTpl.join('')).appendTo('body');

		    $("#go_slideMessage").slideDown(50, function(){
		    	$("#go_slideMessage").delay(2000).slideUp(50, function(){
		    		$("#go_slideMessage").remove();
		    	});
		    	$(".btn_del_light").bind("click", function() {
		    		$("#go_slideMessage").remove();
		    	});
		    });
			$("#go_slideMessage").bind('click', function() {
				$("#go_slideMessage").remove();
			});
			return;
		},
		alert : function(title, message, callback, btntext, closeCallback) {
			return GP.render({
				title : title,
				message : message,
				modal : true,
				closeCallback : closeCallback,
				buttons : [{
					'btext' : btntext || GP.defaults.buttons.close.btext,
					'btype' : 'normal',
					'callback' : callback
				}]
			});
		},
		confirm : function(title, message, confirmCallback, callbackCancel, btntext) {
			// go-mail 쪽 대응으로 cancelCallback와 btntext의 순서가 반대임
			if(typeof callbackCancel === 'string') {
				btntext = callbackCancel;
			}
			
			return GP.render({
				title : title,
				message : message,
				modal : true,
				allowPrevPopup : true,
				closeIconVisible : false,
				buttons : [{
					'btext' : btntext || GP.defaults.buttons.ok.btext,
					'btype' : 'confirm',
					'callback' : confirmCallback
				}, {
					'btext' : GP.defaults.buttons.cancel.btext,
					'btype' : 'normal',
					'callback' : typeof callbackCancel === 'function' ? callbackCancel : function() {}
				}]
			});
		},
		caution : function(title, message, confirmCallback, cancelCallback, btntext) {
			
			// go-mail 쪽 대응으로 cancelCallback이 btntext 앞에 추가됨.
			if(typeof cancelCallback === 'string') {
				btntext = cancelCallback;
			}
			
			return GP.render({
				title : title,
				message : message,
				modal : true,
				allowPrevPopup : true,
				buttons : [{
					'btext' : btntext || GP.defaults.buttons.del.btext,
					'btype' : 'caution',
					'callback' : confirmCallback
				}, {
					'btext' : GP.defaults.buttons.cancel.btext,
					'bclass' : GP.defaults.buttons.cancel.bclass, 
					// go-mail 쪽 대응으로 cancelCallback이 btntext 앞에 추가됨.
					'callback' : typeof cancelCallback === 'function' ? cancelCallback : function() {}
				}]
			});
		},
		goImportantCaution : function(options) {
			return GP.render({
				title : options.title,
				contents : options.contents,
				modal : true,
				allowPrevPopup : true,
				buttons : [{
					'btext' : options.btntext || GP.defaults.buttons.del.btext,
					'btype' : 'caution',
					'autoclose' : false,
					'callback' : options.confirmCallback
				}, {
					'btext' : GP.defaults.buttons.cancel.btext,
					'bclass' : GP.defaults.buttons.cancel.bclass,
					'callback' : typeof options.cancelCallback === 'function' ? options.cancelCallback : function() {}
				}]
			});
		},
		search : function(toptions) {
			var classnames = " layer_normal",
				callback = null;

			if('pclass' in toptions) {
				classnames = [classnames ,toptions.pclass].join(' ');
				delete toptions['pclass'];
			}
			if('callback' in toptions) {
				callback = toptions.callback;
				delete toptions['callback'];
			}

			var options = $.extend({
				width: 505,
				wrapTpl : GP.defaults.tpl.wrapSearch,
				pclass: classnames,
				buttons : [{
					btype : GP.defaults.buttons.search.btype,
					btext : GP.defaults.buttons.search.btext,
					autoclose : false,
					callback : callback
				}, GP.defaults.buttons.cancel]
			}, toptions);

			return GP.render(options);
		},
		template : function(tpl,data){
			return tpl.replace(/{(\w*)}/g,function(m,key){return data.hasOwnProperty(key)?data[key]:"";});
		},

		/**
		 *
		 * @param closeCallback
		 * @param e 이벤트를 넘기면 가장 나중의 팝업을 지운다.
		 */
		close : function(closeCallback, e, el) {
			var context = el || null;

			if(typeof closeCallback == 'function'){
				closeCallback(e);
				$(el).remove();
				
				if($('.go_popup').length > 0) {
					;
				} else {
					$(window).off('.gopop');
					$('.go_popup, #popOverlay').remove();
				}
			}
			$("#mail-viewer").contents().find('object[name=powerupload]').css("visibility","visible");
			if(e){
				var target = $(e.currentTarget);
				var generateId = target.parents('div.go_popup').first().attr('data-id');
				if(generateId == undefined){
					//generateId 를 잡지 못하는 예외사항 발생 처리 예)Esc
					if(GP.defaults.modal){
						// GO-11501 로그인 페이지에서 화면 전체를 지우는 이슈 발생
						$('#popOverlay').remove();
					}
					target.parents('div.go_popup').first().remove();
				}else{
					$('div.go_popup[data-id="' + generateId + '"]').remove();
					$('div[data-id ="' + generateId + '"]').remove();
				}
				
				
				$(window).off('.gopop');
			}else{
				$(window).off('.gopop');
				$('.go_popup, #popOverlay').remove();
			}

			// 컨텍스트로 엘리먼트 제거
			if(context){$(context).remove();}

			// 파일업로더 타이틀 이슈 임시 처리
			if(GO.util.isIE8()) {
				document.title = sessionStorage.getItem('browserTitle') || "";
			}
			
			if (GP.toggleTrigger != false) {
				$(document).trigger("hideLayer.goLayer");
			}
		},
		
		_generateUUID : function() {
		    var d = new Date().getTime();
		    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		        var r = (d + Math.random()*16)%16 | 0;
		        d = Math.floor(d/16);
		        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		    });
		    return uuid;
		},
		
		renderPopup : function(options) {
			options = options || {};
			
			var deferred = $.Deferred();
			
			// go-mail에서 사용하여 추가함
			
			/* 출처 불분명. 아마 DO 쪽 go-popup 에 있던 소스가 
			 * 메일쪽 go-popup이 만들어 질 때 복사 됐던것 같고,
			 * 현재 DO 쪽 go-popup에는 해당 소스가 존재 하지 않는다.
			 *
			 *  레이어를 두개 이상 열때 다른 레이어를 닫아버리는 문제 발생.
			 */
//			var isClose = options.isClose || false;
//			if(!isClose) {
//				GP.close();
//			}
			
			//go-mail에서 사용하고 있는 옵션들을 위한 호환
			if(options['isDrag']) {
				options.draggable = options.isDrag;
			}

			var popupEl = null,
				wrapTpl = options.wrapTpl || GP.defaults.tpl.wrap;
				pid = options['id'] || GP.defaults.pid,
				generateUUID = this._generateUUID(),
				targetEl = options.targetEl || GP.defaults.targetEl,
				header = options.header || '',
				headerHtml = options.headerHtml || '',
				pclass = options.pclass ? options.pclass : header ? 'layer_normal' : 'layer_confim',
				width = options.width || GP.defaults.width,
				height = options.height || GP.defaults.height,
				pTop = options.top || GP.defaults.top,
				pTitle = options.title || '',
				message = options.message || '',
				contents = options.contents || '',
				buttons = options.buttons || '',
				buttonwrap = buttons ?  GP.defaults.tpl.buttonwrap : '',
//				closeCallback = options.closeCallback || '',
				addCss = (width < 0 ? {"top" : pTop} : { width : width , "top" : pTop , height : height}),
				modal =  options.hasOwnProperty('modal') ? options.modal : GP.defaults.modal,
				draggable = options.hasOwnProperty('draggable') ? options.draggable : GP.defaults.draggable,
				appendTarget = options.appendTarget || 'body',
				closeIconVisible = options.closeIconVisible == undefined ? GP.defaults.closeIconVisible : options.closeIconVisible,
				allowPrevPopup = options.allowPrevPopup ? options.allowPrevPopup : false,
				forceClosePopup = options.forceClosePopup == undefined ? !modal : options.forceClosePopup;//팝업 이외의 영역을 클릭하면 팝업을 닫을지 여부, 기존에 modal false 일때 파업 이외의 영역을 클릭하면 자동으로 닫힌 동작유지.

			// go-mail에서 사용하고 있는 옵션들을 위한 추가
			var draggable = GP.defaults.draggable;
			if(options['draggable']) {
				draggable = options.draggable;
			} else if(options['isLock']) {
				draggable = !options.isLock;
			}
			
			var openCallback = options.openCallback || '';
			var isLock = options.isLock;
			var handle = options.handle || '';
			GP.toggleTrigger = options.toggleTrigger != false ? true : false;
			
			GP.defaults.modal = modal;
			
			if(!allowPrevPopup){
				GP.close();
			}

			if(modal) {
				$(appendTarget).append($(GP.template(GP.defaults.tpl.overlay, {'generateUUID' : generateUUID})));
			}

			var templateParam = {
				'pid' : pid,
				'header' : header,
				'generateUUID' : generateUUID,
				'pTitle' : pTitle ? GP.template(GP.defaults.tpl.pTitle,{pTitle : pTitle}) : '',
				'pclass' : pclass,
				'headerHtml' : headerHtml,
				'width' : width,
				'top' : pTop,
				'closeText' : GP.i18n[GP.locale]['닫기'],
				'message' : message ? GP.template(GP.defaults.tpl.message,{message : message}) : '',
				'buttonwrap' : buttonwrap
			};

			if(typeof contents == "string"){
				templateParam['contents'] = contents;
			}

			popupEl = $(GP.template(wrapTpl.join(''), templateParam));

			if(typeof contents == "object"){
				popupEl.find("#popupContent").html(contents);
			}

			popupEl.appendTo(appendTarget)
			.data('popup-options', {
				"closeCallback": options.closeCallback || ''
			});
			$("#mail-viewer").contents().find('object[name=powerupload]').css("visibility","hidden");
			
			var closeCallback = popupEl.data('popup-options').closeCallback;

			if (closeIconVisible) {
			    popupEl.find('#go_popup_close_icon').show();
			}

			popupEl.reoffset = function() {
				if(options.offset) {
					$.extend(addCss, options.offset, {
						position : options.offset.position || "absolute",
						margin	: 0
					});
				} else {
					var lessThanHeight = $(window).height() < popupEl.height();
					var lessThanWidth =$(window).width() < popupEl.width();
					var position = lessThanHeight ? "absolute" : "fixed";
					var top = lessThanHeight ? (window.scrollY || document.documentElement.scrollTop) : $(window).height() / 2 - popupEl.height() / 2;
					var left = lessThanWidth ? (window.scrollX || document.documentElement.scrollLeft) : $(window).width() / 2 - popupEl.width() / 2;

					_.extend(addCss, {
						position : position,
						top : top,
						left : left
					});
				}

				popupEl.css(addCss).fadeIn(100);

				return popupEl;
			};

			popupEl.reoffset().css('z-index', '99');

            var popupDragged = false;
			if(draggable) {
                popupEl.draggable({
                    containment: "document",
                    handle : 'header, footer',
                    cursor : 'move',
                    delay: 200,
                    stop : function(e, ui) {
                    	popupDragged = true;
                    }
                });
            }

			// go-mail에서 사용하여 추가함
			if (openCallback) openCallback(popupEl);
			if(buttons) {
				var buttonWrap = popupEl.find('.btn_layer_wrap');
				$(buttons).each(function(k,v) {
					buttonWrap.append(
						$(GP.template(GP.defaults.tpl.button, $.extend(v,{
							'bclass' : eval('GP.defaults.btype.'+v.btype) || GP.defaults.btype.normal
						}))).bind('click.gopop', function(e) {
							e.stopPropagation();
							if (popupDragged) {
								popupDragged = false;
								return false;
							}
							v.autoclose = v.hasOwnProperty('autoclose') ? v.autoclose : true;
							if(v.callback){ v.callback(popupEl,e); }
							if(v.autoclose){ GP.close(closeCallback,e); }
						})
					);
				});
			}

			popupEl.close = GP.close;
			popupEl.reoffset();

			popupEl.find('.btn_layer_x').bind('click.gopop' , function(e){
				GP.close(closeCallback,e);
			});

			deferred.resolveWith(this, [popupEl, deferred]);

			return deferred;
		},
		render : function(options) {
			var returnEl = null;
			GP.renderPopup(options).done(function(popupEl, deferred) {
				popupEl.reoffset();
				returnEl = popupEl;
				returnEl.data('deferred', deferred);
				var closeCallback = options.closeCallback || null;
				var goPopEvents = {
					'click.gopop' : function(e) {
						if(!forceClosePopup){
							return;
						}
						if($('.go_popup').length && $('.go_popup').attr('data-close') == 'true' && !$(e.target).parents('.go_popup').length) {
							if($('#popOverlay').length || $(e.target).hasClass('paginate_button')) {
								return false;
							}
							if($('.ui-datepicker').length > 0 && $('.ui-datepicker').is(':visible')) {
								return false;
							}
							if ($(e.target).parents('.layer_organogram').length) return false;
							GP.close(closeCallback, e);
						}
						$('.go_popup').attr('data-close', true); // 이거 정체가 뭐지? 팝업 바깥쪽을 클릭하면 팝업이 닫히게 하려고 한 것 같은데, 팝업 바깥쪽을 두번 클릭 해야 닫힌다.
					},
					'resize.gopop' : function(e) {
						returnEl.reoffset();
					},
					'keydown.gopop' : function(e) {
						if (e.keyCode == 27) {
							GP.close(closeCallback, e, returnEl);
						}
					}
				};
				setTimeout(function() {
					$(window).off('.gopop').on(goPopEvents);
				},100);
				
				if(options.toggleTrigger != false) {
					$(document).trigger("showLayer.goLayer");
				}
			});
			return returnEl;
        },
        _error : function(){
        }
	});
	$.goAlert = GP.alert;
	$.goConfirm = GP.confirm;
	$.goCaution = GP.caution;
	$.goMessage = GP.message;
	$.goError = GP.error;
	$.goSearch = GP.search;
	$.goSlideMessage = GP.slideMessage;
	$.goImportantCaution = GP.goImportantCaution;

})(jQuery);
