Below is a **ready-to-use Promptify specification** you can paste into your system prompts or implementation documents.
It includes:

* A **first-time demo walkthrough**,
* **Automatic nudges**,
* **UI highlight behavior**,
* **Text bubble instructions**,
* And the exact **user journey** you described.

---

# ✅ **Promptify – First-Time User Demo Walkthrough (FTUE)**

Use this spec to guide your UI/UX system in nudging users through the onboarding flow.

---

## **🎬 Trigger Conditions**

The walkthrough appears **only for first-time users** OR when the user triggers “Show walkthrough.”

---

# **📌 Step-by-Step Walkthrough**

---

## **1. Highlight: Image Upload Area**

**UI Highlight:** Glowing border around the *Upload Image* and *Upload Folder* buttons.
**Text Bubble:**

> **Step 1: Upload Your Images**
> Drag & drop, or click to **upload a single image** or **an entire folder**.
> We’ll use these images as the basis for your prompts and processing.

---

## **2. Highlight: Instruction Upload Panel**

**UI Highlight:** Spotlight the box labeled “Upload Instructions.”
**Text Bubble:**

> **Step 2: Add Instructions**
> Upload a text file, PDF, docx, or markdown file to tell the system what you want it to do.
> You can also type instructions later in the chat.

**Allowed file types:** `.txt, .md, .pdf, .docx, .rtf`

---

## **3. Highlight: Quick Suggestions Area**

**UI Highlight:** Pulse the “Quick Suggestions” section.
**Text Bubble:**

> **Step 3: Try These Suggestions**
> Want ideas? Click one of the suggested prompts to start quickly.
> You can modify or expand them anytime.

Suggested prompts may include:

* *“Describe the objects in this image.”*
* *“Generate alternative design variations.”*
* *“Extract text and summarize the contents.”*

---

## **4. Highlight: Chatbox + Arrow Send Button**

**UI Highlight:**

* Glow around the chat input box
* Animated arrow pointing at the **Send** (→) button

**Text Bubble:**

> **Step 4: Add Extra Details & Send**
> You can add additional instructions or prompts here.
> When you’re ready, **press the arrow** to send your files and instructions for processing.

Once the user presses send:

### **Post-Send Confirmation Box**

A modal appears:

**“Ready to process your files?”**
Shows a summary:

* ✔ Uploaded images
* ✔ Uploaded instructions
* ✔ Chat prompt (optional)

**User options:**

* **Proceed**
* **Go back and edit**

---

# ⭐ Additional Behaviors

### **Automatic Nudges**

* If the user hesitates for more than **8 seconds** on a step, show a small bubble with:
  *“Need help? Click here to continue →”*

### **Skippable**

A “Skip walkthrough” link appears on the bottom-right of each bubble.

### **Restart Walkthrough**

Accessible from the user menu:
→ **Help & Tutorials → Restart Walkthrough**

---

# ✅ Ready-to-Paste System Prompt Version

You can paste this directly into your system instructions:

---

**SYSTEM PROMPT (ONBOARDING):**

> When a first-time user opens the app, activate the **First-Time Demo Walkthrough**.
>
> **Step 1:** Highlight the Image Upload area. Show a bubble explaining:
> “Upload a single image or an entire folder to begin.”
>
> **Step 2:** Highlight the Instruction Upload panel. Show a bubble explaining:
> “Upload instructions (txt/pdf/docx/md) to tell the system what to do.”
>
> **Step 3:** Highlight the Quick Suggestions area. Show a bubble explaining:
> “Click a suggested prompt to start quickly.”
>
> **Step 4:** Highlight the chatbox and arrow send button.
> Bubble text:
> “Add additional details or instructions here, then press the arrow to send your files for processing.”
>
> After the user presses Send, show a confirmation box summarizing the uploaded items and asking the user to Agree & Proceed.
>
> The walkthrough should include: automatic nudges, skippable steps, and restart availability.

---

If you'd like, I can also create:
✅ A visual mockup of each step
✅ The HTML/CSS/JS implementation for the walkthrough
✅ A Figma flow
Which one would you like next?
