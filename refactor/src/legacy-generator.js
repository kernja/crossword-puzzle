const DEFAULT_WORDS = [
  { term: "corgi", definition: "Dog breed loved by the Royal Family." },
  { term: "apple", definition: "Fruit given to teachers by school children." },
  { term: "hamburger", definition: "Sandwich served at McDonald's." },
  { term: "minivan", definition: "Vehicle associated with families that have kids." },
  { term: "coffee", definition: "Warm beverage that helps tired people function." },
  { term: "yogurt", definition: "Cultured dairy product served at breakfast." },
  { term: "firefighter", definition: "Professional that rescues people from burning buildings." },
  { term: "banana", definition: "Fruit associated with monkeys and gorillas." },
  { term: "pillow", definition: "Something you rest your head on at night." },
  { term: "laptop", definition: "A portable computer." },
  { term: "television", definition: "Used to watch streaming video services while sitting on a couch." },
  { term: "mechanic", definition: "Profssional that fixes broken vehicles." },
  { term: "headphones", definition: "Used for listening to music." },
  { term: "sunglasses", definition: "Wear these to protect your vision." },
  { term: "sundress", definition: "Light outfit popular with women in the summer." },
  { term: "icecream", definition: "Frozen dessert popular with people during the summertime." },
  { term: "lawnmower", definition: "Used to cut grass." },
  { term: "widow", definition: "A woman whose husband has died." },
  { term: "ant", definition: "Small insect that lives in a colony." },
  { term: "cat", definition: "Raining ___ and dogs." },
  { term: "homework", definition: "Assigned by teachers for students to do at home." },
  { term: "bat", definition: "Sport equipment or animal that flies in the air." },
  { term: "raisins", definition: "Dried grapes." },
  { term: "orange", definition: "Citrus fruit." },
  { term: "battery", definition: "Stores electricity." },
  { term: "water", definition: "Hydrates plants." },
  { term: "barn", definition: "Holds livestock and is painted red." },
  { term: "elephant", definition: "Large animal with a trunk." },
  { term: "forest", definition: "Area with lots of trees." },
  { term: "river", definition: "Flowing with water." },
  { term: "loofa", definition: "Bathing apparatus." },
  { term: "mouse", definition: "Animal that squeaks." },
  { term: "foul", definition: "Violation; wrongdoing." },
  { term: "error", definition: "Unexpected negative event in computing." }
];

function sortLikeLegacy(items, rng) {
  return [...items].sort(() => 0.5 - rng());
}

function createSeededRng(seed) {
  let state = seed >>> 0;

  return function seededRandom() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function createLegacyGameObject(options = {}) {
  const playfieldSize = options.playfieldSize ?? 15;
  const allAvailableWords = [...(options.words ?? DEFAULT_WORDS)];
  const rng = options.rng ?? Math.random;

  const go = {
    allAvailableWords,
    wordPool: [],
    placedWords: [],
    playfieldSize,
    grid: []
  };

  go.grid = Array.from({ length: go.playfieldSize }, () =>
    Array(go.playfieldSize)
      .fill(null)
      .map(() => ({ letter: "", horizontalTerm: "", verticalTerm: "" }))
  );
  go.wordPool = sortLikeLegacy(go.allAvailableWords, rng).filter((word) => word.term.length < go.playfieldSize);

  go.isLocationOutOfBounds = function isLocationOutOfBounds(x, y) {
    if (x < 0) return true;
    if (x >= this.playfieldSize) return true;
    if (y < 0) return true;
    if (y >= this.playfieldSize) return true;

    return false;
  };

  go.isLocationOccupied = function isLocationOccupied(x, y, ignoreBounds = false) {
    if (this.isLocationOutOfBounds(x, y) && ignoreBounds === true) return false;
    if (this.isLocationOutOfBounds(x, y)) return true;
    if (this.grid[x][y].letter === "") return false;

    return true;
  };

  go.isLocationFilled = function isLocationFilled(x, y) {
    if (this.isLocationOutOfBounds(x, y)) return true;

    return this.grid[x][y].horizontalTerm !== "" && this.grid[x][y].verticalTerm !== "";
  };

  go.isLocationOverlapping = function isLocationOverlapping(x, y, letter = "") {
    if (this.grid[x][y].letter === "") return false;
    if (this.grid[x][y].letter === letter) return true;

    return false;
  };

  go.isLocationValid = function isLocationValid(x, y, letter, orientation, boundsCheckOnly = false) {
    if (boundsCheckOnly && this.isLocationOutOfBounds(x, y)) return true;

    if (orientation === 0) {
      if (this.isLocationOutOfBounds(x, y)) return false;
      if (this.isLocationFilled(x, y)) return false;
      if (this.isLocationOverlapping(x, y, letter) === false) {
        if (this.isLocationOccupied(x, y - 1)) return false;
        if (this.isLocationOccupied(x, y + 1)) return false;
        if (this.isLocationOccupied(x, y)) return false;
      }
    } else {
      if (this.isLocationOutOfBounds(x, y)) return false;
      if (this.isLocationFilled(x, y)) return false;
      if (this.isLocationOverlapping(x, y, letter) === false) {
        if (this.isLocationOccupied(x - 1, y)) return false;
        if (this.isLocationOccupied(x + 1, y)) return false;
        if (this.isLocationOccupied(x, y)) return false;
      }
    }

    return true;
  };

  go.setLetterAtLocation = function setLetterAtLocation(x, y, word, letter, orientation) {
    this.grid[x][y].letter = letter;
    if (orientation === 0) {
      this.grid[x][y].horizontalTerm = word.term;
    } else {
      this.grid[x][y].verticalTerm = word.term;
    }
  };

  go.setWordAtLocation = function setWordAtLocation(x, y, word, orientation) {
    this.placedWords.push({ x, y, term: word.term, definition: word.definition, orientation, number: 0 });
    this.wordPool = sortLikeLegacy(
      this.wordPool.filter((candidate) => candidate.term !== word.term),
      rng
    );

    for (let i = 0; i < word.term.length; i += 1) {
      if (orientation === 0) {
        this.setLetterAtLocation(x + i, y, word, word.term[i], orientation);
      } else {
        this.setLetterAtLocation(x, y + i, word, word.term[i], orientation);
      }
    }

    for (let i = 0; i < word.term.length; i += 1) {
      if (orientation === 0) {
        if (this.isLocationFilled(x + i, y) === false) this.testWordsAtLocation(x + i, y, word.term[i], 1);
      } else if (this.isLocationFilled(x, y + i) === false) {
        this.testWordsAtLocation(x, y + i, word.term[i], 0);
      }
    }
  };

  go.testWordsAtLocation = function testWordsAtLocation(x, y, letter, orientation) {
    const potentialWords = this.wordPool.filter((word) => word.term.indexOf(letter) >= 0);
    if (potentialWords.length === 0) return;

    let placedWord = false;

    for (let wi = 0; wi < potentialWords.length && placedWord === false; wi += 1) {
      const word = potentialWords[wi];
      let li = word.term.indexOf(letter);

      while (li !== -1 && placedWord === false) {
        const offset = 0 - li;
        let canPlaceWord = true;

        if (orientation === 0) {
          if (this.isLocationValid(x + offset - 1, y, "!", orientation, true) === false) canPlaceWord = false;
          if (this.isLocationValid(x + offset + word.term.length, y, "!", orientation, true) === false) {
            canPlaceWord = false;
          }
        } else {
          if (this.isLocationValid(x, y + offset - 1, "!", orientation, true) === false) canPlaceWord = false;
          if (this.isLocationValid(x, y + offset + word.term.length, "!", orientation, true) === false) {
            canPlaceWord = false;
          }
        }

        for (let i = 0; i < word.term.length && canPlaceWord === true; i += 1) {
          if (orientation === 0) {
            if (this.isLocationValid(x + offset + i, y, word.term[i], orientation) === false) canPlaceWord = false;
          } else if (this.isLocationValid(x, y + offset + i, word.term[i], orientation) === false) {
            canPlaceWord = false;
          }
        }

        if (canPlaceWord) {
          if (orientation === 0) {
            this.setWordAtLocation(x + offset, y, word, orientation);
          } else {
            this.setWordAtLocation(x, y + offset, word, orientation);
          }

          placedWord = true;
        }

        li = word.term.indexOf(letter, li + 1);
      }
    }
  };

  go.validatePuzzle = function validatePuzzle() {
    let isValidated = true;
    this.placedWords.forEach((item) => {
      if (item.orientation === 0) {
        if (go.isLocationOccupied(item.x - 1, item.y, true) || go.isLocationOccupied(item.x + item.term.length, item.y, true)) {
          isValidated = false;
        }
      } else if (go.isLocationOccupied(item.x, item.y - 1, true) || go.isLocationOccupied(item.x, item.y + item.term.length, true)) {
        isValidated = false;
      }
    });

    return isValidated;
  };

  return go;
}

function numberPlacedWords(go) {
  const placedWords = [...go.placedWords].sort((a, b) => a.y - b.y || a.x - b.x);
  let wordCount = 0;

  for (let y = 0; y < go.playfieldSize; y += 1) {
    for (let x = 0; x < go.playfieldSize; x += 1) {
      const filteredWords = placedWords.filter((word) => word.x === x && word.y === y);
      if (filteredWords.length > 0) {
        wordCount += 1;
        filteredWords.forEach((word) => {
          word.number = wordCount;
        });
      }
    }
  }

  return placedWords;
}

function generateLegacyPuzzle(options = {}) {
  let previousWordCount = 0;
  let currentWordCount = 0;
  let attempts = 0;
  let go;

  do {
    go = createLegacyGameObject(options);

    const initialWord = go.wordPool[0];
    const initialX = Math.floor((go.playfieldSize - initialWord.term.length) * 0.5);
    const initialY = Math.floor((go.playfieldSize - 1) * 0.5);
    go.setWordAtLocation(initialX, initialY, initialWord, 0);

    if (previousWordCount < currentWordCount && attempts < 25) previousWordCount = currentWordCount;
    currentWordCount = go.placedWords.length;
    attempts += 1;
  } while (currentWordCount < previousWordCount || attempts < 25);

  return {
    game: go,
    isValid: go.validatePuzzle(),
    numberedWords: numberPlacedWords(go),
    attempts
  };
}

function summarizePuzzle(result) {
  return {
    size: result.game.playfieldSize,
    attempts: result.attempts,
    isValid: result.isValid,
    placedWordCount: result.game.placedWords.length,
    firstWord: result.game.placedWords[0],
    words: result.numberedWords.map((word) => ({
      term: word.term,
      x: word.x,
      y: word.y,
      orientation: word.orientation,
      number: word.number
    }))
  };
}

module.exports = {
  DEFAULT_WORDS,
  createLegacyGameObject,
  createSeededRng,
  generateLegacyPuzzle,
  numberPlacedWords,
  summarizePuzzle
};
