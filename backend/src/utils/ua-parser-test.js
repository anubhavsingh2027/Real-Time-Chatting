/**
 * Test script to verify ua-parser-js works correctly with various user agents
 * Run with: npm install ua-parser-js && node src/utils/ua-parser-test.js
 */

import { UAParser } from "ua-parser-js";

const parseUserAgent = (userAgent) => {
  if (!userAgent) {
    return { browser: "Unknown", os: "Unknown", deviceType: "Unknown" };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    deviceType: result.device.type || "Desktop",
  };
};

// Test cases with real browser user agents
const testCases = [
  {
    name: "Chrome on Windows",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  },
  {
    name: "Firefox on Windows",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  },
  {
    name: "Safari on macOS",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  },
  {
    name: "Edge on Windows",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
  },
  {
    name: "Chrome on Android",
    ua: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  },
  {
    name: "Safari on iOS",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  },
  {
    name: "Chrome on iPad",
    ua: "Mozilla/5.0 (iPad; CPU OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.0.0 Mobile/15E148 Safari/604.1",
  },
  {
    name: "Opera on Windows",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 OPR/111.0.0.0",
  },
  {
    name: "Chrome on Linux",
    ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  },
  {
    name: "Samsung Browser on Android",
    ua: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/125.0.0.0 Mobile Safari/537.36",
  },
  {
    name: "Empty/Missing User-Agent",
    ua: null,
  },
];

console.log("🧪 Testing ua-parser-js User-Agent Parsing\n");
console.log("═".repeat(80));

testCases.forEach((testCase) => {
  const result = parseUserAgent(testCase.ua);

  console.log(`\n📱 ${testCase.name}`);
  console.log(
    `   UA: ${testCase.ua ? testCase.ua.substring(0, 70) + "..." : "NULL"}`
  );
  console.log(`   ✓ Browser: ${result.browser}`);
  console.log(`   ✓ OS: ${result.os}`);
  console.log(`   ✓ Device: ${result.deviceType}`);
});

console.log("\n" + "═".repeat(80));
console.log(
  "✅ All tests completed. Compare results with expected values above.\n"
);
