/*Setting random time, to the existing  bank donations without touching the date itself*/
DO $$
DECLARE temprow RECORD;
BEGIN FOR temprow IN
    SELECT id, created_at FROM donations WHERE provider::text='bank' ORDER BY created_at DESC
    LOOP
    UPDATE donations SET created_at = created_at::timestamp + (floor(random() * (23 - 1 + 1) + 1)::int || ' hours')::interval  + (floor(random() * (59 - 1 + 1) + 1)::int || ' minutes')::interval + (floor(random() * (59 - 1 + 1) + 1)::int || ' seconds')::interval + (floor(random() * (999 - 1 + 1) + 100)::int || ' milliseconds')::interval   WHERE id::uuid=temprow.id::uuid;
    END LOOP;
END;
$$