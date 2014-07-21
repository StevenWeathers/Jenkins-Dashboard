angular.module('Dashboard.directives', []).
directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}])
// todo - leverage directives for repeatable sections
.directive('jenkinsBuild', function() {
  return {
    templateUrl: 'partials/jenkins-build.html'
  };
});
