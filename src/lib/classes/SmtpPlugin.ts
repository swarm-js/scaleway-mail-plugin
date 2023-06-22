import { SmtpAttachment } from '../interfaces/SmtpAttachment'
import { SmtpPluginOptions } from '../interfaces/SmtpPluginOptions'
import nodemailer from 'nodemailer'
import { convert } from 'html-to-text'

export function SmtpPlugin (
  schema: any,
  options: Partial<SmtpPluginOptions>
): void {
  const conf: SmtpPluginOptions = {
    emailField: 'email',
    firstnameField: 'firstname',
    lastnameField: 'lastname',
    host: null,
    port: 465,
    secure: true,
    user: null,
    pass: null,
    fromEmail: null,
    fromName: null,
    ...options
  }

  if (conf.host === null) throw new Error('Host is not defined')
  if (conf.user === null) throw new Error('User is not defined')
  if (conf.pass === null) throw new Error('Password is not defined')
  if (conf.fromName === null) throw new Error('Sender name is not defined')
  if (conf.fromEmail === null) throw new Error('Sender email is not defined')

  const transporter = nodemailer.createTransport({
    pool: true,
    host: conf.host,
    port: conf.port,
    secure: conf.secure, // use TLS
    auth: {
      user: conf.user,
      pass: conf.pass
    }
  })

  schema.method(
    'sendEmail',
    async function sendEmail (
      subject: string,
      html: string,
      attachments: SmtpAttachment[] = []
    ) {
      let destinationName: string = `${this[conf.firstnameField] ?? ''} ${
        this[conf.lastnameField] ?? ''
      }`.trim()

      const data = {
        from: `"${conf.fromName}" ${conf.fromEmail}`,
        to: destinationName.length
          ? `"${destinationName}" ${this[conf.emailField]}`
          : this[conf.emailField],
        subject,
        text: convert(html),
        html,
        attachments: attachments.map((file: SmtpAttachment) => ({
          filename: file.filename,
          content: file.base64Content,
          encoding: 'base64',
          contentType: file.mimeType
        }))
      }

      const result = await transporter.sendMail(data)
      if (result.accepted.length) return true
      return false
    }
  )
}
