CREATE TABLE public.news_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title character varying(255) NOT NULL,
    content text NOT NULL,
    post_type public.enum_news_posts_post_type DEFAULT 'news'::public.enum_news_posts_post_type,
    category character varying(255),
    is_published boolean DEFAULT false,
    view_count integer DEFAULT 0,
    url text,
    image_url text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    author_id uuid,

    CONSTRAINT news_posts_url_unique UNIQUE (url),
    CONSTRAINT news_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL
);
