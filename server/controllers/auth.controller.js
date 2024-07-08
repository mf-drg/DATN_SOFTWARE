import { authService } from '../services/index.js'
const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body)
    res.status(200).send({ code: 200, success: true, data })
  } catch (err) {
    next(err)
  }
}

const signup = async (req, res, next) => {
  try {
    const data = await authService.signup(req.body)
    res.status(200).send({ code: 200, success: true, data, message: 'Signup successful! Please try to login.' })
  } catch (err) {
    next(err)
  }
}

export { login, signup }
