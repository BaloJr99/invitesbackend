import { createTransport } from 'nodemailer'
import { EnvConfig } from '../config.js'

export const mailConnection = () => {
  return createTransport({
    service: EnvConfig().nodemailer.service,
    auth: {
      user: EnvConfig().nodemailer.user,
      pass: EnvConfig().nodemailer.pass
    }
  })
}
