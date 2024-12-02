(function() {
define([
	"jquery", 
	"backbone", 
	"app",
	
	"views/mobile/header_toolbar",
	"components/minical/views/minical_app",
	
	"i18n!nls/commons",
	"i18n!asset/nls/asset",
	"i18n!calendar/nls/calendar",
	
	"GO.util",
	"jquery.go-validation"
],

function(
	$,
	Backbone,
	App,

    HeaderToolbarView,
	MiniCalendarView,

	commonLang,
	assetLang,		
	calendarLang
) {
    
    /**
     * 예약 목록 조회
     */
    var ReservationList = Backbone.Collection.extend({
        
        /**
         * 초기화
         * 
         * @param {object} options
         * @param {number} options.assetId 자산 아이디
         * @param {number} options.itemId 자산 항목 아이디
         * @return 
         */
        initialize: function(options) {
            this.assetId = options.assetId;
            this.itemId = options.itemId;
        },
        
        /**
         * 예약 목록 조회를 위한 기간 설정
         * 
         * @param {moment} from 시작일
         * @param {moment} to 종료일
         * @return
         */
        setDuration : function (from, to) {
            this.from = from;
            this.to = to;
        },
        
        url: function() {
            var url = '/api/asset/'+this.assetId+'/item/'+this.itemId+'/reservation';
            return url;
//            return url + '?' + $.param({
//                'from': GO.util.toISO8601(this.from),
//                'to': GO.util.toISO8601(this.to)
//            });
        }
    });
    
    
    /**
     * 자산 항목의 예약 현황 캘린더 뷰
     */
    var AppView = Backbone.View.extend({
        
        el : '#content',
        
        /**
         * 초기화
         * 
         * @param {object} options
         * @param {number} options.assetId 자산 아이디
         * @param {string} options.assetName 자산 이름 (캘린더 뷰 상단에 제목으로 표현된다)
         * @param {number} options.itemId 자산 항목 아이디
         * @return
         */
        initialize: function(options) {
            GO.util.appLoading(true);
            this.assetId = options.assetId;
            this.assetName = decodeURIComponent(options.name);
            this.itemId = options.itemId;
            this.reservations = new ReservationList({
                assetId: this.assetId,
                itemId: this.itemId
            });
            
            this.miniCalendar = new MiniCalendarView({
                renderTarget: this.$el,
                loadDataOnDateSet: $.proxy(this._loadDataOnDateSet, this),
                dateDataEmptyMessage: assetLang['등록된 예약이 없습니다.'],
                buttonLeft: {
                    label: commonLang['목록'],
                    url: $.proxy(function(data) {
                        return 'asset/'+this.assetId+'/list/reservation';
                    }, this)
                }
            });
        },
        
        _loadDataOnDateSet: function(start, end) {
            var parseData = $.proxy(function(collection) {
                var baseShowURL = 'asset/'+this.assetId+"/item/"+this.itemId+"/status/reservation/";
                return _.map(collection.data, function(data) {
                    var useAnonym = !!data.useAnonym;
                    return {
                        'id': data['id'],
                        'companyName': data['user'].companyName,
                        'name': useAnonym ? '(' + assetLang['익명예약'] + ')' : (data['user'].name || ''),
                        'startTime': moment(data['startTime']),
                        'endTime': moment(data['endTime']),
                        'alldayType' : false,
                        'moveURL': baseShowURL + data['id'],
                        'otherCompanyReservation' : !!data['otherCompanyReservation']
                    };
                });
            }, this);
            
            var deferred = $.Deferred();
            var params = {
                'startAt' : GO.util.toISO8601(start),
                'endAt': GO.util.toISO8601(end)
            };
            
            this.reservations.fetch({data : params}).
                done(function(collection) {
                    deferred.resolve(parseData(collection));
                    GO.util.appLoading(false);
                }).
                fail(function() {
                    deferred.reject();
                    GO.util.appLoading(false);
                });
            
            return deferred.promise();
        },
    
        render: function() {

            HeaderToolbarView.render({
                title : this.assetName,
                isList : true,
                isSideMenu: true,
                isHome: true,
                isWriteBtn : true,
                writeBtnCallback : $.proxy(function() {
                    var date = this.miniCalendar.getSelectedDate();
                    if(GO.util.isBeforeToday(date)){
                        alert(assetLang['오늘 이전의 날짜에는 예약할 수 없습니다.']);
                        return;
                    }

                    var url = ['asset',this.assetId,'item',this.itemId,'create','reservation',date,'r'];
                    App.router.navigate(url.join('/'),{trigger: true, pushState: true});
                }, this)
            });
            $('#btnHeaderSearch').show().attr('data-assetid',this.assetId);
            this.miniCalendar.render();
        }
    });
    
    return {
        render: function(opt) {
            return new AppView(opt).render();
        }
    };
    
		
	});
}).call(this);
