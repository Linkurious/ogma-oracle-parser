echo "GRAPH USER: $GRAPH_USER GRAPH PWD: $GRAPH_PWD DBA_PWD: $DBA_PWD"
sqlplus -s "/ as sysdba" @/home/oracle/scripts/create-user.sql $GRAPH_USER $GRAPH_PWD