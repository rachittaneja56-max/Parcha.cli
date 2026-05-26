import { delCache } from "@repo/redis";

export const PUBLIC_FORMS_CACHE_KEY = "forms:public:v1";
export const PUBLIC_FORMS_CACHE_TTL_SECONDS = 60;

export const invalidatePublicFormsCache = () => delCache(PUBLIC_FORMS_CACHE_KEY);
