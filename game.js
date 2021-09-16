const prompt = require('prompt-sync')({sigint: true});

// -----------------------------------------------------------------------------


const hatChar = ' ^ ';
const holeChar = '░O░';
const fieldChar = '░░░';
const pathChar = ' * ';
const fallChar = ' O ';

class Field {
  constructor(field){
    // Create field
    this._field = field;
    this._xDist = 0;
    this._yDist = 0;

    // Determine start and end nodes
    this._playerPos = [];
    this._hatPos = [];

    // User input validation properties
    this._locatedHat = false;
    this._tryingAgain = false;
    this._notMoved = true

    // Terminating properties
    this._isAlive = true;
    this._hasWon = false;
  }

  get playerPos() {
    return this._playerPos;
  }

  get hatPos() {
    return this._hatPos;
  }

  print(){
    for (let i=0; i<this._field.length; ++i){
        console.log(this._field[i].join(''));
    }
  }

  setDimensions(){
    this._xDist = this._field[0].length;
    this._yDist = this._field.length;
  }

  findPlayer(){
    this.setDimensions();

    // Find player
    let foundPlayer = false;

    for (let i=0; i<this._yDist; ++i){
      for (let j=0; j<this._xDist; ++j){
        if (this._field[i][j]===pathChar){
          this._playerPos = [j, i];
          foundPlayer = true;
          break;
        }
      }

      if(foundPlayer){
        break;
      }
    }
  }

  findHat(){
    this.setDimensions();

    // Find Hat
    this._locatedHat = false;

    for (let i=0; i<this._yDist; ++i){
      for (let j=0; j<this._xDist; ++j){
        if (this._field[i][j]===hatChar){
          this._hatPos = [j, i];
          this._locatedHat = true;
          break;
        }
      }
      
      if(this._locatedHat){
        break;
      }
    }

    return this._locatedHat;
  }

  askInput(){
    if (!this._tryingAgain){
      console.log(`\n+--------------+`);
      console.log(`|   W      ↑   |`);
      console.log(`| A S D  ← ↓ → |`);
      console.log(`+--------------+`);
    }
  }

  step(){
    // Step out of bounds
    if (this._playerPos[0] < 0 || this._playerPos[1] < 0 || this._playerPos[0] >= this._xDist || this._playerPos[1] >= this._yDist ){
      this._isAlive = false;
    }

    // Found hat
    if (this._field[this._playerPos[1]][this._playerPos[0]] !== holeChar && this._isAlive){
      this._field[this._playerPos[1]][this._playerPos[0]] = pathChar;

      if (this._playerPos[0] === this._hatPos[0] && this._playerPos[1] === this._hatPos[1]){
        this._hasWon = true;
      }

    } else {
      // Fall into the hole
      this._field[this._playerPos[1]][this._playerPos[0]] = fallChar;
      this._isAlive = false;
    }
  }

  checkIfBackTracked(movement){
    if (this._field[this._playerPos[1]][this._playerPos[0]] === pathChar){
      console.log(`You can't retrace your path. Please try again. If you are stuck, you can quit by clicking Ctrl/Command + C.`);
      switch (movement){
        case 4:
          ++this._playerPos[1];
          this._notMoved = true;
          break;
        case 1:
          ++this._playerPos[0];
          this._notMoved = true;
          break;
        case 2:
          --this._playerPos[1];
          this._notMoved = true;
          break;
        case 3:
          ++this._playerPos[0];
          this._notMoved = true;
          break;
        default:
          this._notMoved = false;
          break;
      }
    } else {
      this._notMoved = false
    }
  }

  runGame(){
    this.findPlayer();
    this.findHat();

    while (!this._hasWon && this._isAlive && !this._hasWon){
      this.print();

      let userInput = 'W';
      this.askInput();

      // Take a step
      this._notMoved = true;

      while (this._notMoved){
      
        let rawInput = prompt(`Choose your next move: `)
        userInput = String(rawInput);
        console.log();

        switch (userInput){
          case 'W':
            --this._playerPos[1];
            this._tryingAgain = false;
            this.checkIfBackTracked(4);
            this.step();
            break;
          case 'w':
            --this._playerPos[1];
            this._tryingAgain = false;
            this.checkIfBackTracked(4);
            this.step();
            break;
          case 'A':
            --this._playerPos[0];
            this._tryingAgain = false;
            this.checkIfBackTracked(1);
            this.step();
            break;
          case 'a':
            --this._playerPos[0];
            this._tryingAgain = false;
            this.checkIfBackTracked(1);
            this.step();
            break;
          case 'S':
            ++this._playerPos[1];
            this._tryingAgain = false;
            this.checkIfBackTracked(2);
            this.step();
            break;
          case 's':
            ++this._playerPos[1];
            this._tryingAgain = false;
            this.checkIfBackTracked(2);
            this.step();
            break;
          case 'D':
            ++this._playerPos[0];
            this._tryingAgain = false;
            this.checkIfBackTracked(3);
            this.step();
            break;
          case 'd':
            ++this._playerPos[0];
            this._tryingAgain = false;
            this.checkIfBackTracked(3);
            this.step();
            break;
          default:
            console.log(`Invalid input. Please try again.`);
            this._tryingAgain = true;
            break;
        }
      }
    }

    this.print();

    this._hasWon ? console.log(`\nYou found the hat!`) : console.log(`\nYou fell into a hole!`)
  }
  
  static generateField(x, y, percent){
    // Generate number of nodes (holes + starting point + hat)
    let numNodes, area = x * y;

    if (percent >= 0 && percent < 1){
      numNodes = Math.floor(percent * area);
    } else if (percent >= 1 && percent <= 100) {
      numNodes = Math.floor((percent/100) * area);
    } else {
      try {
        throw Error('Entered an invalid percentage input.')
      } catch (e) {
        console.log(e);
      }
    }

    numNodes += 2; // last two are starting point and hat



    // Generate a plain field (no holes)
    const randomField = [];

    for (let i=0; i<y; ++i){
      randomField.push([]);
    }

    for (let i=0; i<y; ++i){
      for (let j=0; j<x; ++j){
        randomField[i].push(fieldChar);
      }
    }



    // Generate position of nodes
    const posNodes = []; // index+1 numbering

    do {
      let toPush = Math.floor(Math.random()*area)+1;
      let isDuplicate = false;
      for (let i=0; i<posNodes.length; ++i){
        if (toPush === posNodes[i]){
          isDuplicate = true;
        }
      }

      if (!isDuplicate){
        posNodes.push(toPush);
        --numNodes;
      }

    } while (numNodes > 0);



    // Find index location equivalent of posNodes
    const posNodesIndex = [];

    for (let i=0; i<posNodes.length; ++i){
      posNodesIndex.push([posNodes[i]%x, Math.floor(posNodes[i]%x===0 ? posNodes[i]/x-1 : posNodes[i]/x)]);
    }



    // "Dig" the holes in the field based on posNodesIndex
    for (let i=0; i<posNodesIndex.length-2; ++i){
      randomField[posNodesIndex[i][1]][posNodesIndex[i][0]] = holeChar;
    }



    // Drop player and hat
    randomField[posNodesIndex[posNodesIndex.length-2][1]][posNodesIndex[posNodesIndex.length-2][0]] = pathChar;
    randomField[posNodesIndex[posNodesIndex.length-1][1]][posNodesIndex[posNodesIndex.length-1][0]] = hatChar;

    // Return generated random field
    return randomField;
  }
}

let validModeInput = false;

while (!validModeInput){
  console.log(`Find the hat!

Choose difficulty:
(1) Easy
(2) Moderate
( ) Difficult (soon!)`);
  let rawMode = prompt(`> `)

  mode = Number(rawMode);

  switch (mode){
    case 1:
      validModeInput = true;
      const easyField = new Field(Field.generateField(10, 10, 20));
      easyField.runGame();
      break;
    case 2:
      validModeInput = true;
      const moderateField = new Field(Field.generateField(10, 10, 35));
      moderateField.runGame();
      break;
    default:
      console.log(`Please enter a valid input.`)
      break;
  }
}


