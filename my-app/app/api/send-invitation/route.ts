import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, plantName, inviterName, inviterEmail } = await request.json()

    if (!email || !plantName || !inviterName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For testing with Resend, we can only send to the verified email address
    // In production, you would verify your own domain
    const testEmail = 'takekuni@tanemori.org'
    console.log(`Sending test email to ${testEmail} instead of ${email}`)


    // Use fetch to call Resend API directly
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GrowTogether <delivered@resend.dev>',
        to: [testEmail],
        subject: `🌱 You're invited to be a Bloom Buddy for ${plantName}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bloom Buddy Invitation</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
              }
              .container {
                background: white;
                border-radius: 16px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                color: #059669;
                margin-bottom: 10px;
              }
              .tagline {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 20px;
              }
              .plant-emoji {
                font-size: 48px;
                margin: 20px 0;
                text-align: center;
              }
              .invitation-box {
                background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                border: 2px solid #10b981;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .plant-name {
                font-size: 24px;
                font-weight: bold;
                color: #065f46;
                margin-bottom: 10px;
              }
              .inviter-info {
                color: #047857;
                font-size: 18px;
                margin-bottom: 20px;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 18px;
                margin: 20px 0;
                transition: transform 0.2s;
              }
              .cta-button:hover {
                transform: translateY(-2px);
              }
              .features {
                margin: 30px 0;
              }
              .feature {
                display: flex;
                align-items: center;
                margin: 15px 0;
                padding: 15px;
                background: #f9fafb;
                border-radius: 8px;
              }
              .feature-icon {
                font-size: 24px;
                margin-right: 15px;
              }
              .feature-text {
                color: #374151;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .social-proof {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
              }
              .social-proof-text {
                color: #92400e;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🌱 GrowTogether</div>
                <div class="tagline">the app that never lets you grow apart!</div>
              </div>

              <div class="plant-emoji">🌿</div>

              <div class="invitation-box">
                <div class="plant-name">${plantName}</div>
                <div class="inviter-info">
                  ${inviterName}${inviterEmail ? ` (${inviterEmail})` : ''} wants you to be a Bloom Buddy!
                </div>
                <p style="color: #047857; margin: 0;">
                  Join the care team and help keep this virtual plant monster alive and thriving!
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}" class="cta-button">
                  🌱 Join GrowTogether
                </a>
              </div>

              <div class="features">
                <h3 style="color: #065f46; text-align: center; margin-bottom: 20px;">What you can do as a Bloom Buddy:</h3>
                
                <div class="feature">
                  <span class="feature-icon">💧</span>
                  <span class="feature-text">Water the plant to keep it healthy</span>
                </div>
                
                <div class="feature">
                  <span class="feature-icon">🍃</span>
                  <span class="feature-text">Feed it nutrients for growth</span>
                </div>
                
                <div class="feature">
                  <span class="feature-icon">🎮</span>
                  <span class="feature-text">Play with it to boost happiness</span>
                </div>
                
                <div class="feature">
                  <span class="feature-icon">👥</span>
                  <span class="feature-text">Collaborate with other Bloom Buddies</span>
                </div>
              </div>

              <div class="social-proof">
                <div class="social-proof-text">
                  "GrowTogether has brought our friend group closer together! 
                  We love taking care of our virtual plant as a team." 
                  <br><strong>- Happy Bloom Buddies</strong>
                </div>
              </div>

              <div class="footer">
                <p>This invitation was sent by ${inviterName} through GrowTogether.</p>
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p style="margin-top: 20px;">
                  <strong>GrowTogether</strong> - Keeping friendships blooming, one plant at a time 🌱
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API error:', errorData)
      return NextResponse.json(
        { error: `Failed to send email: ${errorData.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    const data = await response.json()

    return NextResponse.json(
      { 
        success: true, 
        messageId: data?.id,
        message: `Invitation email sent successfully to ${testEmail}! (Test mode - in production this would go to ${email})` 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Email invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}