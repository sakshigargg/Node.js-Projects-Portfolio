const socket = io('http://localhost:5000')
// const moment = require('moment');

const clientsTotal = document.getElementById('clients-total');
const nameInput = document.getElementById('name-input');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const privateChatButton = document.getElementById('privateChatButton');
const groupChatButton = document.getElementById('groupChatButton');
const sendButton = document.getElementById('send-button');
let currentWindow = 'start'

socket.on('clients-total', (data) => {
    clientsTotal.innerHTML = ` Total clients: ${data}`;
})

privateChatButton.addEventListener('click', (e) => {
    if (currentWindow === 'start') {
        sendButton.style.backgroundColor = '#c6c6ca'
        sendButton.disabled = false;
        messageInput.disabled = false;
        document.querySelectorAll('li.first-time').forEach((element) => {
            element.parentNode.removeChild(element);
        })
        // document.querySelector('li.first-time').parentNode.removeChild(document.querySelector('li.first-time'))
    }
    privateChatButton.style.backgroundColor = '#c6c6ca'
    groupChatButton.style.backgroundColor = '#fff'
    socket.emit('join-private-chat', nameInput.value);
    clientsTotal.innerHTML = ` Total clients: 1`;
    currentWindow = 'private'
    e.preventDefault();
})


groupChatButton.addEventListener('click', (e) => {
    if (currentWindow === 'start') {
        sendButton.style.backgroundColor = '#c6c6ca'
        sendButton.disabled = false;
        messageInput.disabled = false;
        document.querySelectorAll('li.first-time').forEach((element) => {
            element.parentNode.removeChild(element);
        })
    }
    groupChatButton.style.backgroundColor = '#c6c6ca'
    privateChatButton.style.backgroundColor = '#fff'

    socket.emit('group-total', 1);
    currentWindow = 'group'
    e.preventDefault();

})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
})

function sendMessage() {
    if (messageInput.value === '') return
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date()
    }
    if (currentWindow === 'private') {
        socket.emit('private-chat-message', data);
    }
    else if (currentWindow === 'group') {
        socket.emit('message', data);
    }
    // socket.emit('message', data)
    addMessageToUI(true, data);
    messageInput.value = '';

}

socket.on('chat-message', (data) => {
    addMessageToUI(false, data);
})

// socket.on('private-chat-message', (data) => {
//     addMessageToUI(false, data);
// })


function addMessageToUI(isOwnMessage, data) {
    clearPreviousFeedBack()
    let elemnt;
    if (currentWindow === 'private') {
        elemnt = `<li class= ${isOwnMessage ? "message-right" : "message-left"}>
        <p class="message">
            ${data.message}
            <span>${data.name} ⚪ ${moment(data.dateTime).fromNow()}</span>
            <span> 🔏 self-chat </span>
         </p>
        </li>`
    }
    else{
        if (currentWindow === 'start') {
            sendButton.style.backgroundColor = '#c6c6ca'
            sendButton.disabled = false;
            messageInput.disabled = false;
            document.querySelectorAll('li.first-time').forEach((element) => {
                element.parentNode.removeChild(element);
            })
            // document.querySelector('li.first-time').parentNode.removeChild(document.querySelector('li.first-time'))
        }
        elemnt = `<li class= ${isOwnMessage ? "message-right" : "message-left"}>
    <p class="message">
        ${data.message}
        <span>${data.name} ⚪ ${moment(data.dateTime).fromNow()}</span>
     </p>
    </li>`
    }

    messageContainer.innerHTML += elemnt;
}


function scrollToBottom() {
    messageContainer.scroll(0, messageContainer.scrollHeight);
}


messageInput.addEventListener('focus', (e) => {
    if (currentWindow === 'group')
        socket.emit('feedback', `🖊️ ${nameInput.value} is typing a message...`);
});

messageInput.addEventListener('keypress', (e) => {
    if (currentWindow === 'group')
        socket.emit('feedback', `🖊️ ${nameInput.value} is typing a message...`);
});

messageInput.addEventListener('blur', (e) => {
    if (currentWindow === 'group')
        socket.emit('feedback', ``);
});


socket.on('feedback', (data) => {
    if (currentWindow === 'group') {
        clearPreviousFeedBack()
        let elemnt = `   <li class="message-feedback">
        <p class="feedback" id="feedback">
         ${data}
        </p>
    </li>`

        messageContainer.innerHTML += elemnt;
    }
})

function clearPreviousFeedBack() {
    document.querySelectorAll('li.message-feedback').forEach((element) => {
        element.parentNode.removeChild(element);
    })
}