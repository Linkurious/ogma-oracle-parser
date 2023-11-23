alter user sys identified by "password";
alter user system identified by "password";
alter session set container = FREEPDB1;
alter user pdbadmin identified by "password";
drop user graphuser;
create user graphuser identified by "password";
grant resource, connect to graphuser;
alter user graphuser quota unlimited on users;
grant create session to graphuser;
