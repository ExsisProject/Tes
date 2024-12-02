(function() {
    
    define([
        "jquery", 
        "backbone", 
        "survey/models/survey_response", 
        "survey/helpers/html", 
        "i18n!survey/nls/survey", 
        
        "go-charts"
    ], 
    
    function(
        $, 
        Backbone, 
        SurveyResponseModel, 
        SurveyHtmlHelper, 
        SurveyLang
    ) {
        
        var DetailResultView = Backbone.View.extend({
            tagName: 'div', 
            className: 'survey_box',
            
            initialize: function() {
                if(!this.model) {
                    this.model = new SurveyResponseModel();
                }
                this.template = '<div class="survey_box"><ul class="survey"></ul></div>';
                
                bindRotateEventForGraph();
            }, 
            
            
            render: function() {
                var self = this;
                this.$el.append(this.template);
                
                this.model.getQueryList({
                    success: function(collection) {
                        renderQueryList(self, collection);
                    }
                });
            }, 
            
            addQueryView: function(queryModel) {
                var $li = $('<li>' + this._makeQueryViewTemplate(queryModel) + '</li>');
                $li.appendTo('ul.survey');
                
                this._makeQueryInfo(queryModel, $li.find('.wrap_answer'));
                this._renderGraph(queryModel, $li.find('.wrap_answer'));
            }, 
            
            responseEditable: function() {
            	if(this.model.isFinished()) return false;
            	if(!this.model.editable()) return false;
            	if(!this.model.isResponsible()) return false;
        		return true;
            }, 
            
            _makeQueryViewTemplate: function(queryModel) {
            	return SurveyHtmlHelper.getQueryViewTemplate(queryModel, 'div');
            }, 
            
            _renderActtionButton: function() {
            	this.$el.find('.survey_box').after(makeBtnTemplate());
            }, 
            
            _makeQueryInfo: function(queryModel, $container) {
            	makeQueryInfo(this, queryModel, $container);
            }, 
            
            _renderGraph: function(queryModel, $container) {
            	renderGraph(this, queryModel, $container);
            }
        });
        
        function bindRotateEventForGraph() {
        	// TODO: 안드로이드 하위버전에서는 회전 후 placeholder가 변경되기 전 크기로 잡히므로 사용하지 않는다.
        	// TODO: landscape 모드에서 새로고침했을 때 다시 portrait 모드로 가면 landscape의 크기로 그대로 사용됨
        	if(GO.util.checkOS() === 'android') return false;
        	
        	$(window)
	        	.off('.plot')
	        	.on('orientationchange.plot', function(e) {
	            	$('.graph-placeholder').each(function(i, placeholder) {
	            		var $placeholder = $(placeholder), 
	            			plot = $placeholder.data('plot');
	            		
	            		// canvas resize
	            		plot.resize();
	            		// graph redraw
	            		plot.draw();
	            	});
	            });
        }
        
        function makeBtnTemplate() {
        	var html = [];
        	
            html.push('<div class="survey_action">');
	            html.push('<a class="btn-modify-resp btn_major" data-role="button"><span class="txt">' + SurveyLang['응답 수정'] + '</span></a>');
	        html.push('</div>');
	        
	        return html.join("\n");
        }
        
        function renderQueryList(view, collection) {
            collection.each(function(model, i) {
                this.addQueryView(model);
            }, view);
            
            if(view.responseEditable()) {
            	view._renderActtionButton();
            }
        }
        
        
        function renderGraph(view, queryModel, container) {
            var $placeholder, $legend, graphData=[];
            
            if(queryModel.getResponseCount() > 0 && queryModel.isGroupOfSelect()) {
                $legend = $('<div class="legend-placeholder"></div>');
                $placeholder = $('<div class="graph-placeholder"></div>');
                $placeholder.css({"margin-top":'10px', "width": '100%', "max-width": "500px", "height": '250px'});
                
                container.append($placeholder, $legend);
                
                _.each(queryModel.getCases(), function(item, i) {
                    graphData.push({"label": _.escape(item.description), "data": item.count, "caseId" : item.id});
                });
                
                renderPlot($placeholder, $legend, graphData);
            }
        }
        
        function renderPlot($placeholder, $legend, graphData) {
            var options = {
                    series: {
                        pie: {
                            show: true, 
                            innerRadius: 0.35,
                            label: {
                                show: true, 
                                radius: 1,
                                formatter: function(label, series) {
                                    return '<span class="number" style="color:'+series.color+'">' + (parseInt(series.percent * 100) / 100) + '%</span>';
                                }, 
                            }
                        }
                    }, 
                    
                    grid: {
                        hoverable: true
                    }, 
                    
                    tooltip: true,
                    
                    tooltipOpts: {
                        shifts: {
                            x: 20,
                            y: 0
                        },
                        defaultTheme: true,
                        onHover : function(flotItem, $tooltipEl){
                             var series = flotItem.series;
                             
                            if(parseInt($tooltipEl.css("left").replace("px", "")) < 0){
                                $tooltipEl.css({left : (window.event.x + 20) + "px"});
                            }
                             
                            $tooltipEl.html("<span class='txt' style='max-width: 300px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;'>" + series.label + "</br> (<span class='number'>" + series.data[0][1] + "</span>" + SurveyLang["인원 표시 단위"] + ")"  + (parseInt(series.percent * 100) / 100) + "%" + "</span>");
                        }
                    },
                    
                    legend: {
                        show: true, 
                        labelFormatter: function(label, series) {
                            return '<span style="txt">' + label + ' (<span class="number">' + series.data[0][1] + '</span>' + SurveyLang["인원 표시 단위"] + ')</span>';
                        }, 
                        container: $legend, 
                        position: 'nw'
                    }
                },
                mobileOption = {grid : {hoverable : false}};
            
            if(GO.util.isMobile()){
                options = $.extend({}, options, mobileOption);
            }
            
        	var plot = $.plot($placeholder, graphData, options);
            
            $legend.find('td.legendColorBox').width('18px');
            $legend.find('td.legendLabel').css({'font-size': '12px', "padding": '5px'});
        }
        
        function makeQueryInfo(view, queryModel, container) {
            var html = [], 
                surveyModel = view.model, 
                targetCount = surveyModel.getTargetCount(), 
                respCount = queryModel.getResponseCount(), 
                respPercetage = respCount > 0 ? ((respCount / targetCount) * 100).toFixed(2) : '0', 
                queryType = queryModel.get('type');
            
            html.push('<dl class="result_survey_info">');
                html.push('<dt><span class="txt">'+SurveyLang["전체 참여자"]+' :</span></dt>');
                html.push('<dd><span class="number">'+targetCount+'</span><span class="txt">'+SurveyLang["인원 표시 단위"]+'</span></dd>');
                html.push('<dt><span class="txt">'+SurveyLang["참여율"]+' :</span></dt>');
                html.push('<dd>');
                html.push('<span class="number">'+respCount+'</span><span class="txt">'+SurveyLang["인원 표시 단위"]+'</span>');
                if(queryType !== 'score') {
                    html.push('<span class="gage_wrap"><span class="gage" style="width:'+respPercetage+'%"></span></span>');
                    html.push('<span class="number">'+respPercetage+'%</span>');
                }
                html.push('</dd>');
                
                if(queryType === 'score') {
                    html.push('<dt><span class="txt">'+SurveyLang["평균 점수"]+' :</span></dt>');
                    html.push('<dd><span class="average-txt number">'+getAverageScore(queryModel)+'</span></dd>');
                }
                
            html.push('</dl>');
            container.append(html.join("\n"));
        }
        
        function getAverageScore(queryModel) {
            var respCount = queryModel.getResponseCount(), 
                caseList = queryModel.getCases(), 
                total = 0, result = 0;
            
            if(respCount > 0) {
                total = _.reduce(caseList, function(memo, item) {
                    return memo + ((parseInt(item.description) || 0) * (item.count || 0));
                }, 0);
                
                result = (total / respCount).toFixed(2);
            }
            
            return result;
        }
        
        return DetailResultView;
        
    });
    
})();