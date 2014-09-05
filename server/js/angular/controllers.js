(function(){
  'use strict';
  angular
    .module('ngApp')
    .controller('Master_Controller', ['$routeParams', '$rootScope', '$location', 'UiService', function($routeParams, $rootScope, $location, UiService) {
      var vm = this;
      $rootScope.$on('settingsLoaded', function(event, data){
        vm.settings = UiService.current.settings;
        if(vm.settings){
          vm.settings.leagueName = _(vm.settings.basic).findWhere({key:'LeagueName'}).value;
        }

        vm.season = $routeParams.season;
      });
      $rootScope.$on('membersLoaded', function(event, data){
        vm.members = UiService.current.members;
      });
      $rootScope.$on('memberLoaded', function(event, data){
        vm.member = UiService.current.member;
      });
      $rootScope.$on('leaguesLoaded', function(event, data){
        vm.leagues = UiService.leagues;
      });
      $rootScope.$on('leagueLoaded', function(event, data){
        vm.league = UiService.current.league;
      });

      vm.onMemberSelected = function(member){
        vm.member = member;
        $location.path('/' + [$routeParams.league, $routeParams.season, member.team.id, 'roster'].join('/'));
      };

      vm.onLeagueSelected = function(league, year, team){
        team = team || 1;
        $location.path('/' + [league.id, year, team, 'roster'].join('/'));
      };

      vm.onSeasonSelected = function(season){
        $location.path('/' + [$routeParams.league, season, $routeParams.team, 'roster'].join('/'));
      };
    }])
    .controller('Roster_Controller', ['$location', '$routeParams', '$rootScope', '$scope', 'UiService', 'EspnFflLeagueService', 'EspnFflService', 'RosterService', function($location, $routeParams, $rootScope, $scope, UiService, EspnFflLeagueService, EspnFflService, RosterService) {
      var vm = this;
      vm.errors = [];
      vm.isWorking = true;

      $scope.$watch('errors', function(){
        if(vm.errors && vm.errors.length){
          vm.isWorking = false;
        }
      });

      var isSameLeague = UiService.current.leagueId === $routeParams.league;

      if(!isSameLeague){
        UiService.current.members = null;
        UiService.current.member = null;
        UiService.current.league = null;
        UiService.current.leagueId = null;
        UiService.current.settings = null;

        $rootScope.$broadcast('memberLoaded', UiService.current.member);
        $rootScope.$broadcast('settingsLoaded', UiService.current.settings);
        $rootScope.$broadcast('membersLoaded', UiService.current.members);
      }

      async.parallel({
        getLeague: function(callback){
          if(UiService.current.league && isSameLeague){
            return callback(null, UiService.current);
          }

          EspnFflLeagueService.Get({
            league:$routeParams.league
          }, function(data){
            return callback(null, data);
          }, function(err){
            return callback({reason: 'Could not retrieve league information at this time. Please try back later.'});
          });
        },
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
          if(UiService.current.settings && isSameLeague){
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
          if(UiService.current.members && isSameLeague){
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
        vm.roster = UiService.current.roster = vm.calculatePercentGameComplete(results.getRoster.roster);
        vm.league = UiService.current.league = results.getLeague.league;
        vm.leagueId = UiService.current.leagueId = results.getSettings.league.id;
        vm.settings = UiService.current.settings = results.getSettings.settings;
        vm.members = UiService.current.members = results.getMembers.members;
        vm.member = UiService.current.member = _(results.getRoster).pick('team', 'owner');
        vm.season = UiService.current.season = $routeParams.season;

        $rootScope.$broadcast('memberLoaded', UiService.current.member);
        $rootScope.$broadcast('settingsLoaded', UiService.current.settings);
        $rootScope.$broadcast('membersLoaded', UiService.current.members);
        $rootScope.$broadcast('leagueLoaded', UiService.current.league);

        vm.populateEmptyRosterSlots(vm.roster.starters, vm.settings);
        // console.log('Current:', UiService.current);
        setTimeout(function(){
          $('.player-details-collapse').on('show.bs.collapse', vm.onNeedToLoadPlayerNews);
          $('.player-details-modal').on('show.bs.modal', vm.onNeedToLoadPlayerNews);
        }, 500);
        vm.isWorking = false;
      });

      vm.onNeedToLoadPlayerNews = function(){
        var pid = parseInt($(this).data('playerId'), 0);
        var player = _(vm.roster.starters).find(function(p){
          return p.id === pid;
        });

        if(!player){
          player = _(vm.roster.bench).find(function(p){
            return p.id === pid;
          });
        }

        if(!player) return;

        EspnFflService.Get({
          league:$routeParams.league,
          season:$routeParams.season,
          noun: player.id
        }, function(data){
          player.news = data.newsItems;
        }, function(err){
          vm.errors.push({reason: 'Could not retrieve league member information at this time. Please try back later.'});
        });
      };

      vm.calculatePercentGameComplete = function(roster){
        if(!roster) return roster;

        roster.starters = _(roster.starters).map(function(p){
          if(p.matchup){
            p.matchup.percentComplete = vm.parsePercentComplete(p.matchup.status);
          }
          return p;
        });

        roster.bench = _(roster.bench).map(function(p){
          if(p.matchup){
            p.matchup.percentComplete = vm.parsePercentComplete(p.matchup.status);
          }
          return p;
        });

        console.log(roster);
        return roster;
      };

      vm.parsePercentComplete = function(status){
        if(!status) return 0;

        switch(status.split(' ').length){
          case 1:
            return 100;
          case 2:
            return 0;
          case 3:
            var splits = status.split(' ');
            var score = splits[0];
            var timeLeft = splits[1];
            var qtrStr = splits[2];

            var mins = parseInt(timeLeft.split(':')[0], 0);
            var secs = parseInt(timeLeft.split(':')[1], 0);

            var qtr = 4;
            switch(qtrStr[0]){
              case '1':
                qtr = 1;
                break;
              case '2':
                qtr = 2;
                break;
              case '3':
                qtr = 3;
                break;
              case '4':
                qtr = 4;
                break;
              default:
                qtr = 5;
                break;
            }

            var maxTics = (4*15*60);
            var nsecs = (mins*60) + secs;
            var qsecs = ((qtr-1)*15*60);
            var totalTics = nsecs + qsecs;

            return parseInt((100*totalTics/maxTics), 0);
          default:
            return 0;
        }
      };

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
          slim.openings = ss.maximumStarters === 99 ? 0 : ss.maximumStarters - (starterSlotsFilled[ss.key]||0);
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

      vm.getAdditionalPlayerClasses = function(player, isStarter){
        var classes = [];

        if(player.team === 'FA'){
          classes.push('free-agent');
          classes.push('on-bye-week');
        }
        if(!!isStarter && !player.matchup && $routeParams.season === (new Date()).getFullYear()){
          classes.push('on-bye-week');
        }

        if(classes.length){
          classes.push('alert-bad-player');
        }

        return classes.join(' ');
      };

      vm.getTimeAgo = function(date){
        return moment(date).calendar().split(' at ')[0];
      };
    }])
    .controller('Home_Controller', ['$rootScope', '$location', 'UiService', 'EspnFflLeagueService', function($rootScope, $location, UiService, EspnFflLeagueService) {
      var vm = this;
      vm.isWorking = true;

      async.parallel({
        getLeague1: function(callback){
          if(UiService.leagues.length){
            return callback(null, 1);
          }
          EspnFflLeagueService.Get({
            league:220779
          }, function(data){
            return callback(null, data);
          }, function(err){
            return callback({reason: 'Could not retrieve league information at this time. Please try back later.'});
          });
        },
        getLeague2: function(callback){
          if(UiService.leagues.length){
            return callback(null, 1);
          }
          EspnFflLeagueService.Get({
            league:27578
          }, function(data){
            return callback(null, data);
          }, function(err){
            return callback({reason: 'Could not retrieve league information at this time. Please try back later.'});
          });
        }
      }, function(err, results){
        if(err){
          vm.errors.push(err);
          return;
        }

        if(results.getLeague1 !== 1 && results.getLeague2 !== 1){
          UiService.leagues = [results.getLeague1.league, results.getLeague2.league];
        }

        vm.leagues = UiService.leagues;

        $rootScope.$broadcast('leaguesLoaded', UiService.leagues);

        vm.isWorking = false;
      });
    }]);
})();