

( function () {
  'use strict';
  const STORAGE_KEY = 'taskflow_tasks';

  const taskInput = document.getElementById('task-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const charCount = document.getElementById('char-count');
  const pendingList = document.getElementById('pending-list');
  const completedList = document.getElementById('completed-list');
  const pendingCount = document.getElementById('pending-count');
  const completedCount = document.getElementById('completed-count');
  const pendingEmpty = document.getElementById('pending-empty');
  const completedEmpty = document.getElementById('completed-empty');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  const currentDateEl = document.getElementById('current-date');
  const footerYearEl = document.getElementById('footer-year');
  let tasks = [];

  function init() {
    loadFromStorage();
    renderAll();
    updateDate();
    footerYearEl.textContent = new Date().getFullYear();
    bindGlobalEvents();
  }

  function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        tasks = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Taskflow: Could not load tasks from localStorage.', e);
      tasks = [];
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Taskflow: Could not save tasks to localStorage.', e);
    }
  }

  function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      shakeElement(taskInput.closest('.add-task__input-wrapper'));
      taskInput.focus();
      return;
    }

    const task = {
      id: generateId(),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    tasks.unshift(task);
    saveToStorage();
    renderAll();

    taskInput.value = '';
    updateCharCount();
    taskInput.focus();
  }

  function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    saveToStorage();


    const el = document.querySelector(`[data-task-id="${id}"]`);
    if (el) {
      el.classList.add('completing');
      setTimeout(() => renderAll(), 400);
    } else {
      renderAll();
    }
  }

  function deleteTask(id) {
    const el = document.querySelector(`[data-task-id="${id}"]`);
    if (el) {
      el.classList.add('removing');
      el.addEventListener('animationend', () => {
        tasks = tasks.filter(t => t.id !== id);
        saveToStorage();
        renderAll();
      }, { once: true });
    } else {
      tasks = tasks.filter(t => t.id !== id);
      saveToStorage();
      renderAll();
    }
  }

  function editTask(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) return false;

    const task = tasks.find(t => t.id === id);
    if (!task) return false;

    task.text = trimmed;
    saveToStorage();
    renderAll();
    return true;
  }

  function clearCompleted() {
    const items = completedList.querySelectorAll('.task-item');
    if (items.length === 0) return;

    items.forEach((item, i) => {
      item.style.animationDelay = `${i * 50}ms`;
      item.classList.add('removing');
    });

    setTimeout(() => {
      tasks = tasks.filter(t => !t.completed);
      saveToStorage();
      renderAll();
    }, items.length * 50 + 300);
  }


  function renderAll() {
    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    pendingCount.textContent = pending.length;
    completedCount.textContent = completed.length;


    renderTaskList(pendingList, pending, false);
    renderTaskList(completedList, completed, true);

    pendingEmpty.classList.toggle('empty-state--hidden', pending.length > 0);
    completedEmpty.classList.toggle('empty-state--hidden', completed.length > 0);


    clearCompletedBtn.style.display = completed.length > 0 ? 'inline-flex' : 'none';
  }

  function renderTaskList(listEl, taskArr, isCompleted) {
    listEl.innerHTML = '';

    taskArr.forEach((task, index) => {
      const li = createTaskElement(task, isCompleted);
      li.style.animationDelay = `${index * 40}ms`;
      listEl.appendChild(li);
    });
  }

  function createTaskElement(task, isCompleted) {
    const li = document.createElement('li');
    li.className = `task-item${isCompleted ? ' task-item--completed' : ''}`;
    li.dataset.taskId = task.id;

  
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'task-item__toggle';
    toggleBtn.setAttribute('aria-label', isCompleted ? 'Mark as pending' : 'Mark as complete');
    toggleBtn.title = isCompleted ? 'Mark as pending' : 'Mark as complete';
    toggleBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    toggleBtn.addEventListener('click', () => toggleComplete(task.id));


    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-item__content';

    const textP = document.createElement('p');
    textP.className = 'task-item__text';
    textP.textContent = task.text;

    const timestampsDiv = document.createElement('div');
    timestampsDiv.className = 'task-item__timestamps';

    const addedTime = document.createElement('span');
    addedTime.className = 'task-item__time';
    addedTime.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1"/><path d="M6 3.5V6L7.5 7.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
      Added ${formatTimestamp(task.createdAt)}`;

    timestampsDiv.appendChild(addedTime);

    if (task.completedAt) {
      const completedTime = document.createElement('span');
      completedTime.className = 'task-item__time';
      completedTime.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1"/><path d="M4 6L5.5 7.5L8.5 4.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Done ${formatTimestamp(task.completedAt)}`;
      timestampsDiv.appendChild(completedTime);
    }

    contentDiv.appendChild(textP);
    contentDiv.appendChild(timestampsDiv);

   
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-item__actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-item__action-btn task-item__action-btn--edit';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.title = 'Edit task';
    editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.5 3.5L12.5 6.5M2 14L2.5 11L11 2.5L13.5 5L5 13.5L2 14Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    editBtn.addEventListener('click', () => startEditing(li, task));


    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-item__action-btn task-item__action-btn--delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.title = 'Delete task';
    deleteBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4H13M5.5 4V3C5.5 2.5 6 2 6.5 2H9.5C10 2 10.5 2.5 10.5 3V4M6.5 7V11.5M9.5 7V11.5M4.5 4L5 13C5 13.5 5.5 14 6 14H10C10.5 14 11 13.5 11 13L11.5 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    
    li.appendChild(toggleBtn);
    li.appendChild(contentDiv);
    li.appendChild(actionsDiv);

    return li;
  }

  function startEditing(li, task) {
    const contentDiv = li.querySelector('.task-item__content');
    const actionsDiv = li.querySelector('.task-item__actions');
    const textP = contentDiv.querySelector('.task-item__text');
    const timestampsDiv = contentDiv.querySelector('.task-item__timestamps');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-item__edit-input';
    input.value = task.text;
    input.maxLength = 200;

    textP.style.display = 'none';
    timestampsDiv.style.display = 'none';
    contentDiv.insertBefore(input, textP);
    input.focus();
    input.select();

    const originalActions = actionsDiv.innerHTML;
    actionsDiv.innerHTML = '';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'task-item__action-btn task-item__action-btn--save';
    saveBtn.setAttribute('aria-label', 'Save edit');
    saveBtn.title = 'Save';
    saveBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'task-item__action-btn task-item__action-btn--cancel';
    cancelBtn.setAttribute('aria-label', 'Cancel edit');
    cancelBtn.title = 'Cancel';
    cancelBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

    actionsDiv.appendChild(saveBtn);
    actionsDiv.appendChild(cancelBtn);


    function saveEdit() {
      const newText = input.value.trim();
      if (newText) {
        editTask(task.id, newText);
      } else {
        shakeElement(input);
        input.focus();
      }
    }

    function cancelEdit() {
      input.remove();
      textP.style.display = '';
      timestampsDiv.style.display = '';
      actionsDiv.innerHTML = originalActions;

    
      const newEditBtn = actionsDiv.querySelector('.task-item__action-btn--edit');
      const newDeleteBtn = actionsDiv.querySelector('.task-item__action-btn--delete');
      if (newEditBtn) newEditBtn.addEventListener('click', () => startEditing(li, task));
      if (newDeleteBtn) newDeleteBtn.addEventListener('click', () => deleteTask(task.id));
    }

    saveBtn.addEventListener('click', saveEdit);
    cancelBtn.addEventListener('click', cancelEdit);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
      if (e.key === 'Escape') { cancelEdit(); }
    });
  }


 
  function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const now = new Date();

 
    if (date.toDateString() === now.toDateString()) {
      return 'today at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'yesterday at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function shakeElement(el) {
    el.classList.remove('shake');
 
    void el.offsetWidth;
    el.classList.add('shake');
  }

  function updateCharCount() {
    const len = taskInput.value.length;
    charCount.textContent = `${len} / 200`;
    charCount.classList.toggle('near-limit', len >= 160 && len < 200);
    charCount.classList.toggle('at-limit', len >= 200);
  }


 
  function bindGlobalEvents() {
    
    addTaskBtn.addEventListener('click', () => addTask(taskInput.value));

   
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTask(taskInput.value);
      }
    });

   
    taskInput.addEventListener('input', updateCharCount);

    
    clearCompletedBtn.addEventListener('click', clearCompleted);
  }


  document.addEventListener('DOMContentLoaded', init);

})();
