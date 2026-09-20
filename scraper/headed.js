const { scrapeProduct } = require('./index');

async function runHeadedDemo() {
  const productId = process.argv[2] || 1;
  console.log('====================================================');
  console.log('STARTING OBSERVABLE (HEADED) SCRAPER RUN');
  console.log(`Target Product ID: ${productId}`);
  console.log('Mode: Visible headed Chrome browser');
  console.log('====================================================\n');

  try {
    const result = await scrapeProduct(productId, {
      headed: true,
      slowMo: 600,
      maxRetries: 6
    });

    console.log('\n====================================================');
    console.log('HEADED RUN COMPLETED');
    console.log(`Outcome: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Price Extracted: ${result.price ? 'Rs. ' + result.price : 'N/A'}`);
    console.log(`Stock Extracted: ${result.stock !== null ? result.stock : 'N/A'}`);
    console.log(`Attempts Made: ${result.attempts}`);
    console.log(`Total Duration: ${result.durationMs}ms`);
    if (result.error) console.log(`Error Message: ${result.error}`);
    console.log('====================================================');
  } catch (err) {
    console.error('\nHeaded Run Failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runHeadedDemo();
}

module.exports = { runHeadedDemo };
