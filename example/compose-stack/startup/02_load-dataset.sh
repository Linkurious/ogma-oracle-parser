sqlplus -s $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 @/home/oracle/dataset/cities.sql
sqlplus -s $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 @/home/oracle/dataset/airports.sql
sqlplus -s $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 @/home/oracle/dataset/routes.sql
