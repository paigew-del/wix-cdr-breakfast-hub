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
        body: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
  <div style="background:#101585;padding:24px 32px;text-align:center;">
    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px;">WIX</span>
    <span style="color:rgba(255,255,255,0.5);margin:0 10px;">|</span>
    <span style="color:rgba(255,255,255,0.85);font-size:14px;">US Breakfast Hub</span>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#101585;margin:0 0 12px;">New User Pending Approval</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;">Hello,</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;">A new user has registered for the <strong>US WIX Breakfast Hub</strong> and is awaiting your approval.</p>
    <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Name:</strong> ${userName}</p>
      <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Email:</strong> ${userEmail}</p>
      <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Office:</strong> ${office || 'Not specified'}</p>
    </div>
    <p style="color:#374151;font-size:15px;line-height:1.6;">Please log in to the app and go to the <strong>Admin Dashboard</strong> to approve or reject this user.</p>
  </div>
  <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">US WIX Breakfast Hub · Wix</p>
  </div>
</div>`
      })
    ));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});