define("vacation/views/personal_vacation_histories", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");

    var VacationModel = require("vacation/models/user_vacation");
    var VacationListModel = require("vacation/collections/user_vacation_list");

    var Tmpl = require("hgn!vacation/templates/personal_vacation_histories");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");
    var TitleView = require("vacation/views/title");
    var ProfileCardView = require("models/profile_card");

    require("GO.util");
    require("jquery.go-grid");

    var lang = {
        "내 연차 내역": VacationLang["내 연차 내역"],
        "연차 내역": VacationLang["연차 내역"],
        "이름": CommonLang["이름"],
        "연차 사용기간": VacationLang["연차 사용기간"],
        "발생 연차": VacationLang["발생 연차"],
        "1년 미만 발생 월차": VacationLang["1년 미만 발생 월차"],
        "1년 미만 이월 월차": VacationLang["1년 미만 이월 월차"],
        "조정 연차": VacationLang["조정 연차"],
        "총연차": VacationLang["총연차"],
        "사용 연차": VacationLang["사용 연차"],
        "잔여 연차": VacationLang["잔여 연차"],
        "목록없음": AdminLang["목록없음"],

        "부서명": CommonLang["부서명"],
        "내용": CommonLang["내용"],
        "등록일": CommonLang["등록일"],
        "사용 기간": AdminLang["사용 기간"],
        "발생일수": VacationLang["발생일수"],

        "사용내역": VacationLang["사용내역"],
        "생성내역": VacationLang["생성내역"],
        "휴가종류": VacationLang["휴가종류"],
        "생성일수": VacationLang["생성일수"],
        "발생 월차": VacationLang["발생 월차"],
        "이월 월차": VacationLang["이월 월차"]
    };

    var MyPage = Backbone.View.extend({
        events: {
        	"change #vacation_term_list": "changeVacation"
        },
        className: 'annual_personal',

        initialize: function (options) {
        	var tplVacationList = [
	            '<select>',
	            '{{#dataset}}<option value="{{startDate}}">{{startDate}} ~ {{endDate}}</option>{{/dataset}}',
	            '</select>'
           ];
        	this.hogan = {
        		tplVacationList : Hogan.compile(tplVacationList.join(''))
			};
 
            if (options) {
                this.userId = options.userId;
            }
            this.baseDate = GO.util.customDate(GO.util.toMoment(), 'YYYY-MM-DD');
            this.vacation = new VacationModel(this.userId);
        },

        getDisplayBaseDate: function () {
            return moment(this.baseDate).format("YYYY.MM.DD");
        },
        
        getParam: function () {
            var params = {
                baseDate: this.$el.find("#baseDate").data("basedate")
            };

            return params;
        },
        
        changeVacation: function (evt) {
        	var param =  {baseDate:evt.target.value};
        	this.reloadList(param);
        },

        render: function () {
            this.fetchVacation();
            var thumbnailUrl = _.isUndefined(this.userId) ? GO.session().thumbnail : ProfileCardView.get(this.userId).get("thumbLarge");

            this.$el.html(Tmpl({
                baseDate: this.baseDate,
                displayBaseDate: this.getDisplayBaseDate(),
                thumbnailUrl: thumbnailUrl,
                lang: lang,
                vacation: this.vacation.toJSON(),
                isEmpty: this.isEmpty
            }));

            this.renderList();

            if (this.userId) {
                this.$el.find('header.content_top').html(new TitleView().render(lang["연차 내역"] + " (" + this.vacation.attributes.userName + ")").el);
                $('body').addClass("go_skin_ehr").html(this.el);
            } else {
                this.$el.find('header.content_top').html(new TitleView().render(lang["내 연차 내역"]).el);
            }
            
            this.fetchVacationList();
            
            return this;
        },
        
        fetchVacationList: function() {
        	var col = VacationListModel.getVacationList(this.userId).toJSON();
			if(col.length > 0){
				col.forEach(function(element) {
					element.startDate = moment(element.startDate, "YYYY-MM-DD").format("YYYY-MM-DD");
					element.endDate = moment(element.endDate, "YYYY-MM-DD").format("YYYY-MM-DD");
				});

				this.$el.find('#vacation_term_list').html(this.hogan.tplVacationList.render({
					dataset:col,
					selectId : 'header_list',
					selectClass : 'w_max'
				})).show();
			}
        },

        fetchVacation: function () {
            _this = this;
            this.vacation.setBaseDate(this.baseDate);
            this.vacation.fetch({
                async: false, success: function (model, response) {
                    if (_.isEmpty(response.data)) _this.isEmpty = true;
                    else _this.isEmpty = false;
                }
            });
        },

        renderList: function () {
            //사용내역
            this.renderHistoriesList(true);
            //조정내역(발급내역)
            this.renderIssuedList(true);
        },
        
        reloadList: function (params) {
            this.historiesList.tables.customParams = params;
            this.historiesList.tables.fnClearTable();
            
            this.issuedList.tables.customParams = params;
            this.issuedList.tables.fnClearTable();
        },

        renderHistoriesList: function (isFirstLoad) {
            if (this.userId) {
                var url = GO.contextRoot + "api/ehr/vacation/histories/" + this.userId;
            } else {
                var url = GO.contextRoot + "api/ehr/vacation/my/histories";
            }

            this.historiesList = $.goGrid({
            	
                el: this.$el.find('#vacation_histories_list'),
                method: 'GET',
                url: url,
                pageUse: false,
                sDomUse: false,
                destroy: true,
                displayLength: 999,
                sDomType: 'admin',
                params: {
                    'baseDate': isFirstLoad ? "" : this.baseDate,
                },
                emptyMessage: "<p class='data_null'> " +
                "<span class='ic_data_type ic_no_data'></span>" +
                "<span class='txt'>" + lang["목록없음"] + "</span>" +
                "</p>",
                columns: [
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.userName) {
                                return obj.aData.userName + " " + (obj.aData.positionName ? obj.aData.positionName : '');
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.deptName) {
                                return obj.aData.deptName;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.title) {
                                return obj.aData.title;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.startDate || obj.aData.endDate) {
                                return obj.aData.startDate + " ~ " + obj.aData.endDate;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.usedPoint != null && obj.aData.usedPoint != undefined) {
                                return obj.aData.usedPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.description) {
                                return obj.aData.description;
                            }
                            return '';
                        }
                    },
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    $(window).scrollTop(0);
                }
            })
        },
        
        renderIssuedList: function (isFirstLoad) {
            var url = GO.contextRoot + "api/vacation/item" + (this.userId ? "/" + this.userId : "");

            this.issuedList = $.goGrid({
                el: this.$el.find('#vacation_issued_list'),
                method: 'GET',
                url: url,
                pageUse: false,
                sDomUse: false,
                destroy: true,
                displayLength: 999,
                sDomType: 'admin',
                params: {
                    'baseDate': isFirstLoad ? "" : this.baseDate,
                },
                emptyMessage: "<p class='data_null'> " +
                "<span class='ic_data_type ic_no_data'></span>" +
                "<span class='txt'>" + lang["목록없음"] + "</span>" +
                "</p>",
                columns: [
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.publishedDate) {
                                return obj.aData.publishedDate;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.expiredDate) {
                                return obj.aData.expiredDate;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.point != null && obj.aData.point != undefined) {
                                return obj.aData.point;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.reason) {
                                return obj.aData.reason;
                            }
                            return '';
                        }
                    },
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    $(window).scrollTop(0);
                }
            })
        },
        
        refresh: function () {
            this.render();
        }
    });


    return MyPage;

});

