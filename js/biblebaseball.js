var question_packs = [];
var questions = [];
var asked = [];
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

$(document).ready(function() {
	$('.mound').on('click', '.pitcher', function() {
		if($(".pitcher").css('opacity') == 1) { // prevent double clicks
			pitch();
		}
	});
	
	$('.out').on('click', function() {
		out();
	});
	
	$('.hit').on('click', function() {
		hit();
	});
	
	$('.answers').on('click', '.answer', function() {
		answer($(this).attr('data-question'), $(this).attr('data-choice'));
	});
	
	$('.mound').on('change', '.question_pack_selector', function() {
		if($(this).val()) {
			loadQuestions($(this).val());
		}
	});
});

function loadChoices(question, choices) {
	choices = shuffleChoices(choices);
	
	$.each(choices, function (index, choice) {
		var choice_html = "<button class=\"answer\" data-question=\""+question+"\" data-choice=\""+choice.id+"\">"+choice.text+"</button>";
		$(".answers").append(choice_html);
	});
	$(".answers").fadeIn();
}

function answer(question, choice) {
	if(questions[question]["answer"][0].id == choice) {
		hit();
	}
	else {
		$('.playbyplay').html("<p>Out!<br />"+questions[question]["answer"][0].explanation+"</p>");
		out();
	}
}

function pitch() {
	hidePitcher();
	var pitch = pickQuestion();
	setQuestion(pitch.question);
	showQuestion();
	loadChoices(pitch.id, pitch.choices);
}

function pickQuestion() {
	if(questions.length == asked.length) {
		asked = [];	
	}
	var pick = questions[Math.floor(Math.random()*questions.length)];
	if (!asked.includes(pick.id)) {
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
		$(".question_pack_selector").fadeOut(100, function() {
			addPitcher();
			showPitcher();
			$(".logo").fadeOut();
		});
   });
}

function loadQuestionPacks() {
	$.getJSON('questions/packs.json', function(data) {
		question_packs = data;
		var question_pack_selector = "<select id=\"question_pack_selector\" class=\"question_pack_selector\">";
		question_pack_selector += "<option value=\"\">Choose your Bible Baseball Trivia&hellip;</option>";
		
		$.each(question_packs, function (index, question_pack) {
			question_pack_selector += "<option value=\""+question_pack.file+"\">"+question_pack.name+" ("+question_pack.difficulty+")</option>";
		});
		
		question_pack_selector += "</select>";
		
		$(".mound").html(question_pack_selector);
   });
}

function addPitcher() {
	$(".mound").html("<button class=\"pitcher\">Pitch</button>");
}

function showPitcher() {
	$(".pitcher").fadeIn();
}

function hidePitcher() {
	$(".pitcher").fadeOut();
}

function showRunners() {
	$('.runner').hide();
	if(first_base == 1) {
		$('.runner.first').fadeIn();
	}
	if(second_base == 1) {
		$('.runner.second').fadeIn();
	}
	if(third_base == 1) {
		$('.runner.third').fadeIn();
	}
}

function hit() {
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
	
	$('.playbyplay').each(function () {
		var $this = $(this);
		
		$this.html("<p>Hit! "+hit_text+"</p>").fadeIn();
		if (playbyplay_delay) {
			window.clearTimeout(playbyplay_delay);
		}
		playbyplay_delay = window.setTimeout(function() {
			$this.fadeOut(100, function() {
				showPitcher();
			});
		}, 3000);
	});
	
	showRunners();
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

function setQuestion(question) {
	$('.question').html('<p>' + question + '</p>');
}

function showQuestion() {
	$(".question").fadeIn();
}

function hideQuestion() {
	$(".question").fadeOut();
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
	$(".answer").fadeOut();
}

function out() {
	hideQuestion();
	hideChoices();
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
	
	$('.playbyplay').each(function () {
		var $this = $(this);
		
		$this.fadeIn();
		if (playbyplay_delay) {
			window.clearTimeout(playbyplay_delay);
		}
		playbyplay_delay = window.setTimeout(function() {
			$this.fadeOut(100, function() {
				showPitcher();
			});
		}, 2000);
	});
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