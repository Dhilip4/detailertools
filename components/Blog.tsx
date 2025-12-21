import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ArrowLeft, Calendar, User, Tag, Star, ChevronRight, BookOpen, 
  Lock, Unlock, Plus, Pencil, Trash2, Download, X, Save, ImagePlus, ImageIcon,
  Bold, Italic, List, Heading, Code, Type, Layout, Eye, EyeOff
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from './blogData';

interface BlogProps {
  showToast?: (text: string, type?: 'success' | 'error') => void;
  initialPostId?: number | null;
}

export default function Blog({ showToast, initialPostId }: BlogProps) {
  // --- CONFIGURATION ---
  // Change this to 'hide' to remove the lock icon from the website.
  // Change this to 'unhide' to show it.
  const lockIconStatus = 'unhide'; 

  // --- STATE ---
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  
  // Admin / Editor State
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Auth Modal State (User ID & Password)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInput, setAuthInput] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<BlogPost>>({
      title: '', desc: '', content: '', tag: 'Tutorial', img: '', isFeatured: false
  });
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (initialPostId) {
        const found = posts.find(p => p.id === String(initialPostId));
        if (found) setSelectedPost(found);
    }
  }, [initialPostId, posts]);

  // --- HELPER: Editor Logic ---
  const insertAtCursor = (startTag: string, endTag: string = '') => {
      const textarea = contentInputRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content || '';
      const safeText = text || '';

      const before = safeText.substring(0, start);
      const selection = safeText.substring(start, end);
      const after = safeText.substring(end);

      const newContent = before + startTag + selection + endTag + after;
      setFormData({ ...formData, content: newContent });
      
      // We focus back so user can keep typing (optional)
      textarea.focus();
  };

  const handleContentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              // Insert standard HTML img tag with Tailwind classes for styling
              const imgTag = `\n<img src="${reader.result}" alt="Embedded Image" class="w-full rounded-xl my-6 border border-gray-700 shadow-2xl" />\n`;
              insertAtCursor(imgTag);
              if(showToast) showToast("Image inserted into content!", "success");
          };
          reader.readAsDataURL(file);
      }
  };

  // --- ACTIONS ---

  const toggleEditorMode = () => {
      if (isEditorMode) {
          setIsEditorMode(false);
          if (showToast) showToast("Editor Mode Disabled");
      } else {
          setAuthInput({ username: '', password: '' });
          setShowPassword(false);
          setShowAuthModal(true);
      }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Simple hardcoded credential check (Client-side only)
      if (authInput.username.toLowerCase() === 'admin' && authInput.password === '0000') {
          setIsEditorMode(true);
          setShowAuthModal(false);
          if (showToast) showToast("Editor Mode Enabled! You can now edit posts.", "success");
      } else {
          if (showToast) showToast("Invalid User ID or Password", "error");
          setAuthInput(prev => ({ ...prev, password: '' })); // Clear password on error
      }
  };

  const handleDownloadData = () => {
      const fileContent = `export interface BlogPost {
  id: string;
  title: string;
  desc: string;
  content?: string;
  author: string;
  read: string;
  img: string;
  tag: string;
  date: string;
  isFeatured?: boolean;
}

export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(posts, null, 2)};`;

      const blob = new Blob([fileContent], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blogData.ts';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (showToast) showToast("File Downloaded! Replace components/blogData.ts with this file.", "success");
  };

  const handleCreate = () => {
      setEditingPost(null);
      setFormData({
          title: '', desc: '', content: '', tag: 'Tutorial', 
          img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000', 
          isFeatured: false, author: 'Developer'
      });
      setIsModalOpen(true);
  };

  const handleEdit = (post: BlogPost, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingPost(post);
      setFormData({ ...post });
      setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(window.confirm("Are you sure you want to delete this post?")) {
          setPosts(prev => prev.filter(p => p.id !== id));
          if(showToast) showToast("Post Deleted (Remember to Save!)");
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, img: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSavePost = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newPost: BlogPost = {
          id: editingPost ? editingPost.id : Date.now().toString(),
          title: formData.title || 'Untitled',
          desc: formData.desc || '',
          content: formData.content || formData.desc || '',
          author: formData.author || 'Developer',
          read: '5 min read',
          img: formData.img || '',
          tag: formData.tag || 'General',
          date: editingPost ? editingPost.date : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          isFeatured: formData.isFeatured
      };

      if (editingPost) {
          setPosts(prev => prev.map(p => p.id === editingPost.id ? newPost : p));
      } else {
          setPosts(prev => [newPost, ...prev]);
      }
      
      setIsModalOpen(false);
      if(showToast) showToast("Post Saved! Don't forget to Export.", "success");
  };

  // --- FILTERING ---
  const allTags = ['All', ...Array.from(new Set(posts.map(p => p.tag)))];
  const filteredPosts = posts
    .filter(post => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
          post.title.toLowerCase().includes(query) ||
          post.desc.toLowerCase().includes(query);
      const matchesTag = activeTag === 'All' || post.tag === activeTag;
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => (a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1));

  const renderContent = (content: string) => { return { __html: content }; };

  // --- RENDER: EDITOR MODAL ---
  const renderEditorModal = () => (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
          <div className="nvidia-card w-full max-w-6xl h-[90vh] flex flex-col rounded-xl relative slide-in bg-[#1a1a1a] border border-[#76b900]/30 shadow-2xl">
              
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold flex items-center gap-2 text-[#76b900]"><Pencil className="w-5 h-5" /> {editingPost ? 'Edit Article' : 'New Article'}</h3>
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => document.getElementById('save-btn')?.click()} className="nvidia-button px-4 py-2 rounded font-bold text-sm flex items-center gap-2 text-white"><Save className="w-4 h-4" /> Save</button>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
              </div>
              
              {/* Body */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                  {/* Left: Metadata Form */}
                  <div className="w-full md:w-1/3 p-6 overflow-y-auto custom-scrollbar border-r border-gray-800 bg-[#151515]">
                      <form id="post-form" onSubmit={handleSavePost} className="space-y-5">
                          <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">Title</label>
                              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-[#76b900] outline-none" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">Category</label>
                              <input type="text" list="tags" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-[#76b900] outline-none" />
                              <datalist id="tags"><option value="Tutorial"/><option value="Update"/><option value="News"/></datalist>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">Cover Image</label>
                              <div className="flex gap-2 mb-2">
                                  <input type="text" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-400 focus:border-[#76b900] outline-none" placeholder="URL" />
                                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-800 p-2 rounded hover:bg-gray-700 text-gray-300"><ImageIcon className="w-4 h-4" /></button>
                              </div>
                              {formData.img && <img src={formData.img} alt="Preview" className="h-32 w-full object-cover rounded border border-gray-700" />}
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">Summary</label>
                              <textarea rows={3} required value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#76b900] outline-none" />
                          </div>
                          <div className="flex items-center gap-3 bg-white/5 p-3 rounded">
                              <input type="checkbox" id="featured" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 rounded text-[#76b900] focus:ring-[#76b900]" />
                              <label htmlFor="featured" className="text-sm font-bold text-white select-none cursor-pointer">Featured Post</label>
                          </div>
                          <button id="save-btn" type="submit" className="hidden">Save</button>
                      </form>
                  </div>

                  {/* Right: Rich Content Editor */}
                  <div className="w-full md:w-2/3 flex flex-col bg-[#1a1a1a]">
                      {/* Toolbar */}
                      <div className="bg-[#252525] border-b border-gray-700 p-2 flex items-center gap-1 flex-wrap">
                          <button type="button" onClick={() => insertAtCursor('<h3>', '</h3>')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Heading"><Heading size={16} /></button>
                          <button type="button" onClick={() => insertAtCursor('<strong>', '</strong>')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Bold"><Bold size={16} /></button>
                          <button type="button" onClick={() => insertAtCursor('<em>', '</em>')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Italic"><Italic size={16} /></button>
                          <div className="w-px h-6 bg-gray-700 mx-1"></div>
                          <button type="button" onClick={() => insertAtCursor('<ul>\n  <li>', '</li>\n</ul>')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="List"><List size={16} /></button>
                          <button type="button" onClick={() => insertAtCursor('<pre class="bg-gray-800 p-4 rounded text-sm font-mono my-4 overflow-x-auto">', '</pre>')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Code Block"><Code size={16} /></button>
                          <div className="w-px h-6 bg-gray-700 mx-1"></div>
                          
                          {/* Inline Image Upload */}
                          <input type="file" ref={contentImageInputRef} className="hidden" accept="image/*" onChange={handleContentImageUpload} />
                          <button type="button" onClick={() => contentImageInputRef.current?.click()} className="p-2 text-[#76b900] hover:text-white hover:bg-gray-700 rounded transition-colors font-bold flex items-center gap-1" title="Insert Image"><ImagePlus size={16} /> <span className="text-xs">Add Image</span></button>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 relative">
                          <textarea 
                            ref={contentInputRef}
                            value={formData.content} 
                            onChange={e => setFormData({...formData, content: e.target.value})} 
                            className="w-full h-full bg-[#1a1a1a] p-6 text-gray-300 font-mono text-sm leading-relaxed resize-none focus:outline-none custom-scrollbar"
                            placeholder="Write your article content here... HTML is supported."
                          />
                      </div>
                      
                      <div className="bg-[#252525] px-4 py-2 text-xs text-gray-500 border-t border-gray-700 flex justify-between">
                         <span>HTML Editor</span>
                         <span>{formData.content?.length || 0} characters</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  // --- RENDER: READ MODE ---
  if (selectedPost) {
      return (
          <div className="slide-in pb-12">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <div className="bg-gray-800 p-2 rounded-full group-hover:bg-[#76b900] transition-colors"><ArrowLeft className="w-5 h-5" /></div>
                    <span className="font-medium">Back to Knowledge Central</span>
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                      <div className="nvidia-card rounded-2xl overflow-hidden mb-8">
                          <div className="h-[300px] md:h-[450px] w-full relative">
                              <img src={selectedPost.img} alt={selectedPost.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent opacity-80"></div>
                              <div className="absolute bottom-0 left-0 p-8">
                                <span className="inline-block bg-[#76b900] text-black px-3 py-1 rounded-full text-xs font-bold mb-3">{selectedPost.tag}</span>
                                <h1 className="text-3xl md:text-5xl font-bold glow-text leading-tight">{selectedPost.title}</h1>
                              </div>
                          </div>
                          <div className="p-8 md:p-10">
                              <p className="text-xl text-gray-300 mb-8 font-light italic border-l-4 border-[#76b900] pl-6 py-2 bg-white/5 rounded-r-lg">{selectedPost.desc}</p>
                              <div className="prose prose-invert prose-lg max-w-none text-gray-200 leading-relaxed" dangerouslySetInnerHTML={renderContent(selectedPost.content || selectedPost.desc)} />
                          </div>
                      </div>
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                        <div className="nvidia-card p-6 rounded-xl space-y-4">
                            <h3 className="text-[#76b900] font-bold mb-2 uppercase text-sm tracking-wider">Article Info</h3>
                            <div className="flex items-center justify-between py-2 border-b border-gray-700">
                                <span className="flex items-center gap-2 text-gray-400 text-sm"><Calendar className="w-4 h-4"/> Published</span><span className="font-medium">{selectedPost.date}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-700">
                                <span className="flex items-center gap-2 text-gray-400 text-sm"><User className="w-4 h-4"/> Author</span><span className="font-medium">{selectedPost.author}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="flex items-center gap-2 text-gray-400 text-sm"><BookOpen className="w-4 h-4"/> Read Time</span><span className="font-medium">{selectedPost.read}</span>
                            </div>
                        </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER: LIST MODE ---
  return (
    <div className="space-y-8 relative">
      {/* HEADER WITH EDITOR TOGGLE */}
      <section className="text-center mb-8 relative">
        {lockIconStatus === 'unhide' && (
            <button 
                onClick={toggleEditorMode} 
                className={`absolute top-0 right-0 p-2 rounded-full transition-all z-10 ${isEditorMode ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-white'}`}
                title="Developer Mode"
            >
                {isEditorMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
        )}
        <h1 className="text-4xl font-bold mb-4 glow-text">Knowledge Central</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">Updates, tutorials, and insights directly from the developers.</p>
      </section>

      {/* ADMIN CONTROLS */}
      {isEditorMode && (
          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 mb-6 animate-pulse">
              <div className="flex items-center gap-2 text-red-400 font-bold"><Pencil className="w-4 h-4" /> EDITOR MODE ACTIVE</div>
              <div className="flex gap-3">
                  <button onClick={handleCreate} className="nvidia-button px-4 py-2 rounded font-bold text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Article</button>
              </div>
          </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto custom-scrollbar">
              <Tag className="w-4 h-4 text-[#76b900] flex-shrink-0" />
              {allTags.map(tag => (
                  <button key={tag} onClick={() => setActiveTag(tag)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${activeTag === tag ? 'bg-[#76b900] text-black font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{tag}</button>
              ))}
          </div>
          <div className="relative w-full md:w-64">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search articles..." className="w-full bg-[#1a1a1a] text-white px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-1 focus:ring-[#76b900] border border-gray-700" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>
      </div>

      {/* POST GRID */}
      {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
                <div key={post.id} onClick={() => setSelectedPost(post)} className={`nvidia-card rounded-xl overflow-hidden flex flex-col relative group h-full cursor-pointer hover:border-[#76b900]/60 transition-all ${post.isFeatured ? 'md:col-span-2 lg:col-span-2 border-[#76b900]/40' : ''}`}>
                    {post.isFeatured && <div className="absolute top-4 left-4 z-10 bg-[#76b900] text-black font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg"><Star className="w-3 h-3 fill-black" /> FEATURED</div>}
                    
                    {/* EDITOR ACTIONS */}
                    {isEditorMode && (
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            <button onClick={(e) => handleEdit(post, e)} className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-500 shadow-lg hover:scale-110 transition-transform"><Pencil className="w-4 h-4" /></button>
                            <button onClick={(e) => handleDelete(post.id, e)} className="bg-red-600 p-2 rounded-full text-white hover:bg-red-500 shadow-lg hover:scale-110 transition-transform"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    )}

                    <div className={`overflow-hidden relative ${post.isFeatured ? 'h-64 md:h-80' : 'h-48'}`}>
                        <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60"></div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-3 flex justify-between items-start">
                            <span className="text-xs font-bold text-[#76b900] bg-[#76b900]/10 px-2 py-1 rounded uppercase tracking-wider">{post.tag}</span>
                            <span className="text-xs text-gray-500">{post.date}</span>
                        </div>
                        <h3 className={`font-bold mb-3 group-hover:text-[#76b900] transition-colors leading-tight ${post.isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>{post.title}</h3>
                        <p className={`text-gray-400 mb-6 flex-1 ${post.isFeatured ? 'text-base line-clamp-3' : 'text-sm line-clamp-3'}`}>{post.desc}</p>
                        <div className="mt-auto flex items-center justify-between border-t border-gray-700 pt-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400"><User className="w-3 h-3" /><span>{post.author}</span></div>
                            <span className="text-sm font-bold text-white hover:text-[#76b900] flex items-center gap-1 transition-colors">Read Article <ChevronRight className="w-4 h-4" /></span>
                        </div>
                    </div>
                </div>
            ))}
          </div>
      ) : (
          <div className="text-center py-20 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">No articles found.</p>
          </div>
      )}

      {/* FLOATING SAVE BUTTON */}
      {isEditorMode && (
          <div className="fixed bottom-8 right-8 z-[100] animate-bounce">
              <button onClick={handleDownloadData} className="nvidia-button px-6 py-4 rounded-full font-bold text-white shadow-2xl flex items-center gap-3 border-2 border-white/20">
                  <Download className="w-6 h-6" /> SAVE TO FILE
              </button>
          </div>
      )}

      {/* AUTH MODAL (User ID & Password) */}
      {showAuthModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
              <div className="nvidia-card w-full max-w-sm p-6 rounded-xl relative slide-in bg-[#1a1a1a] border border-[#76b900]/30">
                  <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><Lock className="w-5 h-5 text-[#76b900]" /> Admin Access</h3>
                  <p className="text-sm text-gray-400 mb-6">Enter credentials to edit content.</p>
                  
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">User ID</label>
                        <input 
                            type="text" 
                            autoFocus
                            value={authInput.username}
                            onChange={(e) => setAuthInput({...authInput, username: e.target.value})}
                            placeholder="Enter User ID"
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-3 text-white focus:border-[#76b900] outline-none transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={authInput.password}
                                onChange={(e) => setAuthInput({...authInput, password: e.target.value})}
                                placeholder="••••••••"
                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-3 text-white focus:border-[#76b900] outline-none transition-colors pr-10"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 text-center pt-2">Default: <span className="font-mono text-gray-500">admin</span> / <span className="font-mono text-gray-500">0000</span></div>
                      
                      <button type="submit" className="w-full nvidia-button py-3 rounded-lg font-bold text-white shadow-lg mt-2 flex justify-center items-center gap-2">
                        <Unlock className="w-4 h-4" /> Unlock Editor
                      </button>
                  </form>
              </div>
          </div>
      )}

      {isModalOpen && renderEditorModal()}
    </div>
  );
}