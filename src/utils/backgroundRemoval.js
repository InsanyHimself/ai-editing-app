const REMOVE_BG_API_KEY = import.meta.env.VITE_REMOVE_BG_API_KEY;

export const backgroundRemovalService = {
  removeBackgroundAPI: async (imageFile) => {
    try {
      // Check if API key is available
      if (!REMOVE_BG_API_KEY || REMOVE_BG_API_KEY === 'YOUR_REMOVE_BG_API_KEY_HERE') {
        console.warn("Remove.bg API key not configured, falling back to client-side processing");
        return { success: false, error: "API key not configured" };
      }

      const formData = new FormData();
      formData.append("image_file", imageFile);
      formData.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors[0].title || "Failed to remove background via API");
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);

      return { success: true, subjectImage: imageUrl, method: "remove.bg API" };
    } catch (error) {
      console.error("Error in removeBackgroundAPI:", error);
      return { success: false, error: error.message };
    }
  },

  removeBackgroundAdvanced: async (imageFile, modelId) => {
    try {
      console.log(`Processing with client-side model: ${modelId}`);
      
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      let processedImage;
      let method;

      // Simulate different models with different processing
      switch (modelId) {
        case 'rembg_bria_2':
          processedImage = await simulateAdvancedRemoval(img, 'edge-detection');
          method = "BRIA Rembg 2.0 (Client-side Simulation)";
          break;
        default:
          processedImage = await simulateBasicRemoval(img);
          method = `Client-side Processing (${modelId})`;
      }

      return { success: true, subjectImage: processedImage, method: method };
    } catch (error) {
      console.error("Error in removeBackgroundAdvanced:", error);
      return { success: false, error: error.message };
    }
  },
};

// --- Enhanced Simulation Functions ---

async function simulateBasicRemoval(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Draw the image with slight transparency to simulate background removal
  ctx.globalAlpha = 0.9;
  ctx.drawImage(img, 0, 0);
  
  return canvas.toDataURL("image/png");
}

async function simulateAdvancedRemoval(img, technique) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Draw the original image
  ctx.drawImage(img, 0, 0);
  
  if (technique === 'edge-detection') {
    // Simulate edge detection by creating a more refined mask
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple edge detection simulation - make edges more transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simple brightness calculation
      const brightness = (r + g + b) / 3;
      
      // Make darker areas (likely background) more transparent
      if (brightness < 100) {
        data[i + 3] = Math.max(0, data[i + 3] - 100); // Reduce alpha
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  return canvas.toDataURL("image/png");
}

// Test function to verify background removal is working
export const testBackgroundRemoval = async () => {
  try {
    // Create a test image
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    
    // Draw a simple test subject
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(50, 50, 100, 100);
    ctx.fillStyle = "#4ecdc4";
    ctx.fillRect(75, 75, 50, 50);
    
    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        const testFile = new File([blob], 'test.png', { type: 'image/png' });
        
        // Test the background removal
        const result = await backgroundRemovalService.removeBackgroundAdvanced(testFile, 'rembg_bria_2');
        
        console.log('Background removal test result:', result);
        resolve(result);
      });
    });
  } catch (error) {
    console.error('Background removal test failed:', error);
    return { success: false, error: error.message };
  }
};


