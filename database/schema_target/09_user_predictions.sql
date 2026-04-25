CREATE TABLE public.user_predictions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    predicted_price numeric(20,8) NOT NULL,
    target_price numeric(20,8) NOT NULL,
    prediction_type public.enum_user_predictions_prediction_type NOT NULL,
    prediction_date timestamp with time zone NOT NULL,
    target_date timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id uuid,
    currency_id uuid,

    CONSTRAINT user_predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT user_predictions_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.crypto_currencies(id) ON UPDATE CASCADE ON DELETE SET NULL
);
