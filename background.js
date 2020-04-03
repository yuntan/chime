'use strict';

const IDLE_DETECTION_INTERVAL = 5 * 60; // secs

async function chime() {
  const { voiceName, use12Hours } =
    await browser.storage.local.get(['voiceName', 'use12Hours']);
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice =
    voiceName ? voices.find(voice => voice.name === voiceName) : null;
  const text = genSpeechText(
    voice ? voice.lang : browser.i18n.getUILanguage(),
    use12Hours
  );

  const utter = new SpeechSynthesisUtterance();
  utter.text = text;
  utter.voice = voice;
  utter.rate = .8;

  synth.speak(utter);
}

function genSpeechText(lang, use12Hours) {
  const now = new Date();
  const
    hours = now.getHours(),
    mins = now.getMinutes();

  if (/^en/.test(lang)) { // English
    const
      isMidnight = (hours === 0 && mins === 0),
      isNoon = (hours === 12 && mins === 0);
    const ampm = hours / 12 === 0 ? 'a.m.' : 'p.m.';
    const hoursName = hours =>
      (hours === 0 || hours === 24) ? 'midnight' :
      (hours === 12) ? 'noon' :
      use12Hours ? `${hours % 12} ${ampm}` :
      hours;

    if (isMidnight || isNoon) return hoursName(hours);
    else if (mins === 0) return use12Hours ?
      hoursName(hours) :
      `${hours} o'clock`;
    else if (mins === 15) return `quarter past ${hoursName(hours)}`;
    else if (mins === 30) return `half past ${hoursName(hours)}`;
    else if (mins === 45) return `quarter to ${hoursName(hours + 1)}`;
    else return `${use12Hours ? hours % 12 : hours}:` +
      `${mins < 10 ? `0${mins}` : mins} ${use12Hours ? ampm : ''}`;

  } else if (/^ja/.test(lang)) { // Japanese
    const ampm = hours / 12 === 0 ? '午前' : '午後';
    const hoursName =
      use12Hours ? `${ampm}${hours % 12}時` : `${hours}時`

    if (hours === 12 && mins === 0) return '正午';
    else if (mins === 0) return hoursName;
    else if (mins === 30) return `${hoursName}半`;
    else return `${hoursName}${mins}分`;

  } else {
    return `${hours}:${mins < 10 ? `0${mins}` : mins}`;
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

  const state = await browser.idle.queryState(IDLE_DETECTION_INTERVAL);
  if (!silentWhenIdle || state === 'active') {
    chime();
  } else {
    console.log(`Alarm skipped (state: ${state})`);
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

browser.idle.onStateChanged.addListener(newState => {
  console.log(`idle.onStateChanged: newState=${newState}`);

  if (newState === 'active') setAlarm();
});

setAlarm();
