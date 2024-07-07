'use strict';

window.addEventListener('load', async () => {
  const intervals = [5, 15, 20, 30, 60]; // mins

  const voiceSelect = document.getElementById('voice'),
    intervalInput = document.getElementById('interval'),
    intervalValue = document.getElementById('intervalValue'),
    use12Input = document.getElementById('use12Hours'),
    idleInput = document.getElementById('silentWhenIdle'),
    speakTestBtn = document.getElementById('speakTest');

  // HACK: for speechSynthesis.getVoices() returns empty array
  // see https://stackoverflow.com/a/52005323/2707413
  const voices = await new Promise(resolve => {
    let count = 0;
    const id = setInterval(() => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0 && count < 10) { // max 1 sec to wait
        count++;
        return;
      }
      clearInterval(id);
      resolve(voices);
    }, 100);
  });

  function populateVoiceSelect() {
    voiceSelect.innerHTML = '';

    const option = document.createElement('option');
    option.textContent = '<default>';
    option.value = '';
    voiceSelect.appendChild(option);

    for (const voice of voices) {
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
      await chrome.storage.local.get();
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

  async function updateOptions() {
    const voiceName = voiceSelect.selectedOptions[0].value,
      interval = intervals[intervalInput.value],
      use12Hours = use12Input.checked,
      silentWhenIdle = idleInput.checked;
    await chrome.storage.local.set({
      voiceName, interval, use12Hours, silentWhenIdle,
    });
    await chrome.runtime.sendMessage('', 'setAlarm');
  }

  function chime() {
    chrome.runtime.sendMessage('', 'chime');
  }

  populateVoiceSelect();
  await restoreOptions();

  voiceSelect.addEventListener('change', updateOptions);
  intervalInput.addEventListener('input', () => {
    const interval = intervals[intervalInput.value];
    intervalValue.innerText = intervalText(interval);
    updateOptions();
  });
  idleInput.addEventListener('input', updateOptions);
  use12Input.addEventListener('input', updateOptions);
  speakTestBtn.addEventListener('click', chime);
});
