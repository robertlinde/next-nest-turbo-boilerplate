# 📁 Auth Pages - Next.js App Router (Client Components)

This directory contains all the client-side pages related to authentication in the app.

---

## 📄 Pages Overview

### `login`

- Login flow with conditional UI:
  - Step 1: Credentials
  - Step 2: Two-Factor Authentication
- Handles transition between steps

---

### `register`

- Handles registration of new users.

---

### `confirm`

- Handles email confirmation by token from URL.

---

### `forgot-password`

- Sends a password reset email.

---

### `reset-password`

- Resets user password using token from URL query.

---

## 🔗 API Integration

All pages rely on `useAuthApi()` custom hook for backend interaction.  
This hook abstracts common auth-related API requests like:

- `register`
- `confirm`
- `forgotPassword`
- `resetPassword`
