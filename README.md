# 🚀 Gamified Focus Engine

> Transform your productivity into a high-octane arcade experience.  
> Complete focus sessions, earn XP, and spend it on real ship upgrades in a full Space Defender simulation — no frameworks, no builds, no installs.

![License](https://img.shields.io/badge/license-MIT-818cf8?style=flat-square)
![Stack](https://img.shields.io/badge/stack-Vanilla%20JS-f8d000?style=flat-square)
![Dependencies](https://img.shields.io/badge/dependencies-zero-34d399?style=flat-square)

---

## ✨ Features

### 🧠 Productivity Core
| Feature | Description |
|---|---|
| **Pomodoro Timer** | Focus, Short Break & Long Break modes with custom durations |
| **Task Manager** | Add tasks with priority levels and target session counts (🍅) |
| **Intent Lock** | Timer disabled until a task is actively selected |
| **Session Tracking** | Completed Pomodoros auto-increment the active task's progress |
| **XP & Levels** | Finish sessions to earn XP with streak multipliers |
| **Achievements** | 5 unlockable badges from First Ignition 🔥 to Cyber Master 👑 |

### 🎮 Defense Core
| Feature | Description |
|---|---|
| **Space Defender** | Full HTML5 Canvas shoot-em-up, 60fps `requestAnimationFrame` |
| **Cinematic Start** | "Engage Matrix" overlay with a blur-fade transition into combat |
| **3–5 Lives System** | Invulnerability frames on hit; +2 lives with Matrix Shield upgrade |
| **6 Arsenal Upgrades** | Spend XP on permanent ship upgrades in the in-game store |
| **Mobile Touch Controls** | Finger-drag to move + auto-fire on touch devices |
| **Level-Up VFX** | Particle explosion and PROMOTED text on XP milestones in-game |

---

## 🗂 Project Structure

```
LBF/
├── index.html       # 🌟 Entry — Futuristic animated landing page
├── dashboard.html   # 🧠 Productivity hub (Timer, Tasks, Stats, Badges)
├── game.html        # 🎮 Defense Core — Space Defender canvas game
├── css/
│   └── style.css    # Unified design system (glass, buttons, responsive)
└── js/
    ├── store.js     # Global localStorage persistence + event bus
    ├── pomodoro.js  # Timer lifecycle, XP & streak calculation
    ├── tasks.js     # Task CRUD and DOM rendering
    ├── badges.js    # Achievement evaluation & icon injection
    └── game.js      # Canvas physics engine, touch & upgrade shop
```

---

## ⚡ Getting Started

No installation required.

```bash
git clone https://github.com/your-username/LBF.git
```

Open `index.html` in any modern browser. That's it.

1. Press **Get Started →** to enter the dashboard.
2. Add a task → Select it → Press **Start**.
3. Earn XP → Open **Defense Core** → **Engage Matrix** → Open Store → Buy upgrades.

> 💡 All data is saved in your browser's `localStorage`. No account or server needed.

---

## 🛡 Arsenal Upgrade Tree

| Upgrade | Cost | Effect |
|---|---|---|
| Rapid Fire | 150 XP | Minimum weapon cooldown |
| Thruster Overdrive | 300 XP | +40% ship movement speed |
| Spread Fire | 600 XP | 3-shot spread burst |
| Time Dilation | 1000 XP | Enemies permanently slowed 30% |
| Plasma Piercer | 1500 XP | Projectiles pierce through enemies |
| Matrix Shield | 2500 XP | +2 max lives (3 → 5) |

---

## 🏆 Achievements

| Badge | Requirement |
|---|---|
| 🔥 First Ignition | Complete your first focus session |
| ⚡ Focus Spark | Reach 50 XP |
| 💫 Momentum | Maintain a 3-day streak |
| 💎 Space Ace | Reach Level 5 |
| 👑 Cyber Master | Complete 25 total sessions |

---

## 🕹 Controls

| Input | Action |
|---|---|
| `←` / `A` | Move ship left |
| `→` / `D` | Move ship right |
| `Space` | Fire |
| `R` | Restart after game over |
| **Touch Drag** | Move ship (mobile) |
| **Touch Hold** | Auto-fire (mobile) |

---

## 🛠 Tech Stack

- **HTML5** — Semantic structure, Canvas API
- **CSS3** — Custom properties, Glassmorphism, responsive grid, micro-animations
- **Vanilla JS** — ES6+, `localStorage`, `CustomEvent` bus, `requestAnimationFrame`

---

## 📄 License

MIT — free to use, fork, and ship.

---

<div align="center">
  <strong>Built for the Distracted Generation 🧠⚡</strong>
</div>
