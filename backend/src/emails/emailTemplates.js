export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Messenger</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(to right, #36D1DC, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="https://real-time-chatting.anubhav.sbs/icon.png" alt="Website Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 50%; background-color: white; padding: 10px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Welcome to Real time Chating!</h1>
    </div>
    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #5B86E5;"><strong>Hello ${name},</strong></p>
      <p>We're excited to have you join our messaging platform! Messenger connects you with friends, family, and colleagues in real-time, no matter where they are.</p>

      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #36D1DC;">
        <p style="font-size: 16px; margin: 0 0 15px 0;"><strong>Get started in just a few steps:</strong></p>
        <ul style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;">Set up your profile picture</li>
          <li style="margin-bottom: 10px;">Find and add your contacts</li>
          <li style="margin-bottom: 10px;">Start a conversation</li>
          <li style="margin-bottom: 0;">Share photos, videos, and more</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href=${clientURL} style="background: linear-gradient(to right, #36D1DC, #5B86E5); color: white; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 500; display: inline-block;">Open Messenger</a>
      </div>

      <p style="margin-bottom: 5px;">If you need any help or have questions, we're always here to assist you.</p>
      <p style="margin-top: 0;">Happy messaging!</p>

      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The Real time Chating Team</p>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Messenger. All rights reserved.</p>
      <p>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </p>
    </div>
  </body>
  </html>
  `;
}

export function newCustomer(userName, email, ipAdress) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Customer Registered</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

    <div style="background: linear-gradient(to right, #FF7E5F, #FD3A69); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="https://img.freepik.com/free-vector/business-people-handshake-flat-illustration_74855-12295.jpg?w=740&t=st=1741295028~exp=1741298628~hmac=4c3f9c2a67a5b8b593f587db3f788f8f04251ed5c127b2b0d7981b1f3731d2a5"
           alt="New Customer"
           style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 50%; background-color: white; padding: 10px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">New Customer Alert!</h1>
    </div>

    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #FD3A69;"><strong>Hello Team,</strong></p>
      <p>A new customer has just registered on your platform. Here are the details:</p>

      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #FF7E5F;">
        <p style="font-size: 16px; margin: 0 0 10px 0;"><strong>Customer Information:</strong></p>
        <ul style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;"><strong>Name:</strong> ${userName}</li>
          <li style="margin-bottom: 0;"><strong>Email:</strong> ${email}</li>
          <li style="margin-bottom: 0;"><strong>IpAdress:</strong> ${ipAdress}</li>
        </ul>
      </div>

      <p style="margin-bottom: 5px;">Please follow up with the customer as needed.</p>
      <p style="margin-top: 0;">Welcome them to your platform and ensure a smooth onboarding!</p>

      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>Your Platform Team</p>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Your Platform. All rights reserved.</p>
      <p>
        <a href="#" style="color: #FD3A69; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        <a href="#" style="color: #FD3A69; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        <a href="#" style="color: #FD3A69; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </p>
    </div>
  </body>
  </html>
  `;
}

export function recruiterVisitNotification(recruiterName, timestamp) {
  const visitDate = new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recruiter Visit Alert</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

    <div style="background: linear-gradient(to right, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">🔍 Recruiter Demo Access Alert</h1>
    </div>

    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #667eea;"><strong>Hello,</strong></p>
      <p>Great news! A recruiter has accessed your Real-Time Chat application in demo mode. Here are the visit details:</p>

      <div style="background: linear-gradient(135deg, #667eea15, #764ba215); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
        <p style="font-size: 14px; color: #555; margin: 0 0 15px 0;"><strong>📋 Recruiter Demo Information:</strong></p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: 600; color: #667eea;">Profile Name:</td>
            <td style="padding: 10px; color: #333;">${recruiterName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: 600; color: #667eea;">Visit Time:</td>
            <td style="padding: 10px; color: #333;">${visitDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: 600; color: #667eea;">Access Type:</td>
            <td style="padding: 10px; color: #333;">Guest Demo (Temporary)</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
        <p style="font-size: 14px; color: #667eea; margin: 0;"><strong>💡 Note:</strong></p>
        <p style="font-size: 13px; color: #555; margin: 5px 0 0 0;">This recruiter has access to the demo environment. They can explore all features for a limited time. Consider reaching out to discuss potential opportunities or features they might be interested in!</p>
      </div>

      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="font-size: 14px; color: #856404; margin: 0;"><strong>📌 Recommended Actions:</strong></p>
        <ul style="padding-left: 20px; margin: 5px 0 0 0; font-size: 13px; color: #856404;">
          <li style="margin-bottom: 8px;">Monitor their activity in the platform</li>
          <li style="margin-bottom: 8px;">Note any feedback they might provide</li>
          <li style="margin-bottom: 8px;">Consider reaching out via email for follow-up</li>
          <li style="margin-bottom: 0;">Track their engagement metrics</li>
        </ul>
      </div>

      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br><strong>Real-Time Chat - Recruiter Tracking System</strong></p>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Real-Time Chat Application. All rights reserved.</p>
      <p>
        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </p>
    </div>
  </body>
  </html>
  `;
}
