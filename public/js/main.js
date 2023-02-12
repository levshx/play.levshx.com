
// SERVER ----------------------------
var secret
var allPlayers = []
var host
if (window.location.protocol == "https:") {
    var temphost = ""
    if (window.location.hostname == "127.0.0.1"){
        temphost = "127.0.0.1:2222"
    }
    else {
        temphost = window.location.hostname
    }
    host = "wss://" + temphost + "/ws"
} 
else {
    if (window.location.hostname == "127.0.0.1"){
        temphost = "127.0.0.1:2222"
    }
    else {
        temphost = window.location.hostname
    }
    host = "ws://" + temphost + "/ws"
}

var connected = false
var ws

function createWebcon(nick) {
    
    ws = new WebSocket(host);
    
    ws.onopen = function () {
        console.log('Вермя: ' + new Date()  + " Соединение установлено.");
        ws.send(JSON.stringify({ 
            event: "auth", 
            data: {
                nick: nick,
                id: parseInt(skinId.value),
            } 
        }));       
    };
    
    ws.onclose = function (event) {
        if (event.wasClean) {
            console.log('Соединение закрыто чисто');
        } else {
            console.log('Обрыв соединения'); // например, "убит" процесс сервера
        }
        console.log('Вермя: ' + new Date()  +' Код: ' + event.code + ' причина: ' + event.reason);
        connected = false
    };
    
    ws.onmessage = function (event) {
        //console.log('Вермя: ' + new Date()  +" Получены данные " + event.data);        
        var data = JSON.parse(event.data)
        if (data["event"] == "auth" ) {
            if (data["status"] == true ) {
                console.log("АВТОИЗАЦИЯ УСПЕШНО");
                clientPlayer.id = data["id"];
                clientPlayer.nickname = data["nick"];
                secret = data["secret"];
                clientPlayer.sprite = new Image()
                clientPlayer.sprite.src = "https://app.pixelencounter.com/api/basic/monsters/" + clientPlayer.id + "/png?size=60";
            }
            else 
            {
                console.log("АВТОИЗАЦИЯ ОШИБКА");
            }
        }
        if (data["event"] == "getAll" ) {
            if (data["status"] == true ) {
                allPlayers = data["data"]["players"]
            }
        }   
        ws.send(JSON.stringify({ 
            event: "update",
            secret: secret, 
            data: {
                x: clientPlayer.position.x,
                y: clientPlayer.position.y,
            } 
        }))    
    };
    
    ws.onerror = function (error) {
        console.log('Вермя: ' + new Date()  +" Ошибка " + error.message);
    };      
    
}

// LOGIN FORM -------------------------

const form = document.querySelector('#login');
const skinImg = document.getElementById("skin-img");
const skinId = document.getElementById("skin-id");
skinId.value = Math.floor(Math.random() * 999999+1);
skinImg.src = "https://app.pixelencounter.com/api/basic/monsters/" + skinId.value + "/png?size=60";

function reloadSkin() {
    skinId.value = Math.floor(Math.random() * 999999+1);
    skinImg.src = "https://app.pixelencounter.com/api/basic/monsters/" + skinId.value + "/png?size=60";
}

const formLoginHandler = e => {
    e.preventDefault()
    const formData = new FormData( e.target )
    var data = formData      
    clientPlayer.nickname = data.get("nick")
    createWebcon(data.get("nick"))
    animationRequest();
    form.remove()      
    startListenKeys()
    console.log("ytechka")
    //data.get("skin-id")
}
form.addEventListener('submit', formLoginHandler)



// FORM CHAT ----------------------------

const chat = document.querySelector('#chat');
const chatText = document.getElementById("chatText");
chatText.value = "";

function sendChatMessage(message) {
    ws.send(JSON.stringify({ 
        event: "sendMessage",
        secret: secret, 
        data: {
            text: message
        } 
    }));      
}

// GAME ----------------------------

const clientPlayer = {
    position: {
        x: 0,
        y: 0,
    },
    nickname: "undefined",
    id: 1,
    sprite: skinImg,
    move: true,
    messages: []
}

var spritesCache = {
    hub: new Image()
}
spritesCache.hub.src = "img/hub.png";

// RENDER ----------------------------

var keyboard = {
    A: false,
    D: false,
    W: false,
    S: false,
}

function xToScreen(x) {
    return  window.innerWidth/2 + x - clientPlayer.position.x
}
function yToScreen(y) {
    return window.innerHeight/2 - y + clientPlayer.position.y
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;


function drawAllPlayers() {
    allPlayers.forEach(player => drawPlayer(player));
}

function drawPlayer(player) {
    if (player["id"] != clientPlayer.id) { 
        // ANOTHER PLAYERS
        drawMessages(xToScreen(player["x"]),yToScreen(player["y"]), player["messages"])
        ctx.drawImage(spritesCache[player["id"]], xToScreen(player["x"]-30) , yToScreen(player["y"]+30));            
        ctx.font = "16px PressStart2P";
        ctx.textAlign = "center"
        ctx.fillText(player["nickname"], xToScreen(player["x"]), yToScreen(player["y"]+35));       
    }
    else {
        // MAIN PLAYER
        drawMessages(window.innerWidth/2, window.innerHeight/2, player["messages"])
        ctx.drawImage(clientPlayer.sprite, window.innerWidth/2-30, window.innerHeight/2-30);            
        ctx.font = "16px PressStart2P";
        ctx.textAlign = "center"
        ctx.fillText(clientPlayer.nickname, window.innerWidth/2, window.innerHeight/2-35);
    }
}

function drawMessages(x,y,msgs) {
    if (msgs.length > 0) {
        for (var i = 0; i < msgs.length; i++) {            
            ctx.font = "16px PressStart2P";
            ctx.textAlign = "center"
            ctx.fillText(msgs[i]["text"], x, y - 50 - 25 * msgs.length + 25*i);
        }
    }
}

function startListenKeys() {
    document.addEventListener('keypress', function(event) {
        if (event.code == "Enter") {
            if (clientPlayer.move) {
                clientPlayer.move = false
                // чат открыли
                chat.classList.remove("hidden");
                chatText.focus()
            }
            else {
                clientPlayer.move = true
                // отправка собщения / закрытие чата
                chat.classList.add("hidden");
                if (chatText.value != "") {
                    sendChatMessage(chatText.value)
                    chatText.value = ""
                }
            }
        }        
    });

    document.addEventListener('keydown', function(event) {
        if (event.code == 'KeyA') {
          keyboard.A = true;
        }
        if (event.code == 'KeyD') {
            keyboard.D = true;
        }
        if (event.code == 'KeyW') {
            keyboard.W = true;
        }
          if (event.code == 'KeyS') {
            keyboard.S = true;
        }
    });
    
    document.addEventListener('keyup', function(event) {
        if (event.code == 'KeyA') {
            keyboard.A = false;
        }
        if (event.code == 'KeyD') {
            keyboard.D = false;
        }
        if (event.code == 'KeyW') {
            keyboard.W = false;
        }
        if (event.code == 'KeyS') {
            keyboard.S = false;
        }
    }); 
}

function loadSkin(player) {
    if (typeof spritesCache[player["id"]] === 'undefined') {
        spritesCache[player["id"]] = new Image()
        spritesCache[player["id"]].src = "https://app.pixelencounter.com/api/basic/monsters/" + player["id"] + "/png?size=60";
    }
}
function loadSkins(){
allPlayers.forEach(player => loadSkin(player));
}

function drawCords() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(100,100,100)";
    var step = 500

    vertical_count = Math.floor(window.innerWidth/step);
    pol_count = Math.floor((window.innerWidth/2)/step)
    vertical_offset = window.innerWidth/2 - step*pol_count - clientPlayer.position.x % step;
    for (var i = -1; i < vertical_count+1; i++) {
        var offset = vertical_offset + i*step 
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset, window.innerHeight);
        ctx.stroke();
    }

    horizontal_count = Math.floor(window.innerHeight/step);
    polh_count = Math.floor((window.innerHeight/2)/step)
    horizontal_offset = window.innerHeight/2 - step*polh_count + clientPlayer.position.y % step;
    for (var i = -1; i < horizontal_count+1; i++) {
        var offset = horizontal_offset + i*step 
        ctx.beginPath();
        ctx.moveTo(0, offset);
        ctx.lineTo(window.innerWidth, offset);
        ctx.stroke();
    }


    ctx.textAlign = "left"
    ctx.font = "18px PICO-8";
    ctx.fillText("(x: " + clientPlayer.position.x + "; y: " + clientPlayer.position.y + ")", 10 , window.innerHeight-15); 
    if (Math.abs(clientPlayer.position.x < 4000) && Math.abs(clientPlayer.position.y < 4000)) {
        // -------- HUB ------
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(spritesCache.hub, xToScreen(-spritesCache.hub.naturalWidth*2.5), yToScreen(200), spritesCache.hub.naturalWidth*5, spritesCache.hub.naturalHeight*5); 
    }
}

function render() {  
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle =	"rgb(35,38,33)";
    ctx.fill();
    ctx.fillStyle =	"rgb(255,255,255)";
    drawCords()
    drawAllPlayers()
}

function calculate() {
    if (clientPlayer.move) {
        if (keyboard.A) {
            clientPlayer.position.x -= 5
        }
        if (keyboard.D) {
            clientPlayer.position.x += 5
        }
        if (keyboard.W) {
            clientPlayer.position.y += 5
        }
        if (keyboard.S) {
            clientPlayer.position.y -= 5
        }
    }    
    loadSkins()
}

function animationRequest() {
        calculate();
        render();
        requestAnimationFrame(animationRequest);
}