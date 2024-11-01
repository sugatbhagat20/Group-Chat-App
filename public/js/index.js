const messageTextArea = document.getElementById("messageInput");
const messageSendBtn = document.getElementById("sendButton");
async function messageSend() {
  try {
    const message = messageTextArea.value;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:4000/message/sendMessage",
      {
        message: message,
      },
      { headers: { Authorization: token } }
    );
  } catch (error) {
    console.log(error);
  }
}
messageSendBtn.addEventListener("click", messageSend);

// index.js
document.addEventListener("DOMContentLoaded", async () => {
  await loadMessages();
});

async function loadMessages() {
  try {
    const response = await axios.get(
      "http://localhost:4000/message/getAllMessages"
    );
    const messages = response.data;

    const messagesContainer = document.getElementById("messages");
    messagesContainer.innerHTML = ""; // Clear existing messages

    // Display each message
    messages.forEach((msg) => {
      const messageElement = document.createElement("p");
      messageElement.textContent = `${msg.name}: ${msg.message}`;
      messagesContainer.appendChild(messageElement);
    });
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}
