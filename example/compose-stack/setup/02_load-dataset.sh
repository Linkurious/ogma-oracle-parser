unzip /home/oracle/dataset/dataset.zip -d /home/oracle/dataset
sqlplus -s graphuser/password@localhost:1521/freepdb1 @/home/oracle/scripts/create-tables.sql
sqlplus -s graphuser/password@localhost:1521/freepdb1 @/home/oracle/dataset/airports.sql
sqlplus -s graphuser/password@localhost:1521/freepdb1 @/home/oracle/dataset/cities.sql
sqlplus -s graphuser/password@localhost:1521/freepdb1 @/home/oracle/dataset/routes.sql
sqlplus -s graphuser/password@localhost:1521/freepdb1 @/home/oracle/scripts/create-property-graph.sql
sqlplus -s graphuser/password@localhost:1521/freepdb1 @/home/oracle/scripts/sqlgraph-to-json.sql
sqlplus -s graphuser/password@localhost:1521/freepdb1 @/home/oracle/scripts/cust-graph-json.sql

