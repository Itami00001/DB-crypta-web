# schema_actual (фактическая схема из текущей БД)

Эта папка содержит **фактическую** схему БД, полученную из работающего PostgreSQL контейнера через `pg_dump --schema-only`.

## Файлы

- `pg_dump_schema.sql` — дамп схемы (типы ENUM, таблицы, ограничения, индексы, FK)

## Как получить файл заново (если схема изменилась)

Из корня проекта (`finance-project`) выполнить:

```bash
docker-compose exec postgresdb pg_dump -U postgres -d finance_app_db --schema-only --no-owner --no-privileges > database/schema_actual/pg_dump_schema.sql
```

## Как применить дамп (в новую пустую БД)

1. Создай новую БД (пример):

```bash
docker-compose exec postgresdb psql -U postgres -c "CREATE DATABASE finance_app_db_copy;"
```

2. Примени дамп:

```bash
docker-compose exec -T postgresdb psql -U postgres -d finance_app_db_copy < database/schema_actual/pg_dump_schema.sql
```

## Проверка в pgAdmin

- Servers -> (твой сервер) -> Databases -> `finance_app_db` -> Schemas -> public -> Tables

Там должны быть таблицы:
- chart_points
- comments
- crypto_currencies
- crypto_wallets
- likes
- news_posts
- transactions
- user_predictions
- users
