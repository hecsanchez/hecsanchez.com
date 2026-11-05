export interface Statement {
  bind(...values: unknown[]): Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
export interface Database {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown[]>;
}
export interface Env {
  DB?: Database;
  SIGNUPS_ENABLED?: string;
  RESOURCE_ENABLED?: string;
  NEWSLETTER_CAPTURE_ENABLED?: string;
  QUALIFICATION_ENABLED?: string;
  PRIVACY_REVIEWED?: string;
  PRIVACY_VERSION?: string;
  RETENTION_MODE?: string;
  DATA_RIGHTS_VERIFIED?: string;
  SIGNUPS_ADMIN_TOKEN?: string;
  RESEND_CONTACTS_VERIFIED?: string;
  RESEND_NEWSLETTER_SEGMENT_ID?: string;
  RESEND_NEWSLETTER_TOPIC_ID?: string;
  VERIFIED_SENDER?: string;
  SIGNUPS_SERVICE_TOKEN?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string;
}
export interface Execution { waitUntil(promise: Promise<unknown>): void }