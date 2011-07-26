var userApps = {};
var lastApp, errorContainer;

$(document).ready(function() {
  setUpLinks();
  setUpInputs();
});

function ApigeeApp(appName) {
  var theApp = lastApp = this;
  this.create = function(appName) {
    lastApp = theApp;
    errorContainer = 'endpoint_errors';
    theApp.api.request('post','apps',{'appName':appName,'displayName':appName,'version':'0'},{'callback':'appCreated'});
  }
  this.configureApp = function(consumerKey,consumerSecret) {
    lastApp = theApp;
    errorContainer = 'key_secret_errors';
    theApp.api.request('post','apps/'+theApp.appName+'/providers/twitter/credentials',{'consumerKey':consumerKey,'consumerSecret':consumerSecret},{'callback':'appConfigured'});
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

function createApp(appName) {
  userApp = new ApigeeApp($.trim(appName.split(" ")[0]));
}

function configureApp(consumerKey,consumerSecret) {
  lastApp.configureApp($.trim(consumerKey.split(" ")[0]),$.trim(consumerSecret.split(" ")[0]));
}

function appCreated(data) {
  var data = parseAndReturn(data);
  $("#form_step_2").removeClass("disabled");
  if (data.hasOwnProperty("endpoint")) $("#callback_url").text(data.endpoint+'/authcallback/twitter');
  $("#set_endpoint").addClass("disabled");
  $("#set_endpoint").click(function() { return false; });
}

function appConfigured(data) {
  var data = parseAndReturn(data);
  $("#form_step_3").removeClass("disabled");
  $("#configure_app").addClass("disabled");
  $("#configure_app").click(function() { return false; });
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