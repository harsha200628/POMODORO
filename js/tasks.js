window.Tasks = {
  init() {
    this.bindEvents();
    this.render();

    window.addEventListener('store-updated', () => {
      this.render();
    });
  },

  bindEvents() {
    const form = document.getElementById('task-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title').value.trim();
      const priority = document.getElementById('task-priority').value;
      const targetSessions = parseInt(document.getElementById('task-sessions').value) || 1;

      if (!title) return;

      const newTasks = [...Store.data.tasks, {
        id: Date.now().toString(),
        title,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        targetSessions,
        completedSessions: 0
      }];
      
      Store.set('focus_tasks', newTasks);
      
      document.getElementById('task-title').value = '';
      document.getElementById('task-sessions').value = '1';
      document.getElementById('task-priority').value = 'NORMAL';
    });
  },

  toggle(id) {
    const tasks = Store.data.tasks.map(t => {
      if (t.id === id) {
        const c = !t.completed;
        if (c && Store.data.activeTaskId === id) Store.set('focus_active_task', null);
        return { ...t, completed: c };
      }
      return t;
    });
    Store.set('focus_tasks', tasks);
  },

  deleteTask(id) {
    const tasks = Store.data.tasks.filter(t => t.id !== id);
    if (Store.data.activeTaskId === id) Store.set('focus_active_task', null);
    Store.set('focus_tasks', tasks);
  },

  selectTask(id) {
    Store.set('focus_active_task', Store.data.activeTaskId === id ? null : id);
  },

  render() {
    const pMap = { HIGH: 3, NORMAL: 2, LOW: 1 };
    const activeTasks = Store.data.tasks.filter(t => !t.completed).sort((a, b) => pMap[b.priority] - pMap[a.priority]);
    const completedTasks = Store.data.tasks.filter(t => t.completed);

    const aList = document.getElementById('active-tasks-list');
    const cList = document.getElementById('completed-tasks-list');
    if (!aList || !cList) return;

    if (activeTasks.length === 0) {
      aList.innerHTML = `<p class="text-muted" style="margin-top: 2rem; text-align: center; font-size: 0.95rem;">No tasks available. Add one above.</p>`;
    } else {
      aList.innerHTML = activeTasks.map(task => {
        const isActive = Store.data.activeTaskId === task.id;
        const color = task.completedSessions >= task.targetSessions ? '#34d399' : 'var(--text-main)';
        
        return `
          <div class="glass" style="display: flex; flex-direction: column; gap: 0.8rem; padding: 1.25rem; margin-bottom: 1rem; border-radius: var(--radius-md); border: 1px solid ${isActive ? 'var(--primary)' : 'var(--glass-border)'}; background: ${isActive ? 'rgba(129, 140, 248, 0.08)' : 'var(--surface)'}; transition: all 0.2s ease;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
              <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                <div style="color: ${isActive ? 'var(--primary)' : 'var(--text-main)'}; font-size: 1rem; font-weight: ${isActive ? '600' : '500'};">
                   ${isActive ? '<span style="margin-right: 6px; color: var(--primary);">●</span>' : ''} ${task.title}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                   <span style="font-size: 1.1rem;">🍅</span>
                   <strong style="color: ${color};">${task.completedSessions || 0} / ${task.targetSessions || 1}</strong> 
                </div>
              </div>
              ${task.priority === 'HIGH' ? `<div style="font-size: 0.75rem; padding: 0.3rem 0.75rem; border-radius: var(--radius-full); background: rgba(244, 63, 94, 0.15); color: #f43f5e; font-weight: 600;">High</div>` : ''}
            </div>
            
            <div style="display: flex; gap: 0.75rem; margin-top: 0.25rem;">
              <button onclick="Tasks.selectTask('${task.id}')" class="btn ${isActive ? 'btn-primary' : 'btn-glass'}" style="flex: 1; padding: 0.6rem 0; font-size: 0.85rem;">
                ${isActive ? '● Selected' : 'Select'}
              </button>
              <button onclick="Tasks.toggle('${task.id}')" class="btn btn-accent" style="flex: 1; padding: 0.6rem 0; font-size: 0.85rem;">
                Complete ✓
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    if (completedTasks.length > 0) {
      cList.innerHTML = `
        <h4 class="text-muted" style="margin-bottom: 1rem; font-size: 0.9rem; font-weight: 500;">Completed Tasks</h4>
        ${completedTasks.map(task => `
          <div class="glass" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.25rem; margin-bottom: 1rem; opacity: 0.6; background: rgba(0,0,0,0.2); border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
              <div style="flex: 1; text-decoration: line-through; font-size: 0.95rem; color: var(--text-muted);">${task.title}</div>
              <button onclick="Tasks.deleteTask('${task.id}')" class="btn btn-danger" style="padding: 0.4rem 0.75rem; font-size: 1.1rem; flex-shrink: 0;">×</button>
            </div>
            <button onclick="Tasks.toggle('${task.id}')" class="btn btn-glass" style="width: 100%; font-size: 0.85rem;">
              ↩ Restore
            </button>
          </div>
        `).join('')}
      `;
    } else {
      cList.innerHTML = '';
    }
  }
};
