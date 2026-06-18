# Zelo

A mobile-first web application that connects clients with local service professionals for home maintenance and repair.

---

## About

Zelo was built to address a common everyday problem: finding a reliable professional for home services like electrical work, plumbing, or painting often requires asking around or scrolling through generic listings with no clear way to evaluate who to trust. Zelo centralizes that process into a single app where clients can browse verified service categories, view professional profiles, and initiate a hire request in a few taps.

The application covers the full hiring lifecycle: a client discovers a professional, opens a negotiation chat, confirms the service, and processes payment, all within the same interface. Professionals have their own profiles with service types and experience history. The backend enforces business rules at each step, for example preventing payment on a hire that has not been accepted, or duplicate payments on the same job.

Zelo was developed as a team project in the Software Engineering II course at Universidade Estadual de Londrina (UEL). The course required applying software engineering practices throughout development, including Clean Architecture, use cases modeled as independent units, a test suite covering both unit and integration scenarios, and version control discipline with feature branching.

---

## Screenshots

> Screenshots to be added. The app includes the following screens: Login / Register, Home (service categories + banner), Worker List, Worker Profile, Chat, Payment, Hire History, and Profile.

---

## Tech Stack

**Frontend**
- React 19
- React Router 7
- Vite 8
- Axios

**Backend**
- Node.js with TypeScript
- Fastify 5
- Drizzle ORM
- PostgreSQL 18
- JSON Web Tokens (access token + refresh token)
- bcrypt
- Zod (input validation)
- tsyringe (dependency injection)

**Testing**
- Vitest
- In-memory repository implementations for integration tests

**Infrastructure**
- Docker Compose (database, backend, and frontend in separate containers)

---

## Features

- User registration and login with JWT authentication and automatic token refresh
- Browse available service categories (electrical, painting, plumbing, carpentry, landscaping, and more)
- Search professionals by service type
- View worker profiles with experience history and ratings
- Open a hire request and negotiate terms via in-app chat with image attachments
- Confirm a hire and process payment
- View hire history with status tracking (pending, accepted, completed)
- Edit profile name, phone, and profile photo
- Chat messages and images persisted locally across sessions

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ and Yarn (for local development without Docker)

### Running with Docker

```bash
# Clone the repository
git clone https://github.com/luizazarelli/zelo.git
cd zelo

# Copy and configure environment variables
cp "env (1)" .env
# Edit .env with your preferred values if needed

# Start all services
docker compose up
```

The API will be available at `http://localhost:8000` and the frontend at `http://localhost:5173`.

### Running locally (without Docker)

**Backend**

```bash
cd back-end
yarn install
# Make sure PostgreSQL is running and .env is configured
yarn dev
```

**Frontend**

```bash
cd front-end
npm install
npm run dev
```

### Running tests

```bash
cd back-end
yarn vitest run
```

The test suite includes 50 unit tests and 3 integration tests covering domain entities, use cases, and the hire lifecycle end-to-end.

---

## Project Structure

```
zelo/
├── back-end/
│   ├── src/
│   │   ├── domain/          # Entities, repository interfaces, domain errors
│   │   ├── app/             # Use cases and DTOs
│   │   ├── infra/           # Database connection, Drizzle schema, repository implementations
│   │   └── presentation/    # Fastify controllers and HTTP middleware
│   └── tst/
│       ├── unit/            # Unit tests for entities and use cases
│       ├── integration/     # Integration tests with in-memory repositories
│       └── mocks/           # Shared mock factories
└── front-end/
    └── src/
        ├── pages/           # One folder per screen (auth, home, workers, hire, profile)
        ├── api/             # Axios API client
        ├── context/         # Auth context and session management
        └── components/      # Shared UI components (bottom navigation)
```

The backend follows Clean Architecture with a strict dependency rule: domain has no external dependencies, application depends only on domain, infrastructure implements the domain interfaces, and presentation depends only on application use cases.

---

## Current State

What is working end-to-end:

- Authentication (register, login, token refresh, logout)
- Service category listing
- Worker search by category
- Worker profile view
- Hire creation and status updates
- Chat with text and image attachments
- Payment processing
- Hire history
- Profile editing and photo upload

Known limitations:

- Payment is simulated; there is no integration with a real payment gateway
- Images sent in chat are stored in the browser's localStorage, not on the server
- Worker registration requires a direct API call; there is no in-app flow for professionals to sign up
- Chat is not real-time; messages require a page reload or navigation to refresh from the server
- Ratings shown on worker profiles are demo data and not stored in the database

---

## Team

- Ana Luíza Zarelli Nogueira
- Gustavo Stallman Freire
- Frederico Bonin Krett

---

## Acknowledgments

Developed as part of the Software Engineering II course at Universidade Estadual de Londrina (UEL), Brazil, under the supervision of the course instructor. The project was used to practice software engineering concepts including requirements modeling, architecture design, test-driven development, and collaborative version control.
