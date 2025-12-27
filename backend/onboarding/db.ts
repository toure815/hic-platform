import { SQLDatabase } from "encore.dev/storage/sqldb";

export const onboardingDB = new SQLDatabase("onboarding", {
  migrations: "./migrations",
});
