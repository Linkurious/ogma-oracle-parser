-- Switch to the pluggable database
alter session set container = FREEPDB1;

-- Clean up existing user
drop user if exists &1 cascade;

-- Create user
create user if not exists &1 identified by &2;

-- Grant necessary privileges to the user
grant resource, connect to &1;
alter user &1 quota unlimited on users;
grant create session to &1;
grant db_developer_role to &1;
grant create property graph, create any property graph, alter any property graph, drop any property graph, read any property graph to &1;