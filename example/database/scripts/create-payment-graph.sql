-- Create the SQL Property Graph

DROP PROPERTY GRAPH IF EXISTS circular_payments_graph;

CREATE PROPERTY GRAPH IF NOT EXISTS circular_payments_graph
  VERTEX TABLES (
    bank_accounts
    KEY (acct_id)
    LABEL account
    PROPERTIES ALL COLUMNS
  )
  EDGE TABLES (
    bank_txns
    KEY (txn_id)
    SOURCE KEY (src_acct_id) REFERENCES bank_accounts (acct_id)
    DESTINATION KEY (dst_acct_id) REFERENCES bank_accounts (acct_id)
    LABEL transfers
    PROPERTIES ALL COLUMNS
  );