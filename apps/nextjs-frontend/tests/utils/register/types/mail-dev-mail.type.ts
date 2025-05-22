export type MailDevEmail = {
  headers: {
    to: string;
    subject: string;
    date: string;
  };
  html: string;
};
