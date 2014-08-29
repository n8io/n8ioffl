(function(){
  'use strict';
  angular
    .module('ngApp')
    .filter('isQB', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'QB'.toUpperCase();
        });
      };
    }])
    .filter('isRB', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'RB'.toUpperCase();
        });
      };
    }])
    .filter('isFlex', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'RB/WR'.toUpperCase();
        });
      };
    }])
    .filter('isWR', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'WR'.toUpperCase();
        });
      };
    }])
    .filter('isTE', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'TE'.toUpperCase();
        });
      };
    }])
    .filter('isLB', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'LB'.toUpperCase();
        });
      };
    }])
    .filter('isDL', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'DL'.toUpperCase();
        });
      };
    }])
    .filter('isDB', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'DB'.toUpperCase();
        });
      };
    }])
    .filter('isK', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'K'.toUpperCase();
        });
      };
    }])
    .filter('isP', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'P'.toUpperCase();
        });
      };
    }])
    .filter('isDST', [function() {
      return function(players){
        return _(players).filter(function(player){
          return player && player.fantasyPosition && player.fantasyPosition.toUpperCase() === 'D/ST'.toUpperCase();
        });
      };
    }]);
})();