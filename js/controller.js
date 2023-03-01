var socket;
var viewMode = 3;
var currentState = 0;
var gameCount = 1;

var isLimitedCov = false,
  isperiodscore = false;

var updated_uts1 = 0,
  updated_uts = 0;
var currentTime, matchStartDate;
var ptime,
  setTimer,
  stopTime = 0;
var serveSide, isServe;
var serveTeam;
var bestofsets;

var topLeft = 123,
  topPosition = 238;
var pitchX = 700,
  pitchY = 112;
var w1 = pitchX / 2,
  w2 = 554 / 2,
  hp = pitchY;
var x1 = 0,
  y1 = hp / 2,
  x2 = 0,
  y2 = hp / 2;
var xb = 0,
  yb = 0;
var t, L, H, ll, hh, h1, k;
var x = 0,
  y = mapY(0, hp / 2),
  x_1 = 0,
  y_1 = mapY(0, hp / 2),
  x_b = 0,
  y_b = mapY(0, hp / 2);
var ballRadius = 13;
var ballInPlayX = new Array();
var ballInPlayY = new Array();

x_1_1 = mapX(x1, y1);
y_1_1 = mapY(x1, y1);
x_1_2 = mapX(x2, y2);
y_1_2 = mapY(x2, y2);

var time,
  timeInterval = 10;
var setTimer;

var timeFlag; // 0: not set, 1: set
var currentTeam;
var rectId, currentRectId; // 0: none, 1: homeSafe, 2: homeAttack, 3: homeDangerousAttack, -3: awaySafe, -2: awayAttack, -1: awayDangerousAttack;
var timeSet;

var isGoal;
var match;


function countdown() {
  var interval = setInterval(function () {
    const currentDate = new Date();
    changeScreenSize();
    if (matchStartDate) {
      var seconds = Math.floor((matchStartDate - currentDate.getTime()) / 1000);
      if(seconds < 0){
        setCenterFrame(
          "Match about to start"
        );
      }
      else {
        var second = seconds % 60;
        var minutes = Math.floor(seconds / 60);
        var minute = minutes % 60;
        var hours = Math.floor(minutes / 60);
        var hour = hours % 24;
        var days = Math.floor(hours / 24);
        setCenterFrame(
          "Not Started",
          days + "D " + hour + "H " + minute + "M " + second + "S"
        );
      }
    }
    else if (isLimitedCov) {
      setCenterFrame("Limited Coverage", "Interrupted");
    }
    else {
      ttt++;
      if (currentState == 0) {
        if (gameState.length > 0) {
          stepInitialize();
        }
      } else {
        // Normal case
        if (Math.floor(ttt) % 100 == 0) {
          //every 500ms
          stepInitialize();
        }
        t += 1 / 101;
        let cs = gameState[currentState];
        if(cs['type'] == 'periodscore' || cs['type'] == 'starts_serve_period'){
          if(cs['team'] == 'home'){
            if(viewMode == 3){
              bounceBall(30, 340)
            }
            if(viewMode == 2){
              bounceBall(30, 370)
            }
          }
          if(cs['team'] == 'away'){
            if(viewMode == 3){
              bounceBall(700, 240)
            }
            if(viewMode == 2){
              bounceBall(770, 150)
            }
          }
        }
        // ballPosition();
        // if (x1 == x2 && y1 == y2) bounceBall();
        // else kickBall();
      }
      setP();
    }
    
  }, timeInterval);
}
function load() {
  bestofsets = 2;
  serveSide = -1;
  serveTeam = "home";
  isServe = false;
  ttt = 0;
  xb = x1 + w1;
  yb = y1;
  t = 0.005;
  time = 0;
  playMode = 0;
  tmpV = true;
  exceeded = true;
  timeFlag = 0;
  rectId = 0;
  currentRectId = 0;
  homeScore = 0;
  awayScore = 0;
  timeSet = 0;
  isGoal = 0;
  setTimer = 1;
  countdown();
	connect();

	const urlParams = new URLSearchParams(window.location.search);
	const eventId = Number(urlParams.get('eventId'));
  document.getElementById('link').setAttribute('href', '../volleyball-2d/index.html?eventId=' + eventId)
}


function connect() {
	const urlParams = new URLSearchParams(window.location.search);
	const eventId = Number(urlParams.get('eventId'));

	socket=new WebSocket("wss://gamecast.betdata.pro:8443");
	socket.onopen=function(e) {
		socketLastResponseTime = Date.now();
		socket.send(JSON.stringify({r:"subscribe_event", a:{id:eventId}}));
	};

	socket.onmessage=function(e) {
		socketLastResponseTime = Date.now();
		var data = JSON.parse(e.data);

		if (data.r == 'event') {
			// New function added for websocket. Call it.
			handleEventData(data.d);
		}
	};
}

setInterval(function() {
	if (socketLastResponseTime && (Date.now() - socketLastResponseTime) > 8000) {
		if (socket) {
			try {
				socket.close();
			} catch (err) {};
		}
		console.log('Reconnecting...');
		connect();
	}
}, 4000);

function bounceBall(bx, by) {
  if (!setTimer) return;
  tt = t * 2;
  if (tt > 1) tt = tt - 1;
  tt = t;
  x_1 = mapX(x, y);
  y_1 = ((y * y) / hp + y) / 2;
  document
    .getElementById("ball")
    .setAttribute("x", bx - ballRadius / 2);
  document
    .getElementById("ball")
    .setAttribute(
      "y",
      by - 20 + 20 * (tt - 0.5) * (tt - 0.5) * 4 - ballRadius
    );
  document.getElementById("ball").setAttribute("width", ballRadius);
  document.getElementById("ball_shadow").setAttribute("cx", bx);
  document.getElementById("ball_shadow").setAttribute("cy", by);
  document
    .getElementById("ball_shadow")
    .setAttribute(
      "rx",
      ballRadius * (2 * (tt - 0.5) * (tt - 0.5) + 0.5) * 0.5
    );
  document
    .getElementById("ball_shadow")
    .setAttribute(
      "ry",
      ballRadius * (2 * (tt - 0.5) * (tt - 0.5) + 0.5) * 0.5
    );
  if(viewMode == 3){
    document
    .getElementById("ball_shadow")
    .setAttribute(
      "ry",
      ballRadius * (2 * (tt - 0.5) * (tt - 0.5) + 0.5) * 0.5 * 0.5
    );
  }
}
function serve_fault() {
  // body...
}
function ballPosition() {
  bt = t * 2;
  // if(bt > 1) return;
  bt = t;
  x = x1 + (x2 - x1) * bt;
  y = y1 + (y2 - y1) * bt; // x is (-0.5, 0.5) in square pitch
  x_1 = mapX(x, y);
  y_1 = mapY(x, y); // x_1 is in polygon pitch
  L = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  LL = L;
  if (L < 0.01) L = 0.01;
  H = L / 8;
  // H = max(25, H)
  ll = Math.sqrt((x1 - x) * (x1 - x) + (y1 - y) * (y1 - y));
  hh = H * (1 - (4 * (ll - L / 2) * (ll - L / 2)) / (L * L));
  h1 = ((w2 + ((w1 - w2) / hp) * y) * hh) / w1;
  x_b = x_1;
  y_b = y_1 - h1;
  ballRadius = mapX(13, y);
  xs = x_1_1 + (x_1_2 - x_1_1) * bt;
  ys = y_1_1 + (y_1_2 - y_1_1) * bt;
}
function kickBall() {
  if (!setTimer) return;
  document
    .getElementById("ball")
    .setAttribute("x", x_b + w2 - ballRadius / 2 + topLeft);
  document
    .getElementById("ball")
    .setAttribute("y", y_b - ballRadius + topPosition);
  document.getElementById("ball").setAttribute("width", ballRadius);
  document.getElementById("ball_shadow").setAttribute("cx", x_1 + w2 + topLeft);
  document.getElementById("ball_shadow").setAttribute("cy", y_1 + topPosition);
  if (hh + H > 0) {
    document
      .getElementById("ball_shadow")
      .setAttribute("rx", ((ballRadius + 15) * H * 0.25) / (hh + H));
    document
      .getElementById("ball_shadow")
      .setAttribute("ry", ((ballRadius + 15) * H * 0.25) / (hh + H) / 2);
  } else {
    document.getElementById("ball_shadow").setAttribute("rx", 0);
    document.getElementById("ball_shadow").setAttribute("ry", 0);
  }
}
function resetTrack() {
  lineX[3] = x_1_1 + w2 + topLeft;
  lineX[2] = x_1_1 + w2 + topLeft;
  lineX[1] = x_1_1 + w2 + topLeft;
  lineX[0] = x_1_1 + w2 + topLeft;
  lineY[3] = y_1_1 + topPosition;
  lineY[2] = y_1_1 + topPosition;
  lineY[1] = y_1_1 + topPosition;
  lineY[0] = y_1_1 + topPosition;
}
function stepInitialize() {
  t = 0
  if (currentState < gameState.length - 1) {
    currentState = max(currentState + 1, gameState.length - 10)
    let cs = gameState[currentState];
    $("#homeStateG").attr('display', 'none');
    $("#awayStateG").attr('display', 'none');
    resetCenterFrame()
    if (gameState[currentState]['game_points']) {
      document.getElementById('score').textContent = cs['game_points']['home'] + '-' + cs['game_points']['away'];
    }
    if (cs['type'] == "starts_serve_period") {
      $("#homeStateG").attr('display', 'block');
      $("#awayStateG").attr('display', 'block');
      serveTeam = cs['team'];
      if (cs['team'] == 'home') {
          x_b = mapX(-pitchX / 2 - 20, hp * 1)
          y_b = mapY(-pitchX / 2 - 20, hp * 1)
        }
        else {
          x_b = mapX(pitchX / 2 + 20, hp * 0)
          y_b = mapY(pitchX / 2 + 20, hp * 0)
        }
        x1 = - w1 - 20;
        x2 = - w1 - 20;
        y1 = hp * 1;
        y2 = hp * 1;
        x_1_1 = mapX(x1, y1)
        y_1_1 = mapY(x1, y1)
        x_1_2 = mapX(x2, y2)
        y_1_2 = mapY(x2, y2)
        for(let i = 0; i < 100; i ++){
          ballInPlayX[i] = Math.random();
          ballInPlayY[i] = Math.random();
        }
      }
    if (cs['type'] == "periodscore") {
    $("#homeStateG").attr('display', 'block');
    $("#awayStateG").attr('display', 'block');
      setCenterFrame("Game Won", teamNames[cs["team"]]);
      serveTeam = cs['team'];
      if (cs['team'] == 'home') {
          x_b = mapX(-pitchX / 2, hp * 1)
          y_b = mapY(-pitchX / 2, hp * 1)
          x1 = - w1;
          x2 = - w1;
        }
        else {
          x_b = mapX(pitchX / 2, hp * 1)
          y_b = mapY(pitchX / 2, hp * 1)
          x1 = w1;
          x2 = w1;
        }
        y1 = hp * 1;
        y2 = hp * 1;
        x_1_1 = mapX(x1, y1)
        y_1_1 = mapY(x1, y1)
        x_1_2 = mapX(x2, y2)
        y_1_2 = mapY(x2, y2)
        for(let i = 0; i < 100; i ++){
          ballInPlayX[i] = Math.random();
          ballInPlayY[i] = Math.random();
        }
      }
    else if (gameState[currentState]['type'] == 'ball_in_play') {
    $("#homeStateG").attr('display', 'block');
    $("#awayStateG").attr('display', 'block');
      x1 = - w1 * 10000;
      x2 = - w1 * 10000;
      y1 = hp * 1;
      y2 = hp * 1;
      x_1_1 = mapX(x1, y1)
      y_1_1 = mapY(x1, y1)
      x_1_2 = mapX(x2, y2)
      y_1_2 = mapY(x2, y2)
    }
    else if (gameState[currentState]['type'] == 'timeinfo') {
      isServe = false
      $("#homeStateG").attr('display', 'none');
      $("#awayStateG").attr('display', 'none');
    }
    else if (gameState[currentState]['type'] == 'periodscore') {
      isServe = false
      setCenterFrame('Game Won', teamNames[gameState[currentState]['team']])
    }
    else {
      isServe = false
      x1 = -1000;
      x2 = 1000 * w1;
      y1 = hp * 1000;
      y2 = hp * 1000;
      x_1_1 = mapX(x1, y1)
      y_1_1 = mapY(x1, y1)
      x_1_2 = mapX(x2, y2)
      y_1_2 = mapY(x2, y2)
      setCenterFrame(gameState[currentState]['name'], teamNames[gameState[currentState]['team']])
      if(!gameState[currentState]['team'])setCenterFrame(gameState[currentState]['name'], '')
      if(gameState[currentState]['name'] == 'Ball in play'){
        setCenterFrame(gameState[currentState]['name'], '')
      }
    }
  } else {
    if (gameState[currentState]['type'] == 'service_taken') {
      if (!isServe) serveSide = - serveSide
      isServe = true
      if (gameState[currentState]['team'] == 'home') {
        if (serveSide < 0) {
          x_b = mapX(-pitchX / 2, hp * 0.3)
          y_b = mapY(-pitchX / 2, hp * 0.3)
        }
        else {
          x_b = mapX(-pitchX / 2, hp * 0.7)
          y_b = mapY(-pitchX / 2, hp * 0.7)
        }
        x1 = - w1;
        x2 = - w1;
        y1 = hp * 0.3;
        y2 = hp * 0.3;
        x_1_1 = mapX(x1, y1)
        y_1_1 = mapY(x1, y1)
        x_1_2 = mapX(x2, y2)
        y_1_2 = mapY(x2, y2)
      } else {
        if (serveSide > 0) {
          x_b = mapX(pitchX / 2, hp * 0.3)
          y_b = mapY(pitchX / 2, hp * 0.3)
        }
        else {
          x_b = mapX(pitchX / 2, hp * 0.7)
          y_b = mapY(pitchX / 2, hp * 0.7)
        }
        x1 = w1;
        x2 = w1;
        y1 = hp * 0.3;
        y2 = hp * 0.3;
        x_1_1 = mapX(x1, y1)
        y_1_1 = mapY(x1, y1)
        x_1_2 = mapX(x2, y2)
        y_1_2 = mapY(x2, y2)
      }
    }
    else if(gameState[currentState]['type'] == "periodscore"){}
    else {
      x1 = 1000 * w1;
      x2 = 1000 * w1;
      y1 = hp * 1000;
      y2 = hp * 1000;
      x_1_1 = mapX(x1, y1)
      y_1_1 = mapY(x1, y1)
      x_1_2 = mapX(x2, y2)
      y_1_2 = mapY(x2, y2)
      setCenterFrame(gameState[currentState]['name'], teamNames[gameState[currentState]['team']])
      if(gameState[currentState]['name'] == 'Ball in play'){
        setCenterFrame(gameState[currentState]['name'], '')
      }
      if(gameState[currentState]['type'] == "periodscore"){
        setCenterFrame("Game Won", teamNames[gameState[currentState]['team']])
      }
    }
  }
}
function showState() {
  document.getElementById("actionBoard").setAttribute("width", 0);
  document.getElementById("actionBoard").setAttribute("height", 0);
  document.getElementById("stateBoardLine").setAttribute("stroke-opacity", 0);
  document.getElementById("ballState").textContent = "";
  document.getElementById("holder").textContent = "";

  // Goal

  // Substitution
  document.getElementById("substitutionOut").setAttribute("fill-opacity", 0);
  document.getElementById("substitutionIn").setAttribute("fill-opacity", 0);
  document.getElementById("substitutionOutPlayer").textContent = "";
  document.getElementById("substitutionInPlayer").textContent = "";

  // document.getElementById('bottom_rect').setAttribute('fill-opacity', 0)
  document.getElementById("bottom_text").textContent = "";
  document.getElementById("bottom2_text").textContent = "";
  document.getElementById("center_rect").setAttribute("fill-opacity", 0);
  document.getElementById("center_text").textContent = "";
  document.getElementById("awayKickPolygon").style.fill = "url(#none)";
  document.getElementById("homeKickPolygon").style.fill = "url(#none)";

  if (
    gameState[currentState]["type"] &&
    gameState[currentState]["type"] != "possession"
  ) {
    remove();
    // if(gameState[currentState]['team'])showAction()
  } else {
  }
}
function remove() {
  document.getElementById("homeKickPolygon").style.fill = "url(#none)";
  document.getElementById("awayKickPolygon").style.fill = "url(#none)";
  document.getElementById("stateBoard").setAttribute("fill-opacity", 0);
}
function max(a, b) {
  if (a > b) return a;
  return b;
}
function mapX(x11, y11) {
  x_11 = ((w2 + ((w1 - w2) * y11) / hp) * x11) / w1;
  return x_11;
}
function mapY(x11, y11) {
  y_11 = ((y11 * y11) / hp + 1.5 * y11) / 2.5;
  return y_11;
}
function displayState() {
  if (!setTimer) return;
  var statePositionX, statePositionY;
  document.getElementById("stateLabels").style.display = "block";
  if (gameState[currentState]["team"])
    document.getElementById("teamName").textContent =
      teamNames[gameState[currentState]["team"]].toUpperCase();
  if ((y2 * 100) / hp < 30) {
    statePositionY = 500;
  } else if ((y2 * 100) / hp < 70) {
    statePositionY = 540;
  } else {
    statePositionY = 500;
  }
  document.getElementById("stateRect").setAttribute("rx", 20);
  document.getElementById("stateRect").setAttribute("ry", 20);
  document.getElementById("jerseyCircle").style.display = "block";
  document.getElementById("jerseyCircle").setAttribute("fill-opacity", 0);
  document.getElementById("stateRect").setAttribute("fill", "blue");
  document.getElementById("stateRect").setAttribute("fill-opacity", 0);
  document.getElementById("Ball_Begin").style.display = "block";
  // document.getElementById('Ball_Track_Begin').style.display = 'block'
  if (gameState[currentState]["team"] == "home") {
    document.getElementById("state").setAttribute("text-anchor", "end");
    document.getElementById("teamName").setAttribute("text-anchor", "end");
    document.getElementById("state").setAttribute("x", "-45");
    document.getElementById("teamName").setAttribute("x", "-45");
    document.getElementById("stateRect").setAttribute("x", "-150");
    document.getElementById("stateRect").setAttribute("width", "150");
    document.getElementById("jerseyCircle").setAttribute("cx", "-20");
    document
      .getElementById("stateJersey")
      .setAttribute("transform", "translate(-20, -25)");
    document
      .getElementById("homeBaseColorS")
      .setAttribute("fill", "#" + homePlayerColor);
    document.getElementById("state").textContent = "Possession";
    let stateRectWidth =
      max(
        document.getElementById("state").getBBox().width,
        document.getElementById("teamName").getBBox().width
      ) + 55;
    document.getElementById("stateRect").setAttribute("width", stateRectWidth);
    document.getElementById("stateRect").setAttribute("x", -stateRectWidth);
    statePositionX = 450;
  } else {
    document.getElementById("state").setAttribute("text-anchor", "start");
    document.getElementById("teamName").setAttribute("text-anchor", "start");
    document.getElementById("state").setAttribute("x", "45");
    document.getElementById("teamName").setAttribute("x", "45");
    document.getElementById("stateRect").setAttribute("x", "0");
    document.getElementById("stateRect").setAttribute("width", "150");
    document.getElementById("jerseyCircle").setAttribute("cx", "20");
    document
      .getElementById("stateJersey")
      .setAttribute("transform", "translate(20, -25)");
    document
      .getElementById("homeBaseColorS")
      .setAttribute("fill", "#" + awayPlayerColor);
    document.getElementById("state").textContent = "Possession";
    let stateRectWidth =
      max(
        document.getElementById("state").getBBox().width,
        document.getElementById("teamName").getBBox().width
      ) + 55;
    document.getElementById("stateRect").setAttribute("width", stateRectWidth);
    statePositionX = 500;
  }
  document
    .getElementById("stateLabels")
    .setAttribute(
      "transform",
      "translate(" + statePositionX + "," + statePositionY + ")"
    );
  if (
    gameState[currentState]["type"] == "goal" ||
    gameState[currentState]["type"] == "attempt_missed"
  ) {
    if (currentState > 0) {
      if (gameState[currentState - 1]["Z"]) {
        action();
        document.getElementById("Ball_Begin").style.display = "block";
        document.getElementById("Ball_Track_Begin").style.display = "block";
      }
    }
    if (currentState > 1) {
      if (gameState[currentState - 2]["Z"]) {
        action();
        document.getElementById("Ball_Begin").style.display = "block";
        document.getElementById("Ball_Track_Begin").style.display = "block";
      }
    }
  }
  if (
    gameState[currentState]["type"] == "foul" ||
    gameState[currentState]["type"] == "block" ||
    gameState[currentState]["type"] == "rebound" ||
    gameState[currentState]["type"] == "free_throws_awarded"
  )
    action();
}
function action() {
  statePositionX = 475;
  statePositionY = 520;
  document.getElementById("homeStatePolygon").style.fill = "url(#none)";
  document.getElementById("awayStatePolygon").style.fill = "url(#none)";
  document.getElementById("state").setAttribute("text-anchor", "start");
  document.getElementById("teamName").setAttribute("text-anchor", "start");
  document.getElementById("state").textContent =
    gameState[currentState]["name"];
  if (gameState[currentState]["points"]) {
    document.getElementById("state").textContent =
      gameState[currentState]["points"] + "pt " + "missed";
    if (gameState[currentState]["points"] == 1)
      document.getElementById("state").textContent = "Free Throw missed";
  }
  let stateRectWidth =
    max(
      document.getElementById("state").getBBox().width,
      document.getElementById("teamName").getBBox().width
    ) +
    40 +
    20;
  let stateRectX = -stateRectWidth / 2 + 20;
  document.getElementById("stateRect").setAttribute("width", stateRectWidth);
  document.getElementById("stateRect").setAttribute("rx", 0);
  document.getElementById("stateRect").setAttribute("ry", 0);
  document.getElementById("stateRect").setAttribute("x", -stateRectWidth / 2);
  document.getElementById("jerseyCircle").setAttribute("cx", stateRectX);
  document.getElementById("state").setAttribute("x", stateRectX + 20);
  document.getElementById("teamName").setAttribute("x", stateRectX + 20);
  document.getElementById("jerseyCircle").style.display = "none";
  document.getElementById("stateRect").setAttribute("fill", "black");
  document.getElementById("stateRect").setAttribute("fill-opacity", 0.6);
  document
    .getElementById("stateJersey")
    .setAttribute("transform", "translate(" + stateRectX + ", -25)");
  document
    .getElementById("stateLabels")
    .setAttribute(
      "transform",
      "translate(" + statePositionX + "," + statePositionY + ")"
    );
  document.getElementById("Ball_Begin").style.display = "none";
  document.getElementById("Ball_Track_Begin").style.display = "none";
}
function goalAnimation() {
  // action()
  document.getElementById("stateLabels").style.display = "none";
  document.getElementById("score-fade-out").style.display = "block";
  document.getElementById("fadeScore").style.display = "block";
  if (gameState[currentState]["team"] == "home") {
    // document.getElementById('homeBScoreFade').textContent = 5
    // document.getElementById('homeCScoreFade').textContent = 3
    // document.getElementById('homeAScoreFade').textContent = 8
    document.getElementById("homeBScoreFade").textContent =
      homeScore - thisScore;
    document.getElementById("homeCScoreFade").textContent = thisScore;
    document.getElementById("homeAScoreFade").textContent = homeScore;
    if (gameState[currentState]["name"] == "1") {
      document.getElementById("homeBScoreFade").setAttribute("y", 60 - 60 * t);
      document.getElementById("homeCScoreFade").setAttribute("y", 120 - 60 * t);
      document.getElementById("homeAScoreFade").setAttribute("y", 180);
    }
    if (gameState[currentState]["name"] == "2") {
      document.getElementById("homeBScoreFade").setAttribute("y", -100);
      document.getElementById("homeCScoreFade").setAttribute("y", 60 - 60 * t);
      document.getElementById("homeAScoreFade").setAttribute("y", 120 - 60 * t);
    }
  }
}
function setCenterFrame(title, content) {
  if (title == "Score change tennis - full score") {
    title = "Score";
  }
  document.getElementById("stateLabels").style.display = "none";
  document.getElementById("center_rect").setAttribute("fill-opacity", 0.5);
  center_text = capitalizeWords(title.split(" ")).join(" ");
  document.getElementById("center_text").textContent = center_text;
  titleWidth = document.getElementById("center_text").getBBox().width + 40;
  document.getElementById("center_rect").setAttribute("height", 140);
  document.getElementById("bottom_text").textContent = content;
  document.getElementById("ball").setAttribute("x", 100000);
  document.getElementById("ball").setAttribute("y", 100000);
  document.getElementById("ball_shadow").setAttribute("cx", 100000);
  document.getElementById("ball_shadow").setAttribute("cy", 100000);
  document
    .getElementById("center_rect")
    .setAttribute("width", max(380, titleWidth));
  document
    .getElementById("center_rect")
    .setAttribute("x", 400 - max(380, titleWidth) / 2);
  if (content == "") {
    document.getElementById("center_text").setAttribute("y", 280);
  } else {
    document.getElementById("center_text").setAttribute("y", 260);
  }
}
function resetCenterFrame() {
  document.getElementById("center_rect").setAttribute("fill-opacity", 0);
  document.getElementById("center_text").textContent = "";
  document.getElementById("center_rect").setAttribute("height", 0);
  document.getElementById("bottom_text").textContent = "";
}
function capitalizeWords(arr) {
  return arr.map((word) => {
    const firstLetter = word.charAt(0).toUpperCase();
    const rest = word.slice(1).toLowerCase();

    return firstLetter + rest;
  });
}
function setState(homeState, awayState, side) {
  // document.getElementById("homeStateG").style.display = "block";
  // document.getElementById("awayStateG").style.display = "block";
  // if(!homeState)document.getElementById('homeStateG').style.display = 'none'
  // if(!awayState)document.getElementById('awayStateG').style.display = 'none'
  document.getElementById("homeState").textContent = homeState;
  document.getElementById("awayState").textContent = awayState;
  if (side > 0) {
    document
      .getElementById("homeStateG")
      .setAttribute("transform", "translate(100, 300)");
    document
      .getElementById("awayStateG")
      .setAttribute("transform", "translate(680, 270)");
  } else {
    document
      .getElementById("homeStateG")
      .setAttribute("transform", "translate(120, 270)");
    document
      .getElementById("awayStateG")
      .setAttribute("transform", "translate(700, 300)");
  }
}
function removeState() {
  document.getElementById("homeStateG").style.display = "none";
  document.getElementById("awayStateG").style.display = "none";
}
function setSets() {
  if (bestofsets == 3) {
    document.getElementById("tableName4").style.display = "none";
    document.getElementById("tableName5").style.display = "none";
    document.getElementById("homeScore4").style.display = "none";
    document.getElementById("homeScore5").style.display = "none";
    document.getElementById("awayScore4").style.display = "none";
    document.getElementById("awayScore5").style.display = "none";

    document.getElementById("tableName1").setAttribute("x", 410);
    document.getElementById("homeScore1").setAttribute("x", 410);
    document.getElementById("awayScore1").setAttribute("x", 410);
    document.getElementById("tableName2").setAttribute("x", 490);
    document.getElementById("tableName3").setAttribute("x", 570);
    document.getElementById("homeScore2").setAttribute("x", 490);
    document.getElementById("homeScore3").setAttribute("x", 570);
    document.getElementById("awayScore2").setAttribute("x", 490);
    document.getElementById("awayScore3").setAttribute("x", 570);
  }
}
function toggleViewMode(){
  if(viewMode == 2){
    viewMode = 3;
    $("#pitchImage").attr("href", './media/pitch3d.png')
    $("#viewMode").text("2D")
    $("#homeStateG").attr("transform", "translate(50, 380)")
    $("#awayStateG").attr("transform", "translate(670, 220)")
  } 
  else{
    viewMode = 2;
    $("#pitchImage").attr("href", './media/pitch2d.png')
    $("#viewMode").text("3D")
    $("#homeStateG").attr("transform", "translate(20, 400)")
    $("#awayStateG").attr("transform", "translate(780, 110)")
  }
}

var dob = 0;
var gameState = new Array();
var gameType = new Array();
var newEvents = new Array();
var lastEvents = new Array();
var awayteamname, hometeamname;
var homeScore, awayScore, periodlength, getDataTime;
var teamNames = new Array();
var periodScoreH = new Array();
var periodScoreA = new Array();
const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// New function added for websocket.
function handleEventData(data) {
  /*
    data.info   => (matchinfo)
    data.match    => match (match_timelinedelta)
    data.events   => events (match_timelinedelta)
  */

  if (data.info) {
    handleInfoData(data);
  }

  match = data["match"];

  if (match) {
    if (match["status"]["name"] == "Interrupted") {
      isLimitedCov = true;
    } else isLimitedCov = false;
    // if(match['type'] == 'periodscore' ){
    //   isperiodscore = true
    // }
    // else isperiodscore = false
    bestofsets = match["bestofsets"];
    setSets();
    var teams = match["teams"];
    periodlength = match["periodlength"];
    var hometeam = teams["home"];
    if (hometeam["name"]) hometeamname = hometeam["name"];
    var awayteam = teams["away"];
    if (awayteam["name"]) awayteamname = awayteam["name"];
    teamNames["home"] = hometeamname;
    teamNames["away"] = awayteamname;
    // hometeamname = 'This team name is longer than 19 characters'

    document.getElementById("homeStateN").textContent = teamNames["home"];
    document.getElementById("awayStateN").textContent = teamNames["away"];
    if (teamNames["home"].indexOf("/") > -1) {
      let homeName = teamNames["home"].split("/");
      document.getElementById("homeStateN").textContent = homeName[0];
      document.getElementById("homeStateN1").textContent = homeName[1];
      document.getElementById("homeStateLine").setAttribute("y2", 27);

      let awayName = teamNames["away"].split("/");
      document.getElementById("awayStateN").textContent = awayName[0];
      document.getElementById("awayStateN1").textContent = awayName[1];
      document.getElementById("awayStateLine").setAttribute("y2", 27);
    }
    if (hometeamname.length > 19) {
      teamNames["home"] = hometeamname.substr(0, 17) + "...";
    }
    if (awayteamname.length > 19) {
      teamNames["away"] = awayteamname.substr(0, 17) + "...";
    }
    document.getElementById("homeTeamName").textContent = teamNames["home"];
    document.getElementById("awayTeamName").textContent = teamNames["away"];
    document.getElementById("period").textContent = capitalizeWords(
      match["status"]["name"].split(" ")
    ).join(" ");
    // Score Setting
    var result = match["result"];
    if (result["home"]) homeScore = result["home"];
    if (result["away"]) awayScore = result["away"];
    document.getElementById("setScore").textContent =
      homeScore + " - " + awayScore;
    // Period Score Setting
    let currentPeriod = 1;
    if (match["periods"] != null) {
      if (match["periods"]["p1"]) {
        document.getElementById("homeScore1").textContent =
          match["periods"]["p1"]["home"];
        document.getElementById("awayScore1").textContent =
          match["periods"]["p1"]["away"];
        gameCount =
          match["periods"]["p1"]["home"] + match["periods"]["p1"]["away"] + 1;
        currentPeriod = 2;
        $("#score").text(match["periods"]["p1"]["home"] + '-' + match["periods"]["p1"]["away"])
      } else {
        document.getElementById("homeScore1").textContent = "-";
        document.getElementById("awayScore1").textContent = "-";
      }
      if (match["periods"]["p2"]) {
        document.getElementById("homeScore2").textContent =
          match["periods"]["p2"]["home"];
        document.getElementById("awayScore2").textContent =
          match["periods"]["p2"]["away"];
        gameCount =
          match["periods"]["p2"]["home"] + match["periods"]["p2"]["away"] + 1;
        $("#score").text(match["periods"]["p2"]["home"] + '-' + match["periods"]["p2"]["away"])
      } else {
        document.getElementById("homeScore2").textContent = "-";
        document.getElementById("awayScore2").textContent = "-";
      }
      if (match["periods"]["p3"]) {
        document.getElementById("homeScore3").textContent =
          match["periods"]["p3"]["home"];
        document.getElementById("awayScore3").textContent =
          match["periods"]["p3"]["away"];
        gameCount =
          match["periods"]["p3"]["home"] + match["periods"]["p3"]["away"] + 1;
        $("#score").text(match["periods"]["p3"]["home"] + '-' + match["periods"]["p3"]["away"])
      } else {
        document.getElementById("homeScore3").textContent = "-";
        document.getElementById("awayScore3").textContent = "-";
      }
      if (match["periods"]["p4"]) {
        document.getElementById("homeScore4").textContent =
          match["periods"]["p4"]["home"];
        document.getElementById("awayScore4").textContent =
          match["periods"]["p4"]["away"];
        gameCount =
          match["periods"]["p4"]["home"] + match["periods"]["p4"]["away"] + 1;
        $("#score").text(match["periods"]["p4"]["home"] + '-' + match["periods"]["p4"]["away"])
      } else {
        document.getElementById("homeScore4").textContent = "-";
        document.getElementById("awayScore4").textContent = "-";
      }
      if (match["periods"]["p5"]) {
        document.getElementById("homeScore5").textContent =
          match["periods"]["p5"]["home"];
        document.getElementById("awayScore5").textContent =
          match["periods"]["p5"]["away"];
        gameCount =
          match["periods"]["p5"]["home"] + match["periods"]["p5"]["away"] + 1;
        $("#score").text(match["periods"]["p5"]["home"] + '-' + match["periods"]["p5"]["away"])
      } else {
        document.getElementById("homeScore5").textContent = "-";
        document.getElementById("awayScore5").textContent = "-";
      }
      // document.getElementById("gameCount").textContent = "Game " + gameCount;
    } else {
      document.getElementById("homeScore1").textContent = "-";
      document.getElementById("awayScore1").textContent = "-";
    }

    // match['numberofperiods'] == 2
    if (match["numberofperiods"] == 2) {
      document.getElementById("homeScore3").style.display = "none";
      document.getElementById("awayScore3").style.display = "none";

      document.getElementById("tableName1").textContent = "1 HALF";
      document.getElementById("tableName2").textContent = "2 HALF";
      document.getElementById("tableName3").style.display = "none";
    } else {
      document.getElementById("homeScore3").style.display = "block";
      document.getElementById("awayScore3").style.display = "block";

      document.getElementById("tableName1").textContent = "1st Set";
      document.getElementById("tableName2").textContent = "2nd Set";
      document.getElementById("tableName3").textContent = "3rd Set";
      document.getElementById("tableName3").style.display = "block";
    }

    if (match["status"]["name"] == "Ended") {
      //Match End
      setCenterFrame("Match End", homeScore + " : " + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
    if (match["status"]["name"] == "Break") {
      //Break time
      setCenterFrame("Break", homeScore + " : " + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }

    if (match["status"]["name"] == "Not started") {
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
      const currentDate = new Date();
      //Match End
      upCommingTime = currentDate.getTime() / 1000 - match["updated_uts"];
      // var seconds = Math.floor(updated_uts / 1000)
      var seconds = Math.floor(upCommingTime);
      var minute = Math.floor(seconds / 60);
      var second = seconds % 60;
      // var date = new Date(match['_dt']['date'] + '4:52:48 PM UTC');
      var matchDate = match["_dt"]["date"].split("/");
      var date = new Date(
        matchDate[1] +
          "/" +
          matchDate[0] +
          "/20" +
          matchDate[2] +
          " " +
          match["_dt"]["time"] +
          ":00 UTC"
      );

      matchStartDate = date.getTime();
    }

    if (match["p"] == 1) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 2) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 3) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 4) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 5) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 31) {
      setTimer = false;
      setCenterFrame("Break", homeScore + ":" + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
    if (match["p"] == 32) {
      setTimer = false;
      setCenterFrame("Halftime", homeScore + ":" + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
    if (match["p"] == 33) {
      setTimer = false;
      setCenterFrame("Break", homeScore + ":" + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
    if (match["p"] == 34) {
      setTimer = false;
      setCenterFrame("Break", homeScore + ":" + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
  }

  var events = data["events"] || {};

  var newEvents = new Array();
  Object.values(events).forEach((event) => {
    if (event["type"] != "timeinfo" && event["type"] != "periodstart" && event["type"] != "unknown")
      newEvents.push({
        name: event["name"],
        type: event["type"],
        team: event["team"],
        updated_uts: event["updated_uts"],
        uts: event["uts"],
        _tid: event["_tid"],
        game_points: event["game_points"],
        game_score: event["game_score"],
      });
    if (event["type"] == "score_change_tennis")
      newEvents.push({
        name: event["name"],
        type: "score_change_tennis1",
        team: event["team"],
        updated_uts: event["updated_uts"],
        uts: event["uts"],
        _tid: event["_tid"],
        game_points: event["game_points"],
        game_score: event["game_score"],
      });
    if (event["type"] == "first_serve_fault")
      newEvents.push({
        name: event["name"],
        type: "first_serve_fault1",
        team: event["team"],
        updated_uts: event["updated_uts"],
        uts: event["uts"],
        _tid: event["_tid"],
        game_points: event["game_points"],
        game_score: event["game_score"],
      });
  });
  newEvents.forEach((newEvent) => {
    let flag = 1;
    gameState.forEach((lastEvent) => {
      if (equals(newEvent, lastEvent)) flag = 0;
    });
    if (flag == 1) {
      gameState.push(newEvent);
    }
  });
  lastEvents = newEvents;
}
function handleInfoData(data) {
  var data1 = data.info;
  var jerseys = data1["jerseys"];
  homePlayerColor = jerseys["home"]["player"]["base"];
  awayPlayerColor = jerseys["away"]["player"]["base"];
  document
    .getElementById("homeBaseColorS")
    .setAttribute("fill", "#" + homePlayerColor);
  document
    .getElementById("homeBaseColor")
    .setAttribute("fill", "#" + homePlayerColor);
  document
    .getElementById("awayBaseColor")
    .setAttribute("fill", "#" + awayPlayerColor);
  document
    .getElementById("homeBaseColorT")
    .setAttribute("fill", "#" + homePlayerColor);
  document
    .getElementById("awayBaseColorT")
    .setAttribute("fill", "#" + awayPlayerColor);
}
function changeScreenSize() {
  screenHeight = window.innerHeight;
  screenWidth = window.innerWidth;

  scale = min(screenWidth / 800, screenHeight / 425);

  document
    .getElementById("scale")
    .setAttribute("transform", "scale(" + scale + ")");
  document.getElementById("svg").setAttribute("width", 800 * scale);
  document.getElementById("svg").setAttribute("height", 425 * scale);
}
function min(a, b) {
  if (a > b) return b;
  return a;
}
function setP(){
  if(!match)return;
  if (match["p"] == 1) {
    $("#homeStateG").css('display', 'block');
    $("#awayStateG").css('display', 'block');
  }
  if (match["p"] == 2) {
    $("#homeStateG").css('display', 'block');
    $("#awayStateG").css('display', 'block');
  }
  if (match["p"] == 3) {
    $("#homeStateG").css('display', 'block');
    $("#awayStateG").css('display', 'block');
  }
  if (match["p"] == 4) {
    $("#homeStateG").css('display', 'block');
    $("#awayStateG").css('display', 'block');
  }
  if (match["p"] == 5) {
    $("#homeStateG").css('display', 'block');
    $("#awayStateG").css('display', 'block');
  }
  if (match["p"] == 31) {
    setTimer = false;
    setCenterFrame("Break", homeScore + ":" + awayScore);
    $("#homeStateG").css('display', 'none');
    $("#awayStateG").css('display', 'none');
  }
  if (match["p"] == 32) {
    setTimer = false;
    setCenterFrame("Halftime", homeScore + ":" + awayScore);
    $("#homeStateG").css('display', 'none');
    $("#awayStateG").css('display', 'none');
  }
  if (match["p"] == 33) {
    setTimer = false;
    setCenterFrame("Break", homeScore + ":" + awayScore);
    $("#homeStateG").css('display', 'none');
    $("#awayStateG").css('display', 'none');
  }
  if (match["p"] == 34) {
    setTimer = false;
    setCenterFrame("Break", homeScore + ":" + awayScore);
    $("#homeStateG").css('display', 'none');
    $("#awayStateG").css('display', 'none');
  }
  
    if (match["status"]["name"] == "Interrupted") {
      isLimitedCov = true;
    } else isLimitedCov = false;
    // if(match['type'] == 'periodscore' ){
    //   isperiodscore = true
    // }
    // else isperiodscore = false
    bestofsets = match["bestofsets"];
    setSets();
    var teams = match["teams"];
    periodlength = match["periodlength"];
    var hometeam = teams["home"];
    if (hometeam["name"]) hometeamname = hometeam["name"];
    var awayteam = teams["away"];
    if (awayteam["name"]) awayteamname = awayteam["name"];
    teamNames["home"] = hometeamname;
    teamNames["away"] = awayteamname;
    // hometeamname = 'This team name is longer than 19 characters'

    document.getElementById("homeStateN").textContent = teamNames["home"];
    document.getElementById("awayStateN").textContent = teamNames["away"];
    if (teamNames["home"].indexOf("/") > -1) {
      let homeName = teamNames["home"].split("/");
      document.getElementById("homeStateN").textContent = homeName[0];
      document.getElementById("homeStateN1").textContent = homeName[1];
      document.getElementById("homeStateLine").setAttribute("y2", 27);

      let awayName = teamNames["away"].split("/");
      document.getElementById("awayStateN").textContent = awayName[0];
      document.getElementById("awayStateN1").textContent = awayName[1];
      document.getElementById("awayStateLine").setAttribute("y2", 27);
    }
    if (hometeamname.length > 19) {
      teamNames["home"] = hometeamname.substr(0, 17) + "...";
    }
    if (awayteamname.length > 19) {
      teamNames["away"] = awayteamname.substr(0, 17) + "...";
    }
    document.getElementById("homeTeamName").textContent = teamNames["home"];
    document.getElementById("awayTeamName").textContent = teamNames["away"];
    document.getElementById("period").textContent = capitalizeWords(
      match["status"]["name"].split(" ")
    ).join(" ");
    // Score Setting
    var result = match["result"];
    if (result["home"]) homeScore = result["home"];
    if (result["away"]) awayScore = result["away"];
    document.getElementById("setScore").textContent =
      homeScore + " - " + awayScore;
    // Period Score Setting
    let currentPeriod = 1;
    if (match["periods"] != null) {
      if (match["periods"]["p1"]) {
        document.getElementById("homeScore1").textContent =
          match["periods"]["p1"]["home"];
        document.getElementById("awayScore1").textContent =
          match["periods"]["p1"]["away"];
        gameCount =
          match["periods"]["p1"]["home"] + match["periods"]["p1"]["away"] + 1;
        currentPeriod = 2;
        $("#score").text(match["periods"]["p1"]["home"] + '-' + match["periods"]["p1"]["away"])
      } else {
        document.getElementById("homeScore1").textContent = "-";
        document.getElementById("awayScore1").textContent = "-";
      }
      if (match["periods"]["p2"]) {
        document.getElementById("homeScore2").textContent =
          match["periods"]["p2"]["home"];
        document.getElementById("awayScore2").textContent =
          match["periods"]["p2"]["away"];
        gameCount =
          match["periods"]["p2"]["home"] + match["periods"]["p2"]["away"] + 1;
        $("#score").text(match["periods"]["p2"]["home"] + '-' + match["periods"]["p2"]["away"])
      } else {
        document.getElementById("homeScore2").textContent = "-";
        document.getElementById("awayScore2").textContent = "-";
      }
      if (match["periods"]["p3"]) {
        document.getElementById("homeScore3").textContent =
          match["periods"]["p3"]["home"];
        document.getElementById("awayScore3").textContent =
          match["periods"]["p3"]["away"];
        gameCount =
          match["periods"]["p3"]["home"] + match["periods"]["p3"]["away"] + 1;
        $("#score").text(match["periods"]["p3"]["home"] + '-' + match["periods"]["p3"]["away"])
      } else {
        document.getElementById("homeScore3").textContent = "-";
        document.getElementById("awayScore3").textContent = "-";
      }
      if (match["periods"]["p4"]) {
        document.getElementById("homeScore4").textContent =
          match["periods"]["p4"]["home"];
        document.getElementById("awayScore4").textContent =
          match["periods"]["p4"]["away"];
        gameCount =
          match["periods"]["p4"]["home"] + match["periods"]["p4"]["away"] + 1;
        $("#score").text(match["periods"]["p4"]["home"] + '-' + match["periods"]["p4"]["away"])
      } else {
        document.getElementById("homeScore4").textContent = "-";
        document.getElementById("awayScore4").textContent = "-";
      }
      if (match["periods"]["p5"]) {
        document.getElementById("homeScore5").textContent =
          match["periods"]["p5"]["home"];
        document.getElementById("awayScore5").textContent =
          match["periods"]["p5"]["away"];
        gameCount =
          match["periods"]["p5"]["home"] + match["periods"]["p5"]["away"] + 1;
        $("#score").text(match["periods"]["p5"]["home"] + '-' + match["periods"]["p5"]["away"])
      } else {
        document.getElementById("homeScore5").textContent = "-";
        document.getElementById("awayScore5").textContent = "-";
      }
      // document.getElementById("gameCount").textContent = "Game " + gameCount;
    } else {
      document.getElementById("homeScore1").textContent = "-";
      document.getElementById("awayScore1").textContent = "-";
    }

    // match['numberofperiods'] == 2
    if (match["numberofperiods"] == 2) {
      document.getElementById("homeScore3").style.display = "none";
      document.getElementById("awayScore3").style.display = "none";

      document.getElementById("tableName1").textContent = "1 HALF";
      document.getElementById("tableName2").textContent = "2 HALF";
      document.getElementById("tableName3").style.display = "none";
    } else {
      document.getElementById("homeScore3").style.display = "block";
      document.getElementById("awayScore3").style.display = "block";

      document.getElementById("tableName1").textContent = "1st Set";
      document.getElementById("tableName2").textContent = "2nd Set";
      document.getElementById("tableName3").textContent = "3rd Set";
      document.getElementById("tableName3").style.display = "block";
    }

    if (match["status"]["name"] == "Ended") {
      //Match End
      setCenterFrame("Match End", homeScore + " : " + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
    if (match["status"]["name"] == "Break") {
      //Break time
      setCenterFrame("Break", homeScore + " : " + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }

    if (match["status"]["name"] == "Not started") {
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
      const currentDate = new Date();
      //Match End
      upCommingTime = currentDate.getTime() / 1000 - match["updated_uts"];
      // var seconds = Math.floor(updated_uts / 1000)
      var seconds = Math.floor(upCommingTime);
      var minute = Math.floor(seconds / 60);
      var second = seconds % 60;
      // var date = new Date(match['_dt']['date'] + '4:52:48 PM UTC');
      var matchDate = match["_dt"]["date"].split("/");
      var date = new Date(
        matchDate[1] +
          "/" +
          matchDate[0] +
          "/20" +
          matchDate[2] +
          " " +
          match["_dt"]["time"] +
          ":00 UTC"
      );

      matchStartDate = date.getTime();
    }

    if (match["p"] == 1) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 2) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 3) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 4) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 5) {
      $("#homeStateG").css('display', 'block');
      $("#awayStateG").css('display', 'block');
    }
    if (match["p"] == 31) {
      setTimer = false;
      setCenterFrame("Break", homeScore + ":" + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
    if (match["p"] == 32) {
      setTimer = false;
      setCenterFrame("Halftime", homeScore + ":" + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
    if (match["p"] == 33) {
      setTimer = false;
      setCenterFrame("Break", homeScore + ":" + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
    if (match["p"] == 34) {
      setTimer = false;
      setCenterFrame("Break", homeScore + ":" + awayScore);
      $("#homeStateG").css('display', 'none');
      $("#awayStateG").css('display', 'none');
    }
  
}