# Film API — backend

NestJS API для афиши фильмов и бронирования билетов (PostgreSQL + TypeORM).

## Требования

- Node.js >= 18
- PostgreSQL (локально или в Docker)
- npm

## Установка и запуск

```bash
npm ci
```

Создать `.env` из `.env.example`:

Заполнить параметры подключения к PostgreSQL:

| Переменная | Описание | Пример |
|---|---|---|
| `DATABASE_DRIVER` | Тип драйвера (всегда `postgres`) | `postgres` |
| `DATABASE_URL` | Адрес подключения | `postgres://localhost:5432/films` |
| `DATABASE_USERNAME` | Пользователь БД | `postgres` |
| `DATABASE_PASSWORD` | Пароль | — |
| `PORT` | Порт сервера | `3000` |
| `CORS_ORIGIN` | Разрешённый источник CORS | `*` |

PostgreSQL должна быть установлена и запущена.

Запустить:

```bash
npm run start:debug
```

Сервер будет доступен на `http://localhost:3000/api/afisha`.

## Команды

| Команда | Описание |
|---|---|
| `npm run start:debug` | Dev-сервер (watch + debug) |
| `npm run lint` | ESLint + Prettier |

## Структура

```
src/
├── films/          # Контроллер и сервис для /films
├── order/          # Контроллер и сервис для /order
└── repository/     # Entities, FilmsRepository (интерфейс), RepositoryService (TypeORM)
    ├── entities/
    │   ├── film.entity.ts
    │   └── schedule.entity.ts
    ├── films-repository.interface.ts
    └── repository.service.ts
```

## API

Спецификация OpenAPI — `film.yml` в корне проекта.

Postman-коллекция — `film.postman.json` в корне проекта.
