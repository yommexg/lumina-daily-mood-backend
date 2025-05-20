import transporter from "./transporter";

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"Lumina" <no-reply@lumina.com>',
    to: email,
    subject: "Verify your Lumina account",
    html: `<p>Click the link to verify your account: <a href="${url}">${url}</a></p>`,
  });
};
