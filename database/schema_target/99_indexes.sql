-- Индексы под реальные выборки приложения

-- Users
-- Для UNIQUE полей (username/email) индексы создаются автоматически через UNIQUE CONSTRAINT.

-- CryptoWallets
CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_wallets_wallet_address ON public.crypto_wallets (wallet_address);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON public.crypto_wallets (user_id);

-- CryptoCurrencies
CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_currencies_symbol ON public.crypto_currencies (symbol);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_from_wallet_id ON public.transactions (from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_wallet_id ON public.transactions (to_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions (created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_currency_code ON public.transactions (currency_code);

-- NewsPosts
CREATE INDEX IF NOT EXISTS idx_news_posts_author_id ON public.news_posts (author_id);
CREATE INDEX IF NOT EXISTS idx_news_posts_created_at ON public.news_posts (created_at);
CREATE INDEX IF NOT EXISTS idx_news_posts_is_published ON public.news_posts (is_published);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON public.comments (parent_comment_id);

-- Likes
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes (user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes (post_id);

-- Защита от дублей: один пользователь может поставить один лайк (реакцию) на один пост.
-- Если нужно разрешить менять реакцию — обновляем строку (update), а не вставляем новую.
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_user_post_unique ON public.likes (user_id, post_id);

-- UserPredictions
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_id ON public.user_predictions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_currency_id ON public.user_predictions (currency_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_target_date ON public.user_predictions (target_date);

-- ChartPoints
CREATE INDEX IF NOT EXISTS idx_chart_points_user_id ON public.chart_points (user_id);
CREATE INDEX IF NOT EXISTS idx_chart_points_symbol ON public.chart_points (symbol);
CREATE INDEX IF NOT EXISTS idx_chart_points_timestamp ON public.chart_points ("timestamp");
CREATE INDEX IF NOT EXISTS idx_chart_points_user_symbol_time ON public.chart_points (user_id, symbol, "timestamp");
