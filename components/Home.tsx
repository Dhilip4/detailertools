import React, { useState, useEffect, useRef } from 'react';
import { Search, Calculator, BookOpen, LucideIcon, ArrowRight, Zap, Layers, Cpu, Box, CheckCircle, Database, Hammer, Link } from 'lucide-react';
import { BLOG_POSTS } from './blogData';

interface HomeProps {
  setPage: (page: any) => void;
}

interface ToolItem {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

// Tool Configuration
const TOOLS: ToolItem[] = [
  {
    id: 'aisc-library',
    label: 'AISC Library',
    icon: Database,
    desc: 'Shape Database Sizing.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'group-hover:border-cyan-500/50'
  },
  {
    id: 'connection-detailing',
    label: 'Connection Detailing',
    icon: Link,
    desc: 'Bolts, Gages, & Anchors.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'group-hover:border-orange-500/50'
  },
  {
    id: 'welding',
    label: 'Welding',
    icon: Hammer,
    desc: 'Weld Access & Symbols.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'group-hover:border-red-500/50'
  },
  {
    id: 'checker',
    label: 'Word Checker',
    icon: Search,
    desc: 'Eliminate errors instantly.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'group-hover:border-purple-500/50'
  },
  {
    id: 'calculator',
    label: 'FeetInchCalc',
    icon: Calculator,
    desc: '1/128" precision math.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'group-hover:border-blue-500/50'
  },
  {
    id: 'blog',
    label: 'Knowledge Central',
    icon: BookOpen,
    desc: 'Tips, Tutorials & Updates.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'group-hover:border-green-500/50'
  }
];

// --- Sub-Components ---

// 1. Typewriter Effect
const Typewriter = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let currentIndex = 0;

    const startTyping = () => {
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(prev => text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    };

    timeout = setTimeout(startTyping, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-gray-300">
      {displayText}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} text-[#76b900] font-bold`}>_</span>
    </span>
  );
};

// 2. Spotlight Card
const SpotlightCard: React.FC<{ tool: ToolItem; onClick: () => void }> = ({ tool, onClick }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`relative rounded-xl p-[1px] cursor-pointer overflow-hidden group transition-transform duration-300 hover:-translate-y-1`}
      style={{
        background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(118, 185, 0, 0.4), transparent 40%)`
      }}
    >
      <div className="relative h-full bg-[#1a1a1a] rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition-colors z-10 flex flex-col items-start text-left">
        <div className="flex items-center gap-3 mb-2 w-full">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${tool.bg}`}>
            <tool.icon className={`h-5 w-5 ${tool.color}`} />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#76b900] transition-colors">{tool.label}</h3>
          <ArrowRight className="w-4 h-4 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{tool.desc}</p>
      </div>
    </div>
  );
};

// 3. Pulse Card
const PulseCard = ({
  title,
  icon: Icon,
  iconColor,
  items,
  onNavigate,
  markerClass
}: {
  title: string,
  icon: LucideIcon,
  iconColor: string,
  items: { title: string }[],
  onNavigate: () => void,
  markerClass: string
}) => (
  <div className="nvidia-card p-6 rounded-xl h-full flex flex-col border border-gray-800 bg-[#1a1a1a]">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-[#252525] border border-gray-700`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="font-bold text-lg text-white">{title}</h3>
      </div>
      <button onClick={onNavigate} className="p-2 rounded-full hover:bg-white/10 transition-colors">
        <ArrowRight className="w-4 h-4 text-gray-500 hover:text-white" />
      </button>
    </div>
    <div className="space-y-4 flex-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 group cursor-pointer" onClick={onNavigate}>
          <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${markerClass}`}></div>
          <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors line-clamp-2">{item.title}</p>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-gray-600 italic">No items yet.</p>}
    </div>
  </div>
);

export default function Home({ setPage }: HomeProps) {
  // Read directly from the shared data source (blogData.ts)
  // We take the top 5 most recent posts (assuming BLOG_POSTS is ordered or we could sort by date/id)
  const recentBlogs = BLOG_POSTS.slice(0, 5).map(post => ({ title: post.title }));

  return (
    <div className="space-y-8 pb-10">
      <style>{`
        /* 3D Cube Animation */
        .scene {
          width: 200px;
          height: 200px;
          perspective: 600px;
          margin: 0 auto;
        }
        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: spin 15s infinite linear;
        }
        .face {
          position: absolute;
          width: 200px;
          height: 200px;
          border: 2px solid rgba(118, 185, 0, 0.3);
          background: rgba(118, 185, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
          color: white;
          box-shadow: 0 0 20px rgba(118, 185, 0, 0.1);
          backdrop-filter: blur(2px);
        }
        .face-front  { transform: rotateY(0deg) translateZ(100px); }
        .face-back   { transform: rotateY(180deg) translateZ(100px); }
        .face-right  { transform: rotateY(90deg) translateZ(100px); }
        .face-left   { transform: rotateY(-90deg) translateZ(100px); }
        .face-top    { transform: rotateX(90deg) translateZ(100px); }
        .face-bottom { transform: rotateX(-90deg) translateZ(100px); }

        @keyframes spin {
          0% { transform: rotateX(-20deg) rotateY(0deg); }
          100% { transform: rotateX(-20deg) rotateY(360deg); }
        }

        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(118, 185, 0, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(118, 185, 0, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }
      `}</style>

      {/* --- NEW SPLIT HERO SECTION --- */}
      <section className="relative pt-2 px-2">
        <div className="relative rounded-3xl p-8 lg:p-12 overflow-hidden border border-[#76b900]/20 bg-[#0f0f0f] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-7xl mx-auto">

          {/* Background Grid */}
          <div className="absolute inset-0 bg-grid-pattern pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none"></div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#76b900]/10 border border-[#76b900]/20 text-[#76b900] text-xs font-bold uppercase tracking-wide mb-2 animate-pulse">
                <Zap className="w-3 h-3" /> v3.0 System Online
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
                The Detailer's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#76b900] to-green-400">Toolkit</span>
              </h1>

              <div className="h-12 text-sm md:text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                <Typewriter text="Automate checking. Calculate instantly. Build flawlessly." delay={300} />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setPage('checker')}
                  className="w-full sm:w-auto nvidia-button px-8 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transform transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#76b900]/20"
                >
                  <Search className="h-4 w-4" />
                  Launch Word Checker
                </button>
                <button
                  onClick={() => setPage('calculator')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1a1a1a] hover:bg-[#252525] rounded-xl text-white font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500"
                >
                  <Calculator className="h-4 w-4 text-gray-400 group-hover:text-white" />
                  FeetInchCalc
                </button>
              </div>

              <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[#76b900]" /> Free for Everyone</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[#76b900]" /> No Installation</div>
              </div>
            </div>

            {/* Right: 3D Animation (Now Visible on All Screens) */}
            <div className="flex items-center justify-center h-[250px] lg:h-[300px] perspective-container mt-4 lg:mt-0">
              <div className="scene transform scale-75 sm:scale-90 md:scale-100">
                <div className="cube">
                  <div className="face face-front"><Search size={60} strokeWidth={1} /></div>
                  <div className="face face-back"><Calculator size={60} strokeWidth={1} /></div>
                  <div className="face face-right"><Layers size={60} strokeWidth={1} /></div>
                  <div className="face face-left"><Box size={60} strokeWidth={1} /></div>
                  <div className="face face-top"><Cpu size={60} strokeWidth={1} /></div>
                  <div className="face face-bottom"><Zap size={60} strokeWidth={1} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TOOLS GRID --- */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-[#76b900] rounded-full"></div>
            <h2 className="text-xl font-bold text-white">Professional Tools</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => (
            <SpotlightCard key={tool.id} tool={tool} onClick={() => setPage(tool.id)} />
          ))}
        </div>
      </section>

      {/* --- LATEST NEWS --- */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-white">Latest from Knowledge Central</h2>
        </div>
        <PulseCard
          title="Recent Articles"
          icon={BookOpen}
          iconColor="text-green-400"
          items={recentBlogs}
          onNavigate={() => setPage('blog')}
          markerClass="bg-[#76b900] shadow-[0_0_8px_#76b900]"
        />
      </section>
    </div>
  );
}