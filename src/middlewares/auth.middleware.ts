import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'

const authService = new AuthService()

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Token não fornecido' })
    }

    const token = authHeader.substring(7)

    const user = await authService.verifyToken(token)

    request.user = user

  } catch (error) {
    return reply.status(401).send({ error: 'Token inválido' })
  }
}
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      name: string
      email: string
      role: string
      active: boolean
    }
  }
}