# Pickwise AI — Product Recommendation System

A professional React + Python FastAPI + Google Gemini product recommendation assessment demo.

## Features
- Browse and search a catalog of **16 fictional sample products** across Smartphones, Laptops, Audio, Tablets, Wearables and Cameras.
- Type natural-language preferences, e.g., "Gaming phone under $500".
- Gemini selects catalog IDs with reasons using **schema-constrained JSON output**.
- Server-side validation removes unknown IDs, repeated products and products over an explicit USD budget.
- Recommended products are displayed and filtered in the React UI.
- Error messages, loading state, example prompts, category and text filters, mobile-friendly design.

**Important:** All sample product brands, descriptions and prices are fictional. This is not real-time shopping inventory.

## Run locally (Windows PowerShell)

Prerequisites: Node.js 20+, Python 3.11+.

1. Clone repository and enter directory.
2. Run \`npm install\`.
3. Run \`python -m venv .venv\`.
4. Run \`.\.venv\Scripts\python.exe -m pip install -r requirements.txt\`.
5. Copy \`.env.example\` to \`.env\` and set your real \`GEMINI_API_KEY\`. Never paste an API key into GitHub or the frontend.
6. Terminal 1: \`.\.venv\Scripts\python.exe -m uvicorn backend.engine:app --reload --port 8000\`.
7. Terminal 2: \`npm run dev\`. Open \`http://localhost:5173\`.

The Vite proxy sends \`/api/*\` to local FastAPI on port 8000.

## Vercel deployment

Import the repository into Vercel with repository root as project root. \`vercel.json\` configures the Vite build (\`dist\`) and a Python function (\`api/index.py\`), routing \`/api/*\` to FastAPI.

Before deploying, in Vercel Project Settings → Environment Variables, set:
- \`GEMINI_API_KEY\` (required, private)
- \`GEMINI_MODEL\` (optional, defaults to \`gemini-2.5-flash\`; choose a model enabled for your key)

Deploy, then test \`https://YOUR-DEPLOYMENT.vercel.app/api/health\` and a real AI recommendation. Build success alone does not prove the Python route is configured correctly; inspect Vercel function logs for API errors.

## API
- \`GET /api/health\`: app health and sample catalog count
- \`GET /api/products\`: trusted sample products
- \`POST /api/recommend\`: JSON body \`{"preference":"phone under $500 for gaming"}\`

## Architecture

\`src/App.jsx\` React → \`/api/recommend\` FastAPI → Google Gemini (Pydantic structured output) → catalog ID and budget validation → recommended product cards.

The AI can select only products from \`catalog/products.json\`; all returned product details are loaded from that file, not invented by AI. This is a demo, so no payment flow, user authentication, or live retailer prices.
