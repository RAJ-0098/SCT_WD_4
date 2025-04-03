const taskInput = document.getElementById('taskInput');
const taskDateTime = document.getElementById('taskDateTime');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const themeToggle = document.getElementById('themeToggle');
const notification = document.getElementById('notification');
const filterBtns = document.querySelectorAll('.filter-btn');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
renderTasks();
// Prevent past dates and times selection
document.addEventListener('DOMContentLoaded', () => setMinDateTime());
function setMinDateTime() {
    const now = new Date();
    now.setSeconds(0, 0);
    taskDateTime.setAttribute('min', now.toISOString().slice(0, 16));
}
taskDateTime.addEventListener('focus', setMinDateTime);
// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.querySelector('.app-container').setAttribute('data-theme', savedTheme);
themeToggle.checked = savedTheme === 'dark';

themeToggle.addEventListener('change', () => {
    const container = document.querySelector('.app-container');
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    container.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    showNotification(newTheme === 'dark' ? '🌙 Dark Mode Activated!' : '☀️ Light Mode Activated!', 'success');
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

addBtn.addEventListener('click', addTask);
function addTask() {
    const text = taskInput.value.trim();
    const dateTime = taskDateTime.value.trim();

    if (!text || !dateTime) {
        showNotification('⚠️ Enter task and time!', 'error');
        return;
    }

    const now = new Date();
    now.setSeconds(0, 0);
    const selectedTime = new Date(dateTime);
    selectedTime.setSeconds(0, 0);

    if (selectedTime < now) {
        showNotification('⏳ Cannot select past time!', 'error');
        return;
    }

    const existingTask = tasks.find(t => new Date(t.dateTime).getTime() === selectedTime.getTime());
    if (existingTask) {
        showNotification('⏳ Only one task at a time!', 'error');
        return;
    }

    const newTask = { id: Date.now().toString(), text, dateTime, completed: false };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    showNotification('🎉 Task added successfully!', 'success');
    taskInput.value = '';
    taskDateTime.value = '';
}

function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;

        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li class="empty-message">📭 No tasks found!</li>`;
        return;
    }

    filteredTasks.forEach(task => {
        if (!task.text.trim()) return;

        const taskEl = document.createElement('li');
        taskEl.className = `task ${task.completed ? 'completed' : ''}`;

        taskEl.innerHTML = `
            <span class="task-text">${task.text} - ${new Date(task.dateTime).toLocaleString()}</span>
            <input type="text" class="edit-input hidden" value="${task.text}" />
            <div>
                <input type="checkbox" ${task.completed ? 'checked disabled' : ''} onclick="toggleTaskCompletion('${task.id}')">
                ${!task.completed ? `<button class="edit-btn" onclick="editTask('${task.id}', this)">✏️</button>` : ''}
                <button class="delete-btn" onclick="deleteTask('${task.id}')">🗑️</button>
                <button class="save-btn hidden" onclick="saveEditedTask('${task.id}', this)">💾</button>
            </div>
        `;

        taskList.appendChild(taskEl);
    });
}

function editTask(taskId, btn) {
    const taskEl = btn.closest('.task');
    const taskText = taskEl.querySelector('.task-text');
    const editInput = taskEl.querySelector('.edit-input');
    const saveBtn = taskEl.querySelector('.save-btn');
    editInput.value = taskText.textContent.split(' - ')[0];
    taskText.classList.add('hidden');
    editInput.classList.remove('hidden');
    btn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
}

function saveEditedTask(taskId, btn) {
    const taskEl = btn.closest('.task');
    const taskText = taskEl.querySelector('.task-text');
    const editInput = taskEl.querySelector('.edit-input');
    const editBtn = taskEl.querySelector('.edit-btn');
    const newText = editInput.value.trim();
    if (!newText) {
        showNotification('⚠️ Task cannot be empty!', 'error');
        return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.text = newText;
        saveTasks();
        renderTasks();
        showNotification('✏️ Task edited successfully!', 'success');
    }
}

function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
        task.completed = true;
        saveTasks();
        renderTasks();
        showNotification('🎉Hurray,Task completed successfully!', 'success');
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    showNotification('🗑️ Task deleted successfully!', 'success');
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;

    // Remove any previous class
    notification.classList.remove("success", "error");

    // Assign color based on the type
    if (type === "success") {
        notification.classList.add("success"); // Green for success messages
    } else {
        notification.classList.add("error"); // Red for errors and warnings
    }

    // Show notification
    notification.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
