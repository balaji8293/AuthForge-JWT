const dotenv = require("dotenv");
const path = require("path")
dotenv.config(
    {
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
        // path: ".env.production"
    }
);
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const db = require("./db");
const sendOTPEmail = require("./verificationServices/emailService");
const sendOTPSMS = require("./verificationServices/smsService");
const { default: auth } = require("./middleware/auth");


// Allow request url's
app.use(cors({
    origin:[ 
        "http://localhost:3000",

    ],
    credentials: true
}))

app.use(express.json());

// helper functions start
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
// helper functions end
// simple API to test DB
app.get("/users", async (req, resp) => {
    try {
        const [rows] = await db.query("SELECT * FROM users")
        resp.send(rows);
    } catch (error) {
          console.error("DB ERROR:", error);
        resp.status(500).json({
            success: false,
            message: error.message
          });
}
});

app.post("/register", async (req, resp) => {
    let SALT_ROUNDS = 10;
    try {
        console.log(req?.body, 'res data')
        const { name, email, password, mobile } = req.body;
        const now = new Date();
        const encryptedPass = await bcrypt.hash(password, SALT_ROUNDS);
        const [userResult] = await db.query("INSERT INTO users (name,email,mobile,password) VALUES (?,?,?,?)", [name, email, mobile, encryptedPass]);

        //creating otp and storing into db. 
        const otp = generateOTP();
        const expireAt = new Date(Date.now() + 10 * 60 * 1000);
        await db.query("INSERT INTO otp_requests (email,mobile,otp,expires_at,last_sent_at) VALUES (?,?,?,?,?)", [email, mobile, otp, expireAt, now]);
        await sendOTPEmail(email, otp);
        // for sending otp on mobile
        // await sendOTPSMS(mobile, otp, name);
        resp?.status(200).json({ message: 'User created success,please verify otp for account activation.' })
    } catch (error) {
        console.error("register error", error);
        return resp.status(500).json({ success: false, message: 'something went wrong' })
    }
})

app.post("/verifyOtp", async (req, resp) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return resp.status(500).json({ success: false, message: 'email and otp are required' })
        }
        const [rows] = await db.query("SELECT * FROM otp_requests where email = ?", [email])
        if (rows.length === 0) {
            return resp.status(400).json({ success: false, message: 'otp not found,please resend otp.' })
        }
        console.log(rows, rows[0]?.otp, otp, '-rows user');

        if (new Date(rows[0].expires_at) < new Date()) {
            return resp.status(400).json({ error: "OTP expired" });
        }

        if (String(rows[0]?.otp) == String(otp)) {
            db.query(`UPDATE users SET isVerified = 1 WHERE email=?`, [email])
            db.query(`DELETE FROM otp_requests WHERE id=?`, [rows[0].id])
            resp?.status(200).json({ message: 'email veified success.' })
        } else {
            return resp.status(500).json({ success: false, message: 'invalid otp' })
        }

    } catch (error) {
        console.error("otp not verified", error);
        return resp.status(500).json({ success: false, message: 'otp not verified' })
    }
})
app.post("/resendOtp", async (req, resp) => {
    try {

        const { email, mobile } = req.body;

        if (!email) {
            return resp.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const [userRows] = await db.query(
            "SELECT isVerified FROM users WHERE email = ?",
            [email]
        );

        if (userRows.length === 0) {
            return resp.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (userRows[0].isVerified === 1) {
            return resp.status(400).json({
                success: false,
                message: "User already verified"
            });
        }

        const [rows] = await db.query("SELECT * FROM otp_requests WHERE email=?", [email]);
        const otp = generateOTP();
        const expireAt = new Date(Date.now() + 10 * 60 * 1000);
        const now = new Date();
        console.log(rows[0], rows.length, '-rows')

        if (rows[0]?.resend_count >= 3) {
            return resp.status(429).json({
                success: false,
                message: "OTP resend limit exceeded. Try again later."
            });
        }

        // Cooldown check (60 sec)
        if (rows[0]?.last_sent_at) {
            const diffSeconds =
                (now - new Date(rows[0]?.last_sent_at)) / 1000;

            if (diffSeconds < 60) {
                return resp.status(429).json({
                    success: false,
                    message: `Please wait ${Math.ceil(
                        60 - diffSeconds
                    )} seconds before resending OTP`
                });
            }
        }

        if (rows.length > 0) {
            await sendOTPEmail(email, otp);
            await db.query("UPDATE otp_requests SET otp = ?, expires_at =?,last_sent_at=? WHERE email =?", [otp, expireAt, now, email]);
            resp?.status(200).json({ success: true, message: 'OTP Send successfully!' })
        } else {
            // return resp.status(400).json({ success: false, message: 'otp not found,please resend otp.' })
            await db.query("INSERT INTO otp_requests (email,mobile,otp,expires_at,last_sent_at) VALUES (?,?,?,?,?)", [email, mobile, otp, expireAt, now]);
            resp?.status(200).json({ success: true, message: 'OTP Send successfully!' })
        }
    } catch (error) {
        console.error("otp send error", error);
        return resp.status(500).json({ success: false, message: 'something went wrong' })
    }
})

app.post("/login", async (req, resp) => {
    try {

        const { email, password } = req.body;
        if (!email || !password) {
            return resp.status(400).json({ success: false, message: "email and password is required!" })
        }

        const [userrows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (userrows?.length > 0) {
            if (!userrows[0]?.isVerified) {
                return resp.status(403).json({ success: false, message: 'email is not verified!' })
            }
            const isMatch = await bcrypt.compare(password, userrows[0]?.password);

            if (!isMatch) {
                return resp.status(401).json({ success: false, message: 'invalid crediantials please try again later!' })
            }
            console.log(userrows, '-userRows')
            const token = jwt.sign(
                {
                    userId: userrows[0].id,
                    email: userrows[0].email
                },
                "ILoveYou!",    //"MY_SECRET_KEY",
                { expiresIn: "1d" }
            );

            return resp.status(200).json({
                success: true,
                message: "Login successful",
                token
            });
            // if (userrows[0]?.password === password) {
            //     return resp.status(200).json({
            //         success: true,
            //         message: "Login successful",
            //         user: {
            //             id: userrows[0]?.id,
            //             name: userrows[0]?.name,
            //             email: userrows[0]?.email
            //         }
            //     });
            // } else {
            //     return resp.status(401).json({ success: false, message: 'invalid crediantials please try again later!' })
            // }

        } else {
            return resp.status(404).json({ success: false, message: 'user not found.' })
        }
    } catch (error) {
        console.error("otp send error", error);
        return resp.status(500).json({ success: false, message: 'something went wrong' })
    }
})

app.get("/profile", auth, async (req, res) => {
    const { userId } = req.user;

    const [rows] = await db.query(
        "SELECT id, name, email FROM users WHERE id = ?",
        [userId]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
});


const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
console.log("==== ENV CHECK ====");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("===================");
});

