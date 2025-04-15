const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');

const app = express();

// 配置Gmail傳輸器
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// 限制請求頻率
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 5 // 每個IP 5次請求
});
app.use(limiter);

// 防止郵件濫發
const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1小時
    max: 3, // 每個IP 3次
    message: '提交過於頻繁，請稍後再試'
});
app.use('/submit', emailLimiter);

// 防止XSS攻擊
app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// 防止垃圾郵件
app.use((req, res, next) => {
    const { email } = req.body;
    if (email.includes('spam')) {
        return res.status(403).json({ error: '非法提交' });
    }
    next();
});

// 發送驗證郵件給客戶
const sendClientConfirmation = async (clientEmail, formData) => {
    const mailOptions = {
        from: `"御信理財" <${process.env.EMAIL_USER}>`,
        to: clientEmail,
        subject: '您的貸款諮詢已收到',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                <h2 style="color: #2b6cb0;">感謝您的諮詢！</h2>
                <p>以下是您提交的資料：</p>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #1e293b;">申請摘要</h3>
                    <ul>
                        <li>姓名：${formData.name}</li>
                        <li>電話：${formData.phone}</li>
                        <li>需求金額：${formData.amount}萬元</li>
                        <li>貸款類型：${formData.loanType || '未指定'}</li>
                    </ul>
                </div>

                <p style="margin-top: 20px;">
                    專員將於24小時內與您聯繫，如需緊急協助請撥打：<br>
                    <a href="tel:0800-888-888">0800-888-888</a>
                </p>
            </div>
        `,
        attachments: [{
            filename: 'application-summary.pdf',
            content: generatePDF(formData),
            contentType: 'application/pdf'
        }]
    };

    await transporter.sendMail(mailOptions);
};

const generatePDF = (formData) => {
    const doc = new PDFDocument();
    let buffers = [];
    
    doc.font('Helvetica-Bold').fontSize(18).text('申請摘要', { align: 'center' });
    doc.moveDown();
    
    doc.font('Helvetica').fontSize(12)
       .text(`姓名：${formData.name}`)
       .text(`電話：${formData.phone}`)
       .text(`金額：${formData.amount}萬元`)
       .text(`類型：${formData.loanType || '未指定'}`);
    
    doc.end();
    
    doc.on('data', buffers.push.bind(buffers));
    return Buffer.concat(buffers);
};

// 處理表單提交
app.post('/submit-form', async (req, res) => {
    const { name, email, phone, amount } = req.body;

    try {
        // 發送給管理員
        await transporter.sendMail({
            from: `"網站表單" <${process.env.GMAIL_USER}>`,
            to: 'makerich88888@gmail.com',
            subject: `新諮詢申請 - ${name}`,
            html: `
                <h3>客戶資訊</h3>
                <ul>
                    <li>姓名: ${name}</li>
                    <li>郵件: ${email}</li>
                    <li>電話: ${phone}</li>
                    <li>金額: ${amount}萬元</li>
                </ul>
            `
        });

        // 發送確認信給客戶
        await transporter.sendMail({
            from: `"御信理財" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: '您的諮詢已收到',
            text: `尊敬的${name}，我們已收到您的諮詢請求...`
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('郵件發送失敗:', error);
        res.status(500).json({ error: '發送失敗' });
    }
});

// 追蹤路由
app.get('/track/:id', (req, res) => {
    const trackingId = req.params.id;
    console.log(`申請進度查詢：${trackingId}`);
    
    // 記錄到資料庫
    db.query('UPDATE applications SET last_viewed = NOW() WHERE tracking_id = ?', [trackingId]);
    
    res.redirect('/status?tracking=' + trackingId);
}); 