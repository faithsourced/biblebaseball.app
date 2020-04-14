var question_packs = [];
var questions = [];
var asked = [];
var pitch = [];
var inning = 1;
var half = 'bottom';
var outs = 0;
var change_inning_delay;
var playbyplay_delay;
var red_score = 0;
var blue_score = 0;
var first_base = 0;
var second_base = 0;
var third_base = 0;

var pitch_speed = 0;
var this_countdown = 0;
var pitch_stopwatch;
var countdown_timer = '<div id="pitch_countdown"><span class="number"></span><svg><circle r="18" cx="20" cy="20"></circle></svg></div>';

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
		pitch_speed = $('#pitch_speed_selector').val();
		this_countdown = pitch_speed;
		
		if(question_pack) {
			loadQuestions(question_pack);
		}
	});	
});

function countdown() {
	if(pitch_speed > 0) {
		if(this_countdown == pitch_speed) { // setup
			$(".mound").html(countdown_timer);
			$("#pitch_countdown").fadeIn(300);
			$('#pitch_countdown svg circle').css({'animation' : 'countdown '+pitch_speed+'s linear 1 forwards'});
		}
		if (this_countdown == 0) {
			out();
		} else {
			$('#pitch_countdown .number').html(this_countdown);
			this_countdown--;
		}
	}
	else {
		clearTimeout(pitch_stopwatch);
	}
}

function resetCountdown() {
	clearTimeout(pitch_stopwatch);
	this_countdown = pitch_speed;
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
		pitch_stopwatch = setInterval(countdown, 1000);
	});
}

function pickQuestion() {
	if(questions.length == asked.length) {
		asked = [];	
	}
	var pick = questions[Math.floor(Math.random()*questions.length)];
	if (!includes(asked, pick.id)) {
		asked.push(pick.id);
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
	if(first_base == 1) {
		$('.runner.first').fadeIn(300);
	}
	if(second_base == 1) {
		$('.runner.second').fadeIn(300);
	}
	if(third_base == 1) {
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
	
	if (playbyplay_delay) {
		window.clearTimeout(playbyplay_delay);
	}
	playbyplay_delay = window.setTimeout(function() {
		addPitcher();
	}, 2000);
	
	$('.playbyplay').html("<p>Hit! "+hit_text+"</p>").fadeIn(300);
	
	showRunners();
}

function out() {
	resetCountdown();
	hideQuestion();
	hideChoices();
	$('.playbyplay').html("<p>Out!<br />"+questions[pitch.id]["answer"][0].explanation+"</p>").fadeIn(300);
	
	$('.outs h1').each(function () {
		var $this = $(this);
		var outs = parseInt($(this).html(), 10);
		++outs;
		$this.html(outs);
		
		if(outs == 3) {
			if (change_inning_delay) {
				window.clearTimeout(change_inning_delay);
			}
			change_inning_delay = window.setTimeout(function() {
				$this.html(0);
				changeInning();
			}, 1000);
		}
	});
	
	if (playbyplay_delay) {
		window.clearTimeout(playbyplay_delay);
	}
	playbyplay_delay = window.setTimeout(function() {
		addPitcher();
	}, 2000);
}

function hitHomerun() {
	if(third_base == 1) {
		increaseScore();
		third_base = 0;
	}
	if(second_base == 1) {
		increaseScore();
		second_base = 0;
	}
	if(first_base == 1) {
		increaseScore();
		first_base = 0;
	}
	increaseScore();
	resetBases();
}

function hitTriple() {
	if(third_base == 1) {
		increaseScore();
		third_base = 0;
	}
	if(second_base == 1) {
		increaseScore();
		second_base = 0;
	}
	if(first_base == 1) {
		increaseScore();
		first_base = 0;
	}
	third_base = 1;
}

function hitDouble() {
	if(third_base == 1) {
		increaseScore();
		third_base = 0;
	}
	if(second_base == 1) {
		increaseScore();
		second_base = 0;
	}
	if(first_base == 1) {
		third_base = 1;
		first_base = 0;
	}
	
	second_base = 1;
}

function hitSingle() {
	if(third_base == 1) {
		increaseScore();
		third_base = 0;
	}
	if(second_base == 1) {
		second_base = 0;
		third_base = 1;
	}
	if(first_base == 1) {
		second_base = 1;
	}
	
	first_base = 1;
}

function resetBases() {
	$('.runner').hide();
	first_base = 0;
	second_base = 0;
	third_base = 0;
}

function increaseScore() {
	$('.scoreboard>div.active').each(function () {
		var score = parseInt($(this).find('h1').html(), 10);
		++score;
		$(this).find('h1').html(score);
	});
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
	$('.inning h4').each(function () {
		var half = $(this).html();
		resetBases();
		$('.scoreboard>div.active').removeClass('active');
		
		if(half == "Bottom") {
			$('.scoreboard .red').addClass('active');
			$('.runner').removeClass('blue').addClass('red');
			$(this).html("Top");
			$(this).parent().find("h1").each(function () {
				var inning = parseInt($(this).html(), 10);
				++inning;
				$(this).html(inning);
			});
		}
		else {
			$('.runner').removeClass('red').addClass('blue');
			$('.scoreboard .blue').addClass('active');
			$(this).html("Bottom");
		}
	});
}

loadQuestionPacks();