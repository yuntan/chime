'use strict';

const IDLE_DETECTION_INTERVAL = 5 * 60; // secs

async function chime() {
  const { voiceName } = await browser.storage.local.get(['voiceName']);
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice =
    voiceName ? voices.find(voice => voice.name === voiceName) : null;
  const text = genSpeechText(voice ? voice.lang : browser.i18n.getUILanguage());

  const utter = new SpeechSynthesisUtterance();
  utter.text = text;
  utter.voice = voice;
  utter.rate = .8;

  synth.speak(utter);
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

async function setAlarm() {
  browser.alarms.clear();

  let { interval } = await browser.storage.local.get(['interval']);
  if (!interval) interval = 15;
  const now = new Date();
  const min = now.getMinutes(), sec = now.getSeconds();
  const delaySec = (interval - (min % interval) - 1) * 60 + (60 - sec);
  // const delaySec = 60 - sec; // for debug
  console.log(`setAlarm: delay ${delaySec} sec`);
  const when = Date.now() + delaySec * 1000

  // https://developer.chrome.com/extensions/alarms
  browser.alarms.create({ when })
}

browser.runtime.onInstalled.addListener(async () => {
  console.log('onInstalled');

  let { voiceName } = await browser.storage.local.get(['voiceName']);
  if (voiceName !== undefined) return;
  browser.storage.local.set({
    voiceName: '', interval: 15, silentWhenIdle: false
  });
});

browser.alarms.onAlarm.addListener(async () => {
  console.log('onAlarm');

  const { silentWhenIdle } =
    await browser.storage.local.get(['silentWhenIdle']);

  if (silentWhenIdle) {
    chime();
    return;
  }

  const state = await browser.idle.queryState(IDLE_DETECTION_INTERVAL);
  switch (state) {
    case 'case':
      chime();
      break;
    case 'idle':
    case 'locked':
      console.log(`Alarm skipped (state: ${state})`);
      break;
    default:
      throw new Error("assert not reached");
  }

  setAlarm();
});

browser.runtime.onMessage.addListener(msg => {
  console.log(`onMessage('${msg}')`);

  switch (msg) {
    case 'setAlarm':
      setAlarm();
      break;
    case 'chime':
      chime();
      break;
    default:
      throw new Error("assert not reached");
  }
});

setAlarm();
