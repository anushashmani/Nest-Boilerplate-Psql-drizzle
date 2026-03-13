# 🚀 NestJS Enterprise Boilerplate

A professional, production-ready NestJS boilerplate designed for scalability, security, and developer efficiency. Featuring **Drizzle ORM**, **PostgreSQL**, **JWT Authentication**, and a premium **Monkey UI** landing page.

---

## 🏗️ Project Architecture

The project follows a modular architecture designed to separate concerns and ensure maintainability.

```text
src/
├── common/             # Cross-cutting concerns (Interceptors, Filters, Pipes)
├── config/             # Environment-aware application configuration
├── database/           # Schema definitions and database-related scripts
├── modules/            # Domain-specific feature modules (Users, Auth)
├── shared/             # Global modules (Database, Logger)
└── main.ts             # Application bootstrap and global setup
```

---

## 📂 File-by-File Technical Deep Dive

### 🌐 Core Files

#### `src/main.ts`
The application entry point. 
- **What it does:** Initializes the NestJS app instance using the `Express` platform.
- **Key Logic:**
    - `app.setGlobalPrefix('api', { exclude: ['/'] })`: Sets a global `/api` prefix for all controllers except the root route to allow our landing page to live at `/`.
    - `app.useStaticAssets(...)`: Enables the application to serve files from the `public` folder (images, HTML).
    - `SwaggerModule`: Configures the interactive API documentation available at `/docs`.
    - `app.useGlobalPipes(new ValidationPipe(...))`: Ensures every incoming request is automatically validated against DTOs.
- **Benefit:** Provides a standardized, secure, and documented environment for all APIs.

#### `src/app.module.ts`
The root module of the application.
- **What it does:** Orchestrates the entire application by importing all necessary feature and global modules.
- **Key Logic:** Uses `ConfigModule.forRoot` for environment variables and imports `DatabaseModule`, `UsersModule`, and `AuthModule`.
- **Benefit:** Acts as the "glue" that connects database connectivity, configuration, and business logic.

#### `src/app.controller.ts`
Handles the primary entry route.
- **What it does:** Specifically serves the `index.html` file at the root route (`/`).
- **Benefit:** Overrides the default "Hello World" to provide a premium **Monkey UI** landing page for visitors.

---

### 🛡️ Common & Shared Layer

#### `src/common/filters/http-exception.filter.ts`
The global error handler.
- **Logic:** Catches every exception. Returns a standardized JSON error format:
  ```json
  {
    "status": "error",
    "message": "Error description"
  }
  ```
- **Special Case:** If a 404 occurs on a non-API route, it serves the `monkey.jpg` image fallback.

#### `src/common/interceptors/transform.interceptor.ts`
The response formatter.
- **Logic:** Maps every successful response to a premium standardized format:
  ```json
  {
    "status": "success",
    "data": { ... },
    "message": "Request processed successfully"
  }
  ```

#### `src/common/pipes/validation.pipe.ts`
The data gatekeeper.
- **Logic:** Uses `class-validator` to check every request body. It strips out properties that aren't defined in your DTOs (security) and transforms types (e.g., string to number).
- **Benefit:** Guarantees that only "clean" and valid data reaches your services.

#### `src/common/guards/roles.guard.ts`
**Authorization Guard.**
- **Logic:** Works alongside the `Roles` decorator. It retrieves the required roles from the route's metadata and checks if the authenticated user (attached to the request) possesses at least one of those roles.
- **Benefit:** Provides granular access control. For example, you can restrict sensitive admin routes using `@Roles('admin')`.

#### `src/modules/auth/guards/jwt-auth.guard.ts`
**Authentication Guard.**
- **Logic:** Uses the Passport JWT strategy to verify the bearer token in the `Authorization` header. If valid, it allows the request and attaches the user profile to `request.user`.
- **Benefit:** Secures routes from unauthenticated access.

---

### 💾 Database & Configuration

#### `src/database/schema.ts`
The database source of truth.
- **Content:** Defines the `users` table using Drizzle's `pgTable`. Includes `serial` IDs, `unique` emails, and automatic `timestamps`.
- **Benefit:** Provides 100% type safety for your database queries. No more "typo in column name" errors.

#### `src/shared/database/database.module.ts`
The database provider.
- **Logic:** Initializes a Connection Pool using `pg` and connects the **Drizzle ORM** instance. It exports the `DRIZZLE` token for dependency injection.
- **Benefit:** Manages database connections globally. Any service can simply `Inject(DRIZZLE)` to start querying.

#### `src/config/configuration.ts` & `database.config.ts`
- **Logic:** Standardizes environment variable extraction (e.g., mapping `process.env.PORT` to `config.port`).
- **Benefit:** Prevents `process.env` calls from being scattered everywhere, making the app easier to test and configure.

---

### 🔑 Auth & Feature Modules

#### `src/modules/auth/auth.service.ts`
The business brain of security.
- **Logic:** Handles `register` (hashing passwords with Bcrypt) and `login` (validating credentials and generating JWT tokens).
- **Benefit:** Centralizes all sensitive security logic in one verified place.

#### `src/modules/auth/strategies/jwt.strategy.ts`
The token validator.
- **Logic:** Passport-based strategy that decodes the Bearer token, extracts the user ID, and verifies that the user still exists in the database.
- **Benefit:** Seamlessly handles stateless authentication across all protected modules.

#### `src/modules/users/users.service.ts`
- **Logic:** Contains the actual Drizzle SQL queries for `create`, `find`, `update`, and `delete`.
- **Benefit:** Keeps the controller clean and ensures the database logic is reusable.

---

### 🎨 Frontend & Assets

#### `public/index.html` (**Monkey UI**)
- **Content:** A high-end landing page with modern CSS (Inter font, NestJS branding, glassmorphism).
- **Benefit:** Gives the project a professional look immediately upon installation.

#### `public/assets/monkey.jpg`
- **Purpose:** Served by the `HttpExceptionFilter` as the custom 404 fallback.

---

## 🛠️ Useful NestJS CLI Commands

Mastering the CLI will significantly speed up your development workflow. All commands should be run from the project root.

### 1. Generating Code
NestJS CLI helps you maintain the project structure automatically.

- **Generate a Module:**
  ```bash
  npx nest g mo modules/feature-name
  ```
  *When to use:* Your first step when creating a new feature. It creates the module folder and registers it in `app.module.ts`.

- **Generate a Controller:**
  ```bash
  npx nest g co modules/feature-name --no-spec
  ```
  *When to use:* To handle incoming HTTP requests. `--no-spec` skips test file generation (optional).

- **Generate a Service:**
  ```bash
  npx nest g s modules/feature-name --no-spec
  ```
  *When to use:* To handle business logic and database interactions.

- **Generate a Full Resource (CRUD):**
  ```bash
  npx nest g res modules/feature-name --no-spec
  ```
  *When to use:* Generates module, service, controller, and DTOs in one go.

### 2. Running & Building
- **Development (Watch Mode):**
  ```bash
  npm run start:dev
  ```
  *When to use:* During active development. It reloads the server automatically on every file change.

- **Production Build:**
  ```bash
  npm run build
  ```
  *When to use:* Before deploying to production. Compiles TypeScript to optimized JavaScript in the `dist` folder.

- **Production Run:**
  ```bash
  npm run start:prod
  ```
  *When to use:* To run the compiled application in a production environment.

### 3. Testing
- **Run Unit Tests:**
  ```bash
  npm run test
  ```
  *When to use:* To verify the logic of individual services or controllers.

- **Run E2E Tests:**
  ```bash
  npm run test:e2e
  ```
  *When to use:* To verify the entire application flow (from request to database).

### 4. Database (Drizzle ORM)
Drizzle doesn't use the Nest CLI, but we've integrated powerful scripts in `package.json`.

- **Schema Push:**
  ```bash
  npm run db:push
  ```
  *When to use:* Best for rapid development. It syncs your `schema.ts` directly with the database without creating migration files.

- **Generate Migration:**
  ```bash
  npm run db:generate
  ```
  *When to use:* When you need to track schema changes. It creates a physical SQL file in `src/database/migrations`.

- **Run Migrations:**
  ```bash
  npm run db:migrate
  ```
  *When to use:* To apply saved migration files to a remote or production database.

- **Drizzle Studio:**
  ```bash
  npm run db:studio
  ```
  *When to use:* When you want a visual browser interface to explore and edit your PostgreSQL data.

---

## 🚀 Getting Started

1. **Install:** `npm install`
2. **Environment:** `cp .env.example .env` (Add your PSQL URL and `JWT_SECRET`)
3. **Database:** `npm run db:push`
4. **Run:** `npm run start:dev`

---

## 📜 Key Scripts

- `db:push`: Instant schema sync (best for development).
- `db:generate`: Create SQL migration files.
- `db:studio`: Opens Drizzle's GUI for database browsing.