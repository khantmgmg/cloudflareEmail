// import { EmailMessage } from "cloudflare:email";
// import { createMimeMessage } from "mimetext";

// const PostalMime = require("postal-mime");

async function extractEmailData(rawEmail) {
  console.log("Raw email: ", rawEmail);
  const headers = {};
  let sender = '';
  let recipient = '';
  let subject = '';
  let textBody = '';
  let htmlBody = '';

  // Split the email into lines
  const lines = rawEmail.split('\n');

  // Parse headers
  let headerParsingComplete = false;
  for (const line of lines) {
    if (line.trim() === '') {
      headerParsingComplete = true;
      continue; // End of headers, start of body
    }

    if (!headerParsingComplete) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const headerName = line.substring(0, colonIndex).trim().toLowerCase();
        const headerValue = line.substring(colonIndex + 1).trim();
        headers[headerName] = headerValue;
      }
    } else {
        //handle email body
        if (line.startsWith('--')) continue;
        if (textBody === '' && !line.startsWith('<')) {
          textBody += line + "\n";
        }
        if (line.startsWith('<')) {
          htmlBody += line + "\n";
        }
    }
  }

  
  sender = headers['from'] || '';
  recipient = headers['to'] || '';
  subject = headers['subject'] || '';

  return {
    sender,
    recipient,
    subject,
    textBody: textBody.trim(),
    htmlBody: htmlBody.trim()
  };
}

// async function streamToArrayBuffer(stream, streamSize) {
//   let result = new Uint8Array(streamSize);
//   let bytesRead = 0;
//   const reader = stream.getReader();
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) {
//       break;
//     }
//     result.set(value, bytesRead);
//     bytesRead += value.length;
//   }
//   return result;
// }


export default {
  async email(message, env, ctx) {

    // Read email body as a string
    const bodyText = await new Response(message.raw).text();
    const data = await extractEmailData(bodyText);
    console.log("Email is as follows:")
    console.log(JSON.stringify(data));

    const telegramBotToken = env.TELEGRAM_BOT_TOKEN; // Store your bot token in Cloudflare Worker Environment Variables
    const telegramChatId = env.TELEGRAM_CHAT_ID;     // Store your Telegram channel or chat ID

    if (!telegramBotToken || !telegramChatId) {
      console.error("Telegram Bot Token or Chat ID not configured in environment variables.");
      return;
    }
    // const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize);
    // // const subject = message.headers.get("Subject") || "No Subject";
    // // const sender = message.from;
    // // const body = await message.raw; // Or message.raw() for the full email content

    // // const telegramMessage = `New Email Received:\n\nFrom: ${sender}\nSubject: ${subject}\n\n${body}`;
    // const telegramMessage = rawEmail;
    // console.log(message.text());
    // const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    // try {
    //   const response = await fetch(telegramApiUrl, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       chat_id: telegramChatId,
    //       text: telegramMessage,
    //     }),
    //   });

    //   if (!response.ok) {
    //     console.error(`Failed to send Telegram message: ${response.status} - ${response.statusText}`);
    //     const errorText = await response.text();
    //     console.error("Telegram API Error:", errorText);
    //   } else {
    //     console.log("Email forwarded to Telegram successfully!");
    //   }
    // } catch (error) {
    //   console.error("Error sending Telegram message:", error);
    // }
  },
};