var http = require('http');

module.exports = spawn;


function spawn(o) {
  var r = {};
  var endpoints = [
    'pods',
    'services',
    'replicationcontrollers'
  ]
  r.options  = cloneOptions(o);
  r.options.path = '/api/v1';
  if (typeof r.options.namespace !== 'undefined') {
    r.options.path = r.options.path + '/namespaces/' + r.options.namespace;
  }
  endpoints.forEach(function(i) {spawnEndpoint(r, i)});
  return r;
}

function spawnEndpoint(o, e) {
  var options = cloneOptions(o.options);
  options.path += '/' + e;
  o[e] = {};
  o[e].get = getEndpoint;
  o[e].options = options;
}

function getEndpoint(o,callBack) {
  if (typeof o === 'function' && typeof callBack === 'undefined') {
    callBack = o;
    o = {};
  }
  getData(this.options, function(err, data) {
    if (err) getError(this.options,err,callBack);
    else callBack(false,data);
  });
}

function getError(o, err, callBack) {
  callBack('ERROR: ' + JSON.stringify(o) + ' ' + err);
}

function getData(options, callBack) {
  var req = http.request(options, function (res) {
    if (res.statusCode !== 200) {
      callBack('Bad status: ' + res.statusCode); return;
    }
    var resp = '';
    res.on('data', function (chunk) {
      resp += chunk;
    });
    res.on('end', function() {
      try {
        var d = JSON.parse(resp);
      } catch(e) {
        callBack(e); return;
      }
      callBack(false,d); return
    }); 
  });
  req.on('error', function(e) {
    callBack(e);
  });
  req.end();
}

function cloneOptions(o) {
  var options = {};
  Object.keys(o).forEach(function(key) {
    options[key] = o[key];
  });
  return options;
}
