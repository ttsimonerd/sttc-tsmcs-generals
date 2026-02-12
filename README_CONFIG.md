# TSmcS Generals - Configuration & Persistence Guide

This guide explains how to use the Master Control configuration files and how to make your adjustments permanent in the project codebase.

## 📥 Importing Configuration (NOT PERMANENT)
1.  Log in as **Owner**.
2.  Click the red **SOLIDIFY CONFIG** button at the bottom of the sidebar.
3.  Click **UPLOAD SNAPSHOT** and select your `.json` configuration file.
4.  The system will instantly apply all settings (Materials, Users, Riddles, Game Parameters) and reload.

## 🛠 Making Changes Permanent
When you adjust settings via the UI, they are saved in your browser's `localStorage`. To make these changes permanent for **all users** (hardcoded into the project), follow these steps:

### 1. Materials & Drop Rates
1.  Export your config file.
2.  Open the file and locate the `"materials"` object.
3.  Open `src/data/materials.ts`.
4.  Update the `MATERIALS_LIST` array with the values from your export.

### 2. Redeemer Riddles
1.  Locate the `"riddles"` object in your export.
2.  Open `src/data/riddles.ts`.
3.  Update the `DEFAULT_RIDDLES` array.

### 3. Mini-Game Parameters
1.  Locate the `"miniGames"` object in your export.
2.  Open `src/services/gameTunerService.ts`.
3.  Update the `DEFAULT_TUNER_CONFIG` object with your tuned values.

### 4. User Credentials & Accounts
1.  Locate the `"credentials"` object in your export.
2.  Open `src/App.tsx` (or wherever your default credentials are defined).
3.  Update the `DEFAULT_USER_CREDENTIALS` constant.

## ⚠️ Important Note
The exported configuration file contains **passwords and sensitive user data**. Handle these files with care and do not share them publicly unless you have removed sensitive information.
