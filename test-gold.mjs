import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
async function test() {
  try {
    const res = await yahooFinance.search('gold india');
    console.log("Gold:", res.quotes.slice(0,2));
    const res2 = await yahooFinance.search('silver india');
    console.log("Silver:", res2.quotes.slice(0,2));
  } catch(e) { console.error(e) }
}
test();
