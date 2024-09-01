//document objects
const shipFlipButton = document.getElementById('flip-ship')
const optionsContainer = document.querySelector('.options-container')
const gridContainer = document.getElementById('grid-container')
const startButton = document.getElementById('start-btn')
const infoDisplay = document.getElementById('info')
const turnDisplay = document.getElementById('turn')
const gameTimer = document.getElementById('game-timer')
const timerHeader = document.getElementById('timer-header')
let [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0]
let interval = null


//allows the player to flip ships before placement
let angle = 0
const flipShip = () => {
    const optionShips = Array.from(optionsContainer.children)
    angle === 0 ? angle = 90 : angle = 0;
    optionShips.forEach(option => {
        option.style.transform = `rotate(${angle}deg)`
    })
}

//creating boards
const createGrid = (color, user) => {
    const gridCube = document.createElement('div')
    gridCube.classList.add('game-board')
    gridCube.style.backgroundColor = color
    gridCube.id = user

    for (let i = 0; i < 100; i++) {
        const cube = document.createElement('div')
        cube.classList.add('cube')
        cube.id = i
        gridCube.append(cube)
    }

    gridContainer.append(gridCube)


}

createGrid('#297FDE', 'player');
createGrid('gray', 'computer');


//creating ships
class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
    }
}

//creating ship objects
const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

//to show ships visually, we'll need to loop through array
const ships = [destroyer, submarine, cruiser, battleship, carrier]

const handleValidity = (allGridCubes, isHorizontal, startIndex, ship) => {
    let shipBlocks = []
    let valid

    //horizontal
    let validStart = isHorizontal 
    ? startIndex <= 100 - ship.length ? startIndex : 100 - ship.length
    //vertical
    : startIndex <= 100 - 10 * ship.length ? startIndex : startIndex - ship.length * 10 + 10

    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allGridCubes[Number(validStart) + i])
        } else {
            shipBlocks.push(allGridCubes[Number(validStart) + (i * 10)])
        }
    }

    if (isHorizontal) {
        valid = shipBlocks.every((cube, index) => 
        shipBlocks[0].id % 10 !== 10 - (shipBlocks.length - (index + 1)))
    } else {
        valid = shipBlocks.every((cube, index) => 
        shipBlocks[0].id < 90 + (10 * index + 1))
    }

    const freeSpaces = shipBlocks.every(cube => !cube.classList.contains('taken'))

    return { shipBlocks, valid, freeSpaces }
}

//this section adds ships to the board, either to computer or player boards
let notDropped
const addShips = (user, ship, startId) => {
    const allGridCubes = document.querySelectorAll(`#${user} div`)
    let randBoolean = Math.random() < 0.5 //returns either true or false
    let isHorizontal = user === 'player' ? angle === 0 : randBoolean
    let randStartIndex = Math.floor(Math.random() * 100)
    let startIndex = startId ? startId : randStartIndex

    const { shipBlocks, valid, freeSpaces } = handleValidity(allGridCubes, isHorizontal, startIndex, ship)


    if (valid && freeSpaces) {
        shipBlocks.forEach(block => {
            block.classList.add(ship.name)
            block.classList.add('taken')
        })
    } else {
        if (user === 'computer') addShips(user, ship, startId)
        if (user === 'player') notDropped = true
    }
}

ships.forEach(ship => addShips('computer', ship))


//handling player ships

const optionShips = Array.from(optionsContainer.children)
let draggedShip


const dragStart = (e) => {
        notDropped = false;
        draggedShip = e.target;
}

const dragOver = (e) => {
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlightArea(e.target.id, ship)
}

const dropShip = (e) => {
    const startId = e.target.id
    console.log(draggedShip.id)
    const ship = ships[draggedShip.id]
    addShips('player', ship, startId)
    if (!notDropped) {
        draggedShip.remove()
    }
}
const playerCubes = document.querySelectorAll('#player div')


//highlighting
const highlightArea = (startIndex, ship) => {
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle === 0

    const { shipBlocks, valid, freeSpaces } = handleValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && freeSpaces) {
        shipBlocks.forEach(block => {
            block.classList.add('hover')
            setTimeout(() => block.classList.remove('hover'), 400)
        })
    }
}





//game logic
let gameOver = false
let playerTurn
let playerHits = []
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []

const startGame = () => {
    if (playerTurn === undefined) {
        if (optionsContainer.children.length != 0) {
            infoDisplay.textContent = 'Please place all your ships first!'
        } else {
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
            playerTurn = true
            turnDisplay.textContent = 'Your turn!'
            infoDisplay.textContent = 'The game has started.'
            timerHeader.textContent = 'Time Elapsed:'
            interval = setInterval(timer, 1000)
        }
    }
}

const handleClick = (e) => {
    if (!gameOver) {
        if (e.target.classList.contains('taken')) {
            e.target.classList.add('hit')
            infoDisplay.textContent = 'You hit the computer\'s ship!'


            let classes = Array.from(e.target.classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'hit')
            classes = classes.filter(className => className !== 'taken')
            playerHits.push(...classes)
            checkScore('player', playerHits, playerSunkShips)
        }
        if (!e.target.classList.contains('taken')) {
            infoDisplay.textContent = 'Miss!'
            e.target.classList.add('empty')
        }
        playerTurn = false
        const allBoardBlocks = document.querySelectorAll('#computer div')

        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(computerTurn, 2000)

    }
}
//computer's turn
const computerTurn = (e) => {
    if (!gameOver) {
        turnDisplay.textContent = "It's the computer's turn!"
        infoDisplay.textContent = "The computer is thinking."

        setTimeout(() => {
            let randomGuess = Math.floor(Math.random() * 100)
            const allBoardBlocks = document.querySelectorAll('#player div')

            if (allBoardBlocks[randomGuess].classList.contains('taken') &&
            allBoardBlocks[randomGuess].classList.contains('hit')) 
            {
                computerTurn()
            } 
            else if (allBoardBlocks[randomGuess].classList.contains('taken') &&
            !allBoardBlocks[randomGuess].classList.contains('hit')) 
            {
                allBoardBlocks[randomGuess].classList.add('hit')
                infoDisplay.textContent = 'The computer hit your ship!'

                let classes = Array.from(allBoardBlocks[randomGuess].classList)
                classes = classes.filter(className => className !== 'block')
                classes = classes.filter(className => className !== 'hit')
                classes = classes.filter(className => className !== 'taken')
                computerHits.push(...classes)
                checkScore('computer', computerHits, computerSunkShips)
            } 
            else {
                infoDisplay.textContent = 'Nothing was hit!'
                allBoardBlocks[randomGuess].classList.add('empty')
            }
        }, 2000)

        setTimeout(() => {
            playerTurn = true
            turnDisplay.textContent = 'Your turn!'
            infoDisplay.textContent = 'Player is thinking.'
            const allBoardBlocks = document.querySelectorAll('#computer div')

            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
        }, 4000)
    }
}

const checkScore = (user, userHits, userSunkShips) => {
    const checkShip = (shipName, shipLength) => {
        if (userHits.filter(storedShipName => storedShipName === shipName).length ===shipLength) {
            if (user === 'player') {
                infoDisplay.textContent = `You sunk the computer's ${shipName}.`
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            if (user === 'computer') {
                infoDisplay.textContent = `The computer sunk your ${shipName}.`
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            userSunkShips.push(shipName)
        }
    }

    checkShip('destroyer', 2)
    checkShip('submarine', 3)
    checkShip('cruiser', 3)
    checkShip('battleship', 4)
    checkShip('carrier', 5)

//if length of sunkShips array is 5, then that means all 5 ships are sunk and game is over
    if (playerSunkShips.length === 5) {
        infoDisplay.textContent = 'All computer ships sunk. YOU WIN!'
        gameOver = true
        clearInterval(interval)
    }
    if (computerSunkShips.length === 5) {
        infoDisplay.textContent = 'All your ships sunk. YOU LOSE!'
        gameOver = true
        clearInterval(interval)
    }
}

const timer = () => {

    seconds++
        if (seconds == 60) {
            seconds = 0
            minutes++
            if (minutes == 60) {
                minutes = 0
                hours++
            }
        }

    let h = hours < 10 ? `0${hours}` : hours
    let m = minutes < 10 ? `0${minutes}` : minutes
    let s = seconds < 10 ? `0${seconds}` : seconds

        gameTimer.textContent = ` ${h} : ${m} : ${s} `
}



//event listeners
shipFlipButton.addEventListener('click', flipShip)
optionShips.forEach(ship => ship.addEventListener('dragstart', dragStart))
playerCubes.forEach(cube => {
    cube.addEventListener('dragover', dragOver)
    cube.addEventListener('drop', dropShip)
})
startButton.addEventListener('click', startGame)