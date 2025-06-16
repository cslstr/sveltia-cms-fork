# Developer Workflow README

This document outlines my Git workflow for managing custom development on my fork of the https://github.com/sveltia/sveltia-cms.git project.

---

## 📦 Project Setup

I forked the original repository on GitHub via the website and cloned my fork locally:

    git clone git@github.com:cslstr/sveltia-cms-fork.git
    cd sveltia-cms-fork

By default, `origin` points to my fork:

    git remote -v
    # origin    git@github.com:cslstr/sveltia-cms-fork.git (fetch)
    # origin    git@github.com:cslstr/sveltia-cms-fork.git (push)

---

## 🔧 Adding the Upstream Remote

To keep my fork up to date with the original project, I add the original repo as `upstream`:

    git remote add upstream https://github.com/sveltia/sveltia-cms.git
    git remote -v
    # origin    git@github.com:cslstr/sveltia-cms-fork.git (fetch)
    # origin    git@github.com:cslstr/sveltia-cms-fork.git (push)
    # upstream  https://github.com/sveltia/sveltia-cms.git (fetch)
    # upstream  https://github.com/sveltia/sveltia-cms.git (push)

---

## 🌿 Branching Strategy

### Main Branch

- The local `main` branch tracks `origin/main` (my fork’s main branch).
- I keep `main` clean and in sync with upstream by regularly merging or rebasing upstream changes.

### Feature / Development Branches

- I create feature or dev branches off `main` for all my work.
- Branch naming convention: `dev/<feature-name>`, e.g. `dev/custom-theme-support`.

```
git checkout main
git pull origin main
git checkout -b dev/my-feature
```

Push feature branches to my fork:

```
git push -u origin dev/my-feature
```

---

## 🔄 Keeping Your Fork Up to Date

Periodically update your local `main` branch with upstream changes:

    git fetch upstream
    git checkout main
    git merge upstream/main
    # or use rebase for a cleaner history:
    # git rebase upstream/main

    git push origin main

Then update your feature branches:

    git checkout dev/my-feature
    git rebase main
    # or merge main if you prefer

---

## 🗃️ Git Remote Overview

Check remotes anytime with:

    git remote -v

Expected output:

    origin    git@github.com:cslstr/sveltia-cms-fork.git (fetch)
    origin    git@github.com:cslstr/sveltia-cms-fork.git (push)
    upstream  https://github.com/sveltia/sveltia-cms.git (fetch)
    upstream  https://github.com/sveltia/sveltia-cms.git (push)

---

## 🧠 Tips

- Always branch off the latest `main` branch before starting new work.
- Keep `main` clean and synced with upstream to minimize conflicts.
- Use descriptive commit messages.
- Use pull requests within your fork to track and review feature work.
- Visualize history with:

    git log --oneline --graph --all

- Tag stable milestones:

    git tag v0.1-feature-name
    git push origin --tags

---

Happy coding!

