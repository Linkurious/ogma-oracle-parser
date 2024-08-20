drop table if exists openflights_airports;
create table openflights_airports (
  id number,
  name varchar2 (100),
  iata varchar2 (10),
  icao varchar2 (10),
  latitude number,
  longitude number,
  altitude number,
  timezone number,
  dst varchar2 (10),
  tzdbtime varchar2 (100),
  airport_type varchar2 (100),
  source varchar2 (100),
  city_id number
);
drop table if exists openflights_cities;
create table openflights_cities (
  id number,
  country varchar(100),
  city varchar(100)
);
drop table if exists openflights_routes;
create table openflights_routes (
  id number,
  airline_id number,
  src_airport_id number,
  dest_airport_id number,
  codeshare varchar(100),
  stops number,
  equipment varchar(100),
  distance_in_km number,
  distance_in_mi number
);

-- Add primary keys
alter table openflights_airports add constraint openflights_airports_pk primary key (id);
alter table openflights_cities add constraint openflights_cities_pk primary key (id);
alter table openflights_routes add constraint openflights_routes_pk primary key (id);

-- Add foreign keys
alter table openflights_airports add constraint openflights_airports_city_fk foreign key (city_id) references openflights_cities(id);
alter table openflights_routes add constraint openflights_routes_src_airport_fk foreign key (src_airport_id) references openflights_airports(id);
alter table openflights_routes add constraint openflights_routes_dest_airport_fk foreign key (dest_airport_id) references openflights_airports(id);
