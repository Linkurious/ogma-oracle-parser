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

export type Schema = {
  nodes: {
    city: {
      label: "city";
      properties: {
        type: "CITIES";
        CITY: "string";
        COUNTRY: "string";
      };
    };
    airport: {
      label: "located_in";
      properties: {
        type: "AIRPORTS";
        NAME: "string";
        IATA: "string";
        ICAO: "string";
        AIRPORT_TYPE: "string";
        LONGITUDE: "number";
        LATITUDE: "number";
        ALTITUDE: "number";
        TIMEZONE: "string";
        TZDBTIME: "string";
        DST: "string";
      };
    };
  };
  edges: {
    route: {
      label: "route";
      properties: {
        codeshare: "string";
        airline_id: "string";
        equipment: "string";
        stops: "number";
        distance_in_mi: "number";
        distance_in_km: "number";
      };
    };
    located_in: {
      label: "located_in";
      properties: Record<string, never>;
    };
  };
};
export type NodeType = keyof Schema["nodes"];
export type EdgeType = keyof Schema["edges"];
export type NodeData<T extends NodeType> = Schema["nodes"][T]["properties"];
export type EdgeData<T extends EdgeType> = Schema["edges"][T]["properties"];
