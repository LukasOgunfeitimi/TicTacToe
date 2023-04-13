
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
var player = 2;
var lineColor = "#ddd";

var canvas = document.getElementById('tic-tac-toe-board');
var context = canvas.getContext('2d');

var dimension = 3

var canvasSize = 1000;
var sectionSize = canvasSize / dimension
;
canvas.width = canvasSize;
canvas.height = canvasSize;
context.translate(0.5, 0.5);

var boardMatrix = []
/*
  * populate matrix and winning combinations
*/
for (var rows = 0, offset = 0; rows < dimension; rows++) {
    boardMatrix[rows] = []
    for (var column = 0; column < dimension; column++) {
        var startInfo = {
            x: 0,
            y: 0,
            player: 0,
            offset: offset++
        }
        startInfo.x = column * sectionSize
        startInfo.y = rows * sectionSize
        boardMatrix[rows][column] = startInfo
    }
}

class Board {
#

class Engine {
  constructor() {
    this.player = 1
    this.oppPlayer = 2
    this.currentMatrix = boardMatrix
  }
  move() {
    console.clear()
    var dummyBoard = structuredClone(boardMatrix);
    // draw
    var checkDraw = this.getAvaliableMoves(boardMatrix)
    if (checkDraw.length === 1) {
      this.makeMove(checkDraw[0])
      return
    }

    // get best moves
    var bestMove = this.getBestMoves(2, undefined, dummyBoard)

    // there could be multiple best moves just get the first one
    var maxPoints = bestMove.filter(function(points) {
      if (points.points === Math.max(...bestMove.map(moves => moves.points))) {
        return true
      }
    })[0]
    console.log(bestMove)
    this.makeMove(maxPoints.move)
    return 

    // if no end games moves were found return random move
    if (possibleMoves.length === 0) {
      var moves = this.getAvaliableMoves(dummyBoard)
      var lengthRanMoves = moves.length
      return this.makeMove(moves[Math.round(Math.random() * lengthRanMoves)])
    }

    // find highest points with its offset
    var highest = 0
    var offset = undefined
    for (var i = 0; i < possibleMoves.length; i++) {
      var moveData = possibleMoves[i]
      if (moveData.points > highest) highest = moveData.points
      offset = possibleMoves[i].offset
    }

    this.makeMove(offset)
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
          if (depth % 2 === 0) newBoard = this.getDummy(moves[i], board, this.player)
          else newBoard = this.getDummy(moves[i], board, this.oppPlayer)

          var winner = checkWin(newBoard)

          // if engines win then
          // 100 - depth
          // meaning the quicker a path to win will be a better score
          if (winner === this.player) {
            possibleMoves.push({
              move: moves[i],
              points: enginePoints - depth
            })
            continue
          }

          // if player win then
          // -100 + depth
          // meaning the longer a path to win will be a better score
          if (winner === this.oppPlayer) {
            possibleMoves.push({
              move: moves[i],
              points: playerPoints + depth
            })
            continue
          }

          // if its a draw then 0
          if (winner === 3) {
            possibleMoves.push({
              move: moves[i],
              points: 0
            })
            continue
          }

          // if theres no winner and another avaliable 
          // move then get the best moves for that move
          if (winner === 0) {
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
          if (data.length === 0) {
          } else { 
            // get the best moves and [0] because there could
            // be multiple best moves so just get the first one
            var maxPoints = data.filter(function(points) {
              if (depth % 2 === 0) {
                // if we made a move we want the 
                // worst score for the opponent (Math.min)
                // which will be the best score for us
                if (points.points === Math.min(...data.map(moves => moves.points))) {
                  return true
                }
              } else {
                // if the opponent made a move we want the 
                // best score for us (Math.max)
                // which will be the worst score for them
                if (points.points === Math.max(...data.map(moves => moves.points))) {
                  return true
                }
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
  /*
  setTimeout(() => {
    updateBoard(dummyBoard)
  }, i * 100);
  */
  getDummy(offset, board = boardMatrix, player) {
    var dummy = structuredClone(board);
    for (var x = 0; x < dimension;x++) {
      for (var y = 0; y < dimension;y++) {   
        if (dummy[x][y].offset === offset) {
          dummy[x][y].player = player
        }
      }
    }
    return dummy
  }
  getAvaliableMoves(boardMatrix) {
    var avaliableOffsets = []
    for (var x = 0; x < dimension;x++) {
      for (var y = 0; y < dimension;y++) {
          const section = boardMatrix[x][y]      
          if (section.player === 0) {
            avaliableOffsets.push(section.offset)
          }
      }
    }
    return avaliableOffsets;
  }
  showPlayers(board) {
    return board.map(function(row) {
      return row.map(function(section) {
        return section.player
      })
    })
  }
  makeMove(offset) {
    var data = getInfoByOffset(offset)

    // emulate coordinates in the center of the desired section
    var xC = data.x + (data.x / 2)
    var yC = data.y + (data.y  / 2)
    addPlayingPiece({x: xC, y: yC}, this.player)
  }
}


function getInfoByOffset(offset) {
    for (var x = 0; x < dimension;x++) {
        for (var y = 0; y < dimension;y++) {      
            if (boardMatrix[x][y].offset === offset) {
              return boardMatrix[x][y]
            }
        }
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
function checkWin(arr, final = false) {
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
    return 3
  }
  return 0
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


function drawLines (lineWidth, strokeStyle) {
  var lineStart = 4;
  var lineLength = canvasSize - 5;
  context.lineWidth = lineWidth;
  context.lineCap = 'round';
  context.strokeStyle = strokeStyle;
  context.beginPath();

  /*
   * moveTo = start position
   * lineTo = end position
   */

  /*
   * Horizontal lines 
   */
  for (var y = 1;y < dimension;y++) {  
    context.moveTo(lineStart, y * sectionSize);
    context.lineTo(lineLength, y * sectionSize);
  }

  /*
   * Vertical lines 
   */
  for (var x = 1;x < dimension;x++) {
    context.moveTo(x * sectionSize, lineStart);
    context.lineTo(x * sectionSize, lineLength);
  }

  context.stroke();
}

function addPlayingPiece (mouse, player) {
  var xCordinate;
  var yCordinate;
  for (var x = 0;x < dimension;x++) {
    for (var y = 0;y < dimension;y++) {
      var data = boardMatrix[x][y]
      xCordinate = data.x;
      yCordinate = data.y;
      /*
      * if coords fall into a sector
      */
      if (
          mouse.x >= xCordinate && mouse.x <= xCordinate + sectionSize &&
          mouse.y >= yCordinate && mouse.y <= yCordinate + sectionSize
        ) {
          data.player = player
      }
    }
  }
  updateBoard()
  checkWin(boardMatrix)
}


function updateBoard(bm = boardMatrix) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawLines(10, lineColor);
  var xCordinate;
  var yCordinate;
  var playerGo;
  for (var x = 0;x < dimension;x++) {
    for (var y = 0;y < dimension;y++) {
      xCordinate = bm[x][y].x;
      yCordinate = bm[x][y].y;
      playerGo = bm[x][y].player
      
        if (playerGo === 1) {
          drawX(xCordinate, yCordinate);
        } else if (playerGo === 2) {
          drawO(xCordinate, yCordinate);
        }
    }
  }
}

function drawO (xCordinate, yCordinate) {
  var halfSectionSize = (0.5 * sectionSize);
  var centerX = xCordinate + halfSectionSize;
  var centerY = yCordinate + halfSectionSize;
  var radius = (sectionSize - 100) / 2;
  var startAngle = 0 * Math.PI; 
  var endAngle = 2 * Math.PI;

  context.lineWidth = 10;
  context.strokeStyle = "#01bBC2";
  context.beginPath();
  context.arc(centerX, centerY, radius, startAngle, endAngle);
  context.stroke();
}

function drawX (xCordinate, yCordinate) {
  context.strokeStyle = "#f1be32";

  context.beginPath();
  
  var offset = 50;
  context.moveTo(xCordinate + offset, yCordinate + offset);
  context.lineTo(xCordinate + sectionSize - offset, yCordinate + sectionSize - offset);

  context.moveTo(xCordinate + offset, yCordinate + sectionSize - offset);
  context.lineTo(xCordinate + sectionSize - offset, yCordinate + offset);

  context.stroke();
}


function getCanvasMousePosition (event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

canvas.addEventListener('mouseup', function (event) {
  var canvasMousePosition = getCanvasMousePosition(event);
  addPlayingPiece(canvasMousePosition, player);
  engine.move()
  
});
updateBoard();
var engine = new Engine()
engine.move()