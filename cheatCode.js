class CheatCode {
    constructor() {
        this.restartGame = null;
        this.displayComputerShips = null;
        this.displayOptimalMatrix = null;
    }

    Usage() {
        console.log("%c Cheat Codes%c       you dirty cheater", "font-size:48px;color:red;", "font-size:8px;line-height:8px;");
        console.log("cheatCode.%crestartGame() %c- restart the game", "color:yellow", "color:white");
        console.log("cheatCode.%cdisplayComputerShips(%cbool%c) %c- show computer's ships", "color:yellow", "color:lightgreen", "color:yellow", "color:white");
        console.log("cheatCode.%cdisplayOptimalMatrix(%cbool%c) %c- show optimal shoot matrix", "color:yellow", "color:lightgreen", "color:yellow", "color:white");
    }
}