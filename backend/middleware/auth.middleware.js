import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken
    if (!accessToken) {
      return res.status(401).json({ message: 'unauthorized ' })
    }
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: 'user not found ' })
    }
    req.user = user
    next()
  }
  catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const adminRoute = async (req, res, next) => {
  try {
    if (req?.user?.role !== 'admin') {
      return res.status(403).json({ message: 'access denied only for admin ' })
    }
    next()
  }
  catch (error) {
    res.status(500).json({ message: error.message })
  }
}