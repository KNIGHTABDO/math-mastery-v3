-- Migration to add new columns for enhanced post types
-- Run this SQL in your Supabase SQL editor

-- Add new columns to posts table if they don't exist
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
ADD COLUMN IF NOT EXISTS time_limit INTEGER,
ADD COLUMN IF NOT EXISTS questions JSONB;

-- Create an index on the new columns for better performance
CREATE INDEX IF NOT EXISTS idx_posts_video_url ON posts(video_url);
CREATE INDEX IF NOT EXISTS idx_posts_difficulty ON posts(difficulty);
CREATE INDEX IF NOT EXISTS idx_posts_time_limit ON posts(time_limit);

-- Add a comment to describe the new columns
COMMENT ON COLUMN posts.video_url IS 'URL for video posts (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN posts.difficulty IS 'Difficulty level for exercises and quizzes';
COMMENT ON COLUMN posts.time_limit IS 'Time limit in minutes for quizzes';
COMMENT ON COLUMN posts.questions IS 'JSON array of quiz questions with options and correct answers';

-- Example of the questions JSON structure:
-- [
--   {
--     "id": "q1",
--     "question": "What is 2+2?",
--     "options": ["3", "4", "5", "6"],
--     "correctAnswer": 1,
--     "explanation": "2+2 equals 4"
--   }
-- ]
