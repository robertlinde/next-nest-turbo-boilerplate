# 🧪 NestJS Backend Boilerplate

A modular, scalable NestJS starter template with email integration, environment validation, and clean architecture — ready to serve as the foundation for robust backend applications.

---

## 🚀 Overview

This boilerplate provides a production-ready NestJS setup with key features commonly required in modern server-side applications:

- 📬 **Email Service** with template support
- 🧩 **Environment Configuration** with validation
- 🗂️ Modular, testable, and scalable architecture
- 📁 Opinionated project structure (but flexible)

---

## ✨ Features

- **Email Module**: Template-driven email sending using `@nestjs-modules/mailer`
- **Config Module**: Centralized config with strict schema validation using `Joi`
- **Validation**: Strong request validation via `class-validator`
- **Separation of Concerns**: Each concern lives in its own module
- **Environment Awareness**: Development vs production behaviors clearly separated
- **Clean Logging & Error Handling**: Structured and developer-friendly
- **MikroORM and PostgreSQL**: Strongly integrates MikroORM and PostgreSQL
