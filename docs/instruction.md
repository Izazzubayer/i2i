In this same folder - 

Here’s a **comprehensive `instruction.md`** designed specifically for **Cursor** to develop your project **i2i (Image-to-Image AI Processing Platform)**.
It’s optimized for a **single-page web app** that contains **all functionalities** (upload → process → summary → edit → export) using **popups, drawers, and smart interactions** — minimizing navigation and maximizing efficiency.

---

# 🧠 instruction.md — i2i Web App (All-in-One AI Image Processing Platform)

## 🏗️ Project Overview

**i2i** is a web application that allows businesses to upload large batches of images along with an instruction file (PDF or text), process them using AI (e.g., background replacement, enhancement, etc.), and manage the results — all **within a single, fluid page**.

It aims to **reduce navigation** and **minimize clicks** by using **popups, modals, drawers, and smart UI sections** that appear contextually instead of switching pages.

---

## ⚙️ Tech Stack

* **Frontend:** Next.js + React + TypeScript
* **Styling:** TailwindCSS + ShadCN/UI components
* **State Management:** Zustand or Context API
* **AI Interaction Layer:** Axios / Fetch to backend API endpoints
* **File Handling:** React Dropzone / FilePond
* **Image Preview:** Cloudinary / local blob URLs
* **Animation:** Framer Motion (smooth section transitions)

---

## 🧭 User Flow (Single Page)

### 1️⃣ Upload Section (Top)

**Purpose:** Upload image batches + instruction file or text.

**Components:**

* Drag & Drop area for image folders (ZIP, PNG, JPG)
* Instruction upload (PDF/DOC)
* Textarea fallback for manual instructions
* Upload progress bar with cancel button
* “Start Processing” button → triggers AI backend

**UX Behavior:**

* Once uploaded, the section collapses and shows a progress bar (animated).
* User sees live logs and a small floating AI status popup.

---

### 2️⃣ Processing Status (Live Updates)

**Purpose:** Display real-time processing activity.

**Components:**

* Progress bar (% of images processed)
* Log feed (e.g., “Image 24: background replaced”)
* AI-generated summary text (editable)
* Status badge: “Processing”, “Completed”, “Failed”
* On completion → smooth scroll to Gallery section.

---

### 3️⃣ Processed Images Gallery

**Purpose:** View, approve, or retouch results.

**Layout:**

* 3-column responsive grid
* Image card elements:

  * Processed image thumbnail
  * Hover overlay → Approve / Retouch buttons
  * Status tag (“Approved”, “Needs Retouch”)
  * Tooltip for original instruction reference

**Retouch Flow:**

* Clicking “Retouch” opens a **right-side drawer**

  * Shows the image
  * Text input for instruction (e.g., “Brighten shadows”)
  * Buttons: “Apply”, “Cancel”
* Upon “Apply” → sends new AI edit request and live-updates the same card.

---

### 4️⃣ Smart Summary Drawer (Auto Opens on Completion)

**Purpose:** Provide batch summary and export options.

**Contents:**

* Editable AI-generated summary
* Batch stats:

  * Total images processed
  * Retouched count
  * Approved count
* Export options:

  * [Download All] (ZIP with summary.txt)
  * [Connect to DAM] (OAuth popup or URL input)
  * [New Batch] (resets app state)
* Sticky footer: “All set? Start New Upload”

---

### 5️⃣ Popups and Smart Components

**Types:**

* **Toast Notifications:** “Upload completed”, “AI edit ready”, “Retouch saved”
* **Confirm Modals:** Before deleting / resetting
* **Progress Snackbars:** Bottom-left small visual indicators
* **Tooltip Guides:** First-time user hints for each major section

---

## 🧩 UI Layout Architecture

```
<MainLayout>
  <Header />         // Logo, navigation, profile
  <UploadSection />  // Upload area
  <ProcessingPanel />// Live logs + summary
  <ImageGallery />   // 3-column gallery
  <SummaryDrawer />  // Export + batch stats
  <Toaster />        // Notifications
</MainLayout>
```

---

## 🧰 API Endpoints (Example)

```
POST /api/upload
  - images[]
  - instructions (file/text)

GET /api/status/:batchId
  - returns progress % and logs

POST /api/retouch/:imageId
  - { instruction: string }

GET /api/results/:batchId
  - returns list of processed images + metadata

POST /api/export
  - { type: "download" | "dam", batchId }
```

---

## 🎨 UI Design Principles

* **Visual Language:** Clean enterprise SaaS, subtle gradients, soft corners (rounded-2xl)
* **Primary color:** `#1D4ED8` (blue-600)
* **Typography:** `Inter`, `IBM Plex Sans`
* **Shadows:** subtle (elevation for depth)
* **Animations:** smooth transitions for each section (Framer Motion)
* **Spacing:** generous padding, clear visual hierarchy

---

## 🧠 Smart Behaviors

* Auto-scroll to active section on state change.
* Inline edits save automatically.
* Dynamic drawers replace traditional page navigation.
* Persistent upload progress (even if the user navigates between states).
* Global shortcut keys (e.g., `/` to open search, `r` to retouch, `e` to export).

---

## 🚀 Development Steps for Cursor

1. **Scaffold** Next.js + Tailwind project.
2. **Add ShadCN/UI components** (Button, Drawer, Card, Dialog, Toast).
3. **Build main sections:** Upload → Processing → Gallery → Summary.
4. **Implement global state** (Zustand store for batches, logs, AI status).
5. **Create mock API handlers** under `/app/api/*`.
6. **Integrate Framer Motion** for enter/exit transitions.
7. **Implement export options** (ZIP generation mock + DAM placeholder).
8. **Add responsive design** and dark mode toggle.
9. **Test all transitions & modals** to ensure minimal clicks.

---

## ✅ Deliverables

* `/app/page.tsx` → main single-page layout
* `/components/` → modular React components
* `/lib/api.ts` → API handlers
* `/styles/globals.css` → Tailwind styles
* `/public/` → placeholder assets and icons
* Working prototype with:

  * Image upload
  * Instruction editor
  * AI summary viewer
  * Retouch drawer
  * Export summary modal

---

Would you like me to create the **Cursor-ready folder + file structure with sample component stubs (in Next.js)** next — so you can just paste and start building?
