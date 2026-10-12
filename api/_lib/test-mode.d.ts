export declare const TEST_PREFIX: string;
export declare const TEST_EMAIL_DOMAIN: string;
export declare function parseTestPrefix(input: { email: string; website: string }): {
  isTest: boolean;
  invalidFields: ("email" | "website")[];
  email: string;
  website: string;
};
