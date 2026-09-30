# 🚢 ARTIFEX

**Intelligent Freight Forecasting Model**
_Prototype for Internal Hackathon (Presentation: Sept 8-9)_

## 📖 Project Overview

The project is a B2B enterprise web dashboard that predicts maritime bulk freight rates and recommends optimal vessel chartering windows for East Coast Indian ports. It replaces manual forecasting by ingesting Baltic Exchange proxies, matching cargo volume to vessel classes, and filtering them against strict port infrastructure limits (draft, LOA, beam).

### Tech Stack

- **Frontend:** React.js + Tailwind CSS
- **Backend:** Python (FastAPI)
- **Database:** PostgreSQL (Relational Data), Redis (Caching)
- **Forecasting Engine:** Python utilizing SARIMA/Prophet

## 🚀 GitHub Desktop Workflow (Mandatory)

Since 6 of us are working on different parts of the stack, we are using a strict branching strategy to prevent merge conflicts. **Follow these steps carefully.**

### 1️⃣ Clone the Repo (Do this once)

- Open **GitHub Desktop**.
- Go to `File` > `Clone Repository...`
- Click the **GitHub.com** tab, search for `ARTIFEX`, choose a local folder, and click **Clone**.

### 2️⃣ Create a Dedicated Branch (Do this before typing ANY code)

- In GitHub Desktop, click the **Current Branch** dropdown at the top center.
- Click **New Branch**.
- Name it clearly based on your task (e.g., `frontend-ui`, `backend-api`, `ml-baseline`).
- Click **Create Branch**, and then **Publish branch**.

### 3️⃣ Daily Routine: Work, Commit, Push

- Code strictly inside your assigned folder (`frontend`, `backend`, or `ml-engine`).
- When finished with a chunk of work, open GitHub Desktop.
- Type a short summary of what you did in the bottom-left corner.
- Click **Commit to [your-branch-name]**.
- Click **Push origin** at the top to back up your work to the server.

### 4️⃣ Merge Without Breaking Code (The Golden Rule)

- When your task is complete, go to GitHub Desktop and click `Branch` > `Create Pull Request`.
- 🛑 **DO NOT CLICK THE GREEN MERGE BUTTON YOURSELF.** 🛑
- Everyone collectively will review the pull request to ensure it doesn't break the application. I will be the only one clicking Merge.
- Once I announce in the group chat that a PR has been merged, switch your branch back to `main` in GitHub Desktop and click **Fetch origin** followed by **Pull origin** to download the latest updates!
