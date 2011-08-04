var tempoContainer, sampleApp, editor;
$(document).ready(function() {
  testConsole();
  var appName = 'marshtimeline';
  //var appName = 'sourcesample';
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
    if (theApp.api && theApp.api.doesLocalStorage) theApp.logIn();
  }
  
  this.processSmartKey = function(data) {
    var data = $.parseJSON(data);
    theApp.setAuth(data);
    theApp.logIn();
  }
  
  this.processKeyAndSecret = function(data) {
    var data = $.parseJSON(data);
    if (data.hasOwnProperty('oauthToken') && data.hasOwnProperty('oauthTokenSecret')) {
      theApp.setAuth(data);
      theApp.logIn();
    } else {
      showResponseMessage('Please re-try your login credentials or create a new account');
    }
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
    var demoUser = ["marsh","testing"];
    //var demoUser = ["demo","test"];
    if (theApp.api) {
      var goodUser = true;
      var userInfo = [];
      if (theApp.api.doesLocalStorage) {
        if (localStorage.authorization) {
          userInfo = $.base64Decode(localStorage.authorization).split(':');
        } else if (localStorage.didLogOut) {
          userInfo = prompt('Enter your username and password, separated by a space.').split(' ');
        } else {
          userInfo = demoUser;
        }
      } else {
        userInfo = prompt('Enter your username and password, separated by a space.\n\nIf you would like to test this application as a demo user, please use "'+demoUser[0]+'" and "'+demoUser[1]+'" as your credentials.').split(' ');
      }
      if (userInfo.length == 2) {
        var displayName = (userInfo[0] == demoUser[0]) ? 'You\'re signed in as a demo user' : userInfo[0];
        theApp.setAuth({'displayname':displayName,'username':userInfo[0],'password':userInfo[1],'authorization':$.base64Encode(userInfo[0]+':'+userInfo[1])});
        theApp.api.init(userInfo[0],userInfo[1]);
      } else {
        showResponseMessage('Please include a username and a password.');
        goodUser = false;
      }
      if ((theApp.api.doesLocalStorage && (localStorage.smartkey || localStorage.smartKey)) || (theApp.userObject.smartKey || theApp.userObject.smartkey)) {
        var theSmartKey;
        if (theApp.api.doesLocalStorage && (localStorage.smartkey || localStorage.smartKey)) {
          theSmartKey = (localStorage.smartkey) ? localStorage.smartkey : localStorage.smartKey;
        } else {
          theSmartKey = (theApp.userObject.smartkey) ? theApp.userObject.smartkey : theApp.userObject.smartKey;
        }
        theApp.setAuth({'smartKey':theSmartKey,'smartkey':theSmartKey});
      } else if (theApp.api.authorization) {
        theApp.api.request('get','/smartkeys/me.json?uid='+theApp.api.authorization,{},{callback:'sampleApp.processSmartKey'});
        goodUser = false;
      } else {
        showResponseMessage('Please re-try your login credentials or create a new account');
        goodUser = false;
      }
      if ((theApp.api.doesLocalStorage && (localStorage.oauthToken && localStorage.oauthTokenSecret)) || (theApp.userObject.oauthToken && theApp.userObject.oauthTokenSecret)) {
        var theToken, theSecret;
        if (theApp.api.doesLocalStorage && (localStorage.oauthToken && localStorage.oauthTokenSecret)) {
          theToken = localStorage.oauthToken;
          theSecret = localStorage.oauthTokenSecret;
        } else {
          theToken = theApp.userObject.oauthToken;
          theSecret = theApp.userObject.oauthTokenSecret;
        }
        theApp.setAuth({'oauthToken':theToken,'oauthTokenSecret':theSecret});
      } else if (theApp.userObject.smartKey) {
        theApp.api.request('get','/smartkeys/'+theApp.userObject.smartKey+'/providers/twitter.json',{},{callback:'sampleApp.processKeyAndSecret'});
        goodUser = false;
      } else {
        goodUser = false;
      }
      if (goodUser) {
        theApp.showLoggedIn();
      }
    }
  }
  
  this.showLoggedIn = function() {
    $('#logout_button_label').html(theApp.userObject.displayname);
    if (theApp.userObject.displayname != theApp.userObject.username) $('#logout_button_label').addClass('user_info');
    console.log(theApp.userObject);
    $('#login_out_button').html('Log Out');
    $('#create_account_button').addClass('noshow');
    theApp.user_authenticated = true;
    theApp.makeRequest();
  }
  
  this.logOut = function() {
    var userCredentials = [];
    for (var key in theApp.userObject) {
      if (theApp.userObject.hasOwnProperty(key)) {
        userCredentials.push(key);
      }
    }
    for (var i=0; i<userCredentials.length; i++) {
      var thisCredential = userCredentials[i];
      if (theApp.api) {
        if (theApp.api.doesLocalStorage) localStorage.removeItem(thisCredential);
        if (theApp.api[thisCredential]) delete theApp.api[thisCredential];
        if (theApp.userObject[thisCredential]) delete theApp.userObject[thisCredential];
      }
    }  
    if (theApp.api && theApp.api.doesLocalStorage) localStorage.didLogOut = true;
    tempoContainer.clear();
    $('#logout_button_label').html('');
    $('#logout_button_label').removeClass('user_info');
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
  if (sampleApp && (sampleApp.user_authenticated == false)) {
  	sampleApp.logIn();
  }	
  if ($("#source_code").val().length == 0) {
  	$("#source_code").html($("#editable_script").text());
  } 
  setSourceHeight();
  $('#source_view').fadeIn('slow');
   editor = ace.edit("source_code");
   editor.setTheme("ace/theme/twilight");
   var JavaScriptMode = require("ace/mode/javascript").Mode;
   editor.getSession().setMode(new JavaScriptMode());
   $(".ace_print_margin").css('background','none no-repeat');
}

function setSourceHeight() {
  var windowHeight = $(window).height();
  var sourceHeight = ($("#toggle_view_holder").height() + $("#render_template_holder").height());
  var targetHeight = (windowHeight > sourceHeight) ? windowHeight : sourceHeight;
  $("#source_code").height(targetHeight - ($("#source_header").height() + 69));
}

function hideSource() {
  $('#source_view').fadeOut('slow', function() {
    runSource();
  });
}

function runSource() {
  var newCode = editor.getSession().getValue();
  try {
    eval(newCode);
    initPage();
    sampleApp.makeRequest();    
  } catch (e) {
    alert('Looks like that code didn\'t work.\n\nThe specific error information has been logged to your browser\'s console.\n\nPlease try again or refresh the page to start from scratch.');
    console.log(e);
  }
}

function testConsole() {
  if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = {};
    console.log = function() {};
  }
}