import { createTransport } from 'nodemailer';

import { Article } from './article.model';


export async function sendEmail(article: Article) {
    
    const transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: !!process.env.MAIL_SECURE,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    });
    
    const info = await transporter.sendMail({
        from: `"Main Post Scraper 🏘" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_TARGET,
        subject: process.env.MAIL_SUBJECT,
        html: `
            <h3>${article.title}</h3>
            <p>${article.date}: ${article.description}</p>
            <small>Unique ID: ${article.uniqueKey}</small>
        `
    });

    console.log(`Notified user about the new article.`);
}
