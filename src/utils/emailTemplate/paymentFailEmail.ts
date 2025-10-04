export const paymentFailEmail = ({
  customerName,
  planName,
  billingDate,
  maxAttempts,
  attempts,
  year,
}: {
  customerName: string;
  planName: string;
  billingDate: string;
  maxAttempts: number;
  attempts: number;
  year: number;
}) => {
  return `
  
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Payment Attempt Unsuccessful</title>
  <style>
    /* Mobile responsiveness */
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .button { width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial,sans-serif; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; margin:20px 0; border-radius:6px; overflow:hidden;">
          <tr>
            <td style="background:#1abc9c; padding:20px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px;">Payment Attempt {{attempt}} Unsuccessful</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <p style="font-size:16px; margin:0 0 20px;">
                Hi , ${customerName}
              </p>
              <p style="font-size:16px; margin:0 0 20px;">
                We tried to charge your card for your <strong>${planName}</strong> subscription on <strong>${billingDate}</strong>
                (Attempt <strong>${attempts}</strong> of <strong>${maxAttempts}</strong>), but the payment didn't go through.
                Don't worry—we'll automatically retry in a few days!
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
                
          <tr>
            <td style="background:#f4f4f4; padding:15px; text-align:center; font-size:12px; color:#999;">
              © ${year} JetManger. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

  `;
};
