(function(){
  'use strict';
  var defaultTimeout = 10000;
  angular
    .module('ngApp')
    .factory('RosterService', ['$resource', function($resource) {
      return $resource('/api/espnffl/:league/:season/:team/roster', {}, {
        Get: {
          method:'GET',
          timeout: defaultTimeout,
          isArray: false
        }
      });
    }])
    .factory('EspnFflService', ['$resource', function($resource) {
      return $resource('/api/espnffl/:league/:season/:noun', {}, {
        Get: {
          method:'GET',
          timeout: defaultTimeout,
          isArray: false
        }
      });
    }])
    .factory('UiService', [function($resource) {
      return {
        current: {
          leagueId: -1,
          seasonId: -1,
          teamId: -1,
          roster: null,
          settings: null,
          members: null,
          member: null
        }
      };
    }]);
})();