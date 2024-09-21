import { createTransport } from 'nodemailer'

export const mailConnection = () => {
  return createTransport({
    service: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  })
}
