const gameBoard = document.getElementById('gameBoard')
const speechLog = document.getElementById('speechLog')
const speechNow = document.getElementById('speechNow')
const micButton = document.getElementById('micButton')
const micIcon = document.getElementById('micIcon')
const teamBar = document.getElementById('teamBar')
const scoreKeep = document.getElementById('scoreKeep')
const suggestBox = document.getElementById('suggestBox')

const userPickTeams = document.getElementById('userPickTeams')
const userPickGrid = document.getElementById('userPickGrid')
const userPickList = document.getElementById('userPickList')
// const userPickWords = document.getElementById('userPickWords')
const optionsMenu = document.getElementById('optionsMenu')

const smallWin = new Audio("./sfx/success.mp3")
const bigWin = new Audio("./sfx/copyability.mp3")
const boardWin = new Audio("./sfx/yo2.mp3")

smallWin.volume = 0.45
bigWin.volume = 0.45
boardWin.volume = 0.4

const spacing = "1fr "

let sickness = ["the measles", "the mumps", "a gash", "a rash", 
                "purple bumps", "instamatic flu", "a cold", "a fever",
                "a stomach ache", "a runny nose", "a cough", "a sore throat",
                "chicken pox", "an ear infection", "a virus", "covid-19"]
let halloween = ["superhero", "monster", "princess", "pirate",
                "astronaut", "what about you", "think", "like",
                "love", "favorite", "holiday", "going to",
                "Halloween", "costume", "excited", "trick or treat"]
let animals1 = ["elephant", "giraffe", "lion", "camel", "snake", "monkey", "frog", "puppy"]
let animals2 = ["bear", "bird", "duck", "horse", "cat", "dog", "sheep", "goldfish", 
                "elephant", "giraffe", "lion", "camel", "snake", "monkey", "frog", "puppy"]
let adjectives = ["big", "tall", "fierce", "grumpy", "scary", "naughty", "jumpy", "perfect"]

let listList = [sickness, halloween, animals1, animals2, adjectives]
let wordlist = []
boardQueue = []
unspoken = []

let suggestedSentences = ["I have", "Do you have", "I see a", "So they sent me a", "He was too"]
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
    unspoken = arr
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
        // if (!unspoken.includes(boardQueue[n])) {
        //     unspoken.push(boardQueue[n])
        // }
        
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

    speechNow.innerHTML = ""
    speechNow.innerText = text

    if (e.results[0].isFinal) {
        logDiv = document.createElement('div')
        logDiv.classList.add("one-log")
        logDiv.classList.add("text-" + teamColors[turn - 1])
        logDiv.innerText = text

        speechNow.innerHTML = ""

        speechLog.prepend(logDiv)
        
        checkBoard(text, turn)
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

    if (str.toLowerCase().includes(suggestedSentences[sentencePicker].toLowerCase())) {
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
    
    // console.log(unspoken)

    checkForLineup(teamSquares, boardWidth, boardHeight, Math.min(boardWidth, boardHeight), team, markWord)
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

    if (turn < teamCount) {
        turn++
    } else {
        turn = 1
    }

    teamBar.children[0].style.fill = teamColors[turn - 1]

    console.log("next team")
}

function populateTeams(numOfTeams) {

    for (let n=0; n<numOfTeams; n++) {
        
        let teamScoreBar = document.createElement('div')
        teamScoreBar.innerText = scoreArr[n]
        teamScoreBar.setAttribute('id', "team" + n + "score")
        teamScoreBar.classList += teamColors[n] + " shiny"

        scoreKeep.append(teamScoreBar)
    }
}

function nextSentence() {
    if (sentencePicker < suggestedSentences.length - 1) {
        sentencePicker ++
    } else {
        sentencePicker = 0
    }
    setSuggestedSentence(sentencePicker)
}

function setSuggestedSentence(n) {

    sentWrap = document.createElement('div')
    sentWrap.classList.add('sentence-center')
    sentWrap.innerText = suggestedSentences[n] + "..."

    suggestBox.innerHTML = ''
    suggestBox.append(sentWrap)
}

function checkForLineup(arr, w, h, n, team, correctBool) {
    
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

    if (winningLines.length > 0) {
        scoreArr[team - 1] += 100 * winningLines.length
        scoreKeep.children[team - 1].innerText = scoreArr[team - 1]

        bigWin.play()
        
        if (unspoken.length > 0) {
            renewSquares(winningLines)
        } else {
            boardWin.play()
            
            wordlist = [...listList[userPickList.value]]
            populateGameBoard(wordlist)
        }
    } else if (correctBool) {
        smallWin.play()
    } 

    if (!teamSquares.includes(null)) {
        boardWin.play()
        
        let fullArr = []

        for (let i=0; i<teamSquares.length; i++) {
            fullArr.push(i)
        }

        renewSquares(fullArr)
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

    wordlist = [...listList[userPickList.value]]

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
