import bcrypt from 'bcryptjs'
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { LoginInput, RegisterInput } from '../schemas/auth.schema'

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('Email já está em uso')
    }
    const hashedPassword = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    return user
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user || !user.active) {
      throw new Error('Credenciais inválidas')
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas')
    }
    const token = this.generateToken(user.id, user.email, user.role)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token
    }
  }


private generateToken(userId: string, email: string, role: string): string {
  const payload = { userId, email, role }
  const secret = process.env.JWT_SECRET!
  
  const options: SignOptions = { 
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
  }
  
  return jwt.sign(payload, secret, options) as string
}

 async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
        userId: string
        email: string
        role: string
      }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
        }
      })

      if (!user || !user.active) {
        throw new Error('Usuário não encontrado')
      }

      return user
    } catch (error) {
      throw new Error('Token inválido')
    }
  }
}