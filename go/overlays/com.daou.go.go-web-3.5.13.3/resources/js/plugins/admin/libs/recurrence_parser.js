define([
    "underscore",
    "app", 
    "libs/go-recurrence-parser",
    "i18n!nls/commons",
    "i18n!calendar/nls/calendar"
], 

function(
	_, 
	GO, 
	RecurreceParser,
	commonLang,
	calLang
) {
	
	var NoticeRecurParser = GO.util.extendClass(RecurreceParser, {
		/**
		 * @Override
		 */
		humanize: function() {
			
			if(this._hasByMonthDay()) {	//매 월 반복
				var result = "";
				result += this._humanizeBymonthString() + " / ";
				result += this._humanizeBymonthdayString();
				return result;
			}else if(this._hasByDay()) {	//매 주 반복
				var result = "";
				result += this._humanizeBymonthString() + " / ";
				result += this._humanizeBydayString();
				return result;
			}else {	//제공하지 않는 반복 설정
				return "";
			}
			
		},
		/**
		 * @Override
		 */
		_humanizeBymonthString: function() {
            if(!this.get("BYMONTH")) return;
            var buffer=[], 
                tarr = this.get("BYMONTH").split(",");
            
            if(tarr.length == 12){
            	return calLang["매월"];
            }else{
            	_.each(tarr, function(monthday) {
            		buffer.push(GO.i18n(calLang["{{month}}월"], "month", monthday));
            	});
            	return buffer.join(",");
            }

        },
		/**
		 * @Override
		 */
		_humanizeBydayString: function() {
            if(!this.get("BYDAY")) return;
            var temp = this.get("BYDAY").split(","), 
                weeks = "",
                days = "",
        		weekResult = [],
        		dayResult = [],
        		WEEK_STR = this._getWeekStr(),
            	DAY_STR = this._getDayStr();
            
            _.each(temp, function(daystr) {
                var matched = /([-1-9]*)(SU|MO|TU|WE|TH|FR|SA)?$/.exec(daystr), 
                    nth = matched[1],
            		weekdayShort = matched[2];
                
            	weekResult.push(WEEK_STR[nth]);
                dayResult.push(DAY_STR[weekdayShort]);
            });
            var filterWeeks = _.filter(weekResult, this._onlyUnique),
            	weeks = filterWeeks.join(","),
            	days = _.filter(dayResult, this._onlyUnique).join(",");
            
            if(filterWeeks.length == 6){
            	weeks = calLang["매주"];
            }
            
            return weeks + " / " + days;
        }, 
        _onlyUnique : function(value, index, self) {
        	return self.indexOf(value) === index;
        },
		/**
		 * @Override
		 */
		_humanizeBymonthdayString: function() {
            if(!this.get("BYMONTHDAY")) return;
            var tarr = this.get("BYMONTHDAY").split(","),
            	tarrSize = tarr.length,
                first = tarr.shift(),
                last = tarr.pop();
            
            if(first < 0) {	//마지막 일
            	first = calLang["마지막 일"];
            }else {
            	first = GO.i18n(calLang["{{monthday}}일"], "monthday", first);
            }
            
            if(last < 0) {
            	last = calLang["마지막 일"];
            }else{
            	last = GO.i18n(calLang["{{monthday}}일"], "monthday", last);
            }
            
            if(tarrSize == 1 || first == last){	//시작, 종료일이 같은경우
            	return first;
            }else{
            	return first + " ~ " + last;
            }
        }, 
		_hasByMonthDay : function() {
			return this.get("BYMONTHDAY");
		},
		_hasByDay : function() {
			return this.get("BYDAY");
		}
	});
	
    return NoticeRecurParser;
});