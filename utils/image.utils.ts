import { writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const saveImage = (base64Image: string): string => {
  const fileName = `${uuidv4()}.png`;
  const filePath = join(__dirname, '..', '..', 'uploads', fileName);
  
  const buffer = Buffer.from(base64Image, 'base64');
  writeFileSync(filePath, buffer);
  
  return `http://localhost:5000/uploads/${fileName}`;
};

