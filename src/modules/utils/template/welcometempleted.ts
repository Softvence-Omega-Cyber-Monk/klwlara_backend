export const welcomeEmailTemplate = (
  name: string,
  email: string,
  joinDate: string,
  password: string,
) => `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #4CAF50; text-align: center;">Welcome to Our Community, ${name} 🎉</h2>
      
      <p style="font-size: 16px; color: #555; margin-top: 20px;">
        We’re thrilled to have you on board! Your account has been successfully created, and you’re now part of a growing family that values innovation, trust, and connection.
      </p>

      <div style="margin-top: 25px; background-color: #f1f1f1; padding: 20px; border-radius: 6px;">
        <p style="font-size: 15px; color: #333; margin: 5px 0;"><strong>Name:</strong> ${name}</p>
        <p style="font-size: 15px; color: #333; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
        <p style="font-size: 15px; color: #333; margin: 5px 0;"><strong>Password:</strong> <span style="background-color: #e8f5e9; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${password}</span></p>
        <p style="font-size: 15px; color: #333; margin: 5px 0;"><strong>Join Date:</strong> ${joinDate}</p>
      </div>

      <p style="font-size: 15px; color: #555; margin-top: 25px;">
        For your security, please consider updating your password after logging in for the first time.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="#" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started</a>
      </div>

      <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">
        You joined us on <strong>${joinDate}</strong>. We’re glad you’re here! 💚
      </p>
    </div>
  </div>
`;
