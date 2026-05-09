import { UAParser } from "ua-parser-js";

/**
 * Parse User-Agent using ua-parser-js (industry-standard library)
 * Handles 1000+ browser/OS/device combinations reliably
 * @param {string} userAgent - Raw User-Agent header
 * @returns {{browser: string, os: string, deviceType: string}}
 */
const parseUserAgent = (userAgent) => {
  if (!userAgent) {
    return { browser: "Unknown", os: "Unknown", deviceType: "Unknown" };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    deviceType: result.device.type || "Desktop", // Returns: "console", "mobile", "tablet", "smarttv", "wearable", or undefined (defaults to "Desktop")
  };
};

export const portfolioNewUser = async (req, res) => {
  const websiteName = req.params.websiteName;
  try {
    // Extract client IP (supports proxies)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      null;

    if (!ip) {
      return res.status(400).json({
        success: false,
        message: "User IP not found",
      });
    }

    // Parse User-Agent to get browser, OS, and device type
    // req.headers["user-agent"] is automatically provided by Express
    // It's set by the browser/client making the request
    const userAgent = req.headers["user-agent"];
    
    if (!userAgent) {
      console.warn(
        "[Portfolio Alert] Warning: user-agent header missing or empty. Request headers:",
        Object.keys(req.headers)
      );
    }

    const { browser, os, deviceType } = parseUserAgent(userAgent);

    // Fetch IP details
    const ipDetailResponse = await fetch(`https://ipinfo.io/${ip}/json`);
    if (!ipDetailResponse.ok) {
      throw new Error("Failed to fetch IP details");
    }

    const ipDet = await ipDetailResponse.json();

    // Build HTML Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color:#333;">🔔 New Visitor Alert</h2>

      <p>A new user has viewed your ${websiteName}.</p>

      <h3>Visitor Details:</h3>
      <p><b>IP Address:</b> ${ip}</p>
      <p><b>Browser:</b> ${browser}</p>
      <p><b>Operating System:</b> ${os}</p>
      <p><b>Device Type:</b> ${deviceType}</p>
      <p><b>City:</b> ${ipDet.city || "N/A"}</p>
      <p><b>Region:</b> ${ipDet.region || "N/A"}</p>
      <p><b>Country:</b> ${ipDet.country || "N/A"}</p>
      <p><b>Network:</b> ${ipDet.org || "N/A"}</p>
      <p><b>Pincode:</b> ${ipDet.postal || "N/A"}</p>
      <p><b>Timezone:</b> ${ipDet.timezone || "N/A"}</p>
      <p><b>Visit Time (IST):</b> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>

      <br>

      <p style="font-size: 14px; color: #555;">
        This is an automated alert from your ${websiteName} tracking system.
      </p>

      <hr style="margin-top: 20px;">

      <p style="font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} Portfolio Alert System.
      </p>
      </div>
    `;

    // Mail payload
    const payload = {
      to: "anubhavsinghcustomer@gmail.com",
      subject: `New ${websiteName} Visitor Alert`,
      websiteName: `${websiteName}`,
      message: emailHtml,
    };

    // Send Email
    const mailResponse = await fetch(
      "https://mail-api-iuw1zw.fly.dev/sendMail",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const mailResult = await mailResponse.json();

    if (!mailResponse.ok) {
      return res.status(500).json({
        success: false,
        message: "Mail sending failed",
        error: mailResult,
      });
    }

    if (websiteName === "github") {
      return res.redirect("https://github.com/anubhavsingh2027");
    }
    // SUCCESS
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    if (websiteName === "github") {
      return res.redirect("https://github.com/anubhavsingh2027");
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
