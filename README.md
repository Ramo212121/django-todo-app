# 📝 Django Todo App

> 🚀 **[Live Demo](https://django-todo-app-theta.vercel.app)** | 📚 **[API](https://django-todo-app-4o0b.onrender.com/api)** | ⚙️ **[Admin](https://django-todo-app-4o0b.onrender.com/admin)**

A full-stack todo application built with **Django REST Framework** and **Vanilla JavaScript**. Features a modern UI with light/dark themes, video backgrounds, and complete authentication.

---

## ✨ Features

### 🔐 Authentication
- Token-based authentication (DRF Token)
- User registration & login
- Secure session management
- Auto logout on token expiry

### ✅ Task Management
- Full CRUD (Create, Read, Update, Delete)
- User-specific tasks (each user sees only their own)
- Rich task details: title, description, priority, due date
- Complete / Undo toggle

### 🎨 Modern UI/UX
- Apple Reminders inspired design
- 🌙 Dark mode with theme toggle
- 🎬 Video backgrounds (different for each theme)
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Loading states with spinner
- 📭 Empty states with helpful messages
- ⚠️ Error states with friendly messages
- 🗑️ Delete confirmation modal
- ✏️ Edit modal (better than browser prompt)
- 🍞 Toast notifications for all actions

### 🔍 Advanced
- Search by title or description
- Filter by priority (low/medium/high)
- Filter by status (completed/active)
- Clear all filters with one click
- Backend validation (title, priority, description)
- Frontend validation for instant feedback

### 🧪 Quality
- 22 backend tests passing
- Environment variables via `.env`
- Clean code structure
- Git version control

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Django 6.0** | Web framework |
| **Django REST Framework** | REST API |
| **Token Authentication** | Auth |
| **PostgreSQL** | Database (production) |
| **python-decouple** | Environment variables |
| **django-cors-headers** | CORS |
| **Whitenoise** | Static files |
| **Gunicorn** | WSGI server |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **CSS3** | Styling (Flexbox, Grid, Animations) |
| **Vanilla JavaScript** | Logic (no framework) |
| **Fetch API** | HTTP requests |
| **LocalStorage** | Token + theme storage |

---

## 🚀 Live Demo

- **Frontend:** [https://django-todo-app-theta.vercel.app](https://django-todo-app-theta.vercel.app)
- **Backend API:** [https://django-todo-app-4o0b.onrender.com/api](https://django-todo-app-4o0b.onrender.com/api)
- **Admin Panel:** [https://django-todo-app-4o0b.onrender.com/admin](https://django-todo-app-4o0b.onrender.com/admin)

---

## 📸 Screenshots

### 🔐 Login Screen
![Login](screenshots/login.png)

### 📝 Task List
![Tasks](screenshots/tasks.png)

### ✏️ Edit Modal
![Edit Modal](screenshots/edit-modal.png)

### 🌙 Dark Mode
![Dark Mode](screenshots/dark-mode.png)

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Ramo212121/django-todo-app.git
cd django-todo-app




django-todo-app/
├── Myprojects/
│   └── todo-app/
│       ├── backend/
│       │   ├── config/
│       │   │   ├── settings.py
│       │   │   ├── urls.py
│       │   │   └── wsgi.py
│       │   ├── tasks/
│       │   │   ├── models.py
│       │   │   ├── serializers.py
│       │   │   ├── views.py
│       │   │   ├── urls.py
│       │   │   └── tests.py
│       │   ├── manage.py
│       │   ├── requirements.txt
│       │   ├── Procfile
│       │   └── runtime.txt
│       └── frontend/
│           ├── index.html
│           ├── script.js
│           ├── style.css
│           ├── background.mp4
│           └── background2.mp4
└── README.md


