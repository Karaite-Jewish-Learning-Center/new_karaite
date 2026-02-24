// check-all-links.cy.js
// Breadth-first crawler that collects all links first, then visits them

describe('Crawl all app links for content', () => {
  it('should visit all internal links and record failures', () => {
    // Ignore common harmless browser errors
    Cypress.on('uncaught:exception', (err, runnable) => {
      // Ignore ResizeObserver errors - they're harmless
      if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        return false;
      }
      // Ignore other common React/browser errors that don't affect functionality
      if (err.message.includes('ResizeObserver loop limit exceeded')) {
        return false;
      }
      if (err.message.includes('Non-Error promise rejection captured')) {
        return false;
      }
      // Let other errors fail the test
      return true;
    });

    const allLinks = new Set(['/']);
    const failedLinks = [];
    const visited = new Set();
    let visitCount = 0;

    cy.log('🚀 Starting link crawler test...');

    function isInternal(href) {
      return href && href.startsWith('/') && !href.startsWith('//');
    }

    function encodeUrl(url) {
      try {
        // Split URL into parts to encode only the path segments
        const parts = url.split('/');
        const encodedParts = parts.map(part => {
          if (part === '' || part === '.') return part;
          // Encode each part but preserve forward slashes
          return encodeURIComponent(part);
        });
        return encodedParts.join('/');
      } catch (e) {
        cy.log(`❌ Failed to encode URL: ${url}, error: ${e.message}`);
        return url; // Return original if encoding fails
      }
    }

    function waitForPageLoad() {
      // Wait for React to render and content to load
      cy.wait(2000); // Give time for dynamic content
      cy.get('body').should('be.visible');
      // Wait for any loading spinners to disappear
      cy.get('body').then($body => {
        if ($body.find('[data-testid="loading"], .loading, .spinner').length > 0) {
          cy.get('[data-testid="loading"], .loading, .spinner', { timeout: 10000 }).should('not.exist');
        }
      });
    }

    function collectLinksFromPage() {
      return cy.get('body').then($body => {
        // Check if there are any links at all
        const $links = $body.find('a[href]');
        const newLinks = [];
        
        $links.each((_, a) => {
          const href = a.getAttribute('href');
          if (isInternal(href) && !allLinks.has(href)) {
            allLinks.add(href); // Add to global set immediately
            newLinks.push(href);
          }
        });
        
        // Log the results
        if (newLinks.length > 0) {
          newLinks.forEach(link => cy.log(`🆕 New link discovered: ${link}`));
          // Update all-links.json whenever new links are discovered
          cy.writeFile('cypress/results/all-links.json', Array.from(allLinks));
        }
        cy.log(`📊 Current total links: ${allLinks.size}`);
        
        return cy.wrap(newLinks);
      });
    }

    function hasValidContent($body) {
      // Get the full text content
      const fullText = $body.text().trim();
      
      // Basic check - must have some text
      if (fullText.length === 0) {
        return false;
      }
      
      // Look for main content areas (excluding navigation/header/footer)
      const contentSelectors = [
        'main',
        '[role="main"]',
        '.content',
        '.main-content',
        '.page-content',
        'article',
        '.text-content',
        '.book-content',
        '.chapter-content'
      ];
      
      let mainContent = '';
      for (const selector of contentSelectors) {
        const $element = $body.find(selector);
        if ($element.length > 0) {
          mainContent = $element.text().trim();
          break;
        }
      }
      
      // If no specific content area found, use body but exclude common navigation elements
      if (!mainContent) {
        const $bodyClone = $body.clone();
        // Remove navigation, header, footer elements
        $bodyClone.find('nav, header, footer, .nav, .navbar, .header, .footer, .menu').remove();
        mainContent = $bodyClone.text().trim();
      }
      
      // Check if we have meaningful content (more than just navigation/UI text)
      if (mainContent.length < 10) {
        return false;
      }
      
      // Check for Hebrew characters (Unicode range for Hebrew)
      const hasHebrew = /[\u0590-\u05FF]/.test(mainContent);
      
      // Check for English letters
      const hasEnglish = /[a-zA-Z]/.test(mainContent);
      
      // Check for numbers (useful for verse numbers, etc.)
      const hasNumbers = /[0-9]/.test(mainContent);
      
      // Must have either Hebrew or English text (or both)
      const hasLanguageContent = hasHebrew || hasEnglish;
      
      return hasLanguageContent && mainContent.length >= 10;
    }

    function visitAndCollectLinks(url) {
      if (visited.has(url)) {
        cy.log(`⏭️ Skipping already visited: ${url}`);
        return cy.wrap([]);
      }
      
      visited.add(url);
      visitCount++;
      cy.log(`🔍 [${visitCount}] Visiting: ${url}`);
      
      // Encode the URL for Hebrew characters
      const encodedUrl = encodeUrl(url);
      if (encodedUrl !== url) {
        cy.log(`🔤 Encoded URL: ${encodedUrl}`);
      }
      
      cy.visit(encodedUrl, { failOnStatusCode: false, timeout: 30000 });
      cy.log(`⏳ Page loaded, checking content...`);
      
      // Wait for page to load properly
      waitForPageLoad();
      
      cy.get('body').then($body => {
        const hasContent = hasValidContent($body);
        if (!hasContent) {
          const bodyText = $body.text().trim();
          const preview = bodyText.length > 100 ? bodyText.substring(0, 100) + '...' : bodyText;
          failedLinks.push(url);
          cy.log(`❌ Failed (no meaningful content): ${url}`);
          cy.log(`   Preview: "${preview}"`);
          // Update failed-links.json immediately when a failure is detected
          cy.writeFile('cypress/results/failed-links.json', failedLinks);
        } else {
          cy.log(`✅ Success: ${url}`);
        }
      });
      
      return collectLinksFromPage().then(newLinks => {
        cy.log(`🔗 Found ${newLinks.length} new links on ${url}`);
        cy.log(`📊 Progress: ${visitCount} visited, ${allLinks.size} total discovered, ${failedLinks.length} failed`);
        return cy.wrap(newLinks);
      });
    }

    function crawlAllLinks() {
      const toVisit = Array.from(allLinks).filter(link => !visited.has(link));
      if (toVisit.length === 0) {
        cy.log('🏁 All links visited!');
        return cy.wrap([]);
      }
      
      cy.log(`📋 Processing ${toVisit.length} unvisited links`);
      
      return cy.wrap(toVisit).each(url => {
        return visitAndCollectLinks(url);
      }).then(() => {
        // After visiting all current links, check if new ones were discovered
        const newToVisit = Array.from(allLinks).filter(link => !visited.has(link));
        if (newToVisit.length > 0) {
          cy.log(`🔄 Found ${newToVisit.length} new links, continuing crawl...`);
          return crawlAllLinks(); // Recursively crawl new links
        }
        cy.log('✅ No new links found, crawl complete');
        return cy.wrap([]);
      });
    }

    // Start crawling from home page
    cy.log('🏠 Starting from home page...');
    cy.visit('/', { failOnStatusCode: false, timeout: 30000 });
    waitForPageLoad();
    
    cy.get('body').then($body => {
      const hasContent = hasValidContent($body);
      if (!hasContent) {
        const bodyText = $body.text().trim();
        const preview = bodyText.length > 100 ? bodyText.substring(0, 100) + '...' : bodyText;
        failedLinks.push('/');
        cy.log('❌ Home page has no meaningful content!');
        cy.log(`   Preview: "${preview}"`);
      } else {
        cy.log('✅ Home page loaded successfully');
      }
    });
    
    collectLinksFromPage().then(initialLinks => {
      cy.log(`🎯 Found ${initialLinks.length} initial links from home page`);
      cy.log(`📋 Initial links: ${initialLinks.join(', ')}`);
      
      crawlAllLinks().then(() => {
        // Write results
        cy.log(`🎉 Crawl complete!`);
        cy.log(`📊 Final Results:`);
        cy.log(`   • Total links discovered: ${allLinks.size}`);
        cy.log(`   • Links visited: ${visitCount}`);
        cy.log(`   • Failed links: ${failedLinks.length}`);
        
        cy.writeFile('cypress/results/all-links.json', Array.from(allLinks));
        cy.writeFile('cypress/results/failed-links.json', failedLinks);
        
        cy.log('💾 Results saved to cypress/results/');
        cy.log('   • all-links.json - All discovered links');
        cy.log('   • failed-links.json - Links that failed to load or had no content');
      });
    });
  });
}); 