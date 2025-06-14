import { FastifyRequest, FastifyReply } from 'fastify'
import { UploadService } from '../services/upload.service'

const uploadService = new UploadService()

export class UploadController {
  async uploadSingle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file()

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'Nenhum arquivo enviado'
        })
      }

      uploadService.validateImageFile(data)

      const buffer = await data.file.toBuffer()
      const imageUrl = await uploadService.uploadFile(buffer, data.filename)

      return reply.send({
        success: true,
        message: 'Imagem enviada com sucesso',
        data: {
          url: imageUrl,
          filename: data.filename,
          size: buffer.length
        }
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  async uploadMultiple(request: FastifyRequest, reply: FastifyReply) {
    try {
      const files = request.files()
      const uploadPromises = []
      const fileInfo = []

      for await (const file of files) {
        uploadService.validateImageFile(file)
        
        const buffer = await file.file.toBuffer()
        uploadPromises.push(uploadService.uploadFile(buffer, file.filename))
        fileInfo.push({
          filename: file.filename,
          size: buffer.length
        })
      }

      if (uploadPromises.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Nenhum arquivo enviado'
        })
      }

      const imageUrls = await Promise.all(uploadPromises)

      return reply.send({
        success: true,
        message: `${imageUrls.length} imagens enviadas com sucesso`,
        data: {
          urls: imageUrls,
          files: fileInfo
        }
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  async deleteImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { url } = request.body as { url: string }

      if (!url) {
        return reply.status(400).send({
          success: false,
          error: 'URL da imagem é obrigatória'
        })
      }

      await uploadService.deleteFile(url)

      return reply.send({
        success: true,
        message: 'Imagem deletada com sucesso'
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  async generatePresignedUrl(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { filename } = request.body as { filename: string }

      if (!filename) {
        return reply.status(400).send({
          success: false,
          error: 'Nome do arquivo é obrigatório'
        })
      }

      const presignedUrl = await uploadService.generatePresignedUrl(filename)

      return reply.send({
        success: true,
        data: {
          uploadUrl: presignedUrl,
          filename: filename
        }
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }
}