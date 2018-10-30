'use strict';

chrome.runtime.onInstalled.addListener(function() {
  console.log('onInstalled');
});

function chime() {
  const now = new Date();
  const hour = now.getHours(), min = now.getMinutes();
  let text = '';
  if (min === 0) text = `${hour} o'clock`;
  else if (min === 15) text = `quarter past ${hour}`;
  else if (min === 30) text = `half past ${hour}`;
  else if (min === 45) text = `quarter to ${hour + 1}`;
  else text = `${hour}:${min < 10 ? `0${min}` : min}`;

  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance();
  utter.text = text;
  utter.lang = 'en-US';
  utter.rate = .8;
  synth.speak(utter);

  setTimer();
}

function setTimer() {
  const now = new Date();
  const min = now.getMinutes(), sec = now.getSeconds();
  const delaySec = (15 - (min % 15) - 1) * 60 + (60 - sec);
  // const delaySec = 60 - sec; # for debug
  console.log(`setTimeout ${delaySec}sec`);
  setTimeout(chime, delaySec * 1000);
}

setTimer();
