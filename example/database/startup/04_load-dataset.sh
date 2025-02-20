sqlldr $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 control=/home/oracle/dataset/cities.ctl log=/tmp/cities.log bad=/tmp/cities.bad 
sqlldr $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 control=/home/oracle/dataset/airports.ctl log=/tmp/airports.log bad=/tmp/airports.bad
sqlldr $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 control=/home/oracle/dataset/routes.ctl log=/tmp/routes.log bad=/tmp/routes.bad
sqlldr $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 control=/home/oracle/dataset/bank_accounts.ctl log=/tmp/bank_accounts.log bad=/tmp/bank_accounts.bad
sqlldr $GRAPH_USER/$GRAPH_PWD@localhost:1521/freepdb1 control=/home/oracle/dataset/bank_txns.ctl log=/tmp/bank_txns.log bad=/tmp/bank_txns.bad
