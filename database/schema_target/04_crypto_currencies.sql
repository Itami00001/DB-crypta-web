CREATE TABLE public.crypto_currencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    current_price numeric(20,8) DEFAULT 0,
    market_cap numeric(20,2) DEFAULT 0,
    volume24h numeric(20,2) DEFAULT 0,
    icon_url character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT crypto_currencies_symbol_key UNIQUE (symbol)
);
