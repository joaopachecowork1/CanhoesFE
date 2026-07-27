CREATE SEQUENCE IF NOT EXISTS "CanhoesEventState_Id_seq";

ALTER SEQUENCE "CanhoesEventState_Id_seq"
OWNED BY "CanhoesEventState"."Id";

SELECT setval(
  '"CanhoesEventState_Id_seq"',
  COALESCE((SELECT MAX("Id") FROM "CanhoesEventState"), 0) + 1,
  false
);

ALTER TABLE "CanhoesEventState"
ALTER COLUMN "Id" SET DEFAULT nextval('"CanhoesEventState_Id_seq"');
