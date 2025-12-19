# DetailerTools Blog & Forum - Full Stack Architecture

## **Technology Stack**

### **Frontend**
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + NVIDIA Theme
- **Icons**: Lucide React
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Rich Text**: TinyMCE
- **File Upload**: React Dropzone
- **Forms**: React Hook Form + Zod

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **File Upload**: Multer
- **Rate Limiting**: express-rate-limit
- **CORS**: cors middleware

### **Database**
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Connection**: Connection pooling
- **Migrations**: Prisma Migrate

---

## **Database Schema Design**

### **Users Table**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role ENUM('user', 'admin') DEFAULT 'user',
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);
```

### **Blog Posts Table**
```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(500),
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0
);
```

### **Blog Categories Table**
```sql
CREATE TABLE blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#76b900'
);
```

### **Blog Post Categories Junction**
```sql
CREATE TABLE blog_post_categories (
    post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);
```

### **Blog Comments Table**
```sql
CREATE TABLE blog_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    like_count INTEGER DEFAULT 0
);
```

### **Forum Threads Table**
```sql
CREATE TABLE forum_threads (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES forum_categories(id),
    status ENUM('open', 'closed', 'pinned', 'locked') DEFAULT 'open',
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false
);
```

### **Forum Categories Table**
```sql
CREATE TABLE forum_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#76b900',
    thread_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0
);
```

### **Forum Replies Table**
```sql
CREATE TABLE forum_replies (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES forum_threads(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    like_count INTEGER DEFAULT 0,
    is_answer BOOLEAN DEFAULT false
);
```

### **User Interactions Table**
```sql
CREATE TABLE user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    target_type ENUM('blog_post', 'blog_comment', 'forum_thread', 'forum_reply'),
    target_id INTEGER NOT NULL,
    interaction_type ENUM('like', 'dislike', 'bookmark', 'follow'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_type, target_id, interaction_type)
);
```

---

## **API Endpoints**

### **Authentication Endpoints**
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/forgot-password    - Password reset request
POST   /api/auth/reset-password     - Password reset confirmation
GET    /api/auth/me                - Get current user info
PUT    /api/auth/profile           - Update user profile
POST   /api/auth/upload-avatar     - Upload user avatar
```

### **Blog Endpoints**
```
GET    /api/blog/posts             - Get all blog posts (paginated)
GET    /api/blog/posts/:id         - Get single blog post
GET    /api/blog/posts/slug/:slug  - Get blog post by slug
POST    /api/blog/posts             - Create new blog post (admin)
PUT    /api/blog/posts/:id         - Update blog post (admin)
DELETE  /api/blog/posts/:id         - Delete blog post (admin)
GET    /api/blog/categories         - Get all categories
POST    /api/blog/categories         - Create category (admin)
GET    /api/blog/posts/:id/comments - Get post comments
POST    /api/blog/posts/:id/comments - Add comment to post
PUT    /api/blog/comments/:id       - Update comment
DELETE  /api/blog/comments/:id       - Delete comment
POST    /api/blog/posts/:id/like    - Like/unlike post
POST    /api/blog/comments/:id/like  - Like/unlike comment
```

### **Forum Endpoints**
```
GET    /api/forum/threads          - Get all threads (paginated)
GET    /api/forum/threads/:id      - Get single thread
POST    /api/forum/threads          - Create new thread
PUT    /api/forum/threads/:id      - Update thread (author/mod)
DELETE  /api/forum/threads/:id      - Delete thread (author/mod)
POST    /api/forum/threads/:id/pin   - Pin/unpin thread (mod)
POST    /api/forum/threads/:id/lock  - Lock/unlock thread (mod)
GET    /api/forum/categories        - Get all categories
POST    /api/forum/categories        - Create category (admin)
GET    /api/forum/threads/:id/replies - Get thread replies
POST    /api/forum/threads/:id/replies - Add reply to thread
PUT    /api/forum/replies/:id       - Update reply (author/mod)
DELETE  /api/forum/replies/:id       - Delete reply (author/mod)
POST    /api/forum/replies/:id/like  - Like/unlike reply
POST    /api/forum/replies/:id/answer - Mark as answer (author/mod)
```

### **User Endpoints**
```
GET    /api/users/profile/:id       - Get user profile
GET    /api/users/:id/posts         - Get user's blog posts
GET    /api/users/:id/threads       - Get user's forum threads
GET    /api/users/search           - Search users
POST    /api/users/follow/:id        - Follow/unfollow user
GET    /api/users/following        - Get following list
GET    /api/users/followers        - Get followers list
PUT    /api/users/notifications    - Mark notifications as read
```

---

## **Authentication Middleware**

### **JWT Authentication (auth.js)**
```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

module.exports = { authenticateToken, requireRole };
```

---

## **Other Features to Consider**

### **Search & Discovery**
- **Elasticsearch Integration**: Advanced search across blog and forum
- **Auto-suggestions**: Real-time search suggestions
- **Tag System**: Content tagging for better discovery
- **Trending Topics**: Popular discussions and posts

### **Content Moderation**
- **Automated Moderation**: AI-powered content filtering
- **Report System**: User reporting mechanism
- **Moderation Queue**: Admin review dashboard
- **Content Flags**: Spam, inappropriate, duplicate content

### **Notifications System**
- **Real-time Notifications**: WebSocket integration
- **Email Notifications**: Digest emails for inactive users
- **Push Notifications**: Browser push notifications
- **Notification Preferences**: User customizable alerts

### **Rich Media Support**
- **Image Upload**: Multiple image formats with optimization
- **File Attachments**: PDF, DOC, XLS support
- **Embed Media**: YouTube, Vimeo embedding
- **Image Gallery**: Lightbox viewer for images

### **Performance & Analytics**
- **Caching Layer**: Redis for frequently accessed content
- **CDN Integration**: Fast content delivery
- **Analytics Dashboard**: User engagement metrics
- **SEO Optimization**: Meta tags, sitemaps, structured data

### **Community Features**
- **User Badges**: Achievement system
- **Reputation Points**: Quality contribution rewards
- **Private Messaging**: User-to-user communication
- **User Groups**: Specialized discussion groups

### **Monetization**
- **Premium Features**: Advanced tools for paying users
- **Ad Integration**: Non-intrusive advertising
- **Sponsorship**: Sponsored content opportunities
- **API Access**: Paid API tiers for developers

---

## **Development Phases**

### **Phase 1: Core MVP (4-6 weeks)**
- User authentication system
- Basic blog CRUD operations
- Basic forum thread creation
- Simple commenting system
- Responsive frontend

### **Phase 2: Enhanced Features (4-6 weeks)**
- Rich text editor integration
- File upload capabilities
- User profiles and avatars
- Search functionality
- Notification system

### **Phase 3: Advanced Features (6-8 weeks)**
- Advanced moderation tools
- Analytics dashboard
- Mobile app development
- API documentation
- Performance optimization

### **Phase 4: Scale & Polish (4-6 weeks)**
- Load testing and optimization
- Security audit and hardening
- User feedback integration
- Marketing and launch preparation

---

## **Security Considerations**

- **Input Validation**: All user inputs sanitized
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **Rate Limiting**: Prevent brute force attacks
- **HTTPS Only**: SSL/TLS encryption
- **Data Encryption**: Sensitive data encryption at rest
- **Regular Security Updates**: Dependency management
- **Audit Logging**: Comprehensive activity tracking