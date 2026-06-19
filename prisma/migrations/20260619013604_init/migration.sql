-- CreateTable
CREATE TABLE "Candidature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'reçue',
    "last_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "birth_date" TEXT NOT NULL,
    "birth_place" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "last_degree" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "graduation_year" TEXT NOT NULL,
    "is_civil_servant" BOOLEAN NOT NULL DEFAULT false,
    "civil_servant_details" TEXT,
    "files" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidature_email_key" ON "Candidature"("email");
