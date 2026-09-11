exports.up = (pgm) => {
  pgm.createTable('links', {
    id: 'id',
    url: { type: 'text', notNull: true },
    category: { type: 'text', notNull: true },
    note: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('links', 'category');
};

exports.down = (pgm) => {
  pgm.dropTable('links');
};
