CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    phone character varying(255),
    is_verified boolean DEFAULT false,
    is_admin boolean DEFAULT false,
    coin_balance numeric(20,8) DEFAULT 0,
    btc_balance numeric(20,8) DEFAULT 0,
    usd_balance numeric(20,2) DEFAULT 0,
    rub_balance numeric(20,2) DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_email_key UNIQUE (email)
);
