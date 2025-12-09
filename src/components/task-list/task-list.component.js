class TaskList extends Component {
  refs = {
    taskInput: '.task-input',
    taskList: '.task-list',
    taskItem: '.task-item',
    taskCheckbox: '.task-checkbox',
    taskText: '.task-text',
    deleteBtn: '.delete-task-btn'
  };

  constructor() {
    super();
    this.tasks = this.loadTasks();
    this.deletedTasks = this.loadDeletedTasks();
    this.categoriesCollapsed = {
      active: false,
      complete: true,
      deleted: true
    };
    this.setEvents();
  }

  setEvents() {
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.addTask();
      }
    });
  }

  imports() {
    return [
      this.resources.fonts.roboto,
      this.resources.icons.material
    ];
  }

  style() {
    return `
      .task-list-container {
        font-family: 'Roboto', sans-serif;
        color: #d4be98;
        width: 100%;
        height: calc(100% - 70px - 32px);
        background: transparent;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
        -ms-overflow-style: none;
        overscroll-behavior: contain;
        padding-left: 15px;
        padding-right: 15px;
        padding-bottom: 47px;
        border-radius: 15px;
      }

      .task-list-container::-webkit-scrollbar {
        display: none;
      }

      .task-input-container {
        background: #282828;
        border-radius: 15px;
        padding: 15px;
        padding-top: 20px;
        margin-bottom: 0;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .task-list {
        padding: 15px;
        padding-top: 0;
        padding-left: 10px;
        padding-right: 10px;
      }

      .task-input {
        width: 100%;
        padding: 12px 16px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(to bottom, #282828 0%, #202020 100%);
        color: #4e4e4e;
        font-size: 14px;
        box-sizing: border-box;
        box-shadow: rgba(0, 0, 0, 0.3) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.1) -1px -1px 1px 1px inset;
      }

      .task-input:focus {
        outline: none;
        color: #d4be98;
      }

      .task-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .task-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 0.4em 0.7em;
        margin-bottom: 0.7em;
        background: #32302f;
        box-shadow: 0 4px rgba(50, 48, 47, 0.5), 0 5px 10px rgb(0 0 0 / 20%);
        border-radius: 2px;
        transition: all 0.2s;
        overflow: hidden;
        cursor: grab;
      }

      .task-item:hover {
        transform: translate(0, 4px);
        box-shadow: 0 0 rgba(0, 0, 0, 0.25), 0 0 0 rgba(0, 0, 0, .5), 0 -0px 5px rgba(0, 0, 0, .1);
      }

      .task-item:active {
        cursor: grabbing;
      }

      .task-item.completed .task-text {
        text-decoration: line-through;
        opacity: 0.6;
      }

      .task-checkbox {
        width: 0;
        height: 18px;
        cursor: pointer;
        transition: width 0.3s ease 0.5s;
        appearance: none;
        background: rgba(169, 182, 101, 0.2);
        border: 2px solid #7daea3;
        border-radius: 3px;
        position: relative;
        flex-shrink: 0;
        overflow: hidden;
      }

      .task-checkbox:checked {
        background: #a9b665;
        border-color: #a9b665;
      }

      .task-checkbox:checked::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #282828;
        font-size: 12px;
        font-weight: bold;
      }

      .task-item:hover .task-checkbox,
      .task-checkbox:hover {
        width: 18px;
        transition: width 0.3s ease 0s;
      }

      .task-text {
        flex: 1;
        font-size: 14px;
        color: #d4be98;
        word-break: break-word;
        transition: margin-right 0.3s ease 0.5s;
        margin-right: 0;
      }

      .task-item:hover .task-text {
        margin-right: 28px;
        transition: margin-right 0.3s ease 0s;
      }

      .task-edit-input {
        flex: 1;
        font-size: 14px;
        color: #d4be98;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #7daea3;
        border-radius: 3px;
        padding: 2px 6px;
        word-break: break-word;
      }

      .task-edit-input:focus {
        outline: none;
        border-color: #a9b665;
        box-shadow: 0 0 0 1px rgba(169, 182, 101, 0.3);
      }

      .delete-task-btn {
        background: none;
        border: none;
        color: #ea6962;
        cursor: pointer;
        padding: 4px;
        border-radius: 2px;
        font-size: 16px;
        line-height: 1;
        width: 0;
        overflow: hidden;
        transition: width 0.3s ease 0.5s;
        flex-shrink: 0;
      }

      .delete-task-btn:hover {
        background: rgba(234, 105, 98, 0.1);
      }

      .task-item:hover .delete-task-btn,
      .delete-task-btn:hover {
        width: 24px;
        transition: width 0.3s ease 0s;
      }

      .task-empty {
        text-align: center;
        color: #7daea3;
        font-style: italic;
        padding: 20px;
      }

      .task-item.dragging {
        opacity: 0.5;
        transform: rotate(5deg);
      }

      .task-item.drag-over {
        border-color: #a9b665;
        background: rgba(169, 182, 101, 0.1);
      }

      /* Category Headers */
      .category-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        margin-bottom: 4px;
        cursor: pointer;
        transition: opacity 0.2s ease;
        font-weight: normal;
        font-size: 13px;
        opacity: 0.7;
      }

      .category-header:hover {
        opacity: 1;
      }

      .category-icon {
        font-size: 14px;
        width: 16px;
        text-align: center;
        opacity: 0.6;
      }

      .category-title {
        flex: 1;
        color: #d4be98;
        opacity: 0.8;
      }

      .category-count {
        background: rgba(255, 255, 255, 0.05);
        padding: 1px 6px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: normal;
        min-width: 16px;
        text-align: center;
        opacity: 0.7;
      }

      .category-toggle {
        font-size: 10px;
        color: #7daea3;
        opacity: 0.6;
        transition: opacity 0.2s ease;
      }

      .category-header:hover .category-toggle {
        opacity: 1;
      }

      /* Restore button styling */
      .restore-task-btn {
        background: none;
        border: none;
        color: #7daea3;
        cursor: pointer;
        padding: 4px;
        border-radius: 2px;
        font-size: 16px;
        line-height: 1;
        width: 0;
        overflow: hidden;
        transition: width 0.3s ease 0.5s;
        flex-shrink: 0;
      }

      .restore-task-btn:hover {
        background: rgba(125, 174, 163, 0.1);
      }

      .task-item:hover .restore-task-btn,
      .restore-task-btn:hover {
        width: 24px;
        transition: width 0.3s ease 0s;
      }

      /* Bulk action buttons */
      .bulk-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
        padding: 12px 0;
        margin-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .bulk-action-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .bulk-action-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .restore-all-btn {
        background: #7daea3;
        color: #282828;
      }

      .restore-all-btn:hover {
        background: #89b482;
      }

      .delete-all-btn {
        background: #ea6962;
        color: #ffffff;
      }

      .delete-all-btn:hover {
        background: #ec5d51;
      }

      .permanent-delete-all-btn {
        background: #cc241d;
        color: #ffffff;
      }

      .permanent-delete-all-btn:hover {
        background: #b91c13;
      }
    `;
  }

  template() {
    return `
      <div class="task-input-container">
        <input type="text" class="task-input" placeholder="Add a new task..." maxlength="100">
      </div>
      <div class="task-list-container">
        ${this.renderCategories()}
      </div>
    `;
  }

  renderCategories() {
    const activeTasks = this.tasks.filter(task => !task.completed);
    const completedTasks = this.tasks.filter(task => task.completed);

    return `
      <div class="category active-category">
        <div class="category-header active-header" data-category="active">
          <div class="category-icon">⚡</div>
          <div class="category-title">Active Tasks</div>
          <div class="category-count">${activeTasks.length}</div>
          <div class="category-toggle">${this.categoriesCollapsed.active ? '▶' : '▼'}</div>
        </div>
        <div class="category-content active-content" style="display: ${this.categoriesCollapsed.active ? 'none' : 'block'};">
          <ul class="task-list">
            ${activeTasks.length === 0 ? '<li class="task-empty">No active tasks</li>' : this.renderTasks(activeTasks, 'active')}
          </ul>
        </div>
      </div>

      <div class="category complete-category">
        <div class="category-header complete-header" data-category="complete">
          <div class="category-icon">✓</div>
          <div class="category-title">Completed Tasks</div>
          <div class="category-count">${completedTasks.length}</div>
          <div class="category-toggle">${this.categoriesCollapsed.complete ? '▶' : '▼'}</div>
        </div>
        <div class="category-content complete-content" style="display: ${this.categoriesCollapsed.complete ? 'none' : 'block'};">
          <ul class="task-list">
            ${completedTasks.length === 0 ? '<li class="task-empty">No completed tasks</li>' : this.renderTasks(completedTasks, 'complete')}
          </ul>
          ${completedTasks.length > 0 ? `
            <div class="bulk-actions">
              <button class="bulk-action-btn restore-all-btn" onclick="window.taskListComponent.restoreAllCompletedTasks()">Restore All</button>
              <button class="bulk-action-btn delete-all-btn" onclick="window.taskListComponent.deleteAllCompletedTasks()">Delete All</button>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="category deleted-category">
        <div class="category-header deleted-header" data-category="deleted">
          <div class="category-icon">🗑️</div>
          <div class="category-title">Deleted Tasks</div>
          <div class="category-count">${this.deletedTasks.length}</div>
          <div class="category-toggle">${this.categoriesCollapsed.deleted ? '▶' : '▼'}</div>
        </div>
        <div class="category-content deleted-content" style="display: ${this.categoriesCollapsed.deleted ? 'none' : 'block'};">
          <ul class="task-list">
            ${this.deletedTasks.length === 0 ? '<li class="task-empty">No deleted tasks</li>' : this.renderTasks(this.deletedTasks, 'deleted')}
          </ul>
          ${this.deletedTasks.length > 0 ? `
            <div class="bulk-actions">
              <button class="bulk-action-btn restore-all-btn" onclick="window.taskListComponent.restoreAllDeletedTasks()">Restore All</button>
              <button class="bulk-action-btn permanent-delete-all-btn" onclick="window.taskListComponent.permanentlyDeleteAllTasks()">Delete All</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderTasks(taskArray, category) {
    return taskArray.map((task, index) => {
      const globalIndex = category === 'active' ? this.tasks.findIndex(t => t === task) :
        category === 'complete' ? this.tasks.findIndex(t => t === task) :
          this.deletedTasks.findIndex(t => t === task);

      return `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-index="${globalIndex}" data-category="${category}" ${category === 'active' ? 'draggable="true"' : ''} ${category === 'active' ? `ondragstart="window.taskListComponent.handleDragStart(event, ${globalIndex})" ondragover="window.taskListComponent.handleDragOver(event)" ondrop="window.taskListComponent.handleDrop(event, ${globalIndex})" ondragend="window.taskListComponent.handleDragEnd(event)"` : ''}>
          ${category === 'active' || category === 'complete' ? `<input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>` : ''}
          <span class="task-text" ondblclick="this.parentElement.querySelector('.task-edit-input').style.display='inline-block'; this.style.display='none'; this.parentElement.querySelector('.task-edit-input').focus(); this.parentElement.querySelector('.task-edit-input').value=this.textContent;">${this.escapeHtml(task.text)}</span>
          <input type="text" class="task-edit-input" style="display:none;" onblur="this.previousElementSibling.style.display='inline-block'; this.style.display='none'; if(this.value.trim()) { window.taskListComponent.editTask(${globalIndex}, this.value.trim()); }" onkeydown="if(event.key==='Enter'){this.blur();} if(event.key==='Escape'){this.value=this.previousElementSibling.textContent; this.blur();}">
          ${category === 'active' || category === 'complete' ? `<button class="delete-task-btn" title="Delete task"><i class="material-icons" style="font-size: 16px; line-height: 1;">delete</i></button>` : ''}
          ${category === 'deleted' ? `<button class="restore-task-btn" title="Restore task" onclick="window.taskListComponent.restoreTask(${index})"><i class="material-icons" style="font-size: 16px; line-height: 1;">restore</i></button>` : ''}
        </li>
      `;
    }).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  addTask() {
    const input = this.shadowRoot.querySelector('.task-input');
    const text = input.value.trim();

    if (text) {
      this.tasks.push({ text, completed: false });
      this.saveTasks();
      this.updateTaskList();
      input.value = '';
      input.focus();
    }
  }

  toggleTask(index) {
    if (this.tasks[index]) {
      this.tasks[index].completed = !this.tasks[index].completed;
      this.saveTasks();
      this.updateTaskList();
    }
  }

  deleteTask(index) {
    if (this.tasks[index]) {
      // Move to deleted tasks instead of removing
      const deletedTask = { ...this.tasks[index], deletedAt: new Date().toISOString() };
      this.deletedTasks.push(deletedTask);
      this.tasks.splice(index, 1);
      this.saveTasks();
      this.saveDeletedTasks();
      this.updateTaskList();
    }
  }

  updateTaskList() {
    const taskListContainer = this.shadowRoot.querySelector('.task-list-container');
    taskListContainer.innerHTML = this.renderCategories();
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Remove existing event listeners first to prevent duplicates
    this.removeEventListeners();

    // Task checkboxes
    const checkboxes = this.shadowRoot.querySelectorAll('.task-checkbox');
    checkboxes.forEach((checkbox) => {
      const taskItem = checkbox.closest('.task-item');
      const index = parseInt(taskItem.getAttribute('data-index'));
      checkbox.addEventListener('change', () => this.toggleTask(index));
    });

    // Delete buttons
    const deleteBtns = this.shadowRoot.querySelectorAll('.delete-task-btn');
    deleteBtns.forEach((btn) => {
      const taskItem = btn.closest('.task-item');
      const index = parseInt(taskItem.getAttribute('data-index'));
      btn.addEventListener('click', () => this.deleteTask(index));
    });

    // Category headers
    const categoryHeaders = this.shadowRoot.querySelectorAll('.category-header');
    categoryHeaders.forEach((header) => {
      const category = header.getAttribute('data-category');
      if (category) {
        header.addEventListener('click', () => this.toggleCategory(category));
      }
    });

    // Restore buttons are now handled via onclick attributes in the template
  }

  removeEventListeners() {
    // This method would remove existing listeners if needed
    // For now, we'll rely on the fact that innerHTML replacement removes old elements
  }

  loadTasks() {
    try {
      const saved = localStorage.getItem('tartarus-tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load tasks from localStorage:', e);
      return [];
    }
  }

  saveTasks() {
    try {
      localStorage.setItem('tartarus-tasks', JSON.stringify(this.tasks));
    } catch (e) {
      console.warn('Failed to save tasks to localStorage:', e);
    }
  }

  loadDeletedTasks() {
    try {
      const saved = localStorage.getItem('tartarus-deleted-tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load deleted tasks from localStorage:', e);
      return [];
    }
  }

  saveDeletedTasks() {
    try {
      localStorage.setItem('tartarus-deleted-tasks', JSON.stringify(this.deletedTasks));
    } catch (e) {
      console.warn('Failed to save deleted tasks to localStorage:', e);
    }
  }

  toggleCategory(category) {
    this.categoriesCollapsed[category] = !this.categoriesCollapsed[category];
    this.updateTaskList();
  }

  editTask(index, newText) {
    if (this.tasks[index] && newText.trim()) {
      this.tasks[index].text = newText.trim();
      this.saveTasks();
      this.updateTaskList();
    }
  }

  restoreTask(index) {
    if (this.deletedTasks[index]) {
      // Restore task preserving its original completed state
      const restoredTask = { ...this.deletedTasks[index] };
      delete restoredTask.deletedAt;
      this.tasks.push(restoredTask);
      this.deletedTasks.splice(index, 1);
      this.saveTasks();
      this.saveDeletedTasks();
      this.updateTaskList();
    }
  }

  handleDragStart(event, index) {
    this.draggedIndex = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
    event.target.classList.add('dragging');
  }

  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    return false;
  }

  handleDrop(event, dropIndex) {
    event.preventDefault();
    const draggedIndex = this.draggedIndex;

    if (draggedIndex !== dropIndex && draggedIndex !== undefined) {
      // Reorder the tasks array
      const draggedTask = this.tasks[draggedIndex];
      this.tasks.splice(draggedIndex, 1);
      this.tasks.splice(dropIndex, 0, draggedTask);

      this.saveTasks();
      this.updateTaskList();
    }

    return false;
  }

  handleDragEnd(event) {
    event.target.classList.remove('dragging');
    // Remove drag-over class from all items
    const items = this.shadowRoot.querySelectorAll('.task-item');
    items.forEach(item => item.classList.remove('drag-over'));
    this.draggedIndex = undefined;
  }

  connectedCallback() {
    // Make component globally accessible for inline event handlers
    window.taskListComponent = this;

    // Prevent scroll bubbling to parent panels
    this.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });

    this.render().then(() => {
      this.attachEventListeners();
    });
  }

  restoreAllDeletedTasks() {
    // Restore all deleted tasks preserving their original completed state
    this.deletedTasks.forEach(task => {
      const restoredTask = { ...task };
      delete restoredTask.deletedAt;
      this.tasks.push(restoredTask);
    });
    this.deletedTasks = [];
    this.saveTasks();
    this.saveDeletedTasks();
    this.updateTaskList();
  }

  restoreAllCompletedTasks() {
    // Uncheck all completed tasks (move to active)
    this.tasks.forEach(task => {
      if (task.completed) {
        task.completed = false;
      }
    });
    this.saveTasks();
    this.updateTaskList();
  }

  deleteAllCompletedTasks() {
    // Move all completed tasks to deleted
    const completedTasks = this.tasks.filter(task => task.completed);
    completedTasks.forEach(task => {
      const deletedTask = { ...task, deletedAt: new Date().toISOString() };
      this.deletedTasks.push(deletedTask);
    });
    this.tasks = this.tasks.filter(task => !task.completed);
    this.saveTasks();
    this.saveDeletedTasks();
    this.updateTaskList();
  }

  permanentlyDeleteAllTasks() {
    // Permanently delete all deleted tasks
    this.deletedTasks = [];
    this.saveDeletedTasks();
    this.updateTaskList();
  }

  handleCategoryClick(category) {
    this.toggleCategory(category);
  }

  handleRestoreClick(index) {
    this.restoreTask(index);
  }
}

customElements.define('task-list', TaskList);
