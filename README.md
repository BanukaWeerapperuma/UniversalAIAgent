# HR Automation Agent (BMAD-Method)

This project is a Node.js backend for an HR Automation Agent built using the BMAD-Method (Build-Manage-Automate-Deploy). It features candidate screening via OpenAI and vector database integration with Pinecone.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A MongoDB Atlas account and cluster
- A Pinecone Vector Database account and index
- An OpenAI API Key

## Setup Instructions

1. **Install Dependencies**
   Ensure you are in the root directory (`UniversalAIAgent`) and run:
   ```bash
   npm install
   ```

2. **Environment Variables**
   The project uses the `.env` file in the root directory. Make sure your `.env` contains the following keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   DB_URI=your_mongodb_atlas_uri
   VECTOR_DB_API=your_pinecone_api_key
   BMAD_ENV=development
   BMAD_PORT=3000
   ```

## Running the Project

You can run the project in development mode (which uses `nodemon` to automatically restart the server when files change):

```bash
npm run dev
```

Or start it normally:
```bash
npm start
```

You should see output similar to:
```
✅ Pinecone client initialized successfully
🚀 Server running on port 3000 in development mode
✅ MongoDB connected successfully
```

## API Endpoints

### 1. Health Check
Verify the server is running.
- **GET** `/health`

### 2. Candidate Screening & Ranking
Upload a candidate's resume to evaluate it against a job description.
- **POST** `/api/candidates/screen`
- **Body (JSON):**
  ```json
  {
    "candidateName": "John Doe",
    "resumeText": "5 years of Node.js experience...",
    "jobDescription": "Looking for a backend dev with Node.js..."
  }
  ```
*(Note: If the body contains discriminatory keywords like 'age' or 'gender', the request will be blocked by the labor law compliance middleware).*

### 3. Fetch Rankings
Get the list of evaluated candidates.
- **GET** `/api/candidates/rankings`

### 4. HR Agent Workflow
Trigger broader HR workflows (like the hiring pipeline).
- **POST** `/agent/workflow`
- **Body (JSON):**
  ```json
  {
    "workflowType": "hiring",
    "data": {
      "candidateName": "John Doe"
    }
  }
  ```
