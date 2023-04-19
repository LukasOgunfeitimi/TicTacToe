/*
    0  1  2 
    3  4  5
    6  7  8

    0  1  2  3
    4  5  6  7
    8  9 10  11
    12 13 14 15

    0  1  2  3  4 
    5  6  7  8  9
    
    2 dimension
    horizental + 1
    vertical + 2
    diagonal + 3

    3 dimension
    horizental + 1
    vertical + 3
    diagonal + 4
    top left bottom right diagonal + 4
    top right bottom left diagonal + 2

    4 dimension
    horizental + 1
    vertical + 4
    diagonal + 5
    top left bottom right diagonal + 5
    top right bottom left diagonal + 3
*/
var player = 2;
const lineColor = "#ddd";

const canvas = document.getElementById('tic-tac-toe-board');
const context = canvas.getContext('2d');

const dimension = 3

const canvasSize = 1000;
const sectionSize = canvasSize / dimension;
canvas.width = canvasSize;
canvas.height = canvasSize;
context.translate(0.5, 0.5);

var winningCombo = []
class Board {
  constructor() {
    return this.newBoard()
  }
  newBoard() {
    var testboard = []

    
    var tempArrH = []
    
    var tempArrDTLBR = []
    var tempArrDTRBL = []
    // get winning combos
    for (var i = 0, colomn = 0, row = 0; i < dimension * dimension; i++) {
    
      // horizentol
      // every last section reset coords
      if (i % dimension === 0) {
        // and not first section because
        // because we havent started yet
        if (i !== 0) {
          winningCombo.push(tempArrH)
          tempArrH = []
        }
        row = 0
        colomn = sectionSize * (i / dimension)
      }
    
      testboard[i] = {
        x: row++ * sectionSize,
        y: colomn,
        player: 0,
      }
    
      // diagonal
      // if section is diagonal from tl to br
      if (i % (dimension + 1) === 0) {
        tempArrDTLBR.push(i)
      }
    
      if (
        i !== 0 && // not the first section
        i % (dimension - 1) === 0 && // diagonal section from tr to bl
        i !== (dimension * dimension - 1) // not last one
        ) {
        tempArrDTRBL.push(i)
      }
    
      // vertical
      // if section is in the first row 
      // create array for each colomn for that row
      if (i < dimension) winningCombo[i] = []
      // push board in its vertical row accordingly
      winningCombo[i % dimension].push(i)
    
      // push horizontol board
      tempArrH.push(i)
      
      // last indec
      // push last horizontal row before loop is terminated
      // push last diagonal rows
      if (i === (dimension * dimension) - 1) {
        winningCombo.push(tempArrH)
        winningCombo.push(tempArrDTRBL)
        winningCombo.push(tempArrDTLBR)
      }
    }
    return testboard
  }
}

class Engine {
  constructor(opposition = 1) {
    this.player = opposition === 1 ? 2 : 1
    this.oppPlayer = opposition
  }
  move(board) {
    // get best moves
    const bestMove = this.getBestMoves(0, undefined, structuredClone(board))
    var maxPoints = bestMove.filter(function(points) {
      if (points.points === Math.max(...bestMove.map(moves => moves.points))) {
        return true
      }
    })[0]
    return maxPoints.move
  }
  getBestMoves(maxDepth, depth = 0, board) {
    var possibleMoves = []

    var moves = this.getAvaliableMoves(board)

    var enginePoints = 100
    var playerPoints = -100

    for (let i = 0; i < moves.length; i++) {
        var newBoard = structuredClone(board)
        // create dummy board with the added avaliable move
        // every depth we do the move by the engine and then the player
        if (depth % 2 === 0) newBoard[moves[i]].player = this.player
        else newBoard[moves[i]].player = this.oppPlayer

        var winner = Canvas.checkWin(newBoard)

        switch (winner) {
          // if engines win then
          // 100 - depth
          // meaning the quicker a path to win will be a better score
          case this.player:
            possibleMoves.push({
              move: moves[i],
              points: enginePoints - depth
            })
            break
          // if player win then
          // -100 + depth
          // meaning the longer a path to win will be a better score
          case this.oppPlayer:
            possibleMoves.push({
              move: moves[i],
              points: playerPoints + depth
            })
            break
          case 3:
          // if its a draw then 0
            possibleMoves.push({
              move: moves[i],
              points: 0
            })
            break
          case 0:
          // if theres no winner then get the 
          // best moves for the that board
            possibleMoves.push({
              move: moves[i],
              points: this.getBestMoves(maxDepth, depth + 1, structuredClone(newBoard))
            })
            break
        }
    }

    // for every possible moves
    // get the best ones
    for (var i = 0; i < possibleMoves.length; i++) {
      const data = possibleMoves[i].points
      // it will be an array if there are multiple moves
      if (Array.isArray(data)) {
        if (data.length !== 0) {
          // get the best moves and [0] because there could
          // be multiple best moves so just get the first one
          const maxPoints = data.filter(function(points) {
            const minORmax = depth % 2 === 0 ? 'min' : 'max'
            if (points.points === Math[minORmax](...data.map(moves => moves.points))) {
              return true
            }
          })[0]
          // if we find one update the moves that have multiple options
          // with the best move
          if (maxPoints) {
            possibleMoves[i].points = maxPoints.points
          }
        }
      }
    }
    return possibleMoves

  }
  getAvaliableMoves(boardMatrix) {
    const avaliableOffsets = []
    for (var i = 0; i < dimension * dimension; i++) {
      const section = boardMatrix[i]      
        if (section.player === 0)
          avaliableOffsets.push(i)
    }
    return avaliableOffsets;
  }
  
}

class Canvas {
  constructor(context, board = new Board()) {
    this.context = context
    this.board = board
    this.updateBoard()
    this.engine = new Engine(player)
    // first - 500
    // second - 390
    canvas.addEventListener('mouseup', (event) => {
      const canvasMousePosition = this.getCanvasMousePosition(event);
      this.addPlayingPiece(canvasMousePosition, player);
      if (Canvas.checkWin(this.board, true) === 3) return
      var x = Date.now()   
      this.board[this.engine.move(this.board)].player = this.engine.player
      var y = Date.now()
      this.updateBoard()
      document.getElementById('winner').innerText = y - x
    });

  }
  updateBoard() {
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    
    this.drawLines(10, lineColor);

    var xCordinate;
    var yCordinate;
    var playerGo;

    for (var i = 0; i < this.board.length; i++) {
      const data = this.board[i]
      xCordinate = data.x;
      yCordinate = data.y;
      playerGo = data.player
      if (playerGo === 1) {
        this.drawX(xCordinate, yCordinate);
      }

      if (playerGo === 2) {
        this.drawO(xCordinate, yCordinate)
      }
    }
  }
  drawLines(lineWidth, strokeStyle) {
    const lineStart = 4;
    const lineLength = canvasSize - 5;
    this.context.lineWidth = lineWidth;
    this.context.lineCap = 'round';
    this.context.strokeStyle = strokeStyle;
    this.context.beginPath();
  
    /*
     * moveTo = line coordinates start position
     * lineTo = line coordinates end position
    */
  
    /*
     * Horizontal lines 
    */
    for (var y = 1;y < dimension;y++) {  
      this.context.moveTo(lineStart, y * sectionSize);
      this.context.lineTo(lineLength, y * sectionSize);
    }
  
    /*
     * Vertical lines 
    */
    for (var x = 1;x < dimension;x++) {
      this.context.moveTo(x * sectionSize, lineStart);
      this.context.lineTo(x * sectionSize, lineLength);
    }
  
    this.context.stroke();
  }
  addPlayingPiece(mouse, player) {
    var xCordinate;
    var yCordinate;

    for (var i = 0;i < this.board.length;i++) {
      const data = this.board[i]
      xCordinate = data.x;
      yCordinate = data.y;

      // if coords fall into a sector update the player
      if (
          mouse.x >= xCordinate && mouse.x <= xCordinate + sectionSize &&
          mouse.y >= yCordinate && mouse.y <= yCordinate + sectionSize
        ) {
          data.player = player
      }
    }
    this.updateBoard()
  }
  drawO (xCordinate, yCordinate) {
    const halfSectionSize = (0.5 * sectionSize);
    const centerX = xCordinate + halfSectionSize;
    const centerY = yCordinate + halfSectionSize;
    const radius = (sectionSize - 100) / 2;
    const startAngle = 0 * Math.PI; 
    const endAngle = 2 * Math.PI;
  
    context.lineWidth = 10;
    context.strokeStyle = "#01bBC2";
    context.beginPath();
    context.arc(centerX, centerY, radius, startAngle, endAngle);
    context.stroke();
  }
  drawX (xCordinate, yCordinate) {
    context.strokeStyle = "#f1be32";
  
    context.beginPath();
    
    const offset = 50;
    context.moveTo(xCordinate + offset, yCordinate + offset);
    context.lineTo(xCordinate + sectionSize - offset, yCordinate + sectionSize - offset);
  
    context.moveTo(xCordinate + offset, yCordinate + sectionSize - offset);
    context.lineTo(xCordinate + sectionSize - offset, yCordinate + offset);
  
    context.stroke();
  }
  getCanvasMousePosition (event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
  // doesnt work with engine
  // 3 = draw
  // 0 = no winner
  static checkWin(board, final = false) {
    var isDraw = true
    for (var i = 0; i < winningCombo.length; i++) {
      const combo = winningCombo[i]
      var firstSection = board[combo[0]].player
      var winner = true
      for (var j = 0; j < combo.length; j++) {
        const player = board[combo[j]].player
        if (player === 0) isDraw = false
        if (firstSection !== player) winner = false
      }
      if (winner && firstSection) {
        if (final)
          document.getElementById('winner').innerText = firstSection + ' wins'
        return firstSection
      }
    }
    if (isDraw) {
      if (final)
        document.getElementById('winner').innerText = 'draw'
      return 3
    }
    return 0   
  }
}
new Canvas(context, new Board())