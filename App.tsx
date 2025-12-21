import React, { useState, useEffect, useRef } from 'react';
import { 
  Home as HomeIcon, 
  Search, 
  Calculator, 
  BookOpen, 
  Search as SearchIcon,
  X,
  CheckCircle,
  ChevronRight,
  Menu,
  Github,
  Linkedin
} from 'lucide-react';
import Home from './components/Home';
import WordChecker from './components/WordChecker';
import CalculatorComponent from './components/Calculator';
import Blog from './components/Blog';

// Navigation Types
type Page = 'home' | 'checker' | 'calculator' | 'blog';

// Toast Notification Type
interface ToastMsg {
  id: number;
  text: string;
  type: 'success' | 'error';
}

// --- CUSTOM LOGO COMPONENT ---
const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
    <defs>
      <linearGradient id="box_outer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#4a4a4a', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#2a2a2a', stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="box_inner" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" style={{stopColor:'#151515', stopOpacity:1}} />
         <stop offset="100%" style={{stopColor:'#000000', stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="dt_plate" x1="0%" y1="0%" x2="0%" y2="100%">
         <stop offset="0%" style={{stopColor:'#76b900', stopOpacity:1}} />
         <stop offset="100%" style={{stopColor:'#4a7000', stopOpacity:1}} />
      </linearGradient>
    </defs>
    <path d="M20 22 L3 13 L3 4 L20 12 Z" fill="url(#box_inner)" opacity="0.9" />
    <path d="M20 22 L37 13 L37 4 L20 12 Z" fill="#0a0a0a" opacity="0.9" />
    <g transform="translate(14, 5)">
        <path d="M0 5 L12 5 L12 18 L0 18 Z" fill="url(#dt_plate)" stroke="#ccff00" strokeWidth="0.5" transform="skewY(-15)"/>
        <text x="2" y="15" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="10" fill="#1a1a1a" transform="skewY(-15)">DT</text>
    </g>
    <path d="M20 38 L3 29 L3 13 L20 22 Z" fill="url(#box_outer)" stroke="#111" strokeWidth="0.5" />
    <path d="M20 38 L37 29 L37 13 L20 22 Z" fill="url(#box_outer)" stroke="#111" strokeWidth="0.5" style={{filter: 'brightness(1.2)'}} />
    <path d="M3 13 L20 22 L37 13" stroke="#76b900" strokeWidth="1" fill="none" opacity="0.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 22 L20 38" stroke="#000" strokeWidth="0.5" opacity="0.5" />
    <rect x="18" y="30" width="4" height="4" fill="#333" stroke="#555" strokeWidth="0.5" transform="skewY(20)"/>
  </svg>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initialId, setInitialId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{type: 'tool'|'knowledge', title: string, id: string|number}[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Initial Load
  useEffect(() => {
    // Handle Deep Linking
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const idParam = params.get('id');

    if (pageParam && (pageParam === 'blog')) {
        setCurrentPage(pageParam as Page);
        if (idParam) {
            setInitialId(Number(idParam));
        }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: {type: 'tool'|'knowledge', title: string, id: string|number}[] = [];

    // 1. Search Tools
    if ('word checker'.includes(query)) results.push({ type: 'tool', title: 'Word Checker', id: 'checker' });
    if ('feetinchcalc'.includes(query) || 'calculator'.includes(query) || 'feet'.includes(query)) results.push({ type: 'tool', title: 'FeetInchCalc', id: 'calculator' });
    if ('news'.includes(query) || 'knowledge'.includes(query) || 'central'.includes(query) || 'updates'.includes(query)) results.push({ type: 'tool', title: 'Knowledge Central', id: 'blog' });

    setSearchResults(results.slice(0, 6)); 
    setShowSearchDropdown(true);
  }, [searchQuery]);

  const handleSearchResultClick = (result: {type: string, id: string|number}) => {
      if (result.type === 'tool') setCurrentPage(result.id as Page);
      else if (result.type === 'knowledge') {
          setCurrentPage('blog');
          setInitialId(Number(result.id));
      }
      setSearchQuery('');
      setShowSearchDropdown(false);
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon className="w-4 h-4" /> },
    { id: 'checker', label: 'Word Checker', icon: <Search className="w-4 h-4" /> },
    { id: 'calculator', label: 'FeetInchCalc', icon: <Calculator className="w-4 h-4" /> },
    { id: 'blog', label: 'Knowledge Central', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col text-white">
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[200] space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-[#1a1a1a] border border-[#76b900] text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 slide-in">
             <CheckCircle className="w-5 h-5 text-[#76b900]" />
             <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="dark-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentPage('home')}>
              <Logo />
              <div>
                <h1 className="text-xl font-bold glow-text">DetailerTools.com</h1>
                <p className="text-xs text-gray-400">Professional Steel Detailer Suite</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`relative transition-all duration-300 font-medium hover:text-white ${
                    currentPage === item.id ? 'text-[#76b900]' : 'text-gray-300'
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-[#76b900] to-[#8bc34a] transition-all duration-300 ${
                    currentPage === item.id ? 'w-full' : 'w-0'
                  }`}></span>
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden lg:block" ref={searchRef}>
                <input 
                  type="text" 
                  placeholder="Search tools..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchDropdown(true)}
                  className="bg-gray-800 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:border-[#76b900] border border-gray-700 w-48 transition-all focus:w-64"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                  <SearchIcon className="h-4 w-4" />
                </button>
                
                {showSearchDropdown && (
                  <div className="absolute top-full right-0 w-80 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[100]">
                      {searchResults.length > 0 ? (
                          <div className="py-2">
                              <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Results</div>
                              {searchResults.map((res, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => handleSearchResultClick(res)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center gap-3 border-b border-gray-800 last:border-0 transition-colors"
                                  >
                                      <div className="flex-1 truncate">
                                          <div className="text-sm font-medium text-white truncate">{res.title}</div>
                                          <div className="text-xs text-gray-500 capitalize">{res.type}</div>
                                      </div>
                                      <ChevronRight className="w-3 h-3 text-gray-600" />
                                  </button>
                              ))}
                          </div>
                      ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
                      )}
                  </div>
                )}
              </div>

              <button 
                className="md:hidden p-2 rounded-lg hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-[#1a1a1a] p-4 slide-in">
             <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 text-lg ${
                    currentPage === item.id ? 'text-[#76b900]' : 'text-gray-300'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
             </div>
          </div>
        )}
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {currentPage === 'home' && <Home setPage={setCurrentPage} />}
        {currentPage === 'checker' && <WordChecker showToast={showToast} />}
        {currentPage === 'calculator' && <CalculatorComponent showToast={showToast} />}
        {currentPage === 'blog' && <Blog showToast={showToast} initialPostId={initialId} />}
      </main>

      <footer className="dark-glass border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo />
                <h3 className="text-lg font-bold">DetailerTools.com</h3>
              </div>
              <p className="text-sm text-gray-400">Professional Steel Detailer tools suite built by detailers, for detailers.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#76b900]">Tools</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setCurrentPage('checker')} className="hover:text-white transition-colors">Word Checker</button></li>
                <li><button onClick={() => setCurrentPage('calculator')} className="hover:text-white transition-colors">FeetInchCalc</button></li>
                <li><button onClick={() => setCurrentPage('blog')} className="hover:text-white transition-colors">Knowledge Central</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#76b900]">Connect</h4>
              <div className="flex space-x-4">
                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-white">
                  <Github className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-white">
                  <Linkedin className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 DetailerTools.com. Built with passion for Steel Detailers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}