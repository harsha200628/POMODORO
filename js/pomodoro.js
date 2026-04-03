window.Pomodoro = {
  mode: 'FOCUS',
  timeLeft: 0,
  isActive: false,
  intervalId: null,

  init() {
    this.updateFromStore();
    this.resetTimer();
    this.bindEvents();
    
    window.addEventListener('store-updated', () => {
      this.updateFromStore();
      this.updateDOM();
    });
  },

  updateFromStore() {
    const s = Store.data.settings;
    if (!this.isActive) {
      if (this.mode === 'FOCUS') this.timeLeft = s.focusTime;
      else if (this.mode === 'SHORT_BREAK') this.timeLeft = s.shortBreakTime;
      else if (this.mode === 'LONG_BREAK') this.timeLeft = s.longBreakTime;
    }
  },

  bindEvents() {
    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.addEventListener('click', () => this.toggle());
    
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => this.resetTimer());
    
    const mFocus = document.getElementById('mode-focus');
    if (mFocus) mFocus.addEventListener('click', () => this.switchMode('FOCUS'));
    
    const mShort = document.getElementById('mode-short');
    if (mShort) mShort.addEventListener('click', () => this.switchMode('SHORT_BREAK'));
    
    const mLong = document.getElementById('mode-long');
    if (mLong) mLong.addEventListener('click', () => this.switchMode('LONG_BREAK'));
    
    const toggleBtn = document.getElementById('btn-settings-toggle');
    const setView = document.getElementById('settings-view');
    const timerView = document.getElementById('timer-view');
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isSettings = setView.style.display === 'flex';
        setView.style.display = isSettings ? 'none' : 'flex';
        timerView.style.display = isSettings ? 'flex' : 'none';
        toggleBtn.textContent = isSettings ? 'Settings' : 'Close';
      });
    }

    const btnSave = document.getElementById('btn-settings-save');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        Store.set('focus_settings', {
          focusTime: parseInt(document.getElementById('cfg-focus').value) * 60,
          shortBreakTime: parseInt(document.getElementById('cfg-short').value) * 60,
          longBreakTime: parseInt(document.getElementById('cfg-long').value) * 60
        });
        setView.style.display = 'none';
        timerView.style.display = 'flex';
        toggleBtn.textContent = 'Settings';
        this.resetTimer();
      });
    }
  },

  switchMode(newMode) {
    this.mode = newMode;
    this.isActive = false;
    clearInterval(this.intervalId);
    this.updateFromStore();
    this.updateDOM();
  },

  toggle() {
    if (this.isActive) {
      this.isActive = false;
      clearInterval(this.intervalId);
    } else {
      this.isActive = true;
      this.intervalId = setInterval(() => this.tick(), 1000);
    }
    this.updateDOM();
  },

  tick() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.updateDOM();
    } else {
      this.completeSession();
    }
  },

  completeSession() {
    this.isActive = false;
    clearInterval(this.intervalId);
    
    if (this.mode === 'FOCUS') {
      Store.set('focus_completed_sessions', Store.data.sessions + 1);
      
      const now = new Date();
      const last = Store.get('focus_last_session_date', 0);
      const isNextDay = new Date(now - 86400000).toDateString() === new Date(last).toDateString();
      const isSameDay = now.toDateString() === new Date(last).toDateString();
      
      let streak = Store.data.streak;
      if (isNextDay) streak++;
      else if (!isSameDay) streak = 1;
      if (streak === 0) streak = 1;
      
      Store.set('focus_streak', streak);
      Store.set('focus_last_session_date', now.getTime());
      
      const xpGain = 50 + (streak * 5);
      Store.set('focus_xp', Store.data.xp + xpGain);

      // Increment Active Task
      if (Store.data.activeTaskId) {
        const tasks = Store.data.tasks.map(t => 
           t.id === Store.data.activeTaskId 
           ? { ...t, completedSessions: (t.completedSessions || 0) + 1 }
           : t
        );
        Store.set('focus_tasks', tasks);
      }
      
      // Visual feedback: Matrix Flash
      document.body.style.transition = 'none';
      document.body.style.background = 'rgba(129, 140, 248, 0.4)';
      setTimeout(() => {
        document.body.style.transition = 'background 1s ease';
        document.body.style.background = '';
      }, 50);

      this.switchMode('SHORT_BREAK');
    } else {
      this.switchMode('FOCUS');
    }
  },

  resetTimer() {
    this.isActive = false;
    clearInterval(this.intervalId);
    this.updateFromStore();
    this.updateDOM();
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  },

  updateDOM() {
    const elDisplay = document.getElementById('timer-display');
    const elStart = document.getElementById('btn-start');
    
    if(elDisplay) elDisplay.textContent = this.formatTime(this.timeLeft);
    if(elStart) elStart.textContent = this.isActive ? 'Pause' : 'Start';
      
    ['focus', 'short', 'long'].forEach(t => {
       const btn = document.getElementById(`mode-${t}`);
       if (!btn) return;
       const target = t === 'focus' ? 'FOCUS' : t === 'short' ? 'SHORT_BREAK' : 'LONG_BREAK';
       if (this.mode === target) {
         btn.className = 'btn btn-primary';
       } else {
         btn.className = 'btn btn-glass';
       }
    });

    if (Store.data.activeTaskId) {
       const t = Store.data.tasks.find(x => x.id === Store.data.activeTaskId);
       if (t) {
          const ad = document.getElementById('active-task-display');
          if(ad) ad.innerHTML = `<div style="color: var(--text-main); font-size: 1.1rem; font-weight: 500;"><span style="color: var(--accent); margin-right: 8px;">•</span> ${t.title}</div>`;
          
          if(elStart) {
             elStart.disabled = false;
             elStart.style.opacity = '1';
             elStart.style.cursor = 'pointer';
          }
       }
    } else {
       const ad = document.getElementById('active-task-display');
       if(ad) ad.innerHTML = `<div style="color: var(--text-muted); font-size: 0.95rem; font-weight: 500;">Select a task to unlock focus</div>`;
       
       if (this.mode === 'FOCUS' && elStart) {
          elStart.disabled = true;
          elStart.style.opacity = '0.4';
          elStart.style.cursor = 'not-allowed';
          if(this.isActive) this.toggle(); 
       }
    }

    const tc = document.getElementById('timer-cycles');
    if(tc) tc.textContent = Store.data.sessions;
    
    const np = document.getElementById('nav-xp');
    if(np) np.textContent = Store.data.xp;
    const nl = document.getElementById('nav-level');
    if(nl) nl.textContent = Math.max(1, Math.floor(Store.data.xp / 200) + 1);
    const ns = document.getElementById('nav-streak');
    if(ns) ns.textContent = Store.data.streak;

    const ds = document.getElementById('data-sessions');
    if(ds) ds.textContent = Store.data.sessions;
    const dx = document.getElementById('data-xp');
    if(dx) dx.textContent = Store.data.xp;
  }
};
