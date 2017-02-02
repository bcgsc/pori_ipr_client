/*
 * Lodash Factory
 *
 * Allows lodash to be an injectable object into
 * angular modules
 *
 */
app.factory('_', ['$window', ($window) => {
    let lodash = $window._;    
    delete window._;
    return lodash;
}]);
