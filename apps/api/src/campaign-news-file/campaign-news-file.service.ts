import { Readable } from 'stream'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CampaignFile, CampaignFileRole, Person } from '@prisma/client'

import { S3Service } from '../s3/s3.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCampaignNewsFileDto } from './dto/create-campaign-news-file.dto'
import { KeycloakTokenParsed, isAdmin } from '../auth/keycloak'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class CampaignNewsFileService {
  constructor(private prisma: PrismaService, private s3: S3Service, private readonly configService:ConfigService) { }
  
  private readonly S3_BUCKET_NAME =  'campaign-news-files'
  private readonly bucketName: string = this.configService.get('CAMPAIGN_NEWS_FILES_BUCKET', this.S3_BUCKET_NAME)

  async create(
    role: CampaignFileRole,
    newsId: string,
    mimetype: string,
    filename: string,
    person: Person,
    buffer: Buffer,
  ): Promise<string> {
    const file: CreateCampaignNewsFileDto = {
      filename,
      mimetype,
      role,
      newsId,
      personId: person.id,
    }
    const dbFile = await this.prisma.campaignNewsFile.create({ data: file })
    // Use the DB primary key as the S3 key. This will make sure it is always unique.
    await this.s3.uploadObject(
      this.bucketName,
      dbFile.id,
      encodeURIComponent(filename),
      mimetype,
      buffer,
      'NewsArticle',
      newsId,
      person.id,
    )

    return dbFile.id
  }

  async findOne(id: string): Promise<{
    filename: CampaignFile['filename']
    mimetype: CampaignFile['mimetype']
    stream: Readable
  }> {
    const file = await this.prisma.campaignNewsFile.findFirst({ where: { id: id } })
    if (!file) {
      Logger.warn('No campaign file record with ID: ' + id)
      throw new NotFoundException('No campaign file record with ID: ' + id)
    }
    return {
      filename: encodeURIComponent(file.filename),
      mimetype: file.mimetype,
      stream: await this.s3.streamFile(this.bucketName, id),
    }
  }

  async canDeleteNewsFile(id: string, user: KeycloakTokenParsed): Promise<boolean> {
    const isFileOwner = await this.prisma.campaignNewsFile.count({
      where: { id, person: { keycloakId: user.sub } },
    })
    return !!isFileOwner || isAdmin(user)
  }

  async remove(id: string) {
    await this.s3.deleteObject(this.bucketName, id)
    return await this.prisma.campaignNewsFile.delete({ where: { id } })
  }
}
