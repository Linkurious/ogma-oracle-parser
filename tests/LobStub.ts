import { Lob } from 'oracledb';
import { createReadStream } from 'fs';

export function getLob(filename: string) {
  return createReadStream(filename) as unknown as Lob;
}