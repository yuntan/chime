import speechText from './speechtext.mjs';

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

  // initialize local storage
  let { voiceName } = await browser.storage.local.get();
  if (voiceName === undefined)
    await browser.storage.local.set({
      voiceName: '',
      interval: 15,
      use12Hours: false,
      silentWhenIdle: false,
    });

  // set badge
  await browser.storage.local.set({ enabled: true });
  await browser.browserAction.setBadgeText({ text: 'ON' });
  await browser.browserAction.setBadgeBackgroundColor({ color: '#4984f4' })

  await setAlarm();
});

browser.alarms.onAlarm.addListener(async () => {
  console.log('onAlarm');

  const { enabled, silentWhenIdle } = await browser.storage.local.get();

  const state = await browser.idle.queryState(IDLE_DETECTION_INTERVAL);
  if (enabled && (!silentWhenIdle || state === 'active')) {
    chime();
  } else {
    console.log(`Alarm skipped (enabled: ${enabled}, state: ${state})`);
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

browser.browserAction.onClicked.addListener(async () => {
  let { enabled } = await browser.storage.local.get();

  if (enabled) {
    await browser.browserAction.setBadgeText({ text: 'OFF' });
    await browser.browserAction.setBadgeBackgroundColor({ color: '#333333' })
  } else {
    await browser.browserAction.setBadgeText({ text: 'ON' });
    await browser.browserAction.setBadgeBackgroundColor({ color: '#4984f4' })
  }

  enabled = !enabled;
  await browser.storage.local.set({ enabled });
});
