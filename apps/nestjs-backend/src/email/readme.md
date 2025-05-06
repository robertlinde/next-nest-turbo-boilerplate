# ✉️ Email Module

The Email Module provides an environment-aware, template-based system for dispatching transactional emails through SMTP. It acts as a centralized, injectable service layer for all mail-related operations across the application.

---

## ⚙️ Design Overview

- **SMTP-backed** via `@nestjs-modules/mailer`, using environment-provided credentials and connection settings.
- **Templated rendering** with Handlebars for dynamic content injection and HTML layout consistency.
- **Environment-sensitive** behavior:
  - In `development`, no actual emails are sent — messages are logged for developer visibility.
  - In other environments (e.g. `production`, `staging`), mail is dispatched through the configured SMTP transport.

---

## 🧱 Architecture

- Registered as a NestJS module with injectable `EmailService`.
- Integrates with `ConfigService` to dynamically respond to runtime environment configuration.
- Tightly decoupled from domain logic; accepts minimal parameters (e.g. recipient, context) and handles formatting/delivery internally.

---

## 🪄 Template System

- Templates are stored in a dedicated `templates/` directory.
- Uses Handlebars for logic-less rendering with runtime-provided context.
- Ensures a consistent brand and UX across all email types.
- Strict mode enabled to catch undefined variables at render time.

---

## 🔐 Security & Reliability

- Never sends real mail in non-production environments — prevents accidental leaks or testing mishaps.
- SMTP credentials and configuration are environment-specific, loaded securely at runtime.
- Supports all modern email best practices: clean HTML output, subject-based classification, tokenized links for verification or auth flows.

---

## 🧩 Integration Strategy

- Any feature requiring email simply injects `EmailService` and invokes the relevant method.
- No need to handle SMTP, templating, or logging logic in feature modules.
- Encourages **separation of concerns**: features define _intent_, the email service handles _delivery_.
