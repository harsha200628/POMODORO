window.Game = {
  canvas: null,
  ctx: null,
  container: null,
  animationFrameId: null,
  state: null,
  showShop: false,
  isPlaying: false,

  SHOP_ITEMS: [
    { id: 'rapidFire', name: 'Rapid Fire', cost: 150, desc: 'Overclock weapon cooling systems for faster fire rates.' },
    { id: 'thrusters', name: 'Thruster Overdrive', cost: 300, desc: 'Enhance ship maneuverability and strafing speed by 40%.' },
    { id: 'spreadFire', name: 'Spread Fire', cost: 600, desc: 'Mount auxiliary cannons to blast 3 projectiles simultaneously.' },
    { id: 'timeDilation', name: 'Time Dilation', cost: 1000, desc: 'Hack the simulation core to permanently slow down enemy falling velocities by 25%.' },
    { id: 'plasma', name: 'Plasma Piercer', cost: 1500, desc: 'Projectiles tear through multiple incoming targets without being destroyed.' },
    { id: 'shield', name: 'Matrix Shield', cost: 2500, desc: 'Bolster structural integrity to permanently gain +2 Max Lives.' }
  ],

  init() {
    this.container = document.getElementById('canvas-container');
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;

    this.bindEvents();
    this.resetState();
    this.renderShop();
    
    window.addEventListener('store-updated', () => {
      this.renderShop();
    });

    this.loop();
  },

  resetState() {
    const maxLives = Store.data.upgrades.shield ? 5 : 3;
    this.state = {
      player: { x: this.canvas.width / 2 - 15, width: 30, height: 30, speed: 8, cooldown: 0, tilt: 0, invulnerable: 0 },
      lives: maxLives,
      projectiles: [], enemies: [], particles: [],
      stars: Array.from({length: 200}).map(() => ({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5, speed: Math.random() * 4 + 0.5, alpha: Math.random() * 0.8 + 0.2
      })),
      score: 0, gameOver: false, keys: {}, screenShake: 0, frameCount: 0,
      lastLevel: Math.max(1, Math.floor(Store.data.xp / 200) + 1)
    };
  },

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      if (['Space', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code) && !this.showShop) {
         e.preventDefault();
      }
      this.state.keys[e.code] = true;
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      this.state.keys[e.code] = false;
    });

    const toggleBtn = document.getElementById('btn-shop-toggle');
    const overlay = document.getElementById('shop-overlay');

    if (toggleBtn && overlay) {
      toggleBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        this.showShop = !this.showShop;
        overlay.style.display = this.showShop ? 'flex' : 'none';
        toggleBtn.textContent = this.showShop ? 'Resume Combat' : 'Open Store';
      });
    }

    const launchBtn = document.getElementById('btn-launch-game');
    const startScreen = document.getElementById('start-screen');
    if (launchBtn && startScreen) {
      launchBtn.addEventListener('click', () => {
        startScreen.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => {
          startScreen.style.display = 'none';
          this.isPlaying = true;
          // Trigger orientation/size check on mobile start
          this.canvas.width = this.container.clientWidth;
          this.canvas.height = this.container.clientHeight;
        }, 500);
      });
    }

    // --- TOUCH EVENTS FOR MOBILE ---
    let lastTouchX = null;
    this.canvas.addEventListener('touchstart', (e) => {
      if (!this.isPlaying) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      lastTouchX = touch.clientX - rect.left;
      this.state.isTouching = true;
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.isPlaying) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const currentX = touch.clientX - rect.left;
      
      // Calculate movement delta for ship
      if (lastTouchX !== null) {
        const delta = currentX - lastTouchX;
        this.state.player.x = Math.max(0, Math.min(this.canvas.width - this.state.player.width, this.state.player.x + delta));
        
        // Dynamic tilt based on swipe speed
        this.state.player.tilt = Math.max(-1, Math.min(1, delta * 0.1));
      }
      lastTouchX = currentX;
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      lastTouchX = null;
      this.state.isTouching = false;
    }, { passive: false });
  },

  buyUpgrade(item) {
    if (Store.data.xp >= item.cost && !Store.data.upgrades[item.id]) {
      Store.set('focus_xp', Store.data.xp - item.cost);
      Store.set('focus_game_upgrades', { ...Store.data.upgrades, [item.id]: true });
    }
  },

  renderShop() {
    const elXp = document.getElementById('shop-xp');
    if (elXp) elXp.textContent = Store.data.xp;

    const container = document.getElementById('shop-items-container');
    if (!container) return;

    container.innerHTML = this.SHOP_ITEMS.map(item => {
      const isOwned = Store.data.upgrades[item.id];
      const canAfford = Store.data.xp >= item.cost;
      
      let btnHTML = isOwned 
        ? `<span style="font-size: 0.85rem; color: var(--accent); font-weight: 700; text-shadow: 0 0 10px rgba(52,211,153,0.5);">ONLINE</span>`
        : `<button onclick="Game.buyUpgrade({id: '${item.id}', cost: ${item.cost}})" ${!canAfford ? 'disabled' : ''} class="btn ${canAfford ? 'btn-primary' : 'btn-glass'}" style="padding: 0.4rem 1.25rem; border-radius: var(--radius-full); font-size: 0.85rem;">${item.cost} XP</button>`;

      return `
        <div style="padding: 1.5rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-md); border: 1px solid ${isOwned ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}; box-shadow: ${isOwned ? 'inset 0 0 20px rgba(129, 140, 248, 0.1)' : 'none'}; transition: all 0.3s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <strong style="font-size: 1.1rem; color: var(--text-main); letter-spacing: 0.5px;">${item.name}</strong>
            ${btnHTML}
          </div>
          <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin: 0;">${item.desc}</p>
        </div>
      `;
    }).join('');
  },

  updateIdle() {
    if (this.canvas.width !== this.container.clientWidth || this.canvas.height !== this.container.clientHeight) {
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;
    }
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    
    this.state.stars.forEach(star => {
      star.y += star.speed * 0.5; // cinematic slow pan
      if (star.y > ch) { star.y = 0; star.x = Math.random() * cw; }
    });
  },

  update() {
    if (this.canvas.width !== this.container.clientWidth || this.canvas.height !== this.container.clientHeight) {
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;
      if (this.state.player.x > this.canvas.width) this.state.player.x = this.canvas.width / 2;
    }

    const { state } = this;
    state.frameCount++;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const py = ch - 80;
    const u = Store.data.upgrades;
    const playerSpeed = u.thrusters ? 12 : 8;
    const enemyMult = u.timeDilation ? 0.7 : 1.0;

    if (state.screenShake > 0) state.screenShake--;
    if (state.player.invulnerable > 0) state.player.invulnerable--;
    
    state.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > ch) { star.y = 0; star.x = Math.random() * cw; }
    });

    if (!state.gameOver && !this.showShop) {
      if ((state.keys['ArrowLeft'] || state.keys['KeyA']) && state.player.x > 0) {
        state.player.x -= playerSpeed;
        state.player.tilt = Math.max(state.player.tilt - 0.2, -1);
      } else if ((state.keys['ArrowRight'] || state.keys['KeyD']) && state.player.x < cw - state.player.width) {
        state.player.x += playerSpeed;
        state.player.tilt = Math.min(state.player.tilt + 0.2, 1);
      } else {
        state.player.tilt *= 0.8;
      }
      
      if (state.player.cooldown > 0) state.player.cooldown--;
      
      // Input Logic: Keyboards OR Touch Auto-fire
      const shouldFire = (state.keys['Space']) || (this.state.isTouching && state.player.cooldown <= 0);

      if (shouldFire && state.player.cooldown <= 0) {
        state.player.cooldown = u.rapidFire ? 5 : 12;
        const pSpeed = 18;
        
        state.projectiles.push({ x: state.player.x + state.player.width/2 - 2, y: py, vx: 0, vy: -pSpeed, active: true });
        if (u.spreadFire) {
          state.projectiles.push({ x: state.player.x + state.player.width/2 - 2, y: py, vx: -3.5, vy: -pSpeed*0.9, active: true });
          state.projectiles.push({ x: state.player.x + state.player.width/2 - 2, y: py, vx: 3.5, vy: -pSpeed*0.9, active: true });
        }
      }
    } else {
      state.player.tilt *= 0.8;
    }

    state.projectiles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -50 || p.x < -50 || p.x > cw + 50) p.active = false;
    });
    
    if (!state.gameOver) {
      const baseSpawn = 60; 
      const spawnRate = Math.max(20, baseSpawn - Math.floor(state.score / 20));
      if (state.frameCount % spawnRate === 0) {
        state.enemies.push({ 
          x: Math.random() * (cw - 40), 
          y: -40, width: 28, height: 28, 
          speed: (1.5 + Math.random() * 2.5) * enemyMult,
          active: true, hp: 1, angle: 0, rotSpeed: (Math.random() - 0.5) * 0.1
        });
      }
    }

    state.enemies.forEach(e => {
      if (!state.gameOver) e.y += e.speed;
      e.angle += e.rotSpeed;
      
      if (e.y > ch + 50) { 
        e.active = false; 
        state.lives--;
        state.screenShake = 15;
        if (state.lives <= 0) state.gameOver = true;
      }
      
      if (!state.gameOver && state.player.invulnerable === 0 && e.x < state.player.x + state.player.width && e.x + e.width > state.player.x && e.y < py + state.player.height && e.y + e.height > py) {
         e.active = false;
         state.lives--;
         state.screenShake = 35; 
         state.player.invulnerable = 60; 
         if (state.lives <= 0) state.gameOver = true;
         else {
           for(let i=0; i<15; i++) {
              state.particles.push({
                x: state.player.x + 15, y: py + 15, 
                vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, 
                life: 15 + Math.random()*20, color: '#f8fafc'
              });
           }
         }
      }
    });

    state.projectiles.filter(p => p.active).forEach(p => {
      state.enemies.filter(e => e.active).forEach(e => {
        if (p.x < e.x + e.width && p.x + 8 > e.x && p.y < e.y + e.height && p.y + 12 > e.y) {
          e.hp--;
          if (e.hp <= 0) {
            e.active = false;
            state.score += 10;
            for(let i=0; i<15; i++) {
              state.particles.push({
                x: e.x + e.width/2, y: e.y + e.height/2, 
                vx: (Math.random()-0.5)*14, vy: (Math.random()-0.5)*14, 
                life: 20 + Math.random()*30,
                color: ['#f43f5e', '#fb7185', '#fda4af', '#facc15', '#38bdf8'][Math.floor(Math.random()*5)]
              });
            }
            state.particles.push({ text: "+10 XP", x: e.x, y: e.y, vx: 0, vy: -1.5, life: 40, isText: true });
          }
          if (!u.plasma) p.active = false;
        }
      });
    });

    // --- Real-time Level Up Check ---
    const currentLevel = Math.max(1, Math.floor(Store.data.xp / 200) + 1);
    if (currentLevel > state.lastLevel) {
      state.lastLevel = currentLevel;
      state.screenShake = 30;
      for(let i=0; i<40; i++) {
        state.particles.push({
          x: cw/2, y: ch/2, vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20,
          life: 60, color: '#c084fc'
        });
      }
      state.particles.push({ text: "PROMOTED: LEVEL " + currentLevel, x: cw/2 - 100, y: ch/2, vx: 0, vy: -0.5, life: 100, isText: true, size: 32 });
    }

    state.particles.forEach(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.life--; });
    state.projectiles = state.projectiles.filter(p => p.active);
    state.enemies = state.enemies.filter(e => e.active);
    state.particles = state.particles.filter(p => p.life > 0);
  },

  draw() {
    const { ctx, canvas, state } = this;
    ctx.save();
    if (state.screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
    }
    
    const cw = canvas.width;
    const ch = canvas.height;
    const py = ch - 80;
    const u = Store.data.upgrades;

    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
    
    state.stars.forEach(s => {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, s.alpha * (s.size/2))})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(255,255,255,0.5)';
    });
    ctx.shadowBlur = 0;

    if (!this.isPlaying) {
      ctx.restore();
      return; 
    }

    if (!state.gameOver) {
      if (state.player.invulnerable === 0 || Math.floor(state.frameCount / 6) % 2 === 0) {
        ctx.save();
        ctx.translate(state.player.x + state.player.width/2, py + state.player.height/2);
        ctx.rotate(state.player.tilt * 0.4);
        
        ctx.fillStyle = state.player.invulnerable > 0 ? '#f8fafc' : '#818cf8';
        ctx.shadowBlur = 20;
        ctx.shadowColor = state.player.invulnerable > 0 ? 'white' : '#818cf8';
        ctx.beginPath();
        ctx.moveTo(0, -state.player.height/2);
        ctx.lineTo(state.player.width/2, state.player.height/2);
        ctx.lineTo(0, state.player.height/4);
        ctx.lineTo(-state.player.width/2, state.player.height/2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#34d399';
        ctx.globalAlpha = 0.6 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.arc(0, state.player.height/2 + 2, 5 + Math.random()*5, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
      }
    }

    ctx.fillStyle = '#f43f5e';
    state.enemies.forEach(e => {
      ctx.save();
      ctx.translate(e.x + e.width/2, e.y + e.height/2);
      ctx.rotate(e.angle);
      ctx.beginPath();
      ctx.moveTo(0, -e.height/2);
      ctx.lineTo(e.width/2, 0);
      ctx.lineTo(0, e.height/2);
      ctx.lineTo(-e.width/2, 0);
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f43f5e';
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();
    });
    
    ctx.fillStyle = u.plasma ? '#c084fc' : '#34d399';
    state.projectiles.forEach(p => {
      ctx.shadowBlur = 20;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fillRect(p.x - 2, p.y, 4, 20);
      ctx.shadowBlur = 0;
    });

    state.particles.forEach(p => {
      if (p.isText) {
        ctx.fillStyle = `rgba(52, 211, 153, ${p.life / 40})`;
        const fontSize = p.size || 20;
        ctx.font = `bold ${fontSize}px Inter`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#34d399';
        ctx.fillText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;
      } else {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + Math.random()*3, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    });

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold 28px Inter`;
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${state.score}`, 30, 45);

    ctx.fillStyle = state.lives > 1 ? '#34d399' : '#f43f5e';
    ctx.fillText(`LIVES: ${Math.max(0, state.lives)}`, 30, 85);

    if (state.gameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(0, 0, cw, ch);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = `bold 72px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#f43f5e';
      ctx.fillText('CRITICAL BREACH', cw/2, ch/2 - 40);
      ctx.shadowBlur = 0;

      ctx.font = `28px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(`Final Score: ${state.score} XP Evaluated`, cw/2, ch/2 + 30);
      ctx.fillText('Press R to Re-engage', cw/2, ch/2 + 80);
      
      if (state.keys['KeyR']) {
        this.resetState();
      }
    }
    
    ctx.restore();
  },

  loop() {
    if (this.isPlaying) this.update();
    else this.updateIdle();

    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }
};
