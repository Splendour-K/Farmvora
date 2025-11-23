/*
  # Add Missing Foreign Key Indexes

  Adds indexes for all unindexed foreign keys to improve query performance.
*/

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_investments_reviewed_by ON investments(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_project_questions_answered_by ON project_questions(answered_by);
CREATE INDEX IF NOT EXISTS idx_project_questions_reviewed_by ON project_questions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);

COMMENT ON INDEX idx_cart_items_product_id IS 'Improves cart_items foreign key query performance';
COMMENT ON INDEX idx_investments_reviewed_by IS 'Improves investments reviewer query performance';
COMMENT ON INDEX idx_order_items_product_id IS 'Improves order_items product lookup performance';
COMMENT ON INDEX idx_project_questions_answered_by IS 'Improves question answerer lookup performance';
COMMENT ON INDEX idx_project_questions_reviewed_by IS 'Improves question reviewer lookup performance';
COMMENT ON INDEX idx_projects_created_by IS 'Improves project creator lookup performance';