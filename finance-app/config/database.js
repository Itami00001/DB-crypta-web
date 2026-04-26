module.exports = {
  // Определяем тип базы данных на основе имени БД
  isUUID: process.env.DB_NAME === 'finance_app_db_uuid',
  
  // Типы данных в зависимости от базы
  getIdType() {
    return this.isUUID ? 'UUID' : 'INTEGER';
  },
  
  // Настройки ID в зависимости от базы
  getIdConfig() {
    if (this.isUUID) {
      return {
        type: 'UUID',
        defaultValue: 'UUIDV4',
        primaryKey: true
      };
    } else {
      return {
        type: 'INTEGER',
        autoIncrement: true,
        primaryKey: true
      };
    }
  },
  
  // Настройки внешних ключей
  getForeignKeyConfig() {
    return {
      type: this.getIdType(),
      allowNull: false
    };
  },
  
  // Имена полей в зависимости от базы
  getFieldMappings() {
    if (this.isUUID) {
      return {
        userId: 'user_id',
        postId: 'post_id',
        authorId: 'author_id',
        fromWalletId: 'from_wallet_id',
        toWalletId: 'to_wallet_id',
        parentCommentId: 'parent_comment_id',
        currencyId: 'currency_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      };
    } else {
      return {};
    }
  }
};
