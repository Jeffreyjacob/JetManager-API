import { Plans } from '@prisma/client';

export const paymentReceiptEmail = ({
  customerName,
  planName,
  amountPaid,
  transactionId,
  billingDate,
  invoiceUrl,
}: {
  customerName: string;
  planName: Plans;
  amountPaid: number;
  transactionId: string | undefined;
  billingDate: string;
  invoiceUrl: string;
}) => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Payment Received - Thank You!</h2>
        
        <p>Hello ${customerName},</p>
        
        <p>We've successfully processed your payment for <strong>${planName}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Payment Details:</h3>
          <p><strong>Amount:</strong> $${amountPaid.toFixed(2)}</p>
          <p><strong>Date:</strong> ${billingDate}</p>
          <p><strong>Invoice:</strong> ${transactionId}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invoiceUrl}" 
             style="background: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            View Your Receipt
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          You can view and download your receipt anytime by clicking the link above.
          This receipt is generated and hosted securely by Stripe.
        </p>
        
        <p>Thank you for your business!</p>
      </div>
    `;
};
