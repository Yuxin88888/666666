const nodemailer = require('nodemailer');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// 創建郵件傳輸器
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 限制請求頻率
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 5 // 每個IP 5次請求
});
app.use(limiter);

// 防止XSS攻擊
app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// 發送驗證郵件給客戶
const sendClientConfirmation = async (email) => {
    const confirmationCode = Math.floor(100000 + Math.random() * 900000);
    
    await transporter.sendMail({
        to: email,
        subject: '御信理財-表單提交確認',
        html: `您的驗證碼是：<strong>${confirmationCode}</strong>`
    });
    
    return confirmationCode;
};

app.post('/submit', async (req, res) => {
    // ...原有驗證邏輯
    
    const { name, phone, amount, loanType, time } = req.body;

    // 郵件內容配置
    const mailOptions = {
        from: `"御信理財系統" <${process.env.EMAIL_USER}>`,
        to: 'makerich88888@gmail.com', // 修改收件地址
        subject: `[新諮詢] ${name} - ${amount}萬元 ${loanType}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                <h2 style="color: #2b6cb0; border-bottom: 2px solid #2b6cb0; padding-bottom: 10px;">
                    新的貸款諮詢申請
                </h2>
                
                <div style="margin: 20px 0; background: #f8fafc; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #1e293b; margin-top: 0;">客戶基本資料</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li>📌 姓名：${name}</li>
                        <li>📱 手機：<a href="tel:${phone}">${phone}</a></li>
                        <li>💰 需求金額：<strong style="color: #3b82f6;">${amount} 萬元</strong></li>
                    </ul>
                </div>

                <div style="margin: 20px 0; background: #f8fafc; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #1e293b; margin-top: 0;">貸款細節</h3>
                    <p>🏦 貸款類型：${loanType || '未選擇'}</p>
                    <p>⏰ 方便聯絡時間：${time.join(', ') || '未指定'}</p>
                </div>

                <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="color: #b45309; margin: 0;">
                        ⚠️ 此為系統自動發送郵件，請於24小時內聯繫客戶
                    </p>
                </div>
            </div>
        `,
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
        },
        text: `
            客戶姓名：${name}
            聯絡電話：${phone}
            需求金額：${amount}萬元
            貸款類型：${loanType}
            方便時間：${time.join(', ')}
            提交時間：${new Date().toLocaleString()}
        `,
        attachments: [{
            filename: `申請摘要_${name}.pdf`,
            content: PDFBuffer,
            contentType: 'application/pdf'
        }]
    };

    // 在郵件中添加追蹤像素
    const trackingId = uuidv4();
    mailOptions.html += `
        <img src="https://api.yourdomain.com/track/${trackingId}" 
             alt="" 
             style="display:none;" 
             aria-hidden="true">
    `;

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (error) {
        console.error('郵件發送失敗:', error);
        res.status(500).json({ error: '郵件發送失敗' });
    }
});

// 追蹤路由
app.get('/track/:id', (req, res) => {
    console.log(`郵件已開啟：${req.params.id}`);
    res.status(204).end();
}); 