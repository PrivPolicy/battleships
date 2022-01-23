//"use strict"

function Game() {

    //#region [1] DEFINITIONS
    const SHIPDIRECTION = {
        'NONE': -1,
        'HORIZONTAL': 0,
        'VERTICAL': 1
    }

    const DIRECTION = {
        'NONE': "NONE",
        'UP': 'UP',
        'RIGHT': 'RIGHT',
        'DOWN': 'DOWN',
        'LEFT': 'LEFT'
    }

    function ResolveDirection(dir) {
        if (dir == "UP") { return [0, -1]; }
        else if (dir == "RIGHT") { return [1, 0]; }
        else if (dir == "DOWN") { return [0, 1]; }
        else if (dir == "LEFT") { return [-1, 0]; }
        else { return undefined; }
    }

    const TILE = {
        'EMPTY': 0,
        'SHIP': 1,
        'BOUNDARY': 2
    }

    const BOARD = {
        'SHIP': 0,
        'SHOOT': 1,
        'MEMORY': 2
    }

    const GAMESTATES = {
        'PREPARATION': 0,
        'TURN': {
            'PLAYER': 1,
            'COMPUTER': 2
        },
        'WIN': {
            'PLAYER': 3,
            'COMPUTER': 4
        }
    }

    const ENTITY = {
        'PLAYER': 0,
        'COMPUTER': 1
    }

    const LEVEL = {
        'EASY': 0,
        'MEDIUM': 1,
        'HARD': 2,
        'EXTREME': 3
    }

    const AIMODE = {
        'HUNT': 0,
        'TARGET': 1
    }

    var currentGameState = GAMESTATES.PREPARATION;

    var playerShipsLeftToDestroy = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    //#endregion

    //#region [1] GLOBAL SETTINGS
    var boardSize = 10;

    var shipData = {
        count: 0,
        ships: [
            {
                len: 4,
                count: 1
            },
            {
                len: 3,
                count: 2
            },
            {
                len: 2,
                count: 3
            },
            {
                len: 1,
                count: 4
            }
        ]
    }

    shipData.ships.forEach((element) => {
        shipData.count += element.count;
    });

    var computerBoardCount = 2;
    var playerBoardCount = 2;

    var iterCountMax = 10000;

    var visualizeComputerShips = false;

    var computerTurnDelay = 1000;

    var difficultyLevel = LEVEL.HARD;

    var gameRestartDelay = 5000;
    //#endregion

    //#region [1] POPULATE COMPUTER BOARD
    var computerBoard = [];

    for (let d = 0; d < computerBoardCount; d++) {
        computerBoard.push([]);
        for (let y = 0; y < boardSize + 2; y++) {
            computerBoard[d].push([]);
            for (let x = 0; x < boardSize + 2; x++) {
                computerBoard[d][y].push(0);
            }
        }
    }
    //#endregion

    //#region [2] POPULATE PLAYER BOARD
    var playerBoard = [];

    for (let d = 0; d < playerBoardCount; d++) {
        playerBoard.push([]);
        for (let y = 0; y < boardSize + 2; y++) {
            playerBoard[d].push([]);
            for (let x = 0; x < boardSize + 2; x++) {
                playerBoard[d][y].push(0);
            }
        }
    }

    //shots board - make boundary out of 1s
    for (let y = 0; y < boardSize + 2; y++) {
        for (let x = 0; x < boardSize + 2; x++) {
            if (x == 0 || x == boardSize + 1 || y == 0 || y == boardSize + 1) {
                playerBoard[BOARD.SHOOT][y][x] = 1;
                computerBoard[BOARD.SHOOT][y][x] = 1;
            }
        }
    }

    //console.error(playerBoard);

    //#endregion

    //#region [1] CREATE PAGE LAYOUT
    var playerBoardHandles = [];
    var computerBoardHandles = [];

    var bodyGameContainer = document.createElement("div");
    bodyGameContainer.id = "game-container";

    var bodyPlayerBoard = document.createElement("div");
    bodyPlayerBoard.className = "board player";

    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            var bodyPlayerField = document.createElement("div");
            bodyPlayerField.className = "field";
            playerBoardHandles.push(bodyPlayerBoard.appendChild(bodyPlayerField));
        }
    }

    var bodyComputerBoard = document.createElement("div");
    bodyComputerBoard.className = "board computer";

    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            var bodyComputerField = document.createElement("div");
            bodyComputerField.className = "field";
            computerBoardHandles.push(bodyComputerBoard.appendChild(bodyComputerField));
        }
    }

    var playButton = document.createElement("div");
    playButton.id = 'battleships-play';
    playButton.innerHTML = 'Play';
    playButton.style.display = 'none';

    playButton.addEventListener("click", (event) => {
        playButton.style.display = 'none';
        shipBay.style.display = 'none';
        bodyShipsLeftToShootPlayer.style.visibility = "visible";
        bodyShipsLeftToShootComputer.style.visibility = "visible";
        StartGame();
    });

    var bodyThemeChange = document.createElement("div");
    bodyThemeChange.id = "theme";
    bodyThemeChange.innerHTML = "THEME";

    bodyThemeChange.addEventListener("click", (event) => {
        if(document.body.classList.contains("light")) {
            document.body.classList.remove("light");
            document.body.classList.add("dark");
            document.querySelector(":root").style.backgroundColor = "#101010";
        } else {
            document.body.classList.remove("dark");
            document.body.classList.add("light");
            document.querySelector(":root").style.backgroundColor = "whitesmoke";
        }
    });

    var bodyShipsLeftToShootPlayer = document.createElement("div");
    var bodyShipsLeftToShootComputer = document.createElement("div");

    bodyShipsLeftToShootPlayer.classList.add("ships-to-destroy", "player");
    bodyShipsLeftToShootComputer.classList.add("ships-to-destroy", "computer");

    var bodyShipsLeftToShootPlayerInnerString = "";

    [[1,4], [2,3], [3,2], [4,1]].forEach(element => {
        for(let i = 0; i < element[0]; i++) {
            bodyShipsLeftToShootPlayerInnerString += `<div class='indicator len${element[1]}'>${'<div></div>'.repeat(element[1])}</div>`;
        }
    });

    bodyShipsLeftToShootPlayer.innerHTML = bodyShipsLeftToShootPlayerInnerString;
    bodyShipsLeftToShootComputer.innerHTML = bodyShipsLeftToShootPlayer.innerHTML;

    bodyShipsLeftToShootPlayer.style.visibility = "hidden";
    bodyShipsLeftToShootComputer.style.visibility = "hidden";

    bodyGameContainer.appendChild(bodyPlayerBoard);
    bodyGameContainer.appendChild(bodyShipsLeftToShootPlayer);
    bodyGameContainer.appendChild(bodyShipsLeftToShootComputer);
    bodyGameContainer.appendChild(bodyComputerBoard);

    document.body.appendChild(bodyThemeChange);
    document.body.appendChild(bodyGameContainer);
    document.body.appendChild(playButton);

    document.body.classList.add("dark");
    document.querySelector(":root").style.backgroundColor = document.querySelector(":root").style.backgroundColor != "" ? document.querySelector(":root").style.backgroundColor : "#101010";
    //#endregion

    //#region [2] CREATE AND POPULATE SHIP BAY
    var shipBay = document.createElement("div");
    shipBay.id = "ship-bay";

    bodyGameContainer.appendChild(shipBay);

    var shipBayHandles = [];
    var shipBaySelected = null;

    for (let i = 0; i < shipData.ships.length; i++) {
        for (let j = 0; j < shipData.ships[i].count; j++) {
            var ship = document.createElement("div");
            shipBayHandles.push(ship);

            ship.classList.add("ship");
            ship.style.width = `${shipData.ships[i].len * 30 + 2}px`;

            for (let k = 0; k < shipData.ships[i].len; k++) {
                ship.appendChild(document.createElement("div"));
            }

            ship.addEventListener("click", (event) => {
                event.stopPropagation();

                if (shipBaySelected) {
                    shipBaySelected.classList.remove("selected");

                    if (shipBaySelected == event.currentTarget) {
                        shipBaySelected = null;
                        return;
                    }
                }

                event.currentTarget.classList.add("selected");
                shipBaySelected = event.currentTarget;
                shipBaySelectedDirection = SHIPDIRECTION.HORIZONTAL;
            });

            shipBay.appendChild(ship);
        }
    }
    //#endregion

    //#region [1] GENERATE COMPUTER SHIPS
    var shipIndex = 0;
    var shipIndexChange = shipData.ships[shipIndex].count;

    var shipToAddLen = shipData.ships[shipIndex].len;

    for (let i = 0; i < shipData.count; i++) {
        if (i == shipIndexChange) {
            shipIndex++;
            shipIndexChange = shipIndexChange + shipData.ships[shipIndex].count;
            shipToAddLen = shipData.ships[shipIndex].len;
        }

        var direction;

        var shipPosition = { x: 0, y: 0, valid: false };

        var iterCount = 0;

        while (shipPosition.valid == false && iterCount < iterCountMax) {
            direction = Math.round(Math.random()); // 0 - horizontal, 1 - vertical

            shipPosition.valid = true;

            if (direction == SHIPDIRECTION.HORIZONTAL) {
                shipPosition.x = 1 + Math.floor(Math.random() * (boardSize - shipToAddLen + 1));
                shipPosition.y = 1 + Math.floor(Math.random() * (boardSize));

                if (util.checkForValueInChunk(computerBoard[0], shipPosition.x, shipPosition.y, shipPosition.x + shipToAddLen - 1, shipPosition.y, [TILE.SHIP, TILE.BOUNDARY], "EQ")) {
                    shipPosition.valid = false;
                }
            } else {
                shipPosition.x = 1 + Math.floor(Math.random() * (boardSize));
                shipPosition.y = 1 + Math.floor(Math.random() * (boardSize - shipToAddLen + 1));

                if (util.checkForValueInChunk(computerBoard[0], shipPosition.x, shipPosition.y, shipPosition.x, shipPosition.y + shipToAddLen - 1, [TILE.SHIP, TILE.BOUNDARY], "EQ")) {
                    shipPosition.valid = false;
                }
            }

            if (shipPosition.valid) {
                if (direction == SHIPDIRECTION.HORIZONTAL) {
                    util.replaceArrayChunk(computerBoard[0], shipPosition.x - 1, shipPosition.y - 1, shipPosition.x + shipToAddLen, shipPosition.y + 1, TILE.BOUNDARY);
                    util.replaceArrayChunk(computerBoard[0], shipPosition.x, shipPosition.y, shipPosition.x + shipToAddLen - 1, shipPosition.y, TILE.SHIP);
                } else {
                    util.replaceArrayChunk(computerBoard[0], shipPosition.x - 1, shipPosition.y - 1, shipPosition.x + 1, shipPosition.y + shipToAddLen, TILE.BOUNDARY);
                    util.replaceArrayChunk(computerBoard[0], shipPosition.x, shipPosition.y, shipPosition.x, shipPosition.y + shipToAddLen - 1, TILE.SHIP);
                }
            }

            iterCount++;
        }

        if (iterCount >= iterCountMax) {
            //break;
        }
    }

    //#endregion

    //#region [1] VISUALIZE COMPUTER SHIPS
    function VisuallizeComputerShips(bool) {
        for (let y = 1; y < boardSize + 1; y++) {
            for (let x = 1; x < boardSize + 1; x++) {
                if (computerBoard[0][y][x] == 1) {
                    if (bool) {
                        computerBoardHandles[10 * (y - 1) + (x - 1)].classList.add("ship", "computer", "visualized");
                    } else {
                        computerBoardHandles[10 * (y - 1) + (x - 1)].classList.remove("visualized");
                    }
                }
            }
        }
    }

    VisuallizeComputerShips(visualizeComputerShips);
    //#endregion

    //#region [2] LET PLAYER PLACE SHIPS / DRAW THE BOARD
    var shipBaySelectedValid = true;

    function DrawBoard(event) {
        if (currentGameState != GAMESTATES.PREPARATION) {
            return;
        }

        event.stopPropagation();

        shipBaySelectedValid = true;

        if (shipBaySelected != null) {
            if (event.target != event.currentTarget) {
                playerBoardHandles.forEach((element) => {
                    element.classList.remove("hovering", "valid", "invalid");
                });

                //UpdatePlayerShipArray();

                var mousePositionToBoard = util.oneToTwoD(event.target, playerBoardHandles, boardSize);

                var offset = boardSize - shipBaySelected.childElementCount;

                if (shipBaySelectedDirection == SHIPDIRECTION.HORIZONTAL) {
                    var clampedMousePositionToBoard = {
                        x: Math.min(mousePositionToBoard.x, offset),
                        y: mousePositionToBoard.y
                    };

                    if (util.checkForValueInChunk(playerBoard[0], clampedMousePositionToBoard.x + 1, clampedMousePositionToBoard.y + 1, clampedMousePositionToBoard.x + shipBaySelected.childElementCount, clampedMousePositionToBoard.y + 1, [1, 2])) {
                        shipBaySelectedValid = false;
                    }

                    util.replaceBoardChunk(playerBoardHandles, clampedMousePositionToBoard.x, clampedMousePositionToBoard.y, clampedMousePositionToBoard.x + shipBaySelected.childElementCount - 1, clampedMousePositionToBoard.y, null, (element) => {
                        element.classList.add("hovering", shipBaySelectedValid ? "valid" : "invalid");
                    });
                } else if (shipBaySelectedDirection == SHIPDIRECTION.VERTICAL) {
                    var clampedMousePositionToBoard = {
                        x: mousePositionToBoard.x,
                        y: Math.min(mousePositionToBoard.y, offset)
                    };

                    if (util.checkForValueInChunk(playerBoard[0], clampedMousePositionToBoard.x + 1, clampedMousePositionToBoard.y + 1, clampedMousePositionToBoard.x + 1, clampedMousePositionToBoard.y + shipBaySelected.childElementCount, [1, 2])) {
                        shipBaySelectedValid = false;
                    }

                    util.replaceBoardChunk(playerBoardHandles, clampedMousePositionToBoard.x, clampedMousePositionToBoard.y, clampedMousePositionToBoard.x, clampedMousePositionToBoard.y + shipBaySelected.childElementCount - 1, null, (element) => {
                        element.classList.add("hovering", shipBaySelectedValid ? "valid" : "invalid");
                    });
                }
            }
        }
    }

    function UpdatePlayerShipArray() {
        if (currentGameState != GAMESTATES.PREPARATION) {
            return;
        }

        util.replaceArrayChunk(playerBoard[0], 0, 0, 11, 11, 0);

        playerBoardShips.forEach((element) => {
            if (element.direction == SHIPDIRECTION.HORIZONTAL) {
                util.replaceBoardChunk(playerBoardHandles, element.apparentX, element.apparentY, element.apparentX + element.length - 1, element.apparentY, 0, (el) => {
                    el.classList.add("ship", "player");
                });

                util.replaceArrayChunk(playerBoard[0], element.apparentX, element.apparentY, element.apparentX + element.length + 1, element.apparentY + 2, 2);
                util.replaceArrayChunk(playerBoard[0], element.apparentX + 1, element.apparentY + 1, element.apparentX + element.length, element.apparentY + 1, 1);
            } else {
                util.replaceBoardChunk(playerBoardHandles, element.apparentX, element.apparentY, element.apparentX, element.apparentY + element.length - 1, 0, (el) => {
                    el.classList.add("ship", "player");
                });

                util.replaceArrayChunk(playerBoard[0], element.apparentX, element.apparentY, element.apparentX + 2, element.apparentY + element.length + 1, 2);
                util.replaceArrayChunk(playerBoard[0], element.apparentX + 1, element.apparentY + 1, element.apparentX + 1, element.apparentY + element.length, 1);
            }
        });
    }

    var shipBaySelectedDirection = SHIPDIRECTION.HORIZONTAL;

    var playerBoardShips = [];

    bodyPlayerBoard.addEventListener("mouseover", (event) => DrawBoard(event));

    bodyPlayerBoard.addEventListener("contextmenu", (event) => {
        if (currentGameState != GAMESTATES.PREPARATION) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        if (shipBaySelected != null) {
            shipBaySelectedDirection = shipBaySelectedDirection == SHIPDIRECTION.HORIZONTAL ? SHIPDIRECTION.VERTICAL : SHIPDIRECTION.HORIZONTAL;

            DrawBoard(event);
        }
    });

    bodyPlayerBoard.addEventListener("mouseout", (event) => {
        if (currentGameState != GAMESTATES.PREPARATION) {
            return;
        }

        event.stopPropagation();

        playerBoardHandles.forEach((element) => {
            element.classList.remove("hovering", "valid", "invalid");
        });
    });

    bodyPlayerBoard.addEventListener("click", (event) => {
        if (currentGameState != GAMESTATES.PREPARATION) {
            return;
        }

        if (shipBaySelected != null) {
            if (shipBaySelectedValid == true) {
                if (event.target != event.currentTarget) {
                    var mousePositionToBoard = util.oneToTwoD(event.target, playerBoardHandles, boardSize);

                    var offset = boardSize - shipBaySelected.childElementCount;

                    if (shipBaySelectedDirection == SHIPDIRECTION.HORIZONTAL) {
                        var clampedMousePositionToBoard = {
                            x: Math.min(mousePositionToBoard.x, offset),
                            y: mousePositionToBoard.y
                        };

                        util.replaceBoardChunk(playerBoardHandles, clampedMousePositionToBoard.x, clampedMousePositionToBoard.y, clampedMousePositionToBoard.x + shipBaySelected.childElementCount - 1, clampedMousePositionToBoard.y, null, (element) => {
                            element.classList.add("ship", "player");
                            element.classList.remove("hovering", "valid");
                        });

                        playerBoardShips.push({ apparentX: clampedMousePositionToBoard.x, apparentY: clampedMousePositionToBoard.y, direction: shipBaySelectedDirection, length: shipBaySelected.childElementCount });

                    } else if (shipBaySelectedDirection == SHIPDIRECTION.VERTICAL) {
                        var clampedMousePositionToBoard = {
                            x: mousePositionToBoard.x,
                            y: Math.min(mousePositionToBoard.y, offset)
                        };

                        util.replaceBoardChunk(playerBoardHandles, clampedMousePositionToBoard.x, clampedMousePositionToBoard.y, clampedMousePositionToBoard.x, clampedMousePositionToBoard.y + shipBaySelected.childElementCount - 1, null, (element) => {
                            element.classList.add("ship", "player");
                            element.classList.remove("hovering", "valid");
                        });

                        playerBoardShips.push({ apparentX: clampedMousePositionToBoard.x, apparentY: clampedMousePositionToBoard.y, direction: shipBaySelectedDirection, length: shipBaySelected.childElementCount });
                    }

                    shipBaySelected.classList.remove('selected');
                    shipBaySelected.style.display = "none";
                    shipBaySelected = null;

                    UpdatePlayerShipArray();

                    if (playerBoardShips.length == 10) {
                        playButton.style.display = 'block';
                        shipBay.style.display = 'none';
                    } else {
                        playButton.style.display = 'none';
                        shipBay.style.display = 'block';
                    }
                }
            }
        } else {
            if (event.target != event.currentTarget) {
                if (event.target.classList.contains('ship')) {
                    var mousePositionToBoard = util.oneToTwoD(event.target, playerBoardHandles, boardSize);
                    var clickedShip = null;

                    playerBoardShips.forEach((element) => {
                        if (element.direction == SHIPDIRECTION.HORIZONTAL) {
                            if (mousePositionToBoard.x >= element.apparentX && mousePositionToBoard.x <= element.apparentX + element.length - 1 && mousePositionToBoard.y == element.apparentY) {
                                clickedShip = element;
                                shipBaySelectedDirection = element.direction;
                                return;
                            }
                        } else {
                            if (mousePositionToBoard.x == element.apparentX && mousePositionToBoard.y >= element.apparentY && mousePositionToBoard.y <= element.apparentY + element.length - 1) {
                                clickedShip = element;
                                shipBaySelectedDirection = element.direction;
                                return;
                            }
                        }
                    });

                    if (clickedShip != null) {
                        for (var element of shipBayHandles) {
                            if (element.childElementCount == clickedShip.length && element.style.display == 'none') {
                                element.style.display = 'block';
                                shipBaySelected = element;
                                shipBaySelected.classList.add('selected');

                                shipBay.style.display = 'block';
                                playButton.style.display = 'none';

                                break;
                            }
                        }

                        if (clickedShip.direction == SHIPDIRECTION.HORIZONTAL) {
                            util.replaceBoardChunk(playerBoardHandles, clickedShip.apparentX, clickedShip.apparentY, clickedShip.apparentX + clickedShip.length - 1, clickedShip.apparentY, 0, (element) => {
                                element.classList.remove('ship', 'player');
                            });
                        } else {
                            util.replaceBoardChunk(playerBoardHandles, clickedShip.apparentX, clickedShip.apparentY, clickedShip.apparentX, clickedShip.apparentY + clickedShip.length - 1, 0, (element) => {
                                element.classList.remove('ship', 'player');
                            });
                        }

                        playerBoardShips.splice(playerBoardShips.indexOf(clickedShip), 1);

                        UpdatePlayerShipArray();
                        DrawBoard(event);
                    }
                }
            }
        }
    });

    //#endregion

    //#region [3] GAME LOOP
    var computerMemory = {
        output: {},

        guesses: {
            linear: [],
            linearRemaining: [],
            twoD: [[]],
            checkerBoardMatrix: GenerateCheckerboardMatrix(boardSize, 4, 1),
            optimalMatrix: [[]],
            shipsLeftToShoot: [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]
        },

        previousShot: {
            hit: false,
            x: -1,
            y: -1
        },

        targetShip: {
            discovered: false,
            sunken: false,
            direction: SHIPDIRECTION.NONE,
            discoveredX: -1,
            discoveredY: -1,
            toCheck: [],
            checking: DIRECTION.NONE,
            maxCoords: []
        },

        mode: AIMODE.HUNT
    };

    computerMemory.guesses.linear = Array.from(playerBoardHandles);
    computerMemory.guesses.linearRemaining = Array.from(playerBoardHandles);

    computerMemory.guesses.twoD = new Array(boardSize);
    for (let y = 0; y < computerMemory.guesses.twoD.length; y++) {
        computerMemory.guesses.twoD[y] = new Array(boardSize);

        for (let x = 0; x < boardSize; x++) {
            computerMemory.guesses.twoD[y][x] = 0;
        }
    }

    var sunkenShips = {
        byPlayer: 0,
        byComputer: 0
    };

    function StartGame() {
        bodyPlayerBoard.addEventListener("click", (event) => {
            if(event.target != event.currentTarget) {
                if(currentGameState == GAMESTATES.TURN.PLAYER) {
                    alert("Ruch gracza");
                }
            }
        });

        bodyComputerBoard.addEventListener("click", (event) => Turn(event, ENTITY.COMPUTER));

        bodyComputerBoard.addEventListener("contextmenu", (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (event.target != event.currentTarget) {
                if (event.target.classList.contains("marked")) {
                    event.target.classList.remove("marked");
                } else {
                    event.target.classList.add("marked");
                }
            }
        });

        currentGameState = GAMESTATES.TURN.PLAYER;

        document.body.classList.add("turn", "player");
    }

    function Turn(event, entity) {
        if (currentGameState != GAMESTATES.TURN.PLAYER && currentGameState != GAMESTATES.TURN.COMPUTER) {
            return;
        }

        if (currentGameState == GAMESTATES.TURN.PLAYER && entity == ENTITY.PLAYER) {
            alert('Ruch gracza');
            return;
        } else if (currentGameState == GAMESTATES.TURN.COMPUTER && entity == ENTITY.COMPUTER) {
            alert('Ruch komputera');
            return;
        }

        if (event.target != event.currentTarget) {
            var board;
            var array;
            var entityString;
            var longestShipArray;
            var shipsToShoot;

            if (entity == ENTITY.PLAYER) {
                array = playerBoard;
                board = playerBoardHandles;
                entityString = "player";
                longestShipArray = computerMemory.guesses.shipsLeftToShoot;
                shipsToShoot = document.querySelector("div.ships-to-destroy.player");
            } else if (entity == ENTITY.COMPUTER) {
                array = computerBoard;
                board = computerBoardHandles;
                entityString = "computer";
                longestShipArray = playerShipsLeftToDestroy;
                shipsToShoot = document.querySelector("div.ships-to-destroy.computer");
            }

            var hitField;

            hitField = util.oneToTwoD(event.target, board, boardSize);

            let refShip = array[BOARD.SHIP][hitField.y + 1][hitField.x + 1];
            let refShoot = array[BOARD.SHOOT][hitField.y + 1][hitField.x + 1];

            if (refShoot == 0) {
                array[BOARD.SHOOT][hitField.y + 1][hitField.x + 1] = 1;
                event.target.classList.add("shot");

                if (refShip == 1 || refShip == 2) {
                    let max = 0;
                    longestShipArray.forEach(element => {
                        if (element > max) {
                            max = element;
                        }
                    });

                    var result = CheckIfSunken(array[BOARD.SHIP], array[BOARD.SHOOT], hitField.x + 1, hitField.y + 1, max, entity);

                    if (result.sunken) {

                        if (result.len == 1) {
                            util.replaceBoardChunk(board, result.x - 1, result.y - 1, result.x - 1, result.y - 1, 0, (element) => {
                                element.classList.add(entityString, "sunken");
                                element.classList.add("border-all");
                            });

                            util.replaceArrayChunk(array[BOARD.SHOOT], result.x - 1, result.y - 1, result.x + 1, result.y + 1, 1);

                            util.replaceBoardChunkClamped(board, result.x - 2, result.y - 2, result.x, result.y, 0, 0, 9, (element) => {
                                if (element.classList.contains("sunken") == false) {
                                    if (element.classList.contains("miss") == false) {
                                        element.classList.add("shot");
                                        element.classList.add("miss");
                                        element.classList.add("no-need");
                                        element.innerHTML = "&middot;";
                                    }
                                }
                            });

                        } else if (result.dir == SHIPDIRECTION.HORIZONTAL) {
                            util.replaceBoardChunk(board, result.x - 1, result.y - 1, result.x + result.len - 2, result.y - 1, 0, (element, x, y, x1, y1, x2, y2) => {
                                element.classList.add(entityString, "sunken");
                                element.classList.add("border-horizontal");

                                if (x == x1) {
                                    element.classList.add("border-horizontal-left");
                                } else if (x == x2) {
                                    element.classList.add("border-horizontal-right");
                                }
                            });

                            util.replaceArrayChunk(array[BOARD.SHOOT], result.x - 1, result.y - 1, result.x + result.len, result.y + 1, 1);

                            util.replaceBoardChunkClamped(board, result.x - 2, result.y - 2, result.x + result.len - 1, result.y, 0, 0, 9, (element) => {
                                if (element.classList.contains("sunken") == false) {
                                    if (element.classList.contains("miss") == false) {
                                        element.classList.add("shot");
                                        element.classList.add("miss");
                                        element.classList.add("no-need");
                                        element.innerHTML = "&middot;";
                                    }
                                }
                            });
                        } else if (result.dir == SHIPDIRECTION.VERTICAL) {
                            util.replaceBoardChunk(board, result.x - 1, result.y - 1, result.x - 1, result.y + result.len - 2, 0, (element, x, y, x1, y1, x2, y2) => {
                                element.classList.add(entityString, "sunken");
                                element.classList.add("border-vertical");

                                if (y == y1) {
                                    element.classList.add("border-vertical-top");
                                } else if (y == y2) {
                                    element.classList.add("border-vertical-bottom");
                                }
                            });

                            util.replaceArrayChunk(array[BOARD.SHOOT], result.x - 1, result.y - 1, result.x + 1, result.y + result.len, 1);

                            util.replaceBoardChunkClamped(board, result.x - 2, result.y - 2, result.x, result.y + result.len - 1, 0, 0, 9, (element) => {
                                if (element.classList.contains("sunken") == false) {
                                    if (element.classList.contains("miss") == false) {
                                        element.classList.add("shot");
                                        element.classList.add("miss");
                                        element.classList.add("no-need");
                                        element.innerHTML = "&middot;";
                                    }
                                }
                            });
                        }

                        if (entity == ENTITY.PLAYER) {
                            computerMemory.targetShip.sunken = true;
                            computerMemory.targetShip.toCheck = [];
                        }

                        if (entity == ENTITY.PLAYER) {
                            sunkenShips.byComputer += 1;

                            for (let i = 0; i < computerMemory.guesses.shipsLeftToShoot.length; i++) {
                                if (computerMemory.guesses.shipsLeftToShoot[i] == result.len) {
                                    computerMemory.guesses.shipsLeftToShoot.splice(i, 1);
                                    break;
                                }
                            }

                            if (sunkenShips.byComputer == 10) {
                                EndGame(ENTITY.COMPUTER);
                            }
                        } else if (entity == ENTITY.COMPUTER) {
                            sunkenShips.byPlayer += 1;

                            for (let i = 0; i < playerShipsLeftToDestroy.length; i++) {
                                if (playerShipsLeftToDestroy[i] == result.len) {
                                    playerShipsLeftToDestroy.splice(i, 1);
                                    break;
                                }
                            }

                            if (sunkenShips.byPlayer == 10) {
                                EndGame(ENTITY.PLAYER);
                            }
                        }

                        for(let i = 0; i < 10; i++) {
                            if(shipsToShoot.children[i].classList.contains(`len${result.len}`) && !shipsToShoot.children[i].classList.contains("destroyed")) {
                                shipsToShoot.children[i].classList.add("destroyed");
                                break;
                            }
                        }
                    }
                }

                if (refShip == 1) {
                    event.target.innerHTML = "&#10006;";
                    event.target.classList.add("ship");


                    if (currentGameState == GAMESTATES.TURN.COMPUTER) {
                        ComputerTurn();
                    }
                } else if (refShip == 0 || refShip == 2) {
                    event.target.innerHTML = "&middot;";
                    event.target.classList.add("miss");
                    event.target.classList.remove("no-need");

                    if (currentGameState == GAMESTATES.TURN.PLAYER) {
                        currentGameState = GAMESTATES.TURN.COMPUTER;

                        document.body.classList.remove("player");
                        document.body.classList.add("computer");

                        ComputerTurn();
                    } else {
                        currentGameState = GAMESTATES.TURN.PLAYER;

                        document.body.classList.remove("computer");
                        document.body.classList.add("player");
                    }
                }
            } else {
                if (currentGameState == GAMESTATES.TURN.COMPUTER) {
                    console.warn("Wrong pick for AI, trying again");
                    ComputerTurn(true);
                }
            }
        }
    }

    function ComputerTurn(skipDelay = false) {
        if (difficultyLevel == LEVEL.EASY) {
            computerMemory.output.target = computerMemory.guesses.linearRemaining[Math.floor(Math.random() * computerMemory.guesses.linearRemaining.length)];

            computerMemory.guesses.linearRemaining.splice(computerMemory.guesses.linearRemaining.indexOf(computerMemory.output.target), 1);
        }

        if (difficultyLevel == LEVEL.MEDIUM || difficultyLevel == LEVEL.HARD) {

            if (computerMemory.previousShot.hit == true && computerMemory.mode == AIMODE.HUNT) {
                InitiateTargetShip();

                computerMemory.mode = AIMODE.TARGET;
            }

            if (computerMemory.previousShot.hit == true && computerMemory.targetShip.discovered == true && computerMemory.targetShip.checking != DIRECTION.NONE && computerMemory.targetShip.maxCoords.length == 0) {
                if (computerMemory.targetShip.checking == DIRECTION.UP || computerMemory.targetShip.checking == DIRECTION.DOWN) {
                    computerMemory.targetShip.direction = SHIPDIRECTION.VERTICAL;

                    RemoveDirFromArray(DIRECTION.LEFT);
                    RemoveDirFromArray(DIRECTION.RIGHT);

                    computerMemory.targetShip.maxCoords.push(computerMemory.targetShip.discoveredY);
                    computerMemory.targetShip.maxCoords.push(computerMemory.targetShip.discoveredY);
                } else if (computerMemory.targetShip.checking == DIRECTION.LEFT || computerMemory.targetShip.checking == DIRECTION.RIGHT) {
                    computerMemory.targetShip.direction = SHIPDIRECTION.HORIZONTAL;

                    RemoveDirFromArray(DIRECTION.UP);
                    RemoveDirFromArray(DIRECTION.DOWN);

                    computerMemory.targetShip.maxCoords.push(computerMemory.targetShip.discoveredX);
                    computerMemory.targetShip.maxCoords.push(computerMemory.targetShip.discoveredX);
                }
            }

            if (computerMemory.previousShot.hit == true && computerMemory.targetShip.discovered == true && computerMemory.targetShip.direction != SHIPDIRECTION.NONE) {
                if (computerMemory.targetShip.direction == SHIPDIRECTION.HORIZONTAL) {
                    computerMemory.targetShip.maxCoords[0] = Math.min(computerMemory.targetShip.maxCoords[0], computerMemory.previousShot.x);
                    computerMemory.targetShip.maxCoords[1] = Math.max(computerMemory.targetShip.maxCoords[1], computerMemory.previousShot.x);
                } else {
                    computerMemory.targetShip.maxCoords[0] = Math.min(computerMemory.targetShip.maxCoords[0], computerMemory.previousShot.y);
                    computerMemory.targetShip.maxCoords[1] = Math.max(computerMemory.targetShip.maxCoords[1], computerMemory.previousShot.y);
                }
            }

            if (computerMemory.previousShot.hit == false && computerMemory.targetShip.discovered == true) {
                RemoveDirFromArray(computerMemory.targetShip.checking);
            }

            if (computerMemory.targetShip.toCheck.length == 0 && computerMemory.targetShip.discovered == true) {
                //ship is sunken
                computerMemory.targetShip.maxCoords.sort();

                var shipLen = computerMemory.targetShip.maxCoords[1] - computerMemory.targetShip.maxCoords[0] + 1;

                //generate new filter matrix
                if (computerMemory.guesses.shipsLeftToShoot.includes(4)) { computerMemory.guesses.checkerBoardMatrix = GenerateCheckerboardMatrix(boardSize, 4, 1); }
                else if (computerMemory.guesses.shipsLeftToShoot.includes(3) || computerMemory.guesses.shipsLeftToShoot.includes(2)) { computerMemory.guesses.checkerBoardMatrix = GenerateCheckerboardMatrix(boardSize, 2, 1); }
                else { computerMemory.guesses.checkerBoardMatrix = GenerateCheckerboardMatrix(boardSize, 1, 0); }

                if (computerMemory.targetShip.direction == SHIPDIRECTION.HORIZONTAL) {
                    util.replaceArrayChunkClamped(computerMemory.guesses.twoD, computerMemory.targetShip.maxCoords[0] - 1, computerMemory.targetShip.discoveredY - 1, computerMemory.targetShip.maxCoords[1] + 1, computerMemory.targetShip.discoveredY + 1, 1, 0, boardSize - 1);
                } else if (computerMemory.targetShip.direction == SHIPDIRECTION.VERTICAL) {
                    util.replaceArrayChunkClamped(computerMemory.guesses.twoD, computerMemory.targetShip.discoveredX - 1, computerMemory.targetShip.maxCoords[0] - 1, computerMemory.targetShip.discoveredX + 1, computerMemory.targetShip.maxCoords[1] + 1, 1, 0, boardSize - 1);
                } else if (computerMemory.targetShip.direction == SHIPDIRECTION.NONE) {
                    util.replaceArrayChunkClamped(computerMemory.guesses.twoD, computerMemory.targetShip.discoveredX - 1, computerMemory.targetShip.discoveredY - 1, computerMemory.targetShip.discoveredX + 1, computerMemory.targetShip.discoveredY + 1, 1, 0, boardSize - 1);
                }

                ResetSunken();

                computerMemory.mode = AIMODE.HUNT;
            }

            ///////////////////////////////////////////////////////////////////////////////

            if (computerMemory.mode == AIMODE.HUNT) {
                ShootInRandomField();
            } else if (computerMemory.mode == AIMODE.TARGET) {
                if (computerMemory.targetShip.direction == SHIPDIRECTION.NONE) {
                    ShootInRandomDirectionFromDiscoveredShip();
                } else {
                    var enter = false;

                    if (computerMemory.previousShot.hit == true) {
                        var coordsFromDir = ResolveDirection(computerMemory.targetShip.checking);

                        var targetX = computerMemory.previousShot.x + coordsFromDir[0];
                        var targetY = computerMemory.previousShot.y + coordsFromDir[1];

                        if (targetX < 0 || targetX > boardSize - 1 || targetY < 0 || targetY > boardSize - 1) {
                            enter = true;
                        } else if (computerMemory.guesses.twoD[targetY][targetX] == 0) {
                            ShootInConstantDirectionFromGivenPosition(computerMemory.previousShot.x, computerMemory.previousShot.y, computerMemory.targetShip.checking);
                        } else {
                            enter = true;
                        }
                    } else {
                        enter = true;
                    }

                    if (enter == true) {
                        RemoveDirFromArray(computerMemory.targetShip.checking);

                        if (computerMemory.targetShip.toCheck.length > 0) {
                            computerMemory.targetShip.checking = PickRandomDirectionFromAvailable();

                            var coordsFromDir = ResolveDirection(computerMemory.targetShip.checking);

                            var targetX = computerMemory.targetShip.discoveredX + coordsFromDir[0];
                            var targetY = computerMemory.targetShip.discoveredY + coordsFromDir[1];

                            if (targetX < 0 || targetX > boardSize - 1 || targetY < 0 || targetY > boardSize - 1) {
                                RemoveDirFromArray(computerMemory.targetShip.checking);
                            } else if (computerMemory.guesses.twoD[targetY][targetX] == 0) {
                                ShootInConstantDirectionFromGivenPosition(computerMemory.targetShip.discoveredX, computerMemory.targetShip.discoveredY, computerMemory.targetShip.checking);
                            } else {
                                RemoveDirFromArray(computerMemory.targetShip.checking);
                            }
                        } else {
                            ComputerTurn();
                            return;
                        }
                    }
                }
            }


            UpdatePreviousShot();
        }

        if (skipDelay) {
            Turn(computerMemory.output, ENTITY.PLAYER)
        } else {
            setTimeout(() => Turn(computerMemory.output, ENTITY.PLAYER), computerTurnDelay);
        }
    }

    function InitiateTargetShip() {
        computerMemory.targetShip.discoveredX = computerMemory.previousShot.x;
        computerMemory.targetShip.discoveredY = computerMemory.previousShot.y;
        computerMemory.targetShip.discovered = true;

        computerMemory.targetShip.toCheck = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];

        var toRemove = [];

        computerMemory.targetShip.toCheck.forEach((element) => {
            var coordsFromDir = ResolveDirection(element);

            var modX = computerMemory.targetShip.discoveredX + coordsFromDir[0];
            var modY = computerMemory.targetShip.discoveredY + coordsFromDir[1];

            if (modX >= 0 && modX <= boardSize - 1 && modY >= 0 && modY <= boardSize - 1) {
                if (computerMemory.guesses.twoD[modY][modX] == 0) {
                    return; //safe direction
                }
            }

            toRemove.push(element);
        });

        toRemove.forEach((element) => {
            RemoveDirFromArray(element);
        });
    }

    function ResetSunken() {
        computerMemory.targetShip.discovered = false;
        computerMemory.targetShip.sunken = false;
        computerMemory.targetShip.discoveredX = -1;
        computerMemory.targetShip.discoveredY = -1;
        computerMemory.targetShip.direction = SHIPDIRECTION.NONE;
        computerMemory.targetShip.checking = DIRECTION.NONE;
        computerMemory.targetShip.toCheck = [];
        computerMemory.targetShip.maxCoords = [];
    }

    function ShootInRandomDirectionFromDiscoveredShip() {
        var randomDir = PickRandomDirectionFromAvailable();

        computerMemory.targetShip.checking = randomDir;

        var coordsFromDir = ResolveDirection(randomDir);

        var targetX = computerMemory.targetShip.discoveredX + coordsFromDir[0];
        var targetY = computerMemory.targetShip.discoveredY + coordsFromDir[1];

        computerMemory.output.target = computerMemory.guesses.linear[util.twoToOneD(targetX, targetY, boardSize)];

        computerMemory.guesses.twoD[targetY][targetX] = 1;
    }

    function ShootInConstantDirectionFromGivenPosition(x, y, dir) {
        var coordsFromDir = ResolveDirection(dir);

        var targetX = x + coordsFromDir[0];
        var targetY = y + coordsFromDir[1];

        computerMemory.output.target = computerMemory.guesses.linear[util.twoToOneD(targetX, targetY, boardSize)];

        computerMemory.guesses.twoD[targetY][targetX] = 1;
    }

    function ShootInRandomField() {
        if (difficultyLevel == LEVEL.HARD) {
            //find longest ship left to destroy
            var max = 0;

            computerMemory.guesses.shipsLeftToShoot.forEach(element => {
                if (element > max) {
                    max = element;
                }
            });

            GenerateOptimalMatrix(max, false);

            //find the biggest value in optimalMatrix
            max = 0;

            computerMemory.guesses.optimalMatrix.forEach(element => {
                element.forEach((el) => {
                    if (el > max) {
                        max = el;
                    }
                });
            });

            //take all elements such that element == max && not blocked by filtering matrix
            computerMemory.guesses.linearRemaining = [];

            for (let y = 0; y < boardSize; y++) {
                for (let x = 0; x < boardSize; x++) {
                    if (computerMemory.guesses.optimalMatrix[y][x] == max) {
                        computerMemory.guesses.linearRemaining.push(computerMemory.guesses.linear[10 * y + x]);
                    }
                }
            }

            //choose
        } else if (difficultyLevel <= LEVEL.MEDIUM) {
            computerMemory.guesses.linearRemaining = [];

            for (let y = 0; y < computerMemory.guesses.twoD.length; y++) {
                for (let x = 0; x < computerMemory.guesses.twoD[y].length; x++) {
                    if (computerMemory.guesses.twoD[y][x] == 0) {
                        computerMemory.guesses.linearRemaining.push(computerMemory.guesses.linear[10 * y + x]);
                    }
                }
            }
        }

        var randomIndex = Math.floor(Math.random() * computerMemory.guesses.linearRemaining.length);

        computerMemory.output.target = computerMemory.guesses.linearRemaining[randomIndex];

        var originalArrayIndex = util.oneToTwoD(computerMemory.output.target, computerMemory.guesses.linear, boardSize);

        computerMemory.guesses.twoD[originalArrayIndex.y][originalArrayIndex.x] = 1;
    }

    function PickRandomDirectionFromAvailable() {
        return computerMemory.targetShip.toCheck[Math.floor(Math.random() * computerMemory.targetShip.toCheck.length)];
    }

    function RemoveDirFromArray(dir) {
        for (let i = 0; i < computerMemory.targetShip.toCheck.length; i++) {
            if (dir == computerMemory.targetShip.toCheck[i]) {
                computerMemory.targetShip.toCheck.splice(i, 1);
                break;
            }
        }
    }

    function UpdatePreviousShot() {
        var tile = util.oneToTwoD(computerMemory.output.target, computerMemory.guesses.linear, boardSize);

        computerMemory.previousShot.x = tile.x;
        computerMemory.previousShot.y = tile.y;
        computerMemory.previousShot.hit = playerBoard[BOARD.SHIP][tile.y + 1][tile.x + 1] == 1;

    }

    function GenerateCheckerboardMatrix(sideLen, spacing = 2, offset = 0) {
        var out = []

        for (let y = 0; y < sideLen; y++) {
            out.push([]);

            for (let x = 0; x < sideLen; x++) {
                out[y].push((x + y + offset) % spacing == 0 ? 1 : 0);
            }
        }

        return JSON.parse(JSON.stringify(out));
    }

    function GenerateEmptyBoard(sideLen) {
        var out = [];

        for (let y = 0; y < sideLen; y++) {
            out.push([]);

            for (let x = 0; x < sideLen; x++) {
                out[y].push(0);
            }
        }

        return JSON.parse(JSON.stringify(out));
    }

    function GenerateOptimalMatrix(maxLength, useFilterMatrix = false) {
        computerMemory.guesses.optimalMatrix = GenerateEmptyBoard(boardSize);

        var cb = null;

        if (useFilterMatrix == true) {
            cb = (a, x, y, v) => {
                if (computerMemory.guesses.checkerBoardMatrix[y][x] == 1) {
                    a[y][x] = a[y][x] + v;
                }
            };
        }

        //Try horizontal
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize - maxLength + 1; x++) {
                if (util.checkForValueInChunk(computerMemory.guesses.twoD, x, y, x + maxLength - 1, y, [1]) == false) {
                    util.incrementValueInArrayChunk(computerMemory.guesses.optimalMatrix, x, y, x + maxLength - 1, y, 1, cb);
                }
            }
        }

        //Try vertical
        for (let y = 0; y < boardSize - maxLength + 1; y++) {
            for (let x = 0; x < boardSize; x++) {
                if (util.checkForValueInChunk(computerMemory.guesses.twoD, x, y, x, y + maxLength - 1, [1]) == false) {
                    util.incrementValueInArrayChunk(computerMemory.guesses.optimalMatrix, x, y, x, y + maxLength - 1, 1, cb);
                }
            }
        };
    }

    function CheckIfSunken(arrShip, arrShoot, x, y, longestShip = 4, entity) {
        let dir = null;
        let dirFromOrigin = DIRECTION.NONE;
        let apparentX = null;
        let apparentY = null;

        if (arrShip[y][x] == TILE.SHIP) {
            apparentX = x;
            apparentY = y;

            if (arrShip[y][x - 1] == TILE.SHIP || arrShip[y][x + 1] == TILE.SHIP) {
                dir = SHIPDIRECTION.HORIZONTAL;

                while (true) {
                    if (arrShip[y][apparentX - 1] == TILE.SHIP) {
                        apparentX--;
                    } else {
                        break;
                    }
                }
            } else if (arrShip[y - 1][x] == TILE.SHIP || arrShip[y + 1][x] == TILE.SHIP) {
                dir = SHIPDIRECTION.VERTICAL;

                while (true) {
                    if (arrShip[apparentY - 1][x] == TILE.SHIP) {
                        apparentY--;
                    } else {
                        break;
                    }
                }
            } else {
                if ((arrShoot[apparentY][apparentX - 1] == 1 && arrShoot[apparentY][apparentX + 1] == 1 && arrShoot[apparentY - 1][apparentX] == 1 && arrShoot[apparentY + 1][apparentX] == 1 && arrShoot[apparentY][apparentX] == 1) || longestShip == 1) {
                    return { sunken: true, x: apparentX, y: apparentY, dir: dir, len: 1 };
                } else {
                    return { sunken: false };
                }
            }

            let origAX = apparentX;
            let origAY = apparentY;

            if (dir == SHIPDIRECTION.HORIZONTAL) {
                while (true) {
                    if (arrShip[apparentY][apparentX] == TILE.SHIP && arrShoot[apparentY][apparentX] == 1) {
                        apparentX++;

                        if (apparentX - origAX == longestShip) {
                            return { sunken: true, x: origAX, y: origAY, dir: dir, len: longestShip };
                        }
                    } else if (arrShip[apparentY][apparentX] == TILE.SHIP && arrShoot[apparentY][apparentX] != 1) {
                        return { sunken: false };
                    } else if (arrShip[apparentY][apparentX] == TILE.BOUNDARY) {
                        if (arrShoot[apparentY][apparentX] == 1 && arrShoot[origAY][origAX - 1] == 1) {
                            return { sunken: true, x: origAX, y: origAY, dir: dir, len: apparentX - origAX };
                        } else {
                            return { sunken: false };
                        }
                    }
                }
            } else if (dir == SHIPDIRECTION.VERTICAL) {
                while (true) {
                    if (arrShip[apparentY][apparentX] == TILE.SHIP && arrShoot[apparentY][apparentX] == 1) {
                        apparentY++;

                        if (apparentY - origAY == longestShip) {
                            return { sunken: true, x: origAX, y: origAY, dir: dir, len: longestShip };
                        }
                    } else if (arrShip[apparentY][apparentX] == TILE.SHIP && arrShoot[apparentY][apparentX] != 1) {
                        return { sunken: false };
                    } else if (arrShip[apparentY][apparentX] == TILE.BOUNDARY) {
                        if (arrShoot[apparentY][apparentX] == 1 && arrShoot[origAY - 1][origAX] == 1) {
                            return { sunken: true, x: origAX, y: origAY, dir: dir, len: apparentY - origAY };
                        } else {
                            return { sunken: false };
                        }
                    }
                }
            }

        } else if (arrShip[y][x] == TILE.BOUNDARY) {
            if (arrShip[y][x - 1] == TILE.SHIP && arrShoot[y][x - 1] == 1) {
                dirFromOrigin = DIRECTION.LEFT;
                dir = SHIPDIRECTION.HORIZONTAL;
            } else if (arrShip[y][x + 1] == TILE.SHIP && arrShoot[y][x + 1] == 1) {
                dirFromOrigin = DIRECTION.RIGHT;
                dir = SHIPDIRECTION.HORIZONTAL;
            } else if (arrShip[y - 1][x] == TILE.SHIP && arrShoot[y - 1][x] == 1) {
                dirFromOrigin = DIRECTION.UP;
                dir = SHIPDIRECTION.VERTICAL;
            } else if (arrShip[y + 1][x] == TILE.SHIP && arrShoot[y + 1][x] == 1) {
                dirFromOrigin = DIRECTION.DOWN;
                dir = SHIPDIRECTION.VERTICAL;
            } else {
                return { sunken: false };
            }

            let resolved = ResolveDirection(dirFromOrigin);
            let apparentX = x + resolved[0];
            let apparentY = y + resolved[1];
            let origAX = null;
            let origAY = null;

            if (entity == ENTITY.COMPUTER) {
                if (computerBoardHandles[(apparentY - 1) * 10 + apparentX - 1].classList.contains("sunken")) {
                    return { sunken: false };
                }
            } else if (entity == ENTITY.PLAYER) {
                if (playerBoardHandles[(apparentY - 1) * 10 + apparentX - 1].classList.contains("sunken")) {
                    return { sunken: false };
                }
            }

            if (arrShip[apparentY][apparentX - 1] == TILE.BOUNDARY && arrShip[apparentY][apparentX + 1] == TILE.BOUNDARY && arrShip[apparentY - 1][apparentX] == TILE.BOUNDARY && arrShip[apparentY + 1][apparentX] == TILE.BOUNDARY) {
                if ((arrShoot[apparentY][apparentX - 1] == 1 && arrShoot[apparentY][apparentX + 1] == 1 && arrShoot[apparentY - 1][apparentX] == 1 && arrShoot[apparentY + 1][apparentX] == 1 && arrShoot[apparentY][apparentX] == 1) || longestShip == 1) {
                    return { sunken: true, x: apparentX, y: apparentY, dir: dir, len: 1 };
                } else {
                    return { sunken: false };
                }
            } else {
                if (dir == SHIPDIRECTION.HORIZONTAL) {
                    if (arrShip[apparentY - 1][apparentX] == TILE.SHIP || arrShip[apparentY + 1][apparentX] == TILE.SHIP) {
                        return { sunken: false };
                    }
                } else {
                    if (arrShip[apparentY][apparentX - 1] == TILE.SHIP || arrShip[apparentY][apparentX + 1] == TILE.SHIP) {
                        return { sunken: false };
                    }
                }
            }

            if (dir == SHIPDIRECTION.HORIZONTAL) {
                while (true) {
                    if (arrShip[y][apparentX - 1] == TILE.SHIP) {
                        apparentX--;
                    } else {
                        break;
                    }
                }

                origAX = apparentX;
                origAY = apparentY;

                while (true) {
                    if (arrShip[apparentY][apparentX] == TILE.SHIP && arrShoot[apparentY][apparentX] == 1) {
                        apparentX++;

                        if (Math.abs(apparentX - origAX) == longestShip) {
                            return { sunken: true, x: origAX, y: origAY, dir: dir, len: longestShip };
                        }
                    } else if (arrShip[apparentY][apparentX] == TILE.SHIP && arrShoot[apparentY][apparentX] != 1) {
                        return { sunken: false };
                    } else if (arrShip[apparentY][apparentX] == TILE.BOUNDARY) {
                        if (arrShoot[apparentY][apparentX] == 1 && arrShoot[origAY][origAX - 1] == 1) {
                            return { sunken: true, x: origAX, y: origAY, dir: dir, len: apparentX - origAX };
                        } else {
                            return { sunken: false };
                        }
                    }
                }
            } else {
                while (true) {
                    if (arrShip[apparentY - 1][x] == TILE.SHIP) {
                        apparentY--;
                    } else {
                        break;
                    }
                }

                origAX = apparentX;
                origAY = apparentY;

                while (true) {
                    if (arrShip[apparentY][apparentX] == TILE.SHIP && arrShoot[apparentY][apparentX] == 1) {
                        apparentY++;

                        if (Math.abs(apparentY - origAY) == longestShip) {
                            return { sunken: true, x: origAX, y: origAY, dir: dir, len: longestShip };
                        }
                    } else if (arrShip[apparentY][apparentX] == TILE.SHIP && arrShoot[apparentY][apparentX] != 1) {
                        return { sunken: false };
                    } else if (arrShip[apparentY][apparentX] == TILE.BOUNDARY) {
                        if (arrShoot[apparentY][apparentX] == 1 && arrShoot[origAY - 1][origAX] == 1) {
                            return { sunken: true, x: origAX, y: origAY, dir: dir, len: apparentY - origAY };
                        } else {
                            return { sunken: false };
                        }
                    }
                }
            }
        }
    }

    function EndGame(whoWon) {
        setTimeout(() => {
            if (whoWon == ENTITY.COMPUTER) {
                currentGameState = GAMESTATES.WIN.COMPUTER;

                VisuallizeComputerShips(true);

                setTimeout(() => {
                    alert("COMPUTER won!");

                    setTimeout(() => RestartGame(), gameRestartDelay);
                }, 50);


            } else if (whoWon == ENTITY.PLAYER) {
                currentGameState = GAMESTATES.WIN.PLAYER;

                setTimeout(() => {
                    alert("PLAYER won!");

                    setTimeout(() => RestartGame(), gameRestartDelay);
                }, 50);


            }
        }, 10);
    }

    function RestartGame() {
        document.body.innerHTML = "";

        document.body.classList.remove("turn", "player", "computer");

        cheatCode.displayComputerShips(false);
        cheatCode.displayOptimalMatrix(false);

        Game();
    }

    var optimalMatrixIntervalHandle;

    function DisplayOptimalMatrix(bool) {
        if (bool) {
            if (optimalMatrixIntervalHandle) {
                clearInterval(optimalMatrixIntervalHandle);
            }

            optimalMatrixIntervalHandle = setInterval(() => {
                if (computerMemory.guesses.optimalMatrix.length == boardSize) {
                    var maxValue = 0;

                    computerMemory.guesses.optimalMatrix.forEach(element => {
                        element.forEach(el => {
                            if (el > maxValue) {
                                maxValue = el;
                            }
                        });
                    });

                    for (let y = 0; y < boardSize; y++) {
                        for (let x = 0; x < boardSize; x++) {
                            if (playerBoardHandles[10 * y + x].innerHTML != "·" && playerBoardHandles[10 * y + x].innerHTML != "✖") {
                                if (computerMemory.mode == AIMODE.TARGET) {
                                    playerBoardHandles[10 * y + x].innerHTML = "";
                                } else {
                                    if (computerMemory.guesses.optimalMatrix[y][x] == maxValue) {
                                        playerBoardHandles[10 * y + x].innerHTML = `<span style='color:red; font-weight: bold;'>${computerMemory.guesses.optimalMatrix[y][x]}</span>`;
                                    } else {
                                        playerBoardHandles[10 * y + x].innerHTML = `<span style='color:black;'>${computerMemory.guesses.optimalMatrix[y][x]}</span>`;
                                    }
                                }
                            }
                        }
                    }
                }
            }, 40);
        } else {
            if (optimalMatrixIntervalHandle) {
                clearInterval(optimalMatrixIntervalHandle);

                for (let y = 0; y < boardSize; y++) {
                    for (let x = 0; x < boardSize; x++) {
                        if (playerBoardHandles[10 * y + x].innerHTML != "·" && playerBoardHandles[10 * y + x].innerHTML != "✖") {
                            playerBoardHandles[10 * y + x].innerHTML = "";
                        }
                    }
                }
            }
        }

    }
    //#endregion

    cheatCode = new CheatCode();

    cheatCode.restartGame = RestartGame;
    cheatCode.displayComputerShips = VisuallizeComputerShips;
    cheatCode.displayOptimalMatrix = DisplayOptimalMatrix;

    cheatCode.Usage();
}

var cheatCode;

Game();