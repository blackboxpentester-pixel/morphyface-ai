
import React, { useState, useCallback, useRef } from 'react';
import { Button } from './components/Button';
import { geminiService } from './services/geminiService';
import { MorphState, MorphHistoryItem } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<MorphState>({
    originalImage: null,
    morphedImage: null,
    prompt: "Turn this face into a futuristic cyborg with neon accents",
    seed: Math.floor(Math.random() * 1000000),
    isProcessing: false,
    error: null
  });

  const [history, setHistory] = useState<MorphHistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({
          ...prev,
          originalImage: e.target?.result as string,
          morphedImage: null,
          error: null
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomSeed = () => {
    setState(prev => ({ ...prev, seed: Math.floor(Math.random() * 1000000) }));
  };

  const handleMorph = async () => {
    if (!state.originalImage) {
      setState(prev => ({ ...prev, error: "Please upload a face image first." }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await geminiService.morphFace(
        state.originalImage,
        state.prompt,
        state.seed
      );

      setState(prev => ({
        ...prev,
        morphedImage: result,
        isProcessing: false
      }));

      // Add to history
      const newItem: MorphHistoryItem = {
        id: Date.now().toString(),
        originalImage: state.originalImage,
        morphedImage: result,
        prompt: state.prompt,
        seed: state.seed,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || "Failed to morph face. Please try again.",
        isProcessing: false
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">M</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">MorphyFace <span className="text-indigo-500 italic font-medium">AI</span></h1>
          </div>
          <div className="hidden md:block text-slate-400 text-sm">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column: Controls */}
          <section className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                Transformation Controls
              </h2>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Upload Face</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors text-center ${
                      state.originalImage ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                    }`}
                  >
                    {state.originalImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <img 
                          src={state.originalImage} 
                          alt="Original" 
                          className="w-32 h-32 object-cover rounded-lg shadow-md"
                        />
                        <span className="text-xs text-indigo-400">Click to change image</span>
                      </div>
                    ) : (
                      <div className="py-8">
                        <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-sm text-slate-400">Click to upload or drag and drop</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Morph Instruction</label>
                  <textarea 
                    value={state.prompt}
                    onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none h-24"
                    placeholder="Describe how to change the face..."
                  />
                </div>

                {/* Seed Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-400">Generation Seed</label>
                    <button 
                      onClick={generateRandomSeed}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Randomize
                    </button>
                  </div>
                  <input 
                    type="number"
                    value={state.seed}
                    onChange={(e) => setState(prev => ({ ...prev, seed: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Error Display */}
                {state.error && (
                  <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {state.error}
                  </div>
                )}

                <Button 
                  onClick={handleMorph}
                  isLoading={state.isProcessing}
                  className="w-full h-12 text-lg"
                  disabled={!state.originalImage || state.isProcessing}
                >
                  {state.isProcessing ? 'Morphing Face...' : 'Generate Morph'}
                </Button>
              </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Recent Morphs</h3>
                <div className="grid grid-cols-5 gap-2">
                  {history.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        originalImage: item.originalImage, 
                        morphedImage: item.morphedImage,
                        prompt: item.prompt,
                        seed: item.seed
                      }))}
                      className="aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition-colors"
                    >
                      <img src={item.morphedImage} alt="Morphed" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Output */}
          <section className="flex flex-col h-full">
            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden relative min-h-[400px] flex flex-col shadow-2xl">
              <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-400 uppercase">Live Result</span>
                {state.morphedImage && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30">
                      SEED: {state.seed}
                    </span>
                    <a 
                      href={state.morphedImage} 
                      download={`morph-seed-${state.seed}.png`}
                      className="text-slate-400 hover:text-white"
                      title="Download Image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {state.isProcessing ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <svg className="w-10 h-10 text-indigo-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Analyzing facial features...</h3>
                      <p className="text-sm text-slate-400 mt-1">Applying neural transformations based on seed {state.seed}</p>
                    </div>
                  </div>
                ) : state.morphedImage ? (
                  <div className="w-full h-full flex items-center justify-center group relative">
                    <img 
                      src={state.morphedImage} 
                      alt="Resulting Morph" 
                      className="max-w-full max-h-full rounded-lg shadow-2xl object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    {/* Before/After Float */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                      Morphed Output
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                      <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-slate-400 font-medium">Ready for generation</h3>
                    <p className="text-slate-600 text-sm mt-1 max-w-[240px]">Upload a photo and hit generate to see the transformation magic.</p>
                  </div>
                )}
              </div>
              
              {state.morphedImage && (
                <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Seed Logic</span>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed italic">
                    "This generation utilized seed <span className="text-indigo-400 font-mono font-bold">{state.seed}</span>. You can reuse this exact seed with the same prompt and original image to reproduce this variation, or change it to discover new facial structures."
                   </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs text-slate-400">
                <strong className="text-slate-200">Tip:</strong> For best results, use a clear portrait with good lighting. Simple prompts like "turn into a vampire" or "make it look like an oil painting" work best with the <code className="bg-slate-800 px-1 rounded">gemini-2.5-flash-image</code> model.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2024 MorphyFace AI. Built for the Gemini Challenge.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</a>
            <a href="https://ai.google.dev" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">Get API Key</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
