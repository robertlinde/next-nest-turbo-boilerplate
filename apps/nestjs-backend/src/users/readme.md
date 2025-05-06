# 👤 Users Module

The Users Module handles the full user lifecycle: registration, email confirmation, password resets, account updates, and deletion. It integrates securely with authentication, email delivery, and cryptographic utilities.

---

## 🚀 Key Capabilities

- **User Registration**: Accepts email, username, and password. Sends confirmation email with secure token.
- **Email Confirmation**: Confirms account via token within 24 hours.
- **Password Reset**: Request + confirm flow using time-limited secure tokens.
- **Profile Update**: Authenticated users can update email, password, and username.
- **Account Deletion**: Users can delete their account entirely.
- **Rate Limiting**: All public endpoints are guarded with conservative IP-based throttling.
- **Inactive Cleanup**: Expired unconfirmed accounts are cleaned up hourly via a scheduled task.

---

## 🔐 Authenticated Endpoints

### `GET /users/me`

Returns current user's ID, email, and username.

### `PATCH /users`

Updates authenticated user's email, username, or password.

- Only fields provided will be updated.
- Password is hashed before storage.

### `DELETE /users`

Permanently deletes the authenticated user’s account.

---

## 🌐 Public Endpoints

### `POST /users`

Creates a new user.

- Requires `email`, `username`, and `strong password`
- Sends confirmation email with tokenized link

### `POST /users/confirm/:confirmationCode`

Activates user via email confirmation token.

- Token expires after **24 hours**
- Expired users are deleted upon attempt

### `POST /users/reset-password/request`

Sends a password reset email if the user exists.

- Response always silent (to prevent user enumeration)

### `POST /users/reset-password/confirm`

Resets password with provided token and new password.

- Token expires after **2 hours**
- Token is invalidated after use
- Rate-limited: **3 requests / 15 min / IP**

---

## 🛡 Security Measures

- **No user enumeration** during password reset requests.
- **Base64url tokens** used to avoid URL encoding issues.
- **Hashed passwords and tokens** using `CryptoService`.
- **Rate limiting** applied per endpoint via `@nestjs/throttler`.
- **Token expiration logic** is time-based, not guessable.

---

## 🔁 Automation

A scheduled job runs **hourly** to:

- Delete any user accounts that:
  - Are still in `CONFIRMATION_PENDING` status
  - Were created over **24 hours ago**
