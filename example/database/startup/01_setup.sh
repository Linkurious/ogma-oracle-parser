echo "Create pluggable database user $GRAPH_USER identified by $GRAPH_PWD."
sqlplus -s "$ORACLE_ADMIN/$ORACLE_PWD@freepdb1" @/home/oracle/scripts/create-user.sql $GRAPH_USER $GRAPH_PWD
