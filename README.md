# Jaggu Blogs – MERN + PostgreSQL Blog App

A full-stack blogging platform where users can:

- Register, log in and manage their own posts
- Create, edit and delete blog posts with images
- Browse posts by category on the home page
- View individual post detail pages
- See only their own posts on **Jaggu blogs** (My blogs)
- Change / reset password using email OTP

---

## Tech Stack

**Frontend**

- React (Vite)
- Tailwind CSS
- React Router

**Backend**

- Node.js + Express
- PostgreSQL (`pg` library)
- JSON Web Tokens (JWT) for auth
- Nodemailer + Gmail SMTP for password reset OTP
- Multer (or similar) for image upload (local `/uploads` folder)

---

## Project Structure

```bash
blog-app/
  client/   # React frontend
  server/   # Node/Express API + PostgreSQL
