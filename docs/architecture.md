# BMAD Architecture Overview

This project follows the **Build-Manage-Automate-Deploy (BMAD)** methodology for AI agents.

## Directory Structure

- **bmad_core/**: Contains the core framework and shared AI logic.
- **agent_templates/**: Houses specific agent implementations (e.g., HR, CRM).
- **docs/**: Project documentation and architecture whitepapers.
- **postman/tmpost/**: API testing collections.
- **docker/**: Deployment and containerization scripts.

## Core Flow
1. **Build**: Define the agent's role and capabilities.
2. **Manage**: Handle data ingestion and storage (MongoDB/Pinecone).
3. **Automate**: Implement LLM-driven workflows and RAG pipelines.
4. **Deploy**: Containerize and deploy via Docker/Kubernetes.
