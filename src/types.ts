
export type TableName = string;
export type RowId = number;
export type RawId = `${TableName}\{"ID":${RowId}\}`;

export type OracleResponse<
    ND = Record<string, unknown>,
    ED = Record<string, unknown>> =
    {
        vertices: { id: RawId, properties: ND; }[],
        edges: { id: RawId, properties: ED, source: RawId, target: RawId; }[],
    };;