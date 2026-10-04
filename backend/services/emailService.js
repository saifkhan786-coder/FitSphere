const { Resend } = require("resend");

const resend = new Resend(
    process.env.RESEND_API_KEY
);

async function sendMembershipReminder({
    memberName,
    memberEmail,
    expiryDate,
    isExpired
}) {
    const subject = isExpired
        ? "Your FitSphere membership has expired"
        : "Your FitSphere membership is expiring soon";

    const message = isExpired
        ? `Hi ${memberName},

Your FitSphere gym membership has expired on ${expiryDate}.

Please contact the gym or renew your membership to continue your training.

Thank you,
FitSphere`
        : `Hi ${memberName},

Your gym membership is going to expire on ${expiryDate}.

Please renew your membership before the expiry date to continue your training without interruption.

Thank you,
FitSphere`;

    const { data, error } =
        await resend.emails.send({
            from: "FitSphere <onboarding@resend.dev>",
            to: [memberEmail],
            subject,
            text: message
        });

    if (error) {
        throw new Error(
            error.message ||
            "Failed to send membership reminder"
        );
    }

    return data;
}

module.exports =
    sendMembershipReminder;