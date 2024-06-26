import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IrisPayService } from './iris-pay.service';
import { CreateIrisPayDto } from './dto/create-iris-pay.dto';
import { UpdateIrisPayDto } from './dto/update-iris-pay.dto';

@Controller('iris-pay')
export class IrisPayController {
  constructor(private readonly irisPayService: IrisPayService) {}

  @Post()
  create(@Body() createIrisPayDto: CreateIrisPayDto) {
    return this.irisPayService.create(createIrisPayDto);
  }

  @Get()
  findAll() {
    return this.irisPayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.irisPayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIrisPayDto: UpdateIrisPayDto) {
    return this.irisPayService.update(+id, updateIrisPayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.irisPayService.remove(+id);
  }
}
