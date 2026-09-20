const { scrapeProduct } = require('./index');

async function assertScrape(productId) {
  console.log(`Testing Scraper Engine against Product ${productId}...`);
  const result = await scrapeProduct(productId, { maxRetries: 6 });
  console.log(`Product ${productId} Scrape Result:`, JSON.stringify(result, null, 2));

  if (!result.success || result.price === null) {
    throw new Error(`Product ${productId} scrape failed: ${result.error || 'price missing'}`);
  }

  return result;
}

async function testScraper() {
  await assertScrape(1);
  console.log('');
  await assertScrape(52);
  console.log('\nScraper engine test suite passed!');
}

if (require.main === module) {
  testScraper().catch(err => {
    console.error('Scraper test failed:', err);
    process.exit(1);
  });
}
