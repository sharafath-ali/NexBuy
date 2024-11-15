import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { redis } from '../lib/redis.js'
import e from 'express';

const generateToken = (id) => {
  const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

const storeRefreshToken = async (id, token) => {
  await redis.set(`refreshToken:${id}`, token, 'EX', 7 * 24 * 60 * 60);
}
const setCookie = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  console.log('name: ', name)
  console.log('email: ', email)
  console.log('password: ', password)
  try {
    const userexists = await User.findOne({ email });
    if (userexists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookie(res, accessToken, refreshToken);
    res.status(201).json({ user, message: 'sign up completed' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookie(res, accessToken, refreshToken);
    res.status(200).json({ user, message: 'login successful' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refreshToken:${decoded.id}`);
      res.cookie('accessToken', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0
      })
      res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0
      })
      res.status(200).json({ message: 'logout successful' })
    }
    else {
      res.status(400).json({ message: 'refresh token not found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: 'refresh token not found' })
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedRefreshToken = await redis.get(`refreshToken:${decoded.id}`);
    if (storedRefreshToken !== refreshToken) {
      return res.status(400).json({ message: 'refresh token not valid' })
    }
    else {
      const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      })
      res.status(200).json({ message: 'access token refreshed' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "something went wrong while refreshing token", error: error.message })
  }
}