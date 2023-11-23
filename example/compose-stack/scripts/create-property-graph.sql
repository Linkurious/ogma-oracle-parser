-- Add primary keys

alter table openflights_airports add constraint openflights_airports_pk primary key (id);

alter table openflights_cities add constraint openflights_cities_pk primary key (id);

alter table openflights_routes add constraint openflights_routes_pk primary key (id);

-- Add foreign keys

alter table openflights_airports add constraint openflights_airports_city_fk foreign key (city_id) references openflights_cities(id);

alter table openflights_routes add constraint openflights_routes_src_airport_fk foreign key (src_airport_id) references openflights_airports(id);

alter table openflights_routes add constraint openflights_routes_dest_airport_fk foreign key (dest_airport_id) references openflights_airports(id);

drop property graph openflights_graph;
create property graph openflights_graph vertex tables ( openflights_airports as airports key ( id ) label airport properties ( name, iata, icao, airport_type, longitude, latitude, altitude, timezone, tzdbtime, dst ), openflights_cities as cities key ( id ) label city properties ( city, country ) ) edge tables ( openflights_routes as routes source key ( src_airport_id ) references airports (id) destination key ( dest_airport_id ) references airports (id) label route properties ( codeshare, airline_id, equipment, stops, distance_in_mi, distance_in_km ), openflights_airports as airports_in_cities source key ( id ) references airports (id) destination key ( city_id ) references cities (id) label located_in no properties );