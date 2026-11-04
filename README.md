# PA4 – A-Frame VR Experience: Underwater Research Base

## Student Information
* **Student ID:** 243122
* **Course/Project:** PA4 (A-Frame / WebXR 3D Graphics)[cite: 7]
* **Institution:** Astana IT University

---

## Project Overview
This project is an immersive Virtual Reality (VR) interactive scene built using
 **A-Frame (v1.8.0)**. It simulates an **Underwater Research Base** featuring a structured gallery corridor, custom JavaScript components for animations and object inspection, preloaded asset management, and atmospheric deep-sea lighting with exponential fog

---

## Key Features & Technical Implementation
* **Custom Components (`components.js`):**
  * `x3122-texture`: Handles texture mapping, scaling, and repetition (used on the ocean floor and station walls).
  * `x3122-motion`: Controls smooth pulse animations for scene exhibits.
  * `x3122-exhibit`: Manages raycaster/cursor interactions to dynamically update the central HUD information panel with exhibit details and student ID.
* **Preloaded Assets (`<a-assets>`):**
  * Optimized image textures including `water_ground.jpg` (ground floor with 10x10 repeat), `metal_wall.jpg` (back wall), and `glow_pattern.jpg` (interactive glowing panel element).
* **Atmosphere & Environment:**
  * Deep-sea underwater aesthetic configured with exponential fog (`#001e36`) and balanced ambient/directional lighting.
* **Controls & Interactivity:**
  * Desktop mouse raycasting (`rayOrigin: mouse`) and WASD keyboard navigation.
  * VR controller support (`laser-controls`) with the `Enter VR` UI enabled for headsets.

---

## Project Structure
```text
├── index.html       # Main A-Frame scene markup and entity layout
      ├── components.js    # Custom A-Frame component logic and interactivity
      └── textures/        # Optimized image assets (water_ground.jpg, metal_wall.jpg, glow_pattern.jpg)