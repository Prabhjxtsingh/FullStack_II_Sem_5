import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  Sparkles,
  Calendar,
  Eye,
  Edit3,
  Copy,
  Check,
  Hash,
  Clock,
  Share2,
  Upload,
  Zap,
  RotateCcw
} from 'lucide-react';

const TwitterIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.12.9-2.02 2.02-2.02s2.02.9 2.02 2.02v4.93h2.79M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
  </svg>
);

const FacebookIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.6 13.78 5.6c1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.23 0-1.62.77-1.62 1.56V12h2.78l-.44 3h-2.34v6.8c4.56-.93 8-4.96 8-9.8z"/>
  </svg>
);

const InstagramIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const PLATFORMS = {
  twitter: {
    id: 'twitter',
    name: 'Twitter (X)',
    handle: '@AntigravityAI',
    charLimit: 280,
    icon: TwitterIcon,
    color: 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800',
    activeColor: 'ring-slate-900',
    badgeBg: 'bg-slate-900',
    brandColor: '#0f172a'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'Antigravity Studio',
    charLimit: 3000,
    icon: LinkedinIcon,
    color: 'bg-blue-700 text-white border-blue-700 hover:bg-blue-800',
    activeColor: 'ring-blue-700',
    badgeBg: 'bg-blue-700',
    brandColor: '#1d4ed8'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Antigravity Official',
    charLimit: 63206,
    icon: FacebookIcon,
    color: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
    activeColor: 'ring-blue-600',
    badgeBg: 'bg-blue-600',
    brandColor: '#2563eb'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    handle: 'antigravity_design',
    charLimit: 2200,
    maxHashtags: 30,
    icon: InstagramIcon,
    color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white border-transparent hover:opacity-95',
    activeColor: 'ring-pink-500',
    badgeBg: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500',
    brandColor: '#ec4899'
  }
};

const SAMPLE_TEMPLATES = [
  {
    title: "🚀 Product Announcement",
    text: "We're thrilled to announce the launch of our new multi-platform content studio! 🚀 Streamline your workflow across X, LinkedIn, Facebook, and Instagram seamlessly.\n\nTry it out today: https://example.com #buildinpublic #tech #innovation"
  },
  {
    title: "💡 Daily Tech Insight",
    text: "Tip of the day: High-performing social content relies on concise storytelling, strong visual anchors, and clear calls-to-action.\n\nWhat is your go-to strategy for engaging your audience? Let's discuss! 👇 #design #marketing #productivity"
  },
  {
    title: "✨ Event Invitation",
    text: "Join us this Friday for an exclusive live Q&A session with leading creators and developers! We will be discussing AI-powered productivity workflows and future design trends.\n\nSave your spot now! #webdev #ai #community"
  }
];

const SUGGESTED_HASHTAGS = [
  '#buildinpublic', '#tech', '#innovation', '#design', 
  '#webdev', '#productivity', '#ai', '#startup'
];

export default function App() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin']);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [validations, setValidations] = useState({});
  const [isReady, setIsReady] = useState(false);

  // Additional Interactive State
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [previewPlatform, setPreviewPlatform] = useState('twitter');
  const [notification, setNotification] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([
    {
      id: 1,
      content: "Excited to share our Q3 roadmap update! Continuous innovation drives our product forward.",
      platforms: ['twitter', 'linkedin'],
      date: '2 hours ago',
      mediaCount: 1
    }
  ]);

  const fileInputRef = useRef(null);

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

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => {
      const updated = prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId];
      if (updated.length > 0 && !updated.includes(previewPlatform)) {
        setPreviewPlatform(updated[0]);
      }
      return updated;
    });
  };

  const handleMediaSimulate = () => {
    if (mediaFiles.length >= 4) {
      showToast('Maximum 4 media attachments allowed.', 'warning');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const availableSlots = 4 - mediaFiles.length;
    const newFiles = files.slice(0, availableSlots).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image'
    }));

    setMediaFiles(prev => [...prev, ...newFiles]);
    showToast(`Added ${newFiles.length} media asset(s).`);
  };

  const addSimulatedSampleImage = () => {
    if (mediaFiles.length >= 4) {
      showToast('Maximum 4 media attachments allowed.', 'warning');
      return;
    }
    const sampleImages = [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80'
    ];
    const nextImage = sampleImages[mediaFiles.length % sampleImages.length];
    setMediaFiles(prev => [...prev, { name: `Preset Image ${prev.length + 1}`, url: nextImage, type: 'image' }]);
    showToast('Sample image attached!');
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    showToast('Media removed.');
  };

  const handlePost = () => {
    if (!isReady) return;
    const platformNames = selectedPlatforms.map(p => PLATFORMS[p].name).join(', ');
    
    // Add to history
    const newPost = {
      id: Date.now(),
      content,
      platforms: [...selectedPlatforms],
      date: 'Just now',
      mediaCount: mediaFiles.length
    };
    setHistory(prev => [newPost, ...prev]);

    showToast(`🎉 Successfully published post to ${platformNames}!`);
    setContent('');
    setMediaFiles([]);
  };

  const handleSchedulePost = () => {
    if (!isReady || !scheduledTime) return;
    const platformNames = selectedPlatforms.map(p => PLATFORMS[p].name).join(', ');
    showToast(`⏰ Post scheduled for ${new Date(scheduledTime).toLocaleString()} on ${platformNames}!`);
    setShowScheduleModal(false);
    setContent('');
    setMediaFiles([]);
  };

  const applyTemplate = (templateText) => {
    setContent(templateText);
    showToast('Template applied to editor!');
  };

  const addHashtag = (tag) => {
    if (content.includes(tag)) return;
    setContent(prev => (prev ? `${prev} ${tag}` : tag));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast('Content copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const enhanceTone = (tone) => {
    if (!content.trim()) {
      showToast('Please type some content first to rephrase.', 'warning');
      return;
    }
    let enhanced = content;
    if (tone === 'engaging') {
      enhanced = `🔥 Quick thought: ${content}\n\nWhat are your key takeaways? Drop a comment below! 💬`;
    } else if (tone === 'professional') {
      enhanced = `Key insight: ${content}\n\nLooking forward to hearing how your team approaches this challenge.`;
    } else if (tone === 'concise') {
      enhanced = content.split('\n')[0].substring(0, 180);
    }
    setContent(enhanced);
    showToast(`Tone enhanced (${tone})!`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col items-center pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 ${
          notification.type === 'warning' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-white'
        }`}>
          <Sparkles className="text-amber-400 animate-spin" size={18} />
          <span className="text-sm font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*,video/*" 
        multiple 
        className="hidden" 
      />

      {/* Application Navbar */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Share2 size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                Social Studio
              </h1>
              <p className="text-xs text-slate-500 font-medium">Multi-Platform Content Composer & Validator</p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'editor' 
                  ? 'bg-white text-indigo-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 size={14} />
              <span>Composer & Rules</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'preview' 
                  ? 'bg-white text-indigo-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={14} />
              <span>Live Post Previews</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-6xl px-4 md:px-8 pt-6">
        
        {/* Quick Template Selector Header Bar */}
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Zap className="text-amber-500" size={16} />
            <span>Quick Start Templates:</span>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {SAMPLE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => applyTemplate(tmpl.text)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                {tmpl.title}
              </button>
            ))}
            <button
              onClick={() => { setContent(''); setMediaFiles([]); showToast('Cleared composer'); }}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-xl transition-all ml-auto md:ml-0 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        {activeTab === 'editor' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Composer Area (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>Create Post</span>
                    {isReady && (
                      <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Ready to publish
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Copy text"
                    >
                      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                
                {/* Platform Selector Chips */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Select Target Platforms
                    </label>
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedPlatforms.length} of {Object.keys(PLATFORMS).length} selected
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {Object.values(PLATFORMS).map(platform => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatforms.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          onClick={() => togglePlatform(platform.id)}
                          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border font-medium text-sm transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? `${platform.color} shadow-md ring-2 ring-offset-2 ${platform.activeColor}` 
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                          }`}
                        >
                          <Icon size={18} />
                          <span>{platform.name}</span>
                          {isSelected && <Check size={14} className="ml-1 opacity-90" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Composer Textarea */}
                <div className="mb-4 relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What do you want to share across your networks?"
                    className="w-full h-52 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 text-base leading-relaxed placeholder:text-slate-400"
                  />
                  <div className="absolute bottom-3 right-4 flex items-center gap-3 text-xs text-slate-400 font-medium bg-slate-50/80 px-2 py-1 rounded-md backdrop-blur-xs">
                    <span>{getHashtagCount(content)} hashtags</span>
                    <span>•</span>
                    <span className="text-slate-600 font-semibold">{content.length} chars</span>
                  </div>
                </div>

                {/* AI Assistant & Hashtags Tool Bar */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                      <Sparkles size={12} className="text-indigo-500" /> AI Polish:
                    </span>
                    <button 
                      onClick={() => enhanceTone('engaging')}
                      className="px-2.5 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                    >
                      Engaging
                    </button>
                    <button 
                      onClick={() => enhanceTone('professional')}
                      className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                    >
                      Professional
                    </button>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0">
                    <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                      <Hash size={12} /> Add:
                    </span>
                    {SUGGESTED_HASHTAGS.slice(0, 4).map(tag => (
                      <button
                        key={tag}
                        onClick={() => addHashtag(tag)}
                        className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attached Media Cards */}
                {mediaFiles.length > 0 && (
                  <div className="mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Attached Media ({mediaFiles.length}/4)
                      </span>
                      <button 
                        onClick={addSimulatedSampleImage} 
                        disabled={mediaFiles.length >= 4}
                        className="text-xs text-indigo-600 hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        + Add Sample Image
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mediaFiles.map((file, idx) => (
                        <div key={idx} className="relative group aspect-square bg-slate-200 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center">
                          {typeof file === 'object' && file.url ? (
                            <img src={file.url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                              <ImageIcon className="text-indigo-500 mb-1" size={24} />
                              <span className="text-xs font-medium truncate w-full">{file}</span>
                            </div>
                          )}
                          <button 
                            onClick={() => removeMedia(idx)}
                            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors backdrop-blur-xs cursor-pointer"
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Action Buttons Footer */}
                <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-5 mt-2 gap-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleMediaSimulate}
                      disabled={mediaFiles.length >= 4}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100 disabled:opacity-50 cursor-pointer"
                    >
                      <Upload size={16} />
                      Upload Media {mediaFiles.length > 0 && `(${mediaFiles.length}/4)`}
                    </button>
                    
                    {mediaFiles.length === 0 && (
                      <button
                        onClick={addSimulatedSampleImage}
                        className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        + Sample Asset
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      disabled={!isReady}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <Calendar size={16} />
                      <span>Schedule</span>
                    </button>

                    <button
                      onClick={handlePost}
                      disabled={!isReady}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <Send size={18} />
                      <span>Publish Post</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* History / Recent Activity Log */}
              {history.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-slate-500" />
                    <span>Recent Activity</span>
                  </h3>
                  <div className="space-y-3">
                    {history.map(item => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="space-y-1 max-w-md">
                          <p className="font-medium text-slate-800 truncate">{item.content}</p>
                          <div className="flex items-center gap-2 text-slate-500">
                            <span>{item.date}</span>
                            <span>•</span>
                            <span>{item.mediaCount} media</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {item.platforms.map(p => {
                            const PIcon = PLATFORMS[p]?.icon;
                            return PIcon ? (
                              <span key={p} className={`p-1.5 rounded-md ${PLATFORMS[p].badgeBg} text-white`}>
                                <PIcon size={12} />
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Platform Constraints Sidebar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-slate-800">Platform Constraints</h2>
                <span className="text-xs text-slate-500 font-medium">Real-time check</span>
              </div>
              
              {selectedPlatforms.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 space-y-2">
                  <AlertCircle className="mx-auto text-slate-400" size={32} />
                  <p className="font-semibold text-sm">No Platforms Selected</p>
                  <p className="text-xs text-slate-400">Select at least one social media platform above to calculate character and hashtag limits.</p>
                </div>
              ) : (
                selectedPlatforms.map(platformId => {
                  const platform = PLATFORMS[platformId];
                  const validation = validations[platformId];
                  if (!validation) return null;

                  const percentUsed = Math.min((validation.charCount / validation.charLimit) * 100, 100);
                  let statusColor = 'bg-emerald-500';
                  let textColor = 'text-emerald-700';
                  let bgColor = 'bg-emerald-50/70 border-emerald-200';
                  let Icon = CheckCircle2;
                  let statusBadge = 'Optimal';
                  
                  if (validation.charExceeded || validation.hashtagExceeded) {
                    statusColor = 'bg-red-500';
                    textColor = 'text-red-700';
                    bgColor = 'bg-red-50/70 border-red-200';
                    Icon = AlertCircle;
                    statusBadge = 'Exceeded';
                  } else if (validation.isWarning) {
                    statusColor = 'bg-amber-500';
                    textColor = 'text-amber-700';
                    bgColor = 'bg-amber-50/70 border-amber-200';
                    Icon = AlertCircle;
                    statusBadge = 'Near Limit';
                  } else if (validation.charCount === 0) {
                    statusColor = 'bg-slate-300';
                    textColor = 'text-slate-600';
                    bgColor = 'bg-white border-slate-200';
                    Icon = AlertCircle;
                    statusBadge = 'Empty';
                  }

                  return (
                    <div key={platformId} className={`rounded-2xl border p-4.5 transition-all duration-200 shadow-2xs ${bgColor}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl text-white ${platform.badgeBg}`}>
                            <platform.icon size={18} />
                          </div>
                          <div>
                            <span className={`font-bold text-sm block ${textColor}`}>{platform.name}</span>
                            <span className="text-xs text-slate-500 font-normal">{platform.handle}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            statusBadge === 'Exceeded' ? 'bg-red-200 text-red-800' :
                            statusBadge === 'Near Limit' ? 'bg-amber-200 text-amber-800' :
                            statusBadge === 'Optimal' ? 'bg-emerald-200 text-emerald-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {statusBadge}
                          </span>
                          <Icon size={18} className={textColor} />
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-1">
                        {/* Character Progress */}
                        <div>
                          <div className="flex justify-between text-xs font-medium mb-1.5 text-slate-600">
                            <span>Characters</span>
                            <span className={`font-mono ${validation.charExceeded ? 'text-red-600 font-bold' : ''}`}>
                              {validation.charCount} / {validation.charLimit.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${statusColor}`}
                              style={{ width: `${percentUsed}%` }}
                            ></div>
                          </div>

                          {validation.charExceeded && (
                            <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                              <AlertCircle size={12} />
                              Exceeded limit by {validation.charCount - validation.charLimit} characters.
                            </p>
                          )}
                        </div>

                        {/* Hashtag Progress (if applicable) */}
                        {platform.maxHashtags && (
                          <div className="pt-2.5 border-t border-slate-200/60">
                            <div className="flex justify-between text-xs font-medium mb-1 text-slate-600">
                              <span>Hashtags</span>
                              <span className={validation.hashtagExceeded ? 'text-red-600 font-bold' : ''}>
                                {validation.hashtagCount} / {platform.maxHashtags}
                              </span>
                            </div>
                            {validation.hashtagExceeded && (
                              <p className="text-xs text-red-600 font-semibold mt-1">Too many hashtags! Maximum is 30.</p>
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
        ) : (
          /* Live Platform Post Previews Tab */
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Live Platform Previews</h2>
                <p className="text-xs text-slate-500">Visualize how your post will render across active channels.</p>
              </div>

              {/* Platform Preview Selector */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {selectedPlatforms.map(pId => {
                  const p = PLATFORMS[pId];
                  const Icon = p.icon;
                  const isCur = previewPlatform === pId;
                  return (
                    <button
                      key={pId}
                      onClick={() => setPreviewPlatform(pId)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCur ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mock Feed Container */}
            <div className="max-w-xl mx-auto">
              {previewPlatform === 'twitter' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                        A
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">Antigravity</span>
                          <span className="text-xs text-slate-500">@AntigravityAI • 1m</span>
                        </div>
                        <span className="text-xs text-slate-400">Official Handle</span>
                      </div>
                    </div>
                    <TwitterIcon size={18} className="text-slate-800" />
                  </div>

                  <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-slate-400 italic">No content typed yet...</span>}
                  </p>

                  {mediaFiles.length > 0 && (
                    <div className={`grid gap-2 rounded-2xl overflow-hidden border border-slate-200 ${
                      mediaFiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}>
                      {mediaFiles.map((m, i) => (
                        <div key={i} className="bg-slate-100 aspect-video flex items-center justify-center overflow-hidden">
                          {typeof m === 'object' && m.url ? (
                            <img src={m.url} alt="Media preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="text-slate-400" size={32} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 text-xs border-t border-slate-100 pt-3">
                    <span>💬 12</span>
                    <span>🔁 4</span>
                    <span>❤️ 48</span>
                    <span>📊 1.2k</span>
                  </div>
                </div>
              )}

              {previewPlatform === 'linkedin' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                      A
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Antigravity Studio</h4>
                      <p className="text-xs text-slate-500">1,420 followers • 2m • 🌐</p>
                    </div>
                  </div>

                  <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-slate-400 italic">No content typed yet...</span>}
                  </p>

                  {mediaFiles.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                      {typeof mediaFiles[0] === 'object' && mediaFiles[0].url ? (
                        <img src={mediaFiles[0].url} alt="Media preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-400" size={36} />
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-500 text-xs border-t border-slate-100 pt-3 font-semibold">
                    <span className="hover:text-blue-700 cursor-pointer">👍 Like</span>
                    <span className="hover:text-blue-700 cursor-pointer">💬 Comment</span>
                    <span className="hover:text-blue-700 cursor-pointer">🔁 Repost</span>
                    <span className="hover:text-blue-700 cursor-pointer">Send</span>
                  </div>
                </div>
              )}

              {previewPlatform === 'facebook' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      A
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Antigravity Official</h4>
                      <p className="text-xs text-slate-500">Just now • 🌎</p>
                    </div>
                  </div>

                  <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-slate-400 italic">No content typed yet...</span>}
                  </p>

                  {mediaFiles.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                      {typeof mediaFiles[0] === 'object' && mediaFiles[0].url ? (
                        <img src={mediaFiles[0].url} alt="Media preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-400" size={36} />
                      )}
                    </div>
                  )}

                  <div className="flex justify-around text-slate-500 text-xs border-t border-slate-100 pt-3 font-semibold">
                    <span>👍 Like</span>
                    <span>💬 Comment</span>
                    <span>↗️ Share</span>
                  </div>
                </div>
              )}

              {previewPlatform === 'instagram' && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-3.5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 text-white flex items-center justify-center text-xs font-bold">
                      A
                    </div>
                    <span className="font-bold text-xs text-slate-900">antigravity_design</span>
                  </div>

                  <div className="bg-slate-100 aspect-square flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {mediaFiles.length > 0 && typeof mediaFiles[0] === 'object' && mediaFiles[0].url ? (
                      <img src={mediaFiles[0].url} alt="Instagram preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <InstagramIcon size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Attach an image to preview Instagram feed post</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-slate-800">
                      <div className="flex gap-3">
                        <span>❤️</span>
                        <span>💬</span>
                        <span>✈️</span>
                      </div>
                      <span>🔖</span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed">
                      <span className="font-bold mr-1.5">antigravity_design</span>
                      {content || <span className="text-slate-400 italic">Caption goes here...</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Schedule Post Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                Schedule Post
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase">Select Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedulePost}
                disabled={!scheduledTime}
                className="px-5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
