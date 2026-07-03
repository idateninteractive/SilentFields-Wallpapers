import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  PlusCircle, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Check, 
  Tag, 
  DollarSign, 
  Layers, 
  LogOut, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Wallpaper } from '../types';
// @ts-ignore
import alienLogo from '../assets/images/alien_logo_1783043579615.jpg';

interface AdminPanelProps {
  wallpapers: Wallpaper[];
  setWallpapers: React.Dispatch<React.SetStateAction<Wallpaper[]>>;
  isDarkMode: boolean;
  setActiveTab: (tab: 'home' | 'wallpapers' | 'submit' | 'admin') => void;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

// Safe wrapper for localStorage to prevent SecurityError in sandbox/iframes
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('localStorage.getItem is not available:', e);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('localStorage.setItem is not available:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage.removeItem is not available:', e);
    }
  }
};

export default function AdminPanel({
  wallpapers,
  setWallpapers,
  isDarkMode,
  setActiveTab,
  showNotification
}: AdminPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeStorage.getItem('admin_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form State for new wallpaper
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cyberpunk');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('0.00');
  const [discount, setDiscount] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [creatorName, setCreatorName] = useState('Admin Creator');
  const [resolution, setResolution] = useState('3840x2160 (4K UHD)');
  const [aspectRatio, setAspectRatio] = useState('16:9 Landscape');
  const [fileSize, setFileSize] = useState('5.0 MB');
  const [coverImage, setCoverImage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [publishStatus, setPublishStatus] = useState<'published' | 'draft'>('published');
  
  // Image Upload reference state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Tabs inside Dashboard
  const [activeDashboardTab, setActiveDashboardTab] = useState<'upload' | 'manage'>('upload');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'SigmaTeam' && password === 'SigmaTeam') {
      setIsAuthenticated(true);
      safeStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
      showNotification('Successfully logged in as administrator.', 'success');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    safeStorage.removeItem('admin_authenticated');
    showNotification('Logged out from admin panel.', 'info');
  };

  // Handle File upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file.', 'error');
      return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setImagePreview(event.target.result);
        setCoverImage(event.target.result);
        setImageUrl(event.target.result);
        
        // Auto estimate size
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        setFileSize(`${sizeInMb} MB`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalImage = coverImage || imageUrl;
    if (!finalImage) {
      showNotification('Please upload an image or enter an image URL.', 'error');
      return;
    }

    if (!title.trim()) {
      showNotification('Please provide a title.', 'error');
      return;
    }

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'Custom') : category;
    const finalPrice = parseFloat(price) || 0;
    const parsedTags = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const newWallpaper: Wallpaper = {
      id: `wallpaper-${Date.now()}`,
      title: title.trim(),
      price: finalPrice,
      discount: discount ? parseInt(discount) : undefined,
      coverImage: finalImage,
      url: finalImage, // High res download defaults to same image
      category: finalCategory,
      tags: parsedTags.length > 0 ? parsedTags : ['uploaded', finalCategory.toLowerCase()],
      creator: creatorName.trim() || 'Admin',
      downloadsCount: 0,
      rating: 5.0,
      resolution,
      aspectRatio,
      fileSize,
      description: description.trim() || `An incredible premium high resolution art wallpaper depicting ${title.trim()} capturing the ambient atmosphere and cinematic lighting.`,
      shortDescription: description.trim().substring(0, 100) || `Cinematic workspace customization wallpaper of ${title.trim()}.`,
      published: publishStatus === 'published'
    };

    setWallpapers(prev => [newWallpaper, ...prev]);
    showNotification(`Successfully added wallpaper "${title.trim()}"!`, 'success');

    // Reset Form fields
    setTitle('');
    setDescription('');
    setPrice('0.00');
    setDiscount('');
    setTagsInput('');
    setCoverImage('');
    setImageUrl('');
    setImagePreview(null);
    setPublishStatus('published');
    
    // Auto-switch to manage tab to see the uploaded wallpaper
    setActiveDashboardTab('manage');
  };

  // Action: Toggle Publish Status
  const togglePublish = (id: string) => {
    setWallpapers(prev => prev.map(wall => {
      if (wall.id === id) {
        const nextStatus = wall.published === false; // false -> true, undefined/true -> false
        showNotification(`"${wall.title}" is now ${nextStatus ? 'Published' : 'Draft'}.`, 'success');
        return { ...wall, published: nextStatus };
      }
      return wall;
    }));
  };

  // Action: Delete Wallpaper
  const deleteWallpaper = (id: string) => {
    if (confirm('Are you sure you want to delete this wallpaper from the catalog? This action is irreversible.')) {
      setWallpapers(prev => prev.filter(wall => wall.id !== id));
      showNotification('Wallpaper removed from catalog successfully.', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* 1. Header of the page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-zinc-800/60 gap-4">
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-wider text-[#ff3333] italic">
            Admin Administrative Dashboard
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Configure system wallpapers, review status, handle publish and draft catalogs.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850' 
                : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            ← Back to Gallery
          </button>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-650 hover:bg-[#ff3333] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Login Page Render */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto mt-12">
          <div className={`border p-8 rounded-3xl shadow-xl transition-all duration-300 ${
            isDarkMode ? 'bg-zinc-950/60 border-zinc-900' : 'bg-white border-zinc-200'
          }`}>
            <div className="flex flex-col items-center mb-6 text-center">
              <img 
                src={alienLogo} 
                alt="Alien Last Hope Shooter Logo" 
                className="h-16 w-auto object-contain mb-4"
                referrerPolicy="no-referrer"
              />
              <h2 className={`text-xl font-display font-black uppercase tracking-wider ${
                isDarkMode ? 'text-white' : 'text-zinc-800'
              }`}>
                Secure Portal Login
              </h2>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                To access administrative capabilities, please supply the master authorization credentials.
              </p>
            </div>

            {loginError && (
              <div className="flex items-center space-x-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-xs font-medium mb-6 animate-pulse">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition duration-300 border ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition duration-300 border ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-[#ff3333] hover:bg-red-650 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Authorize & Unlock</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* 3. Dashboard Section Rendered */
        <div className="space-y-6">
          {/* Dashboard Tab Toggles */}
          <div className="flex border-b border-zinc-800/40">
            <button
              onClick={() => setActiveDashboardTab('upload')}
              className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider cursor-pointer border-b-2 transition duration-200 ${
                activeDashboardTab === 'upload'
                  ? 'border-[#ff3333] text-[#ff3333]'
                  : isDarkMode
                    ? 'border-transparent text-zinc-500 hover:text-zinc-300'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Upload Wallpaper
            </button>
            <button
              onClick={() => setActiveDashboardTab('manage')}
              className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider cursor-pointer border-b-2 transition duration-200 ${
                activeDashboardTab === 'manage'
                  ? 'border-[#ff3333] text-[#ff3333]'
                  : isDarkMode
                    ? 'border-transparent text-zinc-500 hover:text-zinc-300'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Manage Catalog ({wallpapers.length})
            </button>
          </div>

          {/* Tab Content A: Upload form */}
          {activeDashboardTab === 'upload' && (
            <div className={`border p-6 rounded-2xl transition duration-300 ${
              isDarkMode ? 'bg-zinc-950/30 border-zinc-900' : 'bg-white border-zinc-200'
            }`}>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Image Upload Area */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Wallpaper Image Source
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* File Dropzone */}
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition duration-300 min-h-[160px] ${
                        dragActive 
                          ? 'border-[#ff3333] bg-[#ff3333]/5' 
                          : isDarkMode 
                            ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20' 
                            : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50'
                      }`}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Drag & Drop Image Here</p>
                      <p className="text-[10px] text-zinc-500 mt-1">or click to browse from device local storage</p>
                    </div>

                    {/* Image Preview & fallback url */}
                    <div className="flex flex-col justify-between space-y-3">
                      {imagePreview ? (
                        <div className="relative rounded-xl overflow-hidden aspect-video border border-zinc-800 max-h-[130px] bg-black">
                          <img 
                            src={imagePreview} 
                            alt="Upload Preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setCoverImage('');
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black text-white text-xxs font-bold uppercase rounded cursor-pointer transition border border-zinc-800"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className={`rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center max-h-[130px] flex-1 ${
                          isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'
                        }`}>
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-semibold font-mono uppercase tracking-wider">No file uploaded yet</span>
                        </div>
                      )}

                      {/* URL input option */}
                      <div>
                        <span className="text-[9px] text-zinc-500 font-mono block mb-1">OR ENTER DIRECT ONLINE IMAGE URL</span>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setCoverImage(e.target.value);
                            if (e.target.value.startsWith('http')) {
                              setImagePreview(e.target.value);
                            }
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-medium outline-none transition border ${
                            isDarkMode 
                              ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                              : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Wallpaper Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Midnight Grid Drive"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition border ${
                        isDarkMode 
                          ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                      }`}
                    />
                  </div>

                  {/* Creator */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Creator / Artist Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Studio Retro"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition border ${
                        isDarkMode 
                          ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                      }`}
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition border ${
                        isDarkMode 
                          ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                      }`}
                    >
                      <option value="Cyberpunk">Cyberpunk</option>
                      <option value="Space">Space</option>
                      <option value="Anime">Anime</option>
                      <option value="Nature">Nature</option>
                      <option value="Minimalist">Minimalist</option>
                      <option value="Custom">Custom (Specify Below)...</option>
                    </select>

                    {category === 'Custom' && (
                      <input
                        type="text"
                        required
                        placeholder="Specify Custom Category"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className={`w-full mt-2 px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition border ${
                          isDarkMode 
                            ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                        }`}
                      />
                    )}
                  </div>

                  {/* Price Setting */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Price ($ USD) - Use 0.00 for FREE
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono font-bold outline-none transition border ${
                          isDarkMode 
                            ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Optional Discount */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Sales Discount % (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="e.g. 20 for 20% off"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition border ${
                        isDarkMode 
                          ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                      }`}
                    />
                  </div>

                  {/* Tags input */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Search Tags (Comma separated)
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="neon, glowing, futuristic, widescreen"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition border ${
                          isDarkMode 
                            ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Format & Metadata parameters */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Resolution
                    </label>
                    <input
                      type="text"
                      placeholder="3840x2160 (4K UHD)"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-xs font-mono outline-none transition border ${
                        isDarkMode 
                          ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                      }`}
                    />
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Aspect Ratio & Orientation
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition border ${
                        isDarkMode 
                          ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                      }`}
                    >
                      <option value="16:9 Landscape">16:9 Landscape (PC)</option>
                      <option value="9:16 Portrait">9:16 Portrait (Mobile)</option>
                      <option value="21:9 Landscape">21:9 Ultrawide Landscape</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Wallpaper Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide a cinematic atmospheric narrative description for this masterpiece."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition border resize-none ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#ff3333]' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#ff3333]'
                    }`}
                  />
                </div>

                {/* Publish Status selection */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDarkMode ? 'bg-zinc-900/40 border-zinc-850' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="text-left">
                    <span className="text-xs font-bold uppercase tracking-wider block">Publish Status</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Draft wallpapers will not appear on the client-facing homepage.
                    </span>
                  </div>

                  <div className="flex bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setPublishStatus('published')}
                      className={`px-4 py-1.5 rounded-md text-xxs font-black uppercase tracking-wider cursor-pointer transition ${
                        publishStatus === 'published'
                          ? 'bg-[#ff3333] text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublishStatus('draft')}
                      className={`px-4 py-1.5 rounded-md text-xxs font-black uppercase tracking-wider cursor-pointer transition ${
                        publishStatus === 'draft'
                          ? 'bg-zinc-750 text-amber-400 shadow-md'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-[#ff3333] hover:bg-red-650 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Upload & Catalog Wallpaper</span>
                </button>
              </form>
            </div>
          )}

          {/* Tab Content B: Manage list */}
          {activeDashboardTab === 'manage' && (
            <div className={`border rounded-2xl overflow-hidden transition duration-300 ${
              isDarkMode ? 'bg-zinc-950/20 border-zinc-900/80' : 'bg-white border-zinc-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isDarkMode ? 'border-zinc-900 text-zinc-500 bg-zinc-950/60' : 'border-zinc-200 text-zinc-500 bg-zinc-100/50'
                    }`}>
                      <th className="py-4 px-4">Preview</th>
                      <th className="py-4 px-4">Wallpaper Detail</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Price</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/40">
                    {wallpapers.map((wall) => {
                      const isDraft = wall.published === false;
                      const isFree = wall.price === 0;
                      return (
                        <tr 
                          key={wall.id}
                          className={`text-xs transition duration-200 ${
                            isDarkMode 
                              ? 'hover:bg-zinc-900/20' 
                              : 'hover:bg-zinc-50'
                          }`}
                        >
                          {/* Image Preview */}
                          <td className="py-3 px-4">
                            <div className="w-16 h-10 rounded overflow-hidden border border-zinc-800 bg-black">
                              <img 
                                src={wall.coverImage} 
                                alt={wall.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>

                          {/* Wallpaper title and creator */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>
                                {wall.title}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                By {wall.creator} • {wall.resolution}
                              </span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[11px] uppercase tracking-wide">
                              {wall.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 font-mono font-bold">
                            {isFree ? (
                              <span className="text-emerald-500 text-xs">FREE</span>
                            ) : (
                              <span>${wall.price.toFixed(2)}</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            {isDraft ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] font-bold uppercase">
                                <EyeOff className="w-2.5 h-2.5" />
                                <span>Draft</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[9px] font-bold uppercase">
                                <Check className="w-2.5 h-2.5" />
                                <span>Published</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Toggle Publish button */}
                              <button
                                onClick={() => togglePublish(wall.id)}
                                className={`p-2 rounded border cursor-pointer transition ${
                                  isDraft
                                    ? 'border-emerald-900/40 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-950/30'
                                    : 'border-amber-900/40 bg-amber-950/10 text-amber-400 hover:bg-amber-950/30'
                                }`}
                                title={isDraft ? 'Publish Wallpaper' : 'Set to Draft'}
                              >
                                {isDraft ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>

                              {/* Delete button */}
                              <button
                                onClick={() => deleteWallpaper(wall.id)}
                                className="p-2 border border-red-950/40 bg-red-950/10 text-red-400 hover:bg-red-950/30 rounded cursor-pointer transition"
                                title="Delete Wallpaper"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {wallpapers.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-sm text-zinc-500 font-medium">
                    No wallpapers are currently cataloged in the system.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
