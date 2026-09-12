exports.up = (pgm) => {
  pgm.addColumn('links', {
    rating: { type: 'integer' },
  });
  pgm.addConstraint(
    'links',
    'links_rating_check',
    'CHECK (rating IS NULL OR (rating >= 0 AND rating <= 10))'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('links', 'links_rating_check');
  pgm.dropColumn('links', 'rating');
};
