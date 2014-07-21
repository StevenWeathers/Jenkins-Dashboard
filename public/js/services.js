dashboardApp.factory('jenkinsViewService', function() {
    var jenkinsViewService = {};
    jenkinsViewService['views'] = {};

    jenkinsViewService.UpdateViews = function (key, value) {
       jenkinsViewService['views'][key] = value;
    };

    return jenkinsViewService;
});

dashboardApp.factory('jenkinsJobService', function() {
    var jenkinsJobService = {};
    jenkinsJobService['jobs'] = {};

    jenkinsJobService.UpdateJobs = function (key, value) {
       jenkinsJobService['jobs'][key] = value;
    };

    return jenkinsJobService;
});
