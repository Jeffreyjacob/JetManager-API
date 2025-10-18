import { Plans } from '@prisma/client';

export const subscriptionCancelEmail = ({
  customerName,
  cancellationReason,
  cancelDate,
}: {
  customerName: string;
  planName: Plans;
  cancellationReason: string;
  cancelDate: string;
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Subscription Cancelled</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f6f9fc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    h2 {
      color: #333333;
    }
    p {
      font-size: 16px;
      color: #555;
      line-height: 1.5;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #0070f3;
      color: #ffffff;
      border-radius: 6px;
      text-decoration: none;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #888;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your Subscription Has Been Cancelled</h2>

    <p>Hi ,${customerName},</p>

    <p>We wanted to let you know that your subscription has been cancelled ${cancellationReason}.</p>

    <p>You'll retain access to your premium features until the end of your current billing cycle (${cancelDate}).</p>


    <p>If you have any questions or need support, feel free to reply to this email — we're here to help.</p>

    <p>Thanks for being part of our community.<br/>— The Mateam Team</p>

    <div class="footer">
      Mateam | Mateam@support.com
    </div>
  </div>
</body>
</html>
`;
};
