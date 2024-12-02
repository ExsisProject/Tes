
define(function(require) {
    var Backbone = require('backbone');
    var _ = require('underscore');

    var DetailView = require('system/views/database/db_config_detail');
    var listTpl = require('hgn!system/templates/database/db_list');
    var MainTpl = require('hgn!system/templates/database/db_main');
    var adminLang = require('i18n!admin/nls/admin');
    var commonLang = require('i18n!nls/commons');

    var langs = {
        'label_db_header_info' : adminLang['DB 설정 정보'],
        'label_db_header_config' : commonLang['접속설정'],
        'label_db_company_name' : adminLang['회사명'],
        'label_db_config_name' : adminLang['설정명'],
        'label_db_key' : adminLang['Key'],
        'label_db_vender' : adminLang['Vender'],
        'label_db_host' : adminLang['Host'],
        'label_db_description' : adminLang['설명'],
        'label_empty_list' : adminLang['표시할 데이터 없음'],
        'label_add' : adminLang['추가'],
        'label_delete' : commonLang['삭제'],
        'label_apply' : adminLang['서버 적용'],
        'label_db_delete' : adminLang['접속 정보 삭제'],
        'label_db_delete_message' : adminLang['해당 DB 접속 정보를 삭제하시겠습니까?'],
        'label_db_empty_delete_data' : adminLang['삭제할 정보가 존재하지 않습니다.'],
        'label_delete_success_message' : adminLang['정상적으로 삭제되었습니다.'],
        'label_apply_message' : adminLang['적용되었습니다.'],
        'label_db_apply_server' : adminLang['DB 설정 서버 적용'],
        'label_db_apply_server_message' : adminLang['해당 DB 접속 정보를 적용하시겠습니까?'],
        'label_overlap_key_message' : adminLang['중복된 키가 존재합니다.']
    };

   var Configs = Backbone.Collection.extend({
        url : GO.contextRoot + 'ad/api/system/dbconfig'
    });

    var DBConfigView = Backbone.View.extend({
        events : {
            'click #add_btn' : '_add',
            'click #delete_btn' : '_delete',
            'click #apply_btn' : '_apply',
            'click #dbConfigTable tr' : '_detail',
            'click #group_all' : '_checkAll',
            'click td.check input' : '_check',
        },

        initialize : function() {
            this.collection = new Configs();
        },

        _render_list : function() {
            var self = this;
            $('.breadcrumb .path').html(adminLang["DB 설정"]);

            this.collection.fetch().done(function() {
                self.$el.find('tbody.document-row').html(listTpl({
                    data : self.collection.toJSON(),
                    lang : langs
                }));
            });
        },

        render : function() {
            this.$el.html(MainTpl({
                lang : langs
            }));
            this._render_list();
        },

        setDetailView : function() {
            if(!this.detailViews) {
                this.detailViews = new DetailView();
                this.detailViews.on('isDulicatedKey', $.proxy(this._isDulicatedKey, this));
                this.detailViews.on('refresh_list', $.proxy(this._render_list, this));
            }
        },

        _delete : function() {
            var _this = this;
            $.goCaution(langs.label_db_delete, langs.label_db_delete_message, confirmCallback);

            function confirmCallback() {
                var ids = [];
                document.querySelectorAll('td.check input').forEach(function(checkbox){
                    if(checkbox.checked == true) {
                        ids.push('ids='+Number(checkbox.closest('tr').dataset.id));
                    }
                })

                if(ids.length == 0) {
                    $.goError(langs.label_db_empty_delete_data);
                    return ;
                }

                $.ajax({
                    contentType : 'application/json',
                    method : 'DELETE',
                    url : GO.contextRoot + "ad/api/system/dbconfig?" + ids.join('&'),
                    success : function() {
                        $.goMessage(langs.label_delete_success_message);
                        document.querySelector('.detail_container').innerHTML = '';
                        _this._render_list()
                    },
                    fail : function() {

                    }
                })
            }
        },

        _apply : function() {
            $.goConfirm(langs.label_db_apply_server, langs.label_db_apply_server_message, confirmCallback);

            function confirmCallback() {

                var request = $.ajax({
                    contentType : 'application/json',
                    method : 'GET',
                    url : GO.contextRoot + 'ad/api/system/dbconfig/refresh'
                });

                request.done(function() {
                    $.goMessage(langs.label_apply_message);
                });
            }
        },

        _add : function(evt) {
            this.setDetailView();
            this.detailViews.renderInsert();
        },

        _detail : function(evt) {
            var id = $(evt.currentTarget).closest('tr').data('id'),
                _this = this;

            this.collection.map(function(item) {
                if(id == item.id) {
                    _this.setDetailView();
                    _this.detailViews.renderModify(item);
                    return;
                }
            })
        },

        _checkAll : function(evt) {
            var checked = evt.target.checked;

            var list = document.querySelectorAll('td.check input')

            for(var i = 0; i < list.length; i++) {
                list[i].checked = checked;
            }

        },

        _isDulicatedKey : function(evt) {
            var $target = $(evt[1].currentTarget),
                value = evt[0];

            this.collection.toJSON().map(function(item) {
                if(item.key == value && value != $target.data('prevalue')) {
                    $.goError(langs.label_overlap_key_message);
                    $target.val('');
                }
            });
        },
    })

    return DBConfigView;
});
