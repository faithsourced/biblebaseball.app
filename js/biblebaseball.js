var question_packs = [];
var questions = [];
var pitch = [];
var pitch_tracker = [];

var settings = {speed: 0, innings: 9};
var gamescore = {home : 0, visitor : 0, inning: 1, half: 'Top', outs: 0};
var base_runners = {first: false, second: false, third: false};

var pitch_countdown = settings.speed;
var pitch_timer;

$(document).ready(function() {
	$('.mound').on('click', '.pitcher', function() {
		if($(".pitcher").css('opacity') == 1) { // prevent double clicks
			throwPitch();
		}
	});
	
	$('.answers').on('click', '.answer', function() {
		if($(this).css('opacity') == 1) { // only register if opacity is 1, otherwise, time has expired
			answer($(this).attr('data-question'), $(this).attr('data-choice'));
		}
	});

	$('.mound').on('click', '.play_ball', function() {
		var question_pack = $('#question_pack_selector').val();
		settings.speed = $('#pitch_speed_selector').val();
		pitch_countdown = settings.speed;
		
		if(question_pack) {
			loadQuestions(question_pack);
		}
	});	
});

function countdown() {
	var countdown_timer = '<div id="pitch_countdown"><span class="number"></span><svg><circle r="18" cx="20" cy="20"></circle></svg></div>';
	
	if(settings.speed > 0) {
		if(pitch_countdown == settings.speed) { // setup
			$(".mound").html(countdown_timer);
			$("#pitch_countdown").fadeIn(300);
			$('#pitch_countdown svg circle').css({'animation' : 'countdown '+settings.speed+'s linear 1 forwards'});
		}
		if (pitch_countdown == 0) {
			out();
		} else {
			$('#pitch_countdown .number').html(pitch_countdown);
			pitch_countdown--;
		}
	}
	else {
		clearTimeout(pitch_timer); // don't need the timer afterall
	}
}

function resetCountdown() {
	clearTimeout(pitch_timer);
	pitch_countdown = settings.speed;
	$('#pitch_countdown').fadeOut(300, function() {
		$(".mound").empty();
	});
}

function loadChoices(question, choices) {
	choices = shuffleChoices(choices);
	
	$.each(choices, function (index, choice) {
		var choice_html = "<button class=\"answer\" data-question=\""+question+"\" data-choice=\""+choice.id+"\">"+choice.text+"</button>";
		$(".answers").append(choice_html);
	});
	$(".answers").fadeIn(300);
}

function increaseScore() {
	var score;
	
	if(gamescore.half == "Bottom") {
		score = ++gamescore.home;
	}
	else {
		score = ++gamescore.visitor;
	}
	
	$('.scoreboard .active h1').html(score);
}

function answer(question_id, choice_id) {
	if(questions[question_id]["answer"][0].id == choice_id) {
		hit();
	}
	else {
		out();
	}
	$('.answers').empty();
}

function throwPitch() {
	removePitcher();
	$('.playbyplay').fadeOut(300, function() {
		pitch = pickQuestion();
		setQuestion();
		showQuestion();
		pitch_timer = setInterval(countdown, 1000);
	});
}

function pickQuestion() {
	if(questions.length == pitch_tracker.length) {
		pitch_tracker = [];	
	}
	var pick = questions[Math.floor(Math.random()*questions.length)];
	if (!includes(pitch_tracker, pick.id)) {
		pitch_tracker.push(pick.id);
		return pick;
	}
	else {
		return pickQuestion();
	}
}

function loadQuestions(file) {
	$.getJSON('questions/'+file, function(data) {
		questions = data;
		$(".mound_visit").fadeOut(300, function() {
			addPitcher();
		});
		$(".logo").fadeOut(300);
   });
}

function sortQuestionPacks(element, prop, propType, asc) {
  switch (propType) {
    case "int":
      element = element.sort(function (a, b) {
        if (asc) {
          return (parseInt(a[prop]) > parseInt(b[prop])) ? 1 : ((parseInt(a[prop]) < parseInt(b[prop])) ? -1 : 0);
        } else {
          return (parseInt(b[prop]) > parseInt(a[prop])) ? 1 : ((parseInt(b[prop]) < parseInt(a[prop])) ? -1 : 0);
        }
      });
      break;
    default:
      element = element.sort(function (a, b) {
        if (asc) {
          return (a[prop].toLowerCase() > b[prop].toLowerCase()) ? 1 : ((a[prop].toLowerCase() < b[prop].toLowerCase()) ? -1 : 0);
        } else {
          return (b[prop].toLowerCase() > a[prop].toLowerCase()) ? 1 : ((b[prop].toLowerCase() < a[prop].toLowerCase()) ? -1 : 0);
        }
      });
  }
}

function includes(data, value) {
	var pos = data.indexOf(value);
	if (pos >= 0) {
		return true;
	}
	return false;
}

function loadQuestionPacks() {
	$.getJSON('questions/packs.json', function(data) {
		sortQuestionPacks(data , "id", "int", false);
		question_packs = data;
		
		var mound_visit = "<div class=\"mound_visit\"><select id=\"question_pack_selector\" name=\"question_pack\">";
			mound_visit += "<option value=\"\">Trivia Pack&hellip;</option>";
		
		$.each(question_packs, function (index, question_pack) {
			mound_visit += "<option value=\""+question_pack.file+"\">"+question_pack.name+" ("+question_pack.difficulty+")</option>";
		});
		
			mound_visit += "</select><br />";
		
			mound_visit += "<select id=\"pitch_speed_selector\" name=\"pitch_speed\">";
			mound_visit += "<option value=\"\">Pitch Speed&hellip;</option>";
			mound_visit += "<option value=\"0\" selected>Little League</option>";
			mound_visit += "<option value=\"15\">Rookie Ball</option>";
			mound_visit += "<option value=\"10\">Minor League</option>";
			mound_visit += "<option value=\"5\">Major League</option>";
			mound_visit += "<option value=\"3\">Hall of Fame</option>";
			mound_visit += "</select><br />";
			
			mound_visit += "<button class=\"btn play_ball\">Play Ball</button></div>";
			
		$(".mound").html(mound_visit);
   });
}

function addPitcher() {
	$(".mound").html("<button class=\"btn pitcher\">Pitch</button>");
	$(".pitcher").fadeIn(300);
}

function removePitcher() {
	$(".pitcher").fadeOut(300, function() {
		$(".mound").empty();
	});
}

function showRunners() {
	$('.runner').hide();
	if(base_runners.first == true) {
		$('.runner.first').fadeIn(300);
	}
	if(base_runners.second == true) {
		$('.runner.second').fadeIn(300);
	}
	if(base_runners.third == true) {
		$('.runner.third').fadeIn(300);
	}
}

function hit() {
	resetCountdown();
	hideQuestion();
	hideChoices();
	var hit_text = "";
	
	var hit = Math.floor(Math.random() * 100) + 1;
	if(hit >= 95) {
		hit_text = "Homerun!";
		hitHomerun();
	}
	else if (hit >= 85) {
		hit_text = "Triple!";
		hitTriple();
	}
	else if (hit >= 65) {
		hit_text = "Double!";
		hitDouble();
	}
	else {
		hit_text = "Single!";
		hitSingle();
	}
	
	$('.playbyplay').html("<p>Hit! "+hit_text+"</p>").fadeIn(300);
	
	if(gameOver()) {
		gameRecap();
	}
	else {
		setTimeout(function() {
			addPitcher();
		}, 2000);
		
		showRunners();
	}
}

function out() {
	resetCountdown();
	hideQuestion();
	hideChoices();
	$('.playbyplay').html("<p>Out!<br />"+questions[pitch.id]["answer"][0].explanation+"</p>").fadeIn(300);
	
	++gamescore.outs;
	$('.outs h1').html(gamescore.outs);
	
	if(gameOver()) {
		gameRecap();
	}
	else {
		if(gamescore.outs == 3) {
			setTimeout(function() {
				changeInning();
			}, 1000);
		}
		
		setTimeout(function() {
			addPitcher();
		}, 2000);
	}
}

function hitHomerun() {
	if(base_runners.third == true) {
		increaseScore();
		base_runners.third = false;
	}
	if(base_runners.second == true) {
		increaseScore();
		base_runners.second = false;
	}
	if(base_runners.first == true) {
		increaseScore();
		base_runners.first = false;
	}
	increaseScore();
	resetBases();
}

function hitTriple() {
	if(base_runners.third == true) {
		increaseScore();
		base_runners.third = false;
	}
	if(base_runners.second == true) {
		increaseScore();
		base_runners.second = false;
	}
	if(base_runners.first == true) {
		increaseScore();
		base_runners.first = false;
	}
	base_runners.third = true;
}

function hitDouble() {
	if(base_runners.third == true) {
		increaseScore();
		base_runners.third = false;
	}
	if(base_runners.second == true) {
		increaseScore();
		base_runners.second = false;
	}
	if(base_runners.first == true) {
		base_runners.third = true;
		base_runners.first = false;
	}
	
	base_runners.second = true;
}

function hitSingle() {
	if(base_runners.third == true) {
		increaseScore();
		base_runners.third = false;
	}
	if(base_runners.second == true) {
		base_runners.second = false;
		base_runners.third = true;
	}
	if(base_runners.first == true) {
		base_runners.second = true;
	}
	
	base_runners.first = true;
}

function resetBases(half) {
	$('.runner').fadeOut(300, function() {
		if(half == "Bottom") {
			$(this).removeClass('home').addClass('visitor');
		}
		else {
			$(this).removeClass('visitor').addClass('home');
		}
	});
	base_runners.first = false;
	base_runners.second = false;
	base_runners.third = false;
}

function setQuestion() {
	$('.question').html('<p>' + pitch.question + '</p>');
}

function showQuestion() {
	$(".question").fadeIn(300, function() {
		loadChoices(pitch.id, pitch.choices);
	});
}

function hideQuestion() {
	$(".question").fadeOut(300);
}

function shuffleChoices(choices) {
  var currentIndex = choices.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = choices[currentIndex];
    choices[currentIndex] = choices[randomIndex];
    choices[randomIndex] = temporaryValue;
  }

  return choices;
}

function hideChoices() {
	$(".answer").fadeOut(300);
}

function changeInning() {	
	resetBases(gamescore.half);
	
	$('.scoreboard .active').removeClass('active');

	if(gamescore.half == "Bottom") {
		$('.scoreboard .visitor').addClass('active');
		++gamescore.inning;
		$('.inning h1').html(gamescore.inning);
		gamescore.half = "Top";
	}
	else {
		$('.scoreboard .home').addClass('active');
		gamescore.half = "Bottom";
	}
	$('.inning h4').html(gamescore.half);
	gamescore.outs = 0;
	$('.outs h1').html(gamescore.outs);
}

function gameOver() {
	if(gamescore.half == "Top" && gamescore.outs == 3 && gamescore.inning >= settings.innings && gamescore.home > gamescore.visitor) { // no need to play the bottom half of the ninth, home team won
		return true;
	}
	if(gamescore.half == "Bottom" && gamescore.inning >= settings.innings && gamescore.home > gamescore.visitor) { // walk off win
		return true;
	}
}

function gameRecap() {
	setTimeout(function() {
		$('.scoreboard .active').removeClass('active');
		$('.playbyplay').fadeOut(300, function() {
			var winner = '';
			if(gamescore.home > gamescore.visitor) {
				winner = 'Home';
			}
			else {
				winner = 'Visitor';
			}

			$(this).html("<p>Game Over!<br />"+winner+" Wins!</p>").fadeIn(300);
		});	
	}, 2000);
}

loadQuestionPacks();