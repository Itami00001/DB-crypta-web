# Report

## Wallet logic (merge/split) and SQL joins

### Joins used
- INNER JOIN
- LEFT JOIN / LEFT OUTER JOIN

### Compatibility notes
- PostgreSQL: supports INNER JOIN and LEFT (OUTER) JOIN.
- MySQL: supports INNER JOIN and LEFT (OUTER) JOIN.
- SQLite: supports INNER JOIN and LEFT (OUTER) JOIN.

Notes:
- `LEFT JOIN` and `LEFT OUTER JOIN` are equivalent in PostgreSQL/MySQL/SQLite.
- `RIGHT JOIN` was intentionally not used.

## Confidential user-to-user transfers

### Data model
- `transactions` keeps global/common transactions.
- `user_transfers` is a separate table linked 1:1 with a transaction.

### Privacy rule
- User-to-user transfers are visible only to participants (sender or receiver).
