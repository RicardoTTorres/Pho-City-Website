import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send("HI FROM SERVER!")
})

app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
        return res.status(400).json({success: false, error: 'All fields are required' })
    }

    try {
        const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',  
        port: 587,
        secure: false,           
        auth: {
            user: process.env.GMAIL_USER,       
            pass: process.env.GMAIL_PASS          
        },
    })

    await transporter.sendMail({
        from:  process.env.GMAIL_USER,                       
        to: process.env.GMAIL_USER,       
        subject: `Contact from ${name}`,
        text: message,
    })

    res.status(200).json({success: true, message : 'Email sent!'})
} catch (err) {
    console.error('Error sending email:', err)
    res.status(500).json({ success: false, error: 'Failed to send email' })
}
})

app.listen(PORT, ()=>{
console.log(`Server running on port ${PORT}`)

})