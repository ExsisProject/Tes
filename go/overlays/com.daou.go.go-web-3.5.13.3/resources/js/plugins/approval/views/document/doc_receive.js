define([
	"jquery",
	"underscore",
    "backbone",
    "app",
    "hgn!approval/templates/document/doc_receive",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.go-sdk",
    "jquery.jstree",
    "jquery.go-popup",
    "jquery.go-grid",
    "jquery.go-orgtab",
    "jquery.go-validation"
],

function(
    $,
	_,
    Backbone,
    App,
    DocReceiveTpl,
    commonLang,
	approvalLang
) {

	var DocReceiveList = Backbone.Collection.extend({
		initialize: function(docId,deptId) {
			this.docId = docId;
			this.deptId = deptId;
		},

		model: Backbone.Model.extend(),

		/**
		 * TODO: chogh1211 - 문서가 완료되고 나서 수신자를 추가할 수 있습니다. 이 때를 위해 잠시 남겨둡니다. URL은 변경되야 이해하기 더 쉬울 것!
		 */
		url: function() {
			return '/api/approval/document/' + this.docId + "/receptionreader/" + this.deptId;
		}
	});

	var lang = {
        '수신자' : approvalLang['수신자'],
        '부서' : approvalLang['부서'],
        '확인' : commonLang['확인'],
        '취소' : commonLang['취소'],
        '추가' : commonLang['추가'],
        '삭제' : commonLang['삭제'],
        'empty_reader' : approvalLang['수신자를 추가해 주세요.']
    };

	var ReaderListView = Backbone.View.extend({

	    events: {
	        'click .ic_basket' : 'deleteReader'
	    },

	    initialize: function(options) {
	        this.$el = options.el;
	        this.collection = options.collection;
	    },

	    render: function() {
	        var tmpl = this._compileTmpl(),
                list = this.collection.toJSON();

            this.$el.html(tmpl.render({
                lang: lang,
                readers: list
            }));

            return this.$el;
	    },

	    addReader: function(data) {
	        this.collection.add({
	            'reader' : {
	                'id' : data.id,
	                'name' : data.name,
	                'position' : data.position,
	                'deptId' : data.deptId,
	                'deptName' : data.deptName
	            }
	        });
	    },

	    deleteReader: function(e){
	        var userId = $(e.currentTarget).parent().parent().attr('data-userid');
            var target = this.collection.find(function(model) {
                return model.get('reader')['id'] == userId;
            });

            if (target) {
                this.collection.remove(target);
            }

            this.render();
        },

        _compileTmpl: function() {
            return Hogan.compile([
                  '{{#readers}}',
                  '    <tr>',
                  '        <td class="name">{{reader.name}} {{reader.position}}</td>',
                  '        <td class="func" data-id="{{id}}" data-userId="{{reader.id}}" data-deptId="{{reader.deptId}}">',
                  '            <span class="btn_bdr" title="{{lang["삭제"]}}"><span class="ic_classic ic_basket"></span></span>',
                  '        </td>',
                  '    </tr>',
                  '{{/readers}}',
                  '{{^readers}}',
                  '    <tr>',
                  '        <td class="name">{{lang.empty_reader}}</td>',
                  '    </tr>',
                  '{{/readers}}'
              ].join('\n'));
        }
	});

	var DocumentReceiveView = Backbone.View.extend({

		el: '.layer_normal .content',
		events: {
            'click .btn_langth' : 'addMember'
        },

		initialize: function(options) {
			this.docId = options.docId;
			this.apprFlow = options.apprFlow;
			this.deptId = options.receptAddDeptId;
			this.collection = new DocReceiveList(this.docId, this.deptId.join(','));
			this.collection.fetch({async : false});
		},

    	render : function(){
    	    this.$el.html(DocReceiveTpl({
    	        lang: lang
    	    }));

            this._renderMemberTree();
            this._renderReaderList();
        },

        _renderMemberTree: function() {
            var loadId = null;
            var includeLoadIds = [];
            if ( _.isArray(this.deptId) && this.deptId.length > 0 ) {
                for ( var i = 0 ; i < this.deptId.length ; i++) {
                    if ( i == 0 ) {
                        loadId = this.deptId[i];
                    } else {
                        includeLoadIds.push(this.deptId[i]);
                    }
                }
            }

            this.orgTab = $.goOrgTab({
                elId : 'org_content',
                loadId : loadId,
                includeLoadIds : includeLoadIds,
                css : {
                       'minHeight' : 306,
                       'maxHeight' : 306
                   }
            });
        },

        _renderReaderList: function() {
            this.listView = new ReaderListView({
                el: this.$el.find('#pAddReceive'),
                collection: this.collection
            });

            this.listView.render();
        },

        addMember: function() {
        	var selected = this.orgTab.getSelectedData();
        	if ( !selected.type ) {
        		$.goMessage(approvalLang["선택된 대상이 없습니다."]);
        		return false;
        	}

        	if ( selected.type == "org") {
        		$.goMessage(approvalLang["부서는 선택하실 수 없습니다."]);
        		return false;
        	}

        	if ( this.isExistMember(selected.id) ) {
        		$.goMessage(approvalLang["중복된 대상입니다."]);
        		return false;
        	}

        	if ( this.isExistActivity(selected.id) ) {
        		$.goMessage(approvalLang["중복된 대상입니다."]);
        		return false;
        	}

        	this.listView.addReader(selected);
        	this.listView.render();
        },

        isExistMember: function(selecdUserId){
            // TODO: 개선..
        	var rtn = false;
        	var memberPart = $('#pAddReceive').find('.func[data-userId]');
        	memberPart.each(function(){
        		if ( $(this).attr("data-userId") == selecdUserId ) {
        			rtn = true;
        		    return false;
        		}
        	});
        	return rtn;
        },

        isExistActivity: function(selecdUserId){
        	var rtn = false;
        	var activityGroups = this.apprFlow['activityGroups'];
        	for ( var i = 0 ; i < activityGroups.length ; i++){
				var activities = activityGroups[i].activities;
				for ( var j = 0 ; j < activities.length ; j++){
					if ( activities[j].userId == selecdUserId ){
						rtn = true;
						break;
					}
				}
			}
        	return rtn;
        },

        isExist: function() {
            return this.collection.length > 0 ? true : false;
        },

        getReaders: function() {
            return this.collection.map(function(model) {
                var reader = model.get('reader');
                return {
                    id: model.get('id'),
                    reader : {
                        id:       reader['id'],
                        name:     reader['name'],
                        position: reader['position'],
                        deptId:   reader['deptId'],
                        deptType: false
                    }
                };
            });
        },

    	release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});

	return DocumentReceiveView;
});