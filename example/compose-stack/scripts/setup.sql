alter user sys identified by "password";
alter user system identified by "password";
alter session set container = FREEPDB1;
alter user pdbadmin identified by "password";
create or replace user graphuser identified by "password";
grant resource, connect to graphuser;
alter user graphuser quota unlimited on users;
grant create session to graphuser;
CREATE TABLE OPENFLIGHTS_AIRPORTS (
  ID number,
  NAME varchar(100),
  IATA varchar(10),
  ICAO varchar(10),
  LATITUDE number,
  LONGITUDE number,
  ALTITUDE number,
  TIMEZONE number,
  DST varchar(10),
  TZDBTIME varchar(100),
  AIRPORT_TYPE varchar(100),
  SOURCE varchar(100),
  CITY_ID number
);
CREATE TABLE OPENFLIGHTS_CITIES (
  ID number,
  COUNTRY varchar(100),
  CITY varchar(100)
);
CREATE TABLE OPENFLIGHTS_ROUTES (
  ID number,
  AIRLINE_ID number,
  SRC_AIRPORT_ID number,
  DEST_AIRPORT_ID number,
  CODESHARE varchar(100),
  STOPS number,
  EQUIPMENT varchar(100),
  DISTANCE_IN_KM number,
  DISTANCE_IN_MI number
);

grant insert on OPENFLIGHTS_AIRPORTS to graphuser;
grant insert on OPENFLIGHTS_ROUTES to graphuser;
grant insert on OPENFLIGHTS_CITIES to graphuser;
