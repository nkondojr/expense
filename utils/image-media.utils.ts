import { BadRequestException, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NotFoundError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export enum FileType{
  ATTACHMENT='attachment',
  PROFILE='profile',
}

export const saveImage = (base64Image: string,fileType:FileType): string => {
  if (!base64Image) {
    return null; // Return null or handle appropriately if base64Image is not provided
  }
  if (!base64Image.includes(',') || !base64Image.includes('/') || !base64Image.includes(';')) {
    throw new BadRequestException('It seems your base64 is invalid');
  }
  //check if media/uploads folder exists if not create to omit further errors
  const pathMedia = join(__dirname, '..', '..','media',);//media
  !existsSync(pathMedia) ? mkdirSync(pathMedia) : null;
  const pathUploads = join(__dirname, '..', '..','media','uploads');//uploads
  !existsSync(pathUploads) ? mkdirSync(pathUploads) : null;

  let fileName = `${uuidv4()}`;
  const fileExtension = (((base64Image.split(',')[0]).split('/')[1]).split(';')[0]);

  if (FileType.PROFILE==fileType) {
    console.log(fileType);
    if (fileExtension == 'jpeg' || fileExtension == 'jpg' || fileExtension == 'png') {
      fileName = `${fileName}.${fileExtension}`;
    }else{
      throw new BadRequestException(`This file type: ${fileExtension} is not accepted as profile`);
    }
  } else if(FileType.ATTACHMENT==fileType) {
    if (fileExtension == 'jpeg' || fileExtension == 'jpg' || fileExtension == 'png') {
      fileName = `${fileName}.${fileExtension}`;
    } else {
      fileName = `${fileName}.${fileExtension}`;
    }
  }

  const filePath = join(__dirname, '..', '..','media', 'uploads', fileName);

  const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
  writeFileSync(filePath, buffer);

  return `/media/uploads/${fileName}`;
};
