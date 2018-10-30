'use strict';

chrome.runtime.onInstalled.addListener(function() {
  console.log('onInstalled');
});

function chime() {
  const lang = 'en-US';
  const text = genSpeechText(lang);

  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance();
  utter.text = text;
  utter.lang = lang;
  utter.rate = .8;
  synth.speak(utter);
}

function genSpeechText(lang) {
  const now = new Date();
  const hour = now.getHours(), min = now.getMinutes();

  // TODO: lang
  if (min === 0) return `${hour} o'clock`;
  else if (min === 15) return `quarter past ${hour}`;
  else if (min === 30) return `half past ${hour}`;
  else if (min === 45) return `quarter to ${hour + 1}`;
  else return `${hour}:${min < 10 ? `0${min}` : min}`;
}

function setAlarm() {
  const now = new Date();
  const min = now.getMinutes(), sec = now.getSeconds();
  const delaySec = (15 - (min % 15) - 1) * 60 + (60 - sec);
  // const delaySec = 60 - sec; // for debug
  console.log(`setAlarm: delay ${delaySec} sec`);
  const when = Date.now() + delaySec * 1000

  // https://developer.chrome.com/extensions/alarms
  chrome.alarms.create('chime', { when })
}

setAlarm();

chrome.alarms.onAlarm.addListener(alarm => {
  chime();
  setAlarm();
});
