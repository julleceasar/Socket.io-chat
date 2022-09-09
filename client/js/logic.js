const socket = io();

const msgInput = document.getElementById("msgInput");
const msgDiv = document.getElementById("chatThread");
const feedback = document.getElementById("feedback");

const optionsDiv = document.createElement("div");
optionsDiv.setAttribute("id", "optionsDiv");

msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  }

  if (e.key === "/" && msgInput.value.length === 0) {
    optionsDiv.style.display = "flex";
    showCommands();
    return;
  }
});

msgInput.addEventListener("keyup", () => {
  if (msgInput.value == "") {
    optionsDiv.style.display = "none";
    optionsDiv.innerHTML = "";
  }
});

let timer = undefined;

const onInput = (event) => {
  console.log("TEST");

  if (event.target.value.length == 1 && event.target.value === "/") {
    console.log(event.target.value);
    showCommands();
    return;
  }

  if (timer) {
    clearTimeout(timer);
  }

  if (event.target.value.startsWith("/stickers")) {
    timer = setTimeout(() => {
      showGifs(searchStringGenerator(event.target.value));
      timer = undefined;
    }, 400);
  }
  
  if (event.target.value === "/jokes") {
    clearTimeout(timer);
    showJokes();
  }
};

const searchStringGenerator = (rawString) => {
  let stringArray = rawString.split(" ");
  
  let searchText = rawString.substring(rawString.indexOf(" ") + 1);

  if (stringArray.length == 1 || !searchText.length) {
    searchText = "Trending";
  }
  return searchText;
};

document.getElementsByTagName("input")[0].addEventListener("input", onInput);

msgInput.addEventListener("keyup", () => {
  socket.emit("typing", msgInput.value, name);
});

async function showGifs(searchText) {

  if (msgInput.value === '/') {
  msgInput.value = '/stickers'
  searchText = 'Trending'
  }

  
  msgInput.focus()
  optionsDiv.style.flexDirection = "row";
  optionsDiv.style.overflowX = "scroll";
  optionsDiv.style.overflowY = "hidden";
  optionsDiv.style.justifyContent = "unset";

  let url = `http://localhost:3000/gifs/${searchText}`;
  let method = "GET";
  let result = await makeRequest(url, method, undefined);

  optionsDiv.innerHTML = "";
  result.data.forEach((gif) => {
    let gifDiv = document.createElement("div");
    let gifImg = document.createElement("img");
    gifImg.src = gif.images.downsized.url;
    gifDiv.append(gifImg);
    optionsDiv.append(gifDiv);

    gifImg.addEventListener("click", () => {
      let img = true;
      socket.emit("message", gif.images.downsized.url, img);
    });
  });
}

async function showJokes() {
  msgInput.focus()
  if (msgInput.value === "/") {
    msgInput.value = "/jokes";
  }
  let url = `http://localhost:3000/jokes`;
  let method = "GET";
  let result = await makeRequest(url, method);
  optionsDiv.style.flexDirection = "column";
  optionsDiv.style.overflowX = "hidden";
  optionsDiv.style.overflowY = "scroll";
  optionsDiv.style.justifyContent = "unset";
  optionsDiv.innerHTML = "";
  console.log(result);
  result.jokes.forEach((joke) => {
    let jokeDiv = document.createElement("div");
    let jokeText = document.createElement("p");
    jokeText.innerHTML = joke.joke;
    jokeDiv.append(jokeText);
    optionsDiv.append(jokeDiv);
    msgInput.before(optionsDiv);
    jokeText.addEventListener("click", () => {
      socket.emit("message", joke.joke);
    });
  });
}

function showCommands() {
  const gifs = document.createElement("h2");
  const jokes = document.createElement("h2");
  optionsDiv.innerHTML = "";
  gifs.innerText = "/stickers";
  jokes.innerText = "/jokes";
  optionsDiv.append(gifs, jokes);
  msgInput.before(optionsDiv);
  gifs.addEventListener("click", showGifs);
  jokes.addEventListener("click", showJokes);
  optionsDiv.style.flexDirection = "column";
  optionsDiv.style.overflowX = "hidden";
  optionsDiv.style.justifyContent = "center";
}

socket.on("newSocket", (socketId) => {
  console.log("New socket connected: " + socketId);
});

socket.on("message", (data) => {
  console.log(data);
  displayMsgSent(data);
});

socket.on("typing", (data, name) => {
  displayTyping(data, name);
});

socket.on("user-connected", (name) => {
  showConnection(`${name} joined!`);
});

socket.on("user-disconnected", (name) => {
  showConnection(`${name} left!`);
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

const displayMsgSent = (msgToDisplay) => {
  console.log(msgToDisplay);

  if (msgToDisplay.img === true && msgToDisplay.name == name) {
    const msgText = document.createElement("li");
    let img = document.createElement("img");
    let name = document.createElement("p");
    name.innerText = `You:`;
    img.src = msgToDisplay.message;
    msgText.append(name, img);
    feedback.before(msgText);
    msgDiv.scrollTop = msgDiv.scrollHeight;
  }

  if (msgToDisplay.img === true && msgToDisplay.name !== name) {
    const msgText = document.createElement("li");
    let img = document.createElement("img");
    let name = document.createElement("p");
    name.innerText = msgToDisplay.name + ":";
    img.src = msgToDisplay.message;
    msgText.append(name, img);
    feedback.before(msgText);
    msgDiv.scrollTop = msgDiv.scrollHeight;
  }

  if (msgToDisplay.name == name && !msgToDisplay.img) {
    const msgText = document.createElement("li");
    msgText.innerText = `You: ${msgToDisplay.message}`;
    feedback.before(msgText);
    msgDiv.scrollTop = msgDiv.scrollHeight;
  }

  if (msgToDisplay.name !== name && !msgToDisplay.img) {
    const msgText = document.createElement("li");
    msgText.innerText = `${msgToDisplay.name}: ${msgToDisplay.message}`;
    feedback.before(msgText);
    msgDiv.scrollTop = msgDiv.scrollHeight;
  }
};

const name = window.prompt("What is your name?");
showConnection("You joined!");
socket.emit("new-user", name);

function showConnection(data) {
  const msgText = document.createElement("li");
  msgText.innerText = data;
  feedback.before(msgText);
}

const displayTyping = (data, name) => {
  feedback.style.display = "flex";
  feedback.innerText = name + " is typing...";
  console.log(name);

  if (data.length == 0) {
    feedback.style.display = "none";
    feedback.innerText = "";
  }
  msgDiv.scrollTop = msgDiv.scrollHeight;
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
    console.log(result.setup);
    console.log(result.delivery);
    return result;
  } catch (err) {
    console.error(err);
  }
}
