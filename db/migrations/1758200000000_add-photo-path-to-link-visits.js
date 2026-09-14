exports.up = (pgm) => {
  pgm.addColumn('link_visits', {
    photo_path: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('link_visits', 'photo_path');
};
