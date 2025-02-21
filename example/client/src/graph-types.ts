import { RawNode, RawEdge, RawGraph } from "@linkurious/ogma";

export type CityData = {
  CITY: string;
  COUNTRY: string;
};
export type AirportData = {
  IATA: string;
  ICAO: string;
  AIRPORT_TYPE: string;
  LONGITUDE: number;
  LATITUDE: number;
  ALTITUDE: number;
  TIMEZONE: number;
  TZDBTIME: string;
  DST: string;
  NAME: string;
};
export type RouteData = {
  CODESHARE: string;
  AIRLINE_ID: number;
  EQUIPMENT: string;
  STOPS: number;
  DISTANCE_IN_MI: number;
  DISTANCE_IN_KM: number;
};
export type LocatedInData = Record<string, never>;
export interface OpenflightsGraph extends RawGraph {
  nodes: RawNode<CityData | AirportData>[];
  edges: RawEdge<RouteData | LocatedInData>[];
}
export type OpenflightsMap = {
  graph: OpenflightsGraph;
  nodeLabels: {
    city: CityData;
    airport: AirportData;
  };
  edgeLabels: {
    route: RouteData;
    locatedIn: LocatedInData;
  };
};

export type AccountData = {
  ACCT_ID: number;
  NAME: string;
};
export type TransfersData = {
  SRC_ACCT_ID: number;
  DST_ACCT_ID: number;
  DESCRIPTION: string;
  AMOUNT: number;
  TXN_ID: number;
};
export interface CircularPaymentsGraph extends RawGraph {
  nodes: RawNode<AccountData>[];
  edges: RawEdge<TransfersData>[];
}
export type CircularPaymentsMap = {
  graph: CircularPaymentsGraph;
  nodeLabels: {
    account: AccountData;
  };
  edgeLabels: {
    transfers: TransfersData;
  };
};

export type GraphTypeMap = {
  Openflights: OpenflightsMap;
  CircularPayments: CircularPaymentsMap;
};
