var GRID_SIZE = 10;
var CELL_WIDTH = 80;
var CIRCLE_FRACTION = 0.9;
var CIRCLE_RADIUS = CELL_WIDTH * 0.5 * CIRCLE_FRACTION;

var NUM_COLORS = 2;
var COLORS = ['red', 'yellow', 'green', 'blue', 'purple', 'saddlebrown'];
var EMPTY = '.';

var DR = [-1, 0, 1, 0];
var DC = [0, 1, 0, -1];

var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
canvas.width = GRID_SIZE * CELL_WIDTH;
canvas.height = GRID_SIZE * CELL_WIDTH;

var grid = [];
var visited = [];
var visitID = 0;

function updateDisplay(grid) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i <= GRID_SIZE; i++) {
    context.beginPath();
    context.moveTo(i * CELL_WIDTH, 0);
    context.lineTo(i * CELL_WIDTH, canvas.height);
    context.stroke();
    context.closePath();

    context.beginPath();
    context.moveTo(0, i * CELL_WIDTH);
    context.lineTo(canvas.width, i * CELL_WIDTH);
    context.stroke();
    context.closePath();
  }

  for (var r = 1; r <= GRID_SIZE; r++) {
    for (var c = 1; c <= GRID_SIZE; c++) {
      if (grid[r][c] === EMPTY) {
	continue;
      }

      context.beginPath();
      context.arc(CELL_WIDTH * (c - 0.5), CELL_WIDTH * (r - 0.5), CIRCLE_RADIUS, 0, 2 * Math.PI);
      context.fillStyle = COLORS[grid[r][c] - '0'];
      context.fill();
      context.closePath();
    }
  }
}

function slideDown(grid) {
  var fill_row;
  var fill_col = 1;

  for (var c = 1; c <= GRID_SIZE; c++) {
    fill_row = GRID_SIZE;

    for (var r = GRID_SIZE; r >= 1; r--) {
      if (grid[r][c] !== EMPTY) {
        grid[fill_row][fill_col] = grid[r][c];

        if (r !== fill_row || c !== fill_col) {
          grid[r][c] = EMPTY;
        }

        fill_row--;
      }
    }

    if (fill_row < GRID_SIZE) {
      fill_col++;
    }
  }
}

// Construct arrays
for (var r = 0; r <= GRID_SIZE + 1; r++) {
  var gridRow = [];
  var visitedRow = [];

  for (var c = 0; c <= GRID_SIZE + 1; c++) {
    gridRow.push(EMPTY);
    visitedRow.push(0);
  }

  grid.push(gridRow);
  visited.push(visitedRow);
}

function searchAndPop(row, col, color) {
  visited[row][col] = visitID;
  grid[row][col] = EMPTY;

  var count = 1;

  for (var dir = 0; dir < 4; dir++) {
    var nrow = row + DR[dir];
    var ncol = col + DC[dir];

    if (visited[nrow][ncol] !== visitID && grid[nrow][ncol] === color) {
      count += searchAndPop(nrow, ncol, color);
    }
  }

  return count;
}

canvas.addEventListener('click', function(e) {
  var rect = canvas.getBoundingClientRect();
  var x = e.pageX - rect.left;
  var y = e.pageY - rect.top;

  var row = Math.floor(y / CELL_WIDTH) + 1;
  var col = Math.floor(x / CELL_WIDTH) + 1;

  if (grid[row][col] === EMPTY) {
    return;
  }

  var centerX = (col - 0.5) * CELL_WIDTH;
  var centerY = (row - 0.5) * CELL_WIDTH;
  var squaredDistance = (x - centerX) * (x - centerX) + (y - centerY) * (y - centerY);

  if (squaredDistance > CIRCLE_RADIUS * CIRCLE_RADIUS) {
    return;
  }

  console.log(row + ' ' + col);

  visitID++;
  var color = grid[row][col];
  var popped = searchAndPop(row, col, color);

  if (popped === 1) {
    grid[row][col] = color;
    return;
  }

  console.log('Popped ' + popped);

  var scoreElem = document.getElementById('score');
  var score = parseInt(scoreElem.firstChild.nodeValue);
  score += popped * (popped - 1);
  scoreElem.removeChild(scoreElem.firstChild);
  scoreElem.appendChild(document.createTextNode(score));

  slideDown(grid);
  updateDisplay(grid);
}, false);

for (var r = 1; r <= GRID_SIZE; r++) {
  for (var c = 1; c <= GRID_SIZE; c++) {
    var color = Math.floor(Math.random() * NUM_COLORS);
    grid[r][c] = String.fromCharCode(color + '0'.charCodeAt(0));
  }
}

slideDown(grid);
updateDisplay(grid);
