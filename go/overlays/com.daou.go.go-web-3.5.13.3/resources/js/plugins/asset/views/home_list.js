(function() {
    define([
        "jquery",
        "backbone",
        "app",

        "hgn!asset/templates/home_list",
        "hgn!asset/templates/asset_my_condition",

        "asset/collections/home_list",
        "asset/models/asset_user_create",

		"calendar/libs/recurrence_parser",
        "asset/views/asset_timeline",
        "views/profile_card",

        "i18n!asset/nls/asset",
        "i18n!nls/commons",
		"i18n!calendar/nls/calendar",
        "jquery.go-sdk"
    ],

    function(
        $,
        Backbone,
        App,

        TplHome,
        TplMyCondition,

        assetListCollection,
        assetItemModel,

		RecurrenceParser,
        AssetTimelineView,
        ProfileView,
        assetLang,
        commonLang,
		calendarLang
    ) {
    	var lang = {
    		'all' : assetLang['전체'],
    		'item_count' : commonLang['전체갯수'],
    		'admin' : assetLang['운영자'],
    		'reservation' : assetLang['예약'],
    		'rent' : assetLang['대여'],
    		'use_return' : assetLang['이용 반납'],
    		'is_return' : assetLang['이용을 반납하시겠습니까?'],
    		'reservation_cancel' : assetLang['예약 취소'],
    		'is_reservation_cancel' : assetLang['예약을 취소하시겠습니까?'],
    		'no_content' : assetLang['예약/대여 중인 항목이 없습니다.'],
    		'no_use' : assetLang['사용안함'],
    		'use' : assetLang['사용중'],
    		'return' : assetLang['반납'],
    		'cancel' : commonLang['취소'],
    		'current' : assetLang['내 예약/대여 현황'],
    		'asset' : assetLang['자산'],
    		'name' : assetLang['이름'],
    		'use_time' : assetLang['이용 시간'],
    		'use_calendar' : assetLang['캘린더 연동'],
    		'calcel_return' : assetLang['취소/반납'],
    		'open' : commonLang['열기'],
    		'close' : commonLang['닫기'],
            '자산 예약 현황': assetLang['자산 예약 현황'],
			'type': assetLang['예약 종류'],
			'repeat': assetLang['반복예약'],
			'normal': assetLang['일반예약'],
		};

    	return Backbone.View.extend({

    		showProfile : function(e){
    			var userId = $(e.currentTarget).attr('data-userid');
				ProfileView.render(userId, e.currentTarget);
    		},
    		initialize: function() {
    			var homelistTpl = TplHome({
    				isAvailableCal : false, //자산에 대한 연동여부가 아니라 예약한항목에 대한 연동여부로 기획됨. 해당기능 주석처리
    				lang : lang
                });
    			this.$el.html(homelistTpl);
    		},

    		events : {
    			"click a[data-btntype='statusMove']" : "statusMove",
    			"click span[data-btntype='returnRental']" : "returnRental",
    			"click span[data-btntype='reservationCancel']" : "reservationCancel",
    			"click span[data-type='profile']" : "showProfile",
                'click span.ic_classic': '_subAssetListToggle'
    		},

    		render : function() {
    			var _this = this;

                this.$('div[data-matrix-area]').html((new AssetTimelineView()).render().el);

    			var myCondition = assetListCollection.getCollection('myReservation');
    			myCondition.on("reset",function(collection){

					var tmpl = _this.makeTempleteMycondition({
						collection : collection.toJSON()
					});
					_this.$el.find('#myCondition').html(tmpl);
					$('#myCondition tr:last, #myCondition tr:last td:last').addClass('last');

				});
    		},

    		returnRental : function(e){

    			var _this = this;

    			$.goConfirm( lang.use_return, lang.is_return, function() {
    				_this.returnRentalAction(e);
    			});
    		},
    		returnRentalAction : function(e){
    			var target = $(e.currentTarget).parents('tr').first();
    			var assetId = target.attr('data-assetid');
    			var itemId = target.attr('data-itemid');
				var url = GO.contextRoot + "api/asset/"+assetId+"/item/"+itemId+"/reservation/return";

				$.go(url,'', {
					qryType : 'PUT',
					contentType : 'application/json',
					responseFn : function() {
						$(e.currentTarget).parents('tr').first().remove();
					}
				});
    		},
    		reservationCancel : function(e){
    			var _this = this;
    			$.goConfirm( lang.reservation_cancel, lang.is_reservation_cancel, function() {
    				_this.reservationCancelActin(e);
    			});
    		},
    		reservationCancelActin : function(e){
				var _this = this;
    			var target = $(e.currentTarget).parents('tr').first();
				var isRecurrence = target.attr('data-recurrence');
    			var reservationId = target.attr('data-reservationid');

				if (isRecurrence) {
					var url = GO.contextRoot + "api/asset/item/loop/reservation?" + $.param({
						reservationId: reservationId,
						recurChange: "all"
					});
					$.go(url, '',{
						qryType : 'DELETE',
						responseFn : function() {
							_this.render();
						}
					});
				} else {
					var url = GO.contextRoot + "api/asset/item/reservation";
					var ids = [];
					ids.push(reservationId);
					$.go(url,JSON.stringify({'ids' : ids}), {
						qryType : 'DELETE',
						contentType : 'application/json',
						responseFn : function() {
							_this.render();
						}
					});
				}
    		},
    		statusMove : function(e){
    			var target = $(e.currentTarget).parents('tr').first();
    			var assetId = target.attr('data-assetid');
    			var itemId = target.attr('data-itemid');
    			var reservationId = target.attr('data-reservationid');
    			var useRental = target.attr('data-userental');

    			if(useRental == "true"){
    				App.router.navigate('asset/'+ assetId+'/item/'+itemId+'/status/rental',true);
    			}else{
    				App.router.navigate('asset/'+ assetId+'/item/'+itemId+'/status/reservation/'+reservationId,true);
    			}

    		},

    		makeTempleteMycondition : function(opt){
    			var collection = opt.collection;
    			var parseDate = function(){
    				if(this.groupStartTime != undefined){
    					return GO.util.basicDate3(this.groupStartTime) + "~ " + GO.util.basicDate3(this.groupEndTime);;
    				}
    				var startTime = GO.util.basicDate3(this.reservedStartTime);
    				var endTime = "";
    				if(this.reservedEndTime){
    					endTime = " ~ " + GO.util.basicDate3(this.reservedEndTime);
    				}
    				return startTime + endTime;
    			};
				var recurrenceStartTime = function () {
					return GO.util.hourMinute(this.reservedStartTime);
				};
				var recurrenceEndTime = function () {
					return GO.util.hourMinute(this.reservedEndTime);
				};
				var text = function () {
					this.recurrenceParser = new RecurrenceParser();
					this.recurrenceParser.parse(this.recurrenceText);
					return this.recurrenceParser.humanize().split('(')[0];
				};
				var startDate = function () {
					return GO.i18n(calendarLang['{{startDate}}부터'], 'startDate', GO.util.shortDate(this.recurrenceStartDate));
				};
				var endDate = function () {
					return GO.i18n(calendarLang['{{endDate}}까지'], 'endDate', GO.util.shortDate(this.recurrenceEndDate));
				};

    			return TplMyCondition({
    				dataset:collection,
    				parseDate:parseDate,
					text:text,
					recurrenceStartTime: recurrenceStartTime,
					recurrenceEndTime: recurrenceEndTime,
					startDate: startDate,
					endDate: endDate,
					isAvailableCal : false,
					lang : lang
    			});
    		},

            _subAssetListToggle: function(e) {
                e.stopPropagation();

                var $target = $(e.currentTarget);
                var isOpened = $target.hasClass('ic_open');
                if(isOpened) {
                    $target.removeClass("ic_open");
                    $target.addClass("ic_close");
                } else {
                    $target.removeClass("ic_close");
                    $target.addClass("ic_open");
                }
                $(e.currentTarget).toggleClass('ic_open').toggleClass('ic_close');
                $(e.currentTarget).attr('title', isOpened ? lang.open : lang.close);
                var $ul = $target.closest('td').find('ul');
                if (_.isUndefined($ul.attr('data-rendered'))) {
                    var reservationId = $target.closest("tr").attr("data-reservationid");
                    this._renderSubAssetListView($ul, reservationId);
                }
                $ul.toggle(!isOpened);
            },

            _renderSubAssetListView: function($ul, reservationId) {
                $.ajax({
                    url: GO.contextRoot + 'api/asset/reservation/' + reservationId,
                    success: $.proxy(function (response) {
                        var subAssetList = "{{#dataset}}<li {{#groupStartTime}}style='color: #0c43b7'{{/groupStartTime}}>" +
                            "<span>{{parseDate}}</span>" +
                            "{{#groupStartTime}}<span style='margin: 5px' class='ic ic_info wrap_tool_tip'><span class='tool_tip top'>{{tooltipInfo}}</span></span>{{/groupStartTime}}" +
                            "</li>{{/dataset}}";
                        var parseDate = function () {
                            var startTime = GO.util.basicDate3(this.reservedStartTime);
                            var endTime = this.reservedEndTime ? " ~ " + GO.util.basicDate3(this.reservedEndTime) : "";
                            return startTime + endTime;
                        };
                        var tpl = Hogan.compile(subAssetList).render({
                            dataset: response.data,
                            parseDate: parseDate,
                            tooltipInfo: assetLang["이 예약만 수정되었습니다."]
                        });
                        $ul.attr('data-rendered', '').html(tpl);
                    }, this)
                });
            }
    	});
    });
})();