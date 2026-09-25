# 📰 Blogify — Full-Stack React.js Blogging Platform

**Blogify** is a modern, high-performance, full-stack blogging web application built with **React.js (v19)**, **Vite**, **Express.js**, **MongoDB**, and **Cloudinary**.

The platform allows users to create accounts, publish blog posts with custom cover image uploads, view articles, post comments, edit their own posts/comments, and manage authentication securely.

---

## 🌟 What is the Project?

Blogify was migrated from a server-side EJS application into a clean **Single Page Application (SPA)** with a single React root. It retains 100% of the original visual design, responsive layout, animations, and functionality while upgrading the architecture to modern React state management and REST API integration.

### Core Features
- 🔐 **User Authentication**: Secure Sign Up, Sign In, and Logout powered by JWT tokens stored in HTTP-only cookies.
- 📝 **Blog Management**: Create, view, edit, and delete blog posts with rich content support.
- 🖼️ **Image Cloud Storage**: Upload cover images directly to Cloudinary with Multer file validation (JPEG, PNG, WebP, GIF up to 10MB).
- 💬 **Interactive Comments**: Add, edit, and delete comments on blog posts with live modal editing.
- 🎨 **Responsive UI/UX**: Custom CSS system featuring dark navigation, vibrant gradient footer, card hover micro-animations, and mobile responsiveness.
- ⚡ **Single Page Application**: Fast client-side navigation using React Router v7.

---

## 🏗️ How It Works (Architecture)

```text
┌─────────────────────────────────────────────────────────┐
│                    Single React Root                    │
│                        (main.jsx)                       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                        App.jsx                          │
│                   (AuthProvider Context)                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    React Router v7                      │
│                  (MainLayout Wrapper)                   │
└──────┬──────────────┬──────────────┬──────────────┬─────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
    Home.jsx   BlogDetail.jsx  AddBlog.jsx   Auth Pages
       │              │              │          (SignIn/
       │              │              │           SignUp)
       └──────────────┴──────┬───────┴──────────────┘
                             │
                             ▼ (Fetch / Async API Calls)
┌─────────────────────────────────────────────────────────┐
│                  src/services/api.js                    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼ (REST API Endpoints)
┌─────────────────────────────────────────────────────────┐
│                Express Server (/api/*)                  │
│                     (routes/api.js)                     │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
               ▼                          ▼
       MongoDB Database               Cloudinary
    (Users, Blogs, Comments)        (Image Storage)
```

1. **Frontend (React 18 + Vite)**:
   - Evaluates routes (`/`, `/blog/:id`, `/blog/add-new`, `/blog/edit/:id`, `/user/signin`, `/user/signup`) using React Router DOM.
   - Manages user authentication state globally via `AuthContext.jsx`.
   - Sends asynchronous requests using `src/services/api.js`.

2. **Backend (Express + Node.js)**:
   - Exposes REST API endpoints under `/api/*` defined in `routes/api.js`.
   - Uses `checkForAuthenticationCookie` middleware to authenticate requests.
   - Handles file uploads via Multer and Cloudinary storage.
   - Serves the compiled React production build (`dist/index.html`) as an SPA fallback for non-API routes.

---

## 📦 Dependencies

Here is the complete breakdown of all packages used in the project:

### Frontend Dependencies (React & Router)
| Package | Version | Description |
| :--- | :--- | :--- |
| `react` | `^19.3.0` | Core React library for building component-based user interfaces. |
| `react-dom` | `^19.3.0` | React package for rendering DOM elements. |
| `react-router-dom` | `^7.18.4` | Declarative routing library for React applications. |

### Build Tools & Vite
| Package | Version | Description |
| :--- | :--- | :--- |
| `vite` | `^8.3.1` | Next-generation frontend build tool and development server. |
| `@vitejs/plugin-react` | `^6.1.1` | Official Vite plugin for React support (Fast Refresh, JSX compilation). |

### Backend & Server Dependencies
| Package | Version | Description |
| :--- | :--- | :--- |
| `express` | `^4.18.2` | Web framework for Node.js powering API routes and static asset serving. |
| `mongoose` | `^7.6.0` | Object Data Modeling (ODM) library for MongoDB. |
| `jsonwebtoken` | `^9.0.3` | JSON Web Token implementation for secure user session authentication. |
| `cookie-parser` | `^1.4.7` | Middleware to parse HTTP request cookies. |
| `dotenv` | `^17.4.1` | Loads environment variables from `.env` file into `process.env`. |
| `ejs` | `^3.1.9` | Embedded JavaScript templating engine (retained for legacy fallback). |

### Media Upload & Cloud Storage
| Package | Version | Description |
| :--- | :--- | :--- |
| `cloudinary` | `^1.41.3` | Cloudinary SDK for cloud image management and uploads. |
| `multer` | `^1.4.5-lts.1` | Middleware for handling `multipart/form-data` file uploads. |
| `multer-storage-cloudinary` | `^4.0.0` | Storage engine for Multer to upload files directly to Cloudinary. |

---

## 📁 Folder Structure

```text
Blogify/
├── public/
│   ├── css/
│   │   ├── common.css          # Shared global styling, navbar, footer
│   │   └── pages/
│   │       ├── auth.css        # Authentication page styles
│   │       ├── blog.css        # Blog details & comment section styles
│   │       ├── form.css        # Form inputs, textarea, file upload styles
│   │       └── home.css        # Blog grid & card styles
│   └── images/
├── routes/
│   ├── api.js                  # Express REST API endpoints (/api/*)
│   ├── blog.js                 # Legacy blog routes
│   └── user.js                 # Legacy user routes
├── src/
│   ├── components/
│   │   ├── BlogCard.jsx        # Reusable blog feed card component
│   │   ├── EditCommentModal.jsx# Modal for inline comment editing
│   │   ├── Footer.jsx          # Gradient footer component
│   │   └── Navbar.jsx          # Responsive header navigation
│   ├── context/
│   │   └── AuthContext.jsx     # Global authentication React context
│   ├── layouts/
│   │   └── MainLayout.jsx      # Shared layout wrapper with Outlet
│   ├── pages/
│   │   ├── AddBlog.jsx         # New blog creation page
│   │   ├── BlogDetail.jsx      # Detailed blog view & comments page
│   │   ├── EditBlog.jsx        # Blog update page
│   │   ├── Home.jsx            # All blogs feed page
│   │   ├── SignIn.jsx          # User login page
│   │   └── SignUp.jsx          # User registration page
│   ├── services/
│   │   └── api.js              # Centralized API fetch helper functions
│   ├── App.jsx                 # Main app router component
│   ├── index.css               # Imports all CSS files & base setup
│   └── main.jsx                # Single React root mount point
├── app.js                      # Express server entry point
├── index.html                  # HTML template for React Vite app
├── package.json                # Project dependencies & scripts
├── README.md                   # Project documentation
└── vite.config.mjs             # Vite configuration with proxying setup
```

---

## 🛠️ Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
PORT=8000
MONGO_URL=your_mongodb_connection_string

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🚀 How to Run the Project

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 2. Development Mode
Run the Express backend server and Vite frontend server concurrently:

- **Option A: Run Vite Client (Development with Hot Reload)**
  ```bash
  npm run client
  ```
  *App runs on `http://localhost:5173` with API proxying to port 8000.*

- **Option B: Run Express Backend Server**
  ```bash
  npm run dev
  ```
  *Server runs on `http://localhost:8000`.*

### 3. Production Build & Execution
To build the React application for production and serve it via Express:

1. **Build React App**:
   ```bash
   npm run build
   ```
   *Generates optimized production assets in `dist/`.*

2. **Start Server**:
   ```bash
   npm start
   ```
   *App will be served on `http://localhost:8000`.*

---

## 📡 REST API Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/me` | Fetch currently logged-in user payload | No |
| `POST` | `/api/user/signin` | User login (returns JWT in cookie) | No |
| `POST` | `/api/user/signup` | Register new user account | No |
| `POST` | `/api/user/logout` | Clear auth cookie | Yes |
| `GET` | `/api/blogs` | Fetch all blogs sorted by newest | No |
| `GET` | `/api/blogs/:id` | Fetch single blog details with author & comments | No |
| `POST` | `/api/blogs` | Create a new blog post (multipart file upload) | Yes |
| `POST` | `/api/blogs/edit/:id` | Edit existing blog post | Yes (Author) |
| `POST` | `/api/blogs/delete/:id` | Delete blog post and related comments | Yes (Author) |
| `POST` | `/api/comments/:blogId` | Add a comment to a blog post | Yes |
| `POST` | `/api/comments/update/:commentId` | Update an existing comment | Yes (Author) |
| `POST` | `/api/comments/delete/:commentId` | Delete a comment | Yes (Author) |

---

## 📜 License

This project is open-source and available under the MIT License.
