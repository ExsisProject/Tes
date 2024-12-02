define("admin/views/ehr/timeline/gps/edit", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");

    var GpsEditTmpl = require("hgn!admin/templates/ehr/timeline/gps/edit");
    var TimelineAccessGpsModel = require("admin/models/ehr/timeline/access_gps");
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");
    require("jquery.go-sdk");

    var lang = {
        allowed_access_GPS_Info: AdminLang['접속 허용 GPS 정보'],
        allowed_access_GPS_Tooltip: AdminLang['접속 허용 GPS 툴팁'],
        place: AdminLang['장소명'],
        address: AdminLang['주소'],
        address_info: AdminLang['도로명 또는 지번 주소를 입력하세요'],
        search: CommonLang['검색'],
        GPS_Warn: AdminLang['GPS 사용 주의사항'],
        radius: AdminLang['반경'],
        lat: AdminLang['위도'],
        long: AdminLang['경도'],
        radius_setting_info: AdminLang['반경 설정 설명'],
        network_not_support: AdminLang['네트워크 연결 문제로 외부 사이트 접근이 차단되어 지도 서비스 사용이 불가합니다.'],
        label_all : CommonLang["모두 허용"],
        label_part : CommonLang["부분 허용"]
    }

    var TimelineAccessGpsEdit = Backbone.View.extend({

        events : {
            "click #addressSearchBtn" : "searchAddress",
            "keydown #addressSearchInput" : "searchAddressByKey",
            "click #zoomIn" : "zoomInKakaoMap",
            "click #zoomOut" : "zoomOutKakaoMap",
            "keyup input" : "update",
            "click #allOfGPS" : "toggleGPSInfo",
            "click #partOfGPS" : "toggleGPSInfo",
        },

        initialize : function (options) {
            this.options = options || {};
            this.workPlace = this.options.workPlace;
            this.useGps = this.workPlace.get('useGps');
            this.center = {lat : 37.332462, lng: 127.13706};
            this.radius = 100;
            this.level = 4;
            this.updated = false;

            if (this.workPlace.get('id')) {
                var models = this.workPlace.get('gpsModels');
                if (models.length > 0) {
                    this.model = new TimelineAccessGpsModel(models[0]);
                    this.radius = this.model.get('radius');
                    this.latitude = this.model.get('latitude');
                    this.longitude = this.model.get('longitude');
                    this.center = {lat: this.latitude, lng: this.longitude};
                }
            }
        },

        toggleGPSInfo : function (e) {
            if ($(e.currentTarget).val() === 'all') {
                this.$el.find("#accessGpsBlock").css('display', 'none');
            } else {
                this.$el.find("#accessGpsBlock").css('display', '');
                this.tryLocation();
                this.model = new TimelineAccessGpsModel();
            }
        },

        update : function() {
            this.updated = true;
        },

        render : function () {
            var self = this;
            self.$el.html(GpsEditTmpl({
                lang: lang,
                model: this.model,
                useGps : this.useGps,
                isKaKaoMap: true,
            }));

            if (this.model) {
                this.setGpsInfoStr();
                this.moveMap(this.center);
            }
            return this;
        },

        notSupportViewRender : function () {
            var self = this;
            self.$el.html(GpsEditTmpl({
                lang: lang,
                model: this.model,
                useGps : this.useGps,
                isKaKaoMap: false,
            }));

            self.$el.find("#accessGpsBlock").hide();
            return this;
        },

        moveMap:function(location){
            this.center = location;
            this.kakaoMap(location, this.radius);
        },
        isCheckedUseGps : function() {
            return this.$el.find("#partOfGPS").prop("checked");
        },

        saved : function() {
            this.updated = false;
        },

        validate : function() {
            if (!this.isCheckedUseGps()) {
                return true;
            }

            var name = this.$el.find('#gpsName').val();

            if (!name) {
                $.goMessage(AdminLang['장소명을 입력해주세요']);
                return false;
            }

            if (!this.radius || !this.latitude || !this.longitude) {
                $.goMessage(AdminLang['지도에서 범위를 선택해주세요']);
                return false;
            }
            return true;
        },

         getGpsModel : function() {

             if (!this.isCheckedUseGps()) {
                 return;
             }
            var self = this;
            var name = this.$el.find('#gpsName').val();

            self.model.set("name", name);
            self.model.set("radius", this.radius);
            self.model.set("latitude", this.latitude);
            self.model.set("longitude", this.longitude);

            return self.model;
        },

        zoomInKakaoMap : function(e) {
            if (this.level > 1) {
                this.level = this.level - 1;
            }
            this.map.setLevel(this.level);
        },

        zoomOutKakaoMap : function(e) {
            if (this.level < 14) {
                this.level = this.level + 1;
            }
            this.map.setLevel(this.level);
        },

        searchAddressByKey : function(e) {
            if (e.keyCode === 13) {
                this.searchAddress();
                e.preventDefault();
            }
        },

        searchAddress : function() {
            var self = this;
            var address = $('#addressSearchInput').val();
            // 주소로 좌표 검색
            self.geocoder.addressSearch(address, function(result, status) {
                if (status === kakao.maps.services.Status.OK) {
                    var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                    // 결과값으로 받은 위치를 마커로 표시
                    self.marker.setPosition(coords);
                    self.marker.setMap(self.map);
                    self.map.setCenter(coords);
                }
            });
        },

        // http://apis.map.kakao.com/web/sample/calculateCircleRadius 참고
        kakaoMap : function (center, distance) {
            if (_.isUndefined(kakao))
                return;

            var self = this;
            var mapContainer = document.getElementById('map'), // 지도를 표시할 div
                mapOption = {
                    center: new kakao.maps.LatLng(center.lat, center.lng), // 지도의 중심좌표
                    level: this.level // 지도의 확대 레벨
                };

            this.map = new kakao.maps.Map(mapContainer, mapOption); // 지도 생성
            this.geocoder = new kakao.maps.services.Geocoder(); // 주소-좌표 변환 객체

            var drawingCircle;
            var drawingLine;
            var drawingOverlay;
            var drawingFlag = false;
            var centerPosition; // 원의 중심좌표

            initDrawing(center, distance);

            kakao.maps.event.addListener(self.marker, 'click', function () {
                startDrawingCircle(this.getPosition());
            });

            kakao.maps.event.addListener(self.map, 'click', function(mouseEvent) {
                self.update();
                startDrawingCircle(mouseEvent.latLng);
            });
            kakao.maps.event.addListener(self.map, 'rightclick', function(mouseEvent) {
                self.radius = '';
                self.latitude = '';
                self.longitude = '';
                self.setGpsInfoStr();
                removeCircle();
                drawingFlag = false;
            });

            kakao.maps.event.addListener(self.map, 'mousemove', function (mouseEvent) {
                if (drawingFlag) {
                    var mousePosition = mouseEvent.latLng; // 마우스 커서의 현재 위치
                    var linePath = [centerPosition, mousePosition]; // 그려지고 있는 선을 표시할 좌표 배열
                    drawingLine.setPath(linePath); // 그려지고 있는 선 객체에 좌표 배열 설정
                    var length = drawingLine.getLength(); // 원의 반지름을 선 객체를 이용해 계산

                    if(length > 0) {
                        var circleOptions = {
                            center : centerPosition,
                            radius: length,
                        };
                        self.radius = length;

                        drawingCircle.setOptions(circleOptions);

                        var radius = Math.round(drawingCircle.getRadius());
                        var content = '<div class="info">' + AdminLang['반경'] +' <span class="number">' + radius + '</span>m</div>';

                        drawingOverlay.setPosition(mousePosition);
                        drawingOverlay.setContent(content);

                        // 그려지고 있는 원을 지도에 표시
                        drawingCircle.setMap(self.map);
                        drawingLine.setMap(self.map);
                        drawingOverlay.setMap(self.map);
                    } else {
                        drawingCircle.setMap(null);
                        drawingLine.setMap(null);
                        drawingOverlay.setMap(null);
                    }

                    self.setGpsInfoStr();
                }
            });

            function startDrawingCircle(centerPos) {
                if (!drawingFlag) {
                    removeCircle();
                    drawingFlag = true;
                    centerPosition = centerPos;
                    self.latitude = centerPos.Ha || centerPos.getLat();
                    self.longitude = centerPos.Ga || centerPos.getLng();
                    self.setGpsInfoStr();
                }else{

                    if (drawingFlag) {
                        var radius = Math.round(drawingCircle.getRadius()) // 원의 반경 정보를 얻어옵니다
                        var content = getTimeHTML(radius); // 커스텀 오버레이에 표시할 반경 정보입니다

                        drawingOverlay.setContent(content);
                        self.radius = radius;
                        self.setGpsInfoStr();

                        drawingCircle.setMap(self.map);
                        drawingLine.setMap(self.map);
                        drawingOverlay.setMap(self.map);

                        drawingFlag = false;
                        centerPosition = null;
                    }
                }
            }

            function removeCircle() {
                if (drawingCircle) {
                    drawingCircle.setMap(null);
                    drawingLine.setMap(null);
                    drawingOverlay.setMap(null);
                }
            }

            function getTimeHTML(distance) {

                // 도보의 시속은 평균 4km/h 이고 도보의 분속은 67m/min입니다
                var walkkTime = distance / 67 | 0;
                var walkMin = '<span class="number">' + walkkTime + '</span>' + AdminLang['분'];

                // 거리와 도보 시간, 자전거 시간을 가지고 HTML Content를 만들어 리턴합니다
                var content = '<ul class="info">';
                content += '    <li>';
                content += '        <span class="label">' + AdminLang['총거리'] + '</span><span class="number">' + distance + '</span>m';
                content += '    </li>';
                content += '    <li>';
                content += '        <span class="label">' + AdminLang['도보'] + '</span>' + walkMin;
                content += '    </li>';
                content += '</ul>';

                return content;
            }

            function initDrawing(center, distance) {
                // 그려지고 있는 원의 반경을 표시할 선 객체를 생성
                drawingLine = new kakao.maps.Polyline({
                    strokeWeight: 3,
                    strokeColor: '#00a0e9',
                    strokeOpacity: 1,
                    strokeStyle: 'solid' // 선의 스타일
                });

                // 그려지고 있는 원을 표시할 원 객체를 생성
                drawingCircle = new kakao.maps.Circle({
                    strokeWeight: 1, // 선의 두께
                    strokeColor: '#00a0e9', // 선의 색깔
                    strokeOpacity: 0.1, // 선의 불투명도. 0에서 1 사이값이며 0에 가까울수록 투명
                    strokeStyle: 'solid', // 선의 스타일
                    fillColor: '#00a0e9', // 채우기 색깔
                    fillOpacity: 0.2 // 채우기 불투명도
                });

                // 그려지고 있는 원의 반경 정보를 표시할 커스텀오버레이를 생성
                drawingOverlay = new kakao.maps.CustomOverlay({
                    xAnchor: 0,
                    yAnchor: 0,
                    zIndex: 1
                });

                if (center && distance) {
                    var na = new kakao.maps.LatLng(center.lat, center.lng);
                    var circleOptions = {
                        center: na,
                        radius: distance
                    };
                    drawingCircle.setOptions(circleOptions);
                    drawingCircle.setMap(self.map);
                }

                self.marker = new kakao.maps.Marker({
                    position: new kakao.maps.LatLng(center.lat, center.lng),
                    clickable: true
                });
            }
        },

        setGpsInfoStr : function() {
            if (!this.radius || !this.latitude || !this.longitude) {
                this.$el.find('#gpsInfoStr').text('');
            } else {
                this.$el.find('#gpsInfoStr').text(this.radius + ' m / ' + this.latitude + " / " + this.longitude);
            }
        },

        tryLocation:function() {
            var self = this;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var location = {lat:position.coords.latitude, lng:position.coords.longitude}
                    self.moveMap(location );
                }, function(error) {
                    self.moveMap(self.center);
                }, {
                    enableHighAccuracy: false,
                    maximumAge: 0,
                    timeout: Infinity
                });
            }
        }
    });
    return TimelineAccessGpsEdit;
});