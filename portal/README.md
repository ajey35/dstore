# Archivist Central Customer Portal

A modern, production-grade end-user cloud storage web portal for the **Archivist Decentralized Storage Network**, built with Next.js (App Router), Prisma ORM, PostgreSQL, TypeScript, Zod, and Tailwind CSS.

---

## Key Features

- **Authentication & User Accounts**:
  - Secure sign-up, sign-in, session cookies (`jose` JWTs), password hashing with `bcryptjs`.
  - User profile management, password updates, and storage quota tracking.
- **Decentralized Storage Node Layer**:
  - `ArchivistStorageNodeClient` interfaces with `archivist-node` REST API (`http://127.0.0.1:8080/api/archivist/v1`).
  - Raw binary uploads to `/data` with Content-Disposition headers.
  - Direct CID network downloading and media streaming.
- **Storage Management Dashboard**:
  - Storage quota indicator cards, total files, download events, and live node status.
  - Category allocation breakdown bar (Images, Videos, Audio, Documents, Archives).
  - Real-time activity feed of uploads and transfers.
- **Rich File Browser & Media Previews**:
  - Tabular and Grid view toggles.
  - Category filtering and search by file name, MIME type, or CID.
  - **Inline Media Preview Modal** supporting HTML5 Video, HTML5 Audio, Images, and Text/Document previews.
  - Drag-and-drop file upload modal with live progress, speed (MB/s), and ETA calculation.
- **Usage Analytics & Node Network View**:
  - Account bandwidth usage logs.
  - Live P2P peer count, Signed Peer Records (SPR), and multiaddresses monitor.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| ORM | Prisma ORM (v5.22) |
| Database | PostgreSQL |
| Styling | Tailwind CSS |
| Validation | Zod |
| Auth & Encryption | JWT (`jose`), `bcryptjs` |
| Storage Protocol | Archivist Storage Node REST API |

---

## Environment Setup & Database Configuration

Database configuration in `portal/.env`:

```env
DATABASE_URL="postgresql://archivist_user:archivist_pass@localhost:5432/archivist_portal?schema=public"
JWT_SECRET="archivist-central-portal-super-secret-jwt-key-2026"
STORAGE_NODE_URL="http://127.0.0.1:8080/api/archivist/v1"
```

### 1. Installation

```bash
cd portal
npm install
```

### 2. Database Migration & Seed

Once your PostgreSQL database is running at `localhost:5432`:

```bash
npx prisma db push
node dist_seed/seed.js
```

**Seed Credentials**:
- **Customer User**: `user@archivist.network` / `UserPass123!`
- **Administrator**: `admin@archivist.network` / `AdminPass123!`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment

```bash
npm run build
npm start
```
