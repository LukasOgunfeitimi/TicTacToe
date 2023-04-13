
/*
    0  1  2 
    3  4  5
    6  7  8
    
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
const player = 1;
const lineColor = "#ddd";

const canvas = document.getElementById('tic-tac-toe-board');
const context = canvas.getContext('2d');

const dimension = 3

const canvasSize = 1000;
const sectionSize = canvasSize / dimension
;
canvas.width = canvasSize;
canvas.height = canvasSize;
context.translate(0.5, 0.5);

class Board {
  constructor(offset, player, board) {
    this.offset = offset
    this.player = player
    this.board = board ? this.updateBoard(board) : this.newBoard()
    return this.board
  }
  newBoard() {
    const boardMatrix = []
    for (var rows = 0, offset = 0; rows < dimension; rows++) {
      boardMatrix[rows] = []
      for (var column = 0; column < dimension; column++)
        boardMatrix[rows][column] = {
          x: column * sectionSize,
          y: rows * sectionSize,
          player: 0,
          offset: offset++
        }
    }
    return boardMatrix
  }
  updateBoard(board) {
    const newBoard = structuredClone(board);
    for (var x = 0; x < dimension; x++)
      for (var y = 0; y < dimension; y++)
        if (newBoard[x][y].offset === this.offset)
          newBoard[x][y].player = this.player
    return newBoard
  }
}

class Engine {
  constructor(opposition = 1) {
    this.player = opposition === 1 ? 2 : 1
    this.oppPlayer = opposition
  }
  move(board) {
    // structuredClone will give us a copy of an
    // array that wont be referenced
    // so we can make changes to the cloned array
    // without chaning the original
    var dummyBoard = structuredClone(board);

    // draw
    var checkDraw = this.getAvaliableMoves(board)
    if (checkDraw.length === 1) {
      return this.getNewBoard(checkDraw[0], board, this.player)
    }

    // get best moves
    var bestMove = this.getBestMoves(2, undefined, dummyBoard)

    // there could be multiple best moves just get the first one
    var maxPoints = bestMove.filter(function(points) {
      if (points.points === Math.max(...bestMove.map(moves => moves.points))) {
        return true
      }
    })[0]

    return this.getNewBoard(maxPoints.move, board, this.player)
  }
  getBestMoves(maxDepth, depth = 0, board) {
      var possibleMoves = []

      var moves = this.getAvaliableMoves(board)

      var enginePoints = 100
      var playerPoints = -100

      for (let i = 0; i < moves.length; i++) {
          var newBoard 

          // create dummy board with the added avaliable move
          // every depth we do the move by the engine and then the player
          if (depth % 2 === 0) newBoard = new Board(moves[i], this.player, board)
          else newBoard = new Board(moves[i], this.oppPlayer, board)

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
              points: this.getBestMoves(maxDepth, depth + 1, newBoard)
            })
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
  getNewBoard(offset, board = boardMatrix, player) {
    const newBoard = structuredClone(board);
    for (var x = 0; x < dimension;x++)
      for (var y = 0; y < dimension;y++)  
        if (newBoard[x][y].offset === offset)
          newBoard[x][y].player = player
    return newBoard
  }
  getAvaliableMoves(boardMatrix) {
    const avaliableOffsets = []
    for (var x = 0; x < dimension;x++) {
      for (var y = 0; y < dimension;y++) {
        const section = boardMatrix[x][y]      
        if (section.player === 0)
          avaliableOffsets.push(section.offset)
      }
    }
    return avaliableOffsets;
  }
  
  // just a helper function showing
  // the board with only what players pieces
  // that are played
  showPlayers(board) {
    return board.map(function(row) {
      return row.map(function(section) {
        return section.player
      })
    })
  }
  getInfoByOffset(offset) {
    for (var x = 0; x < dimension;x++)
      for (var y = 0; y < dimension;y++)   
        if (boardMatrix[x][y].offset === offset)
          return boardMatrix[x][y]
  }
}

class Canvas {
  constructor(context, board) {
    this.context = context
    this.board = board || new Board()
    this.updateBoard()

    this.engine = new Engine(player)

    canvas.addEventListener('mouseup', (event) => {
      const canvasMousePosition = this.getCanvasMousePosition(event);
      this.addPlayingPiece(canvasMousePosition, player);

      this.board = this.engine.move(this.board)
      this.updateBoard()
    });

  }
  updateBoard() {
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    
    this.drawLines(10, lineColor);

    var xCordinate;
    var yCordinate;
    var playerGo;
    for (var x = 0; x < dimension; x++) {
      for (var y = 0; y < dimension; y++) {
        xCordinate = this.board[x][y].x;
        yCordinate = this.board[x][y].y;
        playerGo = this.board[x][y].player

        if (playerGo === 1)
          this.drawX(xCordinate, yCordinate);

        if (playerGo === 2)
          this.drawO(xCordinate, yCordinate)
      }
    }
    Canvas.checkWin(this.board, true)
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
    for (var x = 0;x < dimension;x++) {
      for (var y = 0;y < dimension;y++) {
        var data = this.board[x][y]
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
  static checkWin(arr, final = false) {
    var winMatrix = getWinningCombinations(arr)
    winComb:
    for (var i = 0; i < winMatrix.length; i++) {
      var startingValue = winMatrix[i][0].player
      for (var j = 0; j < winMatrix[i].length; j++) {
        if (winMatrix[i][j].player === 0) continue winComb
        if (winMatrix[i][j].player !== startingValue) continue winComb
      }
      if (final) document.getElementById('winner').innerText = (startingValue === 1 ? 'X' : 'O') + ' wins'
      return startingValue
    } 
    if (checkDraw(arr)) {
      if (final) document.getElementById('winner').innerText = 'draw'
      return 3
    }
    return 0
  }

}

function checkDraw(boardMatrix) {
  var isDraw = true
  for (var x = 0; x < dimension;x++) {
    for (var y = 0; y < dimension;y++) {
        const section = boardMatrix[x][y]      
        if (section.player === 0) {
          isDraw = false
        }
    }
  }
  return isDraw;
}

function getWinningCombinations(matrix) {
    var winningCombinations = []
    var boardMatrix = matrix

    /*
      * all horizontal 
    */
    for (var x = 0; x < dimension; x++) {
        winningCombinations.push(boardMatrix[x])
    }

    /*
      * all vertical
    */
    // all verticals that are possible
      // for each vertical
      for (var i = 0; i < dimension; i++) {
        var tempArrV = []
        for (var j = 0; j < dimension; j++) {
          tempArrV.push(boardMatrix[j][i])
        }
        winningCombinations.push(tempArrV)
      }

    /*
      * all diagonal 
    */

    // Top Left to Bottom Right
    var TLBR = dimension + 1
    var TLBRstart = 0
    var TLBRarr = []

    // Top Right to Bottom Left
    var TRBL = dimension - 1
    var TRBLstart = dimension - 1
    var TRBLarr = []

    for (var x = 0, offset = 0; x < dimension; x++) {
      for (var y = 0; y < dimension; y++, offset++) {
        // if it matches a TLBR sector
        if (offset === TLBRstart) {
            var data = boardMatrix[x][y]
            TLBRarr.push(data)
            TLBRstart += TLBR
        }
        // if it matches a TRBL sector
        if (offset === TRBLstart) {
          var data = boardMatrix[x][y]
          TRBLarr.push(data)
          TRBLstart += TRBL
        }
      }
    }
    //with the TRBL diagonal the very last section of the matrix is
    //added when it does not fall in the TRBL diagonal line
    TRBLarr.pop()

    winningCombinations.push(TLBRarr)
    winningCombinations.push(TRBLarr)
    
    return winningCombinations
}

new Canvas(context)