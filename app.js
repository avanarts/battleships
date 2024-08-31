//document objects
const shipFlipButton = document.getElementById('flip-ship')
const optionsContainer = document.querySelector('.options-container')
const gridContainer = document.getElementById('grid-container')
const startButton = document.getElementById('start-btn')
const infoDisplay = document.getElementById('info')
const turnDisplay = document.getElementById('turn')

console.log(infoDisplay)


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

createGrid('blue', 'player');
createGrid('gray', 'computer');


//creating ships
class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
    }
}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 1)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

//to create ships visually, we'll need to loop through array

const ships = [destroyer, submarine, cruiser, battleship, carrier]
let notDropped

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


//player ships

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

//event listeners
shipFlipButton.addEventListener('click', flipShip)
optionShips.forEach(ship => ship.addEventListener('dragstart', dragStart))
playerCubes.forEach(cube => {
    cube.addEventListener('dragover', dragOver)
    cube.addEventListener('drop', dropShip)
})




//game logic
let gameOver = false
let playerTurn
let playerHits = []
let computerHits = []

const startGame = () => {
    if (optionsContainer.children.length != 0) {
        infoDisplay.textContent = 'Please place all your ships first!'
    } else {
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
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
        }
        if (!e.target.classList.contains('taken')) {
            infoDisplay.textContent = 'Miss!'
            e.target.classList.add('empty')
        }
        playerTurn = false
        const allBoardBlocks = document.querySelectorAll('#computer div')

    }
}

startButton.addEventListener('click', startGame)