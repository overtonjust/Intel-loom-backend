\c intel_loom;

DROP FUNCTION IF EXISTS enforce_class_capacity() CASCADE;

CREATE OR REPLACE FUNCTION enforce_class_capacity() 
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT c.capacity 
    FROM classes c
    JOIN class_dates cd ON c.class_id = cd.class_id
    WHERE cd.class_date_id = NEW.class_date_id
  ) <= (
    SELECT cd.students 
    FROM class_dates cd
    WHERE cd.class_date_id = NEW.class_date_id
  ) THEN
    RAISE EXCEPTION 'This class is already at full capacity';
  END IF;
  UPDATE class_dates
  SET students = students + 1
  WHERE class_date_id = NEW.class_date_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_class_capacity ON booked_classes;

CREATE TRIGGER check_class_capacity
BEFORE INSERT ON booked_classes
FOR EACH ROW
EXECUTE FUNCTION enforce_class_capacity();

DROP FUNCTION IF EXISTS decrement_students_on_cancel() CASCADE;

CREATE OR REPLACE FUNCTION decrement_students_on_cancel() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE class_dates
  SET students = students - 1
  WHERE class_date_id = OLD.class_date_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS decrement_students_on_delete ON booked_classes;

CREATE TRIGGER decrement_students_on_delete
AFTER DELETE ON booked_classes
FOR EACH ROW
EXECUTE FUNCTION decrement_students_on_cancel();
