CREATE TABLE public.crypto_wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    wallet_address character varying(255) NOT NULL,
    wallet_type character varying(255) NOT NULL,
    coin_balance numeric(20,8) DEFAULT 0,
    btc_balance numeric(20,8) DEFAULT 0,
    usd_balance numeric(20,2) DEFAULT 0,
    rub_balance numeric(20,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT crypto_wallets_wallet_address_key UNIQUE (wallet_address),
    CONSTRAINT crypto_wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
