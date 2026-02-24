# Link Crawler Test

This test crawls all internal links in the React app and checks if they have content.

## Usage

1. Start the app with Docker:
   ```bash
   docker-compose -f docker-compose-development.yml up
   ```

2. In a new terminal, navigate to the frontend directory and run the test:
   ```bash
   cd frontend
   yarn test:links
   ```
   
   Or use Cypress GUI:
   ```bash
   cd frontend
   yarn cypress open
   ```

3. Select `check-all-links.cy.js` to run the link crawler.

## Results

The test creates two JSON files in `cypress/results/`:
- `all-links.json` - All discovered links
- `failed-links.json` - Links with no content or that failed to load

## What it does

- Starts at `/` (home page)
- Finds all internal links (`/something`)
- Visits each link and discovers new links
- Handles Hebrew characters in URLs
- Records links that have no content 