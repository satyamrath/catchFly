
// localStorage.clear(); // for testing
// for DOM Manipulation
const difficultySelector = document.getElementsByClassName("difficultySelector");
const scoreSpan = document.getElementById("scoreSpan");
const livesSpan = document.getElementById("livesSpan");
const backgroundSwitch = document.getElementById("backgroundSwitch");
const messageBox = document.getElementById("messageBox");
const gameButtons1 = document.getElementById("gameButtons1");
const gameButtons2 = document.getElementById("gameButtons2");
const boxContainer = document.getElementsByClassName("boxContainer")[0];
const boxes = document.getElementsByClassName("boxes");
const maxLives = 5;
const easyTime = 700, mediumTime = 550, hardTime = 350;
const easyRound = 10, mediumRound = 12, hardRound = 18;
const slidingTime = 300;
const finishSound = new Audio("resources/audio/finished.wav");
const successSound = new Audio("resources/audio/success.mp3");
const failureSound = new Audio("resources/audio/failure.wav");
const scoreCardModal = document.getElementById("scoreCardModal");
const newScoreSpan = document.getElementById("newScoreSpan");
const highestScoreSpan = document.getElementById("highestScoreSpan");

let width = window.innerWidth;
let device = (width >= 920)?1:((width >= 600)?2:3);

if(device != 3){
    gameButtons1.style.display = "inline-block";
    gameButtons1.innerHTML = `<button type="button" id="start" class="btn btn-success badge badge-secondary">Start</button>`;
}else{
    gameButtons2.style.display = "block";
    gameButtons2.innerHTML = `<button type="button" id="start" class="btn btn-success btn-block">Start</button>`;
}
const startButton = document.getElementById("start");

// reload on resize
$(window).resize( ()=> {
    let newWidth = window.innerWidth;
    let newDevice = (newWidth >= 920)?1:((newWidth >= 600)?2:3);
    if(newDevice != device){
        window.location.reload();
    }
})

// toggle background color
function toggleBackgroundFunc(flag){
    document.body.style.background = (flag)?"white":"#2d3237";
}

function clearMessageBox(){
    messageBox.innerText = "";
}

// working on localStorage
localStorage.setItem("boxClickable", false);
const ifSet = localStorage.getItem("set");
let lives, score, difficulty, lightBackground;
if( ifSet === null){
    localStorage.setItem("lightBackground", false);
    localStorage.setItem("set", true);
    localStorage.setItem("score", 0);
    localStorage.setItem("lives", maxLives);
    localStorage.setItem("difficulty", "easy");
    localStorage.setItem("boxClickable", false);
    localStorage.setItem("highestScore", 0);

}

lightBackground = localStorage.getItem("lightBackground");
score = parseInt(localStorage.getItem("score"));
lives = parseInt(localStorage.getItem("lives"));
difficulty = localStorage.getItem("difficulty");

if(lightBackground == "true"){
    toggleBackgroundFunc(true);
    backgroundSwitch.checked = true;
}else{
    toggleBackgroundFunc(false);
}

scoreSpan.innerText = `Score: ${score}`;
livesSpan.innerText = `Lives: ${lives}`;

document.getElementById(difficulty).checked = true;
if(lives != maxLives || score != 0){
    startButton.innerText = "Resume";
}

let gameIsOn = false;

const finalOffSets = []; // this will container the initial offset of each box
for(box of boxes){
    finalOffSets.push((device !== 3)?box.offsetLeft:box.offsetTop);
}
let gap = finalOffSets[1] - finalOffSets[0];

// adding event handler to backgroundSwitch
backgroundSwitch.addEventListener("click", () => {
    localStorage.setItem("lightBackground", backgroundSwitch.checked);
    toggleBackgroundFunc(backgroundSwitch.checked);
});

// adding event handler to difficulty level buttons
for(option of difficultySelector){
    option.addEventListener("click", (e) => {
        localStorage.setItem("difficulty", e.target.value);
    })
}

function slideBoxes(){
    $("#box1").slideUp(slidingTime, ()=> {
        $("#box1").slideDown(slidingTime);
    });
}

for(box of boxes){
    box.addEventListener("click", (e) => {
        if( (localStorage.getItem("boxClickable") == "false")){
            // messageBox.innerText = "clicks are blocked at this point";
            // setTimeout( clearMessageBox, 300);
        }else{
            clearMessageBox();
            setTimeout( () => boxes[0].classList.add("flyContainer"), slidingTime);
            slideBoxes();
            if(e.target.id === "box1"){
                score += (time == easyTime)?1: ( (time == mediumTime)?2:3 );
                setTimeout( () => {successSound.play()}, 0); // play success sound
                localStorage.setItem("score", score);
                scoreSpan.innerText = `Score: ${score}`;
                messageBox.innerText = "wow!";
                setTimeout( clearMessageBox, 500);
            }else{
                lives--;
                setTimeout( () => {failureSound.play()}, 0); // play failure sound
                localStorage.setItem("lives", lives);
                livesSpan.innerText = `Lives: ${lives}`;
                messageBox.innerText = "sorry!!!";
                setTimeout( clearMessageBox, 500);
            }
            localStorage.setItem("boxClickable", false);
            // boxes[0].classList.add("flyContainer");
            startButton.disabled = false;
            startButton.innerText = "Pause";
            if(lives > 0){
                setTimeout( () => {
                    slideBoxes();
                    setTimeout( () => boxes[0].classList.remove("flyContainer"), slidingTime);
                } ,1000);
                setTimeout(shuffle, 2000);
            }else{
                const highestScore = Math.max(parseInt(localStorage.getItem("highestScore")), score);
                newScoreSpan.innerText = score;
                highestScoreSpan.innerText = highestScore;
                setTimeout( () => $("#scoreCardModal").modal(), 500);
                score = 0;
                lives = maxLives;
                localStorage.setItem("highestScore", highestScore);
                localStorage.setItem("score", score);
                localStorage.setItem("lives", lives);
                scoreSpan.innerText = `Score: ${score}`;
                livesSpan.innerText = `Lives: ${lives}`;
                startButton.innerText = "Restart";
                gameIsOn = false;
            }
        }
    });
}

let time;
let rounds;
var swapPositions;

function shuffle(){
    if(!gameIsOn){
        boxes[0].classList.add("flyContainer");
        return;
    }
    startButton.disabled = true;
    const diff = localStorage.getItem("difficulty");
    [time, rounds] = (diff === "easy")?[easyTime, easyRound]:((diff === "medium")?[mediumTime, mediumRound]:[hardTime, hardRound]);
    boxes[0].classList.remove("flyContainer");
    const firstRand = Math.ceil(Math.random() * 100 ) % 3 + 1;
    const arr = [];
    for(let i = 1 ; i <= 3; i++){
        if(i != firstRand){
            arr.push(i);
        }
    }
    const index = Math.ceil(Math.random() * 100) % 2;
    const secondRand = arr[index];
    const thirdRand = arr[(index)?0:1];
    swapPositions = [firstRand, secondRand, thirdRand];
    swapBoxes(1);
    swapBoxes(2);
    swapBoxes(3);
}
boxes[0].classList.add("flyContainer");

function swapBoxes(id){
    let round = 0;
    function recur(){
        round++;
        if(round >= rounds){
            let finalPos = finalOffSets[swapPositions[id-1]-1] - finalOffSets[id-1];
            let obj1 = {top: "0px"};
            let obj2 = {left: "0px"};
            let obj3 = {left: finalPos+"px"};
            let obj4 = {top: finalPos+"px"};
            $("#box"+id).animate((device!=3)?obj3:obj4, time, "swing", () => {
                $("#box"+id).animate( (device != 3)?obj1:obj2, time, () => {
                    if(id == 3){
                        localStorage.setItem("boxClickable", true);
                        finishSound.play();
                        messageBox.innerText = "Please choose any box...";
                    }
                });
            });
            return;
        }else if(round & 2){
            let obj1 = {top: "0px"};
            let obj2 = {left: "0px"};
            if(round & 3){
                let randomStat = Math.floor(Math.random() * 100) - 50;
                obj1.top = randomStat+"px";
                obj2.left = randomStat+"px";
                $("#box"+id).animate( (device!=3)?obj1:obj2, time, "swing", recur);
            }else{
                $("#box"+id).animate((device!=3)? obj1: obj2, time, "swing", recur);
            }
        }else{
            let pos = Math.floor(Math.random() * 54894856) % (2*gap+1);
            pos = (id == 1)?pos:((id == 2)?pos-gap:pos-2*gap);
            let obj1 = {left : pos+"px"};
            let obj2 = {top: pos+"px"};
            $("#box"+id).animate((device!=3)?obj1:obj2, time, "swing", recur);
        }
    }
    recur();
}

startButton.addEventListener("click", () => {
    gameIsOn = !gameIsOn;
    if(gameIsOn){
        startButton.disabled = true;
        setTimeout(() => {
            boxes[0].classList.remove("flyContainer");
        } , slidingTime);
        slideBoxes();
        setTimeout(shuffle, 1000);
    }else{
        startButton.innerText = "Resume";
    }
})
