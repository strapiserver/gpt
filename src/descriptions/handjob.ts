export async function handJob(link: string, page: any) {
  console.log(`Opening: ${link}`);

  try {
    await page.goto(link, { waitUntil: "domcontentloaded", timeout: 40000 });
  } catch (err) {
    console.log(`Timeout or error on page load, skipping: ${link}`);
    return;
  }

  let success = false;
  const startTime = Date.now();

  while (Date.now() - startTime < 60000) {
    // wait up to 60 seconds
    try {
      const content = await page.content();
      const textLength = content.length;

      console.log(`Current page text length: ${textLength}`);

      if (textLength > 40000) {
        // adjust threshold if needed
        console.log(`✅ Page loaded, extracting content for: ${link}`);
        console.log(`Extracted HTML length: ${content.length}`);
        success = true;
        break;
      }
    } catch (error) {
      console.log(`Error while checking page content, skipping: ${link}`);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000)); // check every 3 sec
  }

  if (!success) {
    console.log(`❌ Timeout waiting for full load: ${link}, moving to next.`);
  }
}

export async function handleCaptcha(page: any) {
  console.log("Handling CAPTCHA if present...");

  // Wait for the checkbox to load and simulate human-like behavior
  await page.waitForSelector("#checkbox-selector", { visible: true });

  const checkbox = await page.$("#checkbox-selector");
  const boxBoundingBox = await checkbox.boundingBox();
  await page.mouse.move(
    boxBoundingBox.x + boxBoundingBox.width / 2,
    boxBoundingBox.y + boxBoundingBox.height / 2
  );
  await page.mouse.click(
    boxBoundingBox.x + boxBoundingBox.width / 2,
    boxBoundingBox.y + boxBoundingBox.height / 2
  );

  // Add random delays to mimic human behavior
  await page.waitForTimeout(2000); // Wait for 2 seconds

  // Wait for navigation after CAPTCHA or checkbox interaction
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  console.log("CAPTCHA solved, page ready.");
}
