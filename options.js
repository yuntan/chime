'use strict';

const intervals = [5, 15, 20, 30, 60]; // mins

const
  voiceSelect = document.getElementById('voice'),
  intervalInput = document.getElementById('interval'),
  intervalValue = document.getElementById('intervalValue'),
  use12Input = document.getElementById('use12Hours'),
  idleInput = document.getElementById('silentWhenIdle'),
  speakTestBtn = document.getElementById('speakTest');

const synth = window.speechSynthesis;

let voices;

function populateVoiceSelect() {
  voices = synth.getVoices();

  voiceSelect.innerHTML = '';

  const option = document.createElement('option');
  option.textContent = '<default>';
  option.value = '';
  voiceSelect.appendChild(option);

  for (const voice of  voices) {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  }
}

function intervalText(interval) {
  return interval < 60 ? `${interval} mins` : `1 hour`;
}

async function restoreOptions() {
  const { voiceName, interval, use12Hours, silentWhenIdle } =
    await browser.storage.local.get([
      'voiceName', 'interval', 'use12Hours', 'silentWhenIdle',
    ]);
  if (voiceName === '') {
    voiceSelect.selectedIndex = 0;
  } else {
    voiceSelect.selectedIndex =
      voices.map(voice => voice.name).indexOf(voiceName) + 1;
  }
  intervalInput.value = intervals.indexOf(interval);
  intervalValue.innerText = intervalText(interval);
  use12Input.checked = use12Hours;
  idleInput.checked = silentWhenIdle;
}

function updateOptions() {
  const
    voiceName = voiceSelect.selectedOptions[0].value,
    interval = intervals[intervalInput.value],
    use12Hours = use12Input.checked,
    silentWhenIdle = idleInput.checked;
  browser.storage.local.set({
    voiceName, interval, use12Hours, silentWhenIdle,
  });
  browser.runtime.sendMessage('', 'setAlarm');
}

function chime() {
  browser.runtime.sendMessage('', 'chime');
}

populateVoiceSelect();
restoreOptions();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.addEventListener('voiceschanged', () => {
    populateVoiceSelect();
    restoreOptions();
  });
}

voiceSelect.addEventListener('change', updateOptions);
intervalInput.addEventListener('input', () => {
  const interval = intervals[intervalInput.value];
  intervalValue.innerText = intervalText(interval);
  updateOptions();
});
idleInput.addEventListener('input', updateOptions);
use12Input.addEventListener('input', updateOptions);
speakTestBtn.addEventListener('click', chime);
