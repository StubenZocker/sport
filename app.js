// State Management
let state = {
    currentDate: new Date(),
    activities: {},
    logs: {},
    view: 'dashboard'
};

// DOM Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const currentDateElement = document.getElementById('currentDate');
const activitiesList = document.getElementById('activitiesList');
const activityForm = document.getElementById('activityForm');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');

// Utility Functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getDateString(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showModal(title, message, onConfirm) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.add('active');
    
    modalConfirm.onclick = () => {
        onConfirm();
        modal.classList.remove('active');
    };
    
    modalCancel.onclick = () => {
        modal.classList.remove('active');
    };
}

// Storage Functions
function saveState() {
    localStorage.setItem('sportTrackerState', JSON.stringify(state));
}

function loadState() {
    const savedState = localStorage.getItem('sportTrackerState');
    if (savedState) {
        state = JSON.parse(savedState);
        state.currentDate = new Date(state.currentDate);
    }
}

// View Management
function setView(viewName) {
    state.view = viewName;
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(viewName).classList.add('active');
    
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    if (viewName === 'dashboard') {
        updateDashboard();
    } else if (viewName === 'analytics') {
        updateAnalytics();
    }
}

// Dashboard Functions
function updateDashboard() {
    currentDateElement.textContent = getDateString(state.currentDate);
    const dateKey = formatDate(state.currentDate);
    const dayLogs = state.logs[dateKey] || {};
    
    // Calculate daily progress
    const totalActivities = Object.keys(state.activities).length;
    const completedActivities = Object.entries(state.activities).filter(([id, activity]) => {
        const value = dayLogs[id] || 0;
        return value >= activity.goal;
    }).length;
    
    const progressPercentage = totalActivities > 0 
        ? (completedActivities / totalActivities * 100).toFixed(1)
        : 0;
    
    // Update progress display
    document.getElementById('progressPercentage').textContent = `${progressPercentage}%`;
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    
    activitiesList.innerHTML = '';
    
    // Create sections for active and completed activities
    const activeSection = document.createElement('div');
    activeSection.className = 'activities-section';
    const activeTitle = document.createElement('h3');
    activeTitle.textContent = 'Active Activities';
    activeSection.appendChild(activeTitle);
    
    const activeGrid = document.createElement('div');
    activeGrid.className = 'activities-grid';
    activeSection.appendChild(activeGrid);
    
    const completedSection = document.createElement('div');
    completedSection.className = 'activities-section';
    const completedTitle = document.createElement('h3');
    completedTitle.textContent = 'Completed Activities';
    completedSection.appendChild(completedTitle);
    
    const completedGrid = document.createElement('div');
    completedGrid.className = 'activities-grid';
    completedSection.appendChild(completedGrid);
    
    // Sort activities into active and completed
    Object.entries(state.activities).forEach(([id, activity]) => {
        const value = dayLogs[id] || 0;
        const isCompleted = value >= activity.goal;
        const progress = Math.min((value / activity.goal) * 100, 100);
        
        const card = document.createElement('div');
        card.className = `activity-card ${isCompleted ? 'completed' : ''}`;
        card.innerHTML = `
            <span class="icon">${activity.icon}</span>
            <div class="activity-header">
                <div>
                    <span>${activity.name}</span>
                </div>
                <div class="activity-controls">
                    <button onclick="adjustValue('${id}', -1)">-</button>
                    <span>${value} ${activity.unit === 'reps-male' || activity.unit === 'reps-female' ? 'reps' : activity.unit}</span>
                    <button onclick="adjustValue('${id}', 1)">+</button>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="activity-footer">
                <span>Goal: ${activity.goal} ${activity.unit === 'reps-male' || activity.unit === 'reps-female' ? 'reps' : activity.unit}</span>
                <div>
                    <button onclick="editActivity('${id}')">Edit</button>
                    <button onclick="deleteActivity('${id}')">Delete</button>
                </div>
            </div>
        `;
        
        if (isCompleted) {
            completedGrid.appendChild(card);
        } else {
            activeGrid.appendChild(card);
        }
    });
    
    // Add sections to the list
    activitiesList.appendChild(activeSection);
    activitiesList.appendChild(completedSection);
}

function adjustValue(activityId, direction) {
    const activity = state.activities[activityId];
    const dateKey = formatDate(state.currentDate);
    const currentValue = (state.logs[dateKey]?.[activityId] || 0);
    const step = activity.unit === 'steps' ? 100 : 5;
    
    const newValue = Math.max(0, currentValue + (direction * step));
    if (!state.logs[dateKey]) state.logs[dateKey] = {};
    state.logs[dateKey][activityId] = newValue;
    
    saveState();
    updateDashboard();
}

// Activity Management
function addActivity(event) {
    event.preventDefault();
    
    const name = document.getElementById('activityName').value;
    const unit = document.getElementById('activityUnit').value;
    const goal = parseInt(document.getElementById('activityGoal').value);
    
    const id = generateId();
    state.activities[id] = {
        name,
        unit,
        icon: getIconForUnit(unit),
        goal
    };
    
    saveState();
    activityForm.reset();
    setView('dashboard');
}

function editActivity(activityId) {
    const activity = state.activities[activityId];
    
    // Create edit form HTML
    const formHtml = `
        <form id="editActivityForm" class="activity-form">
            <div class="form-group">
                <label for="editActivityName">Activity Name</label>
                <input type="text" id="editActivityName" value="${activity.name}" required>
            </div>
            <div class="form-group">
                <label for="editActivityUnit">Unit</label>
                <select id="editActivityUnit" required>
                    <option value="reps-male" ${activity.unit === 'reps-male' ? 'selected' : ''}>Reps (💪)</option>
                    <option value="reps-female" ${activity.unit === 'reps-female' ? 'selected' : ''}>Reps (👩)</option>
                    <option value="steps" ${activity.unit === 'steps' ? 'selected' : ''}>Steps (🚶)</option>
                    <option value="min" ${activity.unit === 'min' ? 'selected' : ''}>Min (🚴)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editActivityGoal">Daily Goal</label>
                <input type="number" id="editActivityGoal" value="${activity.goal}" min="0" required>
            </div>
            <button type="submit" class="submit-btn">Save Changes</button>
        </form>
    `;
    
    // Show modal with edit form
    modalTitle.textContent = 'Edit Activity';
    modalMessage.innerHTML = formHtml;
    modal.classList.add('active');
    
    // Handle form submission
    const editForm = document.getElementById('editActivityForm');
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('editActivityName').value;
        const unit = document.getElementById('editActivityUnit').value;
        const goal = parseInt(document.getElementById('editActivityGoal').value);
        
        state.activities[activityId] = {
            name,
            unit,
            icon: getIconForUnit(unit),
            goal
        };
        
        saveState();
        updateDashboard();
        modal.classList.remove('active');
    });
    
    // Handle cancel
    modalCancel.onclick = () => {
        modal.classList.remove('active');
    };
}

function deleteActivity(activityId) {
    showModal('Delete Activity', 'Are you sure you want to delete this activity?', () => {
        delete state.activities[activityId];
        // Remove from all logs
        Object.keys(state.logs).forEach(date => {
            delete state.logs[date][activityId];
        });
        saveState();
        updateDashboard();
    });
}

// Analytics Functions
function updateAnalytics() {
    const chartsContainer = document.getElementById('analyticsCharts');
    chartsContainer.innerHTML = '';
    
    Object.entries(state.activities).forEach(([id, activity]) => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        chartsContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        drawActivityChart(ctx, id, activity);
    });
}

function drawActivityChart(ctx, activityId, activity) {
    const dates = Object.keys(state.logs)
        .sort()
        .slice(-30); // Last 30 days
    
    const values = dates.map(date => state.logs[date]?.[activityId] || 0);
    const maxValue = Math.max(...values, activity.goal);
    
    // Clear canvas
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = ctx.canvas.height - (i * ctx.canvas.height / 4);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
    }
    
    // Draw data line
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((value, i) => {
        const x = (i / (dates.length - 1)) * ctx.canvas.width;
        const y = ctx.canvas.height - (value / maxValue) * ctx.canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Draw goal line
    ctx.strokeStyle = '#666666';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const goalY = ctx.canvas.height - (activity.goal / maxValue) * ctx.canvas.height;
    ctx.moveTo(0, goalY);
    ctx.lineTo(ctx.canvas.width, goalY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Add title
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(activity.name, 10, 20);
}

// Settings Functions
function exportData() {
    const dataStr = JSON.stringify(state);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sport-tracker-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const importedState = JSON.parse(e.target.result);
            state = importedState;
            state.currentDate = new Date(state.currentDate);
            saveState();
            updateDashboard();
        } catch (error) {
            showModal('Import Error', 'Invalid data file format');
        }
    };
    
    reader.readAsText(file);
}

// Add this function to handle unit icons
function getIconForUnit(unit) {
    switch (unit) {
        case 'reps-male':
            return '💪';
        case 'reps-female':
            return '👩';
        case 'steps':
            return '🚶';
        case 'min':
            return '🚴';
        default:
            return '💪';
    }
}

// Add this function to update the goal unit display
function updateGoalUnit(unit) {
    const goalUnit = document.getElementById('goalUnit');
    switch (unit) {
        case 'reps-male':
        case 'reps-female':
            goalUnit.textContent = 'reps';
            break;
        case 'steps':
            goalUnit.textContent = 'steps';
            break;
        case 'min':
            goalUnit.textContent = 'min';
            break;
        default:
            goalUnit.textContent = 'reps';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setView('dashboard');
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            setView(item.dataset.view);
        });
    });
    
    // Date Navigation
    document.getElementById('prevDay').addEventListener('click', () => {
        state.currentDate.setDate(state.currentDate.getDate() - 1);
        updateDashboard();
    });
    
    document.getElementById('nextDay').addEventListener('click', () => {
        state.currentDate.setDate(state.currentDate.getDate() + 1);
        updateDashboard();
    });
    
    // Emoji Selection
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove selected class from all buttons
            emojiButtons.forEach(btn => btn.classList.remove('selected'));
            // Add selected class to clicked button
            button.classList.add('selected');
            // Update hidden inputs and goal unit
            const unit = button.dataset.unit;
            const icon = button.dataset.icon;
            document.getElementById('activityUnit').value = unit;
            document.getElementById('activityIcon').value = icon;
            updateGoalUnit(unit);
        });
    });
    
    // Form Submission
    activityForm.addEventListener('submit', addActivity);
    
    // Settings
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('importData').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
}); 