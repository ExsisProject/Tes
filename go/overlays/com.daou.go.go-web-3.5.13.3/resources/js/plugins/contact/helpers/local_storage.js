define(function(require){
    var Amplify = require("amplify");

    function getStoredCategoryIsOpen(store_key) {
        var savedCate = getStoredCategory(store_key);

        if (savedCate == undefined) {
            savedCate = true;
        }

        return savedCate;
    };

    function getStoredCategory(store_key){
        var savedCate = '';

        if (!window.sessionStorage) {
            savedCate = Amplify.store(store_key);
        } else {
            savedCate = Amplify.store.sessionStorage(store_key);
        }

        return savedCate;
    };

    function storeCategoryIsOpen(store_key, category) {
        return Amplify.store(store_key, category, {type: !window.sessionStorage ? null : 'sessionStorage'});
    };

    return {
        "getStoredCategoryIsOpen" : getStoredCategoryIsOpen,
        "getStoredCategory" : getStoredCategory,
        "storeCategoryIsOpen" : storeCategoryIsOpen
    }
});
