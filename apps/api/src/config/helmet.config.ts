import { INestApplication } from '@nestjs/common'
import helmet from 'helmet'

export function setupHelmet(app: INestApplication): void {
  const isLocalEnv = process.env.APP_ENV === 'development'
  app.use(helmet({ crossOriginResourcePolicy: isLocalEnv ? false : true }))
}
