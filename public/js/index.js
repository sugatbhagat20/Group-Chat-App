const messageTextArea = document.getElementById("messageInput");
const messageSendBtn = document.getElementById("sendButton");
const messagesContainer = document.getElementById("messages");

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
// document.addEventListener("DOMContentLoaded", async () => {
//   await loadMessages();
// });

setInterval(() => {
  loadNewMessages();
}, 10000);

function addMessageToLocalStorage(message) {
  let messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push(message);
  if (messages.length > 10) {
    messages.shift(); // Remove the oldest message if more than 10
  }
  localStorage.setItem("messages", JSON.stringify(messages));
}

function displayMessages() {
  messagesContainer.innerHTML = "";
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.forEach((msg) => {
    const messageElement = document.createElement("p");
    messageElement.textContent = `${msg.name}: ${msg.message}`;
    messagesContainer.appendChild(messageElement);
  });
}

messageSendBtn.addEventListener("click", messageSend);

document.addEventListener("DOMContentLoaded", async () => {
  displayMessages(); // Display messages from local storage
  await loadNewMessages(); // Load new messages from server
});

async function loadNewMessages() {
  try {
    const messages = JSON.parse(localStorage.getItem("messages")) || [];
    const lastMessageId = messages[messages.length - 1]?.id || 0;

    const response = await axios.get(
      `http://localhost:4000/message/getNewMessages?lastMessageId=${lastMessageId}`
    );
    const newMessages = response.data;

    newMessages.forEach((msg) => addMessageToLocalStorage(msg));
    displayMessages();
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}
