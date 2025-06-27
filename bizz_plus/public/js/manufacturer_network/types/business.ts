export interface Zone {
  id: string;
  name: string;
  distributorIds: string[];
}

export interface Distributor {
  id: string;
  name: string;
  zoneIds: string[];
  areaIds: string[];
}

export interface Area {
  id: string;
  name: string;
  distributorIds: string[];
  outletIds: string[];
}

export interface Outlet {
  id: string;
  name: string;
  areaIds: string[];
}

export interface BusinessData {
  zones: Zone[];
  distributors: Distributor[];
  areas: Area[];
  outlets: Outlet[];
}

export type EntityType = 'zone' | 'distributor' | 'area' | 'outlet';