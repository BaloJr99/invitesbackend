import { validatePartialUser, validateUser } from '../schemas/user.js'

export class AuthController {
  constructor ({ userModel }) {
    this.userModel = userModel
  }

  signUp = async (req, res) => {
    const result = validateUser(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const token = await this.userModel.signup({ input: result.data })

    res.status(201).json({ token })
  }

  signIn = async (req, res) => {
    const result = validatePartialUser(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const token = await this.userModel.signin({ input: result.data })
    if (!token) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    res.status(200).json({ token })
  }
}
