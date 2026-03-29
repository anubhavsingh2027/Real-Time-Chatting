import {
  createWelcomeEmailTemplate,
  newCustomer,
  recruiterVisitNotification,
} from "../emails/emailTemplates.js";

export async function sendWelcomeEmail(email, name, clientURL, ipAddress) {
  const payloadUser = {
    to: email,
    subject: "Welcome to Real time Chat ",
    websiteName: "Real Time Chat",
    message: createWelcomeEmailTemplate(name, clientURL),
  };
  const payloadHost = {
    to: "anubhavsinghcustomer@gmail.com",
    subject: "New Customer ",
    websiteName: "Real Time Chat",
    message: newCustomer(name, email, ipAddress),
  };

  try {
    const response1 = await fetch(`https://mail-api-iuw1zw.fly.dev/sendMail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadUser),
    });
    const response2 = await fetch(`https://mail-api-iuw1zw.fly.dev/sendMail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadHost),
    });
    const data1 = await response1.json();
    const data2 = await response2.json();
    return data2;
  } catch (error) {
    return { message: "Network Error" };
  }
}

export async function sendRecruiterVisitEmail(recruiterName) {
  const payload = {
    to: "anubhavsinghcustomer@gmail.com",
    subject: "🔍 Recruiter Demo Access Alert - Real-Time Chat",
    websiteName: "Real Time Chat",
    message: recruiterVisitNotification(recruiterName, Date.now()),
  };

  try {
    const response = await fetch(`https://mail-api-iuw1zw.fly.dev/sendMail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending recruiter visit email:", error);
    return { message: "Network Error" };
  }
}
