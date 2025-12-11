export const portfolioNewUser = async (req, res) => {
  const websiteName=req.params.websiteName
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
        <p><b>City:</b> ${ipDet.city || "N/A"}</p>
        <p><b>Region:</b> ${ipDet.region || "N/A"}</p>
        <p><b>Country:</b> ${ipDet.country || "N/A"}</p>
        <p><b>Network:</b> ${ipDet.org || "N/A"}</p>
        <p><b>Pincode:</b> ${ipDet.postal || "N/A"}</p>
        <p><b>Timezone:</b> ${ipDet.timezone || "N/A"}</p>

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
    const mailResponse = await fetch("https://mail-api-iuw1zw.fly.dev/sendMail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const mailResult = await mailResponse.json();

    if (!mailResponse.ok) {
      return res.status(500).json({
        success: false,
        message: "Mail sending failed",
        error: mailResult,
      });
    }

    if(websiteName==="github"){
       return res.redirect("https://github.com/anubhavsingh2027");
    }
    // SUCCESS
    return res.status(200).json({
      success: true,
      message: "New user detected & email sent successfully",
      ip,
      details: ipDet,
    });

  } catch (error) {
    console.error("Error in portfolioNewUser:", error);
 if(websiteName==="github"){
       return res.redirect("https://github.com/anubhavsingh2027");
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
