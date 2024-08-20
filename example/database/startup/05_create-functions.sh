sqlplus -s $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 @/home/oracle/scripts/gvt-sqlgraph-to-json.sql
sqlplus -s $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 @/home/oracle/scripts/cust-sqlgraph-json.sql

