import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { userName, userEmail, office } = await req.json();

    // Get all admin users
    const allUsers = await base44.asServiceRole.entities.User.list();
    const admins = allUsers.filter(u => u.role === 'admin' && u.email);

    if (admins.length === 0) {
      return Response.json({ message: 'No admins found, skipping email' });
    }

    // Send email to each admin
    await Promise.all(admins.map(admin =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `New User Registration Pending Approval – ${userName}`,
        body: `
Hello,

A new user has registered for the US WIX Breakfast Hub and is awaiting your approval.

Name: ${userName}
Email: ${userEmail}
Office: ${office || 'Not specified'}

Please log in to the app and go to Analytics & Reporting > Pending User Approvals to approve or reject this user.

Thank you,
US WIX Breakfast Hub
        `.trim()
      })
    ));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});