# Mahaputra Apps

Internal dashboard for Mahaputra Group showroom operations.

The application is built as a Laravel modular monolith with React, TypeScript, Inertia.js, and Tailwind CSS.

## Local Setup

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate

php artisan migrate
```

## Development

```bash
composer run dev
```

## Verification

```bash
php artisan test
npm run build
```

## UAT Demo Data

For local manual UAT, run the deterministic demo seeder after migrations:

```bash
php artisan db:seed --class=UatDemoSeeder
```

Use `admin@mahaputra.local` / `password` or `owner@mahaputra.local` / `password`.

See `docs/UAT_CHECKLIST.md` for the manual UAT flows.

## Documentation

Project requirements and implementation rules are documented in:

* `AGENTS.md`
* `docs/PRD.md`
* `docs/ARCHITECTURE.md`
* `docs/UI_SPEC.md`
