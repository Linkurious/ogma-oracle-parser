export type GRAPH_ID = {
  ELEM_TABLE: string;
  KEY_VALUE: {
    ID: string;
  };
};
export type SQL_RESPONSE = {
  metaData: { name: string }[];
  rows: (string | GRAPH_ID)[][];
};
