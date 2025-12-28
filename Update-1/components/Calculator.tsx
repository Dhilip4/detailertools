import React, { useState } from 'react';
import { Star, HelpCircle, Copy, RotateCcw, PlusSquare, MinusSquare } from 'lucide-react';

interface CalculatorProps {
  showToast?: (text: string, type?: 'success' | 'error') => void;
}

// --- Types & Utilities ---
type Mode = 'feet-inch' | 'normal' | 'convert';
type DisplayUnit = 'inches' | 'decimal' | 'mm' | 'cm' | 'm';

const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;

const formatFeetInch = (totalInches: number, accuracy: number): string => {
  const isNeg = totalInches < 0;
  const abs = Math.abs(totalInches);
  
  const feet = Math.floor(abs / 12);
  let rem = abs - (feet * 12);
  const inch = Math.floor(rem);
  
  let frac = rem - inch;
  let numerator = Math.round(frac * accuracy);

  if (numerator === accuracy) {
      rem = inch + 1;
      numerator = 0;
  }
  
  const finalFeet = feet + Math.floor((inch + (numerator === accuracy ? 1 : 0)) / 12);
  let displayInch = inch;
  
  if (Math.round(frac * accuracy) === accuracy) {
      displayInch++;
      numerator = 0;
  }
  
  if (displayInch === 12) displayInch = 0;
  
  const calcInch = Math.floor(abs - (Math.floor(abs/12)*12));
  const calcRem = abs - (Math.floor(abs/12)*12) - calcInch;
  const calcNum = Math.round(calcRem * accuracy);
  
  let outFt = Math.floor(abs/12);
  let outIn = calcInch;
  
  if(calcNum === accuracy) {
      outIn++;
      if(outIn === 12) {
          outFt++;
          outIn = 0;
      }
  }

  let fracString = '';
  const finalFracVal = calcNum === accuracy ? 0 : calcNum;
  
  if (finalFracVal > 0) {
      const div = gcd(finalFracVal, accuracy);
      const num = finalFracVal / div;
      const den = accuracy / div;
      fracString = ` ${num}/${den}`;
  }

  return (isNeg ? "- " : "") + `${outFt}' ${outIn}"` + fracString;
};

// Reusable NumPad Component
const NumPad = ({ 
    title, 
    titleColor, 
    btnColor, 
    hoverColor, 
    onNum, 
    onClear, 
    onBack 
}: {
    title: string,
    titleColor: string,
    btnColor: string,
    hoverColor: string,
    onNum: (n: number) => void,
    onClear: () => void,
    onBack: () => void
}) => (
    <div className="bg-white/5 p-2 rounded-lg border border-white/10">
        <div className={`text-center ${titleColor} text-xs font-bold mb-2`}>{title}</div>
        <div className="grid grid-cols-3 gap-2">
            {[7,8,9,4,5,6,1,2,3,0].map(n => (
                <button 
                    key={n} 
                    onClick={() => onNum(n)} 
                    className={`${btnColor} ${hoverColor} py-2 rounded text-white font-bold transition-colors`}
                >
                    {n}
                </button>
            ))}
            <button onClick={onClear} className="bg-red-800 hover:bg-red-700 py-2 rounded text-white text-xs">C</button>
            <button onClick={onBack} className="bg-red-800 hover:bg-red-700 py-2 rounded text-white text-xs">⌫</button>
        </div>
    </div>
);

// --- Main Component ---
export default function Calculator({ showToast }: CalculatorProps) {
  const [mode, setMode] = useState<Mode>('feet-inch');
  const [accuracy, setAccuracy] = useState(128);
  
  // Feet-Inch State
  const [fiFeet, setFiFeet] = useState(0);
  const [fiInch, setFiInch] = useState(0);
  const [fiFracNum, setFiFracNum] = useState(0);
  const [fiFracDen, setFiFracDen] = useState(1);
  const [fiIsNeg, setFiIsNeg] = useState(false);
  
  // Calculation State
  const [storedVal, setStoredVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(true);
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('inches');
  
  // Memory & Undo
  const [memory, setMemory] = useState(0);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  
  // Inputs
  const [customFracVal, setCustomFracVal] = useState('');
  const [convValue, setConvValue] = useState('');
  const [convFrom, setConvFrom] = useState('mm');
  const [convTo, setConvTo] = useState('fif');
  const [convResult, setConvResult] = useState('Enter value and select units');
  const [normCurrent, setNormCurrent] = useState('0');
  const [history, setHistory] = useState<string[]>([]);

  // --- LOGIC ---
  const saveState = () => {
      setUndoStack(prev => [...prev, {
          feet: fiFeet, inch: fiInch, fracNum: fiFracNum, fracDen: fiFracDen, isNeg: fiIsNeg
      }].slice(-15));
  };

  const undo = () => {
      if (undoStack.length > 0) {
          const prevState = undoStack[undoStack.length - 1];
          setFiFeet(prevState.feet);
          setFiInch(prevState.inch);
          setFiFracNum(prevState.fracNum);
          setFiFracDen(prevState.fracDen);
          setFiIsNeg(prevState.isNeg);
          setUndoStack(prev => prev.slice(0, -1));
          if (showToast) showToast("Undo successful");
      } else {
          if (showToast) showToast("Nothing to undo", "error");
      }
  };

  const getTotalInches = () => {
    let inches = (fiFeet * 12) + fiInch + (fiFracNum / fiFracDen);
    return fiIsNeg ? -inches : inches;
  };

  const setFromTotalInches = (total: number) => {
    const isNeg = total < 0;
    const abs = Math.abs(total);
    
    let ft = Math.floor(abs / 12);
    let rem = abs - (ft * 12);
    let in_val = Math.floor(rem);
    
    let frac = rem - in_val;
    let numerator = Math.round(frac * accuracy);

    if (numerator === accuracy) { in_val++; numerator = 0; }
    if (in_val === 12) { ft++; in_val = 0; }

    setFiIsNeg(isNeg);
    setFiFeet(ft);
    setFiInch(in_val);
    
    if (numerator > 0) {
        const div = gcd(numerator, accuracy);
        setFiFracNum(numerator / div);
        setFiFracDen(accuracy / div);
    } else {
        setFiFracNum(0);
        setFiFracDen(1);
    }
  };

  const prepareInput = () => {
    saveState();
    if (isNewEntry) {
        setFiFeet(0); setFiInch(0); setFiFracNum(0); setFiFracDen(1); setFiIsNeg(false);
    }
    setIsNewEntry(false);
    setDisplayUnit('inches');
  };

  const appendFeet = (n: number) => {
    prepareInput();
    setFiFeet(prev => parseInt(`${prev}${n}`));
  };

  const appendInch = (n: number) => {
    prepareInput();
    setFiInch(prev => parseInt(`${prev}${n}`));
  };

  const setFrac = (n: number, d: number) => {
    prepareInput();
    setFiFracNum(n);
    setFiFracDen(d);
  };

  const applyCustomFrac = () => {
    const val = customFracVal.trim();
    if (!val) return;
    prepareInput();

    try {
        if (val.includes('.') || (!val.includes('/') && !isNaN(parseFloat(val)))) {
            const decimal = parseFloat(val);
            if (isNaN(decimal)) throw new Error("Invalid number");
            // Decimal to fraction approx
            let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = decimal;
            let steps = 0;
            do {
                const a = Math.floor(b);
                let aux = h1; h1 = a * h1 + h2; h2 = aux;
                aux = k1; k1 = a * k1 + k2; k2 = aux;
                b = 1 / (b - a);
                steps++;
            } while (Math.abs(decimal - h1/k1) > decimal * 1.0E-6 && steps < 10 && k1 <= accuracy);
            setFiFracNum(h1); setFiFracDen(k1);
            if(showToast) showToast(`Converted decimal to ${h1}/${k1}`);
        } else if (val.includes('/')) {
            const [num, den] = val.split('/').map(Number);
            if (isNaN(num) || isNaN(den) || den <= 0) throw new Error("Invalid fraction");
            setFiFracNum(num); setFiFracDen(den);
        }
        setCustomFracVal('');
    } catch (e) {
        if(showToast) showToast("Invalid input format", "error");
    }
  };

  const handleOp = (operation: string) => {
    if (mode === 'normal') {
      if (storedVal === null) setStoredVal(parseFloat(normCurrent));
      else doCalculation();
      setOp(operation); setIsNewEntry(true); return;
    }
    const currentVal = getTotalInches();
    if (storedVal === null) setStoredVal(currentVal);
    else if (!isNewEntry) {
        const res = calculate(storedVal, currentVal, op || '+');
        setStoredVal(res); setFromTotalInches(res);
        addToHistory(`${formatFeetInch(storedVal, accuracy)} ${op} ${formatFeetInch(currentVal, accuracy)} = ${formatFeetInch(res, accuracy)}`);
    }
    setOp(operation); setIsNewEntry(true); setDisplayUnit('inches');
  };

  const doCalculation = () => {
      if (mode === 'normal') {
          if (op && storedVal !== null) {
              const current = parseFloat(normCurrent);
              const res = calculate(storedVal, current, op);
              addToHistory(`${storedVal} ${op} ${current} = ${res}`);
              setNormCurrent(res.toString());
              setStoredVal(null); setOp(null); setIsNewEntry(true);
          }
          return;
      }
      if (op && storedVal !== null) {
          const current = getTotalInches();
          const res = calculate(storedVal, current, op);
          addToHistory(`${formatFeetInch(storedVal, accuracy)} ${op} ${formatFeetInch(current, accuracy)} = ${formatFeetInch(res, accuracy)}`);
          setFromTotalInches(res);
          setStoredVal(null); setOp(null); setIsNewEntry(true);
      }
  };

  const calculate = (a: number, b: number, operation: string) => {
      switch(operation) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return b !== 0 ? a / b : 0;
          default: return b;
      }
  };

  const handleMemory = (action: 'add'|'sub'|'recall'|'clear') => {
      let current = mode === 'normal' ? parseFloat(normCurrent) : getTotalInches();
      switch(action) {
          case 'add': setMemory(p => p + current); if(showToast) showToast(`M+ ${mode==='normal'?current:formatFeetInch(current,accuracy)}`); break;
          case 'sub': setMemory(p => p - current); if(showToast) showToast(`M- ${mode==='normal'?current:formatFeetInch(current,accuracy)}`); break;
          case 'recall': 
              if (mode === 'normal') setNormCurrent(memory.toString()); else setFromTotalInches(memory);
              if(showToast) showToast("Memory Recalled"); break;
          case 'clear': setMemory(0); if(showToast) showToast("Memory Cleared"); break;
      }
  };

  const handleDirectConvert = () => {
      const val = parseFloat(convValue);
      if(isNaN(val)) { setConvResult("Invalid Number"); return; }
      let inches = 0;
      switch(convFrom) {
          case 'mm': inches = val / 25.4; break;
          case 'cm': inches = val / 2.54; break;
          case 'm': inches = val / 0.0254; break;
          case 'ft': inches = val * 12; break;
          case 'in': inches = val; break;
          case 'fif': inches = val; break;
      }
      let resultStr = "";
      switch(convTo) {
          case 'mm': resultStr = `${(inches * 25.4).toFixed(4)} mm`; break;
          case 'cm': resultStr = `${(inches * 2.54).toFixed(4)} cm`; break;
          case 'm': resultStr = `${(inches * 0.0254).toFixed(6)} m`; break;
          case 'ft': resultStr = `${(inches / 12).toFixed(6)} ft`; break;
          case 'in': resultStr = `${inches.toFixed(4)} in`; break;
          case 'fif': resultStr = formatFeetInch(inches, accuracy); break;
      }
      setConvResult(resultStr);
  };

  const addToHistory = (entry: string) => setHistory(prev => [...prev.slice(-10), entry]);

  const clearAll = () => {
      setFiFeet(0); setFiInch(0); setFiFracNum(0); setFiFracDen(1); setFiIsNeg(false);
      setStoredVal(null); setOp(null); setIsNewEntry(true); setNormCurrent('0');
      setHistory([]); setUndoStack([]); setMemory(0);
      if (showToast) showToast("All Cleared");
  };

  const handleCopy = () => {
      const val = renderDisplay();
      navigator.clipboard.writeText(val);
      if (showToast) showToast(`Copied ${val} to clipboard!`);
  };

  const renderDisplay = () => {
      if (mode === 'normal') return normCurrent;
      const total = getTotalInches();
      if (displayUnit === 'inches') return formatFeetInch(total, accuracy);
      if (displayUnit === 'decimal') return `${(total/12).toFixed(6)} ft`;
      if (displayUnit === 'mm') return `${(total * 25.4).toFixed(2)} mm`;
      if (displayUnit === 'm') return `${(total * 0.0254).toFixed(4)} m`;
      if (displayUnit === 'cm') return `${(total * 2.54).toFixed(2)} cm`;
      return formatFeetInch(total, accuracy);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
        {/* Calculator Main Panel */}
        <div className="flex-1 max-w-lg mx-auto w-full">
            <div className="bg-[#2a2a2a] p-4 rounded-xl shadow-2xl border border-gray-700">
                {/* Display */}
                <div className="bg-[#333] border border-gray-600 rounded-lg p-4 text-right mb-4 min-h-[120px] flex flex-col justify-between relative group">
                    <button onClick={handleCopy} className="absolute top-2 left-2 p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100" title="Copy"><Copy className="w-4 h-4" /></button>
                    <div className="text-gray-400 text-xs h-12 overflow-y-auto custom-scrollbar">
                        {history.map((h, i) => <div key={i}>{h}</div>)}
                    </div>
                    <div>
                        <div className="text-3xl font-mono text-white font-bold tracking-wider">{renderDisplay()}</div>
                        <div className="text-sm text-gray-400 font-mono">{mode === 'normal' ? 'Normal Calc' : ((getTotalInches()/12).toFixed(4) + ' ft')}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#3a3a3a] p-1 rounded-lg mb-4">
                    {(['feet-inch', 'normal', 'convert'] as Mode[]).map(m => (
                        <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === m ? 'bg-[#3a6db0] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>{m.replace('-', ' ').toUpperCase()}</button>
                    ))}
                </div>

                {/* Feet-Inch Controls */}
                {mode === 'feet-inch' && (
                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <NumPad 
                                title="FEET" 
                                titleColor="text-blue-300" 
                                btnColor="bg-[#3a6db0]" 
                                hoverColor="hover:bg-[#4a8ad0]" 
                                onNum={appendFeet} 
                                onClear={() => setFiFeet(0)} 
                                onBack={() => {saveState(); setFiFeet(Math.floor(fiFeet/10));}} 
                            />
                            <NumPad 
                                title="INCHES" 
                                titleColor="text-green-300" 
                                btnColor="bg-[#4a8a4a]" 
                                hoverColor="hover:bg-[#5a9a5a]" 
                                onNum={appendInch} 
                                onClear={() => setFiInch(0)} 
                                onBack={() => {saveState(); setFiInch(Math.floor(fiInch/10));}} 
                            />
                         </div>
                         
                         {/* Fractions */}
                         <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                             <div className="text-center text-teal-300 text-xs font-bold mb-2">FRACTIONS</div>
                             <div className="flex gap-2 mb-2">
                                 <input type="text" value={customFracVal} onChange={(e) => setCustomFracVal(e.target.value)} placeholder="5/32 or 0.125" className="flex-1 bg-[#3a3a3a] border border-[#4a4a4a] text-white rounded px-2 text-sm focus:border-teal-500 outline-none"/>
                                 <button onClick={applyCustomFrac} className="bg-[#4a5a6a] px-3 py-1 rounded text-xs hover:bg-[#5a6a7a]">Set</button>
                             </div>
                             <div className="grid grid-cols-4 gap-2">
                                 {[[1,16], [1,8], [3,16], [1,4], [5,16], [3,8], [7,16], [1,2], [9,16], [5,8], [11,16], [3,4], [13,16], [7,8], [15,16]].map(([n,d], i) => (
                                     <button key={i} onClick={() => setFrac(n, d)} className="bg-[#2a7a7a] hover:bg-[#3a8a8a] py-1 text-xs rounded text-white transition-colors">{n}/{d}</button>
                                 ))}
                                 <button onClick={() => { saveState(); setFiFracNum(0); setFiFracDen(1); }} className="bg-red-800 hover:bg-red-700 py-1 text-xs rounded text-white">CLR</button>
                             </div>
                         </div>
                    </div>
                )}

                {/* Normal Controls */}
                {mode === 'normal' && (
                    <div className="grid grid-cols-4 gap-2 p-2">
                         {['C', '⌫', '+/-', '/'].map(btn => (
                             <button key={btn} onClick={() => {
                                 if(btn==='C') { setNormCurrent('0'); setStoredVal(null); }
                                 else if(btn==='⌫') setNormCurrent(prev => prev.slice(0,-1) || '0');
                                 else if(btn==='/') handleOp('/');
                                 else if(btn==='+/-') setNormCurrent(prev => (parseFloat(prev)*-1).toString());
                             }} className="bg-[#4a5a6a] p-3 rounded text-white font-bold hover:brightness-110">{btn}</button>
                         ))}
                         {[7,8,9,'*',4,5,6,'-',1,2,3,'+'].map(btn => (
                             <button key={btn} onClick={() => typeof btn === 'number' ? setNormCurrent(prev => prev==='0' ? String(btn) : prev+btn) : handleOp(String(btn))} className={`p-3 rounded text-white font-bold hover:brightness-110 ${typeof btn ==='number' ? 'bg-[#4a5a6a]' : 'bg-[#d67a2a]'}`}>{btn}</button>
                         ))}
                         <button onClick={() => setNormCurrent(prev => prev==='0' ? '0' : prev+'0')} className="col-span-2 bg-[#4a5a6a] p-3 rounded text-white font-bold">0</button>
                         <button onClick={() => setNormCurrent(prev => prev.includes('.') ? prev : prev+'.')} className="bg-[#4a5a6a] p-3 rounded text-white font-bold">.</button>
                         <button onClick={doCalculation} className="bg-[#d67a2a] p-3 rounded text-white font-bold">=</button>
                    </div>
                )}
                
                {/* Convert Controls */}
                {mode === 'convert' && (
                    <div className="p-4 space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <p className="text-center text-gray-400 text-sm mb-3">Convert display value to:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setDisplayUnit('mm')} className="bg-[#4a5a6a] p-3 rounded hover:bg-[#5a6a7a]">To Millimeters</button>
                                <button onClick={() => setDisplayUnit('decimal')} className="bg-[#4a5a6a] p-3 rounded hover:bg-[#5a6a7a]">To Decimal Feet</button>
                                <button onClick={() => setDisplayUnit('inches')} className="bg-[#4a5a6a] p-3 rounded hover:bg-[#5a6a7a]">To Feet-Inch</button>
                                <button onClick={() => setDisplayUnit('m')} className="bg-[#4a5a6a] p-3 rounded hover:bg-[#5a6a7a]">To Meters</button>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="text-center text-[#2a7a7a] font-bold text-sm mb-3">DIRECT CONVERSION</h4>
                            <div className="flex gap-2 mb-2 items-center">
                                <input type="number" value={convValue} onChange={(e) => setConvValue(e.target.value)} className="flex-1 bg-[#3a3a3a] border border-[#4a4a4a] rounded p-2 text-sm focus:border-[#2a7a7a] outline-none" placeholder="Value"/>
                                <select value={convFrom} onChange={(e) => setConvFrom(e.target.value)} className="bg-[#3a3a3a] border border-[#4a4a4a] rounded p-2 text-sm outline-none">{['mm','cm','m','ft','in'].map(u => <option key={u} value={u}>{u}</option>)}</select>
                                <span className="text-gray-400 text-xs">to</span>
                                <select value={convTo} onChange={(e) => setConvTo(e.target.value)} className="bg-[#3a3a3a] border border-[#4a4a4a] rounded p-2 text-sm outline-none">{['fif','mm','cm','m','ft','in'].map(u => <option key={u} value={u}>{u}</option>)}</select>
                            </div>
                            <button onClick={handleDirectConvert} className="w-full bg-[#4a5a6a] hover:bg-[#5a6a7a] py-2 rounded text-sm font-bold mb-2">Convert</button>
                            <div className="bg-[#1a1a1a] p-2 rounded text-center text-gray-300 min-h-[40px] flex items-center justify-center border border-gray-700">{convResult}</div>
                        </div>
                    </div>
                )}

                {/* Operations & Accuracy */}
                <div className="mt-4 border-t border-gray-600 pt-4">
                     <div className="flex justify-between mb-2"><span className="text-xs text-teal-300 font-bold">ACCURACY</span></div>
                     <div className="flex gap-2 mb-4">
                         {[16,32,64,128].map(acc => (
                             <button key={acc} onClick={() => setAccuracy(acc)} className={`flex-1 text-xs py-1 rounded border border-gray-600 ${accuracy === acc ? 'bg-[#2a7a7a] text-white' : 'text-gray-400'}`}>1/{acc}</button>
                         ))}
                     </div>
                     <div className="grid grid-cols-4 gap-2">
                         {['+', '-', '*', '/'].map(o => (
                             <button key={o} onClick={() => handleOp(o)} className="bg-[#d67a2a] hover:bg-[#e68a3a] py-2 rounded text-white font-bold text-lg">{o === '*' ? '×' : o === '/' ? '÷' : o}</button>
                         ))}
                         <button onClick={() => doCalculation()} className="col-span-2 bg-green-700 hover:bg-green-600 py-2 rounded text-white font-bold">=</button>
                         <button onClick={() => fiIsNeg ? setFiIsNeg(false) : setFiIsNeg(true)} className="bg-[#d67a2a] hover:bg-[#e68a3a] py-2 rounded text-white font-bold">+/-</button>
                         <button onClick={() => setDisplayUnit(prev => prev === 'decimal' ? 'inches' : 'decimal')} className="bg-[#d67a2a] hover:bg-[#e68a3a] py-2 rounded text-white font-bold">Dec</button>
                     </div>
                     <div className="grid grid-cols-4 gap-2 mt-4 pt-2 border-t border-gray-700">
                        <button onClick={() => handleMemory('recall')} className="bg-[#4a5a6a] py-2 rounded text-white text-xs font-bold hover:brightness-110">MR</button>
                        <button onClick={() => handleMemory('clear')} className="bg-[#4a5a6a] py-2 rounded text-white text-xs font-bold hover:brightness-110">MC</button>
                        <button onClick={() => handleMemory('add')} className="bg-[#4a5a6a] py-2 rounded text-white text-xs font-bold hover:brightness-110 flex items-center justify-center gap-1"><PlusSquare size={14}/>M</button>
                        <button onClick={() => handleMemory('sub')} className="bg-[#4a5a6a] py-2 rounded text-white text-xs font-bold hover:brightness-110 flex items-center justify-center gap-1"><MinusSquare size={14}/>M</button>
                        <button onClick={clearAll} className="bg-red-900 hover:bg-red-800 py-2 rounded text-white font-bold text-xs">AC</button>
                        <button onClick={prepareInput} className="bg-red-900 hover:bg-red-800 py-2 rounded text-white font-bold text-xs">CE</button>
                        <button onClick={handleCopy} className="bg-[#4a5a6a] py-2 rounded text-white text-xs font-bold hover:brightness-110 flex items-center justify-center"><Copy size={14}/></button>
                        <button onClick={undo} className="bg-[#4a5a6a] py-2 rounded text-white text-xs font-bold hover:brightness-110 flex items-center justify-center"><RotateCcw size={14}/></button>
                     </div>
                </div>
            </div>
        </div>
        
        {/* Sidebar Info */}
        <div className="w-full lg:w-80 space-y-4">
            <div className="nvidia-card p-6 rounded-xl">
                <h3 className="text-[#76b900] font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5" /> FeetInchCalc Features</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Dual keypad for feet & inches</li>
                    <li>• Precision fraction support (1/128)</li>
                    <li>• Memory functions (M+, M-, MR, MC)</li>
                    <li>• Undo last action</li>
                    <li>• Smart decimal-to-fraction input</li>
                </ul>
            </div>
            <div className="nvidia-card p-6 rounded-xl">
                <h3 className="text-[#76b900] font-bold mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Usage Tips</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Type 0.125 in custom fraction to get 1/8</li>
                    <li>• Use Direct Conversion tab for specific units</li>
                    <li>• Tap +/- to toggle negative values</li>
                </ul>
            </div>
        </div>
    </div>
  );
}