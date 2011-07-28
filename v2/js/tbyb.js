var tempoContainer, sampleApp;
$(document).ready(function() {
  var appName = 'marshtimeline';
  sampleApp = new SampleApplication(appName);
  tempoContainer = Tempo.prepare('render_template_holder');
  initPage();
  $('#view_source').click(function() {
    viewSource();
    return false;
  });
  $('#run_source_button').click(function() {
    hideSource();
    return false;
  });
  $('#login_out_button').click(function() {
    sampleApp.toggleLog();
    return false;
  });
  $('#create_account_button').click(function() {
    sampleApp.createAccount();
    return false;
  });
  $("body").find("a.js_doPopUp").click(function() {
    window.open(this.href);
    return false;
  });
});

function SampleApplication(appName) {
  var theApp = this;
  this.userObject = {};
  this.user_authenticated = false;
  
  this.getAuth = function() {
    if (theApp.api && (theApp.api.doesLocalStorage && localStorage.authorization)) theApp.logIn();
  }
  
  this.processSmartKey = function(data) {
    var data = $.parseJSON(data);
    theApp.setAuth(data);
    //if (theApp.api) theApp.sendRequest(sampleRequest);
    if (theApp.api) theApp.makeRequest();
  }
  
  this.setAuth = function(authObject) {
    for (var key in authObject) {
      if (authObject.hasOwnProperty(key)) {
        theApp.userObject[key] = authObject[key];
        if (theApp.api && theApp.api.doesLocalStorage) localStorage[key] = authObject[key]; 
        if (key == 'smartKey') theApp.api.setSmartKey(authObject.smartKey);
      }
    }
  }
  
  this.toggleLog = function() {
    if (theApp.user_authenticated) {
      theApp.logOut();
    } else {
      theApp.logIn();
    }
  }
  
  this.logIn = function() {
    if (theApp.api) {
      var userInfo = [];
      if (theApp.api.doesLocalStorage && localStorage.authorization) {
        userInfo = $.base64Decode(localStorage.authorization).split(':');
      } else {
        userInfo = prompt('Please enter your Apigee username and password, separated by a space.').split(' ');
      }
      if (userInfo.length == 2) {
        theApp.setAuth({'username':userInfo[0],'password':userInfo[1],'authorization':$.base64Encode(userInfo[0]+':'+userInfo[1])});
        theApp.api.init(userInfo[0],userInfo[1]);
      } else {
        showResponseMessage('Please include a username and a password.');
      }
      if (theApp.api.doesLocalStorage && localStorage.smartkey) {
        theApp.setAuth({'smartKey':localStorage.smartkey});
      } else if (theApp.api.authorization) {
        theApp.api.request('get','/smartkeys/me.json?uid='+theApp.api.authorization,{},{callback:'sampleApp.processSmartKey'});
      }
      if (theApp.userObject.username && theApp.userObject.password) {
        $('#logout_button_label').html(theApp.userObject.username);
        $('#login_out_button').html('Log Out');
        $('#create_account_button').addClass('noshow');
        theApp.user_authenticated = true;
        //if (theApp.api.smartkey) theApp.sendRequest(sampleRequest);
        if (theApp.api.smartkey) theApp.makeRequest();
      }
    }
  }
  
  this.logOut = function() {
    var userCredentials = ['smartkey','username','password','authorization'];
    for (var i=0; i<userCredentials.length; i++) {
      var thisCredential = userCredentials[i];
      if (theApp.api) {
        if (theApp.api.doesLocalStorage) localStorage.removeItem(thisCredential);
        if (theApp.api[thisCredential]) theApp.api[thisCredential] = null;
        if (theApp.userObject[thisCredential]) theApp.userObject[thisCredential] = null;
      }
    }
    tempoContainer.clear();
    $('#logout_button_label').html('');
    $('#login_out_button').html('Log In');
    $('#create_account_button').removeClass('noshow');
    theApp.user_authenticated = false;
  }
  
  this.createAccount = function() {
    var userInfo = prompt('Please enter the desired username and password, separated by a space.').split(' ');
    if ((userInfo.length == 2) && (theApp.api)) {
      if (theApp.api.doesLocalStorage) localStorage.authorization = $.base64Encode(userInfo[0]+':'+userInfo[1]);
      theApp.api.request('post','/users.json',{'userName':userInfo[0],'fullName':userInfo[0],'password':userInfo[1]},{callback:'sampleApp.newAccount'});
    } else {
      showResponseMessage('Please include a username and a password.');
    }
  }
  
  this.newAccount = function(data) {
    var responsePayload = ((typeof theApp.api.returnObject.payload) === "string") ? $.parseJSON(theApp.api.returnObject.payload) : theApp.api.returnObject.payload;
    if (responsePayload.hasOwnProperty('smartKey')) {
      if (theApp.api.doesLocalStorage) localStorage.smartkey = responsePayload.smartKey;
      var currentHref = document.location.href;
      document.location.href = theApp.api.defaults.endpoint+'/providers/twitter/authorize?smartkey='+responsePayload.smartKey+'&app_callback='+currentHref;
    }
  }
  
  this.makeRequest = function() {
    theApp.sendRequest('get','/twitter/1/statuses/home_timeline.json');
  }
  
  this.sendRequest = function(verb,request,headers,settings) {
    var verb = verb || "get";
    var headers = headers || {};
    var settings = settings || {};
    $.extend(settings,{callback:'sampleApp.renderData'});
    if (theApp.api && request) {
      if (theApp.api.smartkey && (verb == 'get')) {
        var smartKeyDivider = (request.indexOf('?') != -1) ? '&' : '?';
        request += (smartKeyDivider + 'smartkey='+theApp.api.smartkey);
      }
      theApp.api.request(verb,request,headers,settings);
    }
  }
  
  this.renderData = function(data) {
    tempoContainer.render(getJsonFromData(this.api.returnObject.payload));
		$('#render_template_holder').find('article').removeClass('noshow');
	}
	
	this.init = function(appName) {
    theApp.api = $.apigee_api('https://'+appName+'-api.apigee.com/v1');
    theApp.appName = appName;
    theApp.getAuth();
  }
  if (appName) theApp.init(appName);
}

function showResponseMessage(theMessage) {
  var theMessage = theMessage.replace(/<\/?[^>]+>/gi, '');
  if (sampleApp.api.returnObject && (sampleApp.api.returnObject.xhr && sampleApp.api.returnObject.xhr.responseText)) {
    var responseMessage = parseAndReturn(sampleApp.api.returnObject.xhr.responseText);
    if (responseMessage.hasOwnProperty('message')) theMessage = responseMessage.message;
  }
  alert(theMessage);
  sampleApp.logOut();
}

function getJsonFromData(data) {
  return ((typeof data) === "string") ? $.parseJSON(data) : data;
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

function viewSource() {
  if (sampleApp && (sampleApp.user_authenticated == false)) sampleApp.logIn();
  if ($("#source_code").val().length == 0) $("#source_code").val($("#editable_script").text());
  setSourceHeight();
  $('#source_view').fadeIn('slow');
}

function setSourceHeight() {
  var windowHeight = $(window).height();
  var sourceHeight = ($("#toggle_view_holder").height() + $("#render_template_holder").height());
  var targetHeight = (windowHeight > sourceHeight) ? windowHeight : sourceHeight;
  $("#source_code").height(targetHeight - ($("#source_header").height() + 5));
}

function hideSource() {
  $('#source_view').fadeOut('slow', function() {
    runSource();
  });
}

function runSource() {
  var newCode = $("#source_code").val();
  try {
    eval(newCode);
    initPage();
    sampleApp.makeRequest();    
  } catch (e) {
    alert('Looks like that code didn\'t work.\n\nThe specific error information has been logged to your browser\'s console.\n\nPlease try again or refresh the page to start from scratch.');
    console.log(e);
  }
}