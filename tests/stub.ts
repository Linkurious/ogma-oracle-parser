import { Lob } from 'oracledb';
import { createReadStream } from 'fs';

export function getLob(filename: string) {
  return createReadStream(filename) as unknown as Lob;
}

export function getConnection() {
  return {
    execute: (sql: string) => {
      const [_, filename, pageStart, pageLength] =
        sql.match(/SELECT CUST_SQLGRAPH_JSON\('(.*)', (\d+), (\d+)\) AS COLUMN_ALIAS FROM DUAL/);
      return Promise.resolve({ rows: [[getLob(filename)]] });
    }
  };
}