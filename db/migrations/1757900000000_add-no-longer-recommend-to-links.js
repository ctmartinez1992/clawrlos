exports.up = (pgm) => {
  pgm.addColumn('links', {
    no_longer_recommend: { type: 'boolean', notNull: true, default: false },
    reason_for_no_longer_recommending: { type: 'text' },
    date_for_no_longer_recommending: { type: 'date' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('links', 'date_for_no_longer_recommending');
  pgm.dropColumn('links', 'reason_for_no_longer_recommending');
  pgm.dropColumn('links', 'no_longer_recommend');
};
