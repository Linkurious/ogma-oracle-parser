sqlldr $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 control=/home/oracle/dataset/bank_accounts.ctl log=/tmp/bank_accounts.log bad=/tmp/bank_accounts.bad
sqlldr $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 control=/home/oracle/dataset/bank_txns.ctl log=/tmp/bank_txns.log bad=/tmp/bank_txns.bad
sqlplus -s "$GRAPH_USER/$GRAPH_PWD@freepdb1" @/home/oracle/dataset/cities.sql
sqlplus -s "$GRAPH_USER/$GRAPH_PWD@freepdb1" @/home/oracle/dataset/airports.sql
sqlplus -s "$GRAPH_USER/$GRAPH_PWD@freepdb1" @/home/oracle/dataset/routes.sql

