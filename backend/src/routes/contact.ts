import { Request, Response } from "express";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "VOTRE_ADRESSE@gmail.com",       // A configurer
    pass: "VOTRE_MOT_DE_PASSE_APPLICATION", // A configurer
  },
});

const DEST_EMAIL = "contact@hjr-consulting.fr";

export async function sendContactMessage(req: Request, res: Response): Promise<void> {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "Tous les champs sont requis." });
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${name}" <${DEST_EMAIL}>`,
      replyTo: email,
      to: DEST_EMAIL,
      subject: `[Contact site] ${subject}`,
      text: `De: ${name} (${email})\n\n${message}`,
      html: `<p><strong>De :</strong> ${name} (${email})</p><p>${message}</p>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur envoi email:", err);
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
}
