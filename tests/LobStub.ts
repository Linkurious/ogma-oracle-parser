import EventEmitter from 'eventemitter3';
import { createReadStream } from 'fs';
import { Lob } from 'oracledb';
// export type Events = {
//   'data': (data: string) => void;
//   'error': (error: Error) => void;
//   'end': () => void;
// };
// export class LobStub extends EventEmitter {
//   constructor() {
//     super();
//   }
//   setEncoding(encoding: string) {

//   }
// }

export function getLob(filename: string) {
  return createReadStream(filename) as unknown as Lob;
}