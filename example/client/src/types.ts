
export type GRAPH_ID = {
  ELEM_TABLE: string;
  KEY_VALUE: {
    ID: string;
  }
};
export type SQL_RESPONSE = {
  metaData: { name: string }[];
  rows: (string | GRAPH_ID)[][];
};

export type DBSchema = {
  nodes: Record<string, {
    properties: Record<string, unknown>;
    label: string;
  }>;
  edges: Record<string, {
    properties: Record<string, unknown>;
    label: string;
  }>;
};

export type NodeData<S extends DBSchema> =  S['nodes'][string & keyof S['nodes']]['properties'];
export type EdgeData<S extends DBSchema> =  S['edges'][string & keyof S['edges']]['properties'];