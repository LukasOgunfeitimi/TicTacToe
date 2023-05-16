// ==UserScript==
// @name         Lichess Bot
// @description  Fully automated lichess bot
// @author       You
// @include      *lichess*
// @require https://raw.githubusercontent.com/Jps838898/LichessBot/master/Engines/stockfish_10_0_1.asm.js
// @run-at document-start
// @grant        none
// ==/UserScript==
alert(32432)
var red = '#D2042D'
var defaultColour = '#15781B'
if (location.pathname === '/') {
    throw new Error('game not found')
} else if (location.pathname === '/tv') {
    throw new Error('spectating')
}
var stockfish = STOCKFISH();
var isWhite = false;
var fen = "";
var gameStarted = false;
var moveCounter = 1
document.onkeydown = function(e) {
    if (e.key === 'f') {
        setTimeout(function() {
            document.querySelector("#main-wrap > main > div.round__app.variant-standard > div.round__app__board.main-board > div > cg-container > svg.cg-shapes > defs").innerHTML =
            `
                <marker id="arrowhead-g" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01" cgKey="g">
                    <path d="M0,0 V4 L3,2 Z" fill="${defaultColour}">
                    </path>
                </marker>
            `
        }, 250)
    }
}
window.onload = function() {
    initialise();
}
function initialise() {
    while (!gameStarted || typeof lichess.socket == 'undefined') {
        document.querySelector("#main-wrap > main > div.round__app.variant-standard > div.round__app__board.main-board > div > cg-container > svg.cg-shapes > defs").innerHTML =
        `
            <marker id="arrowhead-g" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01" cgKey="g">
                <path d="M0,0 V4 L3,2 Z" fill="${defaultColour}">
                </path>
            </marker>
        `
        // Get color information and initial FEN from html
        var documentPlayerString = document.documentElement.innerHTML.split("player\":{\"color\":\"")[1].split("\"")[0];
        gameStarted = documentPlayerString == "white" || documentPlayerString == "black";
        isWhite = documentPlayerString == "white";
    }

    getInitialFen();

    if (isMyTurn()) {
        makeMove();
    }
}


function isMyTurn() {
    return (isWhite && fen.includes(" w")) || (!isWhite && fen.includes(" b"));
}

// Extract FEN from html
function getInitialFen() {
    var fensHtml = document.documentElement.innerHTML.split("fen");
    fen = fensHtml[fensHtml.length - 1].split("\"}]")[0].substring(3).split("\"")[0];
}
var colour = ''
// Intercept inputs from websockets
var ws = window.WebSocket;
window.WebSocket = function (a, b) {
    var that = b ? new ws(a, b) : new ws(a);
    that.addEventListener("message", function (e) {
        var message = JSON.parse(e.data);

        if (typeof message.d != 'undefined' && typeof message.v != 'undefined' && typeof message.d.fen != 'undefined')  {
            // Note : this fen is not complete, it only contains the first field
            fen = message.d.fen;

            // add player to move to fen
            var isWhitesTurn = message.v % 2 == 0;

            if (isWhitesTurn) {
                fen += " w";
            } else {
                fen += " b";
            }

            if (isMyTurn()) {
                var boardArrowElement = document.querySelector("#main-wrap > main > div.round__app.variant-standard > div.round__app__board.main-board > div > cg-container > svg.cg-shapes > g")
                boardArrowElement.innerHTML = ''
                makeMove();
            }
            return;
        }

    });
    return that;
};
window.WebSocket.prototype = ws.prototype;

// Send request to stockfish
function makeMove() {
    //var timeout = Math.floor(Math.random() * 250) + 100
    stockfish.postMessage("position fen " + fen);
    stockfish.postMessage("go movetime 750"); // + timeout)
}
// for black
var flip = {
    'a': 'h', 1 : 8,
    'b': 'g', 2 : 7,
    'c': 'f', 3 : 6,
    'd': 'e', 4 : 5,
    'e': 'd', 5 : 4,
    'f': 'c', 6 : 3,
    'g': 'b', 7 : 2,
    'h': 'a', 8 : 1,
}
function getCoords(move, ponder) {
    // if the player is black the engine will give the move
    // as if the bored isnt flipped when playing so translate
    // the move
    if (!isWhite) move = move.split('').map(char => flip[char]).join('')

    var firstL = move[0].charCodeAt(0) - 97
    var firstN = move[1] - 1

    var secondL = move[2].charCodeAt(0) - 97
    var secondN = move[3] - 1

    var coords = {
        x1: String(-3.5 + firstL),
        y1: String(3.5 - firstN),
        x2: String(-3.5 + secondL),
        y2: String(3.5 - secondN),
    }
    var arrowElement = `
    <line stroke="${defaultColour}" stroke-width="0.15625" stroke-linecap="round" marker-end="url(#arrowhead-g)" opacity="1" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}" cgHash="688,688,a1,a3,green"></line>
    `
    var boardArrowElement = document.querySelector("#main-wrap > main > div.round__app.variant-standard > div.round__app__board.main-board > div > cg-container > svg.cg-shapes > g")
    if (ponder) {
        //document.getElementById('arrowhead-g').children[0].setAttribute('fill', red)
        boardArrowElement.innerHTML += arrowElement
        //document.getElementById('arrowhead-g').children[0].setAttribute('fill', defaultColour)
    }
    if (!ponder) boardArrowElement.innerHTML = arrowElement
}
var lastMove = ''
// Response from stockfish js -> move
stockfish.onmessage = function(event) {
    
    if (event && event.includes("bestmove")) {

        var bestPonder = event.split(' ')[3];
        var moveTime = "0";	// abuse pre-move
        // Send websocket move request to lichess server
        //lichess.socket.send('move', {"u": bestMove,"b": 1}, {"sign": "0.0","ackable": true,"withLag": true}, false)
         //getCoords(bestPonder, true)
    }

    if (event && event.includes("pv")) {
        var words = event.split(' ')
        for (var i = 0; i < words.length; i++) {
            if (words[i] === 'pv') {
                var move = words[i + 1]
                console.log(move)
                if (lastMove !== move) {
                    console.log(move)
                    lastMove = move
                    getCoords(move, !true)
                }
                break
            }
        }
    }
};
