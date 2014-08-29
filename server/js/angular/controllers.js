(function(){
  'use strict';
  angular
    .module('ngApp')
    .controller('Master_Controller', ['$routeParams', '$rootScope', '$location', 'UiService', function($routeParams, $rootScope, $location, UiService) {
      var vm = this;
      $rootScope.$on('settingsLoaded', function(event, data){
        vm.settings = UiService.current.settings;
        vm.settings.leagueName = _(UiService.current.settings.basic).findWhere({key:'LeagueName'}).value;
      });
      $rootScope.$on('membersLoaded', function(event, data){
        vm.members = UiService.current.members;
      });
      $rootScope.$on('memberLoaded', function(event, data){
        vm.member = UiService.current.member;
      });

      vm.onMemberSelected = function(member){
        vm.member = member;
        $location.path('/' + [$routeParams.league, $routeParams.season, member.team.id, 'roster'].join('/'));
      };
    }])
    .controller('Roster_Controller', ['$location', '$routeParams', '$rootScope', '$scope', 'UiService', 'EspnFflService', 'RosterService', function($location, $routeParams, $rootScope, $scope, UiService, EspnFflService, RosterService) {
      var vm = this;
      vm.errors = [];
      vm.isWorking = true;

      $scope.$watch('errors', function(){
        if(vm.errors && vm.errors.length){
          vm.isWorking = false;
        }
      });

      async.parallel({
        getRoster: function(callback){
          RosterService.Get({
            league:$routeParams.league,
            season:$routeParams.season,
            team:$routeParams.team
          }, function(data){
            return callback(null, data);
          }, function(err){
            return callback({reason: 'Could not retrieve roster information at this time. Please try back later.'});
          });
        },
        getSettings: function(callback){
          if(UiService.current.settings){
            return callback(null, UiService.current);
          }

          EspnFflService.Get({
            league:$routeParams.league,
            season:$routeParams.season,
            noun:'settings'
          }, function(data){
            return callback(null, data);
          }, function(err){
            return callback({reason: 'Could not retrieve league settings information at this time. Please try back later.'});
          });
        },
        getMembers: function(callback){
          if(UiService.current.members){
            return callback(null, UiService.current);
          }

          EspnFflService.Get({
            league:$routeParams.league,
            season:$routeParams.season,
            noun:'members'
          }, function(data){
            return callback(null, data);
          }, function(err){
            return callback({reason: 'Could not retrieve league member information at this time. Please try back later.'});
          });
        }
      }, function(err, results){
        if(err){
          vm.errors.push(err);
          return;
        }

        vm.team = UiService.current.team = results.getRoster.team;
        vm.roster = UiService.current.roster = results.getRoster.roster;
        vm.settings = UiService.current.settings = results.getSettings.settings;
        vm.members = UiService.current.members = results.getMembers.members;
        vm.member = UiService.current.member = _(results.getRoster).pick('team', 'owner');

        $rootScope.$broadcast('memberLoaded', UiService.current.member);
        $rootScope.$broadcast('settingsLoaded', UiService.current.settings);
        $rootScope.$broadcast('membersLoaded', UiService.current.members);

        vm.populateEmptyRosterSlots(vm.roster.starters, vm.settings);
        vm.isWorking = false;
      });

      vm.populateEmptyRosterSlots = function(actualStarters, settings){
        var starterSlots = _(settings.roster).filter(function(rs){
          return ["QB","RB","RB/WR","TE","LB","DL","DB","K","P", "D/ST"]
            .indexOf(rs.key.toUpperCase()) > -1;
        });

        var starterSlotsFilled = _(actualStarters).countBy(function(str){
          return str.fantasyPosition;
        });

        var vacancies = _(starterSlots).map(function(ss){
          var slim = _(ss).pick(['key','name','maximumStarters']);
          slim.openings = ss.maximumStarters - (starterSlotsFilled[ss.key]||0);
          return slim;
        });

        _(vacancies).each(function(v){
          for (var i = 0; i < v.openings; i++) {
            actualStarters.push({
              fantasyPosition: v.key
            });
          }
        });
      };
    }]);
})();