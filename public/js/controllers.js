var socket = io('/dashboard');
var dashboardApp = angular.module('dashboardApp', ['btford.socket-io','ngRoute','angles'])
.factory('mySocket', function (socketFactory) {
  var myIoSocket = io.connect('/dashboard');

  mySocket = socketFactory({
    ioSocket: myIoSocket
  });

  return mySocket;
});

// configure our routes
dashboardApp.config(function($routeProvider, $locationProvider) {
  $routeProvider
    // route for the home page
    .when('/', {
      templateUrl : 'partials/home.html',
      controller  : 'JenkinsViewsCtrl'
    })
    // route for the jenkins single view page
    .when('/jenkins/:key/view/:viewname', {
      templateUrl : 'partials/jenkins-single.html',
      controller  : 'JenkinsSingleViewCtrl'
    });
});

// Global Controller to handle Header
dashboardApp.controller('DashboardController', function ($scope, mySocket,jenkinsViewService,jenkinsJobService) {
  $scope.currentTime = moment().format('h:mm a');

  setInterval(function(){
    $scope.currentTime = moment().format('h:mm a');
  }, 1000);

  $scope.jenkinsJobs = jenkinsJobService['jobs'];
  $scope.jenkinsViews = jenkinsViewService['views'];

  $scope.jenkinsChartOptions = {
    segmentStrokeColor : "#1c1e22",
    animation : false
  };

  mySocket.on('jenkinsViews', function(data){
    $scope.$apply(function() {
      jenkinsViewService.UpdateViews('Softwr',data.views);
      $scope.jenkinsViews = jenkinsViewService['views'];
    });
  });

  mySocket.on('jenkinsBuild', function(data) {
    $scope.$apply(function() {
      jenkinsJobService.UpdateJobs('Softwr',data.jobs);
      $scope.jenkinsJobs = jenkinsJobService['jobs'];
    });
  });
});

// Homepage controller
dashboardApp.controller('JenkinsViewsCtrl', function ($scope) {});

// Single Jenkins View Controller
dashboardApp.controller('JenkinsSingleViewCtrl', function ($scope,$routeParams){
  $scope.jenkinsKey = $routeParams.key;
  $scope.jenkinsView = $routeParams.viewname;
});
