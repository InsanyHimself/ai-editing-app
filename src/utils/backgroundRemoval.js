const REMOVE_BG_API_KEY = import.meta.env.VITE_REMOVE_BG_API_KEY;

export const backgroundRemovalService = {
  removeBackgroundAPI: async (imageFile) => {
    try {
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
      // This is a placeholder for actual client-side model implementation.
      // For now, it will return the original image as the 'subject' with a simulated method.

      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      await new Promise(resolve => img.onload = resolve);

      let processedImage = img.src;
      let method = `Simulated Client-side (${modelId})`;

      // Simulate rembg_bria_2 behavior
      if (modelId === 'rembg_bria_2') {
        processedImage = await simulateTransparency(img);
        method = "BRIA Rembg 2.0 (Simulated)";
      }

      return { success: true, subjectImage: processedImage, method: method };
    } catch (error) {
      console.error("Error in removeBackgroundAdvanced:", error);
      return { success: false, error: error.message };
    }
  },
};

// --- Simulation Helper Function (for demonstration purposes only) ---

async function simulateTransparency(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.globalAlpha = 0.8;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}


