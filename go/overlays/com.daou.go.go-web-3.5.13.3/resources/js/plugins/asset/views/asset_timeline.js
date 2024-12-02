define(function(require) {

    var MATRIX_EVENT = require('matrix/constants/matrix_event');

    var CommonLang = require('i18n!nls/commons');
    var AssetLang = require('i18n!asset/nls/asset');

    var Backbone = require('backbone');
    var MatrixView = require('matrix');

    var Reservations = require('asset/collections/reservations');
    var Assets = require('asset/collections/reservation_assets');
    var AssetItems = require('asset/collections/asset_item_list');

    var CreateView = require('asset/views/rental_reserv_create');

    return Backbone.View.extend({

        events: {
            'change #assets': '_onChangeAsset'
        },

        initialize: function(options) {
            options = options || {};
            this.injectedAssetId = options.assetId;
            this.assetId = this.injectedAssetId || GO.util.store.get(GO.session("id") + "-last-asset");

            this.assets = new Assets();
            this.assets.on('sync', this._onSyncAssets, this);
            this.assets.fetch();

            this.assetItems = AssetItems.init();
            this.assetItems.on('sync', this._onSyncAssetItems, this);

            this.reservations = new Reservations();
        },

        _onChangeAsset: function() {
            var assetId = this.$('#assets').val();
            this.asset = this.assets.get(assetId);
            this.assetId = assetId;
            GO.util.store.set(GO.session("id") + "-last-asset", assetId);
            this._getAssetItems();
        },

        _onSyncAssets: function() {
            var storedAssetId = this.assetId;
            this.asset = storedAssetId ? (this.assets.get(storedAssetId) || this.assets.at(0)) : this.assets.at(0);
            if (this.asset) {
                this._getAssetItems();
                this.assetId = this.asset.id;
            }
        },

        _getAssetItems: function() {
            this.assetItems.setAssetId(this.asset.id);
            this.assetItems.fetch({data : { 'page' : '0' , 'offset' : '100' }});
        },

        _onSyncAssetItems: function() {
            this.reservations.setRows(this.assetItems.getItems());
            this.reservations.setAssetId(this.asset.id);
            this.reservations.setFromDate(this.asset.getStartTime());
            this._renderMatrix();
        },

        _renderMatrix: function() {
            var leftToolbarTemplate = this._leftToolbarTemplate();
            var rightToolbarTemplate = this.injectedAssetId ? '' : this._rightToolbarTemplate();
            var contentRenderer = function() {
                var reserveModel = this.model;  // 가독성때문에 추가
                var reserveUserName = reserveModel.get('user') ? (reserveModel.get('user').name || '') : '';
                var useAnonym = !!reserveModel.get('useAnonym');
                var startTime = moment(reserveModel.get('startTime')).format('HH:mm');
                var endTime = moment(reserveModel.get('endTime')).format('HH:mm');
                var name = useAnonym ? '' : reserveUserName;
                var content = name + ' ' + startTime + ' ~ ' + endTime;
                var titlePrefix = this.model.get('otherCompanyReservation') ? this.model.get('user').companyName + ' ' || '' : '';
                var propertiesLabel = _.map(reserveModel.get('properties'), function(property) {
                    return property.content;
                }).join(', ');
                return {
                    content: content,
                    title: titlePrefix + content + " " + propertiesLabel,
                    otherCompanyReservation : !!this.model.get('otherCompanyReservation')
                }
            };
            this.matrixView = new MatrixView({
                matrix: {
                    type: 'day',
                    gridUnit: 'minutes',
                    gridValue: '30',
                    startTime: this.asset.getStartTime(),
                    endTime: this.asset.getEndTime(),
                    useGrid: false,
                    navigationInterval: 'day',
                    contentRenderer: contentRenderer,
                    useDrag: true
                },
                leftToolbar: leftToolbarTemplate,
                rightToolbar: rightToolbarTemplate,
                emptyMessage: AssetLang['이용가능한 자산이 없습니다.'],
                collection: this.reservations
            });

            this._bindMatrixEvents();
            this.$el.html(this.matrixView.el);

            this.$('#assets').val(this.asset.id);
        },

        _bindMatrixEvents: function() {
            /**
             * 지난 시간을 사용 할 수 없는 제약이 있다.
             * 향후 더이상 발생하지 않을 것 같은 제약이므로 예약만 별도의 처리를 하도록 하자.
             */
            this.matrixView.$el.on(MATRIX_EVENT.ROW_MOUSE_DOWN, $.proxy(function(e, data) {
                var day = moment(this.reservations.fromDate).day();
                if (!this.asset.isAvailableDay(day)) {
                    $.goError(AssetLang['예약할 수 없는 요일입니다.']);
                    data.item.remove();
                }

                if (moment(data.column.attr('data-column-key')).isBefore(moment().startOf('day'))) {
                    $.goError(AssetLang['지난 시간은 예약할 수 없습니다.']);
                    data.item.remove();
                }
            }, this));
            this.matrixView.$el.on(MATRIX_EVENT.ROW_MOUSE_UP, $.proxy(function(e, data) {
                if (!data.item.$el.parents('body').length) return;
                if (!data.item.isValid()) return;
                this._popupLayer(data);
            }, this));
            this.matrixView.$el.on(MATRIX_EVENT.ITEM_CLICK, $.proxy(function(e, data) {
                var model = data.target.data('model');
                if (!model.get('itemId') || !model.id) return;
                var url = 'asset/' + this.assetId + '/item/' + model.get('itemId') + '/status/reservation/' + model.id;
                GO.router.navigate(url, true);
            }, this));
            this.matrixView.$el.on(MATRIX_EVENT.ROW_HEAD_CLICK, $.proxy(function(e, data) {
                var date = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                var url = 'asset/' + this.assetId + '/item/' + data.rowId + '/weekly/reserve/' + date;
                GO.router.navigate(url, true);
            }, this));
        },
        _isTurnOnRecurrenceOption: function(data){
            var isLoopItem = false;
            var itemKey = data.row.data().rowKey;
            for (var i in this.assetItems.models) {
                if (this.assetItems.models[i].id == itemKey) {
                    isLoopItem = this.assetItems.models[i].attributes.useRecurrence;
                    break;
                }
            }
            return this.asset.attributes.allowLoopReservation && isLoopItem;
        },

        _popupLayer: function(data) {
            var buttons = [];
            if (this._isTurnOnRecurrenceOption(data)) {
                buttons.push({
                    btext : AssetLang['예약상세 등록'],
                    btype : "confirm",
                    autoclose : false,
                    callback: $.proxy(function() {
                        var startDate = GO.util.toISO8601(GO.util.toMoment($('#startDate').val()));
                        var params = [];
                        params.push("?useAnonym=" + $('#useAnonym').is(':checked'));
                        params.push("allDay=" + $("#allday").is(":checked"));
                        params.push("userId=" + $('#userId').attr('data-userid'));
                        params.push("userName=" + $('#userName').text());
                        params = params.join("&");
                        GO.router.navigate(
                            'asset/' + this.assetId +
                            '/item/' + data.row.attr('data-row-key') +
                            '/create/reservation/' + startDate + "/" + $('#startTime').val() + "/" + $('#endTime').val() + params, true);
                    }, this)
                });
            }
            buttons.push({
                btext : CommonLang['확인'],
                btype : "confirm",
                autoclose : false,
                callback: $.proxy(function() {
                    view.reservCreate(true).done($.proxy(function() {
                        this.matrixView.collection.fetch();
                        popup.close();
                    }, this));
                }, this)
            });
            buttons.push({
                btext : CommonLang['취소'],
                btype : 'normal',
                callback: $.proxy(function() {
                    data.item.remove();
                }, this)
            })

            var popup = $.goPopup({
                header : AssetLang['예약'],
                width : 685,
                top : '40%',
                pclass : "layer_normal layer_temporary_save",
                modal : true,
                buttons: buttons,
                closeCallback: function() {
                    data.item.remove();
                }
            });

            var date = data.column.attr('data-column-key');
            var model = data.item.model;
            var itemId = data.row.attr('data-row-key');
            var endTime = moment(model.get('endTime')).format('HH:mm');
            var view = new CreateView({
                assetId : this.assetId,
                itemId : itemId,
                type : 'reservation',
                selectDate : date,
                selectTime : moment(model.get('startTime')).format('HH:mm'),
                endTime : endTime == '00:00' ? '23:59' : endTime, // 기존 예약 소스가 00:00 을 받지 못한다.
                status : 'create',
                isPopup : true
            });
            popup.find('div.content').html(view.el);
            view.render().then(function() {
                popup.reoffset();
            });
        },

        _leftToolbarTemplate: function() {
            return '<h1 class="s_title">' + AssetLang['시간대별 예약 현황'] + '</h1>';
        },

        _rightToolbarTemplate: function() {
            var storedAssetId = this.assetId || (this.assets.length ? this.assets.at(0).id : '');
            var options = this.assets.map(function(asset) {
                var isSelected = asset.id == storedAssetId ? 'selected' : '';
                return '<option value="' + asset.id + '" ' + isSelected + '>' + asset.get('name') + '</option>';
            }, this);

            var template = Hogan.compile([
                '<select id="assets">', options, '</select>'
            ].join(''));

            return template.render();
        }
    });
});
