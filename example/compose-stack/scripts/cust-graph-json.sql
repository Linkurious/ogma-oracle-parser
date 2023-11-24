CREATE OR REPLACE FUNCTION CUST_SQLGRAPH_JSON (
      QUERY VARCHAR2,
      PAGE_START NUMBER DEFAULT -1,
      PAGE_SIZE NUMBER DEFAULT 32000
    ) RETURN CLOB
      AUTHID CURRENT_USER IS
      INCUR    SYS_REFCURSOR;
      L_CUR    NUMBER;
      RETVALUE CLOB;
    BEGIN
      OPEN INCUR FOR QUERY;
      L_CUR := DBMS_SQL.TO_CURSOR_NUMBER(INCUR);
      RETVALUE := ORA_SQLGRAPH_TO_JSON(L_CUR, PAGE_START, PAGE_SIZE);
      DBMS_SQL.CLOSE_CURSOR(L_CUR);
      RETURN RETVALUE;
    END;
/