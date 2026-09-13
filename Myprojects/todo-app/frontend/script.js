const API_URL = "https://django-todo-app-4o0b.onrender.com/api";


// ===============================
// THEME TOGGLE (Dark Mode)
// ===============================

const themeToggle = document.getElementById("theme-toggle");

// Sayfa yüklendiğinde tercihi uygula
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        themeToggle.textContent = "🌙";
    }
}

// localStorage'dan tercihi oku
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// Toggle butonuna tıklanınca
themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    showToast(
        newTheme === "dark" ? "Dark mode enabled" : "Light mode enabled",
        "info"
    );
});

// ===============================
// API HELPER
// ===============================

async function apiFetch(endpoint, options = {}) {

    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] = `Token ${token}`;
    }

    let response;
    try {
        response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers: headers
            }
        );
    } catch (err) {
        console.error("Network error:", err);
        throw new Error("Server connection error.");
    }

    if (response.status === 401) {
        console.warn("Token expired, logging out...");
        logout();
        throw new Error("Session expired. Please login again.");
    }

    let data = null;
    if (response.status !== 204) {
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }
    }

    if (!response.ok) {
        throw new Error(extractErrorMessage(data));
    }

    return data;
}


// ===============================
// ERROR MESSAGE EXTRACTOR
// ===============================

function extractErrorMessage(data) {

    if (!data) return "Something went wrong.";

    if (typeof data.error === "string") {
        return data.error;
    }

    if (typeof data.detail === "string") {
        return data.detail;
    }

    if (typeof data === "object") {
        for (const field in data) {
            const value = data[field];

            if (Array.isArray(value) && value.length > 0) {
                return `${field}: ${value[0]}`;
            }
            if (typeof value === "string") {
                return `${field}: ${value}`;
            }
            if (typeof value === "object" && value !== null) {
                return extractErrorMessage(value);
            }
        }
    }

    return "Something went wrong.";
}


// ===============================
// ELEMENTS
// ===============================

const deleteModal = document.getElementById("delete-modal");
const deleteModalText = document.getElementById("delete-modal-text");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirm = document.getElementById("modal-confirm");

const loginSection = document.getElementById("login-section");
const todoSection = document.getElementById("todo-section");
const registerSection = document.getElementById("register-section");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");

const registerUsernameInput = document.getElementById("register-username");
const registerEmailInput = document.getElementById("register-email");
const registerPasswordInput = document.getElementById("register-password");

const registerButton = document.getElementById("register-button");
const registerMessage = document.getElementById("register-message");

const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskDueDateInput = document.getElementById("task-due-date");
const taskPriorityInput = document.getElementById("task-priority");

const addTaskButton = document.getElementById("add-task-button");
const taskMessage = document.getElementById("task-message");
const taskList = document.getElementById("task-list");

const logoutButton = document.getElementById("logout-button");

const searchInput = document.getElementById("search-input");
const filterPriority = document.getElementById("filter-priority");
const filterStatus = document.getElementById("filter-status");
const clearFiltersButton = document.getElementById("clear-filters-button");
const editModal = document.getElementById("edit-modal");
const editTitle = document.getElementById("edit-title");
const editDescription = document.getElementById("edit-description");
const editPriority = document.getElementById("edit-priority");
const editDueDate = document.getElementById("edit-due-date");
const editCancel = document.getElementById("edit-cancel");
const editSave = document.getElementById("edit-save");
// Toast
const toastContainer = document.getElementById("toast-container");


// ===============================
// TOAST NOTIFICATIONS
// ===============================

function showToast(message, type = "info") {

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icons = {
        success: "✅",
        error: "❌",
        info: "ℹ️",
        warning: "⚠️"
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || "ℹ️"}</span>
        <span class="toast-message">${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-hiding");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}


// ===============================
// STATE
// ===============================

let allTasks = [];
let currentFilters = {
    search: "",
    priority: "",
    status: ""
};
let pendingDeleteId = null;
let editingTaskId = null;   // ← YENİ

// ===============================
// REGISTER
// ===============================

registerButton.addEventListener("click", register);

async function register() {

    const username = registerUsernameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;

    if (!username || !password) {
        registerMessage.textContent = "Username and password are required.";
        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Registering...";

    try {
        await apiFetch("/register/", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        showToast("Registration successful! You can now login.", "success");
        registerMessage.textContent = "";

        registerUsernameInput.value = "";
        registerEmailInput.value = "";
        registerPasswordInput.value = "";

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
        registerMessage.textContent = error.message;

    } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Register";
    }
}


// ===============================
// LOGIN
// ===============================

loginButton.addEventListener("click", login);

async function login() {

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        loginMessage.textContent = "Username and password are required.";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
        const data = await apiFetch("/login/", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        localStorage.setItem("token", data.token);
        showToast("Login successful!", "success");

        showTodoSection();
        loadTasks();

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
        loginMessage.textContent = error.message;

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
}


// ===============================
// SHOW TODO SECTION
// ===============================

function showTodoSection() {
    loginSection.style.display = "none";
    registerSection.style.display = "none";
    todoSection.style.display = "block";
}


// ===============================
// GET TASKS
// ===============================

async function loadTasks() {

    const token = localStorage.getItem("token");

    if (!token) return;

    taskList.innerHTML = `
        <div class="loading-state">
            <p>⏳ Loading tasks...</p>
        </div>
    `;

    try {
        const tasks = await apiFetch("/tasks/");
        allTasks = tasks;
        applyFilters();

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");

        taskList.innerHTML = `
            <div class="error-state">
                <p>⚠️ Could not load tasks.</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}


// ===============================
// APPLY FILTERS
// ===============================

function applyFilters() {

    let filtered = [...allTasks];

    if (currentFilters.search) {
        const query = currentFilters.search.toLowerCase();
        filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(query) ||
            (task.description || "").toLowerCase().includes(query)
        );
    }

    if (currentFilters.priority) {
        filtered = filtered.filter(task => task.priority === currentFilters.priority);
    }

    if (currentFilters.status === "completed") {
        filtered = filtered.filter(task => task.completed);
    } else if (currentFilters.status === "active") {
        filtered = filtered.filter(task => !task.completed);
    }

    displayTasks(filtered);
}


// ===============================
// DISPLAY TASKS
// ===============================

function displayTasks(tasks) {

    taskList.innerHTML = "";

    if (!tasks || tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <p>📭 No tasks yet.</p>
                <p>Add your first task above!</p>
            </div>
        `;

        return;
    }

    tasks.forEach(task => {

        const taskElement = document.createElement("div");
        taskElement.className = "task";

        taskElement.innerHTML = `
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.description || "No description"}</p>
                <p>
                    Status:
                    ${task.completed ? "Completed" : "Not completed"}
                </p>
                <p class="priority ${task.priority}">
                    Priority: ${task.priority}
                </p>
                <p>
                    Due:
                    ${task.due_date
                        ? new Date(task.due_date).toLocaleString()
                        : "No due date"
                    }
                </p>
            </div>

            <div class="task-actions">
                <button
                    class="edit-button"
                    onclick="editTask(${task.id}, '${task.title.replace(/'/g, "\\'")}')"
                >
                    Edit
                </button>

                <button
                    class="complete-button"
                    onclick="toggleTask(${task.id}, ${task.completed})"
                >
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button
                    class="delete-button"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(taskElement);
    });
}


// ===============================
// ADD TASK
// ===============================

addTaskButton.addEventListener("click", addTask);

async function addTask() {

    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const dueDate = taskDueDateInput.value;
    const priority = taskPriorityInput.value;

    if (!title) {
        taskMessage.textContent = "Please enter a task title.";
        return;
    }

    if (title.length > 200) {
        taskMessage.textContent = "Task title cannot exceed 200 characters.";
        return;
    }

    addTaskButton.disabled = true;
    addTaskButton.textContent = "Adding...";

    try {
        await apiFetch("/tasks/", {
            method: "POST",
            body: JSON.stringify({
                title: title,
                description: description,
                completed: false,
                priority: priority,
                due_date: dueDate || null
            })
        });

        taskTitleInput.value = "";
        taskDescriptionInput.value = "";
        taskDueDateInput.value = "";
        taskPriorityInput.value = "medium";
        taskMessage.textContent = "";

        showToast("Task added!", "success");
        loadTasks();

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
        taskMessage.textContent = error.message;

    } finally {
        addTaskButton.disabled = false;
        addTaskButton.textContent = "Add Task";
    }
}


// ===============================
// PATCH TASK - COMPLETE / UNDO
// ===============================

async function toggleTask(id, currentStatus) {

    const button = event.target;
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "...";

    try {
        await apiFetch(`/tasks/${id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                completed: !currentStatus
            })
        });

        showToast(
            currentStatus ? "Task reopened!" : "Task completed!",
            "success"
        );
        loadTasks();

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
        taskMessage.textContent = error.message;

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}


// ===============================
// EDIT TASK (Modal)
// ===============================

function editTask(id, currentTitle) {

    // 1. Task'ı allTasks'tan bul
    const task = allTasks.find(t => t.id === id);

    if (!task) {
        showToast("Task not found.", "error");
        return;
    }

    // 2. State'e ID'yi kaydet
    editingTaskId = id;

    // 3. Modal input'larını doldur
    editTitle.value = task.title;
    editDescription.value = task.description || "";
    editPriority.value = task.priority || "medium";

    // 4. Due date'i datetime-local formatına çevir
    if (task.due_date) {
        editDueDate.value = task.due_date.slice(0, 16);
    } else {
        editDueDate.value = "";
    }

    // 5. Modal'ı göster
    editModal.style.display = "flex";
}


// ---- Cancel Butonu ----
editCancel.addEventListener("click", () => {
    editModal.style.display = "none";
    editingTaskId = null;
});


// ---- Save Butonu ----
editSave.addEventListener("click", async () => {

    // 1. editingTaskId var mı?
    if (!editingTaskId) return;

    // 2. Input değerlerini al
    const newTitle = editTitle.value.trim();
    const newDescription = editDescription.value.trim();
    const newPriority = editPriority.value;
    const newDueDate = editDueDate.value;

    // 3. Validation
    if (!newTitle) {
        showToast("Title cannot be empty.", "error");
        return;
    }

    if (newTitle.length > 200) {
        showToast("Title cannot exceed 200 characters.", "error");
        return;
    }

    // 4. Loading başlat
    editSave.disabled = true;
    editSave.textContent = "Saving...";

    try {
        // 5. API'ye PATCH isteği at
        await apiFetch(`/tasks/${editingTaskId}/`, {
            method: "PATCH",
            body: JSON.stringify({
                title: newTitle,
                description: newDescription,
                priority: newPriority,
                due_date: newDueDate || null
            })
        });

        // 6. Modal'ı kapat
        editModal.style.display = "none";
        editingTaskId = null;

        // 7. Başarı mesajı + listeyi yenile
        showToast("Task updated!", "success");
        loadTasks();

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");

    } finally {
        // 8. Loading bitir
        editSave.disabled = false;
        editSave.textContent = "Save";
    }
});


// ---- ESC ile Modal'ı Kapat ----
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editModal.style.display === "flex") {
        editModal.style.display = "none";
        editingTaskId = null;
    }
});
// ===============================
// DELETE TASK (Modal)
// ===============================

function deleteTask(id) {
    pendingDeleteId = id;
    deleteModal.style.display = "flex";
}


modalCancel.addEventListener("click", () => {
    deleteModal.style.display = "none";
    pendingDeleteId = null;
});


modalConfirm.addEventListener("click", async () => {

    if (!pendingDeleteId) return;

    modalConfirm.disabled = true;
    modalConfirm.textContent = "Deleting...";

    try {
        await apiFetch(`/tasks/${pendingDeleteId}/`, {
            method: "DELETE"
        });

        deleteModal.style.display = "none";
        pendingDeleteId = null;

        showToast("Task deleted!", "error");
        loadTasks();

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
        taskMessage.textContent = error.message;
        deleteModal.style.display = "none";

    } finally {
        modalConfirm.disabled = false;
        modalConfirm.textContent = "Yes, Delete";
    }
});


// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener("click", logout);

function logout() {

    localStorage.removeItem("token");

    todoSection.style.display = "none";
    loginSection.style.display = "block";
    registerSection.style.display = "block";

    taskList.innerHTML = "";

    usernameInput.value = "";
    passwordInput.value = "";

    loginMessage.textContent = "";
}


// ===============================
// FILTER EVENT LISTENERS
// ===============================

searchInput.addEventListener("input", () => {
    currentFilters.search = searchInput.value.trim();
    applyFilters();
});

filterPriority.addEventListener("change", () => {
    currentFilters.priority = filterPriority.value;
    applyFilters();
});

filterStatus.addEventListener("change", () => {
    currentFilters.status = filterStatus.value;
    applyFilters();
});

clearFiltersButton.addEventListener("click", () => {

    searchInput.value = "";
    filterPriority.value = "";
    filterStatus.value = "";

    currentFilters = {
        search: "",
        priority: "",
        status: ""
    };

    applyFilters();
});


// ===============================
// ESC TO CLOSE MODAL
// ===============================

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && deleteModal.style.display === "flex") {
        deleteModal.style.display = "none";
        pendingDeleteId = null;
    }
});
