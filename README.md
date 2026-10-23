# Report Generation Frontend (Premium Feature)

A frontend-only income and expense report dashboard using Node.js to serve static files and vanilla JavaScript for the UI. No database, API, or backend report generation is included.

## Requirements
- Node.js 18+

## Run it
1. Extract the ZIP or open this folder in VS Code.
2. Open a terminal in this project folder.
3. Run `npm start`.
4. Visit `http://localhost:3000`.

If port 3000 is already in use, run PowerShell with `$env:PORT=3001; npm start` and visit `http://localhost:3001`.

## Features
- Sample income and expense transactions
- Daily, weekly, monthly, and all-time filter buttons
- Month selector, search, type filter, and pagination
- Summary cards for net balance, income, and expenses
- Cash-flow chart and spending category breakdown
- Premium CSV download, generated in the browser
- Responsive desktop/tablet/mobile layout

## Previewing Premium vs non-Premium
Open `public/app.js` and change:

```js
const IS_PREMIUM_USER = true;
```

to `false` to preview the disabled download button and upgrade notice for a non-premium account. This is only a UI demo: in a real app, premium status must be checked by the backend, because users can change client-side JavaScript.

## Important
All transactions are dummy sample data. The design reference link could not be inspected in this environment, so this is an original polished dashboard layout based on the written requirements. Replace the sample data in `public/app.js` with API data in the next task.
