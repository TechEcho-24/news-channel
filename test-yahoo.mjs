import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
async function test() {
  try {
    const quotes = await yahooFinance.quote(['^BSESN', '^NSEI']);
    console.log(JSON.stringify(quotes, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
