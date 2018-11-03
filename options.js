'use strict';

const intervals = [5, 15, 30, 60]; // mins

const voiceSelect = document.getElementById('voice'),
  intervalInput = document.getElementById('interval'),
  intervalValue = document.getElementById('intervalValue'),
  speakTestBtn = document.getElementById('speakTest');

const synth = window.speechSynthesis;

let voices;

function populateVoiceSelect() {
  voices = synth.getVoices();

  for (let voice of voices) {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  }
}

function restoreOptions() {
  chrome.storage.local.get(['voiceName', 'interval'], items => {
    const {voiceName, interval} = items;
    if (voiceName === '') {
      voiceSelect.selectedIndex = 0;
    } else {
      voiceSelect.selectedIndex = voices.map(voice => voice.name).indexOf(voiceName) + 1;
    }
    intervalInput.value = intervals.indexOf(interval);
    intervalValue.innerText = `${interval} mins`;
  });
}

function updateOptions() {
  const voiceName = voiceSelect.selectedOptions[0].value,
    interval = intervals[intervalInput.value];
  chrome.storage.local.set({voiceName, interval});
}

function chime() {
  chrome.runtime.sendMessage('', 'chime');
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
  intervalValue.innerText = `${interval} mins`;
  updateOptions();
});
speakTestBtn.addEventListener('click', chime);
