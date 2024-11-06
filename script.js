const gameBoard = document.getElementById('gameBoard')
const speechLog = document.getElementById('speechLog')
const micButton = document.getElementById('micButton')
const micIcon = document.getElementById('micIcon')
const teamBar = document.getElementById('teamBar')
const scoreKeep = document.getElementById('scoreKeep')
const suggestBox = document.getElementById('suggestBox')

const userPickTeams = document.getElementById('userPickTeams')
const userPickGrid = document.getElementById('userPickGrid')
const userPickWords = document.getElementById('userPickWords')
const optionsMenu = document.getElementById('optionsMenu')

const spacing = "1fr "

let sicknesses = ["the measles", "the mumps", "a gash", "a rash", 
                "purple bumps", "instamatic flu", "a cold", "a fever",
                "a stomach ache", "a runny nose", "a cough", "a sore throat",
                "chicken pox", "an ear infection", "a virus", "covid-19"]
let halloween = [""]
let wordlist = sicknesses
boardQueue = []
unspoken = []

let suggestedSentences = ["I have", "Do you have"]
let sentencePicker = 0

const teamColors = ['red', 'blue', 'yellow', 'green']
let teamSquares = []
let scoreArr = [0, 0, 0, 0]

let tictac = 3
let teamCount = 2
let turn = 1
let attempt = 0

let boardWidth  = 4
let boardHeight = 4
let totalTiles

let listenBool = false

function populateGameBoard(arr) {
    gameBoard.innerHTML = ''
    boardQueue = []
    unspoken = []
    teamSquares = []
    
    gameBoard.style.gridTemplateRows = spacing.repeat(boardHeight)
    gameBoard.style.gridTemplateColumns = spacing.repeat(boardWidth)

    totalTiles = boardWidth * boardHeight

    let iterations = Math.ceil(totalTiles / arr.length)
    console.log(iterations)

    for (let n=0; n < iterations; n++) {
        shuffledArr = shuffle(arr)
        boardQueue = boardQueue.concat(shuffledArr)
    }

    for (let n = 0; n < totalTiles; n++) {
        if (!unspoken.includes(boardQueue[n])) {
            unspoken.push(boardQueue[n])
        }
        
        newWord = document.createElement('div')
        newWord.classList += 'one-word shiny'
        

        wordWrap = document.createElement('div')
        wordWrap.innerText = boardQueue[n]
        wordWrap.classList += 'word-wrap'
        wordWrap.setAttribute('id', n + '_word')
        newWord.append(wordWrap)

        gameBoard.append(newWord)

        teamSquares.push(null)
    }
}

function shuffle(arr){
    let unshuffled = arr;
    let shuffled = [];
  
    unshuffled.forEach(word =>{
        randomPos = Math.round(Math.random() * shuffled.length);
  
        shuffled.splice(randomPos, 0, word);
    })
    
    // console.log(shuffled);
    return shuffled;
}


// - - - SPEECH RECOGNITION SNIPPET - - - //

window.SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

function setLanguage(str) {
    targetLang = str
    recognition.lang = targetLang
}

setLanguage('en');

recognition.addEventListener("result", (e) => {
    const text = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

    speaklist = text.split(' ')

    speechLog.innerHTML = ""
    speechLog.innerText = text;

    if (e.results[0].isFinal) {
        checkBoard(text, turn);
        nextTeam()
    }
});

recognition.addEventListener("end", () => {
    if(listenBool){
        recognition.start();
    }
});

// - - - END OF SPEECH RECOGNITION SNIPPET - - - //

function checkBoard(str, team){
    console.log('checking words');
    multiplier = 1;
    markWord = ""

    if (str.includes(suggestedSentences[sentencePicker].toLowerCase())) {
        multiplier = 2
    }

    for (let i = 0; i < totalTiles; i++) {
        if (str.includes(boardQueue[i]) && unspoken.includes(boardQueue[i])) {
            // || markWord == boardQueue[i]
            gameBoard.childNodes[i].classList.add(teamColors[team - 1])
            teamSquares[i] = team
            
            scoreArr[team - 1] += 100 * multiplier;
            scoreKeep.children[team - 1].innerText = scoreArr[team - 1]

            markWord = boardQueue[i]
        }
    }

    const index = unspoken.indexOf(markWord);
    console.log(index)
    
    if (index >= 0) {
        unspoken.splice(index, 1);
    }
    
    console.log(unspoken)

    checkForLineup(teamSquares, boardWidth, boardHeight, Math.min(boardWidth, boardHeight))
}

function toggleRec() {
    if (listenBool) {
        listenBool = false
        micIcon.innerText = "radio_button_unchecked"
        micButton.classList.remove('on')
        recognition.abort()
    } else {
        listenBool = true
        micIcon.innerText = "radio_button_checked"
        micButton.classList.add('on')
        recognition.start()
    }
}

function nextTeam() {
    prevTeam = document.querySelector(".highlighted")
    
    if (prevTeam) {
        // if one team is highlighted, pushes the turn to the next team
        prevTeam.classList.remove('highlighted')

        if (turn < teamCount) {
            turn++
        } else {
            turn = 1
        }

      newTeam = teamBar.children[turn - 1].children[0]
    } else {
        // sets the highlighted team to team 1 (red) if none is highlighted
        newTeam = teamBar.children[0].children[0]
    }
    newTeam.classList.add('highlighted')
}

function populateTeams(numOfTeams) {
    teamBar.innerHTML = ''

    for (let n=0; n<numOfTeams; n++) {
        let teamIcon = document.createElement('div') 
        teamIcon.innerHTML = 
        '<svg class="team-member" viewBox="5 5 22 22" preserveAspectRatio="none" fill="' + teamColors[n] + '">' +
            '<path d="M16 15.503A5.041 5.041 0 1 0 16 5.42a5.041 5.041 0 0 0 0 10.083zm0 2.215c-6.703 0-11 3.699-11 5.5v3.363h22v-3.363c0-2.178-4.068-5.5-11-5.5z"/>'+
        '</svg>'

        teamBar.append(teamIcon)
        
        let teamScoreBar = document.createElement('div')
        teamScoreBar.innerText = scoreArr[n]
        teamScoreBar.setAttribute('id', "team" + n + "score")
        teamScoreBar.classList += teamColors[n] + " shiny"

        scoreKeep.append(teamScoreBar)
    }
}

function setSuggestedSentence(n) {
    sentencePicker = n

    sentWrap = document.createElement('div')
    sentWrap.classList.add('sentence-center')
    sentWrap.innerText = suggestedSentences[n] + "..."

    suggestBox.append(sentWrap)
}

function checkForLineup(arr, w, h, n, team) {
    
    winningLines = []

    // Check rows for a win
    for (let row = 0; row < h; row++) {
        let rowStart = row * n;
        let isRowWin = true;
        for (let col = 1; col < w; col++) {
            if (arr[rowStart] === null || arr[rowStart] !== arr[rowStart + col]) {
                isRowWin = false;
                break;
            }
        }
        if (isRowWin) {
            for (let col = 0; col < w; col++) {
                winningLines.push((row * w) + col)
            }
        } 
    }

    // Check columns for a win
    for (let col = 0; col < w; col++) {
        let isColWin = true;
        for (let row = 1; row < h; row++) {
            if (arr[col] === null || arr[col] !== arr[col + row * n]) {
                isColWin = false;
                break;
            }
        }
        if (isColWin) {
            for (let row = 0; row < h; row += 1) {
                console.log(col + (row * w))
                if (!winningLines.includes(col + (row * w))) {
                    winningLines.push(col + (row * w))
                }
            }
        }
    }

    // Check top-left to bottom-right diagonal for a win
    let isDiag1Win = true;
    for (let i = 1; i < n; i++) {
        if (arr[0] === null || arr[0] !== arr[i * (n + 1)]) {
            isDiag1Win = false;
            break;
        }
    }
    if (isDiag1Win) {
        console.log('diagonal right')
        for (let col = 0; col < w; col++) {
            if (!winningLines.includes(col + (col*w))) {
                winningLines.push(col + (col*w))
            }
        }
    }

    // Check top-right to bottom-left diagonal for a win
    let isDiag2Win = true;
    for (let i = 1; i < (n+1); i++) {
        if (arr[n - 1] === null || arr[n - 1] !== arr[i * (n - 1)]) {
            isDiag2Win = false;
            break;
        }
    }
    if (isDiag2Win) {
        console.log('diagonal left')
        for (let col = 0; col < w; col++) {
            if (!winningLines.includes(col + (w * (w - 1 - col)))) {
                winningLines.push(col + (w * (w - 1 - col)))
            }
        }
    }; 

    if (unspoken.length > 0 && winningLines.length > 0) {
        renewSquares(winningLines)
        scoreArr[team] += 100 * winningLines.length
    }
    
    // console.log(winningLines)
    // If no winner, return null
    return null;
}

function renewSquares(arr) {
    arr.forEach(value => {
        
        replacementWord = unspoken[Math.floor(Math.random() * unspoken.length)]
        boardQueue[value] = replacementWord

        tileText = document.getElementById(value + "_word")
        tileText.innerText = replacementWord

        for (let i=0; i<teamCount; i++) {
            tileText.parentElement.classList.remove(teamColors[i])
        }

        teamSquares[value] = null

    })
}

function startRound() {

    teamCount = userPickTeams.value
    boardWidth = userPickGrid.value
    boardHeight = userPickGrid.value

    console.log(teamCount, boardWidth, boardHeight)

    populateGameBoard(wordlist)

    populateTeams(teamCount)
    nextTeam()

    setSuggestedSentence(1)

    optionsMenu.style.display = "none"
}