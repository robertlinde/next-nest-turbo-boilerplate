# 🧪 nest-auth-boilerplate

A modular, scalable NestJS starter template with built-in authentication, email integration, environment validation, and clean architecture — ready to serve as the foundation for robust backend applications.

---

## 🚀 Overview

This boilerplate provides a production-ready NestJS setup with key features commonly required in modern server-side applications:

- 🔐 **Authentication** (JWT-based access & refresh tokens)
- 📬 **Email Service** with template support
- 🧩 **Environment Configuration** with validation
- 🗂️ Modular, testable, and scalable architecture
- 📁 Opinionated project structure (but flexible)

---

## ✨ Features

- **Auth Module**: Login, signup, token refresh, password reset, 2FA (extendable)
- **Users Module**: Creating and managing users
- **Email Module**: Template-driven email sending using `@nestjs-modules/mailer`
- **Config Module**: Centralized config with strict schema validation using `Joi`
- **Validation**: Strong request validation via `class-validator`
- **Separation of Concerns**: Each concern lives in its own module
- **Environment Awareness**: Development vs production behaviors clearly separated
- **Clean Logging & Error Handling**: Structured and developer-friendly
- **MikroORM and PostgreSQL**: Strongly integrates MikroORM and PostgreSQL

---

## 🧪 Getting Started

### 1. Clone the repo or use it as template

- use as GitHub template (recommend) or `git clone https://github.com/robertlinde/nest-auth-boilerplate.git`
- `cd nestjs-auth-boilerplate`

### 2. Install dependencies

- `npm install`

### 3. Setup environment variables

- `cp .env.example .env`
- adjust variables

### 4. Create migrations

- `docker-compose up -d`
- `npm run migration:create`
- `npm run migration:up`

### 5. Run the app

- `npm run start:dev`

## 🤝 Contributing

This template is intended to be forked, adapted, and extended. PRs and discussions are welcome if you use it as a base!

### 📝 License

MIT — feel free to use and adapt.
