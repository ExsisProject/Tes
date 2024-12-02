define('works/home/views/applet_import_popup', function (require) {
	var FileUpload = require('file_upload');
	var popupTmpl = require('hgn!works/home/templates/applet_import_popup');
	var worksLang = require("i18n!works/nls/works");
	var commonLang = require('i18n!nls/commons');

	var lang = {
		'생성일': worksLang['생성일'],
		'앱명': worksLang['앱명'],
		'외': worksLang['외'],
		'총': worksLang['총'],
		'파일 선택': worksLang['파일 선택'],
		'파일명': worksLang['파일명'],
		'크기': commonLang['크기'],
		'상태': commonLang['상태'],
		'삭제': commonLang['삭제'],
		'대기중': worksLang['대기중'],
		'전사공유 중': worksLang['전사공유 중'],
		'완료': commonLang['완료'],
		'실패': commonLang['실패'],
		'dwt 파일만 등록 가능합니다.': worksLang['dwt 파일만 등록 가능합니다.']
	};
	    
    return Backbone.View.extend({
    	
    	gridView: null,
		
    	events: {
    		'click [el-delete]' : '_onClickDeleteFileItem',
    		'click #checkAll' : '_checkAll'
    	}, 
    	
		initialize: function(options) {
			options = options || {};
			this.models = options.models
		},
		
		render: function() {
			this.$el.html(popupTmpl({
				lang : lang
			}));
			
			return this;
		},
		
		initFileUpload: function() {
			var options = {
				el : this.$('#file-control'),
                context_root : GO.contextRoot ,
                button_text : lang['파일 선택'],
                button_height : 24,
                button_width : 60,
                url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
            };
			
			(new FileUpload(options))
	        .queue(function(e, data){})
	        .start($.proxy(function(e, data){
	        	var reExt = new RegExp("(.dwt)","gi"),
                fileExt = data.type.toLowerCase();

	            if(!reExt.test(fileExt)){
	            	this.$('#importDesc').show();
	                this.$('#importDesc').text(lang['dwt 파일만 등록 가능합니다.']);
	                return false;
	            } else {
	            	this.$('#importDesc').hide();
	            }
	        }, this))
	        .progress(function(e, data){ })
	        .success($.proxy(function(e, serverData){
	        	var data = serverData.data;
                if(GO.util.fileUploadErrorCheck(serverData)){
                    $.goAlert(GO.util.serverMessage(serverData));
                    return false;
                } else {
                	if(GO.util.isFileSizeZero(serverData)) {
                		$.goAlert(GO.util.serverMessage(serverData));
                		return false;
                	}
                }
                
                var fileTmpl = $([
					'<tr data-path="'+ data.filePath +'">'+
						'<td class="align_l"><span class="ic_file ic_unknown"></span>'+ data.fileName +'</td>'+
						'<td class="size"><span class="size">'+ GO.util.getHumanizedFileSize(data.fileSize) +'MB</span></td>'+
						'<td class="state"><span el-state>'+ lang['대기중'] +'</span></td>'+
						'<td class="del"><span class="btn_bdr" el-delete><span title="' + lang['삭제'] +'" class="ic_classic ic_basket"></span></span></td>' +
					'</tr>'	
					].join(''));
                this.$("[data-body]").append(fileTmpl);  
                this._import(data, e.timeStamp);
            }, this))
	        .complete(function(e, data){
	            console.info(data);
	        })
	        .error(function(e, data){
	            console.info(data);
	        });
		},
		
		_import: function(file, timeStamp) {
			$.ajax({
        		url: GO.contextRoot + "api/works/templates/import",
        		contentType: "application/json",
        		type: "POST",
        		data: JSON.stringify(file),
        		success: $.proxy(function(resp) {
        			var target = this.$el.find('tr[data-path="' + file.filePath +'"]');
        			target.find('[el-state]').text(lang['완료']);
        			target.attr('data-template-id', resp.data.id);
        		}, this),
        		error: $.proxy(function(error) {
        			this.$el.find('tr[data-path="' + file.filePath +'"]').find('[el-state]').text(lang['실패']);
        		}, this)
        	});
		},
		
		_onClickDeleteFileItem: function(e) {
			var $target = $(e.currentTarget);
			var templateId = $target.closest('tr').attr('data-template-id');
			this.deleteFileItem(templateId);
		},
		
		deleteFileItem: function(id) {
			$.ajax({
                type : 'DELETE',
                contentType: 'application/json',
                url: GO.contextRoot + "api/works/templates/" + id,
                success: $.proxy(function(resp) {
                	this.$el.find('tr[data-template-id="' + id +'"]').remove();
                }, this),
				error: $.proxy(function(resp) {
					this.$el.find('tr[data-template-id="' + id +'"]').find('[el-state]').text(lang['전사공유 중']);
                }, this)
            });
		},
		
    });
});