# ogma-oracle-graph-db

Work in progress.

## Prerequisites


### Get an Oracle SQL server runing in Docker:

```sh
docker pull container-registry.oracle.com/database/free:latest
```

Replace **PASSWORD**
```sh
docker run -d -it --name 23cfree -p 1521:1521 -e DBA_PWD=PASSWORD -e USR_PWD=PASSWORD container-registry.oracle.com/database/free:latest
```

```sh
docker exec -it 23cfree /bin/bash
 ```
 This command will ask you SID: *FREE* and password *FREEPDB1*
 ```sh
sqlplus / as sysdba
 ```
Now change passwords and create user:
 ```sh
alter user sys identified by PASSWORD;
alter user system identified by PASSWORD;
alter session set container = FREEPDB1;
alter user pdbadmin identified by PASSWORD;
create user graphuser identified by PASSWORD;
grant resource, connect to graphuser;
alter user graphuser quota unlimited on users;
exit;
 ```


### Setup the dataset:

You need to get [SQLCL](https://www.oracle.com/database/sqldeveloper/technologies/sqlcl/download/).

Then connect to it: 
```sh
sql graphuser@<hostname>:1521/freepdb1
```

Dowload the zip file [here](https://drive.google.com/file/d/1JASp1AFkwxA4MKCITuaXO3we1Hh1pxd8/view?usp=sharing), unzip, cd to the folder then (inside sqlcl):

```sh
load openflights_airports <path>/openflights_airports new colsize max;
load openflights_cities <path>/openflights_cities new colsize max;
load openflights_routes <path>/openflights_routes new colsize max;
```

Add foreign keys
```sh
alter table openflights_airports add constraint openflights_airports_city_fk foreign key (city_id) references openflights_cities(id);

alter table openflights_routes add constraint openflights_routes_src_airport_fk foreign key (src_airport_id) references openflights_airports(id);

alter table openflights_routes add constraint openflights_routes_dest_airport_fk foreign key (dest_airport_id) references openflights_airports(id);
```

Create the graph (you might get problems with `\n`, just remove them)
```
create property graph openflights_graph

      vertex tables (

           openflights_airports as airports

                 key ( id )

                 label airport

                 properties ( name, iata, icao, airport_type, longitude, latitude, altitude, timezone, tzdbtime, dst ),

           openflights_cities as cities

                 key ( id )

                 label city properties ( city, country )

      )

      edge tables (

           openflights_routes as routes

                 source key ( src_airport_id ) references airports (id)

                 destination key ( dest_airport_id ) references airports (id)

                 label route

                 properties ( codeshare, airline_id, equipment, stops, distance_in_mi, distance_in_km ),

           openflights_airports as airports_in_cities

                 source key ( id ) references airports (id)

                 destination key ( city_id ) references cities (id)

                 label located_in

                 no properties

      );
```
And you are done ! 


## How to run it ? 

Let's say you did all the steps above, restarted your laptop, you need to start your docker container: 
```sh 
docker run container-registry.oracle.com/database/free:latest
```
and in annother terminal, start SQLcl:
```sh
./sql graphuser@localhost:1521/freepdb1
```
Then start server: 
```sh
npm run start
```
and finaly the client
```sh
npm run dev
```