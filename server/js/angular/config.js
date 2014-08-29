(function(){
  'use strict';
  angular
    .module('ngApp')
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/login', {
          templateUrl: '/partials/admin/login'
        })
        .when('/:league/:season/:team/roster', {
          templateUrl: '/partials/team/index'
        })
        .when('/', {
          templateUrl: '/partials/home/index'
        })
        .otherwise({
          redirectTo: '/'
        });
      $locationProvider.html5Mode(true);
    }]);
})();