/*
TODO: 
- Disable Start button when no time set
*/

const config = require('../config/settings.json');

//on Document ready
initTimer();

var displayTimer = null;

function initTimer(){
  document.getElementById('hours').textContent = config.defaults.hoursStart || '00';
  document.getElementById('minutes').textContent = config.defaults.minutesStart || '00';
  document.getElementById('seconds').textContent = config.defaults.secondsStart || '00';

  var startStopButtonId = 'startstoptimer';
  var startStopButton = document.getElementById(startStopButtonId);
  startStopButton.addEventListener('click', function(){
    if(startStopButton.textContent === 'Start'){
      startTimer();
      updateButtonText(startStopButtonId, 'Stop');
    } else if (startStopButton.textContent === 'Stop'){
      stopTimer();
      updateButtonText(startStopButtonId,'Start');
    } else {
      stopTimer();
      updateButtonText(startStopButtonId, '???');
    }
  });

  var addTimeButtonId = 'addtime';
  var addTimeButton = document.getElementById(addTimeButtonId);
  addTimeButton.addEventListener('click', function(){
    var hourIncrement   = parseInt(document.getElementById('hours_input').value, 10)   || 0;
    var minuteIncrement = parseInt(document.getElementById('minutes_input').value, 10) || 0;
    var secondIncrement = parseInt(document.getElementById('seconds_input').value, 10) || 0;
    if(hourIncrement === 0 && minuteIncrement === 0 && secondIncrement === 0){
      return;
    }
    addTimeToTimer(hourIncrement, minuteIncrement, secondIncrement);
  });

  var resetTimerButtonId = 'resettime';
  var resetTimerButton = document.getElementById(resetTimerButtonId);
  resetTimerButton.addEventListener('click', function(){
    stopTimer();
    updateButtonText(startStopButtonId,'Start');
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
  });

}


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
    console.log('new Seconds: '+newSeconds);
  }

  if(newSeconds > 59 ){
    var multiple = Math.floor(newSeconds/60);
    newSeconds = newSeconds % 60;
    minutes = minutes + multiple;
  }

  var newMinutes = currentMinutes + minutes;
  
  if(config.logging){
    console.log('new Minutes: '+newMinutes);
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


function updateButtonText(btnId, val){
  var startStopButton = document.getElementById(btnId);
  startStopButton.value = val;
  startStopButton.textContent = val;
}

function startTimer() {
  displayTimer = setInterval(updateTimer, 1000);
}

function updateTimer(){
  var timerHrs = document.getElementById('hours');
  var timerMin = document.getElementById('minutes');
  var timerSec = document.getElementById('seconds');

  var hours = parseInt(timerHrs.textContent, 10);
  var minutes = parseInt(timerMin.textContent, 10);
  var seconds = parseInt(timerSec.textContent, 10);

//  console.log('Pre: Updaaaate! '+minutes+':'+seconds);
  if(hours === 0  && minutes === 0 && seconds === 0){
    return stopTimer();
  }

  if(seconds === 0 ){
    seconds = 59;
//    minutes = minutes - 1;
    if(minutes === 0 ){
      minutes = 59;
      hours = hours - 1;
    } else {
      minutes = minutes - 1;
    }
  } else {
    seconds = seconds - 1;
  }

  writeNewTime(hours, minutes, seconds);
//  console.log('Updaaaate! '+minutes+':'+seconds);
}

function stopTimer(){
  updateButtonText('startstoptimer','Start');
  clearInterval(displayTimer);
  displayTimer = null;
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
