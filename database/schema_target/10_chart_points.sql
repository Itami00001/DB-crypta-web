CREATE TABLE public.chart_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol character varying(255) NOT NULL,
    price numeric(20,8) NOT NULL,
    "timestamp" timestamp with time zone,
    note text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id uuid,

    CONSTRAINT chart_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL
);
