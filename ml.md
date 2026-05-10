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

## Stage 5: Rule-Based Classification

Once the dominant RGB skin tone is identified, it is passed through a deterministic classification tree to map the user to 1 of 12 predefined color palettes.

The RGB value is converted to **HSL (Hue, Saturation, Lightness)** to extract meaningful semantic features:

1. **Depth (via Lightness)**:
   - Evaluates the $L$ channel to place the user into 6 bins: *Fair, Light, Medium, Tan, Deep,* or *Rich*.
2. **Undertone (via Hue & Saturation)**:
   - **Warm**: Hue between $20^\circ-50^\circ$ and Saturation $> 0.25$.
   - **Cool**: Hue between $340^\circ-360^\circ$ or $0^\circ-20^\circ$ and Saturation $> 0.20$.
   - **Neutral**: If Saturation is $< 0.15$, the tone is classified as neutral (which defaults to the Warm palette in this application).

The combination of the Depth and Undertone results in the final categorization key (e.g., `medium_warm` or `deep_cool`), which is then used to serve the curated wardrobe and accent colors.

---

### Memory Management Note
Because TensorFlow.js holds tensors in GPU memory, the application makes extensive use of `tf.tidy()` and `tensor.dispose()` during the K-Means loop. This prevents memory leaks, allowing a user to upload and analyze dozens of photos in a single session without crashing the browser tab.
