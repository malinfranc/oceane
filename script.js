const song = document.getElementById('song');
const song_ap = document.getElementById('song_ap');
const flames = document.querySelectorAll('.flame');

// Autoriser la musique après une interaction utilisateur
startBlowDetection()

// 👉 Démarrer la détection du souffle UNIQUEMENT à la fin de la musique

// 🔥 Détection du souffle avec le micro
function startBlowDetection() {
  song.play()
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('Micro non supporté');
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const microphone = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      function detectBlow() {
        analyser.getByteFrequencyData(dataArray);

        // Niveau sonore moyen
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // Seuil du souffle (ajustable)
        if (average > 100) {
          flames.forEach(flame => {
  flame.classList.add('off');
  const smoke = document.createElement('div');
  smoke.className = 'smoke';
  flame.parentElement.appendChild(smoke);
  setTimeout(() => smoke.remove(), 2000);
});
          stream.getTracks().forEach(track => track.stop());
          song_ap.play()
          return; // stop détection
        }

        requestAnimationFrame(detectBlow);
      }
      song.addEventListener('ended', () => {
      detectBlow();
      });;
    })
    .catch(err => {
      console.error('Accès au micro refusé', err);
    });
}
