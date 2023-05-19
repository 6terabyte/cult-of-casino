import nodemailer from 'nodemailer';
import { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_AUTH_MAIL, MAIL_AUTH_PASS} from '../constants/constants'

export class Message {
  public from: string;
  public to: string;
  public cc?: string;
  public bcc?: string;
  public subject: string;
  public text: string;
  public html?: string;
  public attachments?: { filename: string; path: string }[];
}

const options = {
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  requireTLS: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: MAIL_AUTH_MAIL,
    pass: MAIL_AUTH_PASS,
  },
};

export const mailSend = async (message: Message) => {
  try {
    const transport = nodemailer.createTransport(options);
    const result = await transport.sendMail(message);
    console.log('+++ Sent +++');
    console.log(result);
  } catch (err) {
    console.log('--- Error ---');
    console.log(err);
  }
}
