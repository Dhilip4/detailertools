import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, ListChecks, Play, CheckCircle, AlertCircle, Download, Trash2, LucideIcon, Star, HelpCircle } from 'lucide-react';

interface CheckResult {
  word: string;
  expectedCount: number;
  actualCount: number;
  status: 'MATCHED' | 'MISMATCH';
  difference: number;
}

interface WordCheckerProps {
  showToast?: (text: string, type?: 'success' | 'error') => void;
}

// Reusable File Upload Tile
const FileUploadTile = ({
  title,
  icon: Icon,
  file,
  inputRef,
  onUpload,
  accept,
  placeholder
}: {
  title: string,
  icon: LucideIcon,
  file: File | null,
  inputRef: React.RefObject<HTMLInputElement>,
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  accept: string,
  placeholder: string
}) => (
  <div className="nvidia-card p-6 rounded-xl flex-1 border-white/5">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="text-[#76b900]" />
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    <div
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-[#76b900]/30 hover:border-[#76b900] bg-[#76b900]/5 rounded-xl p-8 text-center cursor-pointer transition-colors h-32 flex flex-col justify-center items-center"
    >
      <input type="file" ref={inputRef} onChange={onUpload} accept={accept} className="hidden" />
      <UploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <p className="text-xs font-medium text-gray-300">{file ? file.name : placeholder}</p>
    </div>
    {file && <div className="mt-3 text-xs text-green-400 flex items-center gap-1 justify-center"><CheckCircle className="w-3 h-3" /> Ready</div>}
  </div>
);

export default function WordChecker({ showToast }: WordCheckerProps) {
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docText, setDocText] = useState('');
  const [wordListFile, setWordListFile] = useState<File | null>(null);
  const [wordList, setWordList] = useState<{ word: string, expectedCount: number }[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [filter, setFilter] = useState<'all' | 'matched' | 'mismatch'>('all');

  // Settings
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWords, setWholeWords] = useState(true);

  const docInputRef = useRef<HTMLInputElement>(null);
  const listInputRef = useRef<HTMLInputElement>(null);

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocFile(file);
      const text = await file.text();
      setDocText(text);
      if (showToast) showToast(`Document "${file.name}" loaded`);
    }
  };

  const handleListUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setWordListFile(file);
      const text = await file.text();

      const lines = text.split('\n');
      const parsed = lines
        .map(line => {
          const [word, count] = line.split(',');
          return { word: word?.trim(), expectedCount: parseInt(count?.trim() || '0') };
        })
        .filter(item => item.word && !isNaN(item.expectedCount));

      setWordList(parsed);
      if (showToast) showToast(`Word list loaded with ${parsed.length} items`);
    }
  };

  const processFiles = () => {
    if (!docText || wordList.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const newResults: CheckResult[] = wordList.map(({ word, expectedCount }) => {
        let actualCount = 0;
        const flags = 'g' + (caseSensitive ? '' : 'i');

        try {
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (wholeWords) {
            const pattern = '\\b' + escapedWord + '\\b';
            const regex = new RegExp(pattern, flags);
            actualCount = (docText.match(regex) || []).length;
          } else {
            const regex = new RegExp(escapedWord, flags);
            actualCount = (docText.match(regex) || []).length;
          }
        } catch (e) {
          console.error("Regex error", e);
        }

        return {
          word,
          expectedCount,
          actualCount,
          status: actualCount === expectedCount ? 'MATCHED' : 'MISMATCH',
          difference: actualCount - expectedCount
        };
      });

      setResults(newResults);
      setIsProcessing(false);
      if (showToast) showToast("Analysis complete!", "success");
    }, 1000);
  };

  const resetAll = () => {
    setDocFile(null);
    setDocText('');
    setWordListFile(null);
    setWordList([]);
    setResults([]);
    if (docInputRef.current) docInputRef.current.value = '';
    if (listInputRef.current) listInputRef.current.value = '';
    if (showToast) showToast("All fields reset");
  };

  const downloadCSV = () => {
    if (results.length === 0) return;

    // Header
    const headers = ["Status", "Keyword", "Expected Count", "Found Count", "Difference"];

    // Format data rows
    const rows = results.map(r => [
      r.status,
      `"${r.word.replace(/"/g, '""')}"`, // Escape commas/quotes in keywords
      r.expectedCount,
      r.actualCount,
      r.difference
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `word_checker_results_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast("Results exported to CSV", "success");
  };

  const filteredResults = results.filter(r => {
    if (filter === 'all') return true;
    return filter === 'matched' ? r.status === 'MATCHED' : r.status === 'MISMATCH';
  });

  return (
    <div className="flex flex-col xl:flex-row gap-8">

      {/* --- Main Functionality Panel --- */}
      <div className="flex-1 space-y-8 min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black glow-text">Word Cross-Checker</h1>
          {(docFile || wordListFile) && (
            <button onClick={resetAll} className="text-gray-400 hover:text-red-400 flex items-center gap-2 transition-colors text-xs font-bold uppercase tracking-wider">
              <Trash2 className="w-4 h-4" /> Reset Workspace
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <FileUploadTile
            title="1. Source Document"
            icon={FileText}
            file={docFile}
            inputRef={docInputRef}
            onUpload={handleDocUpload}
            accept=".txt"
            placeholder="Upload BOM or Text"
          />
          <FileUploadTile
            title="2. Verification List"
            icon={ListChecks}
            file={wordListFile}
            inputRef={listInputRef}
            onUpload={handleListUpload}
            accept=".txt,.csv"
            placeholder="Upload CSV Key"
          />
        </div>

        {/* Analysis Controls */}
        <div className="nvidia-card p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border-white/5">
          <div className="flex gap-8">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} className="w-5 h-5 rounded text-[#76b900] focus:ring-[#76b900] bg-gray-900 border-gray-700" />
              <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">Case Sensitive</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" checked={wholeWords} onChange={e => setWholeWords(e.target.checked)} className="w-5 h-5 rounded text-[#76b900] focus:ring-[#76b900] bg-gray-900 border-gray-700" />
              <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">Exact Words Only</span>
            </label>
          </div>

          <button
            onClick={processFiles}
            disabled={!docFile || !wordListFile || isProcessing}
            className="nvidia-button px-10 py-3 rounded-xl font-black text-sm flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center shadow-2xl"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Play className="fill-white w-5 h-5" />
            )}
            {isProcessing ? 'Analyzing...' : 'Execute Verification'}
          </button>
        </div>

        {/* Results Area */}
        {results.length > 0 && (
          <div className="space-y-8 slide-in">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-[#111] border border-gray-800 p-6 rounded-2xl text-center shadow-inner">
                <div className="text-3xl font-black mb-1">{results.length}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Total Items</div>
              </div>
              <div className="bg-[#111] border border-green-900/30 p-6 rounded-2xl text-center shadow-inner">
                <div className="text-3xl font-black text-green-400 mb-1">{results.filter(r => r.status === 'MATCHED').length}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Validated</div>
              </div>
              <div className="bg-[#111] border border-red-900/30 p-6 rounded-2xl text-center shadow-inner">
                <div className="text-3xl font-black text-red-500 mb-1">{results.filter(r => r.status === 'MISMATCH').length}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Discrepancies</div>
              </div>
              <div className="bg-[#111] border border-gray-800 p-6 rounded-2xl text-center shadow-inner">
                <div className="text-3xl font-black text-[#76b900] mb-1">
                  {((results.filter(r => r.status === 'MATCHED').length / results.length) * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Accuracy Rating</div>
              </div>
            </div>

            {/* Detailed List */}
            <div className="nvidia-card p-0 rounded-2xl overflow-hidden border-white/5">
              <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center bg-[#151515] gap-4">
                <div className="flex bg-black/40 rounded-xl p-1 text-xs font-bold">
                  <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-[#76b900] text-black' : 'text-gray-500 hover:text-white'}`}>Show All</button>
                  <button onClick={() => setFilter('matched')} className={`px-4 py-2 rounded-lg transition-all ${filter === 'matched' ? 'bg-[#76b900] text-black' : 'text-gray-500 hover:text-white'}`}>Matched</button>
                  <button onClick={() => setFilter('mismatch')} className={`px-4 py-2 rounded-lg transition-all ${filter === 'mismatch' ? 'bg-[#76b900] text-black' : 'text-gray-500 hover:text-white'}`}>Errors</button>
                </div>
                <button
                  onClick={downloadCSV}
                  className="px-5 py-2 bg-[#76b900]/10 text-[#76b900] border border-[#76b900]/20 rounded-xl text-xs font-black hover:bg-[#76b900]/20 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export results as CSV
                </button>
              </div>

              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[#0a0a0a] text-gray-500 font-black uppercase text-[10px] tracking-widest sticky top-0 z-10 border-b border-gray-800">
                    <tr>
                      <th className="px-8 py-5">Result</th>
                      <th className="px-8 py-5">Keyword Profile</th>
                      <th className="px-8 py-5 text-right">Target</th>
                      <th className="px-8 py-5 text-right">Observed</th>
                      <th className="px-8 py-5 text-right">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 bg-[#111]">
                    {filteredResults.map((res, i) => (
                      <tr key={i} className={`group hover:bg-white/5 transition-colors ${res.status === 'MISMATCH' ? 'bg-red-500/[0.02]' : ''}`}>
                        <td className="px-8 py-5">
                          {res.status === 'MATCHED' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                        </td>
                        <td className="px-8 py-5 font-mono text-gray-300 group-hover:text-white transition-colors">{res.word}</td>
                        <td className="px-8 py-5 text-right text-gray-500 font-medium">{res.expectedCount}</td>
                        <td className="px-8 py-5 text-right font-black text-white">{res.actualCount}</td>
                        <td className={`px-8 py-5 text-right font-black ${res.difference === 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {res.difference > 0 ? `+${res.difference}` : res.difference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Sidebar Info --- */}
      <div className="w-full xl:w-80 space-y-6">
        <div className="nvidia-card p-8 rounded-3xl border-white/5">
          <h3 className="text-[#76b900] font-black mb-6 flex items-center gap-3 uppercase text-sm tracking-widest"><Star className="w-5 h-5" /> Pro Insights</h3>
          <ul className="text-sm text-gray-400 space-y-5 leading-relaxed">
            <li className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-[#76b900] mt-2 shrink-0"></div> <p><span className="text-white font-bold">Regex Engine:</span> Utilizes native ECMAScript regex for ultra-precise word boundary detection.</p></li>
            <li className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-[#76b900] mt-2 shrink-0"></div> <p><span className="text-white font-bold">Data Sovereignty:</span> All verification happens strictly in your browser. Files never touch our servers.</p></li>
            <li className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-[#76b900] mt-2 shrink-0"></div> <p><span className="text-white font-bold">CSV Standards:</span> Exporting follows RFC 4180 standards for compatibility with Excel and Tekla.</p></li>
          </ul>
        </div>

        <div className="nvidia-card p-8 rounded-3xl border-[#76b900]/20 bg-[#76b900]/5">
          <h3 className="text-white font-black mb-6 flex items-center gap-3 uppercase text-sm tracking-widest"><HelpCircle className="w-5 h-5 text-[#76b900]" /> Best Practices</h3>
          <div className="space-y-6 text-sm text-gray-400">
            <div>
              <p className="font-bold text-white mb-3">Drawing Log Checks:</p>
              <p className="leading-relaxed">Export your drawing log as a .txt file. Upload your count summary as the "Verification List". Perfect for multi-drawing assembly checks.</p>
            </div>
            <div className="bg-black/60 p-4 rounded-2xl border border-white/5">
              <p className="font-bold text-[#76b900] mb-2 text-xs">CSV TIP:</p>
              <p className="text-xs font-mono text-gray-500">Assembly Mark, Quantity<br />B1,14<br />C1,8<br />PL,42</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);