(function(){
    define([
        "jquery",
        "backbone",
        "app",

        "models/mobile_config",
        "hgn!templates/user/user_device",

        "i18n!nls/commons",
        "i18n!nls/user"
    ],
    function(
        $,
        Backbone,
        App,

        MobileConfig,
        DeviceTmpl,
        
        CommonLang,
        UserLang
    ){

        var MobileDeviceModel = Backbone.Model.extend({
    		initialize: function(options) {
    			this.id = options.id;
    		},

    		url: function() {
    			return GO.contextRoot + 'api/mobile/device/' + this.id;
    		}
    	});

        var MobileDeviceCollection = Backbone.Collection.extend({
            url: GO.contextRoot + 'api/mobile/device',
            model: MobileDeviceModel
        });

        var MobileDeviceCollectionView = Backbone.View.extend({

            CLASS: {
                BLOCKED: 'ic_ctrl_off',
                ALLOWED: 'ic_ctrl_on'
            },

            tagName: 'table',
            className: 'type_normal tb_sub tb_mam',

            initialize: function(options) {
                this.mamDeviceCollection = new MobileDeviceCollection();
                this.$appendTarget = options.$appendTarget;
            },

            render: function() {
                this.mamDeviceCollection.fetch().
                    done($.proxy(this._renderList, this)).
                    fail(function() {
                        $.goAlert(CommonLang['500 오류페이지 타이틀']);
                    });
            },

            _renderList: function() {
                this.$el.html(this._makeListTemplate().render(this._makeListData()));
                this.$appendTarget.html(this.$el);
                this._bindEvents();
            },

            _makeListTemplate: function() {
                var htmls = [];
                htmls.push('    <thead>');
                htmls.push('        <tr>');
                htmls.push('            <th class="device">{{lang.deviceName}}</th>');
                htmls.push('            <th class="time">{{lang.lastAccessTime}}</th>');
                htmls.push('            <th class="contact">{{lang.accessSetting}}');
                htmls.push('                <span class="help"><span class="tool_tip top">');
                htmls.push('                    <strong>{{lang.on}}</strong> {{lang.on_desc}} <br><br>');
                htmls.push('                    <strong>{{lang.off}}</strong> {{lang.off_desc}}');
                htmls.push('                    <i class="tail_top"></i>');
                htmls.push('                </span></span>');
                htmls.push('            </th>');
                htmls.push('            <th></th>');
                htmls.push('        </tr>');
                htmls.push('    </thead>');
                htmls.push('    <tbody id="device_list_table_body">')
                htmls.push('        {{^data.deviceList}}');
                htmls.push('        <tr class="topMenu">');
                htmls.push('            <td colspan="4">');
                htmls.push('                <p class="data_null">');
                htmls.push('        			<span class="ic_data_type ic_no_data"></span>');
                htmls.push('        			<span class="txt">{{data.noAccessDevice}}</span>');
                htmls.push('                </p>');
                htmls.push('            </td>');
                htmls.push('        </tr>');
                htmls.push('        {{/data.deviceList}}');
                htmls.push('        {{#data.deviceList}}');
                htmls.push('        <tr class="topMenu" data-id={{id}}>');
                htmls.push('            <td class="device" name="name">{{deviceName}}</td>');
                htmls.push('            <td class="time" name="contact">{{lastAccessTime}}</td>');
                htmls.push('            <td class="contact mam_toggle" name="toggle">');
                htmls.push('                <span class="device_access_setting ic_control {{deviceAccessOnOff}}"></span>');
                htmls.push('            </td>');
                htmls.push('            <td class="mam_delete" name="delete">');
                htmls.push('                <span class="device_access_delete ic_side ic_basket_bx" title="{{lang.del}}"></span>');
                htmls.push('            </td>');
                htmls.push('        </tr>');
                htmls.push('        {{/data.deviceList}}');
                htmls.push('    </tbody>');
                return Hogan.compile(htmls.join('\n'));
            },

            _makeListData: function() {
                var lang = {
                    del:            CommonLang['삭제'],
                    deviceName:     CommonLang['기기명'],
                    accessSetting:  CommonLang['접속설정'],
                    lastAccessTime: CommonLang['마지막 접속시간'],
                    on: 			CommonLang["접속설정 ON"],
                    on_desc:        CommonLang["접속설정 ON 설명"],
                    off: 		    CommonLang["접속설정 OFF"],
                    off_desc: 		CommonLang["접속설정 OFF 설명"]
                };

                var data = {
                    noAccessDevice: UserLang['등록된 모바일 기기 정보가 없습니다.'],
                    deviceList: []
                };

                data.deviceList = this.mamDeviceCollection.map(function(model) {
                    return {
                        id: model.get('id'),
                        deviceName: model.get('deviceLabel'),
                        lastAccessTime: GO.util.basicDate3(model.get('lastConnected')),
                        deviceAccessOnOff: model.get('blocked') ? this.CLASS.BLOCKED : this.CLASS.ALLOWED
                    }
                }, this);

                return {
                    lang: lang,
                    data: data
                };
            },

            _noticeTmp : function(title, sub) {
                var template = [];
                template.push('<div class="content">');
                template.push('			<p class="q">' + title + '</p>');
                if (sub) {
                    template.push('		<p class="add">' + sub + '</p>');
                }
                template.push('</div>');

                return Hogan.compile(template.join("\n"));
            },

            _bindEvents: function() {
                this.$el.off('click', 'span.device_access_setting');
                this.$el.off('click', 'span.device_access_delete');
                this.$el.on('click', 'span.device_access_setting', $.proxy(this._onAccessSettingClicked, this));
                this.$el.on('click', 'span.device_access_delete', $.proxy(this._onAccessDeleteClicked, this));
            },

            _onAccessSettingClicked: function(e) {
                var self = this,
                    $target = $(e.currentTarget),
                    id = $target.parents('tr').attr('data-id'),
                    blocked = $target.hasClass(this.CLASS.BLOCKED);

                var title, subTitle;
                if (!blocked) {
                    // 차단시
                    title = CommonLang["접속차단알림"];
                    subTitle = CommonLang["차단알림부제"];
                } else {
                    // 허용시
                    title = CommonLang["접속허용알림"];
                    subTitle = CommonLang["허용알림부제"];
                }

                this.notiPopup = $.goPopup({
                    pclass : "layer_confim layer_colleage",
                    modal : true,
                    width : "460px",
                    closeIconVisible : false,
                    contents : this._noticeTmp(title, subTitle).render(),
                    buttons : [{
                        'btext' : CommonLang["확인"],
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback' : function(){
                            self._accessSettingProc(id, blocked);
                        }
                    },{
                        'btext' : CommonLang["취소"],
                        'btype' : 'cancel'
                    }]
                });
            },

            _accessSettingProc: function(id, blocked) {
                var self = this;
                var model = this.mamDeviceCollection.get(id);
                model.set('blocked', !blocked);
                model.save().done($.proxy(function(m) {
                    this.notiPopup.close();
                    this._renderList();
                }, this));
            },

            _onAccessDeleteClicked: function(e) {
                var self = this,
                    id = $(e.currentTarget).parents('tr').attr('data-id'),
                    title = CommonLang["등록기기삭제"];

                this.delPopup = $.goPopup({
                    pclass : "layer_confim layer_colleage",
                    modal : true,
                    width : "460px",
                    closeIconVisible : false,
                    contents : this._noticeTmp(title).render(),
                    buttons : [{
                        'btext' : CommonLang["확인"],
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback' : function(){
                            self._onAccessDeleteProc(id);
                        }
                    },{
                        'btext' : CommonLang["취소"],
                        'btype' : 'cancel'
                    }]
                });
            },

            _onAccessDeleteProc: function( id ) {
                var model = this.mamDeviceCollection.get( id );
                model.destroy().done($.proxy(function(m) {
                    this.delPopup.close();
                    this._renderList();
                }, this));
            }
        });

        var OTPDeviceModel = Backbone.Model.extend({
            url : GO.contextRoot + 'api/otp/device'
        });

        var OTPDeviceListView = Backbone.View.extend({

            tagName: 'table',
            className: 'type_normal tb_sub tb_mam',

            lang: {
                deviceModel: CommonLang['기기명'],
                osType: CommonLang['OS 타입'],
                registeredAt: CommonLang['OTP 등록일']
            },

            initialize: function(options) {
                this.$appendTarget = options.$appendTarget;
                this.model = new OTPDeviceModel();
            },

            render: function() {
                this.model.fetch().
                    done($.proxy(function() {
                        this.$el.html(this._makeTemplate().render(this._makeData()));
                        this.$appendTarget.html(this.$el);
                    }, this));
            },

            _makeTemplate: function() {
                var htmls = [];
                htmls.push('<thead>');
                htmls.push('    <tr>');
                htmls.push('        <th class="device">{{lang.deviceModel}}</th>');
                htmls.push('        <th class="time">{{lang.osType}}</th>');
                htmls.push('        <th class="contact">{{lang.registeredAt}}</th>');
                htmls.push('    </tr>');
                htmls.push('</thead>');
                htmls.push('<tbody id="otp_device_list">');
                htmls.push('    <tr class="topMenu">');
                htmls.push('        <td class="device" name="name">{{deviceModel}}</td>');
                htmls.push('        <td class="os_type" name="os_type">{{osType}}</td>');
                htmls.push('        <td class="time" name="time">{{registeredAt}}</td>');
                htmls.push('    </tr>');
                htmls.push('</tbody>');
                return Hogan.compile(htmls.join('\n'));
            },

            _makeData: function() {
                return {
                    lang: this.lang,
                    deviceModel: this.model.get('deviceModel'),
                    osType: this.model.get('osType'),
                    registeredAt: GO.util.basicDate3(this.model.get('registeredAt'))
                }
            }
        });

        var OTPRegisterGuideView = Backbone.View.extend({

            tagName: 'div',
            className: 'otp_certify',

            lang: {
                'otpCertifyTitle': CommonLang['OTP 사용이 설정된 계정입니다.'],
                'otpCertifyDesc' : CommonLang['OTP 사용 설명'],
                'otpCertifyButton' : CommonLang['모바일 OTP 기기 인증 설정']
            },

            initialize: function(options) {
                this.$appendTarget = options.$appendTarget;
            },

            render: function() {
                this.$el.append(this._makeTemplate().render({
                    lang: this.lang
                }));
                this.$appendTarget.html(this.$el);
                this._bindEvents();
            },

            _makeTemplate: function() {
                var htmls = [];
                htmls.push('    <img src="/resources/images/opt_certify_img.png" alt="opt image" width="290" height="200">');
                htmls.push('    <div class="otp_certify_con">');
                htmls.push('        <span class="otp_certify_title">{{lang.otpCertifyTitle}}</span>');
                htmls.push('        <span class="txt">{{{lang.otpCertifyDesc}}}</span>');
                htmls.push('        <a class="btn_major_s"><span id="otp_regist_button" class="txt">{{lang.otpCertifyButton}}</span></a>');
                htmls.push('    </div>');
                return Hogan.compile(htmls.join('\n'));
            },

            _bindEvents: function() {
                this.$el.off('click', '#otp_regist_button');
                this.$el.on('click', '#otp_regist_button', $.proxy(this._onOTPRegistButtonClicked, this));
            },

            _onOTPRegistButtonClicked: function() {
                document.location.href = '/otpPreRegist';
            }
        });

        var UserDeviceAppView = Backbone.View.extend({

            el : "#content",
            render: function() {
                var mobileConfig = new MobileConfig();
                mobileConfig.fetch().
                    done($.proxy(function() {

                        this._renderLayout({
                            mamActive: mobileConfig.isMAMEnabled(),
                            otpActive: mobileConfig.isOTPEnabled(),
                            otpDeviceRegistered: mobileConfig.isOTPDeviceRegistered()
                        });

                        if (mobileConfig.isMAMEnabled()) {
                            this._renderMAM();
                        }

                        if (mobileConfig.isOTPEnabled()) {
                            if (mobileConfig.isOTPDeviceRegistered()) {
                                this._renderOTPList();
                            } else {
                                this._renderRegistGuide();
                            }
                        }
                    }, this));
            },
            
            _renderLayout: function(options) {
                this.$el.html(DeviceTmpl({
                    data: options,
                    lang: {
                        title:              UserLang['보안설정'],
                        deviceList:         UserLang['등록된 기기 정보'],
                        registNoti:         UserLang['사용기기 등록 안내'],
                        otpDeviceListTitle: CommonLang["OTP 발급 기기 정보"],
                        otpDeviceListDesc:  CommonLang["OTP 발급 기기 정보 설명"],
                        otpRegister:        CommonLang["OTP 인증"]
                    }
                }));
            },

            _renderMAM: function() {
                var mamListView = new MobileDeviceCollectionView({
                    $appendTarget : this.$('#device_list_table')
                });
                mamListView.render();
            },

            _renderOTPList: function() {
                var otpDeviceListView = new OTPDeviceListView({
                    $appendTarget : this.$('#otp_device_list')
                });
                otpDeviceListView.render();
            },

            _renderRegistGuide: function() {
                var otpRegisterGuideView = new OTPRegisterGuideView({
                    $appendTarget : this.$('#otp_device_registration')
                });
                otpRegisterGuideView.render();
            }
        });
        
        return {
            render: function() {
                var userDeviceListView = new UserDeviceAppView();
                return userDeviceListView.render();
            }
        };
        
    });
    
}).call(this);