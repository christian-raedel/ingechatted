(function(sandbox) {
  'use strict';

  sandbox.angular.module('client', [
    'ui.router',
    'client.services.Model'
  ]).config(Config);

  function Config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('app', {
        'abstract': true,
        templateUrl: 'src/app.tpl.html',
        controller: AppController
      });
  }

  function AppController($rootScope, $scope) {

  }
}(this));
