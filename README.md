# PaletteIQ V2 ✨

**PaletteIQ** is an ML-enhanced, purely client-side web application that analyzes a user's skin tone from a photo or webcam feed and recommends a personalized color palette for fashion, makeup, and styling.

## 🚀 Features

- **Privacy-First ML Pipeline**: Zero backend dependencies. All image processing, face detection, and color analysis run directly in the browser using TensorFlow.js.
- **BlazeFace Detection**: Uses `@tensorflow-models/blazeface` to pinpoint facial landmarks and automatically extract pixel patches from the forehead, cheeks, and nose bridge.
- **Intelligent Skin Masking**: Applies strict HSV thresholds to discard background and non-skin pixels before analysis.
- **Custom K-Means Clustering**: Implements K-Means++ initialization and clustering using `tf.tensor2d` matrix operations to find the dominant, representative skin tone accurately.
- **Palette Recommendations**: Maps the user's skin tone across 12 combinations of "Depth" (Fair to Rich) and "Undertone" (Warm/Cool) to provide three curated sets of colors:
  - Wardrobe Staples
  - Accent Colors
  - Colors to Avoid
- **Seamless Export Options**: Download your custom palette as a PNG image or export the exact Hex codes via JSON or copy-to-clipboard.

## 🛠 Tech Stack

- **Framework**: React 18 & Vite
- **Styling**: Tailwind CSS & Lucide React Icons
- **Machine Learning**: TensorFlow.js Core & BlazeFace (via CDN for smaller bundles)
- **Image Processing**: HTML5 Canvas API

## 🏃‍♂️ Running Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local URL (typically `http://localhost:5173`).

## 💡 How It Works

1. **Upload or Capture**: Provide an image via drag-and-drop, file selection, or webcam.
2. **Analysis Engine**: 
   - The app dynamically loads the TFJS runtime and BlazeFace model.
   - It draws the image onto a hidden `<canvas>` and extracts specific zones.
   - A custom K-Means algorithm processes the skin pixels to find the representative RGB value.
   - The RGB value is converted to HSL to map the user to one of 12 predefined palettes.
3. **Results**: The user receives a detailed breakdown of their undertone and a beautifully curated color palette they can download or copy.
