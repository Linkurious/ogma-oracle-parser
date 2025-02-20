echo "Database user $GRAPH_USER identified by $GRAPH_PWD."
sqlplus -s "/ as sysdba" @/home/oracle/scripts/create-user.sql $GRAPH_USER $GRAPH_PWD