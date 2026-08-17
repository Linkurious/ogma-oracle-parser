-- Clean up existing tables
drop table if exists openflights_airports purge;
drop table if exists openflights_cities purge;
drop table if exists openflights_routes purge;

-- Create tables
create table openflights_airports (
  id number,
  name varchar2(100),
  iata varchar2(10),
  icao varchar2(10),
  latitude number,
  longitude number,
  altitude number,
  timezone number,
  dst varchar2(10),
  tzdbtime varchar2(100),
  airport_type varchar2(100),
  source varchar2(100),
  city_id number
);

create table if not exists openflights_cities (
  id number,
  country varchar2(100),
  city varchar2(100)
);

create table if not exists openflights_routes (
  id number,
  airline_id number,
  src_airport_id number,
  dest_airport_id number,
  codeshare varchar2(100),
  stops number,
  equipment varchar2(100),
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

-- Indexes on edge table foreign keys for faster lookups
CREATE INDEX idx_routes_src ON openflights_routes (src_airport_id);
CREATE INDEX idx_routes_dest ON openflights_routes (dest_airport_id);
CREATE INDEX idx_airports_city ON openflights_airports (city_id);

-- Index frequently filtered properties (if applicable)
CREATE INDEX idx_routes_airline ON openflights_routes (airline_id);
CREATE INDEX idx_routes_distance ON openflights_routes (distance_in_km);
CREATE INDEX idx_routes_stops ON openflights_routes (stops);

-- Bank dataset
DROP TABLE IF EXISTS BANK_ACCOUNTS;
CREATE TABLE BANK_ACCOUNTS (
  ACCT_ID NUMBER PRIMARY KEY,
  NAME VARCHAR2(100)
);

DROP TABLE IF EXISTS BANK_TXNS;
CREATE TABLE BANK_TXNS (
  SRC_ACCT_ID NUMBER NOT NULL,
  DST_ACCT_ID NUMBER NOT NULL,
  DESCRIPTION VARCHAR2(100),
  AMOUNT NUMBER,
  CONSTRAINT FK_BANK_TXNS_SRC FOREIGN KEY (SRC_ACCT_ID) REFERENCES BANK_ACCOUNTS(ACCT_ID),
  CONSTRAINT FK_BANK_TXNS_DST FOREIGN KEY (DST_ACCT_ID) REFERENCES BANK_ACCOUNTS(ACCT_ID)
);

-- Add ID column for txns
alter table bank_txns add txn_id number;
update bank_txns set txn_id = rownum;
commit;
alter table bank_txns add primary key (txn_id);

-- Create a sequence for TXN_ID
CREATE SEQUENCE BANK_TXNS_SEQ START WITH 1 INCREMENT BY 1;

-- Create a trigger to auto-generate TXN_ID
CREATE OR REPLACE TRIGGER BANK_TXNS_BI
BEFORE INSERT ON BANK_TXNS
FOR EACH ROW
BEGIN
  IF :NEW.TXN_ID IS NULL THEN
    :NEW.TXN_ID := BANK_TXNS_SEQ.NEXTVAL;
  END IF;
END;
/


