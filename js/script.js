(function(){

  /* ---------------- Sparkles ---------------- */
  const sparkleLayer = document.getElementById('sparkles');
  function spawnSparkle(){
    const s = document.createElement('div');
    s.className = 'sparkle';
    const size = 3 + Math.random()*5;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = Math.random()*100 + 'vw';
    s.style.bottom = '-10px';
    s.style.setProperty('--drift', (Math.random()*60 - 30) + 'px');
    const duration = 8 + Math.random()*10;
    s.style.animationDuration = duration + 's';
    sparkleLayer.appendChild(s);
    setTimeout(()=> s.remove(), duration*1000 + 200);
  }
  setInterval(spawnSparkle, 350);
  for(let i=0;i<12;i++) setTimeout(spawnSparkle, i*150);

  /* ---------------- Screens ---------------- */
  const welcomeScreen = document.getElementById('welcomeScreen');
  const cardScreen = document.getElementById('cardScreen');
  const finalScreen = document.getElementById('finalScreen');

  function showScreen(el){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    el.classList.add('active');
  }

  document.getElementById('startBtn').addEventListener('click', ()=>{
    showScreen(cardScreen);
  });

  /* ---------------- Card data ---------------- */
  const cards = [
    {
      icon: '🦋',
      text: 'No olvides que este logro\nno define tu límite,\nsolo demuestra de lo que eres capaz.',
      signature: '✨ Estoy orgulloso(a) de ti.'
    },
    {
      icon: '🌸',
      text: 'Habrá días difíciles,\npero recuerda que ya superaste\nmuchos que parecían imposibles.\n\nSigue creyendo en ti.'
    },
    {
      icon: '🌈',
      text: 'Que nunca pierdas\nesa esencia que te hace única.\n\nEl mundo necesita personas\ncomo tú.'
    },
    {
      icon: '⭐',
      text: 'Que encuentres un futuro\nque te haga feliz,\npersonas que te valoren\ny sueños que siempre quieras perseguir.'
    },
    {
      icon: '💙',
      text: 'Gracias por ser mi amiga.\n\nEspero seguir viendo\ntodos los logros\nque aún te esperan.'
    }
  ];

  const stack = document.getElementById('stack');
  const progress = document.getElementById('progress');
  let current = 0;

  // build progress dots
  cards.forEach((_, i)=>{
    const d = document.createElement('div');
    d.className = 'dot';
    progress.appendChild(d);
  });

  function updateProgress(){
    [...progress.children].forEach((d, i)=>{
      d.classList.remove('done','now');
      if(i < current) d.classList.add('done');
      else if(i === current) d.classList.add('now');
    });
  }

  function renderStack(){
    stack.innerHTML = '';
    // render up to 3 cards ahead, topmost = current
    const visible = cards.slice(current, current + 3);
    visible.forEach((c, idx)=>{
      const el = document.createElement('div');
      el.className = 'card';
      el.style.zIndex = 10 - idx;
      el.style.transform = `scale(${1 - idx*0.04}) translateY(${idx*10}px)`;
      el.style.opacity = idx === 2 ? 0.6 : 1;
      el.innerHTML = `
        <div class="icon">${c.icon}</div>
        <p>${c.text}</p>
        ${c.signature ? `<div class="signature">${c.signature}</div>` : ''}
      `;
      if(idx === 0){
        attachDrag(el);
      }
      stack.appendChild(el);
    });
    updateProgress();

    if(current >= cards.length){
      setTimeout(()=>{
        showScreen(finalScreen);
        fireConfetti();
      }, 250);
    }
  }

  function attachDrag(el){
    let startX = 0, startY = 0, dx = 0, dragging = false;

    function pointerDown(x, y){
      dragging = true;
      startX = x; startY = y;
      el.style.transition = 'none';
    }
    function pointerMove(x, y){
      if(!dragging) return;
      dx = x - startX;
      const rot = dx / 18;
      el.style.transform = `translate(${dx}px, ${(y-startY)*0.15}px) rotate(${rot}deg)`;
      el.style.opacity = 1 - Math.min(Math.abs(dx)/400, 0.4);
    }
    function pointerUp(){
      if(!dragging) return;
      dragging = false;
      el.style.transition = 'transform 0.35s cubic-bezier(.2,.8,.2,1), opacity 0.35s ease';
      if(dx < -80){
        // swipe left -> next card
        el.style.transform = `translate(-600px, ${dx*0.1}px) rotate(-25deg)`;
        el.style.opacity = 0;
        setTimeout(()=>{ current++; renderStack(); }, 280);
      } else if(dx > 80){
        el.style.transform = `translate(600px, ${dx*0.1}px) rotate(25deg)`;
        el.style.opacity = 0;
        setTimeout(()=>{ current++; renderStack(); }, 280);
      } else {
        el.style.transform = '';
        el.style.opacity = 1;
      }
      dx = 0;
    }

    // mouse
    el.addEventListener('mousedown', e=>{ pointerDown(e.clientX, e.clientY); });
    window.addEventListener('mousemove', e=>{ if(dragging) pointerMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', pointerUp);

    // touch
    el.addEventListener('touchstart', e=>{
      const t = e.touches[0];
      pointerDown(t.clientX, t.clientY);
    }, {passive:true});
    el.addEventListener('touchmove', e=>{
      const t = e.touches[0];
      pointerMove(t.clientX, t.clientY);
    }, {passive:true});
    el.addEventListener('touchend', pointerUp);

    // click as fallback (tap to advance)
    el.addEventListener('click', ()=>{
      if(Math.abs(dx) < 5){
        el.style.transform = `translate(-600px, -10px) rotate(-25deg)`;
        el.style.opacity = 0;
        setTimeout(()=>{ current++; renderStack(); }, 280);
      }
    });
  }

  renderStack();

  /* ---------------- Final reveal ---------------- */
  const revealBtn = document.getElementById('revealBtn');
  const revealBox = document.getElementById('revealBox');

  revealBtn.addEventListener('click', function(){
    revealBox.style.display = 'block';
    this.style.display = 'none';
    fireConfetti(true);
  });

  /* ---------------- Volver al inicio ---------------- */
  document.getElementById('restartBtn').addEventListener('click', ()=>{
    current = 0;
    renderStack();
    revealBox.style.display = 'none';
    revealBtn.style.display = 'inline-block';
    showScreen(welcomeScreen);
  });

  /* ---------------- Confetti ---------------- */
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const confettiColors = ['#f7a8c4', '#c9a6ee', '#a6cef7', '#f4c95d', '#ffffff'];
  let particles = [];
  let confettiRunning = false;

  function fireConfetti(extra){
    const count = extra ? 90 : 140;
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*canvas.width,
        y: -20 - Math.random()*canvas.height*0.3,
        r: 4 + Math.random()*5,
        color: confettiColors[Math.floor(Math.random()*confettiColors.length)],
        vy: 2 + Math.random()*3,
        vx: -1.5 + Math.random()*3,
        rot: Math.random()*360,
        vrot: -6 + Math.random()*12,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    if(!confettiRunning){
      confettiRunning = true;
      requestAnimationFrame(animateConfetti);
    }
  }

  function animateConfetti(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    particles.forEach(p=>{
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      if(p.shape === 'rect'){
        ctx.fillRect(-p.r, -p.r*0.5, p.r*2, p.r);
      } else {
        ctx.beginPath();
        ctx.arc(0,0,p.r,0,Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    });
    particles = particles.filter(p => p.y < canvas.height + 30);
    if(particles.length > 0){
      requestAnimationFrame(animateConfetti);
    } else {
      confettiRunning = false;
    }
  }

  /* ---------------- Música suave (opcional, generada) ---------------- */
  let audioCtx = null;
  let musicNodes = null;
  let musicOn = false;
  const musicBtn = document.getElementById('musicToggle');

  function startMusic(){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.05;
    masterGain.connect(audioCtx.destination);

    const notes = [523.25, 587.33, 659.25, 784.00, 880.00]; // C D E G A (pentatonic, dulce)

    function playNote(){
      const freq = notes[Math.floor(Math.random()*notes.length)];
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(masterGain);
      const now = audioCtx.currentTime;
      gain.gain.linearRampToValueAtTime(0.6, now + 0.4);
      gain.gain.linearRampToValueAtTime(0, now + 2.2);
      osc.start(now);
      osc.stop(now + 2.4);
    }

    playNote();
    const interval = setInterval(()=>{ if(musicOn) playNote(); }, 1800);
    musicNodes = { masterGain, interval };
  }

  function stopMusic(){
    if(musicNodes){
      clearInterval(musicNodes.interval);
    }
    if(audioCtx){
      audioCtx.close();
      audioCtx = null;
    }
  }

  musicBtn.addEventListener('click', ()=>{
    musicOn = !musicOn;
    if(musicOn){
      startMusic();
      musicBtn.textContent = '🔊';
    } else {
      stopMusic();
      musicBtn.textContent = '🔇';
    }
  });

})();
