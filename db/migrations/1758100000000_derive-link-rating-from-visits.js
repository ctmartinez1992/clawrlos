exports.up = (pgm) => {
  pgm.createFunction(
    'recalculate_link_rating',
    [],
    { returns: 'trigger', language: 'plpgsql', replace: true },
    `
    DECLARE
      target_link_id integer;
    BEGIN
      IF TG_OP = 'DELETE' THEN
        target_link_id := OLD.link_id;
      ELSE
        target_link_id := NEW.link_id;
      END IF;

      UPDATE links
      SET rating = (
        SELECT ROUND(AVG(rating))::integer
        FROM link_visits
        WHERE link_id = target_link_id AND rating IS NOT NULL
      )
      WHERE id = target_link_id;

      IF TG_OP = 'UPDATE' AND NEW.link_id IS DISTINCT FROM OLD.link_id THEN
        UPDATE links
        SET rating = (
          SELECT ROUND(AVG(rating))::integer
          FROM link_visits
          WHERE link_id = OLD.link_id AND rating IS NOT NULL
        )
        WHERE id = OLD.link_id;
      END IF;

      RETURN NULL;
    END;
    `
  );

  pgm.createTrigger('link_visits', 'link_visits_rating_sync', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    function: 'recalculate_link_rating',
    level: 'ROW',
  });

  // Backfill existing links so rating reflects current visits immediately.
  pgm.sql(`
    UPDATE links
    SET rating = (
      SELECT ROUND(AVG(v.rating))::integer
      FROM link_visits v
      WHERE v.link_id = links.id AND v.rating IS NOT NULL
    );
  `);
};

exports.down = (pgm) => {
  pgm.dropTrigger('link_visits', 'link_visits_rating_sync');
  pgm.dropFunction('recalculate_link_rating', []);
};
