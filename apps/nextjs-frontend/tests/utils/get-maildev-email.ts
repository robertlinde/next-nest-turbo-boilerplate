import {type MailDevEmail} from './register/types/mail-dev-mail.type.ts';

// Get email
export const getMaildevEmail = async (
  emailAddress: string,
  options?: {
    maxAttempts?: number;
    initialDelay?: number;
    subject?: string;
  },
): Promise<MailDevEmail> => {
  const {maxAttempts = 10, initialDelay = 1000, subject} = options ?? {};

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const delay = initialDelay * 1.5 ** attempts;

    // eslint-disable-next-line no-await-in-loop
    const mailDevResponse = await fetch(`${process.env.NEXT_PUBLIC_MAILDEV_API_URL}/email`); // eslint-disable-line n/prefer-global/process
    if (!mailDevResponse.ok) {
      throw new Error(`Failed to fetch emails from MailDev: ${mailDevResponse.statusText}`);
    }

    // eslint-disable-next-line no-await-in-loop
    const emails = (await mailDevResponse.json()) as MailDevEmail[];

    // Filter emails by recipient
    const foundEmail = emails.find((email) => {
      const subjectMatch = subject ? email.headers.subject === subject : true;

      return email.headers.to === emailAddress && subjectMatch;
    });

    if (foundEmail) {
      return foundEmail;
    }

    if (attempts < maxAttempts - 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, delay);
      });
    }
  }

  throw new Error(`Verification email not found after ${maxAttempts} attempts`);
};
