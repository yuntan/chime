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
    await chrome.storage.local.get(['voiceName', 'use12Hours']);

  // const synth = window.speechSynthesis;
  // const voices = synth.getVoices();
  // const voice =
  //   voiceName ? voices.find(voice => voice.name === voiceName) : null;
  const text = speechText(chrome.i18n.getUILanguage(), use12Hours);

  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });
  if (contexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: "src/chime.html",
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: "Speak the time.",
    });
  }

  await chrome.runtime.sendMessage(undefined, {
    target: "offscreen-document",
    action: "speak",
    data: { text, voiceName },
  });

  // const utter = new SpeechSynthesisUtterance();
  // utter.text = text;
  // utter.voice = voice;
  // utter.rate = .8;

  // synth.speak(utter);
}

async function setAlarm() {
  await chrome.alarms.clear();

  let { interval } = await chrome.storage.local.get(['interval']);
  if (!interval) interval = 15;
  const now = new Date();
  const min = now.getMinutes(), sec = now.getSeconds();
  const delaySec = (interval - (min % interval) - 1) * 60 + (60 - sec);
  // const delaySec = 60 - sec; // for debug
  console.log(`setAlarm: delay ${delaySec} sec`);
  const when = Date.now() + delaySec * 1000

  // https://developer.chrome.com/extensions/alarms
  chrome.alarms.create({ when })
}

async function setBadge(enabled) {
  const text = enabled ? 'ON' : 'OFF';
  const color = enabled ? '#4984f4' : '#333333';

  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log('runtime.onInstalled');

  // initialize local storage
  let config = await chrome.storage.local.get();
  config = Object.assign(DEFAULT_CONFIG, config);
  await chrome.storage.local.set(config);
  
  await setBadge(config.enabled);
  await setAlarm();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('runtime.onStartup');

  let { enabled } = await chrome.storage.local.get();
  await setBadge(enabled);

  await setAlarm();
});

chrome.runtime.onMessage.addListener(async msg => {
  console.log(`runtime.onMessage: msg=${msg}`);

  switch (msg) {
    case 'setAlarm':
      await setAlarm();
      break;
    case 'chime':
      await chime();
      break;
    default:
      // throw new Error("assert not reached");
      break;
  }
});

chrome.alarms.onAlarm.addListener(async () => {
  console.log('alarms.onAlarm');

  const { enabled, silentWhenIdle } = await chrome.storage.local.get();

  const state = await chrome.idle.queryState(IDLE_DETECTION_INTERVAL);
  if (enabled && (!silentWhenIdle || state === 'active')) {
    chime();
  } else {
    console.log(`Alarm skipped (enabled: ${enabled}, state: ${state})`);
  }

  await setAlarm();
});

chrome.idle.onStateChanged.addListener(async newState => {
  console.log(`idle.onStateChanged: newState=${newState}`);

  if (newState === 'active') await setAlarm();
});

chrome.action.onClicked.addListener(async () => {
  console.log('action.onClicked');

  let { enabled } = await chrome.storage.local.get();
  enabled = !enabled;
  await chrome.storage.local.set({ enabled });

  await setBadge(enabled);
});
