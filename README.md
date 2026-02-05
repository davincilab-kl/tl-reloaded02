# Project Structure Guide

This guide explains the folder structure of the `tl-reloaded` project workspace.

## Root Directory (`tl-reloaded-v2`)

The base directory contains the following key areas:

### 1. `tl-reloaded`
> **The Main Project**
> This directory contains the active implementation of the "TalentsLounge Reloaded" platform.
> - **Type**: Monorepo (Turborepo)
> - **Apps**: `web` (Next.js), `api` (NestJS)
> - **Packages**: Shared UI, DB, Configs

### 2. `.cursor/skills/documentation`
> **Project Documentation**
> Reference materials and specifications.
> - **00_Blueprint**: Core architectural decisions.
> - **03_Data_Models**: Database schemas and object definitions.

### 3. `.cursor/skills/example_project`
> **Reference Implementation**
> A sample project or legacy code used for reference during development.

---

## Detailed `tl-reloaded` Structure

Inside the `tl-reloaded` folder, you will find a standard Turborepo structure:

- **`apps/web`**: The Frontend Application (Next.js)
    - `app/dashboard`: Teacher and Student dashboards.
    - `components`: Reusable UI components.
    - `lib`: Utilities and API clients.
- **`apps/api`**: The Backend Application (NestJS)
    - `src/teacher`: Teacher-specific API endpoints.
    - `src/class`: Class management logic.
- **`packages/ui`**: Shared UI component library.
- **`packages/db`**: Prisma ORM and database client.

## Getting Started

To run the project, navigate to the `tl-reloaded` directory and follow the instructions in its [README](./tl-reloaded/README.md).
