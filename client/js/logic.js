const socket = io();

const msgInput = document.getElementById("msgInput");
const msgDiv = document.getElementById("chatThread");
const feedback = document.getElementById("feedback");

msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  }

  if (e.key === "/" && msgInput.value.length === 0) {
    test();
  }
});

msgInput.addEventListener("keyup", () => {
  socket.emit("typing", msgInput.value);
});

async function test() {
  let url = `http://localhost:3000/test`;
  let method = "GET";
  let result = await makeRequest(url, method, undefined);
  console.log(result);
}

socket.on("newSocket", (socketId) => {
  console.log("New socket connected: " + socketId);
});

socket.on("message", (data) => {
  console.log(data);

  if (data.name === name) {
    displayMsgSent(`You: ${data.message}`);
  } else {
    displayMsgSent(`${data.name}: ${data.message}`);
  }
});

socket.on("typing", (data) => {
  displayTyping(data);
});

socket.on("user-connected", (name) => {
  displayMsgSent(`${name} joined!`);
});

socket.on("user-disconnected", (name) => {
  displayMsgSent(`${name} left!`);
});

const sendMsg = () => {
  if (msgInput.value == "") {
    return;
  } else {
    socket.emit("message", msgInput.value);
    msgInput.value = "";
    console.log(msgInput.value);
  }
};

const receiveMsg = () => {
  if (msgInput.value == "") {
    return;
  } else {
    socket.emit("message", msgInput.value);
    msgInput.value = "";
    console.log(msgInput.value);
  }
};

const displayMsgSent = (msgToDisplay) => {
  console.log(msgToDisplay);
  const msgText = document.createElement("li");
  msgText.innerText = msgToDisplay;
  feedback.before(msgText);
  msgDiv.scrollTop = msgDiv.scrollHeight;
};

const name = window.prompt("What is your name?");
displayMsgSent("You joined!");
socket.emit("new-user", name);

const displayTyping = (data) => {
  feedback.style.display = "flex";
  feedback.innerText = "User is typing...";
  console.log(data);

  if (data.length == 0) {
    feedback.style.display = "none";
    feedback.innerText = "";
  }
};

async function makeRequest(url, method, body) {
  try {
    let response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    let result = await response.json();
    return result;
  } catch (err) {
    console.error(err);
  }
}
