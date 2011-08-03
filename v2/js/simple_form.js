var userApps = {};
var lastApp, errorContainer;

$(document).ready(function() {
  setUpLinks();
  setUpInputs();
  getAppStatus();
  $("#callback_url").click(function() {
    var refNode = $( this )[0];
		if ( $.browser.msie ) {
			var range = document.body.createTextRange();
			range.moveToElementText( refNode );
			range.select();
		} else if ( $.browser.mozilla || $.browser.opera ) {
			var selection = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents( refNode );
			selection.removeAllRanges();
			selection.addRange( range );
		} else if ( $.browser.safari ) {
			var selection = window.getSelection();
			selection.setBaseAndExtent( refNode, 0, refNode, 1 );
		}
  });
});

function ApigeeApp(appName,appExists) {
  var theApp = lastApp = this;
  this.appExists = appExists || false;
  this.hasCredentials = false;
  this.create = function(appName) {
    lastApp = theApp;
    errorContainer = 'endpoint_errors';
    if (theApp.appExists) {
      theApp.api.request('get','apps/'+theApp.appName+'.json?uid='+theApp.api.authorization+'&',{},{'callback':'appCreated'});
    } else {
      theApp.api.request('post','apps',{'appName':appName,'displayName':appName,'version':'0'},{'callback':'appCreated'});
    }
  }
  this.configureApp = function(consumerKey,consumerSecret) {
    lastApp = theApp;
    errorContainer = 'key_secret_errors';
    var verb = (theApp.hasOwnProperty("consumerKey") && theApp.hasOwnProperty("consumerSecret")) ? 'put' : 'post';
    theApp.api.request(verb,'apps/'+theApp.appName+'/providers/twitter/credentials',{'consumerKey':consumerKey,'consumerSecret':consumerSecret},{'callback':'appConfigured'});
  }
  this.checkCredentials = function() {
    lastApp = theApp;
    errorContainer = 'key_secret_errors';
    theApp.api.request('get','apps/'+theApp.appName+'/providers/twitter/credentials?uid='+theApp.api.authorization+'&',{},{'callback':'appConfigured'});
  }
  this.init = function(appName) {
    var endPoint = 'https://api.apigee.com/v1/';
    theApp.api = new $.apigee_api(endPoint);
    theApp.appName = appName;
    userApps[appName] = theApp;
    theApp.create(appName);
  }
  if (appName) theApp.init(appName);
}

function getAppStatus() {
  var tempApp = new $.apigee_api('https://api.apigee.com/v1/');
  tempApp.request('get','apps.json?uid='+tempApp.authorization+'&',{},{'callback':'setAppStatus'});
}

function setAppStatus(data) {
  var data = parseAndReturn(data);
  var appName = false;
  if (data.hasOwnProperty('app')) {
    for (var key in data.app) {
      if (data.app.hasOwnProperty(key)) {
        if (data.app[key].hasOwnProperty('appName')) appName = data.app[key].appName;
      }
    }
  }
  if (appName != false) createApp(appName,true);
}

function createApp(appName,appExists) {
  var appExists = appExists || false;
  userApp = new ApigeeApp($.trim(appName.split(" ")[0]),appExists);
}

function configureApp(consumerKey,consumerSecret) {
  lastApp.configureApp($.trim(consumerKey.split(" ")[0]),$.trim(consumerSecret.split(" ")[0]));
}

function appCreated(data) {
  var data = parseAndReturn(data);
  if (data.hasOwnProperty("appName")) {
    $("#consumer_key").val('');
    $("#consumer_secret").val('');
    $("#appname").val(data.appName);
    var thisApp = userApps[data.appName];
    thisApp.appExists = true;
    $("#form_step_1").addClass("disabled");
    $("#form_step_2").removeClass("disabled");
    var callBackUrl = (data.hasOwnProperty("endpoint")) ? data.endpoint : 'https://'+data.appName+'-api.apigee.com';
    $("#callback_url").text(callBackUrl+'/authcallback/twitter');
    for (var key in data) {
      if (data.hasOwnProperty(key)) thisApp[key] = data[key];
    }
    $("#set_endpoint").addClass("disabled");
    $("#set_endpoint").click(function() { return false; });
    thisApp.checkCredentials();
  }
}

function appConfigured(data) {
  var data = parseAndReturn(data);
  if (data.hasOwnProperty("appName")) {
    var thisApp = userApps[data.appName];
    if (data.hasOwnProperty("consumerKey") && data.hasOwnProperty("consumerSecret")) {
      $("#consumer_key").val(data.consumerKey);
      $("#consumer_secret").val(data.consumerSecret);
    }
    for (var key in data) {
      if (data.hasOwnProperty(key)) thisApp[key] = data[key];
    }
    $("#form_step_3").removeClass("disabled");
  }
}

function setUpLinks() {
  $("body").find("a.js_doPopUp").click(function() {
    window.open(this.href);
    return false;
  });
  $("#set_endpoint").click(function() {
    if ($("#appname").val()) {
      createApp($("#appname").val());
    } else {
      showFormError('Please include an application name.','endpoint_errors');
    }
    return false;
  });
  $("#configure_app").click(function() {
    if ($("#consumer_key").val() && $("#consumer_secret").val()) {
      configureApp($("#consumer_key").val(),$("#consumer_secret").val());
    } else {
      showFormError('Please include a consumer key and secret.','key_secret_errors');
    }
    return false;
  });
}

function setUpInputs() {
  $("body").find("input").focus(function() {
    if (this.className && (/js_errorContainer/.test(this.className))) {
      var containerId = getExtensionFromClass(this,'js_errorContainer_');
      $("#"+containerId).addClass('noshow');
    }
  });
}

function showFormError(errorMessage,errorContainer) {
  $("#"+errorContainer).html(errorMessage);
  $("#"+errorContainer).removeClass("noshow");
}

function showResponseMessage(theMessage) {
  var responseMessage = parseAndReturn(lastApp.api.returnObject.xhr.responseText);
  if (responseMessage.hasOwnProperty('message')) showFormError(responseMessage.message,errorContainer);
}

function parseAndReturn(theText) {
  var theJson = '';
  try {
    theJson = $.parseJSON(theText);
  } catch (e) {
    theJson = theText;
  }
  return theJson;
}

function getExtensionFromClass(theElement,theKey) {
	var theExtension = false;
	if (theElement.className) {
    var findExtension = function(thisClass) {
      if (thisClass.indexOf(theKey) == 0) {
        var tempName = thisClass.substring(theKey.length);
        if (tempName.length > 0) theExtension = tempName;
      }
    }
    forEach(theElement.className.split(' '),findExtension);
  }
	return theExtension;
}

function forEach(forEachArray, forEachAction) {
  for (var forEachKey=0; forEachKey < forEachArray.length; forEachKey++) {
    forEachAction(forEachArray[forEachKey]);
  }
}