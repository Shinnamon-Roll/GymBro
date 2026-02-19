CREATE TABLE IF NOT EXISTS "Customers" (
  id SERIAL PRIMARY KEY,
  "fullName" VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  "memberType" VARCHAR(50) NOT NULL,
  "memberLevel" VARCHAR(50) NOT NULL,
  "memberStartDate" TIMESTAMP NOT NULL,
  "memberEndDate" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Trainers" (
  id SERIAL PRIMARY KEY,
  "trainerName" VARCHAR(150) NOT NULL,
  "trainerLevel" VARCHAR(50) NOT NULL,
  specialty VARCHAR(100),
  phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS "GymEquipments" (
  id SERIAL PRIMARY KEY,
  "equipmentName" VARCHAR(150) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "TrainingSessions" (
  id SERIAL PRIMARY KEY,
  "sessionDate" TIMESTAMP NOT NULL,
  "customerId" INTEGER NOT NULL REFERENCES "Customers"(id) ON DELETE CASCADE,
  "trainerId" INTEGER NOT NULL REFERENCES "Trainers"(id),
  "equipmentId" INTEGER NOT NULL REFERENCES "GymEquipments"(id)
);
