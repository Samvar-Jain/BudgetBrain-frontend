# BudgetBrain Frontend
 
A modern React dashboard for BudgetBrain, an AI-powered personal finance tracker. Upload bank statements, visualize spending by category, get AI-generated insights, and manage savings goals — all in a sleek, responsive interface.
 
**Part of the BudgetBrain project:**
- [budgetbrain-api](https://github.com/Samvar-Jain/BudgetBrain-api) — Spring Boot backend
- [budgetbrain-ml](https://github.com/Samvar-Jain/BudgetBrain-ml) — Python ML classifier
**Live deployment:** https://budgetbrain-frontend.vercel.app
 
---
 
## Features
 
- **CSV Upload & Auto-Classification:** Drag-and-drop CSV bank statement uploads with real-time classification progress
- **Interactive Spending Charts:** Doughnut chart with dynamic legend showing category totals and percentages
- **AI Spending Insights:** Chat-like panel with Gemini-powered savings recommendations and analysis
- **Savings Goals Tracker:** Create, update, and monitor progress toward financial goals with deadline tracking
- **Transaction Dashboard:** Browse all uploaded transactions with category filters, search, and pagination
- **Modern UI/UX:** Dark mode optimized, responsive design, Tailwind CSS v4, Lucide Icons
- **Persistent Storage:** localStorage integration for client-side state management
- **Mobile-Friendly:** Works seamlessly on desktop, tablet, and mobile devices
## Tech Stack
 
- **Framework:** React 18+ (Vite)
- **Styling:** Tailwind CSS v4, custom Lucide Icons
- **HTTP Client:** Axios with environment-based API URL
- **Charting:** Chart.js + react-chartjs-2 (doughnut chart)
- **Build Tool:** Vite (optimized, fast hot reload)
- **Deployment:** Vercel
- **Package Manager:** npm
## Local Setup
 
### Prerequisites
- Node.js 16+ and npm
- Spring Boot backend running on `http://localhost:8080`
- Python ML service running on `http://localhost:8000`
### Installation
 
```bash
git clone https://github.com/Samvar-Jain/BudgetBrain-frontend.git
cd budgetbrain-frontend
 
# Install dependencies
npm install
 
# Start dev server
npm run dev
```
 
Server runs at `http://localhost:5173`
 
### Building for Production
 
```bash
npm run build
# Output: dist/ directory (optimized for deployment)
 
# Preview production build locally
npm run preview
```
 
---
 
## Components Overview
 
### `App.jsx` — Main Dashboard
 
The root component orchestrating the entire application:
 
```
App
├── Sidebar Navigation
│   ├── Logo & branding
│   ├── Main nav links
│   └── User account section
├── KPI Cards
│   ├── Total Income
│   ├── Total Expenses
│   ├── Net Savings
│   └── Goal Progress %
├── Tabs (Transactions | Analytics)
│   ├── TransactionGrid (search, filter, pagination)
│   ├── CategoryChart (interactive doughnut)
│   └── InsightsPanel (AI recommendations)
└── UploadForm (drag-and-drop)
└── GoalsTracker (CRUD + progress bars)
```
 
**State Management:** Uses `localStorage` for transaction and goal persistence
 
### `UploadForm.jsx` — CSV Import
 
- Drag-and-drop file upload UI
- Visual feedback (hover, loading, success/error states)
- File validation (`.csv` only)
- Progress indication during upload
- Error messages with retry guidance
### `CategoryChart.jsx` — Spending Visualization
 
- Interactive doughnut chart (Chart.js)
- Category breakdown with total amounts and percentages
- Hover tooltips showing `₹{amount} ({percentage}%)`
- Tailwind-styled custom legend
- Dynamic color mapping per category
### `InsightsPanel.jsx`
 
- "Get Insight" button triggers Gemini API call
- Displays AI-generated spending summaries
- Skeleton loader while fetching
- Copy-to-clipboard functionality
- Markdown-rendered recommendations
### `GoalsTracker.jsx`
 
**CRUD Operations:**
- Create new goals with form modal
- Display goals with progress bars
- Quick-edit inline overlays (update `currentAmount`)
- Delete goals with confirmation
- Calculate progress % and deadline status
**Visual Feedback:**
- Green progress bar filling as goal progresses
- Deadline display (e.g., "by 2026-12-31")
- Motivational messaging at different progress thresholds
### `TransactionGrid.jsx` (Added with Recent Updates)
 
- Paginated list of all uploaded transactions
- Category filter dropdown
- Real-time search by description
- Date range filtering (optional)
- Sort by amount or date
- Delete individual transactions
---
 
## API Integration
 
### Environment Variables
 
**Local Development:** Defaults to `http://localhost:8080`
 
```javascript
// src/api/client.js
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
```
 
**Production:** Set in Vercel dashboard:
```
VITE_API_BASE_URL=https://budgetbrain-api.onrender.com
```
 
### Endpoints Called
 
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/upload` | Upload CSV, get classified transactions |
| GET | `/insights` | Fetch AI spending summary |
| GET | `/goals` | List all savings goals |
| POST | `/goals` | Create new goal |
| PUT | `/goals/{id}` | Update goal progress |
| DELETE | `/goals/{id}` | Delete goal |
 
### Error Handling
 
- User-friendly error messages displayed in UI
- Retry buttons for transient failures
- Console logging for debugging
- Fallback to localhost if env var not set
---
 
## Styling & Design
 
### Tailwind CSS v4
 
Uses custom configuration with:
- **Font:** Plus Jakarta Sans (Google Fonts) — modern, readable
- **Color Scheme:** Dark mode optimized (slate, gray, accent colors)
- **Animations:** Slide-in transitions on page load
- **Responsive:** Mobile-first breakpoints (sm, md, lg, xl)
### Lucide Icons
 
Integrated for UI consistency:
- Upload icon (drag-and-drop)
- Sparkles icon (AI insights)
- Target icon (goals)
- Category icons in charts
- Delete/edit action icons
### Category Colors
 
Hardcoded color palette for consistency:
 
```javascript
const CATEGORY_COLORS = {
  Food: "#F59E0B",      // Amber
  Transport: "#3B82F6", // Blue
  Travel: "#8B5CF6",    // Purple
  Shopping: "#EC4899",  // Pink
  Bills: "#EF4444",     // Red
  Finance: "#10B981",   // Green
  Health: "#14B8A6",    // Teal
  Income: "#22C55E",    // Lime
  Other: "#6B7280",     // Gray
};
```
 
---
 
## State Management
 
### localStorage Persistence
 
Transaction and goal data cached locally for instant page loads:
 
```javascript
// On upload success
localStorage.setItem('transactions', JSON.stringify(transactions));
 
// On goal changes
localStorage.setItem('goals', JSON.stringify(goals));
 
// On component mount
const cached = localStorage.getItem('transactions');
if (cached) setTransactions(JSON.parse(cached));
```
 
**Trade-offs:**
- ✅ Fast, no network call on revisit
- ❌ Doesn't reflect updates from other devices
- ⚠️ Manual sync when data is updated
---
 
## Deployment to Vercel
 
### Automatic Deployment
 
Vercel auto-deploys on every `main` branch push:
 
```bash
git push origin main
# Vercel automatically builds and deploys
```
 
### Manual Deployment
 
1. Go to **Vercel Dashboard** → **BudgetBrain-frontend**
2. **Deployments** → Find latest deployment
3. Click **...** → **Redeploy**
### Build Output
 
- **Build Command:** `npm run build`
- **Output Directory:** `dist/`
- **Node Version:** 18.x (Vercel default)
---
 
## Testing Locally
 
### Full End-to-End (Three Services)
 
```bash
# Terminal 1: Python ML service
cd ../budgetbrain-ml
source venv/bin/activate
uvicorn main:app --reload --port 8000
 
# Terminal 2: Spring Boot API
cd ../budgetbrain-api
./mvnw spring-boot:run
 
# Terminal 3: React frontend
cd ../budgetbrain-frontend
npm run dev
 
# Browser: http://localhost:5173
```
 
### Test Workflow
 
1. **Upload CSV:** Click upload, select `real_test_data.csv`
2. **View Chart:** Confirm doughnut chart renders with categories
3. **Get Insight:** Click "Get Insight" button, wait 3-8s for Gemini response
4. **Create Goal:** Click "+ New Goal", fill form, verify in list
5. **Update Goal:** Edit `currentAmount`, confirm progress bar updates
6. **Delete Goal:** Click delete, confirm it disappears
---
 
## Known Limitations
 
### 1. Upload Feature Fails on Live Deployment
The `/upload` endpoint works on localhost but returns 502 on Render due to Python cold-start timeouts.
 
**Workaround:** Test locally where all three services are running.
 
**Status:** Documented as known limitation (see `NOTES.md` in API repo).
 
### 2. localStorage Only Stores Latest Upload
When user uploads a new CSV, previous transaction data is overwritten.
 
**Future Enhancement:** Implement transaction history with dates to support multiple uploads over time.
 
### 3. No Authentication
All data is stored locally or in shared database (no per-user isolation).
 
**Future Enhancement:** Add user login, per-user data isolation.
 
### 4. Gemini API Rate Limits
Excessive "Get Insight" clicks may hit free-tier rate limits.
 
**Workaround:** Limit to ~3 insights per minute.
 
---
 
## Performance Optimizations
 
- **Code Splitting:** Vite automatically chunks components
- **Lazy Loading:** Chart.js components load on-demand
- **Image Optimization:** Icons are SVG (minimal size)
- **CSS Minification:** Tailwind purges unused styles in production
- **Bundle Size:** ~150KB (gzipped, after Vite build)
**Local Dev:** Hot reload <100ms for most file changes
 
---
 
## Browser Support
 
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)
Uses standard React 18, Tailwind CSS, and Axios — no bleeding-edge APIs.
 
---
 
## Debugging
 
### API calls not working
 
**Check 1:** Is backend running?
```bash
curl http://localhost:8080/goals
# Should return [] or error, not timeout
```
 
**Check 2:** Is `VITE_API_BASE_URL` set correctly?
- Open browser DevTools → Console
- Type: `console.log(import.meta.env.VITE_API_BASE_URL)`
- Should show `http://localhost:8080` (local) or Render URL (production)
**Check 3:** CORS errors?
- Check browser Network tab for `/upload` request
- If "blocked by CORS", backend's `@CrossOrigin` annotation needs updating
### Chart not displaying
 
- Confirm Chart.js installed: `npm list react-chartjs-2`
- Check browser console for errors
- Verify transaction data: `localStorage.getItem('transactions')` should have data
### Goals not persisting
 
- localStorage may be disabled (Privacy Badger, Firefox)
- Check DevTools → Application → localStorage
- Should see entries like `transactions` and `goals` keys
### Slow initial load
 
- Vercel cold-start (~5-10s first request)
- Backend cold-start on Render (~30-60s, free tier)
- Normal — not a bug
---
 
## Project Structure
 
```
budgetbrain-frontend/
├── src/
│   ├── components/
│   │   ├── UploadForm.jsx
│   │   ├── CategoryChart.jsx
│   │   ├── InsightsPanel.jsx
│   │   ├── GoalsTracker.jsx
│   │   └── TransactionGrid.jsx
│   ├── api/
│   │   └── client.js              # Axios instance with env-based URL
│   ├── App.jsx                    # Main dashboard component
│   ├── index.css                  # Tailwind + custom animations
│   └── main.jsx                   # React entry point
├── public/                        # Static assets
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── package.json                   # Dependencies & scripts
└── README.md
```
 
---
 
## Development Workflow
 
### Adding a New Component
 
1. Create file in `src/components/NewComponent.jsx`
2. Import in `App.jsx`
3. Render in JSX: `<NewComponent />`
4. Vite hot-reload should refresh immediately
### Adding a New API Call
 
1. Update `src/api/client.js` if needed (base config)
2. Call in component: `apiClient.get('/endpoint')`
3. Handle response and errors
4. Update UI state with results
### Styling New Elements
 
1. Use Tailwind utility classes: `className="bg-blue-600 hover:bg-blue-700 ..."`
2. For custom styles, add to `index.css`
3. Custom colors defined in `tailwind.config.js`
---
 
## Future Enhancements
 
- Transaction history (multiple uploads preserved)
- Budget alerts (notify when exceeding category limits)
- Recurring transaction detection
- Export to CSV/PDF
- Mobile app (React Native)
- Dark/light mode toggle
- Multi-language support
- User authentication & cloud sync
- Cryptocurrency support
---
 
## Contributing
 
This is a portfolio project. Contributions are not actively solicited, but the codebase is open for learning and reference.
 
## License
 
MIT
 
---
 
## Questions?
 
See the main [BudgetBrain Architecture](https://github.com/Samvar-Jain/BudgetBrain-ml) for full system design and integration details.
