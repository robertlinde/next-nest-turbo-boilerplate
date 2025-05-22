export type MailDevEmail = {
  headers: {
    to: string;
    subject: string;
  };
  html: string;
};
