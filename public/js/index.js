const messageTextArea = document.getElementById("messageInput");
const messageSendBtn = document.getElementById("sendButton");
const messagesContainer = document.getElementById("messages");
const openCreateGroupFormBtn = document.getElementById("openCreateGroupForm");
const createGroupForm = document.getElementById("createGroupForm");
const groupForm = document.getElementById("groupForm");
const groupNameInput = document.getElementById("groupName");
const addToGroupBtn = document.getElementById("addToGroup");
let currentGroupId = null;
const openAddToGroupFormBtn = document.getElementById("openAddToGroupForm");
const addToGroupForm = document.getElementById("addToGroupForm");
const addGroupForm = document.getElementById("addGroupForm");
const addGroupNameInput = document.getElementById("addGroupName");
const memberEmailInput = document.getElementById("memberEmail");
// Show the group creation form when "Create Group" button is clicked

const socket = io("http://localhost:4000");

openCreateGroupFormBtn.addEventListener("click", () => {
  createGroupForm.style.display = "block"; // Show form
  openCreateGroupFormBtn.style.display = "none";
});

openAddToGroupFormBtn.addEventListener("click", () => {
  addToGroupForm.style.display = "block"; // Show form
  openAddToGroupFormBtn.style.display = "none"; // Hide button
});

// Handle group creation form submission
groupForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page reload on form submission
  await createGroup(); // Call the createGroup function
  createGroupForm.style.display = "none"; // Hide form after submission
  openCreateGroupFormBtn.style.display = "block";
});

// Handle add-to-group form submission
addGroupForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent form submission from reloading the page
  await addToGroup(); // Call the addToGroup function
  memberEmailInput.value = ""; // Clear the email input field for the next member
});

// Function to create a new group
// Create Group function using form input and adding the creator as the first member
async function createGroup() {
  try {
    const groupName = groupNameInput.value;
    const token = localStorage.getItem("token");

    // Add the creator's email automatically
    const res = await axios.get("http://localhost:4000/user/getUser", {
      headers: { Authorization: token },
    });
    const creatorEmail = res.data.email;
    const members = [creatorEmail]; // Only the creator is added initially

    // Make request to create group with the creator as the initial member
    await axios.post(
      "http://localhost:4000/group/createGroup",
      { groupName, members },
      { headers: { Authorization: token } }
    );

    alert(`${groupName} created successfully!`);
    groupNameInput.value = ""; // Clear the input field
    await getGroups(); // Update group list
  } catch (error) {
    console.log(error);
  }
}
// Function to add users to an existing group
async function addToGroup() {
  try {
    const groupName = addGroupNameInput.value.trim();
    const memberEmail = memberEmailInput.value.trim();
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:4000/group/addToGroup",
      { groupName, members: [memberEmail] }, // Single member in array
      { headers: { Authorization: token } }
    );

    alert(res.data.message);

    // Optionally, update the group list if necessary
    await getGroups();
  } catch (error) {
    console.log("Error adding member to group:", error);
    alert("Failed to add member.");
  }
}
// Function to load and display groups the user is part of
async function getGroups() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:4000/group/getGroups", {
      headers: { Authorization: token },
    });

    // Clear any existing groups from the list
    groups.innerHTML = "";

    // Check if groups are returned in the response
    if (res.data.groups && res.data.groups.length > 0) {
      res.data.groups.forEach((group) => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");

        // Create a span to hold the group name
        const groupElement = document.createElement("span");
        groupElement.textContent = group.name;
        groupElement.classList.add("group-name");
        groupElement.dataset.groupId = group.id; // Store group ID in data attribute

        // Add click event to open group chat
        groupElement.addEventListener("click", () => openGroupChat(group.id));

        li.appendChild(groupElement);
        groups.appendChild(li);
      });
    } else {
      // Handle case where no groups are found
      const noGroupsMessage = document.createElement("p");
      noGroupsMessage.textContent = "You are not part of any groups.";
      groups.appendChild(noGroupsMessage);
    }
  } catch (error) {
    console.error("Error fetching groups:", error);
    alert("Failed to load groups.");
  }
}

// Call the function to load groups on page load
document.addEventListener("DOMContentLoaded", getGroups);

// Function to open and load group chat messages
async function openGroupChat(groupId) {
  if (currentGroupId === groupId) return; // Prevent reloading the same group
  currentGroupId = groupId;
  messagesContainer.innerHTML = ""; // Clear previous messages

  // Remove the 'selected-group' class from all groups
  document.querySelectorAll("#groups .group-name").forEach((groupElement) => {
    groupElement.classList.remove("selected-group");
  });

  // Add the 'selected-group' class to the clicked group
  const selectedGroupElement = document.querySelector(
    `#groups .group-name[data-group-id="${groupId}"]`
  );
  if (selectedGroupElement) {
    selectedGroupElement.classList.add("selected-group");
  }

  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `http://localhost:4000/message/${groupId}/messages`,
      {
        headers: { Authorization: token },
      }
    );
    displayMessages(res.data.messages);
    await loadGroupMembers(groupId);
    // Join the selected group room for real-time updates
    socket.emit("joinGroup", groupId);
  } catch (error) {
    console.log("Error loading group chat messages:", error);
  }
}

// Function to display messages in the chat box
function displayMessages(messages) {
  messagesContainer.innerHTML = "";
  messages.forEach((msg, index) => {
    const messageElement = document.createElement("div");
    //messageElement.classList.add("message-text", msg.name);

    // Make sender name bold and alternate colors
    const senderElement = document.createElement("span");
    senderElement.textContent = `${msg.name}: `;
    senderElement.style.fontWeight = "bold";
    senderElement.style.color = `${msg.id}` % 2 === 0 ? "#1d70b8" : "#008000"; // Alternate colors

    // Add message text after the sender's name
    const messageText = document.createTextNode(msg.message);

    messageElement.appendChild(senderElement);
    messageElement.appendChild(messageText);
    messagesContainer.appendChild(messageElement);
  });
}
// Function to send a new message
async function messageSend() {
  if (!currentGroupId) {
    alert("Please select a group to send a message.");
    return;
  }

  try {
    const message = messageTextArea.value.trim();
    if (!message) return; // Prevent sending empty messages
    const token = localStorage.getItem("token");
    socket.emit("sendMessage", { message, groupId: currentGroupId, token });
    messageTextArea.value = ""; // Clear message input after sending
    await loadNewMessages(); // Refresh messages after sending
  } catch (error) {
    console.log("Error sending message:", error);
  }
}

// Listen for new messages from the server
socket.on("newMessage", (message) => {
  if (message.groupId === currentGroupId) {
    addMessageToLocalStorage(message);
    displayMessagesFromLocalStorage();
  }
});

// Add a new message to localStorage
function addMessageToLocalStorage(message) {
  let messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push(message);
  if (messages.length > 10) {
    messages.shift(); // Keep only the last 10 messages
  }
  localStorage.setItem("messages", JSON.stringify(messages));
}

// Load and display messages from localStorage
function displayMessagesFromLocalStorage() {
  messagesContainer.innerHTML = "";
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.forEach((msg) => {
    //console.log(msg);
    const messageElement = document.createElement("div");
    messageElement.textContent = `${msg.name}: ${msg.message}`;
    messagesContainer.appendChild(messageElement);
  });
}

// Load new messages from the server
async function loadNewMessages() {
  try {
    if (!currentGroupId) return;
    const messages = JSON.parse(localStorage.getItem("messages")) || [];
    const lastMessageId = messages[messages.length - 1]?.id || 0;
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `http://localhost:4000/message/${currentGroupId}/getNewMessages?lastMessageId=${lastMessageId}`,
      { headers: { Authorization: token } }
    );
    const newMessages = response.data;
    newMessages.forEach((msg) => addMessageToLocalStorage(msg));
    displayMessagesFromLocalStorage();
  } catch (error) {
    console.error("Error loading new messages:", error);
  }
}

async function loadGroupMembers(groupId) {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `http://localhost:4000/group/${groupId}/members`,
      {
        headers: { Authorization: token },
      }
    );
    const members = response.data.members;
    displayGroupMembers(members, groupId);
  } catch (error) {
    console.error("Error fetching group members:", error);
  }
}

function displayGroupMembers(members, groupId) {
  const membersContainer = document.getElementById("members");
  membersContainer.innerHTML = ""; // Clear existing members

  members.forEach((member) => {
    const memberItem = document.createElement("li");
    memberItem.classList.add("list-group-item");
    memberItem.textContent = `${member.name}`;

    // "Make Admin" button
    const makeAdminButton = document.createElement("button");
    makeAdminButton.textContent = "Make Admin";
    makeAdminButton.classList.add("btn", "btn-primary", "btn-sm", "mx-2");
    makeAdminButton.onclick = () => makeAdmin(groupId, member.id);

    // "Delete Member" button
    const deleteMemberButton = document.createElement("button");
    deleteMemberButton.textContent = "Delete Member";
    deleteMemberButton.classList.add("btn", "btn-danger", "btn-sm");
    deleteMemberButton.onclick = () => deleteMember(groupId, member.id);

    // Append buttons to the member item
    memberItem.appendChild(makeAdminButton);
    memberItem.appendChild(deleteMemberButton);
    membersContainer.appendChild(memberItem);
  });
}
// Event listeners
//createGroupBtn.addEventListener("click", createGroup);
//addToGroupBtn.addEventListener("click", addToGroup);
messageSendBtn.addEventListener("click", messageSend);
// document.addEventListener("DOMContentLoaded", async () => {
//   displayMessagesFromLocalStorage(); // Display messages from local storage
//   await loadNewMessages(); // Load new messages from server
// });

// Set an interval to load new messages every 10 seconds
//setInterval(loadNewMessages, 10000);

async function makeAdmin(groupId, memberId) {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://localhost:4000/group/${groupId}/makeAdmin`,
      { memberId },
      { headers: { Authorization: token } }
    );
    alert("Member made an admin successfully.");
    loadGroupMembers(groupId); // Refresh the members list
  } catch (error) {
    console.error("Error making member an admin:", error);
    alert("Failed to make member an admin.");
  }
}

// Function to delete a member from the group
async function deleteMember(groupId, memberId) {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(
      `http://localhost:4000/group/${groupId}/member/${memberId}`,
      {
        headers: { Authorization: token },
      }
    );
    alert("Member deleted successfully.");
    loadGroupMembers(groupId); // Refresh the members list
  } catch (error) {
    console.error("Error deleting member:", error);
    alert("Failed to delete member.");
  }
}

// Example of calling the function when switching to a group
// Replace groupId with the ID of the selected group
// loadGroupMembers(groupId);
