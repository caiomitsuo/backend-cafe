import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'
import { loginSchema, registerSchema } from '../schemas/auth.schema'

const authService = new AuthService()

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = registerSchema.parse(request.body)
      const user = await authService.register(data)
      
      return reply.status(201).send({
        message: 'Usuário criado com sucesso',
        user
      })
    } catch (error: any) {
      return reply.status(400).send({ error: error.message })
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = loginSchema.parse(request.body)
      const result = await authService.login(data)
      
      return reply.send(result)
    } catch (error: any) {
      return reply.status(400).send({ error: error.message })
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ user: request.user })
  }
}