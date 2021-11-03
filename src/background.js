import speechText from './speechtext.mjs';

const DEFAULT_CONFIG = {
  enabled: true,
  voiceName: '',
  interval: 15,
  use12Hours: false,
  silentWhenIdle: false,
};

const IDLE_DETECTION_INTERVAL = 5 * 60; // secs

async function chime() {
  const { voiceName, use12Hours } =
    await browser.storage.local.get(['voiceName', 'use12Hours']);
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice =
    voiceName ? voices.find(voice => voice.name === voiceName) : null;
  const text = speechText(
    voice ? voice.lang : browser.i18n.getUILanguage(),
    use12Hours
  );

  const utter = new SpeechSynthesisUtterance();
  utter.text = text;
  utter.voice = voice;
  utter.rate = .8;

  synth.speak(utter);
}

async function setAlarm() {
  await browser.alarms.clear();

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

async function setBadge(enabled) {
  const text = enabled ? 'ON' : 'OFF';
  const color = enabled ? '#4984f4' : '#333333';

  await browser.browserAction.setBadgeText({ text });
  await browser.browserAction.setBadgeBackgroundColor({ color });
}

browser.runtime.onInstalled.addListener(async () => {
  console.log('runtime.onInstalled');

  // initialize local storage
  let config = await browser.storage.local.get();
  config = Object.assign(DEFAULT_CONFIG, config);
  await browser.storage.local.set(config);
  
  await setBadge(config.enabled);
  await setAlarm();
});

browser.runtime.onStartup.addListener(async () => {
  console.log('runtime.onStartup');

  let { enabled } = await browser.storage.local.get();
  await setBadge(enabled);

  await setAlarm();
});

browser.runtime.onMessage.addListener(async msg => {
  console.log(`runtime.onMessage: msg=${msg}`);

  switch (msg) {
    case 'setAlarm':
      await setAlarm();
      break;
    case 'chime':
      await chime();
      break;
    default:
      throw new Error("assert not reached");
  }
});

browser.alarms.onAlarm.addListener(async () => {
  console.log('alarms.onAlarm');

  const { enabled, silentWhenIdle } = await browser.storage.local.get();

  const state = await browser.idle.queryState(IDLE_DETECTION_INTERVAL);
  if (enabled && (!silentWhenIdle || state === 'active')) {
    chime();
  } else {
    console.log(`Alarm skipped (enabled: ${enabled}, state: ${state})`);
  }

  await setAlarm();
});

browser.idle.onStateChanged.addListener(async newState => {
  console.log(`idle.onStateChanged: newState=${newState}`);

  if (newState === 'active') await setAlarm();
});

browser.browserAction.onClicked.addListener(async () => {
  console.log('browserAction.onClicked');

  let { enabled } = await browser.storage.local.get();
  enabled = !enabled;
  await browser.storage.local.set({ enabled });

  await setBadge(enabled);
});
