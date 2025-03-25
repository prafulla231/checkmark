const taskList = document.getElementById('taskList');
const taskForm = document.getElementById('taskForm');
const filterStatus = document.getElementById('statusFilter');
const searchField = document.getElementById('searchTask');
let taskArray = JSON.parse(localStorage.getItem('tasks')) || [];
let isEditing = false;
let currentEditId = null;

// Initialize event listeners
const setEventListeners = () => {
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isEditing) {
            updateTask();
        } else {
            createTask();
        }
    });

    filterStatus.addEventListener('change', displayTasks);
    searchField.addEventListener('input', displayTasks);
};

// Function to create a new task
const createTask = () => {
    const nameField = document.getElementById('taskName');
    const descField = document.getElementById('taskDescription');
    const dueDateField = document.getElementById('taskDueDate');

    if (!nameField.value.trim()) {
        alert('Task name cannot be empty!');
        return;
    }

    const newTask = {
        id: Date.now(),
        name: nameField.value,
        description: descField.value,
        dueDate: dueDateField.value,
        status: 'pending'
    };

    taskArray.push(newTask);
    saveTasks();
    displayTasks();
    resetForm();
    
    // Add alert for task creation
    alert('Task created successfully!');
};

// Function to update a task
const updateTask = () => {
    const nameField = document.getElementById('taskName');
    const descField = document.getElementById('taskDescription');
    const dueDateField = document.getElementById('taskDueDate');

    if (!nameField.value.trim()) {
        alert('Task name cannot be empty!');
        return;
    }

    const taskIndex = taskArray.findIndex(task => task.id === currentEditId);
    if (taskIndex !== -1) {
        taskArray[taskIndex] = {
            ...taskArray[taskIndex],
            name: nameField.value,
            description: descField.value,
            dueDate: dueDateField.value
        };
        saveTasks();
        displayTasks();
        
        // Add alert for task update
        alert('Task updated successfully!');
    }

    resetForm();
    isEditing = false;
    currentEditId = null;
    
    // Change button text back to "Add Task"
    const submitButton = taskForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Add Task';
};

// Function to edit a task
const editTask = (taskId) => {
    const task = taskArray.find(t => t.id === taskId);
    if (task) {
        isEditing = true;
        currentEditId = taskId;
        
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskDueDate').value = task.dueDate || '';
        
        // Change button text to "Update Task"
        const submitButton = taskForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Update Task';
        
        // Scroll to form
        taskForm.scrollIntoView({ behavior: 'smooth' });
        
        // Add alert for entering edit mode
        alert('Editing task. Make your changes and click "Update Task".');
    }
};

// Function to reset the form
const resetForm = () => {
    document.getElementById('taskName').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDueDate').value = '';
};

// Function to check if a task is overdue
const isOverdue = (task) => {
    if (task.status === 'completed') return false;
    if (!task.dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
};

// Function to update task statuses (checking for overdue)
const updateTaskStatuses = () => {
    taskArray.forEach(task => {
        const wasOverdue = task.isOverdue;
        task.isOverdue = isOverdue(task);
        
        if (wasOverdue !== task.isOverdue) {
            saveTasks();
        }
    });
};

// Function to display tasks
const displayTasks = () => {
    updateTaskStatuses();
    
    const currentFilter = filterStatus.value;
    const searchQuery = searchField.value.toLowerCase();

    taskList.innerHTML = '';

    const filteredTasks = taskArray.filter(task => {
        if (currentFilter === 'overdue') {
            return task.isOverdue && task.name.toLowerCase().includes(searchQuery);
        }
        
        const statusMatches = currentFilter === 'all' || task.status === currentFilter;
        const searchMatches = task.name.toLowerCase().includes(searchQuery);
        return statusMatches && searchMatches;
    });

    filteredTasks.sort((a, b) => {  
        // First, prioritize overdue tasks  
        if (a.isOverdue && !b.isOverdue) return -1;  
        if (!a.isOverdue && b.isOverdue) return 1;  
        
        // Then handle tasks without due dates  
        if (!a.dueDate) return 1;  
        if (!b.dueDate) return -1;  
        
        // Finally, sort by due date  
        return new Date(a.dueDate) - new Date(b.dueDate);  
    });  

    filteredTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item');
        
        if (task.status === 'completed') listItem.classList.add('task-completed');
        if (task.isOverdue) listItem.classList.add('task-overdue');

        listItem.innerHTML = `
             <div>
                <strong>${task.name}</strong>
                <p>${task.description}</p>
                <small>Due: ${task.dueDate || 'No due date'}</small>
                ${task.isOverdue ? '<span class="overdue-badge">OVERDUE</span>' : ''}
                ${task.status === 'completed' ? '<span class="completed-badge">COMPLETED</span>' : ''}
            </div>
            <div class="task-actions">
                <button onclick="changeStatus(${task.id})">
                    ${task.status === 'completed' ? 'Undo' : 'Complete'}
                </button>
                <button onclick="editTask(${task.id})" class="edit-btn">Edit</button>
                <button onclick="removeTask(${task.id})">Delete</button>
            </div>
        `;

        taskList.appendChild(listItem);
    });
};

// Function to change task status
const changeStatus = (taskId) => {
    const task = taskArray.find(t => t.id === taskId);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    task.status = newStatus;
    saveTasks();
    displayTasks();
    
    // Add alert for status change
    alert(`Task marked as ${newStatus === 'completed' ? 'completed' : 'pending'}!`);
};

// Function to remove a task
const removeTask = (taskId) => {
    // Add confirmation dialog before deletion
    const confirmDelete = confirm('Are you sure you want to delete this task?');
    
    if (confirmDelete) {
        taskArray = taskArray.filter(task => task.id !== taskId);
        saveTasks();
        displayTasks();
        
        // Add alert for task deletion
        alert('Task deleted successfully!');
    }
};

// Function to save tasks to local storage
const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(taskArray));
};

// Function to check for overdue tasks daily
const checkForOverdueTasks = () => {
    updateTaskStatuses();
    displayTasks();
};

// Initialize everything
setEventListeners();
checkForOverdueTasks();
setInterval(checkForOverdueTasks, 86400000);