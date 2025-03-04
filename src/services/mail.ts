import { Transporter } from 'nodemailer'
import { MailModel } from '../global/types.js'

export class MailService {
  constructor(private connection: Transporter) {
    this.connection = connection
  }

  sendMail = async (emailInformation: MailModel) => {
    const info = await this.connection.sendMail({
      from: emailInformation.from,
      to: emailInformation.to,
      subject: emailInformation.subject,
      html: emailInformation.html
    })

    return info
  }
}
