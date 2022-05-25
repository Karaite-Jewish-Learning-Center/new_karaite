// export const ttSpeech = (text, lang, voice, pitch, rate) => {
//     let utterThis = new SpeechSynthesisUtterance(text)
//     let synth = window.speechSynthesis
//     let voices = synth.getVoices()
//     // should be moved to config
//     for (let i = 0; i < voices.length; i++) {
//         if (voices[i].name === voice) {
//             utterThis.voice = voices[i]
//         }
//     }
//     utterThis.pitch = pitch
//     utterThis.rate = rate
//     synth.speak(utterThis)
// }

