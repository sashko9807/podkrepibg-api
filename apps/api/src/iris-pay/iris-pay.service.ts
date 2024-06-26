import { Injectable } from '@nestjs/common';
import { CreateIrisPayDto } from './dto/create-iris-pay.dto';
import { UpdateIrisPayDto } from './dto/update-iris-pay.dto';

@Injectable()
export class IrisPayService {
  create(createIrisPayDto: CreateIrisPayDto) {
    return 'This action adds a new irisPay';
  }

  findAll() {
    return `This action returns all irisPay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} irisPay`;
  }

  update(id: number, updateIrisPayDto: UpdateIrisPayDto) {
    return `This action updates a #${id} irisPay`;
  }

  remove(id: number) {
    return `This action removes a #${id} irisPay`;
  }
}
