import React, { useState, useEffect } from 'react';
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Instagram, 
  Image as ImageIcon, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Send 
} from 'lucide-react';

const PLATFORMS = {
  twitter: {
    id: 'twitter',
    name: 'Twitter (X)',
    charLimit: 280,
    icon: Twitter,
    color: 'bg-slate-900 text-white border-slate-900',
    activeColor: 'ring-slate-900',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    charLimit: 3000,
    icon: Linkedin,
    color: 'bg-blue-700 text-white border-blue-700',
    activeColor: 'ring-blue-700',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    charLimit: 63206,
    icon: Facebook,
    color: 'bg-blue-600 text-white border-blue-600',
    activeColor: 'ring-blue-600',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    charLimit: 2200,
    maxHashtags: 30,
    icon: Instagram,
    color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white border-transparent',
    activeColor: 'ring-pink-500',
  }
};

export default function App() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin']);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [validations, setValidations] = useState({});
  const [isReady, setIsReady] = useState(false);

  // Helper to extract hashtags
  const getHashtagCount = (text) => {
    const matches = text.match(/#[a-zA-Z0-9_]+/g);
    return matches ? matches.length : 0;
  };

  useEffect(() => {
    const newValidations = {};
    let allValid = true;
    let hasSelected = selectedPlatforms.length > 0;

    selectedPlatforms.forEach(platformId => {
      const platform = PLATFORMS[platformId];
      const charCount = content.length;
      const hashtagCount = getHashtagCount(content);
      
      const charExceeded = charCount > platform.charLimit;
      const hashtagExceeded = platform.maxHashtags && hashtagCount > platform.maxHashtags;
      
      const isWarning = charCount > platform.charLimit * 0.8 && !charExceeded;
      const isValid = !charExceeded && !hashtagExceeded;

      if (!isValid || charCount === 0) allValid = false;

      newValidations[platformId] = {
        charCount,
        charLimit: platform.charLimit,
        hashtagCount,
        maxHashtags: platform.maxHashtags,
        charExceeded,
        hashtagExceeded,
        isWarning,
        isValid
      };
    });

    setValidations(newValidations);
    setIsReady(allValid && hasSelected && content.length > 0);
  }, [content, selectedPlatforms]);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleMediaSimulate = () => {
    if (mediaFiles.length >= 4) return;
    setMediaFiles(prev => [...prev, `Image ${prev.length + 1}`]);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!isReady) return;
    alert(`Successfully posted to ${selectedPlatforms.map(p => PLATFORMS[p].name).join(', ')}!`);
    setContent('');
    setMediaFiles([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800 flex justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Composer Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-900">Create Post</h1>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Select Platforms</label>
              <div className="flex flex-wrap gap-3">
                {Object.values(PLATFORMS).map(platform => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200
                        ${isSelected 
                          ? `${platform.color} shadow-md ring-2 ring-offset-2 ${platform.activeColor}` 
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium text-sm">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {}
            <div className="mb-4 relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you want to share?"
                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 text-lg"
              />
              <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium">
                {content.length} chars
              </div>
            </div>

            {mediaFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {mediaFiles.map((file, idx) => (
                  <div key={idx} className="relative w-24 h-24 bg-indigo-100 rounded-lg flex items-center justify-center border border-indigo-200">
                    <ImageIcon className="text-indigo-400" size={24} />
                    <button 
                      onClick={() => removeMedia(idx)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-slate-200 hover:bg-red-50 text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
              <button 
                onClick={handleMediaSimulate}
                disabled={mediaFiles.length >= 4}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <ImageIcon size={18} />
                Add Media {mediaFiles.length > 0 && `(${mediaFiles.length}/4)`}
              </button>

              <button
                onClick={handlePost}
                disabled={!isReady}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
                Publish Post
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 px-2">Platform Constraints</h2>
          
          {selectedPlatforms.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Select at least one platform to view requirements.
            </div>
          ) : (
            selectedPlatforms.map(platformId => {
              const platform = PLATFORMS[platformId];
              const validation = validations[platformId];
              if (!validation) return null;

              const percentUsed = Math.min((validation.charCount / validation.charLimit) * 100, 100);
              let statusColor = 'bg-emerald-500';
              let textColor = 'text-emerald-700';
              let bgColor = 'bg-emerald-50';
              let Icon = CheckCircle2;
              
              if (validation.charExceeded || validation.hashtagExceeded) {
                statusColor = 'bg-red-500';
                textColor = 'text-red-700';
                bgColor = 'bg-red-50';
                Icon = AlertCircle;
              } else if (validation.isWarning) {
                statusColor = 'bg-amber-500';
                textColor = 'text-amber-700';
                bgColor = 'bg-amber-50';
                Icon = AlertCircle;
              } else if (validation.charCount === 0) {
                 statusColor = 'bg-slate-300';
                 textColor = 'text-slate-500';
                 bgColor = 'bg-white';
                 Icon = AlertCircle;
              }

              return (
                <div key={platformId} className={`rounded-xl border border-slate-200 p-4 transition-colors ${bgColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <platform.icon size={18} className={textColor} />
                      <span className={`font-semibold ${textColor}`}>{platform.name}</span>
                    </div>
                    <Icon size={20} className={textColor} />
                  </div>

                  <div className="space-y-3">
                    {/* Character Progress */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1 text-slate-600">
                        <span>Characters</span>
                        <span className={validation.charExceeded ? 'text-red-600 font-bold' : ''}>
                          {validation.charCount} / {validation.charLimit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${statusColor}`}
                          style={{ width: `${percentUsed}%` }}
                        ></div>
                      </div>
                      {validation.charExceeded && (
                        <p className="text-xs text-red-600 mt-1">Exceeded limit by {validation.charCount - validation.charLimit} characters.</p>
                      )}
                    </div>

                    {/* Hashtag Progress (if applicable) */}
                    {platform.maxHashtags && (
                      <div className="pt-2 border-t border-black/5">
                        <div className="flex justify-between text-xs font-medium mb-1 text-slate-600">
                          <span>Hashtags</span>
                          <span className={validation.hashtagExceeded ? 'text-red-600 font-bold' : ''}>
                            {validation.hashtagCount} / {platform.maxHashtags}
                          </span>
                        </div>
                        {validation.hashtagExceeded && (
                          <p className="text-xs text-red-600 mt-1">Too many hashtags!</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
