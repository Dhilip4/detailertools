import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Pin, MessageCircle, Lock, Plus, Trash2, X, Check, ThumbsUp, ShieldCheck, Trophy, Star, Award, Filter, User, ArrowLeft, Send, MoreHorizontal, Flag, CheckCircle, ImagePlus, Loader2 } from 'lucide-react';
// Firebase imports removed
// import { db, isConfigured } from '../firebaseConfig';
// import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, getDoc } from 'firebase/firestore';

// --- Types ---

interface Comment {
    id: number;
    author: string;
    authorEmail?: string;
    text: string;
    time: string;
    likes: number;
    likedBy?: string[];
    isSolution: boolean;
}

interface Thread {
    id: string; // Changed to string for Firestore ID
    title: string;
    desc: string;
    author: string;
    authorEmail?: string;
    replies: number;
    comments: Comment[];
    tag: string;
    pinned: boolean;
    locked: boolean;
    solved: boolean;
    likes: number;
    likedBy?: string[];
    time: string;
    createdAt?: any;
}

interface ForumProps {
    isAdmin?: boolean;
    userEmail?: string;
    showToast?: (text: string, type?: 'success' | 'error') => void;
    addNotification?: (text: string, type: 'system' | 'alert' | 'feature', targetUser?: string) => void;
    initialThreadId?: number | null;
}

const DEMO_THREADS: Thread[] = [
    {
        id: 'demo-t1',
        title: "Welcome to the Detailer's Toolkit Forum!",
        desc: "This is a space to share knowledge, ask questions, and connect with other detailers. Please respect the community guidelines.",
        author: "Admin",
        authorEmail: "admin@detailertools.com",
        replies: 0,
        comments: [],
        tag: "Announcement",
        pinned: true,
        locked: false,
        solved: false,
        likes: 15,
        time: "1 day ago"
    },
    {
        id: 'demo-t2',
        title: "Curved Stair Stringer Unfolding in SDS2",
        desc: "Has anyone successfully unfolded a spiral stringer in SDS2 without third-party plugins? I'm getting some weird distortion on the flanges.",
        author: "IronWorker88",
        authorEmail: "user@test.com",
        replies: 2,
        comments: [
            { id: 101, author: 'SteelGuru', text: 'Yes, you need to use the advanced unfold settings in the member edit screen. Make sure "Keep Flange Width" is checked.', time: '2h ago', likes: 3, isSolution: true }
        ],
        tag: "SDS2 Help",
        pinned: false,
        locked: false,
        solved: true,
        likes: 4,
        time: "3 hours ago"
    },
    {
        id: 'demo-t3',
        title: "Tekla API: How to select objects by ID?",
        desc: "I am writing a C# plugin and need to programmatically select parts based on their GUID. Any snippets?",
        author: "CodeDetailer",
        authorEmail: "code@test.com",
        replies: 1,
        comments: [
            { id: 102, author: 'Admin', text: 'You can use `new ArrayList() { identifier }` and then pass it to `Tekla.Structures.Model.UI.ModelObjectSelector.Select(arrayList)`.', time: '1h ago', likes: 5, isSolution: false }
        ],
        tag: "Tekla Help",
        pinned: false,
        locked: false,
        solved: false,
        likes: 8,
        time: "5 hours ago"
    }
];

// --- Helpers ---
const getRankInfo = (postCount: number) => {
    if (postCount >= 10) {
        return { label: "Master", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon: Trophy };
    }
    if (postCount >= 3) {
        return { label: "Active", color: "text-blue-400 bg-blue-400/10 border-blue-400/30", icon: Star };
    }
    return { label: "New", color: "text-gray-400 bg-gray-400/10 border-gray-400/30", icon: null };
};

export default function Forum({ isAdmin = false, userEmail = '', showToast, addNotification, initialThreadId }: ForumProps) {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Navigation State
    const [view, setView] = useState<'list' | 'profile' | 'thread'>('list');
    const [profileUser, setProfileUser] = useState<string | null>(null);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

    // Reply Form State
    const [replyText, setReplyText] = useState('');
    const replyFileRef = useRef<HTMLInputElement>(null);

    // --- Firestore Integration ---
    const fetchThreads = async () => {
        setIsLoading(true);

        // --- Local Data Only ---
        setTimeout(() => {
            setThreads(DEMO_THREADS);
            setIsLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchThreads();
    }, []);

    // Handle Deep Linking
    useEffect(() => {
        if (initialThreadId && threads.length > 0 && !selectedThreadId) {
            // Just a heuristic since Firestore IDs are strings now, but we check if we can match
            // In a real scenario you would pass string IDs in URL.
        }
    }, [initialThreadId, threads]);

    const authorStats = useMemo(() => {
        const counts: Record<string, number> = {};
        threads.forEach(t => {
            counts[t.author] = (counts[t.author] || 0) + 1;
        });
        return counts;
    }, [threads]);

    const activeThread = useMemo(() =>
        threads.find(t => t.id === selectedThreadId),
        [threads, selectedThreadId]);

    const filteredThreads = threads.filter(thread => {
        const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            thread.desc.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesCategory = true;
        if (activeCategory === 'Solved') {
            matchesCategory = thread.solved;
        } else if (activeCategory !== 'All') {
            matchesCategory = thread.tag === activeCategory;
        }
        return matchesSearch && matchesCategory;
    });

    // --- Permission Helpers ---
    const canManageThread = (thread: Thread) => {
        if (!userEmail) return false;
        if (isAdmin) return true;
        const currentUserEmail = userEmail.toLowerCase().trim();
        const authorEmail = thread.authorEmail ? thread.authorEmail.toLowerCase().trim() : '';
        return authorEmail === currentUserEmail;
    };

    const canManageComment = (comment: Comment) => {
        if (!userEmail) return false;
        if (isAdmin) return true;
        const currentUserEmail = userEmail.toLowerCase().trim();
        const authorEmail = comment.authorEmail ? comment.authorEmail.toLowerCase().trim() : '';
        return authorEmail === currentUserEmail;
    };

    // --- Actions ---

    const handleThreadClick = (id: string) => {
        setSelectedThreadId(id);
        setView('thread');
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setView('list');
        setSelectedThreadId(null);
        setReplyText('');
    };

    const handleLikeThread = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!userEmail) {
            if (showToast) showToast("Please login to like", "error");
            return;
        }

        const thread = threads.find(t => t.id === id);
        if (!thread) return;

        const likedBy = thread.likedBy || [];
        const hasLiked = likedBy.includes(userEmail);
        let newLikes = thread.likes;
        let newLikedBy = [...likedBy];

        if (hasLiked) {
            newLikes = Math.max(0, newLikes - 1);
            newLikedBy = newLikedBy.filter(email => email !== userEmail);
        } else {
            newLikes++;
            newLikedBy.push(userEmail);
        }

        // Optimistic Update
        const updatedThreads = threads.map(t => t.id === id ? { ...t, likes: newLikes, likedBy: newLikedBy } : t);
        setThreads(updatedThreads);

        // Firestore Update
        // Firestore Update Removed
        // try {
        //     if (isConfigured) {
        //         await updateDoc(doc(db, "threads", id), { likes: newLikes, likedBy: newLikedBy });
        //     }
        // } catch (err) {
        //     console.error(err);
        // }
    };

    const handleLikeComment = async (threadId: string, commentId: number) => {
        if (!userEmail) {
            if (showToast) showToast("Please login to like", "error");
            return;
        }

        const thread = threads.find(t => t.id === threadId);
        if (!thread) return;

        const updatedComments = thread.comments.map(c => {
            if (c.id !== commentId) return c;
            const likedBy = c.likedBy || [];
            const hasLiked = likedBy.includes(userEmail);
            let newLikes = c.likes;
            let newLikedBy = [...likedBy];
            if (hasLiked) {
                newLikes = Math.max(0, newLikes - 1);
                newLikedBy = newLikedBy.filter(email => email !== userEmail);
            } else {
                newLikes++;
                newLikedBy.push(userEmail);
            }
            return { ...c, likes: newLikes, likedBy: newLikedBy };
        });

        // Optimistic
        const updatedThreads = threads.map(t => t.id === threadId ? { ...t, comments: updatedComments } : t);
        setThreads(updatedThreads);

        // Firestore
        // Firestore Removed
        // try {
        //     if (isConfigured) {
        //         await updateDoc(doc(db, "threads", threadId), { comments: updatedComments });
        //     }
        // } catch (err) {
        //     console.error(err);
        // }
    };

    const handleReplyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                const imgMarkdown = `\n![Image](${base64})\n`;
                setReplyText(prev => prev + imgMarkdown);
                if (showToast) showToast("Image inserted into reply!");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReport = () => {
        const reason = window.prompt("Why are you reporting this content?");
        if (reason) {
            if (showToast) showToast("Thank you. Report sent to admins.", "success");
        }
    };

    const postReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activeThread) return;
        if (!userEmail && !isAdmin) {
            if (showToast) showToast("Please login to reply", "error");
            return;
        }
        const authorName = isAdmin ? "Admin Team" : (userEmail ? userEmail.split('@')[0] : "Guest");
        const newComment: Comment = {
            id: Date.now(),
            author: authorName,
            authorEmail: userEmail,
            text: replyText,
            time: new Date().toLocaleDateString(),
            likes: 0,
            likedBy: [],
            isSolution: false
        };

        const updatedComments = [...activeThread.comments, newComment];
        const updatedThread = { ...activeThread, comments: updatedComments, replies: activeThread.replies + 1 };

        // Optimistic
        setThreads(prev => prev.map(t => t.id === activeThread.id ? updatedThread : t));
        setReplyText('');

        // Firestore Removed
        if (showToast) showToast("Reply posted!");
    };

    const toggleSolution = async (threadId: string, commentId: number) => {
        if (!activeThread) return;
        if (!isAdmin && activeThread.authorEmail !== userEmail) {
            if (showToast) showToast("Only the author can mark a solution", "error");
            return;
        }

        const updatedComments = activeThread.comments.map(c => ({
            ...c,
            isSolution: c.id === commentId ? !c.isSolution : false
        }));
        const isSolved = updatedComments.some(c => c.isSolution);

        // Optimistic
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, comments: updatedComments, solved: isSolved } : t));

        // Firestore Removed
    };

    const deleteComment = async (threadId: string, commentId: number) => {
        if (!window.confirm("Delete this comment?")) return;

        const thread = threads.find(t => t.id === threadId);
        if (!thread) return;

        const updatedComments = thread.comments.filter(c => c.id !== commentId);

        // Optimistic
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, comments: updatedComments, replies: updatedComments.length } : t));

        // Firestore Removed
        if (showToast) showToast("Comment deleted");
    };

    const deleteThread = async (thread: Thread, e?: React.MouseEvent) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }

        if (!window.confirm("Are you sure you want to delete this thread?")) return;

        // Optimistic
        setThreads(prev => prev.filter(t => t.id !== thread.id));
        if (view === 'thread') handleBack();

        // Firestore Removed
        if (showToast) showToast("Thread deleted", "success");
    };

    const openProfile = (author: string) => {
        setProfileUser(author);
        setView('profile');
        window.scrollTo(0, 0);
    };

    const renderDescription = (text: string) => {
        const regex = /(```[\s\S]*?```|!\[.*?\]\(.*?\))/g;
        const parts = text.split(regex);
        return parts.map((part, i) => {
            if (part.startsWith('```')) {
                const code = part.replace(/```/g, '').trim();
                return (
                    <div key={i} className="bg-gray-900 border border-gray-700 rounded-md p-3 my-2 font-mono text-xs text-green-400 overflow-x-auto">
                        <pre>{code}</pre>
                    </div>
                );
            }
            const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
            if (imgMatch) {
                return (
                    <img key={i} src={imgMatch[2]} alt={imgMatch[1]} className="max-w-full h-auto rounded-lg shadow-lg my-4 border border-gray-700 block" />
                );
            }
            if (!part.trim()) return null;
            return <p key={i} className="whitespace-pre-line leading-relaxed mb-2 text-gray-300">{part}</p>;
        });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', desc: '', tag: 'Tekla Help' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreate = () => {
        setFormData({ title: '', desc: '', tag: 'Tekla Help' });
        setIsModalOpen(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                const imgMarkdown = `\n![Image](${base64})\n`;
                setFormData(prev => ({ ...prev, desc: prev.desc + imgMarkdown }));
                if (showToast) showToast("Image inserted!");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const authorName = isAdmin ? "Admin Team" : (userEmail ? userEmail.split('@')[0] : "Guest User");
        const currentDate = new Date().toLocaleDateString();

        const newThreadData = {
            title: formData.title,
            desc: formData.desc,
            author: authorName,
            authorEmail: userEmail,
            replies: 0,
            comments: [],
            tag: formData.tag,
            pinned: false,
            locked: false,
            solved: false,
            likes: 0,
            likedBy: [],
            time: currentDate,
            createdAt: new Date()
        };

        const docId = 'demo-' + Date.now();
        const newThread = { id: docId, ...newThreadData };
        setThreads(prev => [newThread as Thread, ...prev]);
        setIsModalOpen(false);
        if (showToast) showToast("Thread created successfully", "success");
    };

    const categories = ['All', 'Solved', 'Tekla Help', 'SDS2 Help', 'Best Practices', 'Jobs', 'Project Showcase', 'Announcement'];

    const topContributors = useMemo(() => {
        const sorted = Object.entries(authorStats)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 3);
        return sorted;
    }, [authorStats]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-[#76b900] animate-spin mb-4" />
                <p className="text-gray-400">Loading community discussions...</p>
            </div>
        );
    }

    const renderMainContent = () => {
        if (view === 'thread' && activeThread) {
            const rank = getRankInfo(authorStats[activeThread.author] || 0);
            const RankIcon = rank.icon;
            const hasLikedThread = activeThread.likedBy?.includes(userEmail || '');

            return (
                <div className="slide-in pb-12 max-w-4xl mx-auto">
                    <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors group">
                        <div className="bg-gray-800 p-2 rounded-full group-hover:bg-[#76b900] transition-colors"><ArrowLeft className="w-5 h-5" /></div>
                        <span className="font-medium">Back to Discussions</span>
                    </button>

                    <div className="nvidia-card rounded-xl overflow-hidden mb-6 border-[#76b900]/30">
                        <div className="bg-[#1a1a1a] p-6 border-b border-gray-800">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-gray-800 rounded text-xs font-bold text-[#76b900] border border-[#76b900]/20">{activeThread.tag}</span>
                                    {activeThread.solved && <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-bold border border-green-500/30 flex items-center gap-1"><Check className="w-3 h-3" /> Solved</span>}
                                    {activeThread.locked && <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-bold border border-red-500/30 flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>}
                                </div>
                                <div className="text-gray-500 text-sm flex items-center gap-3">
                                    <span>{activeThread.time}</span>
                                    {canManageThread(activeThread) && (
                                        <button
                                            onClick={(e) => deleteThread(activeThread, e)}
                                            className="text-gray-600 hover:text-red-500 p-1.5 rounded-full hover:bg-white/5 transition-colors"
                                            title="Delete Thread"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{activeThread.title}</h1>
                        </div>

                        <div className="p-6 md:p-8 bg-[#1e1e1e]">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 cursor-pointer" onClick={() => openProfile(activeThread.author)}>
                                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold text-white border border-gray-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white cursor-pointer hover:underline" onClick={() => openProfile(activeThread.author)}>{activeThread.author}</span>
                                        <span className={`text-[10px] px-1.5 rounded flex items-center gap-0.5 border ${rank.color}`}>
                                            {RankIcon && <RankIcon className="w-2 h-2" />}
                                            {rank.label}
                                        </span>
                                    </div>
                                    <div className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        {renderDescription(activeThread.desc)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-800 mt-4">
                                <button onClick={(e) => handleLikeThread(activeThread.id, e)} className={`flex items-center gap-2 transition-colors ${hasLikedThread ? 'text-[#76b900]' : 'text-gray-400 hover:text-[#76b900]'}`}>
                                    <ThumbsUp className={`w-4 h-4 ${hasLikedThread ? 'fill-current' : ''}`} />
                                    <span className="text-sm font-bold">{activeThread.likes} Likes</span>
                                </button>
                                <button onClick={handleReport} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                    <Flag className="w-4 h-4" />
                                    <span className="text-sm">Report</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-300">
                            <MessageCircle className="w-5 h-5" /> {activeThread.comments.length} Replies
                        </h3>
                        <div className="space-y-4">
                            {activeThread.comments.length === 0 ? (
                                <div className="text-center p-8 bg-white/5 rounded-xl border border-dashed border-gray-700 text-gray-500">No replies yet. Be the first to help!</div>
                            ) : (
                                activeThread.comments.map(comment => {
                                    const hasLikedComment = comment.likedBy?.includes(userEmail || '');
                                    return (
                                        <div key={comment.id} className={`nvidia-card p-6 rounded-xl ${comment.isSolution ? 'border-green-500/50 bg-green-900/10' : ''}`}>
                                            {comment.isSolution && (
                                                <div className="mb-3 flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider"><CheckCircle className="w-4 h-4" /> Solution</div>
                                            )}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-bold text-gray-300">{comment.author[0]}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm block cursor-pointer hover:text-[#76b900]" onClick={() => openProfile(comment.author)}>{comment.author}</span>
                                                        <span className="text-xs text-gray-500">{comment.time}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {(isAdmin || activeThread.authorEmail === userEmail) && (
                                                        <button onClick={() => toggleSolution(activeThread.id, comment.id)} className={`p-1.5 rounded transition-colors ${comment.isSolution ? 'text-green-400 bg-green-900/20' : 'text-gray-600 hover:text-green-400 hover:bg-gray-800'}`} title="Mark as Solution"><Check className="w-4 h-4" /></button>
                                                    )}
                                                    {canManageComment(comment) && (
                                                        <button onClick={() => deleteComment(activeThread.id, comment.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-gray-800" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-gray-300 text-sm mb-4 leading-relaxed">{renderDescription(comment.text)}</div>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => handleLikeComment(activeThread.id, comment.id)} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasLikedComment ? 'text-[#76b900]' : 'text-gray-500 hover:text-[#76b900]'}`}><ThumbsUp className={`w-3 h-3 ${hasLikedComment ? 'fill-current' : ''}`} /> {comment.likes}</button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {!activeThread.locked ? (
                            <div className="nvidia-card p-6 rounded-xl bg-[#1a1a1a]">
                                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Post a Reply</h4>
                                <form onSubmit={postReply}>
                                    <div className="relative">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:border-[#76b900] focus:outline-none min-h-[120px] mb-4 pr-10"
                                            placeholder={userEmail ? "Type your reply here... (Markdown supported)" : "Please login to reply."}
                                            disabled={!userEmail && !isAdmin}
                                        />
                                        {/* Reply Image Upload */}
                                        <input
                                            type="file"
                                            ref={replyFileRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleReplyImageUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => replyFileRef.current?.click()}
                                            disabled={!userEmail && !isAdmin}
                                            className="absolute bottom-6 right-2 text-gray-500 hover:text-[#76b900] p-1 rounded-full hover:bg-white/5 transition-colors disabled:opacity-50"
                                            title="Insert Image"
                                        >
                                            <ImagePlus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500">Be kind and helpful.</p>
                                        <button type="submit" disabled={(!userEmail && !isAdmin) || !replyText.trim()} className="nvidia-button px-6 py-2 rounded-lg text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Send className="w-4 h-4" /> Post Reply</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-lg text-center text-red-400 text-sm font-bold flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> This thread is locked. New replies are disabled.</div>
                        )}
                    </div>
                </div>
            );
        }

        if (view === 'profile' && profileUser) {
            const postCount = authorStats[profileUser] || 0;
            const rank = getRankInfo(postCount);
            const RankIcon = rank.icon;
            const userThreads = threads.filter(t => t.author === profileUser);
            const totalLikes = userThreads.reduce((acc, t) => acc + t.likes, 0);

            return (
                <div className="slide-in pb-12">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
                        <div className="bg-gray-800 p-2 rounded-full group-hover:bg-[#76b900] transition-colors"><ArrowLeft className="w-5 h-5" /></div>
                        <span className="font-medium">Back to Forum</span>
                    </button>
                    <div className="nvidia-card p-8 rounded-xl mb-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-64 h-64 text-[#76b900] transform -rotate-12" /></div>
                        <div className="w-24 h-24 bg-gray-700/50 backdrop-blur rounded-full flex items-center justify-center text-4xl border-2 border-[#76b900] shadow-[0_0_20px_rgba(118,185,0,0.3)] z-10"><User className="w-12 h-12 text-white" /></div>
                        <div className="text-center md:text-left flex-1 z-10">
                            <h2 className="text-3xl font-bold mb-2 glow-text">{profileUser}</h2>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${rank.color} mb-6`}>{RankIcon && <RankIcon className="w-4 h-4" />}<span className="font-bold text-sm">{rank.label} Detailer</span></div>
                            <div className="flex gap-8 justify-center md:justify-start">
                                <div className="text-center"><div className="font-bold text-2xl text-white">{postCount}</div><div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Posts</div></div>
                                <div className="text-center"><div className="font-bold text-2xl text-white">{totalLikes}</div><div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Likes Received</div></div>
                                <div className="text-center"><div className="font-bold text-2xl text-white">{userThreads.filter(t => t.solved).length}</div><div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Solutions</div></div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-l-4 border-[#76b900] pl-3"><MessageCircle className="w-5 h-5 text-[#76b900]" /> Recent Activity</h3>
                    <div className="grid gap-3">
                        {userThreads.length > 0 ? userThreads.map(thread => (
                            <div key={thread.id} onClick={() => handleThreadClick(thread.id)} className="nvidia-card p-4 rounded-lg flex items-center justify-between group hover:border-[#76b900]/50 transition-all cursor-pointer">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1"><span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 rounded">{thread.tag}</span><span className="text-xs text-gray-500">{thread.time}</span></div>
                                    <h4 className="font-bold text-lg group-hover:text-[#76b900] transition-colors truncate">{thread.title}</h4>
                                    <p className="text-gray-400 text-xs line-clamp-1">{thread.desc.replace(/```/g, '')}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 ml-4 text-sm text-gray-400 min-w-[60px]"><span className="flex items-center gap-1.5"><ThumbsUp className="w-3 h-3" /> {thread.likes}</span><span className="flex items-center gap-1.5"><MessageCircle className="w-3 h-3" /> {thread.replies}</span></div>
                            </div>
                        )) : (
                            <div className="text-gray-500 italic p-4 text-center bg-white/5 rounded-lg border border-dashed border-gray-700">No recent activity found.</div>
                        )}
                    </div>
                </div>
            );
        }

        // 3. LIST VIEW
        return (
            <div className="space-y-6 pb-12">
                <section className="text-center mb-6">
                    <h1 className="text-3xl font-bold mb-2 glow-text">Detailer's Toolkit Forum</h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">Connect with fellow steel detailers (Tekla, SDS2, etc.), share knowledge, and solve problems.</p>
                </section>

                <div className="grid lg:grid-cols-4 gap-4 mb-6">
                    <div className="lg:col-span-1">
                        <div className="nvidia-card p-4 rounded-xl h-full flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Search className="w-16 h-16 text-[#76b900] transform rotate-12" /></div>
                            <div className="relative z-10">
                                <h3 className="text-[#76b900] font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Search className="w-3 h-3" /> Find Topics</h3>
                                <div className="relative group w-full">
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-black/40 text-white px-3 py-2 pl-9 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#76b900] border border-gray-700 transition-all text-sm" />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-[#76b900] w-4 h-4 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                        <div className="nvidia-card p-2 rounded-xl text-center border-t-2 border-green-500 flex flex-col justify-center"><div className="text-lg font-bold text-white">1,247</div><div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Members</div></div>
                        <div className="nvidia-card p-2 rounded-xl text-center border-t-2 border-blue-500 flex flex-col justify-center"><div className="text-lg font-bold text-white">{threads.length}</div><div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Threads</div></div>
                        <div className="nvidia-card p-2 rounded-xl text-center border-t-2 border-orange-500 flex flex-col justify-center"><div className="text-lg font-bold text-white">{threads.reduce((acc, t) => acc + t.likes, 0)}</div><div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Likes</div></div>
                    </div>

                    <div className="lg:col-span-1 nvidia-card p-3 rounded-xl border border-yellow-500/20 bg-yellow-900/5">
                        <h3 className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Award className="w-3 h-3" /> Top Contributors</h3>
                        <div className="space-y-2">
                            {topContributors.map(([author, count], idx) => (
                                <div key={author} className="flex items-center justify-between text-xs cursor-pointer hover:bg-white/5 rounded p-1 transition-colors" onClick={() => openProfile(author)}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${idx === 0 ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-300'}`}>{idx + 1}</div>
                                        <span className={`${idx === 0 ? 'text-white font-medium' : 'text-gray-400'} hover:text-white transition-colors`}>{author}</span>
                                    </div>
                                    <span className="font-mono text-yellow-500/80">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${activeCategory === cat ? 'bg-[#76b900] text-black shadow-sm' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>{cat === 'Solved' && <Check className="w-3 h-3" />}{cat}</button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {userEmail ? (
                            <button onClick={handleCreate} className="nvidia-button px-4 py-1.5 rounded-lg text-white font-bold text-sm flex items-center gap-2 shadow-md"><Plus className="w-3 h-3" /> New</button>
                        ) : (
                            <div className="text-xs text-gray-500 flex items-center">Login to post</div>
                        )}
                    </div>
                </div>

                <div className="grid gap-3">
                    {filteredThreads.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-[#1a1a1a]/50 rounded-xl border border-dashed border-gray-700">
                            <Filter className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No threads found.</p>
                            <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="text-[#76b900] text-xs mt-1 hover:underline">Clear Filters</button>
                        </div>
                    ) : (
                        filteredThreads.map((thread) => {
                            const authorPostCount = authorStats[thread.author] || 0;
                            const rank = getRankInfo(authorPostCount);
                            const RankIcon = rank.icon;
                            const hasLiked = thread.likedBy?.includes(userEmail || '');

                            return (
                                <div key={thread.id} onClick={() => handleThreadClick(thread.id)} className={`nvidia-card p-4 rounded-lg cursor-pointer hover:border-[#76b900]/50 group relative transition-all duration-200 ${thread.locked ? 'opacity-80 bg-gray-900/50' : ''}`}>
                                    <div className="absolute top-2 right-2 flex gap-1">{thread.pinned && <Pin className="w-3 h-3 text-orange-400" />}{thread.locked && <Lock className="w-3 h-3 text-red-400" />}{thread.solved && <Check className="w-3 h-3 text-[#76b900]" />}</div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center justify-center min-w-[40px] border-r border-gray-800 pr-3 py-1">
                                            <button onClick={(e) => handleLikeThread(thread.id, e)} className={`mb-1 transition-colors ${hasLiked ? 'text-[#76b900]' : 'text-gray-500 hover:text-[#76b900]'}`}><ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} /></button>
                                            <span className={`font-bold text-sm ${hasLiked ? 'text-[#76b900]' : 'text-gray-300'}`}>{thread.likes}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 truncate">{thread.tag}</span><span className="text-[10px] text-gray-500 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {thread.comments.length}</span></div>
                                            <h3 className="text-base font-bold mb-1 group-hover:text-[#76b900] transition-colors truncate">{thread.title}</h3>
                                            {renderDescription(thread.desc.substring(0, 150) + (thread.desc.length > 150 ? '...' : ''))}
                                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-800/50">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <div className="flex items-center gap-1.5"><span className={`font-medium ${thread.author === 'Admin Team' ? 'text-[#76b900]' : 'text-gray-400'}`}>{thread.author}</span><span className={`text-[9px] px-1 rounded flex items-center gap-0.5 border ${rank.color}`}>{RankIcon && <RankIcon className="w-2 h-2" />}{rank.label}</span><button onClick={(e) => { e.stopPropagation(); openProfile(thread.author); }} className="text-gray-600 hover:text-[#76b900] ml-1 p-0.5 rounded-full hover:bg-gray-800 transition-colors" title="View User Profile"><User className="w-3 h-3" /></button></div>
                                                    <span className="text-gray-600">•</span><span className="text-gray-600 text-[10px]">{thread.time}</span>
                                                </div>
                                                {(isAdmin || canManageThread(thread)) && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => deleteThread(thread, e)} className="text-gray-600 hover:text-red-500"><Trash2 className="w-3 h-3" /></button></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="text-center mt-6"><button className="text-sm text-gray-500 hover:text-white underline">Load More</button></div>
            </div>
        );
    };

    return (
        <>
            {renderMainContent()}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="nvidia-card w-full max-w-lg p-6 rounded-xl relative slide-in bg-[#1a1a1a] border border-gray-700">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageCircle className="text-[#76b900]" /> New Discussion</h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-300">Subject</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-[#76b900] outline-none" placeholder="Title" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-300">Description</label>
                                <div className="relative">
                                    <textarea required rows={4} value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-300 focus:border-[#76b900] outline-none pr-10" placeholder="Details... (Markdown supported)" />
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 text-gray-500 hover:text-[#76b900] p-1 rounded-full hover:bg-white/5 transition-colors" title="Insert Image"><ImagePlus className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-300">Category</label>
                                <select value={formData.tag} onChange={e => setFormData({ ...formData, tag: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-[#76b900] outline-none">
                                    {categories.filter(c => c !== 'All' && c !== 'Solved').map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full nvidia-button py-2 rounded-lg font-bold mt-2 text-white">Post</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}