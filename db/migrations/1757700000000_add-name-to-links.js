exports.up = (pgm) => {
  pgm.addColumn('links', {
    name: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('links', 'name');
};
