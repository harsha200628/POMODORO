window.Store = {
  data: {
    xp: 0,
    streak: 0,
    sessions: 0,
    tasks: [],
    activeTaskId: null,
    upgrades: { rapidFire: false, thrusters: false, spreadFire: false, timeDilation: false, plasma: false, shield: false },
    settings: { focusTime: 1500, shortBreakTime: 300, longBreakTime: 900 }
  },

  init() {
    this.data.xp = this.get('focus_xp', 0);
    this.data.streak = this.get('focus_streak', 0);
    this.data.sessions = this.get('focus_completed_sessions', 0);
    this.data.tasks = this.get('focus_tasks', []);
    this.data.activeTaskId = this.get('focus_active_task', null);
    this.data.upgrades = this.get('focus_game_upgrades', { rapidFire: false, thrusters: false, spreadFire: false, timeDilation: false, plasma: false, shield: false });
    this.data.settings = this.get('focus_settings', { focusTime: 1500, shortBreakTime: 300, longBreakTime: 900 });
    this.broadcast();
  },

  get(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    if(key === 'focus_xp') this.data.xp = value;
    if(key === 'focus_streak') this.data.streak = value;
    if(key === 'focus_completed_sessions') this.data.sessions = value;
    if(key === 'focus_tasks') this.data.tasks = value;
    if(key === 'focus_active_task') this.data.activeTaskId = value;
    if(key === 'focus_game_upgrades') this.data.upgrades = value;
    if(key === 'focus_settings') this.data.settings = value;
    this.broadcast();
  },

  broadcast() {
    window.dispatchEvent(new CustomEvent('store-updated', { detail: this.data }));
  }
};
