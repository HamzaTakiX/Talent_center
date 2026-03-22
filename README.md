# PFE Talent Center

This repository contains the foundational structure for the PFE Talent Center application.

## 🏗️ Project Structure

The codebase is organized as a monorepo containing both the frontend and backend applications, along with related documentation. 

```text
pfe-talent-center/
├── backend/       # Backend application (Python)
├── frontend/      # Frontend application (Node/JavaScript)
├── docs/          # General documentation, diagrams, and architecture notes
├── .gitignore     # Global ignored files (covers both JS/Python and OS files)
└── README.md      # Root project documentation
```

## 📐 Architecture Principles

- **Separation of Concerns**: The business logic is strictly separated from presentation and routing layers.
- **Maintainable & Modular**: Built to scale. The structure inherently supports adding new features and modules alongside the initial foundation and authentication workflows.
- **Simplicity Active**: We aim to avoid overengineering—focusing on delivering a production-grade yet straightforward logic flow.

## ⚙️ Next Steps
Currently, only the foundational project structure is set up. Next steps will include initializing the `backend/` and `frontend/` applications and configuring the authentication module.
