export const taskDueReminderTemplate = ({
  name,
  taskTitle,
  dueDate,
  organizationName,
}: {
  name: string;
  taskTitle: string;
  dueDate: string;
  organizationName: string;
}) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task Due Reminder</title>
    <style>
      body {
        font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
        background-color: #f9fafb;
        color: #333;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #fff;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }

      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 2px solid #eee;
      }

      .header h2 {
        color: #2c3e50;
      }

      .content {
        margin-top: 20px;
        font-size: 16px;
        line-height: 1.6;
      }

      .task-box {
        background-color: #f3f4f6;
        border-left: 4px solid #3b82f6;
        padding: 15px;
        border-radius: 6px;
        margin: 20px 0;
      }

      .cta {
        text-align: center;
        margin-top: 30px;
      }

      .cta a {
        background-color: #3b82f6;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        transition: background 0.3s ease;
      }

      .cta a:hover {
        background-color: #2563eb;
      }

      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 13px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>${organizationName} — Task Reminder</h2>
      </div>

      <div class="content">
        <p>Hi ${name},</p>
        <p>
          This is a friendly reminder that the following task is approaching its due time:
        </p>

        <div class="task-box">
          <strong>Task:</strong> ${taskTitle}<br/>
          <strong>Due:</strong> ${dueDate}
        </div>

        <p>
          Please ensure you complete this task before the deadline to avoid any delays.
        </p>
        <p>Thank you for staying on top of your work!</p>

        <p>— The ${organizationName} Team</p>
      </div>

      <div class="footer">
        <p>This reminder was sent automatically. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
</html>
`;
