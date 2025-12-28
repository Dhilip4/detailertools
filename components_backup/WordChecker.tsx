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
    <div className="nvidia-card p-6 rounded-xl flex-1">
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
  const [wordList, setWordList] = useState<{word: string, expectedCount: number}[]>([]);
  
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
          if (wholeWords) {
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = '\\b' + escapedWord + '\\b';
            const regex = new RegExp(pattern, flags);
            actualCount = (docText.match(regex) || []).length;
          } else {
             const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  const filteredResults = results.filter(r => {
    if (filter === 'all') return true;
    return filter === 'matched' ? r.status === 'MATCHED' : r.status === 'MISMATCH';
  });

  return (
    <div className="flex flex-col xl:flex-row gap-8">
        
        {/* --- Main Functionality Panel --- */}
        <div className="flex-1 space-y-8 min-w-0">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold glow-text">Word Cross-Checker</h1>
                {(docFile || wordListFile) && (
                    <button onClick={resetAll} className="text-gray-400 hover:text-red-400 flex items-center gap-2 transition-colors text-sm">
                        <Trash2 className="w-4 h-4" /> Reset
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <FileUploadTile 
                title="1. Source Text" 
                icon={FileText} 
                file={docFile} 
                inputRef={docInputRef} 
                onUpload={handleDocUpload} 
                accept=".txt" 
                placeholder="Upload .txt" 
                />
                <FileUploadTile 
                title="2. Word List" 
                icon={ListChecks} 
                file={wordListFile} 
                inputRef={listInputRef} 
                onUpload={handleListUpload} 
                accept=".txt,.csv" 
                placeholder="Upload .csv" 
                />
            </div>

            {/* Analysis Controls */}
            <div className="nvidia-card p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-6">
                <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} className="rounded text-[#76b900] focus:ring-[#76b900] bg-gray-700 border-gray-600" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Case Sensitive</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" checked={wholeWords} onChange={e => setWholeWords(e.target.checked)} className="rounded text-[#76b900] focus:ring-[#76b900] bg-gray-700 border-gray-600" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Match Whole Words</span>
                </label>
                </div>
                
                <button 
                onClick={processFiles}
                disabled={!docFile || !wordListFile || isProcessing}
                className="nvidia-button px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center shadow-lg"
                >
                {isProcessing ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                    <Play className="fill-white w-4 h-4" />
                )}
                {isProcessing ? 'Processing...' : 'Run Analysis'}
                </button>
            </div>

            {/* Results Area */}
            {results.length > 0 && (
                <div className="space-y-6 slide-in">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold">{results.length}</div>
                            <div className="text-xs text-gray-400 uppercase">Items</div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-green-900/50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-green-400">{results.filter(r => r.status === 'MATCHED').length}</div>
                            <div className="text-xs text-gray-400 uppercase">Matched</div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-red-900/50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-red-400">{results.filter(r => r.status === 'MISMATCH').length}</div>
                            <div className="text-xs text-gray-400 uppercase">Errors</div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-blue-400">
                                {((results.filter(r => r.status === 'MATCHED').length / results.length) * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-400 uppercase">Accuracy</div>
                        </div>
                    </div>

                    {/* Detailed List */}
                    <div className="nvidia-card p-0 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#1e1e1e]">
                            <div className="flex bg-gray-800 rounded-lg p-1 text-xs">
                                <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded transition-colors ${filter === 'all' ? 'bg-[#76b900] text-black font-bold' : 'text-gray-400 hover:text-white'}`}>All</button>
                                <button onClick={() => setFilter('matched')} className={`px-3 py-1 rounded transition-colors ${filter === 'matched' ? 'bg-[#76b900] text-black font-bold' : 'text-gray-400 hover:text-white'}`}>Matched</button>
                                <button onClick={() => setFilter('mismatch')} className={`px-3 py-1 rounded transition-colors ${filter === 'mismatch' ? 'bg-[#76b900] text-black font-bold' : 'text-gray-400 hover:text-white'}`}>Errors</button>
                            </div>
                            <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                                <Download className="w-3 h-3" /> CSV
                            </button>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#151515] text-gray-500 text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Keyword</th>
                                        <th className="px-6 py-3 text-right">Expected</th>
                                        <th className="px-6 py-3 text-right">Found</th>
                                        <th className="px-6 py-3 text-right">Diff</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredResults.map((res, i) => (
                                        <tr key={i} className={`hover:bg-white/5 transition-colors ${res.status === 'MISMATCH' ? 'bg-red-900/5' : ''}`}>
                                            <td className="px-6 py-3">
                                                {res.status === 'MATCHED' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                            </td>
                                            <td className="px-6 py-3 font-mono text-gray-300">{res.word}</td>
                                            <td className="px-6 py-3 text-right text-gray-400">{res.expectedCount}</td>
                                            <td className="px-6 py-3 text-right font-bold">{res.actualCount}</td>
                                            <td className={`px-6 py-3 text-right font-bold ${res.difference === 0 ? 'text-green-500' : 'text-red-500'}`}>
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
        <div className="w-full xl:w-80 space-y-4">
            <div className="nvidia-card p-6 rounded-xl">
                <h3 className="text-[#76b900] font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5" /> Key Features</h3>
                <ul className="text-sm text-gray-300 space-y-3">
                    <li className="flex gap-2"><span className="text-[#76b900]">•</span> Regex-powered exact word matching</li>
                    <li className="flex gap-2"><span className="text-[#76b900]">•</span> Supports .txt and .csv file inputs</li>
                    <li className="flex gap-2"><span className="text-[#76b900]">•</span> Instant count comparison verification</li>
                    <li className="flex gap-2"><span className="text-[#76b900]">•</span> Filterable results (Matched/Errors)</li>
                    <li className="flex gap-2"><span className="text-[#76b900]">•</span> Privacy focused (client-side processing)</li>
                </ul>
            </div>
            
            <div className="nvidia-card p-6 rounded-xl border border-blue-500/20 bg-blue-900/5">
                <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Usage Tips</h3>
                <div className="space-y-4 text-sm text-gray-300">
                    <div>
                        <p className="font-bold text-white mb-1">CSV Format:</p>
                        <p className="bg-black/30 p-2 rounded font-mono text-xs text-gray-400">
                            B1,14<br/>
                            C1,8<br/>
                            PL,42
                        </p>
                        <p className="text-xs mt-1 text-gray-500">Format: "Assembly Mark, Quantity"</p>
                    </div>
                    <div>
                        <p className="font-bold text-white mb-1">Checking Drawings:</p>
                        <p>Export your drawing list or BOM to a text file. Upload it as "Source Text". Upload your quantity list as "Word List".</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}