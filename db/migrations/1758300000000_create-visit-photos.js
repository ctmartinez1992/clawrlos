exports.up = (pgm) => {
  pgm.createTable('visit_photos', {
    id: 'id',
    visit_id: {
      type: 'integer',
      notNull: true,
      references: 'link_visits',
      onDelete: 'CASCADE',
    },
    photo_path: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('visit_photos', 'visit_id');

  // Superseded by the one-to-many visit_photos table above (a visit can now have zero or more photos).
  pgm.dropColumn('link_visits', 'photo_path');
};

exports.down = (pgm) => {
  pgm.addColumn('link_visits', { photo_path: { type: 'text' } });
  pgm.dropTable('visit_photos');
};
