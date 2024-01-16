alter session set container = FREEPDB1;
drop user &1 cascade;
create user &1 identified by &2;
grant resource, connect to &1;
alter user &1 quota unlimited on users;
grant create session to &1;