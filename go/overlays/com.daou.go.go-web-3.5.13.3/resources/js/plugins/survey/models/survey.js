(function() {
    define([
        "underscore", 
        "backbone", 
        "amplify", 
        "app", 
        "survey/collections/queries", 
        "survey/collections/response_queries"
    ], 
    
    function(
        _ ,
        Backbone, 
        amplify, 
        GO, 
        QueryCollection, 
        RespQueryCollection
    ) {
        
        var SurveyModel = Backbone.Model.extend({
            urlRoot: '/api/survey', 
            
            queryCollection: null,  
            
            initialize: function() {
                this.queryCollection = null;
            }, 
            
            start: function(options) {
                return changeStatus(this, 'progress', options);
            }, 
            
            stop: function(options) {
            	return changeStatus(this, 'stop', options);
            }, 
            
            finished: function(options) {
            	return changeStatus(this, 'finished', options);
            },
            
            addAttachFile: function(data) {
            	var attaches = this.getAttaches();
            	attaches.push(data);
            	this.set('attaches', attaches);
            	return this;
            }, 
            
            removeAttachFile: function(data) {
            	// 새로 첨부되는 파일은 id가 없으므로 name으로 찾는다.
            	var attaches = this.getAttaches(),
            		searchIndex = -1;
            	
            	for(var i=0, len=attaches.length; i<len; i++) {
            		if(attaches[i].name === data.name) {
            			searchIndex = i;
            			break;
            		}
            	}
            	
            	attaches.splice(searchIndex, 1);
            	this.set('attaches', attaches);
            	
            	return this;
            }, 
            
            isTargetCompany: function() {
                return this.isNew() ? true : this.get('targetAll');
            }, 
            
            isCreator: function(userid) {
                if(this.isNew()) {
                    return true;
                }
                
                return this.get('creator').id === userid;
            }, 
            
            isTempSaved: function() {
            	return this.get('status') === 'temp';
            }, 
            
            isReady: function() {
                return this.get('status') === 'ready';
            }, 
            
            isStarted: function() {
                return this.get('status') === 'progress';
            }, 
            
            isBeforeStart: function() {
                return this.isReady() || this.isTempSaved();
            }, 
            
            isStopped: function() {
                return this.get('status') === 'stop';
            }, 
            
            isProgressing: function() {
                return _.contains(['progress', 'stop'], this.get('status'));
            }, 
            
            isReferrer: function(userId) {
            	var isReferrer = false;
            	_.each(this.get('referrers'), function(referrer, i) {
            		if(referrer.id == userId){
            			isReferrer = true;
            			return;
            		}
            	});
            	return isReferrer;
            },
            
            isFinished: function() {
                return this.get('status') === 'finished';
            }, 
            
            isPublic: function() {
            	var visible = this.get('visible');
                return typeof visible === 'undefined' ? true: visible;
            }, 
            
            isPrivate: function() {
                return !this.isPublic();
            }, 
            
            isAllday: function() {
                return this.get('allday') || false;
            }, 
            
            setQueryCollection: function(collection) {
                this.queryCollection = collection;
            }, 
            
            getQueryCollection: function() {
                return this.queryCollection;
            }, 
            
            hasQuery: function() {
            	return !this.queryCollection || this.queryCollection.length > 0;
            }, 
            
            setFromFormData: function(formData) {
                var isAllDay = (formData['allDay'] && formData['allDay'] === 'Y');
                this.set({
                    "title": formData.title,
                    // 현재 시간별로 배치가 돌고있지 않기때문에 무조건 종일로 선택되게 해야해 시작 시간은 00시00분
                    "startTime": formData.start_date + ' 00:00', 
                    "endTime": formData.end_date + ' 23:59',
                    "status": (this.isNew() ? 'temp' : this.get('status')), 
                    "allday": (isAllDay ? true: false), 
                    "targetAll": (formData.target === 'whole' ? true : false), 
                    "visible": (formData.visible === 'Y'), 
                    "noti": 'none', 
                    "commentable": (formData.use_comment === 'Y'), 
                    "editable": (formData.editable === 'Y'),
                    "deptName": formData.deptName || ''
                });
            }, 
            
            getQueryList: function(options) {
                var self = this;
                
                _.defaults(options || {}, {
                    async: true, 
                    success: function(collection) {}, 
                    error: function() {}
                });
                
                /**
                 * - responseStatus가 존재하고 none 일경우에만 survey query를 요청
                 * - 그외에는 response query list를 요청한다.
                 */ 
                if(this.isResponseNone() || options.previewMode) {
                	queries = new QueryCollection();
                } else {
                	queries = new RespQueryCollection();
                }
                queries.setSurveyId(this.id);
                
                queries.fetch({
                    async: options.async, 
                    success: function(collection) {
                        self.setQueryCollection(collection);
                        options.success.apply(queries, arguments);
                    }, 
                    
                    error: function() {
                        options.error.apply(queries, arguments);
                    }
                });
            }, 
                        
            editable: function() {
            	var editable = this.get('editable');
                return typeof editable === 'undefined' ? true : editable;
            }, 
            
            commentable: function() {
            	var commentable = this.get('commentable');
                return typeof commentable === 'undefined' ? true : commentable;
            },
            
            getTitle: function() {
                return this.get('title') || '';
            }, 
            
            getDeptName: function() {
                return this.get('deptName') || '';
            }, 
            
            getResponseStatus: function() {
                return this.get('responseStatus') || 'none';
            }, 
            
            getCreatorName: function() {
                return !!this.get('deptName') ? this.get('deptName') : this.getDisplayName('creator'); 
            }, 
            
            getDisplayName: function(type) {
                var data = this.get(type);
                return [data.name, data.position].join(' ');
            },
            
            getTargetNodes: function() {
            	var target = this.get('target') || [];
            	
            	return target.hasOwnProperty('nodes') ? target.nodes : [];
            }, 
            
            gerReferrers: function() {
            	return this.get('referrers') || [];
            }, 
            
            getTargetCount: function() {
                return this.get('targetCount') || 0;
            },

            getResponseCount: function() {
                return this.get('responseCount') || 0;
            }, 
            
            getNoResponseCount: function() {
                var result = this.getTargetCount() - this.getResponseCount();
                return result < 0 ? 0: result;
            }, 
            
            getCommentCount: function() {
            	return this.get('commentCount') || 0;
            }, 
            
            getAttaches: function() {
                return this.get('attaches') || [];
            }, 
            
            isResponseDone: function() {
                return this.getResponseStatus() === 'done';
            }, 
            
            isResponseNone: function() {
                return this.getResponseStatus() === 'none';
            }, 
            
            isResponseTemp: function() {
                return this.getResponseStatus() === 'temp';
            }, 
            
            isIncludedReferrer: function(userid) {
                return _.where(this.get('referrers'), {"id": userid}).length > 0;
            }, 
            
            hasDeptName: function() {
            	return !!this.get('deptName');
            }, 
            
            getGuidance: function() {
            	var originGuidance = this.get('guidance');
            	if(originGuidance == 'undefined' || originGuidance == null){
            		return "";
            	}else{
            		var convertGuidance = '' + originGuidance;
                    convertGuidance = GO.util.textToHtml(convertGuidance);
                    convertGuidance = GO.util.autolink(convertGuidance, {"data-bypass": "true", "target": "_blank"});
                    return convertGuidance;
            	}
            }, 
            
            reorderQueries: function() {
            	if(!!this.queryCollection) {
            		this.queryCollection.reorder();
            	}
            }
        }, {
            getModelFromStorage: function() {
            	return new SurveyModel(GO.util.storage().get( GO.session("loginId") + '-tempsave-survey-model' ));
            }, 
            
            saveModelToStorage: function(model) {
            	GO.util.storage().get( GO.session("loginId") + '-tempsave-survey-model', model.toJSON() );
            }
        });
        
        function changeStatus(model, flag, options) {
        	var reqUrl = GO.config('contextRoot') + _.result(model, 'url') + '/' + flag, 
        		reqOpt = _.extend(options || {}, {
        			url: reqUrl.replace('//', '/')
        		});
        	        	            
        	return model.save({"status": flag}, reqOpt);
        }
        
        function strToISO8601(date, hm) {
            return GO.util.toISO8601(date + 'T' + hm);
        }
        
        return SurveyModel;
    });
})();