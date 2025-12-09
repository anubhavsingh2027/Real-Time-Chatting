export const portfolioNewUser = async (req, res) => {
  try {
    // Get user IP address
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    if (!ip) {
      return res.status(400).json({
        success: false,
        message: "User IP not found",
      });
    }

    // Inline HTML email template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color:#333;">🔔 New User Visited Your Portfolio</h2>

        <p>A new visitor just opened your portfolio website.</p>

        <h3>Visitor Details:</h3>
        <p><b>IP Address:</b> ${ip}</p>

        <br />

        <p style="font-size: 14px; color: #555;">
          This is an automated alert from your portfolio tracking system.
        </p>

        <hr style="margin-top: 20px;" />

        <p style="font-size: 12px; color: #888;">
          © ${new Date().getFullYear()} Portfolio Alert System.
        </p>
      </div>
    `;

    // Email payload
    const payload = {
      to: "anubhavsinghcustomer@gmail.com",
      subject: "New User Visit - Portfolio",
      websiteName: "Portfolio",
      message: emailHtml,
    };

    // Send mail request
    const mailResponse = await fetch("https://mail-api-iuw1zw.fly.dev/sendMail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await mailResponse.json();

    if (!mailResponse.ok) {
      return res.status(500).json({
        success: false,
        message: "Mail sending failed",
        error: result,
      });
    }

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "New user detected & email sent successfully",
      ip,
    });

  } catch (error) {
    console.error("Error in portfolioNewUser:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
