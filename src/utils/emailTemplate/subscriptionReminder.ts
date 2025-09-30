export const SubscriptionReminderEmail = ({
  userName,
  planName,
  subscriptionId,
  endDate,
  days,
}: {
  userName: string;
  planName: string;
  subscriptionId: string;
  endDate: Date;
  days: number;
}) => {
  return `
    
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Subscription Reminder</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    .header {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .content {
      margin-bottom: 20px;
    }
    .footer {
      font-size: 14px;
      color: #555;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Hi ${userName},</div>
    <div class="content">
      We hope you’re enjoying your current <strong>${planName}</strong> subscription.<br><br>
      This is a friendly reminder that your subscription (ID: <strong>${subscriptionId}</strong>) 
      will expire in ${days} days on <strong>${endDate.toDateString()}</strong>.<br><br>
      To avoid any interruption, please make sure your payment details are up to date or renew your subscription before the expiry date.
    </div>
    <div class="footer">
      Thank you for being with us!<br>
      <strong>JetManager Team</strong>
    </div>
  </div>
</body>
</html>

    `;
};
