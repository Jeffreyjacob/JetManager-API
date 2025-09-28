export interface EmailJobData {
  to: string | string[];
  subject: string;
  body: string;
  template?: string;
  data?: Record<string, any>;
}
