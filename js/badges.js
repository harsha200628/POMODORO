window.Badges = {
  BADGES: [
    { id: 'first_ignition', icon: '🔥', title: 'First Ignition', desc: 'Complete 1 Focus Session', condition: s => s.sessions >= 1 },
    { id: 'focus_spark', icon: '⚡', title: 'Focus Spark', desc: 'Reach 50 Base XP', condition: s => s.xp >= 50 },
    { id: 'momentum', icon: '💫', title: 'Momentum', desc: 'Secure a 3-Day Focus Streak', condition: s => s.streak >= 3 },
    { id: 'space_ace', icon: '💎', title: 'Space Ace', desc: 'Exceed Level 5 Rank', condition: s => s.level >= 5 },
    { id: 'cyber_master', icon: '👑', title: 'Cyber Master', desc: 'Archive 25 Total Sessions', condition: s => s.sessions >= 25 }
  ],

  init() {
    this.render();
    window.addEventListener('store-updated', () => this.render());
  },

  render() {
    const container = document.getElementById('badges-container');
    if (!container) return;

    const s = {
       xp: Store.data.xp,
       streak: Store.data.streak,
       sessions: Store.data.sessions,
       level: Math.max(1, Math.floor(Store.data.xp / 200) + 1)
    };

    container.innerHTML = this.BADGES.map(b => {
      const unlocked = b.condition(s);
      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; opacity: ${unlocked ? '1' : '0.4'}; filter: ${unlocked ? 'none' : 'grayscale(100%)'}; transition: all 0.3s ease;" title="${b.title}: ${b.desc}">
          <div style="width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: ${unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)'}; border: 1px solid ${unlocked ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}; box-shadow: ${unlocked ? '0 0 15px rgba(129, 140, 248, 0.3)' : 'none'};">
            ${b.icon}
          </div>
        </div>
      `;
    }).join('');
  }
};
