import React from "react";

interface Message {
  senderName: string;
  messagePreview: string;
  conversationId: string;
}

interface MessageDigestEmailProps {
  recipientName: string;
  messages: Message[];
  totalUnreadCount: number;
  appUrl: string;
}

export const MessageDigestEmail = ({
  recipientName,
  messages,
  totalUnreadCount,
  appUrl,
}: MessageDigestEmailProps) => {
  return (
    <html>
      <body
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f4f4f4",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#1a1a1a",
              padding: "30px 20px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                color: "#fbbf24",
                margin: "0",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              MAMUN
            </h1>
            <p
              style={{
                color: "#d1d5db",
                margin: "10px 0 0",
                fontSize: "14px",
              }}
            >
              Co-Foundr Matching Platform
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: "40px 30px" }}>
            <h2
              style={{
                color: "#1a1a1a",
                fontSize: "24px",
                marginBottom: "20px",
              }}
            >
              You have {totalUnreadCount} new{" "}
              {totalUnreadCount === 1 ? "message" : "messages"}
            </h2>

            <p
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              Hi {recipientName},
            </p>

            <p
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "1.6",
                marginBottom: "30px",
              }}
            >
              Here&apos;s a summary of your unread messages:
            </p>

            {/* Messages List */}
            <div style={{ marginBottom: "30px" }}>
              {messages.slice(0, 5).map((message, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderLeft: "4px solid #fbbf24",
                    borderRadius: "4px",
                    padding: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <p
                    style={{
                      color: "#1a1a1a",
                      fontSize: "14px",
                      fontWeight: "600",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {message.senderName}
                  </p>
                  <p
                    style={{
                      color: "#374151",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      margin: "0",
                      fontStyle: "italic",
                    }}
                  >
                    &quot;{message.messagePreview}
                    {message.messagePreview.length > 80 ? "..." : ""}&quot;
                  </p>
                </div>
              ))}

              {totalUnreadCount > 5 && (
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  + {totalUnreadCount - 5} more{" "}
                  {totalUnreadCount - 5 === 1 ? "message" : "messages"}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <a
                href={`${appUrl}/messages`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#fbbf24",
                  color: "#1a1a1a",
                  padding: "14px 32px",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                View All Messages
              </a>
            </div>

            <p
              style={{
                color: "#9ca3af",
                fontSize: "14px",
                textAlign: "center",
                marginTop: "30px",
              }}
            >
              You&apos;re receiving this daily digest because you have message
              notifications enabled.
              <br />
              We send these once per day to keep you updated.
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "20px 30px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                color: "#6b7280",
                fontSize: "13px",
                margin: "0 0 10px",
                textAlign: "center",
              }}
            >
              This email was sent from Mamun Co-Foundr. If you have any
              questions, please contact us at{" "}
              <a
                href="mailto:support@mamuncofoundr.com"
                style={{ color: "#fbbf24" }}
              >
                support@mamuncofoundr.com
              </a>
            </p>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "12px",
                margin: "10px 0 0",
                textAlign: "center",
              }}
            >
              © {new Date().getFullYear()} Mamun co-foundr LLC. All rights
              reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};
