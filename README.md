# detailertools.com

Precision tools designed by detailers, for detailers: Streamlining the steel detailing workflow.

A professional steel detailing suite featuring word cross-checking, feet & inch calculations, blog, and community forum.

## Features

### 🔍 Word Cross-Checker
- Cross-check erection drawings with bill of materials
- Drag & drop file upload
- Real-time processing with progress tracking
- Export results in TXT and CSV formats
- Advanced filtering and sorting options

### 📏 Feet & Inch Calculator
- Advanced feet and inch calculations
- Add, subtract, multiply, divide measurements
- Convert between decimal feet and feet/inches
- Professional steel detailing interface

### 📝 Blog
- Steel detailing tips and best practices
- Tutorials and guides
- Industry news and updates
- Admin panel for content management

### 💬 Community Forum
- Connect with steel detailers
- Q&A sections
- Tips and tricks sharing
- Real-time discussions

## 🏗️ Architecture

The site is structured as a multi-page application:
- `index.html` - Home page
- `calculator.html` - Feet & Inch Calculator
- `checker.html` - Word Checker
- `blog.html` - Blog
- `forum.html` - Community Forum
- `styles.css` - Global styles

## 🚀 Deployment

### Netlify Deployment (Recommended)

1. **Clone or Download** this repository
2. **Upload to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Deploy manually"
   - Upload all files
   - Enable Netlify Identity in Site Settings
   - Your site will be live instantly!

### Backend Setup

For interactive blog and forum features:

#### 1. Enable Netlify Identity
- In Netlify dashboard, go to Site Settings → Identity
- Enable Identity
- Configure registration preferences
- Set up admin users

#### 2. Set up Database (Supabase)
1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Create tables for `posts` and `comments`:
   ```sql
   CREATE TABLE posts (
     id SERIAL PRIMARY KEY,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     author TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE comments (
     id SERIAL PRIMARY KEY,
     post_id INTEGER REFERENCES posts(id),
     content TEXT NOT NULL,
     author TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

#### 3. Create Netlify Functions
Create `netlify/functions/` directory and add functions for CRUD operations.

Example `netlify/functions/create-post.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { title, content, author } = JSON.parse(event.body);

  const { data, error } = await supabase
    .from('posts')
    .insert([{ title, content, author }]);

  if (error) {
    return { statusCode: 500, body: JSON.stringify(error) };
  }

  return { statusCode: 200, body: JSON.stringify(data) };
};
```

#### 4. Environment Variables
In Netlify dashboard, add:
- `SUPABASE_URL`
- `SUPABASE_KEY`

### Alternative Deployment Options

#### GitHub Pages
1. Upload files to a GitHub repository
2. Go to Settings → Pages
3. Select source as "Deploy from a branch"
4. Choose main branch and `/` folder
5. Note: Interactive features won't work without backend

## 🛠️ Development

### Local Development
```bash
# Start local server
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Technologies Used
- **Frontend:** HTML, CSS (Tailwind), JavaScript
- **Animations:** AOS (Animate on Scroll)
- **Icons:** Lucide
- **Backend:** Netlify Functions + Supabase
- **Auth:** Netlify Identity

#### Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Upload the `index.html` file
4. Deploy instantly

#### Any Web Server
Simply upload `index.html` to any web server directory and access it via browser.

## 🎨 Design Features

- **NVIDIA-inspired dark theme** with green accent colors
- **Responsive design** - works on all devices
- **Modern glass morphism effects**
- **Smooth animations and transitions**
- **Professional typography** with Inter font
- **Accessible and user-friendly interface**

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first styling
- **Vanilla JavaScript** - No dependencies required
- **Lucide Icons** - Modern icon library
- **CSS3 Animations** - Smooth transitions

## 📱 Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 🔧 Customization

The application is fully customizable:

1. **Colors**: Modify the CSS variables in the `<style>` section
2. **Content**: Update the HTML content directly
3. **Features**: Add new functionality in the JavaScript section
4. **Styling**: Adjust Tailwind classes for different looks

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ for construction professionals**