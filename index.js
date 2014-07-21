var moment = require('moment');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var jenkinsDashboard = io.of('/dashboard');

var jenkinsJobs = {};

// Setup [key] Jenkins Builds
jenkinsJobs['softwr'] = {};
jenkinsJobs['softwr']['url'] = 'http://ci.softwr.io/';
jenkinsJobs['softwr']['eventName'] = 'jenkinsBuild';
jenkinsJobs['softwr']['views'] = [];
jenkinsJobs['softwr']['viewsEventName'] = 'jenkinsViews';
jenkinsJobs['softwr']['jobs'] = {};

/**
 * Get Jenkins "Views" Data
 * @param  {String} keyName the name of the key in the jenkinsJobs object
 */
getJenkinsViews = function(keyName) {
  jenkinsJobs[keyName]['views'] = [];
  request({url:jenkinsJobs[keyName]['url']+'api/json?tree=views[url,name]', 'json':true}, function (error, response, body) {
    if (!error && response.statusCode == 200 && typeof body.views === 'object') {
      body.views.forEach(function(view){
        var dashboardUrl = '/#/jenkins/'+keyName+'/view/'+view.name;
        view.dashboardUrl = dashboardUrl;
        jenkinsJobs[keyName]['views'].push(view);
      });
      jenkinsDashboard.emit(jenkinsJobs[keyName]['viewsEventName'], {views: jenkinsJobs[keyName]['views']});
    } else {
      console.log('jenkins view '+keyName+' error');
    }
  });
};

/**
 * [getJenkinsJobs description]
 * @param  {String} keyName  the name of the key in the jenkinsJobs object
 */
getJenkinsJobs = function(keyName) {
  var buildingColors = ['notbuilt_anime', 'red_anime', 'yellow_anime','blue_anime'];
  var jobObject = jenkinsJobs[keyName]['jobs'];
  var eventName = jenkinsJobs[keyName]['eventName'];

  jobObject['jobs'] = {};

  request({url: jenkinsJobs[keyName]['url'] + 'api/json?tree=views[name,url,jobs[name,color,url,lastBuild[number,url,executor[progress],result,timestamp]]]', 'json':true}, function (error, response, body) {
    if (!error && response.statusCode == 200 && typeof body.views === 'object') {
      body.views.forEach(function(view){
        jobObject[view.name] = {};
        jobObject[view.name]['active'] = [];
        jobObject[view.name]['failed'] = [];
        jobObject[view.name]['unstable'] = [];
        jobObject[view.name]['success'] = [];
        jobObject[view.name]['status'] = {};
        jobObject[view.name]['status']['active'] = 0;
        jobObject[view.name]['status']['failed'] = 0;
        jobObject[view.name]['status']['unstable'] = 0;
        jobObject[view.name]['status']['success'] = 0;

        view.jobs.forEach(function(job){
          if (buildingColors.indexOf(job.color) > -1){
            ++jobObject[view.name]['status']['active'];
            jobObject[view.name]['active'].push(job);
          }
          if (job.lastBuild){
            var finalTimestamp = moment(job.lastBuild.timestamp).format('MM/DD/YY h:mm a');
            job.lastBuild.timestamp = finalTimestamp;
            if (job.lastBuild.result === 'FAILURE') {
              ++jobObject[view.name]['status']['failed'];
              jobObject[view.name]['failed'].push(job);
            } else if (job.lastBuild.result === 'UNSTABLE') {
              ++jobObject[view.name]['status']['unstable'];
              jobObject[view.name]['unstable'].push(job);
            } else if (job.lastBuild.result === 'SUCCESS') {
              ++jobObject[view.name]['status']['success'];
              jobObject[view.name]['success'].push(job);
            }
          }
        });
      });
    } else {
      console.log('jenkins job '+keyName+' error');
    }
    jenkinsDashboard.emit(eventName, {jobs: jobObject});
  });
};

setInterval(function(){
  getJenkinsJobs('softwr');
}, 5000); // 5 seconds

jenkinsDashboard.on('connection', function(socket){
  getJenkinsViews('softwr');

  jenkinsDashboard.emit(jenkinsJobs['softwr']['eventName'], {jobs: jenkinsJobs['softwr']['jobs']});
});

app.use(express.static(process.cwd() + '/public'));
app.set('view engine', 'jade');

app.get('/', function(req, res){
  res.render('index');
});

app.get('/getConsoleOutput', function(req, res){
  var consoleUrl = req.query.lastBuildUrl + 'logText/progressiveHtml?start=0';

  request({url:consoleUrl}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log('getConsoleOutput error');
      res.send('getConsoleOutput error');
    }
  });
});

http.listen(3000, function(){
  getJenkinsJobs('softwr');
  console.log('listening on *:3000');
});
