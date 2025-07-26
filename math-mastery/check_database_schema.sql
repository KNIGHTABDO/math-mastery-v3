-- Check if the new columns exist in the posts table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if we can see some sample posts
SELECT id, titre, type, video_url, difficulty, time_limit, questions 
FROM posts 
LIMIT 5;
