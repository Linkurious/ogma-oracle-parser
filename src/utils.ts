import { SQLID } from "./types";

/**
 * Transforms a string id to a SQL ID
 * @param id a string id (from rawIdToId)
 * @returns a SQL ID
 */
export function SQLIDfromId(id: string): SQLID {
  return `${eltNameFromId(id)}{"ID":${+rowId(id)}}`;
}

/**
 * Transforms an id from SQL database to a string id
 * @param rawId SQL Oracle ID
 * @returns string id
 */
export function SQLIDtoId(sqlid: SQLID) {
  const match = sqlid.match(/(.*)\{.+:([0-9]+)/);
  if (!match || match.length !== 3) throw new Error("Invalid ID");
  return `${match[1]}:${match[2]}`;
}
/**
 * Retrieves the elment ID in his table ID from a string id
 * @param id a string id (from SQLIDToId)
 * @returns SQL ID in table
 */
export function rowId(id: string) {
  const match = id.match(/(.+):(.+)/);
  if (!match || match.length !== 3) throw new Error("Invalid ID");
  return match[2];
}
/**
 * Retrieves the label from a string id
 * @param id a string id (from SQLIDToId)
 * @returns label defined in create property graph query
 */
export function eltNameFromId(id: string) {
  const match = id.match(/(.+):(.+)/);
  if (!match || match.length !== 3) throw new Error("Invalid ID");
  return match[1];
}
