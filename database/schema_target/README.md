# schema_target (целевая схема по проектированию)

Эта папка содержит **целевую** схему БД в виде отдельных SQL-скриптов.

## Что это такое

- `schema_actual` — «как сейчас в БД» (pg_dump)
- `schema_target` — «как должно быть по проектированию» (курсовая/пояснительная записка)

## Порядок применения

Рекомендуемый порядок запуска в пустой БД:

1. `01_types.sql`
2. `02_users.sql`
3. `03_crypto_wallets.sql`
4. `04_crypto_currencies.sql`
5. `05_transactions.sql`
6. `06_news_posts.sql`
7. `07_comments.sql`
8. `08_likes.sql`
9. `09_user_predictions.sql`
10. `10_chart_points.sql`
11. `99_indexes.sql`

## Как применить через Docker/psql

Из корня проекта (`finance-project`):

1. Создать новую БД (пример):

```bash
docker-compose exec postgresdb psql -U postgres -c "CREATE DATABASE finance_app_db_target;"
```

2. Применить скрипты:

```bash
docker-compose exec -T postgresdb psql -U postgres -d finance_app_db_target < database/schema_target/01_types.sql
```

И повторить для остальных файлов в указанном порядке.

## Принятое проектное решение по transactions.currency_code

В таблице `transactions` поле `currency_code` **намеренно не связано внешним ключом** с `crypto_currencies(symbol)`, потому что в проекте поле может хранить составные значения (например `"USD->RUB"`).

При наличии FK такие значения приведут к ошибке целостности данных.
