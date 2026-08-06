import { eltNameFromId, GraphSchema } from "@linkurious/ogma-oracle-parser";

export function idToLabel(schema: GraphSchema, id: string) {
  return schema.elementNameToLabel.get(eltNameFromId(id));
}
