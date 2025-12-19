# ConstructTools Pro - Multi-File Website

A professional construction management suite with separate HTML files for better organization and scalability.

## 📁 File Structure

```
├── index.html          # Home page
├── checker.html        # Word Cross-Checker tool
├── calculator.html     # Construction Calculator
├── blog.html          # Blog section
├── forum.html         # Community forum
├── styles.css         # Shared styling
├── script.js          # Common JavaScript functions
├── checker.js         # Word checker specific functionality
├── calculator.js      # Calculator specific functionality
├── netlify.toml       # Netlify deployment configuration
└── README.md          # This file
```

## 🌟 Features

### **🏠 Home Page** (`index.html`)
- Hero section with call-to-action buttons
- Feature cards showcasing all tools
- Recent activity dashboard
- Professional NVIDIA-inspired design

### **🔍 Word Cross-Checker** (`checker.html`)
- Cross-check erection drawings with bill of materials
- Drag & drop file upload
- Real-time processing with progress tracking
- Export results in TXT and CSV formats
- Advanced filtering and sorting options

### **🧮 Construction Calculator** (`calculator.html`)
- Basic arithmetic operations
- Area calculations (Length × Width)
- Volume calculations (Length × Width × Height)
- Professional interface with NVIDIA-inspired design

### **📝 Blog** (`blog.html`)
- Featured post section
- Recent posts grid
- Category tags
- Reading time estimates

### **💬 Forum** (`forum.html`)
- Forum categories with statistics
- Recent discussions
- User engagement metrics
- Topic tags and categories

## 🚀 Deployment

### **Netlify Deployment (Recommended)**

1. **Upload all files** to Netlify:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Deploy manually"
   - Drag and drop **all files** (or the entire folder)
   - Your site will be live instantly!

2. **Alternative: Git-based deployment**:
   - Upload all files to a GitHub repository
   - Connect your GitHub account to Netlify
   - Select the repository
   - Deploy automatically

### **Other Deployment Options**

#### **GitHub Pages**
1. Upload all files to a GitHub repository
2. Go to Settings → Pages
3. Select source as "Deploy from a branch"
4. Choose main branch and `/` folder
5. Your site will be available at `https://username.github.io/repo`

#### **Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Upload all files
4. Deploy instantly

#### **Any Web Server**
Simply upload all files to any web server directory and access `index.html`.

## 🎨 Design Features

- **NVIDIA-inspired dark theme** with green accent colors
- **Responsive design** - works on all devices
- **Modern glass morphism effects**
- **Smooth animations and transitions**
- **Professional typography** with Inter font
- **Accessible and user-friendly interface**

## 🛠️ Technical Architecture

### **Shared Resources**
- **`styles.css`** - Common styling for all pages
- **`script.js`** - Shared JavaScript functions
- **Consistent navigation** across all pages

### **Page-Specific JavaScript**
- **`checker.js`** - Word checker functionality
- **`calculator.js`** - Calculator operations
- **Modular design** for easy maintenance

### **Navigation System**
- **Active page highlighting**
- **Smooth transitions** between pages
- **Mobile-responsive navigation**
- **Consistent user experience**

## 📱 Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 🔧 Customization

### **Adding New Pages**
1. Create new HTML file (e.g., `about.html`)
2. Include shared CSS and JS:
   ```html
   <link rel="stylesheet" href="styles.css">
   <script src="script.js"></script>
   ```
3. Add navigation links to all pages
4. Add page-specific JavaScript if needed

### **Modifying Styles**
- Edit `styles.css` for global changes
- Add page-specific styles in individual HTML files

### **Adding Functionality**
- Add shared functions to `script.js`
- Add page-specific functions to dedicated JS files

## 🔄 Benefits of Multi-File Structure

### **Advantages:**
- **Better organization** - Each page has its own file
- **Easier maintenance** - Changes are isolated
- **Faster loading** - Only load what's needed
- **Better SEO** - Each page can be optimized
- **Scalability** - Easy to add new features
- **Team collaboration** - Multiple developers can work on different pages

### **How It Works:**
- **Shared resources** (CSS, JS) are cached across pages
- **Consistent navigation** maintains user experience
- **Page-specific functionality** loads only when needed
- **Seamless transitions** between pages

## 🌐 Live Demo

Once deployed, users can navigate between pages just like a single-page application, but with better performance and organization.

---

**Built with ❤️ for construction professionals**