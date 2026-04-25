CREATE TYPE public.enum_likes_like_type AS ENUM (
    'like',
    'dislike',
    'love'
);

CREATE TYPE public.enum_news_posts_post_type AS ENUM (
    'news',
    'prediction',
    'analysis',
    'announcement'
);

CREATE TYPE public.enum_transactions_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'cancelled'
);

CREATE TYPE public.enum_transactions_transaction_type AS ENUM (
    'transfer',
    'buy',
    'sell',
    'deposit',
    'withdraw',
    'exchange'
);

CREATE TYPE public.enum_user_predictions_prediction_type AS ENUM (
    'bullish',
    'bearish',
    'neutral'
);
