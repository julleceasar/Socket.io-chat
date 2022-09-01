const socket = io();

const msgInput = document.getElementById('msgInput')
const msgDiv = document.getElementById('chatThread')


msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault()
        sendMsg()
    }

    if (e.key === '/' && msgInput.value.length === 0) {
        test()
    }
})




async function test() {
    let url = `http://localhost:3000/test`
    let method = "GET"
    let result = await makeRequest(url, method, undefined)
    console.log(result)
}

socket.on("newSocket", (socketId) => {
    console.log('New socket connected: ' + socketId)
})

socket.on('message', (data) => {
    msgDiv.scrollTop = msgDiv.scrollHeight;
    displayMsg(data)
})


const sendMsg = () => {

    if(msgInput.value == '') {
        return
    } else {
        socket.emit('message', msgInput.value)
        msgInput.value = ''
        console.log(msgInput.value);
    }
}

const displayMsg = (msgToDisplay) => {
    console.log(msgToDisplay);
    const msgText = document.createElement('li')
    msgText.innerText = msgToDisplay
    msgDiv.append(msgText)
}


async function makeRequest(url, method, body) {
    try {
        let response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body
        })
        let result = await response.json()
        return result;

    } catch (err) {
        console.error(err);
    }
}