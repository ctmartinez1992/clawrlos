exports.up = (pgm) => {
  pgm.createTable('link_visits', {
    id: 'id',
    link_id: {
      type: 'integer',
      notNull: true,
      references: 'links',
      onDelete: 'CASCADE',
    },
    rating: { type: 'integer' },
    notes: { type: 'text' },
    visited_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint(
    'link_visits',
    'link_visits_rating_check',
    'CHECK (rating IS NULL OR (rating >= 0 AND rating <= 10))'
  );
  pgm.createIndex('link_visits', 'link_id');
};

exports.down = (pgm) => {
  pgm.dropTable('link_visits');
};
