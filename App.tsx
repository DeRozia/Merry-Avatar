import React, { useState, useRef } from 'react';
import { AppStatus } from './types';
import { generateChristmasAvatar } from './services/geminiService';
import Snowfall from './components/Snowfall';
import { Button } from './components/Button';
import { Camera, Sparkles, Upload, Download, Share2, RefreshCcw, Link as LinkIcon, Check, X, Copy } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image is too large. Please choose an image under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setGeneratedImage(null);
        setStatus(AppStatus.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setStatus(AppStatus.PROCESSING);
    
    // Smooth scroll to result area anticipation
    setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const mimeType = originalImage.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
      const result = await generateChristmasAvatar(originalImage, mimeType);
      setGeneratedImage(result);
      setStatus(AppStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `christmas-avatar-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    const shareData = {
        title: 'Christmas Avatar Maker',
        text: 'Create your festive Christmas avatar with AI! 🎄✨',
        url: currentUrl
    };

    // Check if the URL is valid for sharing (must be http/https for most browsers)
    const isShareableUrl = currentUrl.startsWith('http');

    if (navigator.share && isShareableUrl) {
        try {
            await navigator.share(shareData);
            // If successful, we are done
            return;
        } catch (err) {
            console.log('Share API failed or cancelled, falling back to modal', err);
            // Fallback continues below
        }
    }
    
    // Fallback: Open the manual share modal
    setShowShareModal(true);
  };

  const copyLinkFromModal = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
        alert('Could not auto-copy. Please select and copy the text manually.');
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setStatus(AppStatus.IDLE);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-12 font-sans text-gray-800 relative">
      <Snowfall />

      {/* Toast Notification */}
      <div 
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 transition-all duration-300 z-[60] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}
      >
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium">Link copied to clipboard!</span>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden">
                <button 
                    onClick={() => setShowShareModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">Share with friends</h3>
                <p className="text-sm text-gray-500 mb-6">Send this link to your friends so they can create their own festive avatar!</p>
                
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3 mb-4">
                    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm shrink-0">
                        <LinkIcon className="w-5 h-5 text-christmas-red" />
                    </div>
                    <input 
                        readOnly 
                        value={window.location.href} 
                        className="bg-transparent border-none text-sm text-gray-600 w-full focus:ring-0 truncate font-mono"
                        onFocus={(e) => e.target.select()}
                    />
                </div>

                <Button onClick={copyLinkFromModal} variant="primary">
                    <Copy className="w-4 h-4" />
                    Copy Link
                </Button>
            </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="bg-christmas-red text-white py-8 px-4 rounded-b-[2.5rem] shadow-lg relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-20"></div>
        
        {/* Header Share Button */}
        <button 
            onClick={handleShare}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer active:scale-90 duration-200"
            aria-label="Share App"
        >
            <Share2 className="w-5 h-5" />
        </button>

        <div className="max-w-md mx-auto text-center relative mt-4">
          <h1 className="font-festive text-5xl mb-2 animate-bounce-slow text-christmas-gold drop-shadow-md">
            Merry Avatar
          </h1>
          <p className="text-christmas-cream text-sm opacity-90 leading-relaxed max-w-[80%] mx-auto">
            Upload your avatar and let AI add a festive Christmas hat instantly!
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-8 relative z-10 space-y-8">
        
        {/* Step 1: Upload */}
        <section className={`transition-all duration-500 ${status === AppStatus.PROCESSING ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
          {!originalImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-christmas-red/30 bg-white rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-red-50 transition-colors shadow-sm active:scale-95 duration-200"
            >
              <div className="bg-red-100 p-4 rounded-full">
                <Upload className="w-10 h-10 text-christmas-red" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-700">Upload Photo</h3>
                <p className="text-gray-500 text-sm mt-1">Tap here to choose</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-3xl shadow-lg border border-red-100">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-100">
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </div>
              
              {status === AppStatus.IDLE && (
                 <div className="mt-4">
                   <Button onClick={handleGenerate}>
                     <Sparkles className="w-5 h-5 text-christmas-gold" />
                     Wear Christmas Hat
                   </Button>
                 </div>
              )}
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </section>

        {/* Step 2: Processing & Result */}
        <section ref={resultRef}>
          {status === AppStatus.PROCESSING && (
            <div className="bg-white p-8 rounded-3xl shadow-lg text-center border border-red-100 animate-pulse">
               <div className="w-16 h-16 mx-auto mb-4 border-4 border-christmas-red border-t-transparent rounded-full animate-spin"></div>
               <h3 className="text-xl font-bold text-christmas-red">Weaving Magic...</h3>
               <p className="text-gray-500 mt-2 text-sm">Finding the perfect hat size...</p>
            </div>
          )}

          {status === AppStatus.ERROR && (
            <div className="bg-red-50 p-6 rounded-3xl text-center border border-red-200">
              <h3 className="text-lg font-bold text-red-600 mb-2">Oh no! The elves are confused.</h3>
              <p className="text-sm text-gray-600 mb-4">Something went wrong. Please try a different photo or try again.</p>
              <Button onClick={() => setStatus(AppStatus.IDLE)} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {status === AppStatus.SUCCESS && generatedImage && (
            <div className="bg-white p-4 rounded-3xl shadow-xl border-2 border-christmas-gold/30 relative overflow-hidden">
               {/* Decorative Ribbon */}
               <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden z-10 pointer-events-none">
                 <div className="bg-christmas-red text-white text-xs font-bold py-1 text-center transform rotate-45 translate-x-[20%] translate-y-[20%] w-[150%] shadow-md border-b border-christmas-gold">
                   MERRY
                 </div>
               </div>

               <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-inner bg-gray-50 mb-4">
                 <img 
                   src={generatedImage} 
                   alt="Festive Result" 
                   className="w-full h-full object-cover"
                 />
               </div>

               <div className="flex gap-3">
                 <Button onClick={handleDownload} variant="primary" className="flex-1">
                   <Download className="w-5 h-5" />
                   Save
                 </Button>
                 <button 
                    onClick={handleShare}
                    className="p-4 rounded-2xl bg-christmas-green/10 text-christmas-green hover:bg-christmas-green/20 transition-colors flex items-center justify-center active:scale-95 duration-200"
                    aria-label="Share App"
                 >
                   <LinkIcon className="w-6 h-6" />
                 </button>
               </div>
               
               <div className="mt-4 text-center">
                 <button 
                   onClick={handleReset} 
                   className="text-sm text-gray-400 hover:text-christmas-red underline decoration-dotted"
                 >
                   Make another one
                 </button>
               </div>
            </div>
          )}
        </section>

        {/* Footer/Tips */}
        <section className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm text-sm text-gray-600 space-y-2">
          <h4 className="font-bold text-christmas-green flex items-center gap-2">
            <Camera className="w-4 h-4" /> 
            Pro Tips:
          </h4>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Works best with clear, front-facing photos.</li>
            <li>Supports real people, anime, cats, and dogs!</li>
            <li>If the hat looks weird, try a photo with more headroom.</li>
          </ul>
        </section>
      </main>
      
      <footer className="mt-12 text-center text-xs text-christmas-red/60 font-medium pb-8">
        <button onClick={handleShare} className="mt-2 underline opacity-70 hover:opacity-100">
            Share this with friends
        </button>
      </footer>
    </div>
  );
};

export default App;
