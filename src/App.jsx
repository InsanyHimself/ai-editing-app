import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Wand2, Download, RotateCcw, Type, Palette, Settings,
  Upload, Crown, ChevronDown, Move, RotateCw, Zap,
  Layers, Eye, EyeOff, Lock, Unlock, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { backgroundRemovalService } from './utils/backgroundRemoval';
import './App.css';

// Refined font library with user-specified fonts only
const FONT_FAMILIES = [
  { name: 'League Gothic Condensed Bold', family: 'League Gothic Condensed', fallback: 'Arial Black, sans-serif', weight: 700 },
  { name: 'VAG Rounded', family: 'VAG Rounded', fallback: 'Arial Rounded MT Bold, sans-serif', weight: 400 },
  { name: 'Bubblegum Sans Bold', family: 'Bubblegum Sans', fallback: 'Comic Sans MS, cursive', weight: 700 },
  { name: 'Oswald', family: 'Oswald', fallback: 'Arial Black, sans-serif', weight: 400 },
  { name: 'Champagne & Limousines', family: 'Champagne & Limousines', fallback: 'Times New Roman, serif', weight: 400 },
  { name: 'Quicksand', family: 'Quicksand', fallback: 'Arial, sans-serif', weight: 400 },
  { name: 'Baloo 2', family: 'Baloo 2', fallback: 'Arial, sans-serif', weight: 400 },
  { name: 'Fredoka One', family: 'Fredoka One', fallback: 'Arial Black, sans-serif', weight: 400 }
];

const BACKGROUND_REMOVAL_MODELS = [
  {
    id: 'removebg',
    name: 'Professional Quality (API)',
    description: 'Highest accuracy via external API',
    type: 'api',
    emoji: '🔥'
  },
  {
    id: 'rembg_bria_2',
    name: 'Efficient Fallback',
    description: 'Accurate client-side model (fallback)',
    type: 'client',
    emoji: '🚀'
  }
];

const ASPECT_RATIOS = [
  { name: 'YouTube Thumbnail', ratio: '16:9', width: 1280, height: 720, emoji: '📺' },
  { name: 'Instagram Post', ratio: '1:1', width: 1080, height: 1080, emoji: '📷' },
  { name: 'Instagram Story', ratio: '9:16', width: 1080, height: 1920, emoji: '📱' },
  { name: 'Twitter Header', ratio: '3:1', width: 1500, height: 500, emoji: '🐦' },
  { name: 'Facebook Cover', ratio: '205:78', width: 1640, height: 624, emoji: '📘' },
  { name: 'TikTok Video', ratio: '9:16', width: 1080, height: 1920, emoji: '🎵' },
  { name: 'LinkedIn Banner', ratio: '4:1', width: 1584, height: 396, emoji: '💼' },
  { name: 'Pinterest Pin', ratio: '2:3', width: 1000, height: 1500, emoji: '📌' }
];

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [subjectImage, setSubjectImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1280, height: 720 });
  const [imageAspectRatio, setImageAspectRatio] = useState(16/9);
  const [activeTab, setActiveTab] = useState('text');
  const [selectedModel, setSelectedModel] = useState('removebg'); // Default to API
  const [textContent, setTextContent] = useState('AMAZING CONTENT');
  const [textStyle, setTextStyle] = useState({
    fontFamily: 'League Gothic Condensed',
    fontSize: 72,
    fontWeight: 700,
    color: '#000000',
    stroke: '#ffffff',
    strokeWidth: 4,
    textShadow: 0,
    textShadowColor: '#000000',
    opacity: 1,
    rotation: 0,
    x: 50, // percentage
    y: 50, // percentage
    letterSpacing: 0
  });
  const [layers, setLayers] = useState({
    background: { visible: true, hasContent: false },
    text: { visible: true, hasContent: true },
    subject: { visible: true, hasContent: false }
  });
  const [uploadedFile, setUploadedFile] = useState(null); // New state to store the uploaded file

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Calculate canvas dimensions based on image aspect ratio
  const calculateCanvasDimensions = useCallback((imageWidth, imageHeight) => {
    const aspectRatio = imageWidth / imageHeight;
    setImageAspectRatio(aspectRatio);
    
    // Set maximum dimensions while maintaining aspect ratio
    const maxWidth = 800;
    const maxHeight = 600;
    
    let canvasWidth, canvasHeight;
    
    if (aspectRatio > maxWidth / maxHeight) {
      // Image is wider than max aspect ratio
      canvasWidth = maxWidth;
      canvasHeight = maxWidth / aspectRatio;
    } else {
      // Image is taller than max aspect ratio
      canvasHeight = maxHeight;
      canvasWidth = maxHeight * aspectRatio;
    }
    
    const dimensions = {
      width: Math.round(canvasWidth),
      height: Math.round(canvasHeight)
    };
    
    setCanvasDimensions(dimensions);
    
    // Update selected aspect ratio to match image
    const ratioString = `${Math.round(aspectRatio * 100) / 100}:1`;
    setSelectedAspectRatio(ratioString);
    
    return dimensions;
  }, []);

  // Handle image upload with dynamic aspect ratio
  const handleImageUpload = useCallback(async (event) => {
    console.log("handleImageUpload called", event);
    const file = event.target.files[0];
    console.log("Selected file:", file);
    if (!file) return;

    setUploadedFile(file); // Store the uploaded file
    setIsProcessing(true);
    console.log("Processing started");
    
    try {
      // Load image to get dimensions
      const img = new Image();
      img.onload = async () => {
        console.log("Image loaded:", img.width, "x", img.height);
        // Calculate canvas dimensions based on image aspect ratio
        const dimensions = calculateCanvasDimensions(img.width, img.height);
        console.log("Canvas dimensions:", dimensions);
        
        // Set original image
        const imageUrl = URL.createObjectURL(file);
        setOriginalImage(imageUrl);
        setBackgroundImage(imageUrl);
        console.log("Image URLs set");
        
        // Update layers
        setLayers(prev => ({
          ...prev,
          background: { visible: true, hasContent: true },
          subject: { visible: false, hasContent: false }
        }));
        console.log("Layers updated");
        
        // Process background removal with the currently selected model
        await processBackgroundRemoval(file, selectedModel); // Pass selectedModel here
      };
      
      img.onerror = () => {
        console.error('Failed to load image');
        setIsProcessing(false);
      };
      
      img.src = URL.createObjectURL(file);
      console.log("Image src set");
      
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
    }
  }, [calculateCanvasDimensions, selectedModel]); // Add selectedModel to dependencies

  // Process background removal with selected model and fallback logic
  const processBackgroundRemoval = useCallback(async (file, modelId) => {
    console.log("processBackgroundRemoval called with model:", modelId);
    setIsProcessing(true);
    let result;

    try {
      if (modelId === 'removebg') {
        console.log("Attempting remove.bg API...");
        result = await backgroundRemovalService.removeBackgroundAPI(file);
        if (result.success) {
          console.log(`✅ Background removal successful using ${result.method}`);
        } else {
          console.warn(`⚠️ remove.bg API failed: ${result.error}. Falling back to client-side model.`);
          // Fallback to rembg_bria_2 if API fails
          result = await backgroundRemovalService.removeBackgroundAdvanced(file, 'rembg_bria_2');
        }
      } else if (modelId === 'rembg_bria_2') {
        console.log("Using client-side model: rembg_bria_2");
        result = await backgroundRemovalService.removeBackgroundAdvanced(file, 'rembg_bria_2');
      } else {
        console.error("Invalid model selected. Falling back to rembg_bria_2.");
        result = await backgroundRemovalService.removeBackgroundAdvanced(file, 'rembg_bria_2');
      }

      if (result.success) {
        setSubjectImage(result.subjectImage);
        setLayers(prev => ({
          ...prev,
          subject: { visible: true, hasContent: true }
        }));
        console.log(`✅ Final background removal successful using ${result.method}`);
      } else {
        console.error(`❌ Final background removal failed: ${result.error}`);
      }

    } catch (error) {
      console.error('Background removal error:', error);
    } finally {
      setIsProcessing(false);
      console.log("Processing finished");
    }
  }, []);

  // Get font string with proper Google Fonts integration
  const getFontString = useCallback((fontFamily, fontSize, fontWeight) => {
    const fontObj = FONT_FAMILIES.find(f => f.family === fontFamily);
    const fallback = fontObj ? fontObj.fallback : 'Arial, sans-serif';
    
    // Enhanced font mapping with Google Fonts
    const fontMap = {
      'League Gothic Condensed': '"League Gothic", "Arial Black", Impact, sans-serif',
      'VAG Rounded': '"Arial Rounded MT Bold", Arial, sans-serif',
      'Bubblegum Sans': '"Bubblegum Sans", "Comic Sans MS", cursive',
      'Oswald': '"Oswald", "Arial Black", Impact, sans-serif',
      'Champagne & Limousines': '"Times New Roman", serif',
      'Quicksand': '"Quicksand", Arial, Helvetica, sans-serif',
      'Baloo 2': '"Baloo 2", Arial, Helvetica, sans-serif',
      'Fredoka One': '"Fredoka One", "Arial Black", Impact, sans-serif'
    };

    const fontString = fontMap[fontFamily] || fallback;
    const weight = fontObj?.weight || fontWeight;
    
    return `${weight} ${fontSize}px ${fontString}`;
  }, []);

  // Enhanced canvas drawing with dynamic dimensions
  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use dynamic canvas dimensions
    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (backgroundImage && layers.background.visible) {
      try {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          drawTextAndSubject();
        };
        bgImg.src = backgroundImage;
      } catch (error) {
        console.warn("Failed to load background image:", error);
        drawTextAndSubject();
      }
    } else {
      // Draw light gray background for text preview
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawTextAndSubject();
    }

    function drawTextAndSubject() {
      // Draw text BEHIND subject
      if (textContent && layers.text.visible) {
        ctx.save();
        
        // Set font properties with system font fallback
        const fontString = getFontString(textStyle.fontFamily, textStyle.fontSize, textStyle.fontWeight);
        ctx.font = fontString;
        ctx.fillStyle = textStyle.color;
        ctx.strokeStyle = textStyle.stroke;
        ctx.lineWidth = textStyle.strokeWidth;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = textStyle.opacity;

        // Add text shadow if enabled
        if (textStyle.textShadow > 0) {
          ctx.shadowColor = textStyle.textShadowColor;
          ctx.shadowBlur = textStyle.textShadow;
          ctx.shadowOffsetX = textStyle.textShadow / 2;
          ctx.shadowOffsetY = textStyle.textShadow / 2;
        }

        const x = (textStyle.x / 100) * canvas.width;
        const y = (textStyle.y / 100) * canvas.height;

        ctx.translate(x, y);
        ctx.rotate((textStyle.rotation * Math.PI) / 180);

        // Handle letter spacing
        if (textStyle.letterSpacing > 0) {
          // Draw text with custom letter spacing
          const chars = textContent.split('');
          let currentX = 0;
          const totalWidth = chars.reduce((width, char) => {
            return width + ctx.measureText(char).width + textStyle.letterSpacing;
          }, 0) - textStyle.letterSpacing;
          
          currentX = -totalWidth / 2;
          
          chars.forEach((char) => {
            const charWidth = ctx.measureText(char).width;
            if (textStyle.strokeWidth > 0) {
              ctx.strokeText(char, currentX + charWidth / 2, 0);
            }
            ctx.fillText(char, currentX + charWidth / 2, 0);
            currentX += charWidth + textStyle.letterSpacing;
          });
        } else {
          // Draw text normally
          if (textStyle.strokeWidth > 0) {
            ctx.strokeText(textContent, 0, 0);
          }
          ctx.fillText(textContent, 0, 0);
        }

        ctx.restore();
      }

      // Draw subject image ON TOP of text
      if (subjectImage && layers.subject.visible) {
        try {
          const subImg = new Image();
          subImg.crossOrigin = "anonymous";
          subImg.onload = () => {
            ctx.drawImage(subImg, 0, 0, canvas.width, canvas.height);
          };
          subImg.src = subjectImage;
        } catch (error) {
          console.warn("Failed to load subject image:", error);
        }
      }
    }
  }, [backgroundImage, subjectImage, textContent, textStyle, layers, getFontString, canvasDimensions]);

  // Enhanced useEffect for immediate live preview
  useEffect(() => {
    const timer = setTimeout(() => {
      drawCanvas();
    }, 50); // Reduced delay for more responsive updates
    return () => clearTimeout(timer);
  }, [drawCanvas]);

  const resetCanvas = () => {
    setOriginalImage(null);
    setSubjectImage(null);
    setBackgroundImage(null);
    setTextContent('AMAZING CONTENT');
    setTextStyle({
      fontFamily: 'League Gothic Condensed',
      fontSize: 72,
      fontWeight: 700,
      color: '#000000',
      stroke: '#ffffff',
      strokeWidth: 4,
      x: 50,
      y: 50,
      rotation: 0,
      letterSpacing: 0,
      opacity: 1,
      textShadow: 0,
      textShadowColor: '#000000'
    });
    setLayers({
      subject: { visible: true, hasContent: false },
      text: { visible: true, hasContent: true },
      background: { visible: true, hasContent: false }
    });
    setCanvasDimensions({ width: 1280, height: 720 });
    setImageAspectRatio(16/9);
    setSelectedAspectRatio('16:9');
    setIsProcessing(false);
    setUploadedFile(null); // Clear uploaded file on reset
  };

  const handleExport = async () => {
    if (!canvasRef.current) {
      console.log("❌ No canvas to export");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Use current canvas dimensions for export
    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Export with current canvas content
    const dataURL = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "editi-creation.png";
    link.href = dataURL;
    link.click();
  };

  const toggleLayerVisibility = (layerName) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: { ...prev[layerName], visible: !prev[layerName].visible }
    }));
  };

  // Handle drag and drop functionality
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Create a synthetic event for handleImageUpload
        const syntheticEvent = {
          target: {
            files: [file]
          }
        };
        handleImageUpload(syntheticEvent);
      }
    }
  }, [handleImageUpload]);

  // Handle upload button click with improved approach
  const handleUploadClick = useCallback(() => {
    console.log("Upload button clicked - triggering file input");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("File input ref is null");
    }
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <Wand2 size={24} />
            </div>
            <div className="logo-text">
              <span className="logo-title">Editi</span>
              <span className="logo-subtitle">AI IMAGE EDITOR</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="subscription-info">
            <Crown size={18} className="crown-icon" />
            <span className="tier">Free Tier</span>
            <span className="api-calls">(0/5 API calls)</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              <Type size={18} /> Text
            </button>
            <button
              className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              <Palette size={18} /> Templates
            </button>
            <button
              className={`tab-btn ${activeTab === 'editing' ? 'active' : ''}`}
              onClick={() => setActiveTab('editing')}
            >
              <Settings size={18} /> Editing
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'text' && (
              <div className="text-controls">
                <div className="form-group">
                  <label htmlFor="textContent">Text Content</label>
                  <textarea
                    id="textContent"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="fontFamily">Font Family</label>
                  <select
                    id="fontFamily"
                    value={textStyle.fontFamily}
                    onChange={(e) => setTextStyle({ ...textStyle, fontFamily: e.target.value })}
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font.name} value={font.family}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label htmlFor="fontSize">Font Size: {textStyle.fontSize}px</label>
                  <input
                    type="range"
                    id="fontSize"
                    min="10"
                    max="200"
                    value={textStyle.fontSize}
                    onChange={(e) => setTextStyle({ ...textStyle, fontSize: parseInt(e.target.value) })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="fontWeight">Font Weight: {textStyle.fontWeight}</label>
                  <input
                    type="range"
                    id="fontWeight"
                    min="100"
                    max="900"
                    step="100"
                    value={textStyle.fontWeight}
                    onChange={(e) => setTextStyle({ ...textStyle, fontWeight: parseInt(e.target.value) })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="letterSpacing">Letter Spacing: {textStyle.letterSpacing}px</label>
                  <input
                    type="range"
                    id="letterSpacing"
                    min="0"
                    max="20"
                    value={textStyle.letterSpacing}
                    onChange={(e) => setTextStyle({ ...textStyle, letterSpacing: parseInt(e.target.value) })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="textColor">Text Color</label>
                  <input
                    type="color"
                    id="textColor"
                    value={textStyle.color}
                    onChange={(e) => setTextStyle({ ...textStyle, color: e.target.value })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="strokeColor">Outline Color</label>
                  <input
                    type="color"
                    id="strokeColor"
                    value={textStyle.stroke}
                    onChange={(e) => setTextStyle({ ...textStyle, stroke: e.target.value })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="strokeWidth">Outline Width: {textStyle.strokeWidth}px</label>
                  <input
                    type="range"
                    id="strokeWidth"
                    min="0"
                    max="10"
                    value={textStyle.strokeWidth}
                    onChange={(e) => setTextStyle({ ...textStyle, strokeWidth: parseInt(e.target.value) })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="textShadow">Text Shadow: {textStyle.textShadow}px</label>
                  <input
                    type="range"
                    id="textShadow"
                    min="0"
                    max="20"
                    value={textStyle.textShadow}
                    onChange={(e) => setTextStyle({ ...textStyle, textShadow: parseInt(e.target.value) })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="textShadowColor">Text Shadow Color</label>
                  <input
                    type="color"
                    id="textShadowColor"
                    value={textStyle.textShadowColor}
                    onChange={(e) => setTextStyle({ ...textStyle, textShadowColor: e.target.value })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="opacity">Opacity: {Math.round(textStyle.opacity * 100)}%</label>
                  <input
                    type="range"
                    id="opacity"
                    min="0"
                    max="1"
                    step="0.01"
                    value={textStyle.opacity}
                    onChange={(e) => setTextStyle({ ...textStyle, opacity: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="rotation">Rotation: {textStyle.rotation}°</label>
                  <input
                    type="range"
                    id="rotation"
                    min="-180"
                    max="180"
                    value={textStyle.rotation}
                    onChange={(e) => setTextStyle({ ...textStyle, rotation: parseInt(e.target.value) })}
                  />
                </div>

                <div className="control-group">
                  <label>Position</label>
                  <div className="position-controls">
                    <button className="position-btn" onClick={() => setTextStyle({ ...textStyle, x: 50, y: 25 })}><ChevronDown size={18} className="rotate-90" /> Top</button>
                    <button className="position-btn" onClick={() => setTextStyle({ ...textStyle, x: 50, y: 50 })}><Move size={18} /> Center</button>
                    <button className="position-btn" onClick={() => setTextStyle({ ...textStyle, x: 50, y: 75 })}><ChevronDown size={18} className="rotate-90" /> Bottom</button>
                    <button className="position-btn" onClick={() => setTextStyle({ ...textStyle, x: 25, y: 50 })}><ChevronDown size={18} className="rotate-180" /> Left</button>
                    <button className="position-btn" onClick={() => setTextStyle({ ...textStyle, x: 75, y: 50 })}><ChevronDown size={18} /> Right</button>
                  </div>
                </div>

                <div className="control-group">
                  <label>Layers</label>
                  <div className="layer-controls">
                    <div className="layer-item">
                      <span className="layer-name">Background</span>
                      <button className="layer-toggle" onClick={() => toggleLayerVisibility('background')}>
                        {layers.background.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                    <div className="layer-item">
                      <span className="layer-name">Text</span>
                      <button className="layer-toggle" onClick={() => toggleLayerVisibility('text')}>
                        {layers.text.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                    <div className="layer-item">
                      <span className="layer-name">Subject</span>
                      <button className="layer-toggle" onClick={() => toggleLayerVisibility('subject')}>
                        {layers.subject.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={resetCanvas}>
                  <RotateCcw size={18} /> Reset All
                </button>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="templates-controls">
                <div className="control-group">
                  <label>Select Aspect Ratio</label>
                  <div className="aspect-ratios-grid">
                    {ASPECT_RATIOS.map((ar) => (
                      <div
                        key={ar.name}
                        className={`aspect-ratio-card ${selectedAspectRatio === ar.ratio ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedAspectRatio(ar.ratio);
                          setCanvasDimensions({ width: ar.width, height: ar.height });
                        }}
                      >
                        <span className="aspect-ratio-emoji">{ar.emoji}</span>
                        <span className="aspect-ratio-name">{ar.name}</span>
                        <span className="aspect-ratio-dimensions">{ar.ratio}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'editing' && (
              <div className="editing-controls">
                <div className="control-group">
                  <label>Background Removal Model</label>
                  <div className="models-grid">
                    {BACKGROUND_REMOVAL_MODELS.map((model) => (
                      <div
                        key={model.id}
                        className={`model-card ${selectedModel === model.id ? 'active' : ''}`}
                        onClick={() => setSelectedModel(model.id)}
                      >
                        <span className="model-emoji">{model.emoji}</span>
                        <span className="model-name">{model.name}</span>
                        <span className="model-description">{model.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={handleUploadClick}>
                  <Upload size={18} /> Upload Image
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden-file-input"
                  accept="image/png, image/jpeg, image/gif"
                />
              </div>
            )}
          </div>
        </aside>

        <section
          className="canvas-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {!originalImage && (
            <div className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}>
              <div className="upload-content">
                <Upload size={48} className="upload-icon" />
                <span className="upload-title">Upload an image</span>
                <span className="upload-subtext">Drag and drop or click to select!</span>
                <span className="upload-formats">Supports JPG, PNG, GIF up to 10MB</span>
              </div>
            </div>
          )}

          {originalImage && (
            <div className="canvas-container">
              <canvas ref={canvasRef} className="image-canvas"></canvas>
            </div>
          )}

          {isProcessing && (
            <div className="processing-overlay">
              <div className="processing-content">
                <Loader2 size={48} className="processing-spinner" />
                <span className="processing-text">Processing Image...</span>
                <span className="processing-status">
                  {/* Add dynamic status messages here if needed */}
                </span>
              </div>
            </div>
          )}

          {originalImage && (
            <div className="action-bar">
              <button className="btn btn-secondary" onClick={resetCanvas}>
                <RotateCcw size={18} /> Reset
              </button>
              <button className="btn btn-primary" onClick={handleExport}>
                <Download size={18} /> Export
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;


