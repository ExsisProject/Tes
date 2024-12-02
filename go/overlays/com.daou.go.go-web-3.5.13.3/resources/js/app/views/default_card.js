;(function(){
define(
    [
        "backbone", 
        "app", 
        "jquery",
        "hgn!templates/default_card"
    ],
    function(
        Backbone,
        GO,
        $,
        DefaultCardTmpl
    ){
        var tpl = {
            "button" : "<a class='btn_lead' id={targetId}><span class='ic ic_report'></span><span class='txt'>{label}</span></a>"
        };
        
        var DefaultCardView = Backbone.View.extend({
            
            initialize : function(){
                
            },
            makeTemplate : function(options){
                var self = this,
                    cardTpl = DefaultCardTmpl({
                        header : options.header,
                        customTag : options.customTag || "",
                        subject : options.subject,
                        content : options.content,
                        actions : function(){
                            if(options.buttons){
                                var buttonWrap = [];
                                
                                $.each(options.buttons, function(index, button){
                                    var label = button.label,
                                        callback = button.callback,
                                        buttonTpl = tpl.button,
                                        targetId = (new Date).getTime()+ "" + parseInt(Math.random(8) * 1000);
                                    
                                    buttonTpl = self.template(buttonTpl,{
                                        "label" : label,
                                        "targetId" : targetId
                                    });
                                    
                                    buttonWrap.push(buttonTpl);
                                    
                                    if(callback){
                                        $("body").on('click', "#"+targetId , callback);
                                    }
                                });
                                return buttonWrap.join("");
                            }
                        }
                });
                return cardTpl;
            },
            template : function(tpl,data){ 
                return tpl.replace(/{(\w*)}/g,function(m,key){return data.hasOwnProperty(key)?data[key]:"";}); 
            }
        });
        
        return DefaultCardView
    });
})();
    
