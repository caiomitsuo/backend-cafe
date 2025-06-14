import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

export class UploadService {
  private s3Client: S3Client
  private bucketName: string

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
    this.bucketName = process.env.AWS_S3_BUCKET!
  }

  async uploadFile(file: Buffer, originalName: string, folder: string = 'products'): Promise<string> {
    const fileExtension = path.extname(originalName)
    const fileName = `${folder}/${uuidv4()}${fileExtension}`

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file,
      ContentType: this.getContentType(fileExtension),
      ACL: 'public-read',
    })

    try {
      await this.s3Client.send(command)
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
    } catch (error) {
      console.error('Erro no upload S3:', error)
      throw new Error('Falha no upload da imagem')
    }
  }

  async uploadMultipleFiles(files: Buffer[], originalNames: string[], folder: string = 'products'): Promise<string[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadFile(file, originalNames[index], folder)
    )
    
    try {
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Erro no upload múltiplo:', error)
      throw new Error('Falha no upload das imagens')
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileName = this.extractFileNameFromUrl(fileUrl)
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      })

      await this.s3Client.send(command)
    } catch (error) {
      console.error('Erro ao deletar arquivo S3:', error)
      throw new Error('Falha ao deletar a imagem')
    }
  }

  async deleteMultipleFiles(fileUrls: string[]): Promise<void> {
    const deletePromises = fileUrls.map(url => this.deleteFile(url))
    
    try {
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Erro ao deletar múltiplos arquivos:', error)
      throw new Error('Falha ao deletar as imagens')
    }
  }

  async generatePresignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `products/${fileName}`,
      ACL: 'public-read',
    })

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn })
    } catch (error) {
      console.error('Erro ao gerar URL pré-assinada:', error)
      throw new Error('Falha ao gerar URL de upload')
    }
  }

  private getContentType(fileExtension: string): string {
    const contentTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    }

    return contentTypes[fileExtension.toLowerCase()] || 'application/octet-stream'
  }

  private extractFileNameFromUrl(url: string): string {
    const urlParts = url.split('/')
    const fileName = urlParts.slice(-2).join('/')
    return fileName
  }

  validateImageFile(file: any): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou WebP')
    }

    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo 5MB')
    }

    return true
  }
}