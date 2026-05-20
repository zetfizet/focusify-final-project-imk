import nodemailer from 'nodemailer'
import db from '../utils/dbFacade.js'

// Configure SMTP transport using environment variables
const getTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    // Return null to signify that SMTP credentials are not configured
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  })
}

/**
 * Send weekly progress summary email to a user
 */
export const sendWeeklySummaryEmail = async (user, stats) => {
  const transporter = getTransporter()
  const recipientEmail = user.email

  const title = `Your Focusify Weekly Summary 📈`
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Focusify Weekly Summary</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f7fafc;
            color: #2d3748;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header p {
            margin: 8px 0 0 0;
            color: #a0aec0;
            font-size: 14px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 24px;
          }
          .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-collapse: separate;
            border-spacing: 12px 0;
          }
          .stats-card {
            display: table-cell;
            background: #f7fafc;
            border: 1px solid #edf2f7;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            width: 33.33%;
          }
          .stats-num {
            font-size: 28px;
            font-weight: 700;
            color: #38a169;
            margin-bottom: 4px;
          }
          .stats-label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          .card {
            background: #f8fafc;
            border-left: 4px solid #38a169;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 30px;
          }
          .card-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .card-desc {
            font-size: 14px;
            color: #4a5568;
            line-height: 1.5;
          }
          .btn-container {
            text-align: center;
            margin: 35px 0 15px;
          }
          .btn {
            background-color: #38a169;
            color: #ffffff !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
            box-shadow: 0 2px 4px rgba(56, 161, 105, 0.2);
          }
          .footer {
            background: #f7fafc;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #a0aec0;
            border-top: 1px solid #edf2f7;
          }
          .footer a {
            color: #38a169;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Focusify 🎯</h1>
            <p>Your Weekly Learning Summary Report</p>
          </div>
          <div class="content">
            <div class="greeting">Hi @${user.username || 'user'},</div>
            <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 30px;">
              Fantastic job staying focused this week! Here is a recap of your productivity statistics on Focusify for the past 7 days:
            </p>
            
            <div class="stats-grid">
              <div class="stats-card">
                <div class="stats-num">${stats.totalSessions}</div>
                <div class="stats-label">Sessions</div>
              </div>
              <div class="stats-card">
                <div class="stats-num">${stats.totalHours}h</div>
                <div class="stats-label">Focus Time</div>
              </div>
              <div class="stats-card">
                <div class="stats-num">${stats.avgScore}%</div>
                <div class="stats-label">Avg Score</div>
              </div>
            </div>

            <div class="card">
              <div class="card-title">💡 Productivity Insight</div>
              <div class="card-desc">
                ${stats.totalSessions > 0 
                  ? `Your average focus score of ${stats.avgScore}% demonstrates excellent discipline! Keep maintaining this routine to lock down your learning habits.`
                  : "We noticed you didn't log any focus sessions this week. Let's start fresh next week! Even a 15-minute session can build incredible momentum."
                }
              </div>
            </div>

            <div class="btn-container">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Launch Focusify</a>
            </div>
          </div>
          <div class="footer">
            <p>You received this email because you opted into Weekly Summaries under your account Settings.</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings">Manage Notification Preferences</a></p>
          </div>
        </div>
      </body>
    </html>
  `

  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`[SMTP MOCK] Weekly Summary Email Logged:`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Subject: ${title}`);
    console.log(`Stats:`, stats);
    console.log(`========================================\n`);
    return { success: true, mock: true }
  }

  try {
    await transporter.sendMail({
      from: `"Focusify Team" <${user}>`,
      to: recipientEmail,
      subject: title,
      html: htmlContent
    })
    console.log(`[EMAIL SENT] Weekly Summary dispatched to: ${recipientEmail}`)
    return { success: true, mock: false }
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${recipientEmail}:`, err)
    return { success: false, error: err.message }
  }
}

/**
 * Iterates through all registered users and sends summaries if opted-in
 */
export const runWeeklySummaryReport = async () => {
  console.log('[CRON WORKER] Running weekly summary generator...')
  try {
    const users = await db.findAllUsers ? await db.findAllUsers() : []
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    for (const user of users) {
      const userId = user._id || user.id
      const settings = await db.findSettingsByUserId(userId)

      if (settings && settings.weekly_summary_notifications) {
        const sessions = await db.findSessionsByUserId(userId)
        const weeklySessions = sessions.filter(s => {
          const dt = new Date(s.endTime || s.created_at || s.createdAt)
          return dt >= sevenDaysAgo
        })

        const totalSessions = weeklySessions.length
        const totalMinutes = weeklySessions.reduce((a, s) => a + s.duration, 0)
        const totalHours = (totalMinutes / 60).toFixed(1)
        const avgScore = totalSessions ? Math.round(weeklySessions.reduce((a, s) => a + s.score, 0) / totalSessions) : 0

        await sendWeeklySummaryEmail(user, {
          totalSessions,
          totalHours,
          avgScore
        })
      }
    }
  } catch (err) {
    console.error('[CRON WORKER ERROR] Failed generating weekly summaries:', err)
  }
}

/**
 * Initializes weekly trigger scheduling
 */
export const startWeeklyScheduler = () => {
  // Check once every 24 hours (86400000 ms)
  // To trigger immediately for demo/test, we also run it once on server startup (delayed slightly)
  console.log('[EMAIL SCHEDULER] Weekly Email Summary worker initialized.')
  
  setInterval(async () => {
    const now = new Date()
    // Run weekly on Sunday at 23:00 (11 PM)
    if (now.getDay() === 0 && now.getHours() === 23) {
      await runWeeklySummaryReport()
    }
  }, 3600000) // check every hour
}
