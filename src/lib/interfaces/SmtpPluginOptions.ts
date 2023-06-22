export interface SmtpPluginOptions {
  emailField: string
  firstnameField: string
  lastnameField: string
  host: string | null
  port: number
  secure: boolean
  user: string | null
  pass: string | null
  fromName: string | null
  fromEmail: string | null
}
