//this is a DOM event listener that ensures JS is executed only after HTML renders. All Js must be contained here
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid'); //the div grid that contains the 200 divs
    let squares = Array.from(document.querySelectorAll('.grid div')); //an array of all divs in the grid div
    let score = 0;
    const scoreDisplay = document.querySelector('#score'); //span were he score is output
    const startBtn= document.querySelector('#start-button'); //the start||pause button
    const width = 10; //declare the width of the grid for ease of tetrimino manipulation
    let nextRandom = 0; // index of next tetromino
    let timerId;
    const colors = [
        'red',
        'blue',
        'lime',
        'purple',
        'orange'
    ];

    //tetromino configurations
    const ltetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ];

    const ztetromino = [
        [width+1, width+2, width*2, width*2+1],
        [1, width+1, width+2, width*2+2],
        [width+1, width+2, width*2, width*2+1],
        [1, width+1, width+2, width*2+2]
    ];

    const ttetromino = [
        [1, width, width+1, width+2], 
        [1, width+1, width*2+1, width+2],
        [width, width+1, width+2, width*2+1],
        [width, 1, width+1, width*2+1]
    ];

    const otetromino = [
        [0, 1, width, width+1], 
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ];

    const itetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1], 
        [width, width+1, width+2, width+3]
    ];

    const tetrominoes= [ltetromino, ztetromino, ttetromino, otetromino, itetromino]; //array of all tetromino shapes and their configurations

    let currentPosition = 3; //position tetromino block renders from
    let currentOrientation = 0; //current tetromino orientation 
    let randomTetromino = Math.floor(Math.random() * tetrominoes.length); //generate random index used to fetch a tetromino shape
    let currentTetromino = tetrominoes[randomTetromino][currentOrientation] //the tetromino block being rendered and its current configuration

    //render tetrominoes to the grid
    function draw() {
        currentTetromino.forEach(index=> {
            //render each cell in the tetromino by adding class 'tetromino' which contains styling
            squares[currentPosition + index].classList.add('tetromino');
            //change tetromino color
            squares[currentPosition +index].style.backgroundColor = colors[randomTetromino];
        })
    };

    //undraw tetrominoes from the grid
    function undraw() {
        currentTetromino.forEach(index => {
            //unrender tetromino cells by removing class 'tetromino'
            squares[currentPosition + index].classList.remove('tetromino');
            //remove color
            squares[currentPosition + index].style.backgroundColor = '';
        });
    }

    //move tetromino down by one row every second
    //timerId = setInterval(moveDown, 1000);

    //function to assign functions to keyCodes
    function control(e) {
        switch(e.keyCode) {
            case 65:
                moveLeft();
                break;
            case 68: 
                moveRight();
                break;
            case 87: 
                rotate();
                break;
            case 83: 
                moveDown();
                break;
            default:

        }
    }
    
    //add event listener to listen for key presses
    document.addEventListener('keydown', control);

    //function to move tetromino down
    function moveDown() {
        undraw(); //undraw tetromino
        currentPosition += width; //change reference point to one row down
        draw(); //draw the tetromino 
        freeze();        
    }

    //stop tetromino from moving down if at bottom and start dropping another tetromino
    function freeze() {
        //check if any cell in the tetromino block is of class taken the next time it moves down
        if(currentTetromino.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            currentTetromino.forEach(index => squares[currentPosition + index].classList.add('taken'));
            //start new tetromino falling
            randomTetromino = nextRandom;
            nextRandom = Math.floor(Math.random() * tetrominoes.length);
            currentTetromino = tetrominoes[randomTetromino][currentOrientation];
            currentPosition = 4;
            draw();
            displayShape(); //display next tetromino in the mini-grid
            addScore(); //updates the score
            gameOver(); //ends game if conditions met
        }
    }

    //move tetromino left 
    function moveLeft() {
        undraw();
        //check if any of the tetromino's cells are on the left edge
        const isAtLeftEdge = currentTetromino.some(index => (currentPosition + index) % width == 0);
        //move tetromino to the left if none of its cells is at the left edge
        if(!isAtLeftEdge) {
            currentPosition -= 1;
        }
        
        //move tetromino one column to the left if any of its cells try and occupy a 'taken' cell
        //this gives illusion of preventing tetrominoes moving to the left if any cells on its left are 'taken'
        if(currentTetromino.some(index=> squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1; 
        }

        draw();
    }

    //moves tetrominoes to the right
    function moveRight() {
        undraw();
        //check if any of the tetromino's cells are on the right edge
        const isAtRightEdge = currentTetromino.some(index => (currentPosition + index) % width === width-1);
        //move tetromino to the right if none of its cells is at the left edge
        if(!isAtRightEdge) {
            currentPosition += 1;
        }
        
        //move tetromino one column to the right if any of its cells try and occupy a 'taken' cell
        if(currentTetromino.some(index=> squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1; 
        }

        draw();
    }

    //rotates tetrominoes clockwise
    function rotate() {
        undraw();
        currentOrientation = (currentOrientation + 1) % 4;
        currentTetromino = tetrominoes[randomTetromino][currentOrientation];
        draw();
    }

    //fetch all divs within div with class 'mini-grid'
    let displaySquares = document.querySelectorAll('.mini-grid div'); 
    //width of the mini grid
    const displayWidth = 4;
    //reference cell for creating tetrominoes
    let displayIndex = 0;

    //tetrominoes in the mini-grid in original orientation
    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1, 2], //l-tetromino
        [displayWidth+1, displayWidth+2, displayWidth*2, displayWidth*2+1], //z-tetromino
        [1, displayWidth, displayWidth+1, displayWidth+2],  //t-tetromino
        [0, 1, displayWidth, displayWidth+1], //o-tetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1], //i-tetromino
    ];

    //display tetromino in mini-grid
    function displayShape() {
        //remove class 'tetromino' from all squares in the mini-grid
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        });
        upNextTetrominoes[nextRandom].forEach( index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        });
    } 

    //start||pause button logic
    startBtn.addEventListener('click', () => {
        //if button clicked while timerId set (tetromioes are moving) stop moveDown form executing every second
        if(timerId) {
            clearInterval(timerId); //cancels the timerId set using a setInterval method
            timerId= null;
        } else {
            draw();
            timerId = setInterval(moveDown, 1000); // tetrominoes start descending every second
            //nextRandom = Math.floor(Math.random() * tetrominoes.length); //find the next tetromino
            displayShape(); // display the next tetromino in the mini-grid
        }
    });

    //update the score
    function addScore() {
        for(let i = 0; i <= 199; i += width ) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]; 

            //check if all cells in a row are filled
            if(row.every(index => squares[index].classList.contains('taken'))) {
                score += 10; //add 10 to the score
                scoreDisplay.innerHTML = score; //display score on page
                //remove class 'taken' and 'tetromino' from filled row making them unshaded and unoccupied
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                }); 
                const squaresRemoved = squares.splice(i, width); //remove row that was filled from grid
                squares = squaresRemoved.concat(squares); //add back removed cells to the beginning of the squares
                squares.forEach(square => grid.appendChild(square)); //remake the grid based on the new squares 
            }
        }
    }

    //game over
    function gameOver() {
        //check if the tetromino occupies any taken space when it starts
        if(currentTetromino.some(cell => squares[currentPosition + cell].classList.contains("taken"))) {
            scoreDisplay.innerHTML = 'Game Over';
            clearInterval(timerId);
        }
    }
})