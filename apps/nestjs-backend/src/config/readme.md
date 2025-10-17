# ⚙️ Config Module

The Config Module serves as a centralized and type-safe configuration layer for the entire application. It ensures all required environment variables are validated, structured, and made accessible to services and modules in a consistent and reliable way.

---

## 🧠 Core Principles

- **Validation-first**: Uses Joi schema validation to enforce correct and complete environment configuration at startup.
- **Environment-aware**: Adjusts required/optional variables based on the current `NODE_ENV` (`development`, `staging`, `production`).
- **Enum-based access**: Prevents typos and magic strings by referencing all config keys via a strongly-typed `ConfigKey` enum.
- **Scoped and structured**: Configuration values are grouped by domain (e.g., Postgres, Mail, JWT) and returned in a normalized shape.

---

## 🧩 How It Works

1. **Defines a `ConfigKey` enum** for all valid config keys.
2. **Loads `.env` values** using NestJS’s `ConfigModule`.
3. **Maps values** to their associated keys via a factory function.
4. **Validates** those values against a comprehensive Joi schema at runtime.
5. **Provides access** to config values throughout the app using `ConfigService.get<>()`.

---

## 🧪 Validation Strategy

- Type constraints: strings, numbers, booleans
- Value constraints: port ranges, enum values
- Conditional rules: e.g., mail credentials are optional in `development` but required otherwise
- Defaults applied where appropriate (e.g., default port, timezone)

---

## 🔒 Environment Sensitivity

The module dynamically alters requirements based on the `NODE_ENV`:

- In `development`, services like email can function with mock values.
- In `production`, all security-sensitive values (e.g., email credentials) are strictly enforced.

---

## 🧱 Config Domains

While no internal knowledge is required to use the module, configuration is logically grouped into:

- **App**: environment, port, frontend host
- **Database**: host, user, password, port, timezone, debug mode
- **Email**: SMTP connection info

---

## ✅ Example Usage

```ts
const port = configService.get<number>(ConfigKey.PORT);
const isDebug = configService.get<boolean>(ConfigKey.POSTGRES_DEBUG_MODE);
```
