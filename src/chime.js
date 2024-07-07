chrome.runtime.onMessage.addListener(async (message) => {
  const { target, data } = message;

  if (target !== "offscreen-document") return;

  const { text, voiceName } = data;

  const synth = window.speechSynthesis;

  // HACK: for speechSynthesis.getVoices() returns empty array
  // see https://stackoverflow.com/a/52005323/2707413
  const voices = await new Promise((resolve) => {
    let count = 0;
    const id = setInterval(() => {
      const voices = synth.getVoices();
      if (voices.length === 0 && count < 10) { // max 1 sec to wait
        count++;
        return;
      }
      clearInterval(id);
      resolve(voices);
    }, 100);
  });
  console.log(voices);

  const voice =
    voiceName ? voices.find(voice => voice.name === voiceName) : null;
  console.log(voice);

  const utter = new SpeechSynthesisUtterance();
  utter.text = text;
  utter.voice = voice;
  utter.rate = .8;

  synth.speak(utter);
})
