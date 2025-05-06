# 🛡️ NestJS Auth Module

A robust, secure authentication module for NestJS applications that supports:

- Credential-based login
- Two-factor authentication (2FA) via email
- JWT-based session management using secure HTTP-only cookies
- Refresh token rotation with revocation tracking
- Route-level public access control

---

## 📦 What This Module Does

This `AuthModule` provides a two-step authentication flow using email + password credentials and a time-limited 2FA code sent to the user's email. Tokens are stored in HTTP-only cookies for better security against XSS. It also includes token refresh and logout endpoints, and guards to protect private routes.

---

## 🔁 Authentication Flow

### 1. Login with Credentials

**Endpoint:** `POST /auth/login/credentials`  
**Input:** `{ email, password }`  
**Output:** Sets a temporary `two_factor_auth` cookie  
**Behavior:**

- Verifies credentials
- Checks user status
- Generates a 6-digit 2FA code
- Stores it (temporarily) in the database
- Sends the code via email
- Hashes the 2FA token and returns it as a cookie

### 2. Submit 2FA Code

**Endpoint:** `POST /auth/login/2fa`  
**Input:** `{ code }` + `two_factor_auth` cookie  
**Output:** Sets `access_token` and `refresh_token` cookies  
**Behavior:**

- Verifies 2FA code matches and is not expired
- Issues short-lived access token (`15m`)
- Issues long-lived refresh token (`7d`)
- Sets both as secure HTTP-only cookies

### 3. Refresh Tokens

**Endpoint:** `POST /auth/refresh`  
**Input:** `refresh_token` cookie  
**Output:** Replaces `access_token` and `refresh_token` cookies  
**Behavior:**

- Validates the refresh token
- Ensures it's not revoked
- Revokes the old token
- Issues new access and refresh tokens

### 4. Logout

**Endpoint:** `POST /auth/logout`  
**Behavior:**

- Clears `access_token` and `refresh_token` cookies

---

## ⚙️ How It Works

### Cookies

| Cookie            | Purpose                    | Expiry     |
| ----------------- | -------------------------- | ---------- |
| `two_factor_auth` | Stores hashed 2FA token ID | 15 minutes |
| `access_token`    | Authenticates API requests | 15 minutes |
| `refresh_token`   | Refreshes access token     | 7 days     |

All cookies are:

- HTTP-only
- `secure` in production
- `sameSite: 'lax'`

---

### AuthService Responsibilities

- `validateUserCredentials`: Validates email/password and issues 2FA code
- `validateTwoFactorAuth`: Validates code + token from cookie
- `generateAccessToken` / `generateRefreshToken`: Signs JWTs
- `refreshTokens`: Handles token rotation and revocation

### Security Measures

- Refresh tokens are revoked on reuse
- Revoked tokens stored in DB for 7 days
- Expired 2FA and revoked tokens cleaned every hour via `@Cron`

---

## 🔐 Guards & Decorators

- `@Public()`: Marks route as publicly accessible (bypasses JWT guard)
- `JwtAuthGuard`: Applies JWT validation using cookies
- `@User()`: Extracts current user from JWT payload
