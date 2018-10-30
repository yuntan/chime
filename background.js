'use strict';

chrome.runtime.onInstalled.addListener(function() {
  console.log('onInstalled');

  chrome.storage.local.set({ voiceName: '', interval: 15 });
});

function chime() {
  chrome.storage.local.get(['voiceName'], items => {
    const { voiceName } = items;
    const voice = voiceName ? voices.find(voice => voice.name === voiceName) : null;
    const text = genSpeechText(voice ? voice.lang : chrome.i18n.getUILanguage());

    const utter = new SpeechSynthesisUtterance();
    utter.text = text;
    utter.voice = voice;
    utter.rate = .8;
    synth.speak(utter);
  });
}

function genSpeechText(lang) {
  const now = new Date();
  const hour = now.getHours(), min = now.getMinutes();

  if (/^en/.test(lang)) { // English
    if (hour === 0 && min === 0) return 'midnight';
    else if (hour === 12 && min === 0) return 'noon';
    else if (min === 0) return `${hour} o'clock`;
    else if (min === 15) return `quarter past ${hour}`;
    else if (min === 30) return `half past ${hour}`;
    else if (min === 45) return `quarter to ${hour + 1}`;
    else return `${hour}:${min < 10 ? `0${min}` : min}`;
  } else if (/^ja/.test(lang)) { // Japanese
    if (hour === 12 && min === 0) return '正午';
    else if (min === 0) return `${hour}時`;
    else if (min === 30) return `${hour}時半`;
    else return `${hour}時${min}分`;
  } else {
    return `${hour}:${min < 10 ? `0${min}` : min}`;
  }
}

function setAlarm() {
  chrome.storage.local.get(['interval'], items => {
    const { interval } = items;
    const now = new Date();
    const min = now.getMinutes(), sec = now.getSeconds();
    const delaySec = (interval - (min % interval) - 1) * 60 + (60 - sec);
    // const delaySec = 60 - sec; // for debug
    console.log(`setAlarm: delay ${delaySec} sec`);
    const when = Date.now() + delaySec * 1000

    // https://developer.chrome.com/extensions/alarms
    chrome.alarms.create('chime', { when })
  });
}

const synth = window.speechSynthesis;
let voices = synth.getVoices();
if (synth.onvoiceschanged !== undefined) {
  synth.addEventListener('voiceschanged', () => {
    voices = synth.getVoices();
  });
}

setAlarm();

chrome.alarms.onAlarm.addListener(alarm => {
  chime();
  setAlarm();
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg === 'chime') chime();
});
