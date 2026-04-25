# Транзакции: уровни изоляции и блокировки

## Обзор

В финансовой системе критически важна целостность данных при параллельных операциях с балансами пользователей. Для предотвращения аномалий (lost update, non-repeatable read, phantom read, serialization anomaly) применяются строгие уровни изоляции и блокировки.

## Конкурентные сценарии

### 1. Перевод между пользователями (`transferBetweenUsers`)
- **Конкурентные записи:** Балансы отправителя и получателя могут изменяться одновременно несколькими транзакциями.
- **Риск:** Lost update (потеря обновления) при одновременном списании/зачислении.

### 2. Обмен валют (`exchangeCurrency`)
- **Конкурентные записи:** Балансы пользователя в разных валютах могут изменяться одновременно.
- **Риск:** Непоследовательное состояние балансов при параллельных обменах.

## Выбранные уровни изоляции

### SERIALIZABLE
```javascript
const transaction = await db.sequelize.transaction({
  isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
});
```

**Почему SERIALIZABLE:**
- **Максимальная изоляция:** Полностью предотвращает все аномалии (dirty read, non-repeatable read, phantom read, serialization anomaly).
- **Гарантия целостности:** Финансовые операции требуют абсолютной согласованности данных.
- **Подходит для:** Критически важных операций с деньгами, где потеря обновления недопустима.

## Типы блокировок

### Row-level lock (UPDATE)
```javascript
const fromUser = await User.findByPk(fromUserId, { 
  transaction,
  lock: transaction.LOCK.UPDATE 
});
```

**Почему UPDATE lock:**
- **Эксклюзивный доступ:** Гарантирует, что ни одна другая транзакция не изменит заблокированную строку до завершения текущей.
- **Предотвращение lost update:** Обеспечивает атомарное обновление балансов.
- **Минимальная блокировка:** Блокирует только конкретные строки, а не всю таблицу.

## Предотвращаемые аномалии

| Аномалия | Как предотвращается |
|----------|-------------------|
| **Lost Update** | SERIALIZABLE + UPDATE lock на балансы |
| **Non-repeatable Read** | SERIALIZABLE (чтение в рамках одной транзакции всегда консистентно) |
| **Phantom Read** | SERIALIZABLE (новые строки не появятся в диапазоне) |
| **Serialization Anomaly** | SERIALIZABLE (полная сериализация транзакций) |

## Обработка ошибок сериализации

При уровне SERIALIZABLE возможны ошибки `could not serialize access due to concurrent update`. В текущей реализации они обрабатываются через rollback с сообщением об ошибке. Для продакшена рекомендуется добавить retry-логику:

```javascript
const maxRetries = 3;
let retryCount = 0;

while (retryCount < maxRetries) {
  try {
    // ... транзакция ...
    await transaction.commit();
    break; // успех
  } catch (err) {
    if (err.message.includes('could not serialize')) {
      retryCount++;
      await transaction.rollback();
      // небольшая задержка перед повтором
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      throw err; // другая ошибка
    }
  }
}
```

## Вывод

Выбор **SERIALIZABLE + UPDATE lock** обеспечивает максимальную защиту данных в финансовых операциях, что соответствует требованиям курсовой работы и лучшим практикам для систем учета финансов.
