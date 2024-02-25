import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Response,
  Delete,
  StreamableFile,
  forwardRef,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { BankTransactionsFileService } from './bank-transactions-file.service'
import 'multer'
import { FilesInterceptor } from '@nestjs/platform-express'
import { UseInterceptors, UploadedFiles } from '@nestjs/common'
import { AuthenticatedUser, Public, RoleMatchingMode, Roles } from 'nest-keycloak-connect'
import { RealmViewSupporters, ViewSupporters } from '@podkrepi-bg/podkrepi-types'
import { FilesTypesDto } from './dto/files-type.dto'
import { KeycloakTokenParsed } from '../auth/keycloak'
import { PersonService } from '../person/person.service'
import { VaultService } from '../vault/vault.service'
import { CampaignService } from '../campaign/campaign.service'
import { DonationsService } from '../donations/donations.service'
import { parseBankTransactionsFile } from './helpers/parser'
import { DonationType, PaymentProvider, PaymentStatus, PaymentType } from '@prisma/client'
import { ApiTags } from '@nestjs/swagger'
import {
  BankImportResult,
  ImportStatus,
} from '../bank-transactions-file/dto/bank-transactions-import-status.dto'
import { CreateBankPaymentDto } from '../donations/dto/create-bank-payment.dto'
import { validateFileType } from '../common/files'

@ApiTags('bank-transactions-file')
@Controller('bank-transactions-file')
export class BankTransactionsFileController {
  constructor(
    private readonly bankTransactionsFileService: BankTransactionsFileService,
    @Inject(forwardRef(() => VaultService)) private vaultService: VaultService,
    private readonly donationsService: DonationsService,
    private readonly campaignService: CampaignService,
    @Inject(forwardRef(() => PersonService)) private readonly personService: PersonService,
  ) {}

  @Post(':bank_transactions_file_id')
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      limits: { fileSize: 1024 * 1024 * 10 }, //limit uploaded files to 5 at once and 10MB each
      fileFilter: (_req: Request, file, cb) => {
        validateFileType(file, cb)
      },
    }),
  )
  async create(
    @Param('bank_transactions_file_id') bankTransactionsFileId: string,
    @Body() body: FilesTypesDto,
    @UploadedFiles() files: Express.Multer.File[],
    @AuthenticatedUser() user: KeycloakTokenParsed,
  ): Promise<BankImportResult[]> {
    const keycloakId = user.sub as string
    const person = await this.personService.findOneByKeycloakId(keycloakId)
    if (!person) {
      Logger.warn('No person record with keycloak ID: ' + keycloakId)
      throw new NotFoundException('No person record with keycloak ID: ' + keycloakId)
    }

    const allMovementsFromAllFiles: { payment: CreateBankPaymentDto; paymentRef: string }[] = []
    //parse files and save them to S3
    await Promise.all(
      files.map((file, key) => {
        allMovementsFromAllFiles.push(...parseBankTransactionsFile(file.buffer))
        const filesType = body.types
        return this.bankTransactionsFileService.create(
          Array.isArray(filesType) ? filesType[key] : filesType,
          file.originalname,
          file.mimetype,
          bankTransactionsFileId,
          person,
          file.buffer,
        )
      }),
    )
    //now import the parsed donations
    const bankImportResults: BankImportResult[] = []
    let errCountbankImportResults = 0
    for (const movement of allMovementsFromAllFiles) {
      const campaign = await this.campaignService.getCampaignByPaymentReference(movement.paymentRef)
      const bankImportResult: BankImportResult = {
        status: ImportStatus.UNPROCESSED,
        amount: movement.payment.amount,
        currency: movement.payment.currency,
        createdAt: movement.payment.createdAt,
        extPaymentIntentId: movement.payment.extPaymentIntentId,
      }

      if (!campaign) {
        const errorMsg = 'No campaign with payment reference: ' + movement.paymentRef
        bankImportResult.status = ImportStatus.FAILED
        bankImportResult.message = errorMsg
        Logger.debug(errorMsg)
        bankImportResults.push(bankImportResult)
        errCountbankImportResults++
        continue
      }

      const vault = await this.vaultService.findByCampaignId(campaign.id)
      movement.payment.extPaymentMethodId = 'imported bank payment'
      movement.payment.donations[0].targetVaultId = vault[0].id
      movement.payment.type = PaymentType.single
      movement.payment.status = PaymentStatus.succeeded
      movement.payment.provider = PaymentProvider.bank

      const paymentObj: CreateBankPaymentDto = {
        provider: PaymentProvider.bank,
        status: PaymentStatus.succeeded,
        type: PaymentType.single,
        extPaymentIntentId: movement.payment.extPaymentIntentId,
        extPaymentMethodId: 'imported bank payment',
        amount: movement.payment.amount,
        currency: movement.payment.currency,
        createdAt: movement.payment.createdAt,
        extCustomerId: movement.payment.extCustomerId,
        donations: {
          create: {
            type: DonationType.donation,
            amount: movement.payment.amount,
            targetVault: { connect: { id: vault[0].id } },
          },
        },
      }

      try {
        bankImportResult.status = await this.donationsService.createUpdateBankPayment(paymentObj)
      } catch (e) {
        const errorMsg = `Error during database import ${movement.paymentRef} : ${e}`
        bankImportResult.status = ImportStatus.FAILED
        bankImportResult.message = errorMsg
        Logger.debug(errorMsg)
      }
      bankImportResults.push(bankImportResult)
    }
    if (errCountbankImportResults > 0) {
      Logger.warn('Number of errors during bank imports: ' + errCountbankImportResults)
    }
    return bankImportResults
  }

  @Get()
  findAll() {
    return this.bankTransactionsFileService.findAll()
  }

  @Get(':id')
  @Public()
  async findOne(
    @Param('id') id: string,
    @Response({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    const file = await this.bankTransactionsFileService.findOne(id)
    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': 'attachment; filename="' + file.filename + '"',
    })

    return new StreamableFile(file.stream)
  }

  @Delete(':id')
  @Roles({
    roles: [RealmViewSupporters.role, ViewSupporters.role],
    mode: RoleMatchingMode.ANY,
  })
  remove(@Param('id') id: string) {
    return this.bankTransactionsFileService.remove(id)
  }
}
