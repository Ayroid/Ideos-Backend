import schedule from "node-schedule";
import nodemailer from "nodemailer";
import { todosModel } from "../models/todosModel";
import { usersModel } from "../models/usersModel";
import logger from "../../src/logger";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: "process.env.EMAIL_USER",
    pass: "process.env.EMAIL_PASS",
  },
});

// Function to send a reminder email
async function sendReminderEmail(firstName: string, userEmail: string) {
  const mailOptions = {
    from: "process.env.EMAIL_USER",
    to: userEmail,
    subject: "Todo Reminder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #111827; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h1 style="text-align: left; font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 10px;">Ideos Alert!</h1>
        <h2 style="font-size: 20px; color: #374151; margin-bottom: 20px;">Todo Reminder</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #111827;">
          Hi ${firstName || "there"},
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          This is a reminder that your todo is due tomorrow. Please make sure to complete it on time.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #111827;">
          Thanks for choosing Ideos!
        </p>
        <p style="font-size: 16px; color: #111827; font-weight: bold;">
          Regards,<br />
          Team Ideos
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://ideos.live/" style="padding: 10px 20px; background-color: #111827; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px; border: 1px solid #111827;">View Todo</a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Reminder sent to: ${userEmail}`);
  } catch (error) {
    logger.error("Error sending reminder email:", error);
  }
}

async function checkTodos() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const todos = await todosModel.find({
      dueDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow,
      },
    });

    const userIds = todos.map((todo) => todo.userId);

    const users = await usersModel.find({ _id: { $in: userIds } });

    const userEmailMap = new Map(
      users.map((user) => [
        (user._id as string).toString(),
        { email: user.email, firstName: user.firstName || "there" },
      ])
    );

    for (const todo of todos) {
      const userData = userEmailMap.get(todo.userId.toString());
      if (userData) {
        const { email: userEmail, firstName } = userData;
        await sendReminderEmail(firstName, userEmail);
      }
    }
  } catch (error) {
    logger.error("Error fetching todos or users:", error);
  }
}

export function initializeReminderService() {
  schedule.scheduleJob("0 0 * * *", () => {
    logger.info("Running reminder job...");
    checkTodos();
  });

  logger.info("Reminder service initialized");
}
