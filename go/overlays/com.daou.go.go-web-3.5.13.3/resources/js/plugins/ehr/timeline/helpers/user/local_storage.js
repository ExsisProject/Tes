define("timeline/helpers/user/local_storage", function(require){
    var LocalStore = {
        initWeeks : function(){
            GO.util.store.set('timeline.openWeeks', [], {type : "local"});
        },
        removeWeek : function(value){
            var openWeeks = GO.util.store.get('timeline.openWeeks');
            if (_.contains(openWeeks, value)) {
                openWeeks.splice(_.indexOf(openWeeks, value), 1);
                GO.util.store.set('timeline.openWeeks', openWeeks, {type : "local"});
            }
        },
        isContainWeek : function(value) {
            var openWeeks = GO.util.store.get('timeline.openWeeks');
            return _.contains(openWeeks, value);
        },
        addWeek : function(value){
            var openWeeks = GO.util.store.get('timeline.openWeeks');
            openWeeks.push(value);
            GO.util.store.set('timeline.openWeeks', openWeeks, {type : "local"});
        },
        setSelectedDay : function(day){
            GO.util.store.set('timeline.selectedDay', day);
        },
        isSelectedDay : function(day){
            return GO.util.store.get('timeline.selectedDay') == day;
        }
    };

    return LocalStore;
});