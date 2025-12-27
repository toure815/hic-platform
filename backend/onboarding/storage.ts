import { Bucket } from "encore.dev/storage/objects";

export const uploadsBucket = new Bucket("onboarding-uploads", {
  public: false,
});
