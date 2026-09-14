exports.up = (pgm) => {
  pgm.createTable('invoice_items', {
    id: 'id',
    visit_id: {
      type: 'integer',
      notNull: true,
      references: 'link_visits',
      onDelete: 'CASCADE',
    },
    product_name: { type: 'text', notNull: true },
    price: { type: 'numeric(10,2)', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('invoice_items', 'visit_id');
};

exports.down = (pgm) => {
  pgm.dropTable('invoice_items');
};
