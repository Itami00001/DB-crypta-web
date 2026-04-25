CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount numeric(20,8) NOT NULL,
    currency_code character varying(255) NOT NULL,
    transaction_type public.enum_transactions_transaction_type NOT NULL,
    status public.enum_transactions_status DEFAULT 'pending'::public.enum_transactions_status,
    fee numeric(20,8) DEFAULT 0,
    transaction_hash character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    from_wallet_id uuid NOT NULL,
    to_wallet_id uuid,

    CONSTRAINT transactions_from_wallet_id_fkey FOREIGN KEY (from_wallet_id) REFERENCES public.crypto_wallets(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT transactions_to_wallet_id_fkey FOREIGN KEY (to_wallet_id) REFERENCES public.crypto_wallets(id) ON UPDATE CASCADE ON DELETE SET NULL

    -- ВАЖНО: для currency_code намеренно НЕ задаем FK на crypto_currencies(symbol),
    -- т.к. в проекте допускаются составные значения (например "USD->RUB").
);
