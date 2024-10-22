import puppeteer from "puppeteer";

// Launch the browser
const browser = await puppeteer.launch({
  headless: true, // Set to false if you want to see the browser during testing
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--proxy-server=socks5://127.0.0.1:9050"
  ], // Using a proxy (optional)
});

// Function to vote multiple times
async function runVotes() {
  try {
    console.log('Page loaded.');

    for (let i = 0; i < 1000; i++) {
      const page = await browser.newPage(); // Open a new page for each vote
      try {
        console.log(`Opening poll page...`);
        await page.goto(`https://poll.fm/14535088/`); // Replace with your poll URL

        console.log(`Voting attempt ${i + 1}...`);

        // Click on the answer choice
        await page.evaluate(() => {
          document.querySelector("#PDI_answer64615672").click(); // Answer choice ID
          console.log('Answer choice selected.');
        });

        // Click on the vote button and wait for navigation
        await Promise.all([
          page.evaluate(() => {
            document.querySelector(".pds-vote-button").click();
            console.log('Vote button clicked.');
          }),
          page.waitForNavigation({ waitUntil: 'networkidle0' }) // Wait until the navigation is complete
        ]);

        // Check the current URL after navigation
        const currentUrl = page.url();
        if (currentUrl.includes("results?msg=voted")) {
          console.log(`Vote successfully counted (Attempt ${i + 1}).`);
          await sleep(3); // Optional: wait before retrying
        } else if (currentUrl.includes("results?msg=revoted")) {
          console.log(`Vote not counted: Already voted (Attempt ${i + 1}). Reloading page... ${currentUrl}`);
          await page.close(); // Close the page after each vote attempt // Reload the page and retry
          i--; // Decrement the attempt counter to retry this vote
          await sleep(30); // Optional: wait before retrying
          return;
        } else {
          console.log(`Vote not counted. Current URL: ${currentUrl}`);
        }

      } catch (error) {
        console.error(`Error during voting attempt ${i + 1}:`, error);
      } finally {
        await page.close(); // Close the page after each vote attempt
      }
    }

    
  await page.close(); // Close the page after each vote attempt

  } catch (error) {
    console.error('Error loading poll page:', error);
  }
}

// Function to simulate sleep
function sleep(seconds) {
  console.log(`Sleeping for ${seconds} seconds...`);
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// Run the voting process in a loop
(async () => {
  while (true) {
    console.log("Starting a new voting batch...");
    await runVotes();
    const randomSleep = Math.floor(Math.random() * 20 + 10); // Random sleep between 10 and 30 seconds
    await sleep(randomSleep);
  }
})();
