import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Search, ArrowLeft, Calendar, User, Tag, Star, ChevronRight, ChevronLeft, BookOpen,
    Lock, Unlock, Plus, Pencil, Trash2, Download, X, Save, ImagePlus,
    Bold, Italic, List, Heading, Eye, EyeOff,
    Sparkles, Link as LinkIcon, ListOrdered, Link
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from './blogData';

interface BlogProps {
    showToast?: (text: string, type?: 'success' | 'error') => void;
    initialPostId?: number | null;
}

interface EditorProps {
    initialContent: string;
    onChange: (content: string) => void;
    onInit: (ref: React.RefObject<HTMLDivElement | null>) => void;
}

const RichTextEditor = ({ initialContent, onChange, onInit }: EditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (editorRef.current && !initialized.current) {
            editorRef.current.innerHTML = initialContent || '';
            initialized.current = true;
            onInit(editorRef);
        }
    }, [initialContent, onInit]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    };

    return (
        <div className="flex-1 relative bg-[#0f0f0f] overflow-y-auto custom-scrollbar"
            onClick={() => editorRef.current?.focus()}>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                className="w-full min-h-full p-8 md:p-12 text-gray-300 font-sans text-lg leading-relaxed outline-none prose prose-invert max-w-none"
            />
        </div>
    );
};

export default function Blog({ showToast, initialPostId }: BlogProps) {
    // --- STATE ---
    const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS || []);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState('All');

    const [isEditorMode, setIsEditorMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authInput, setAuthInput] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: '', desc: '', content: '', tag: 'Tutorial', img: '', isFeatured: false
    });

    const activeEditorRef = useRef<HTMLDivElement | null>(null);
    const contentImageInputRef = useRef<HTMLInputElement>(null);
    const coverImageInputRef = useRef<HTMLInputElement>(null);

    const availableTags = Array.from(new Set(['Tutorial', 'Update', 'News', 'Workflow', 'Precision', ...posts.map(p => p.tag)]));
    const allTags = ['All', ...availableTags.filter(t => t !== 'All')];

    const filteredPosts = posts.filter(post => {
        const matchesSearch = (post.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (post.desc?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesTag = activeTag === 'All' || post.tag === activeTag;
        return matchesSearch && matchesTag;
    });

    useEffect(() => {
        if (initialPostId) {
            const found = posts.find(p => p.id === String(initialPostId));
            if (found) setSelectedPost(found);
        }
    }, [initialPostId, posts]);

    const handleEditorInit = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
        activeEditorRef.current = ref.current;
    }, []);

    const execFormat = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (activeEditorRef.current) {
            activeEditorRef.current.focus();
            const content = activeEditorRef.current.innerHTML;
            setFormData(prev => ({ ...prev, content }));
        }
    };

    const handleInsertLink = () => {
        const url = prompt('Enter the URL:', 'https://');
        if (url) {
            execFormat('createLink', url);
        }
    };

    const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, img: reader.result as string }));
                if (showToast) showToast("Cover image updated!", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleContentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                execFormat('insertImage', reader.result as string);
                if (showToast) showToast("Image inserted!", "success");
            };
            reader.readAsDataURL(file);
        }
    };

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
        if (authInput.username.toLowerCase() === 'admin' && authInput.password === '0000') {
            setIsEditorMode(true);
            setShowAuthModal(false);
            if (showToast) showToast("Editor Mode Enabled!", "success");
        } else {
            if (showToast) showToast("Invalid Credentials", "error");
        }
    };

    const handleSavePost = (e: React.FormEvent) => {
        e.preventDefault();
        const finalContent = activeEditorRef.current?.innerHTML || formData.content || '';
        const newPost: BlogPost = {
            id: editingPost ? editingPost.id : Date.now().toString(),
            title: formData.title || 'Untitled',
            desc: formData.desc || '',
            content: finalContent,
            author: formData.author || 'Developer',
            read: `${Math.ceil((finalContent.length || 0) / 1000) + 1} min read`,
            img: formData.img || '',
            tag: formData.tag || 'Tutorial',
            date: editingPost ? editingPost.date : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            isFeatured: formData.isFeatured
        };
        if (editingPost) {
            setPosts(prev => prev.map(p => p.id === editingPost.id ? newPost : p));
        } else {
            setPosts(prev => [newPost, ...prev]);
        }
        setIsModalOpen(false);
        if (showToast) showToast("Article saved locally!", "success");
    };

    const handleShareClick = () => {
        const url = `${window.location.origin}${window.location.pathname}?page=blog&id=${selectedPost?.id}`;
        navigator.clipboard.writeText(url).then(() => {
            if (showToast) showToast("Article link copied!", "success");
        });
    };

    const renderContent = (content: string) => { return { __html: content }; };

    const getAdjacentPosts = () => {
        if (!selectedPost) return { prev: null, next: null };
        const idx = posts.findIndex(p => p.id === selectedPost.id);
        return {
            prev: idx > 0 ? posts[idx - 1] : null,
            next: idx < posts.length - 1 ? posts[idx + 1] : null
        };
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
        if (showToast) showToast("File Exported!", "success");
    };

    const { prev, next } = getAdjacentPosts();
    const detailView = (
        <div className="slide-in pb-20">
            <section className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden -mx-4 md:-mx-8 lg:-mx-12">
                <img src={selectedPost?.img} alt={selectedPost?.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#0a0a0a]"></div>
                <div className="absolute top-8 left-0 right-0 z-20 px-4 md:px-12 flex justify-between items-center max-w-[1440px] mx-auto">
                    <button onClick={() => setSelectedPost(null)} className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 text-white hover:bg-[#76b900] hover:border-[#76b900] transition-all group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> <span className="font-bold tracking-wide">Back to Hub</span>
                    </button>
                    {isEditorMode && (
                        <button onClick={(e) => { e.stopPropagation(); setEditingPost(selectedPost); setFormData({ ...selectedPost }); setIsModalOpen(true); }} className="bg-[#76b900] text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 transform hover:scale-105 transition-all">
                            <Pencil size={16} /> Edit Article
                        </button>
                    )}
                </div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 max-w-7xl mx-auto pointer-events-none">
                    <span className="bg-[#76b900] text-black px-5 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.3em] mb-8 shadow-2xl">{selectedPost?.tag}</span>
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.05] mb-8 glow-text tracking-tighter drop-shadow-2xl">
                        {selectedPost?.title}
                    </h1>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 mt-12">
                <div className="grid lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8 space-y-12">
                        <article className="relative">
                            <div className="mb-16">
                                <span className="text-xs font-black text-[#76b900] uppercase tracking-widest mb-4 block">Executive Summary</span>
                                <p className="text-3xl text-gray-200 font-light italic leading-relaxed selection:bg-[#76b900] selection:text-black">
                                    {selectedPost?.desc}
                                </p>
                            </div>
                            <div className="prose prose-invert prose-2xl max-w-none text-gray-300 leading-[1.8] font-normal selection:bg-[#76b900] selection:text-black prose-headings:text-white prose-headings:font-black prose-a:text-[#76b900] prose-img:rounded-3xl"
                                dangerouslySetInnerHTML={renderContent(selectedPost?.content || selectedPost?.desc || '')} />
                        </article>

                        {/* NEW EXPLOSIVE NAVIGATION BOXES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-16 border-t border-gray-800/50">
                            {prev ? (
                                <button
                                    onClick={() => { setSelectedPost(prev); window.scrollTo(0, 0); }}
                                    className="nvidia-card rounded-2xl overflow-hidden group relative h-48 md:h-64 flex flex-col justify-end text-left transition-all hover:scale-[1.02]"
                                >
                                    <img src={prev.img} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                                    <div className="relative p-6 z-10">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2 group-hover:text-[#76b900] transition-colors"><ChevronLeft className="w-4 h-4" /> Previous</span>
                                        <h4 className="text-xl md:text-2xl font-black text-white leading-tight group-hover:text-[#76b900] transition-colors line-clamp-2">{prev.title}</h4>
                                    </div>
                                </button>
                            ) : (
                                <div className="hidden md:block"></div>
                            )}

                            {next ? (
                                <button
                                    onClick={() => { setSelectedPost(next); window.scrollTo(0, 0); }}
                                    className="nvidia-card rounded-2xl overflow-hidden group relative h-48 md:h-64 flex flex-col justify-end text-right transition-all hover:scale-[1.02]"
                                >
                                    <img src={next.img} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                                    <div className="relative p-6 z-10 flex flex-col items-end">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2 group-hover:text-[#76b900] transition-colors">Next Insight <ChevronRight className="w-4 h-4" /></span>
                                        <h4 className="text-xl md:text-2xl font-black text-white leading-tight group-hover:text-[#76b900] transition-colors line-clamp-2">{next.title}</h4>
                                    </div>
                                </button>
                            ) : (
                                <div className="hidden md:block"></div>
                            )}
                        </div>
                    </div>

                    <aside className="lg:col-span-4">
                        <div className="sticky top-28 space-y-8">
                            <div className="nvidia-card p-8 rounded-3xl bg-[#0f0f0f] border-white/5 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#76b900]/10 flex items-center justify-center border border-[#76b900]/20">
                                        <User className="w-6 h-6 text-[#76b900]" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Author</span>
                                        <span className="font-black text-white">{selectedPost?.author}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#76b900]/10 flex items-center justify-center border border-[#76b900]/20">
                                        <Calendar className="w-6 h-6 text-[#76b900]" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Published</span>
                                        <span className="font-black text-white">{selectedPost?.date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="nvidia-card p-8 rounded-3xl bg-[#0f0f0f] border-white/5">
                                <h4 className="text-[#76b900] font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> CATEGORIES
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.filter(t => t !== 'All').map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => { setSelectedPost(null); setActiveTag(tag); }}
                                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-400 hover:bg-[#76b900]/10 hover:text-[#76b900] hover:border-[#76b900]/30 transition-all"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Share Box */}
                            <div className="nvidia-card p-8 rounded-3xl bg-black border border-white/5 flex flex-col items-center gap-6">
                                <div className="p-4 bg-white/5 rounded-2xl">
                                    <LinkIcon className="w-8 h-8 text-[#76b900]" />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-white font-black text-lg mb-1">Quick Share</h4>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Post Article Link</p>
                                </div>
                                <button onClick={handleShareClick} className="w-full bg-[#76b900] text-black py-4 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                                    <LinkIcon className="w-4 h-4" /> COPY LINK
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );

    const listView = (
        <div className="space-y-12 relative max-w-7xl mx-auto px-4">
            <section className="text-center mb-12 relative py-8">
                <button onClick={toggleEditorMode} className={`absolute top-0 right-0 p-3 rounded-full transition-all z-10 ${isEditorMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-gray-600 hover:text-white hover:bg-white/5'}`} title="Developer Portal">
                    {isEditorMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </button>
                <h1 className="text-5xl md:text-7xl font-black mb-6 glow-text tracking-tighter text-white">Knowledge Central</h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">Direct insights from the detailing frontline. Updates, tutorials, and engineering wisdom.</p>
            </section>

            {isEditorMode && (
                <div className="bg-red-900/10 border border-red-500/30 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4 text-red-500">
                        <div className="p-3 bg-red-500/20 rounded-xl animate-pulse"><Pencil className="w-5 h-5" /></div>
                        <div>
                            <div className="font-black uppercase tracking-widest text-xs">Post Management</div>
                            <div className="text-xs text-red-500/70">Changes persist in this browser. Export to save permanently.</div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setIsModalOpen(true)} className="nvidia-button px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 text-white"><Plus className="w-4 h-4" /> New Article</button>
                        <button onClick={handleDownloadData} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"><Download className="w-4 h-4" /> Export Source</button>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12">
                <div className="flex items-center gap-3 overflow-x-auto pb-4 w-full lg:w-auto custom-scrollbar">
                    <Tag className="w-5 h-5 text-[#76b900] shrink-0" />
                    {allTags.map(tag => (
                        <button key={tag} onClick={() => setActiveTag(tag)} className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${activeTag === tag ? 'bg-[#76b900] text-black border-[#76b900] shadow-lg shadow-[#76b900]/20' : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'}`}>{tag}</button>
                    ))}
                </div>
                <div className="relative w-full lg:w-80">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search articles..." className="w-full bg-black/40 text-white px-6 py-3 pl-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#76b900]/50 border border-gray-800 transition-all font-medium" />
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                    <div key={post.id} onClick={() => { setSelectedPost(post); window.scrollTo(0, 0); }} className={`nvidia-card rounded-[2rem] overflow-hidden flex flex-col relative group h-full cursor-pointer hover:border-[#76b900]/50 transition-all duration-500 border-white/5 ${post.isFeatured ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                        <div className={`overflow-hidden relative ${post.isFeatured ? 'h-[300px] md:h-[450px]' : 'h-64'}`}>
                            <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-80"></div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col bg-[#111]">
                            <div className="mb-4 flex justify-between items-center">
                                <span className="text-[10px] font-black text-[#76b900] bg-[#76b900]/10 px-3 py-1 rounded-full uppercase tracking-[0.2em]">{post.tag}</span>
                                <span className="text-xs text-gray-500 font-bold">{post.date}</span>
                            </div>
                            <h3 className={`font-black mb-4 group-hover:text-[#76b900] transition-colors leading-tight text-white ${post.isFeatured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{post.title}</h3>
                            <p className="text-gray-400 mb-8 flex-1 line-clamp-3 leading-relaxed">{post.desc}</p>
                            <div className="mt-auto flex items-center justify-between border-t border-gray-800 pt-6">
                                <span className="text-sm font-black text-white group-hover:text-[#76b900] flex items-center gap-2 transition-all">Read Insight <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" /></span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            {selectedPost ? detailView : listView}

            {showAuthModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300] p-4 backdrop-blur-md">
                    <div className="nvidia-card w-full max-w-sm p-8 rounded-3xl relative bg-[#1a1a1a] border border-[#76b900]/30 shadow-2xl">
                        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                        <h3 className="text-2xl font-black mb-2 text-center text-white">Admin Portal</h3>
                        <p className="text-sm text-gray-500 text-center mb-8 font-medium">Verify credentials to edit hub content.</p>
                        <form onSubmit={handleAuthSubmit} className="space-y-6">
                            <input type="text" autoFocus value={authInput.username} onChange={(e) => setAuthInput({ ...authInput, username: e.target.value })} placeholder="Username" className="w-full bg-black/40 border border-gray-700 rounded-xl px-5 py-4 text-white focus:border-[#76b900] outline-none" />
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={authInput.password} onChange={(e) => setAuthInput({ ...authInput, password: e.target.value })} placeholder="Password" className="w-full bg-black/40 border border-gray-700 rounded-xl px-5 py-4 text-white focus:border-[#76b900] outline-none" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                            </div>
                            <button type="submit" className="w-full nvidia-button py-4 rounded-xl font-black text-white shadow-xl">Initialize Access</button>
                        </form>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
                    <div className="nvidia-card w-full max-w-6xl h-[90vh] flex flex-col rounded-xl relative bg-[#1a1a1a] border border-[#76b900]/30 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 shrink-0">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#76b900]" /> {editingPost ? 'Edit Article' : 'Compose Post'}
                            </h3>
                            <div className="flex items-center gap-4">
                                <button onClick={handleSavePost} className="nvidia-button px-6 py-2 rounded-lg font-bold text-sm text-white flex items-center gap-2"><Save size={16} /> Save Changes</button>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r border-gray-800 bg-[#151515] shrink-0 custom-scrollbar">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Article Title</label>
                                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#76b900] outline-none" placeholder="Enter title..." />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Category</label>
                                        <select
                                            value={formData.tag}
                                            onChange={e => setFormData({ ...formData, tag: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#76b900] outline-none"
                                        >
                                            {availableTags.filter(t => t !== 'All').map(tag => <option key={tag} value={tag}>{tag}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Cover Image</label>
                                        <div
                                            onClick={() => coverImageInputRef.current?.click()}
                                            className="w-full aspect-video bg-black/40 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#76b900] transition-all overflow-hidden relative group"
                                        >
                                            {formData.img ? (
                                                <>
                                                    <img src={formData.img} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="text-white text-xs font-bold">Change Image</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <ImagePlus className="w-8 h-8 text-gray-500 mb-2" />
                                                    <span className="text-gray-500 text-xs">Upload Cover Image</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                ref={coverImageInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleCoverImageUpload}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Summary</label>
                                        <textarea rows={3} value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:border-[#76b900] outline-none resize-none" placeholder="Brief summary of the article..." />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="featured" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-5 h-5 rounded text-[#76b900] focus:ring-[#76b900] bg-gray-900 border-gray-700" />
                                        <label htmlFor="featured" className="text-sm font-bold text-gray-300">Featured Article</label>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-2/3 flex flex-col bg-[#111] overflow-hidden">
                                <div className="bg-[#1a1a1a] border-b border-gray-800 p-3 flex items-center gap-1 shrink-0 z-10 sticky top-0">
                                    <button type="button" onClick={() => execFormat('formatBlock', 'H2')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Heading size={18} /></button>
                                    <button type="button" onClick={() => execFormat('bold')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Bold size={18} /></button>
                                    <button type="button" onClick={() => execFormat('italic')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Italic size={18} /></button>
                                    <div className="w-px h-6 bg-gray-800 mx-2"></div>
                                    <button type="button" onClick={() => execFormat('insertUnorderedList')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><List size={18} /></button>
                                    <button type="button" onClick={handleInsertLink} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded" title="Insert Link"><Link size={18} /></button>
                                    <div className="flex-grow"></div>
                                    <input type="file" ref={contentImageInputRef} className="hidden" accept="image/*" onChange={handleContentImageUpload} />
                                    <button type="button" onClick={() => contentImageInputRef.current?.click()} className="p-2 px-4 bg-[#76b900]/10 text-[#76b900] hover:bg-[#76b900]/20 rounded-lg transition-colors font-bold flex items-center gap-2"><ImagePlus size={18} /> <span className="text-xs">Inline Image</span></button>
                                </div>
                                <RichTextEditor
                                    initialContent={formData.content || ''}
                                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                                    onInit={handleEditorInit}
                                />
                                <div className="bg-[#151515] px-6 py-2 text-xs text-gray-500 border-t border-gray-800 flex justify-end shrink-0">
                                    <span className="font-mono">{formData.content ? formData.content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length : 0} words</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
