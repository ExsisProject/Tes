/*
 * calendar model
 * 로그인 사용자의 캘린더 정보를 가져온다.
 */ 
(function() {
    define(["backbone", "app", "i18n!calendar/nls/calendar"], function(Backbone, GO, calLang) {
        var Calendar = Backbone.Model.extend({
            urlRoot: "/api/calendar", 
            
            addMyCalendar: function(name) {
            	var defer = $.Deferred();
            	
            	this.save({"name": name}, {
            		success: defer.resolve,
            		error: defer.reject
            	});
            	
            	return defer;
            }, 
            
            move: function(newSeq) {
            	var defer = $.Deferred();
            		
            	this.save(typeof newSeq === 'undefined' ? null: {"seq": newSeq}, {
            		"url": GO.config('contextRoot') + 'api/calendar/' + this.id + '/move',
            		"success": defer.resolve, 
            		"error": defer.reject
            	});
            	
            	return defer;
            }, 
            
            /**
            비공개 캘린더 여부 반환

            @method isPrivate
            @return {Boolean} 비공개 여부
            */ 
            isPublic: function() {
                return this.get("visibility") === 'public';
            }, 
            
            isProtected: function() {
            	return this.get("visibility") === 'protected';
            }, 
            
            isPrivate: function() {
                return this.get("visibility") === 'private';
            }, 
            
            /**
            캘린더 접근 여부 반환

            @method isAccessible
            @return {Boolean} 접근 여부
            */ 
            isAccessible: function() {
                return (!this.isPrivate() || this.get("permission"));
            }, 
            
            isDefault: function() {
            	return this.get('defaultCalendar');
            }, 
            
            isMyCalendar: function() {
            	return this.get('type') === 'normal';
            }, 
            
            getCalendarName: function() {
            	return this.get('name') || GO.i18n(calLang["캘린더 기본이름"], {"username": this.get('owner').name});
            }, 
            
            getOwnerName: function() {
            	var owner = this.get('owner');
            	return [owner.name, owner.position].join(' ');
            }, 
            
            decideDefault: function(calendarId) {
            	return this.set('defaultCalendar', this.id === calendarId);
            }, 
            
            updateDefaultCalendar: function() {
            	var defer = $.Deferred();
            	
            	this.save({"defaultCalendar": true}, {
            		success: defer.resolve, 
            		error: defer.reject
            	});
            	
            	return defer;
            }
        });

        return Calendar;
    });
}).call(this);