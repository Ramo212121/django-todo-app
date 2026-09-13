#  Django Todo App

A full-stack todo application built with **Django REST Framework** and **Vanilla JavaScript**. Features a modern UI with light/dark themes, video backgrounds, and complete authentication.

---

##  Features

###  Authentication
- Token-based authentication (DRF Token)
- User registration & login
- Secure session management
- Auto logout on token expiry

###  Task Management
- Full CRUD (Create, Read, Update, Delete)
- User-specific tasks (each user sees only their own)
- Rich task details: title, description, priority, due date
- Complete / Undo toggle

###  Modern UI/UX
- Apple Reminders inspired design
-  Dark mode with theme toggle
-  Video backgrounds (different for each theme)
-  Fully responsive (mobile, tablet, desktop)
-  Loading states with spinner
- Empty states with helpful messages
- Error states with friendly messages
- Delete confirmation modal
-  Edit modal (better than browser prompt)
-  Toast notifications for all actions

### 🔍 Advanced
- Search by title or description
- Filter by priority (low/medium/high)
- Filter by status (completed/active)
- Clear all filters with one click
- Backend validation (title, priority, description)
- Frontend validation for instant feedback

###  Quality
- 22 backend tests passing
- Environment variables via `.env`
- Clean code structure
- Git version control

---

##  Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Django 6.0** | Web framework |
| **Django REST Framework** | REST API |
| **Token Authentication** | Auth |
| **SQLite** | Database (dev) |
| **python-decouple** | Environment variables |
| **django-cors-headers** | CORS |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **CSS3** | Styling (Flexbox, Grid, Animations) |
| **Vanilla JavaScript** | Logic (no framework) |
| **Fetch API** | HTTP requests |
| **LocalStorage** | Token + theme storage |

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
git clone https://github.com/YOUR_USERNAME/django-todo-app.git
cd django-todo-app
