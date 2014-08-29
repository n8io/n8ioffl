(function(){
  'use strict';
  angular
    .module('ngApp')
    .controller('Master_Controller', ['$routeParams', '$rootScope', '$location', function($routeParams, $rootScope, $location) {
      var vm = this;
      $rootScope.$on('settingsLoaded', function(event, data){
        vm.settings = data;
        vm.settings.leagueName = _(data.settings.basic).findWhere({key:'LeagueName'}).value;
      });
      $rootScope.$on('membersLoaded', function(event, data){
        vm.members = data;
      });
      $rootScope.$on('teamLoaded', function(event, data){
        vm.team = data;
      });

      vm.onMemberSelected = function(member){
        vm.team = member.team;
        $location.path('/' + [$routeParams.league, $routeParams.season, member.team.id, 'roster'].join('/'));
      };
    }])
    .controller('Roster_Controller', ['$location', '$routeParams', '$rootScope', '$scope', 'EspnFflService', 'RosterService', function($location, $routeParams, $rootScope, $scope, EspnFflService, RosterService) {
      var vm = this;
      vm.errors = [];
      vm.isWorking = true;

      $scope.$watch('errors', function(){
        if(vm.errors && vm.errors.length){
          vm.isWorking = false;
        }
      });

      async.parallel({
        getOwnerRoster: function(callback){
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
        getLeagueSettings: function(callback){
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
        getLeagueMembers: function(callback){
          if($scope.masterCtrl.members){
            return callback(null, $scope.masterCtrl.members);
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

        vm.data = results.getOwnerRoster;
        vm.settings = results.getLeagueSettings;
        vm.members = results.getLeagueMembers.members;
        $rootScope.$broadcast('teamLoaded', results.getOwnerRoster.team);
        $rootScope.$broadcast('settingsLoaded', results.getLeagueSettings);
        if(!$scope.masterCtrl.members){
          $rootScope.$broadcast('membersLoaded', results.getLeagueMembers.members);
        }
        vm.populateEmptyRosterSlots(vm.data.roster.starters, vm.settings);
        vm.isWorking = false;
      });

      vm.populateEmptyRosterSlots = function(actualStarters, leagueSettings){
        var starterSlots = _(leagueSettings.settings.roster).filter(function(rs){
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