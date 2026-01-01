const song = document.getElementById('song');
const song_ap = document.getElementById('song_ap');
const flames = document.querySelectorAll('.flame');
const message = document.getElementById('message');

function showPopup() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 1000;
  overlay.style.backdropFilter = 'blur(5px)';
  overlay.style.overflow = 'hidden';

  const popup = document.createElement('div');
  popup.style.background = 'linear-gradient(145deg, #ffe6f0, #fff0f5)';
  popup.style.padding = '40px 50px';
  popup.style.borderRadius = '20px';
  popup.style.textAlign = 'center';
  popup.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
  popup.style.animation = 'popupAppear 0.5s ease-out';
  popup.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  popup.innerHTML = `
    <h2 style="color: #ff3366; font-size: 28px; margin-bottom: 15px;">✨ Surprise ! ✨</h2>
    <p style="color: #ff6699; font-size: 18px; margin-bottom: 25px;">
      Autorise ton micro mon amour ❤️
    </p>
    <button id="startBtn" style="
      background: #ff6699;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 25px;
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: none; /* caché jusqu'à autorisation micro */
    ">Commencer</button>
  `;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Animation bouton hover
  const btn = document.getElementById('startBtn');
  btn.addEventListener('mouseover', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 5px 15px rgba(255,102,153,0.5)';
  });
  btn.addEventListener('mouseout', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = 'none';
  });

  btn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    startBlowDetection(window.userMicrophoneStream);
  });

  // Ajouter les cœurs flottants
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerText = '❤️';
    heart.style.position = 'absolute';
    heart.style.left = Math.random() * 90 + '%';
    heart.style.animation = `floatHeart ${4 + Math.random()*3}s linear infinite`;
    heart.style.fontSize = (15 + Math.random() * 15) + 'px';
    overlay.appendChild(heart);
  }

  // Style pour animation
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes popupAppear {
      0% { transform: scale(0.5); opacity: 0; }
      60% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes floatHeart {
      0% { transform: translateY(0) scale(0.8); opacity: 1; }
      50% { transform: translateY(-100px) scale(1.2); opacity: 0.8; }
      100% { transform: translateY(-200px) scale(1); opacity: 0; }
    }
    .heart { color: #ff3366; user-select: none; pointer-events: none; }
  `;
  document.head.appendChild(style);

  // 1️⃣ Demander l'autorisation du micro
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Votre navigateur ne supporte pas le micro 😢');
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      // Stocker le stream pour utilisation future
      window.userMicrophoneStream = stream;

      // Afficher le bouton "Commencer" seulement après autorisation
      btn.style.display = 'inline-block';
      popup.querySelector('p').innerText = "Merci ! T'es prête Clique ❤️";
    })
    .catch(err => {
      console.error('Accès au micro refusé', err);
      popup.querySelector('p').innerText = 'Tu dois autoriser le micro mon BB 😢';
    });
}

// 🔔 Lancer le popup au chargement
window.addEventListener('load', showPopup);

// 2️⃣ Détection du souffle
function startBlowDetection(stream) {
  song.play();

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const microphone = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  microphone.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function detectBlow() {
    message.innerText = "Souffle fort pour éteindre les bougies ! ✨";
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const average = sum / dataArray.length;

    if (average > 70) { // seuil du souffle
      flames.forEach(flame => {
        flame.classList.add('off');
        const smoke = document.createElement('div');
        smoke.className = 'smoke';
        flame.parentElement.appendChild(smoke);
        setTimeout(() => smoke.remove(), 2000);
        message.innerText = `Ma douce Océane ❤️,
            Joyeux anniversaire mon trésor ! ✨
            En ce jour si spécial, je te souhaite tout le bonheur du monde, des sourires infinis, et des instants magiques rien que pour toi.
            Que cette nouvelle année de ta vie soit remplie d’amour, de rires, de rêves réalisés et de petites surprises qui te font fondre 😘.
            Tu es mon rayon de soleil, ma joie, mon cœur, et je suis tellement chanceux de t’avoir à mes côtés.
            Aujourd’hui, souffle tes bougies en pensant à tous tes souhaits… et sache que je serai là pour les rendre réalité avec toi ❤️🎂✨.
            Je t’aime plus que les mots ne peuvent le dire, mon amour. 💖💫`;

      });
      stream.getTracks().forEach(track => track.stop());
      song_ap.play();
      return;
    }
    requestAnimationFrame(detectBlow);
  }

  song.addEventListener('ended', detectBlow);
}

