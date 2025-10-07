import { MembershipRole } from '../../generated/prisma';

export const OrganizationInviteEmail = ({
  inviteUrl,
  inviterName,
  organizationName,
  role,
}: {
  inviterName: string;
  organizationName: string;
  role: MembershipRole;
  inviteUrl: string;
}) => {
  return `
     
     <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>You’ve Been Invited</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f7f9fc;
        font-family: "Inter", Arial, sans-serif;
      }
      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .header {
        background-color: #1a73e8;
        padding: 24px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
      }
      .content {
        padding: 32px 24px;
        color: #333333;
      }
      .content h2 {
        font-size: 20px;
        margin-bottom: 16px;
        color: #222222;
      }
      .content p {
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .cta-button {
        display: inline-block;
        background-color: #1a73e8;
        color: #ffffff !important;
        padding: 12px 20px;
        text-decoration: none;
        font-weight: 600;
        border-radius: 8px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 13px;
        color: #999999;
      }
      .footer a {
        color: #1a73e8;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>You're Invited to Join ${organizationName}</h1>
      </div>

      <div class="content">
        <h2>Hello,</h2>
        <p>
          <strong>${inviterName}</strong> has invited you to join
          <strong>${organizationName}</strong> as a
          <strong>${role}</strong>.
        </p>

        <p>
          To accept this invitation and get started, please click the button
          below. If you don’t have an account yet, you’ll be prompted to create
          one first.
        </p>

        <p style="text-align: center; margin: 32px 0">
          <a href="${inviteUrl}" class="cta-button">Accept Invitation</a>
        </p>
        
         <p>
          if you were not able to click on the button above, here is link. \n
          ${inviteUrl}
        </p>


        <p>
          If you didn’t expect this invitation, you can safely ignore this
          message.
        </p>
      </div>

      <div class="footer">
        <p>
          © ${new Date().getFullYear()} JetManager. All rights reserved.
          <br />
          <a href="{{supportUrl}}">Contact Support</a> |
          <a href="{{privacyUrl}}">Privacy Policy</a>
        </p>
      </div>
    </div>
  </body>
</html>

     `;
};
