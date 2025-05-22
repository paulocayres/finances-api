import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';

export class ParseDatePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): Date {
    const parsedDate = new Date(value);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException(`Data inválida: ${value}`);
    }
    return parsedDate;
  }
}