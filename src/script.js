
function generateEmptyGameObject()
{
    // define initial variables
    var go = {
        allAvailableWords: //all words, some might not be used 
           [{term: "corgi", definition: "Dog breed loved by the Royal Family."},
             {term: "apple", definition: "Fruit given to teachers by school children."},
             {term: "hamburger", definition: "Sandwich served at McDonald's."},
             {term: "minivan", definition: "Vehicle associated with families that have kids."},
             {term: "coffee", definition: "Warm beverage that helps tired people function."},
             {term: "yogurt", definition: "Cultured dairy product served at breakfast."},
             {term: "firefighter", definition: "Professional that rescues people from burning buildings."},
             {term: "banana", definition: "Fruit associated with monkeys and gorillas."},
             {term: "pillow", definition: "Something you rest your head on at night."},
             {term: "laptop", definition: "A portable computer."},
             {term: "television", definition: "Used to watch streaming video services while sitting on a couch."},
             {term: "mechanic", definition: "Profssional that fixes broken vehicles."},
             {term: "headphones", definition: "Used for listening to music."},
             {term: "sunglasses", definition: "Wear these to protect your vision."},
             {term: "sundress", definition: "Light outfit popular with women in the summer."},
             {term: "icecream", definition: "Frozen dessert popular with people during the summertime."},
             {term: "lawnmower", definition: "Used to cut grass."},
             {term: "widow", definition: "A woman whose husband has died."},
             {term: "ant", definition: "Small insect that lives in a colony."},
             {term: "cat", definition: "Raining ___ and dogs."},
             {term: "homework", definition: "Assigned by teachers for students to do at home."},
             {term: "bat", definition: "Sport equipment or animal that flies in the air."},
             {term: "raisins", definition: "Dried grapes."},
             {term: "orange", definition: "Citrus fruit."},
             {term: "battery", definition: "Stores electricity."},
             {term: "water", definition: "Hydrates plants."},
             {term: "barn", definition: "Holds livestock and is painted red."},
             {term: "elephant", definition: "Large animal with a trunk."},
             {term: "forest", definition: "Area with lots of trees."},
             {term: "river", definition: "Flowing with water."},
             {term: "loofa", definition: "Bathing apparatus."},
             {term: "mouse", definition: "Animal that squeaks."},
             {term: "foul", definition: "Violation; wrongdoing."},
             {term: "error", definition: "Unexpected negative event in computing."}
        ],
        wordPool: [], //words that fit the puzzle size and aren't used
        placedWords: [], // words that have been placed
        playfieldSize: 15, //playfield size
        grid: [], // two dimensional array to store letter data
        wordsAddedInOrder: [], //words added to the puzzle in order, as string values
    };

    //set runtime values based off of initial values
    //set the array to store letters
    go.grid = Array.from({ length: go.playfieldSize }, () => Array(go.playfieldSize).fill().map((x) => ({letter: "", horizontalTerm: "", verticalTerm: ""})));
    go.allAvailableWords.forEach((x) => go.wordPool.push(x));
    go.wordPool.sort(() => .5 - Math.random());
    go.wordPool = go.wordPool.filter((x) => x.term.length < go.playfieldSize);

    //set functions
    //validates whether X/Y coordinate is within play area
    go.isLocationOutOfBounds = function(x, y)
    {
        if (x < 0) return true;
        if (x >= this.playfieldSize) return true;
        if (y < 0) return true;
        if (y >= this.playfieldSize) return true;

        return false;
    }
    //determines if space at x/y location contains a letter
    go.isLocationOccupied = function(x, y, ignoreBounds = false)
    {
       if (this.isLocationOutOfBounds(x, y) && (ignoreBounds == true)) return false;
       if (this.isLocationOutOfBounds(x, y)) return true;
       if (this.grid[x][y].letter == "") return false;

        return true;
    }

    //determines if a space at x/y location contains a letter and is occupied by a horizontal and vertical word
    //e.g, if this space is an intersection
    go.isLocationFilled = function(x, y)
    {
       if (this.isLocationOutOfBounds(x, y)) return true;

       return (this.grid[x][y].horizontalTerm != "" && this.grid[x][y].verticalTerm != "");
    }

    //determines if a space at x/y location contains a letter, and more important
    //if it matches the letter being passed in as a poential intersection
    go.isLocationOverlapping = function(x, y, orientation, letter = "")
    {
        if (this.grid[x][y].letter == "") return false;
        if (this.grid[x][y].letter == letter) return true;
       
        return false;
    }

    //goes through many logic checks to ensure if any given space is valid
    go.isLocationValid = function(x, y, letter, orientation)
    {
        //horizontal
        if (orientation == 0)
        {
            if (this.isLocationOutOfBounds(x, y)) return false;
            if (this.isLocationFilled(x,y)) return false;
            if (this.isLocationOverlapping(x, y, orientation, letter) == false)
            {
                if (this.isLocationOccupied(x, y - 1)) return false;
                if (this.isLocationOccupied(x, y + 1)) return false;  
                if (this.isLocationOccupied(x, y)) return false;  
            }
        } else {
            //vertical
            if (this.isLocationOutOfBounds(x, y)) return false;
            if (this.isLocationFilled(x,y)) return false;
            if (this.isLocationOverlapping(x, y, orientation, letter) == false)
            {
                if (this.isLocationOccupied(x - 1, y)) return false;
                if (this.isLocationOccupied(x + 1, y)) return false;
                if (this.isLocationOccupied(x, y)) return false;  
            }
        }
        
        return true;
    }           

    //set a letter at a location for a given word and orientation
    go.setLetterAtLocation = function(x, y, word, letter, orientation)
    {
        this.grid[x][y].letter = letter;
        if (orientation == 0)
        {
            this.grid[x][y].horizontalTerm = word.term;   
        } else {
            this.grid[x][y].verticalTerm = word.term;
        }

    }

    //set an entire word (a string of letters) at a given location and oreintation
    go.setWordAtLocation = function(x, y, word, orientation)
    {
        //remove the word so it cannot be used again
        this.placedWords.push({x: x, y: y, term: word.term, definition: word.definition, orientation: orientation, number: 0});
        this.wordsAddedInOrder.push(word.term);
        this.wordPool = this.wordPool.filter((x) => x.term != word.term);
        this.wordPool = this.wordPool.sort(() => .5 - Math.random());
        
        //set the letters
        var i;
        for (i = 0; i < word.term.length; i++)
        {
            if (orientation == 0)
            {
                this.setLetterAtLocation(x + i, y, word,  word.term[i], orientation);
            } else {
                this.setLetterAtLocation(x, y + i, word,  word.term[i], orientation);
            }
        }    

        //now go through all placed letters (except for those at intersections) and check to see
        //if additional words can be spawned
        for (i = 0; i < word.term.length; i++)
        {
            if (orientation == 0)
            {
                if (this.isLocationFilled(x + i, y) == false) this.testWordsAtLocation(x + i, y, word.term[i], 1);
            } else {
                if (this.isLocationFilled(x, y + i) == false) this.testWordsAtLocation(x, y + i, word.term[i], 0);
            }
        }    
    }

    //iterate through words and find once that can be placed at a given x/y space and letter
    go.testWordsAtLocation = function(x, y, letter, orientation)
    {
        //filter the list of potential words down to those that contain the letter we're looking for
        var potentialWords = this.wordPool.filter((x) => x.term.indexOf(letter) >= 0);
        if (potentialWords.length == 0) return;

        //start the loop
        var placedWord = false; 
        var wi = 0;
        //iterate through all words
        for (wi = 0; wi < potentialWords.length && placedWord == false; wi++)
        {
            //get the word and determine the first index of the matching letter
            var word = potentialWords[wi];
            var li = word.term.indexOf(letter);
            
            //loop through while there are matches
            while (li !== -1 && placedWord == false) {
                // come up with x/y offset
                // e.g., if the matching letter is the second letter in the word, it will have to
                // be shifted left one spot or up one spot to fit in the current position
                var offset = 0 - li;
                var canPlaceWord = true;
             
                //force checks to ensure that a blanks pace exists before and after the word being placed.
                if (orientation == 0)
                {
                    //horizontal
                    if (this.isLocationValid(x + offset - 1, y,"!", orientation, false, false) == false) canPlaceWord = false;
                    if (this.isLocationValid(x + offset + word.term.length, y,"!", orientation, false, false) == false) canPlaceWord = false;
                } else {
                    //vertical
                    if (this.isLocationValid(x, y + offset - 1,"!", orientation, false, false) == false) canPlaceWord = false;
                    if (this.isLocationValid(x, y + offset + word.term.length,"!", orientation, false, false) == false) canPlaceWord = false;
                }

                //now loop through the letters
                for (var i = 0; i < word.term.length && canPlaceWord == true; i++)
                {
                    if (orientation == 0)
                    {
                        if (this.isLocationValid(x + offset + i, y, word.term[i], orientation) == false) canPlaceWord = false;
                    } else {
                        if (this.isLocationValid(x, y + offset + i, word.term[i], orientation) == false) canPlaceWord = false;
                    }
                }

                // if we made it this far, we can place the word at the offset
                if (canPlaceWord) {
                    if (orientation == 0)
                    {
                        this.setWordAtLocation(x + offset, y, word, orientation);
                    } else {
                        this.setWordAtLocation(x, y + offset, word, orientation);
                    }

                    placedWord = true;
                }

                //grab the next instance of the matching letter.
                //if none are found, -1 is returned and the loop exits.
                li = word.term.indexOf(letter, li + 1);
            }
        }

        return;
    }
    //go through and validate the puzzle.
    //the tldr; there should always be a blank letter to the left and right of a horizontal word, and
    //there should always be a blank letter to the top and bottom of a vertical word.
    //this does not go through and ensure that two words are not side-by-side
    go.validatePuzzle = function()
    {
        var isValidated = true;
        this.placedWords.forEach((item) => {
            if (item.orientation == 0)
            {
                if (go.isLocationOccupied(item.x - 1, item.y, true) || go.isLocationOccupied(item.x + item.term.length, item.y, true)) isValidated = false;      
            } else {
                if (go.isLocationOccupied(item.x, item.y - 1, true) || go.isLocationOccupied(item.x, item.y + item.term.length, true)) isValidated = false;      
            }
        });

        return isValidated;
    }

    //return the game object
    return go;
}

function generatePuzzle()
{
    //we're gonna loop through and generate a bunch of puzzles
    //essentially, the more words that can be placed the better.
    // generate at minimum 25 puzzles to establish the highest number of words that can be likely generated in the word set
    // then keep generating puzzles until one meets or exceeds that number
    var previousWordCount = 0;
    var currentWordCount = 0;
    var attempts = 0;

    do {
        // refresh our game object
        var go =  generateEmptyGameObject();

        //grab the first word in the pool
        var initialWord = go.wordPool[0];
        //determine location to set it in the puzzle
        var initialX = Math.floor((go.playfieldSize - initialWord.term.length) * 0.5);
        var initialY = Math.floor((go.playfieldSize - 1) * 0.5);
        //set it in the middle of the puzzle
        go.setWordAtLocation(initialX, initialY, initialWord, 0);
        
        //go through and do loops
        if ((previousWordCount < currentWordCount) && attempts < 25) previousWordCount = currentWordCount;
        currentWordCount = go.placedWords.length;
    
        attempts++;
    } while (currentWordCount < previousWordCount || attempts < 25)
    
    //give warning if invalid puzzle was generated
    if (go.validatePuzzle() == false) alert("Invalid puzzle was generated. Two words are side-by-side when they shouldn't be.");
    
    //render it to screen
    renderPuzzleToScreen(go);
}

function renderPuzzleToScreen(go)
{
    // clear out the existing crossword
    $(".crossword").empty();

    //sort placed words from left->right, top->bottom
    go.placedWords.sort((a, b) =>   a.y - b.y || a.x - b.x);

    //go through and assign an index for each value
    var wordCount = 0;

    for (var y = 0; y < go.playfieldSize; y++)
    {
        for (var x = 0; x < go.playfieldSize; x++){
            var filteredWords = go.placedWords.filter((n) => n.x == x && n.y == y);
            
            if (filteredWords.length > 0)
            {
                wordCount++;
                filteredWords.forEach((n) =>
                {
                    n.number = wordCount;
                });
            }
        
        }
    }

    for (var y = 0; y < go.playfieldSize; y++)
    {
        for (var x = 0; x < go.playfieldSize; x++)
        {
            var html;
            var ltr = go.grid[x][y];
            if (ltr.letter == "")
            {
                html = "<div class='square empty'>&nbsp;</div>";
            } else {
                html = "<div class='square blank' tabindex='-1' data-x='" + x + "' data-y='" + y + "' data-letter='" + ltr.letter + "' data-horizontalterm='" + ltr.horizontalTerm + "' data-verticalterm='" + ltr.verticalTerm + "'><span class='number'></span><div class='letter'>" + ltr.letter +"</div>";
            }

            $(".crossword").append(html);
        }
        $(".crossword").append("<br/>");
    }

    go.placedWords.forEach((x) =>
    {
        $(".square.blank[data-x='" + x.x +"'][data-y='" + x.y +"']").find(".number").text(x.number);
    });
}


$().ready(function()
{
    generatePuzzle();
});