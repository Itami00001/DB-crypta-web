CREATE TABLE public.likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    like_type public.enum_likes_like_type DEFAULT 'like'::public.enum_likes_like_type NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id uuid,
    post_id uuid,

    CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.news_posts(id) ON UPDATE CASCADE ON DELETE SET NULL
);
