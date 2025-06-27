export const sendEmail = async (to: string, subject: string, html: string) => {
    console.log(`📬 Email sent to ${to}:\nSubject: ${subject}\n\n${html}`);
};
  