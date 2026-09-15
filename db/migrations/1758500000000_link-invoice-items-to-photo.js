exports.up = (pgm) => {
  pgm.addColumn('invoice_items', {
    photo_id: {
      type: 'integer',
      references: 'visit_photos',
      onDelete: 'CASCADE',
    },
  });
  pgm.createIndex('invoice_items', 'photo_id');

  // Best-effort backfill: only unambiguous when the item's visit has exactly one photo.
  pgm.sql(`
    UPDATE invoice_items ii
    SET photo_id = vp.id
    FROM visit_photos vp
    WHERE vp.visit_id = ii.visit_id
      AND (SELECT COUNT(*) FROM visit_photos WHERE visit_id = ii.visit_id) = 1;
  `);

  // Fails loudly if any row couldn't be backfilled (a visit with >1 photo already had
  // invoice_items before this migration) — resolve manually, then re-run `up`.
  pgm.alterColumn('invoice_items', 'photo_id', { notNull: true });

  pgm.dropColumn('invoice_items', 'visit_id');
};

exports.down = (pgm) => {
  pgm.addColumn('invoice_items', {
    visit_id: {
      type: 'integer',
      references: 'link_visits',
      onDelete: 'CASCADE',
    },
  });
  pgm.sql(`
    UPDATE invoice_items ii
    SET visit_id = vp.visit_id
    FROM visit_photos vp
    WHERE vp.id = ii.photo_id;
  `);
  pgm.alterColumn('invoice_items', 'visit_id', { notNull: true });
  pgm.dropColumn('invoice_items', 'photo_id');
};
