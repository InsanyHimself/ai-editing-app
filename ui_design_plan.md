# UI Design Plan for Editi - AI Image Editor

## 1. Overall Aesthetic & Branding
- **Theme:** Sleek, modern, professional, branded AI application.
- **Color Palette:** Predominantly black (#000000) and white/light gray (#F0F0F0, #CCCCCC). Subtle accent color: a vibrant green (e.g., #4CAF50 or similar, for interactive elements like buttons/progress).
- **Typography:**
    - **Headings/Titles:** Bold, sans-serif font (e.g., 'Baldonse' if available, otherwise a similar modern, impactful sans-serif like 'Oswald' or 'League Gothic Condensed' already in use).
    - **Body Text:** Clean, readable sans-serif font (e.g., 'Quicksand' or 'Baloo 2' already in use).
- **General Style:** Minimalist, spacious, with clean lines and subtle shadows/depth where appropriate.

## 2. Layout Structure (Desktop)
- **Main Layout:** Two-column structure.
    - **Left Sidebar:** Controls and feature sections (Text, Templates, Editing).
    - **Right Canvas Area:** Image preview and manipulation area.
- **Header/Navbar:**
    - **Style:** Blur glass-like dynamic island style, circular edges, no glow effects. Shrinks on scroll (though this might be complex for a fixed editor UI, prioritize the aesthetic).
    - **Content:** Logo (Editi - AI Image Editor), possibly subscription info/API calls on the right.
- **Sidebar (Left):**
    - **Tabs:** Text, Templates, Editing. Buttons should be long, hollow, and clean, matching the branded style.
    - **Controls:** Organized within each tab, using the black/white theme. Sliders, input fields, and buttons should reflect the new aesthetic.
- **Canvas Area (Right):**
    - **Image Frame:** Fixed position and size, providing a stable viewing experience.
    - **Upload Zone:** Integrated seamlessly into the canvas area, matching the new black/white aesthetic.

## 3. Layout Structure (Mobile)
- **Responsiveness:** UI must be fully responsive and optimized for mobile devices.
- **Real-time Adjustment:** Users should be able to continuously adjust settings while viewing the real-time image preview.
- **Adaptation:** Consider stacking elements vertically or using accordions/collapsible sections for controls on smaller screens.

## 4. Specific UI Elements & Styling
- **Buttons:** Black background, white text, rounded corners. Hover effects could involve a subtle green glow or inverse colors.
- **Input Fields/Sliders:** Clean, minimalist design. Black borders, white fill, black text.
- **Icons:** Use consistent, modern icons (Lucide React is already in use, ensure they fit the new aesthetic).
- **Logo:** Integrate the 'Editi' logo with 'AI IMAGE EDITOR' subtitle, matching the new font and color scheme.

## 5. Upload Button Functionality Fix (New Approach)
- **Problem:** The current upload button is not triggering the file input consistently.
- **New Approach:**
    1. **Ensure `fileInputRef` is correctly assigned to a hidden `<input type="file">` element.**
    2. **Verify the `onClick` handler for the visible 


   **"Upload Image" button** correctly calls `fileInputRef.current?.click()`.
    3. **Implement a more robust file handling mechanism:**
        - Use `FileReader` API to read the file content.
        - Ensure proper error handling for file types and sizes.
        - Consider using a dedicated library for file uploads if native HTML input continues to be problematic.
    4. **Provide clear visual feedback during upload and processing:**
        - Loading indicators.
        - Success/error messages.

## 6. Font Integration
- **Font Library:** Continue using the 8 specified fonts.
- **Loading:** Ensure Google Fonts are loaded correctly for the available fonts.
- **Fallback:** Maintain robust system font fallbacks for unavailable fonts.

## 7. Background Removal Models
- Continue using the 8 high-accuracy models with hidden names.
- Ensure seamless integration and processing.

## 8. Responsiveness and Optimization
- **Desktop:** Two-column layout (sidebar left, canvas right).
- **Mobile:** Adapt to a single-column layout, potentially with collapsible sections for controls. Ensure real-time preview is always visible.
- **Performance:** Optimize CSS and JavaScript for smooth, fast, and lag-free performance.

