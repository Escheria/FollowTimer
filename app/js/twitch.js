// having animation here cause this is where we get followers info
// refactor this elsewhere
const TweenMax = require('gsap');
const config = require('../config/settings.json');

//MOVE TO MAIN PROCESS
//http://electron.rocks/different-ways-to-communicate-between-main-and-renderer-process/

var twitch_api = 'https://api.twitch.tv/kraken';

//var twitchCliendId = 'rv7l0a7y1jxpaqsjxg85y8nh086xmth'; // Rico
var channel = config.twitch.channel;
var twitchCliendId = config.twitch.clientID;
var grabURL = config.developer? 'http://localhost:8080/lazyr1co.json': twitch_api+'/channels/'+channel+'/follows?client_id='+twitchCliendId;
var pollingInterval = config.developer? 3000: 15*1000;

//=================== ADD FOLLOWERS ====================
var mTimeout = null;

if(config.developer){
  getFollowersTest();  
} else {
  getFollowersCount();
}

/*
Tst function, 
*/
function getFollowersTest(channel){
  var request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:8080/lazyr1co.json', true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var data = JSON.parse(request.responseText);
      console.log(data);
      handleFollows(data);
    }

    mTimeout = setTimeout(getFollowersTest, pollingInterval);
  };

  request.send();
}


function getFollowersCount() {
  if (mTimeout) {
    clearTimeout(mTimeout);
  }
  
  var request = new XMLHttpRequest();
  request.open('GET', grabURL, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var data = JSON.parse(request.responseText);
      handleFollows(data); //not liking this hardcoded here

    } else {
      // We reached our target server, but it returned an error
      console.log(request);
    }

    mTimeout = setTimeout(getFollowersCount, pollingInterval);
  };

  request.onerror = function() {
    // There was a connection error of some sort
  };

  request.send();
}



var followers = null;
var hrsInput = document.getElementById('hours_input');
var minInput = document.getElementById('minutes_input');
var secInput = document.getElementById('seconds_input');
var defaultHour = config.defaults.hourIncrement;
var defaultMinutes = config.defaults.minutesIncrement;
var defaultSeconds = config.defaults.secondsIncrement;

function handleFollows(data){
  var followCount = parseInt(data['_total']);
  if(followers === null || followers === undefined) {
   followers = followCount;
   return;
  }
  if(followCount === followers){
    if(config.logging){
      console.log('we currently have '+followCount+' followers - no new followers.');      
    }
    return;
  }

  var newFollowers = followCount - followers;
  followers = followCount;

  if(config.logging){
    console.log('we got '+followCount+' followers');
  }


// refactor the folling part to a gui modification file or something
  var hourIncrement   = (parseInt(hrsInput.value, 10) || 0) * newFollowers;
  var minuteIncrement = (parseInt(minInput.value, 10) || 0) * newFollowers;
  var secondIncrement = (parseInt(secInput.value, 10) || 0) * newFollowers;

  if(hourIncrement === 0 && minuteIncrement === 0 && secondIncrement === 0){
    hourIncrement   = defaultHour    * newFollowers;
    minuteIncrement = defaultMinutes * newFollowers;
    secondIncrement = defaultSeconds * newFollowers;
  }

/*  var timerHrs = document.getElementById('hours');
  var timerMin = document.getElementById('minutes');
  var timerSec = document.getElementById('seconds');

  var newHours   = parseInt(timerHrs.textContent, 10) + hourIncrement;
  var newMinutes = parseInt(timerMin.textContent, 10) + minuteIncrement;
  var newSeconds = parseInt(timerSec.textContent, 10) + secondIncrement;

  newHours   = newHours   < 0? 0 : newHours;
  newMinutes = newMinutes < 0? 0 : newMinutes;
  newSeconds = newSeconds < 0? 0 : newSeconds;
*/
  addTimeToTimer(hourIncrement, minuteIncrement, secondIncrement);
  //addTimeToTimer(newHours, newMinutes, newSeconds); //from timer.js
  playChangeAnimation(hourIncrement, minuteIncrement, secondIncrement);
}

//copy here until i figure out the module blabla
function addTimeToTimer(hours, minutes, seconds){
  if(hours === 0 && minutes === 0 && seconds === 0){
    return;
  }

  if(hours === undefined || minutes === undefined || seconds === undefined){
    return;
  }
  var timerHrs = document.getElementById('hours');
  var timerMin = document.getElementById('minutes');
  var timerSec = document.getElementById('seconds');

  var currentHours = parseInt(timerHrs.textContent, 10);
  var currentMinutes = parseInt(timerMin.textContent, 10);
  var currentSeconds = parseInt(timerSec.textContent, 10);

  var newSeconds = currentSeconds + seconds;

  if(config.logging){
    console.log('Twitch: new Seconds: '+newSeconds);
  }

  if(newSeconds > 59 ){
    var multiple = Math.floor(newSeconds/60);
    newSeconds = newSeconds % 60;
    minutes = minutes + multiple;
  }

  var newMinutes = currentMinutes + minutes;
  
  if(config.logging){
    console.log('Twitch: new Minutes: '+newMinutes);
  }


  if(newMinutes > 59){
    var multiple = Math.floor(newMinutes/60);
    newMinutes = newMinutes % 60;
    hours = hours + multiple;
  }

  var newHours = currentHours+hours;

  if(config.logging){
    console.log('Twitch: new Hours: '+newHours);
  }

  writeNewTime(Math.max(newHours, 0), Math.max(newMinutes, 0), Math.max(newSeconds, 0));
}



function writeNewTime(hours, minutes, seconds){
  var timerHrs = document.getElementById('hours');
  var timerMin = document.getElementById('minutes');
  var timerSec = document.getElementById('seconds');

  if((seconds+'').length > 1){
    timerSec.textContent = seconds;
  } else {
    timerSec.textContent = '0' + seconds;
  }

  if((minutes+'').length > 1){
    timerMin.textContent = minutes;
  } else {
    timerMin.textContent = '0' + minutes;
  }

  if((hours+'').length > 1){
    timerHrs.textContent = hours;
  } else {
    timerHrs.textContent = '0' + hours;
  }
}

function playChangeAnimation(hours, minutes, seconds){
  var aniItems = document.getElementsByClassName('anim-digit');

  var aniHrs = document.getElementById('hours_animation');
  var aniMin = document.getElementById('minutes_animation');
  var aniSec = document.getElementById('seconds_animation');

  //is positive change?y/n
  //
  var toAnimate = [];
  if(seconds !== 0){
    var sign = seconds > 0? '+' : '';
    if((seconds+'').length > 1){
      aniSec.textContent = sign + seconds;
      aniSec.classList.remove('digit-single');
      aniSec.classList.add('digit-double');
    } else {
      aniSec.textContent = sign + seconds;
      aniSec.classList.remove('digit-single');
      aniSec.classList.add('digit-double');
    }
    toAnimate.push(aniItems[2]);
  }

  if(minutes !== 0) {
    var sign = minutes > 0? '+' : '';
    if((minutes+'').length > 1){
      aniMin.textContent = sign + minutes;
      aniMin.classList.remove('digit-single');
      aniMin.classList.add('digit-double');
    } else {
      aniMin.textContent = sign + minutes;
      aniMin.classList.remove('digit-double');
      aniMin.classList.add('digit-single');
    }
    toAnimate.push(aniItems[1]);
  }

  if(hours !== 0){
    var sign = hours > 0? '+' : '';
    if((hours+'').length > 1){
      aniHrs.textContent = sign + hours;
      aniHrs.classList.remove('digit-single');
      aniHrs.classList.add('digit-double');
    } else {
      aniHrs.textContent = sign + hours;
      aniHrs.classList.remove('digit-double');
      aniHrs.classList.add('digit-single');
    }
    toAnimate.push(aniItems[0]);
  }

  TweenMax.to(toAnimate, 0.3, {
    ease: 'Linear.easeIn',
    opacity: 1,
    onComplete: function() {
        TweenMax.to(toAnimate, 1, {
          top: "0px",
          ease: 'Linear.easeIn',
          opacity: 0,
          onComplete: function() {
            for (var i = 0; i < toAnimate.length; i++) {
              toAnimate[i].style.top = "14px";
              toAnimate[i].style.opacity = 0;
            }
          }
        });
    }
  });
}