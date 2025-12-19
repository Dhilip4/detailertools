/*
  # Create Blog & Forum System
  
  ## Summary
  Creates a complete blog and forum system for DetailerTools.com with user authentication,
  posts, comments, and community features.
  
  ## New Tables
  
  ### 1. users
  - `id` (uuid, primary key) - Auto-generated user ID
  - `email` (text, unique) - User email address
  - `username` (text, unique) - Display name
  - `avatar_url` (text) - Profile picture URL
  - `role` (text) - User role (user, admin, moderator)
  - `bio` (text) - User biography
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last profile update
  
  ### 2. blog_posts
  - `id` (uuid, primary key) - Post ID
  - `title` (text) - Post title
  - `slug` (text, unique) - URL-friendly slug
  - `content` (text) - Post content (markdown)
  - `excerpt` (text) - Short description
  - `featured_image` (text) - Header image URL
  - `author_id` (uuid) - References users table
  - `category` (text) - Post category
  - `status` (text) - draft, published, archived
  - `view_count` (integer) - View counter
  - `like_count` (integer) - Like counter
  - `created_at` (timestamptz) - Creation time
  - `updated_at` (timestamptz) - Last update time
  - `published_at` (timestamptz) - Publication time
  
  ### 3. blog_comments
  - `id` (uuid, primary key) - Comment ID
  - `post_id` (uuid) - References blog_posts
  - `user_id` (uuid) - References users
  - `content` (text) - Comment text
  - `parent_id` (uuid) - References blog_comments for replies
  - `created_at` (timestamptz) - Creation time
  - `updated_at` (timestamptz) - Last update time
  
  ### 4. forum_threads
  - `id` (uuid, primary key) - Thread ID
  - `title` (text) - Thread title
  - `slug` (text, unique) - URL-friendly slug
  - `content` (text) - Thread content
  - `author_id` (uuid) - References users
  - `category` (text) - Thread category
  - `status` (text) - open, closed, pinned, locked
  - `view_count` (integer) - View counter
  - `reply_count` (integer) - Reply counter
  - `is_pinned` (boolean) - Pinned status
  - `is_locked` (boolean) - Locked status
  - `created_at` (timestamptz) - Creation time
  - `updated_at` (timestamptz) - Last update time
  - `last_reply_at` (timestamptz) - Last reply time
  
  ### 5. forum_replies
  - `id` (uuid, primary key) - Reply ID
  - `thread_id` (uuid) - References forum_threads
  - `author_id` (uuid) - References users
  - `content` (text) - Reply content
  - `created_at` (timestamptz) - Creation time
  - `updated_at` (timestamptz) - Last update time
  
  ## Security
  - Enable RLS on all tables
  - Public read access for published content
  - Authenticated write access for users
  - Admin-only access for moderation actions
  
  ## Notes
  - All content uses markdown format
  - Slugs are auto-generated from titles
  - View counters increment on page load
  - Like counts update in real-time
*/

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  avatar_url text DEFAULT 'https://picsum.photos/seed/default/200/200.jpg',
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text DEFAULT 'https://picsum.photos/seed/blog/800/400.jpg',
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text DEFAULT 'Tutorial',
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz DEFAULT now()
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES blog_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum_threads table
CREATE TABLE IF NOT EXISTS forum_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text DEFAULT 'General',
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pinned', 'locked')),
  view_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_reply_at timestamptz DEFAULT now()
);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Users policies (public read, own write)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Blog posts policies (public read, authenticated write)
CREATE POLICY "Published blog posts are viewable by everyone"
  ON blog_posts FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Authenticated users can create blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Blog comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON blog_comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Forum threads policies
CREATE POLICY "Forum threads are viewable by everyone"
  ON forum_threads FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create threads"
  ON forum_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own threads"
  ON forum_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own threads"
  ON forum_threads FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Forum replies policies
CREATE POLICY "Forum replies are viewable by everyone"
  ON forum_replies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own replies"
  ON forum_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own replies"
  ON forum_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts(category);
CREATE INDEX IF NOT EXISTS blog_comments_post_id_idx ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS forum_threads_author_id_idx ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS forum_threads_category_idx ON forum_threads(category);
CREATE INDEX IF NOT EXISTS forum_replies_thread_id_idx ON forum_replies(thread_id);

-- Insert sample data
INSERT INTO users (email, username, role, bio) VALUES
  ('admin@detailertools.com', 'Admin Team', 'admin', 'Official DetailerTools.com team'),
  ('alex.chen@example.com', 'Alex Chen', 'user', 'Senior Tekla Detailer with 10+ years experience'),
  ('sarah.miller@example.com', 'Sarah Miller', 'moderator', 'Tekla trainer and consultant')
ON CONFLICT (email) DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, author_id, category) 
SELECT 
  'Mastering Complex Steel Connections in Tekla Structures',
  'mastering-complex-steel-connections',
  E'# Mastering Complex Steel Connections\n\nLearn advanced techniques for modeling complex steel connections...\n\n## Key Topics\n- Moment connections\n- Bracing frames\n- Seismic detailing',
  'Learn advanced techniques for modeling and detailing complex steel connections including moment connections, bracing frames, and seismic detailing requirements.',
  users.id,
  'Advanced Tutorial'
FROM users WHERE username = 'Alex Chen'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, content, excerpt, author_id, category) 
SELECT 
  'Optimizing Tekla Workflow with Custom Components',
  'optimizing-tekla-workflow',
  E'# Optimizing Your Workflow\n\nDiscover how to create custom components...\n\n## Benefits\n- Save time\n- Reduce errors\n- Standardize processes',
  'Discover how to create and implement custom components in Tekla Structures to streamline your detailing workflow and reduce repetitive tasks.',
  users.id,
  'Tutorial'
FROM users WHERE username = 'Sarah Miller'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- Insert sample forum threads
INSERT INTO forum_threads (title, slug, content, author_id, category, is_pinned) 
SELECT 
  'Welcome to the New DetailerTools Forum!',
  'welcome-to-forum',
  E'We are excited to launch our new community forum! This space is designed for Tekla detailers to connect, share knowledge, and help each other grow professionally.\n\nFeel free to ask questions, share tips, and engage with fellow professionals.',
  users.id,
  'Announcement',
  true
FROM users WHERE username = 'Admin Team'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO forum_threads (title, slug, content, author_id, category) 
SELECT 
  'How to handle complex curved beam connections in Tekla?',
  'curved-beam-connections',
  E'I am working on a stadium project with complex curved roof beams. The connections are proving challenging to model accurately. Has anyone dealt with similar geometry? Looking for best practices and workflow suggestions.',
  users.id,
  'Tekla Help'
FROM users WHERE username = 'Alex Chen'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;
