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
