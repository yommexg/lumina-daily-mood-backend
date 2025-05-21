import transporter from "./transporter";

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
) => {
  const url = `${process.env.PRO_FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"Lumina" <no-reply@lumina.com>',
    to: email,
    subject: "Verify your Lumina account",
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              background-color: #f4f4f9;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .logo {
              display: block;
              margin: 0 auto 20px;
            }
            h1 {
              color: #6C63FF;
              text-align: center;
            }
            p {
              font-size: 16px;
              line-height: 1.5;
            }
            a {
              color: #6C63FF;
              text-decoration: none;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Reference logo using 'cid' for embedded images -->
            <img src="cid:icon" alt="Lumina Logo" class="logo" width="150" />
            <h1>Welcome to Lumina, ${name}!</h1>
            <p>Thank you for registering with Lumina! Please click the link below to verify your email address:</p>
            <p><a href="${url}">${url}</a></p>
            <p>If you did not sign up for a Lumina account, please ignore this email.</p>
            <div class="footer">
              <p>— The Lumina Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    attachments: [
      {
        filename: "icon.png",
        path: "./public/assets/icon.png",
        cid: "icon",
      },
    ],
  });
};
