export const trialStartEmail = ({
  customerName,
  planName,
  trialDays,
  trialEndDate,
}: {
  customerName: string;
  planName: string;
  trialDays: number;
  trialEndDate: string;
}) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4CAF50;">Welcome to Our Platform 🎉</h2>
    <p>Hi ${customerName},</p>

    <p>Thanks for signing up! Your <strong>${planName}</strong> subscription trial has officially started.</p>

    <p>Here are the details of your trial:</p>
    <ul style="padding-left: 20px;">
      <li><strong>Trial Length:</strong> ${trialDays} days</li>
      <li><strong>Trial End Date:</strong> ${trialEndDate}</li>
      <li><strong>Next Charge:</strong> You will <strong>not</strong> be charged until your trial ends.</li>
    </ul>

    <p>
      If you decide our platform isn’t for you, you can cancel anytime before
      <strong>${trialEndDate}</strong> and you won’t be charged.
    </p>

    <p>Otherwise, your subscription will continue automatically, and your saved payment method will be billed at the end of your trial.</p>

    <p style="margin-top: 20px;">We’re excited to have you onboard! 🚀</p>

    <p style="margin-top: 30px; font-size: 14px; color: #777;">
      If you have any questions, feel free to contact our support team.
    </p>

    <hr style="margin: 30px 0;" />
    <p style="font-size: 12px; color: #999;">
      You’re receiving this email because you signed up for a ${planName} subscription.
      If you didn’t create an account, please ignore this email.
    </p>
  </div>
`;
