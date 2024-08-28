import schedule from "node-schedule";
import nodemailer from "nodemailer";
import { todosModel } from "../models/todosModel";
import { usersModel } from "../models/usersModel";
import logger from "../../src/logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: "anket1260@gmail.com",
    pass: "dazgqovribhljeyx",
  },
});

async function sendReminderEmail(userEmail: string) {
  const mailOptions = {
    from: "anket1260@gmail.com",
    to: userEmail,
    subject: "Todo Reminder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #000; background-color: #ffffff; color: #000;">
        <h1 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">Todo Reminder</h1>
        <p style="font-size: 16px; line-height: 1.5;">
          Hello,
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          This is a reminder that your todo is due tomorrow. Please make sure to complete it on time.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          Best regards,<br />
          Your Task Manager
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://ideos.live/" style="padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; font-weight: bold;">View Todo</a>
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
      users.map((user) => [(user._id as string).toString(), user.email])
    );

    for (const todo of todos) {
      const userEmail = userEmailMap.get(todo.userId.toString());
      if (userEmail) {
        await sendReminderEmail(userEmail);
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
