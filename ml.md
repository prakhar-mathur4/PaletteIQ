# PaletteIQ: Machine Learning & Data Science Architecture

PaletteIQ utilizes a completely client-side, privacy-first Machine Learning pipeline built on top of **TensorFlow.js (TF.js)**. By executing all models and mathematical operations directly in the user's browser, the application achieves zero-latency processing without requiring backend GPU infrastructure or transmitting sensitive facial images over the network.

Here is a detailed breakdown of the 4-stage Data Science and Computer Vision pipeline implemented in this project:

## Stage 1: Face Detection & Landmark Extraction

The first step in the pipeline is identifying where the user's face is located within the uploaded image or webcam feed.

- **Model Used**: `@tensorflow-models/blazeface`
- **Architecture**: BlazeFace is a lightweight Single Shot Detector (SSD) customized for mobile device cameras. It is heavily optimized for edge inference.
- **Output**: The model outputs a bounding box `[topLeft, bottomRight]` and 6 facial landmarks (right eye, left eye, nose tip, mouth corners, and ears).
- **Implementation Detail**: The model is lazily loaded via CDN to ensure the initial React bundle remains extremely small. 

## Stage 2: Geometric Skin Zone Estimation

Rather than using computationally heavy semantic segmentation models (like MediaPipe FaceMesh) to isolate skin pixels, PaletteIQ uses a highly efficient geometric heuristic approach based on the 6 landmarks provided by BlazeFace.

The pipeline calculates four specific Regions of Interest (ROIs) that are most likely to represent true skin tone, avoiding hair, eyes, and specular glares:
1. **Forehead**: The top 25% of the bounding box, centered.
2. **Left Cheek**: Calculated via a geometric offset (down and outward) from the left eye landmark.
3. **Right Cheek**: Calculated via a geometric offset from the right eye landmark.
4. **Nose Bridge**: The midpoint between the eyes, offset slightly downward.

Image data from these precise rectangular zones is extracted via an off-screen HTML5 `<canvas>` using the `ctx.getImageData()` API.

## Stage 3: HSV Skin Masking (Noise Reduction)

Before the extracted pixels can be analyzed, the system must filter out "noise" (e.g., background elements, stray hairs, dark shadows, or extreme highlights). 

- **Color Space Conversion**: The raw RGB pixels are converted into the **HSV (Hue, Saturation, Value)** color space. HSV is superior for computer vision tasks because it separates the *chroma* (color information) from the *luma* (lighting/brightness information).
- **Thresholding**: A strict heuristic filter is applied. Pixels are only kept if they fall within plausible human skin ranges:
  - **Hue**: $0^\circ - 50^\circ$
  - **Saturation**: $0.10 - 0.80$
  - **Value**: $0.20 - 0.95$

Any pixel failing these checks is aggressively discarded, vastly improving the accuracy of the subsequent clustering step.

## Stage 4: Custom K-Means Clustering

To determine the single "representative" skin tone from the thousands of masked pixels, the pipeline relies on Unsupervised Machine Learning, specifically K-Means clustering.

- **Implementation**: Instead of relying on an external library, the K-Means algorithm is implemented entirely from scratch using `tf.tensor2d`, `tf.norm`, and `tf.moments` to leverage WebGL hardware acceleration.
- **Initialization (K-Means++)**: The algorithm is seeded using **K-Means++**. Rather than picking random starting points, it distributes the initial centroids spatially across the data. This guarantees much faster convergence and avoids getting trapped in poor local optima.
- **Execution**: The algorithm groups the pixels into $K=3$ clusters based on Euclidean distance in the 3D RGB color space. It runs for a maximum of 20 iterations or until the centroids stop shifting significantly ($\Delta < 0.5$).
- **Selection**: The cluster with the highest density (the most pixels assigned to it) is chosen as the dominant, representative skin tone.

## Stage 5: Soft Clustering & Perceptual Color Interpolation

Rather than mapping the user into one of 12 rigid color palettes (a "Hard Clustering" approach), PaletteIQ V3 utilizes Soft Clustering to generate an infinite number of highly personalized palettes.

1. **Color Space Transformation**: The dominant RGB skin tone is converted into the **CIELAB ($L^*a^*b^*$) color space**. This space is perceptually uniform, meaning mathematical distances perfectly mimic human visual perception.
2. **Anchor Distance Calculation**: The system calculates the Euclidean distance between the user's skin tone and 12 predefined "ideal" anchor tones (e.g., ideal Fair/Cool, ideal Deep/Warm).
3. **Inverse Distance Weighting (IDW)**: The algorithm isolates the top 3 nearest anchors. It calculates a mathematical weight for each anchor inversely proportional to its squared distance (so the closest anchor has the strongest gravitational pull).
4. **Color Blending**: The app iterates through the recommended colors (staples, accents, avoid) from the top 3 anchors and computes a weighted average of their coordinates directly in the $L^*a^*b^*$ color space. This prevents the colors from looking muddy or gray, which inevitably happens when blending purely in RGB.
5. **Final Output**: The resulting blended $L^*a^*b^*$ coordinates are converted safely back into RGB Hex codes, producing a 1-in-a-billion palette completely unique to the user's exact dermal layer.

*(Note: The system still calculates the HSL-based Depth and Undertone purely to provide a helpful text description in the UI, but the generated palette hex codes are driven entirely by the continuous interpolation engine.)*

---

### Memory Management Note
Because TensorFlow.js holds tensors in GPU memory, the application makes extensive use of `tf.tidy()` and `tensor.dispose()` during the K-Means loop. This prevents memory leaks, allowing a user to upload and analyze dozens of photos in a single session without crashing the browser tab.
