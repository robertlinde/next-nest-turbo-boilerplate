# 🔐 Fullstack Auth Turborepo

This monorepo provides a modern fullstack authentication boilerplate using **Next.js** for the frontend and **NestJS** for the backend — organized and managed with **Turborepo**.

It’s designed for scalability, type safety, and developer experience — ideal as a base for full-featured auth-driven applications.

---

## 1. 📦 Getting Started

### 1. Use as Template or Clone

Use this repo as a GitHub template (recommended), or clone it directly:

- `git clone https://github.com/robertlinde/next-nest-turbo-auth-boilerplate.git`
- `cd next-nest-turbo-auth-boilerplate`

### 2. Build shared package

Build the shared package so it can be installed as dependency for the apps:

- `cd packages/shared`
- `npm install`
- `npm run build`

### 3. Install Dependencies

Install root-level dependencies (workspace-based):

- `npm install`

This will install dependencies for all apps using Turborepo's workspace management.

### 4. Setup Environment Variables

Each app has its own .env.example. Copy and configure them:

- `cp apps/nextjs-frontend/.env.example apps/nextjs-frontend/.env`
- `cp apps/nestjs-backend/.env.example apps/nestjs-backend/.env`

Then fill in the required environment variables based on your setup (e.g., database credentials, JWT secrets, email service configs).

### 5. Start the Backend

Start the database container and apply migrations:

- `cd apps/nestjs-backend`
- `docker-compose up -d`
- `npm run migration:create`
- `npm run migration:up`

### 6. Start dev mode

At the root of your project, run:

- `npm run start:dev`

Your app should now be running with both frontend and backend services in development mode.

---

## 2. ⚙️ Base Tech Used

### 🖥 Frontend (`apps/frontend`)

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS** + **PrimeReact**
- **Zustand**
- **React Hook Form** + **Joi**
- **React Query**
- **next-intl** (i18n)

➡️ More in [apps/nextjs-frontend/README.md](./apps/nextjs-frontend/README.md)

### 🛠 Backend (`apps/backend`)

- **NestJS**
- **TypeScript**
- **JWT Auth**
- **MikroORM** + **PostgreSQL**
- **Templated email service**
- **class-validator**

➡️ More in [apps/nestjs-backend/README.md](./apps/nestjs-backend/README.md)

### 📦 Shared (`packages/shared`)

- **TypeScript**
- **class-validator**
- Shared types & DTOs between frontend and backend
- Type-safe API contracts

➡️ More in [packages/shared/README.md](./packages/shared/README.md)

---

## 3. 🤝 Contributing

This repo is intended to be cloned, extended, and customized. Feel free to open issues or submit PRs if you're improving the base or adapting it.

---

## 4. 📝 License

MIT — free to use, modify, and distribute.

➡️ More in [LICENSE](./LICENSE)
