(function () {
  var questions = [
    {
      q: "Which of these best places Dacia on the old map?",
      choices: [
        "Mostly south of the Danube, toward the Aegean",
        "North of the Danube, in and over the Carpathians",
        "Only the Black Sea coast around Tomis",
        "A single court that already ruled Wallachia and Transylvania"
      ],
      correct: 1,
      fact: "Greek and Roman writers used Dacia for the lands north of the Danube. Thrace sat mostly south of it."
    },
    {
      q: "What lasted after Rome pulled the Dacian province back south of the Danube?",
      choices: [
        "The full Roman garrison and tax offices",
        "A Latin speech in fields, markets, and households",
        "A written Dacian grammar still used in church",
        "Direct rule from Constantinople over every village"
      ],
      correct: 1,
      fact: "The administration left. A Latin-based language stayed, the eastern Romance tongue that became Romanian."
    },
    {
      q: "The three lands that later made up the Romanian story were:",
      choices: [
        "Wallachia, Moldavia, and Transylvania",
        "Wallachia, Dobruja, and Bessarabia only",
        "Thrace, Dacia, and Tomis",
        "Bucharest, Cluj, and Constanța"
      ],
      correct: 0,
      fact: "They were neighbors for centuries before one state: plains south of the mountains, the east toward the Prut, and the land inside the Carpathian arc."
    },
    {
      q: "Why were the churches of northern Moldavia painted on the outside?",
      choices: [
        "So tourists could collect them as a national symbol",
        "As private altarpieces for a city donor",
        "So people in the yard could read the story without a book",
        "To hide unfinished stone from the weather"
      ],
      correct: 2,
      fact: "Voroneț, Moldovița, Sucevița and the others put judgment, saints, and feasts on the wall. The wall was the book."
    },
    {
      q: "What happened in 1859 that began putting the modern country together?",
      choices: [
        "Greater Romania attached Transylvania after World War I",
        "The assemblies of Wallachia and Moldavia elected the same prince, Alexandru Ioan Cuza",
        "Constanța became a Romanian port by the Treaty of Berlin",
        "Carol of Hohenzollern was crowned king on the first try"
      ],
      correct: 1,
      fact: "That double election was the personal union of the two principalities. 1918 is a later hinge, not the same event."
    },
    {
      q: "Before it was Constanța, the old Black Sea town was widely known as:",
      choices: [
        "Sarmizegetusa",
        "Târgoviște",
        "Tomis",
        "Voroneț"
      ],
      correct: 2,
      fact: "Greek settlers founded Tomis. Ovid was exiled there; the modern Romanian port begins after 1878."
    },
    {
      q: "In Romanian Orthodoxy, how is the sign of the cross made?",
      choices: [
        "With two fingers, left to right",
        "With three fingers, right to left",
        "Only with holy water, never with the hand",
        "The same way as in the Latin West, without change"
      ],
      correct: 1,
      fact: "The church here stayed in the Eastern habit: communion with Constantinople’s line, liturgy that later used Slavonic, and that cross."
    },
    {
      q: "Which regional speech is the main base of standard Romanian?",
      choices: [
        "Moldavian alone",
        "Banat speech from the southwest",
        "Muntenian, the southern dialect of Wallachia",
        "A pure village tongue kept unchanged since Dacia"
      ],
      correct: 2,
      fact: "The standard was built mostly on Muntenian speech, with choices from the written tradition. Other dialects remain living ways of speaking."
    },
    {
      q: "What is the ia in Romanian craft?",
      choices: [
        "A carved wooden gate from Maramureș",
        "The embroidered blouse whose stitch marks a region",
        "A green-glazed Horezu rooster plate",
        "A wax-drawn Easter egg from Bucovina"
      ],
      correct: 1,
      fact: "Sleeve, stitch, and color mark a place more reliably than a postcard. The ștergar and the bed cover sit beside it in the house."
    },
    {
      q: "What is Mărțișor?",
      choices: [
        "The blessing of water on January 6",
        "A red and white thread pinned on at the start of March",
        "The circle dance at a wedding",
        "The long fast before Christmas only"
      ],
      correct: 1,
      fact: "March 1: a small red and white thread, worn until a tree flowers. Winter is being argued with."
    },
    {
      q: "Which pair matches the folk music page?",
      choices: [
        "Hora — circle dance; doină — slow free lament",
        "Sârba — only a Serbian passport dance; nai — a bagpipe",
        "Doină — the fast stamp dance; cobză — a church bell",
        "Călușari — a guest circle anyone joins at the table"
      ],
      correct: 0,
      fact: "The hora is the ring the whole yard can enter. The doină takes its own time and is not for the circle."
    }
  ];

  var root = document.getElementById("quiz");
  if (!root) return;

  var index = 0;
  var score = 0;
  var answered = false;

  function encouragement(n, total) {
    if (n === total) return "Every answer landed. The lessons held.";
    if (n >= total - 2) return "Strong reading. A short revisit of the weak spots will finish it.";
    if (n >= Math.ceil(total / 2)) return "A fair start. Open the history lessons again and try once more.";
    return "No harm done. The history pages are short; walk them, then return.";
  }

  function renderQuestion() {
    answered = false;
    var item = questions[index];
    var html = "";
    html += '<div class="quiz-card" role="group" aria-labelledby="quiz-q">';
    html += '<p class="quiz-num">Question ' + (index + 1) + " of " + questions.length + "</p>";
    html += '<h2 id="quiz-q">' + item.q + "</h2>";
    html += '<div class="quiz-choices" role="list">';
    item.choices.forEach(function (label, i) {
      html +=
        '<button type="button" class="quiz-choice" role="listitem" data-i="' +
        i +
        '">' +
        label +
        "</button>";
    });
    html += "</div>";
    html += '<p class="quiz-feedback" id="quiz-feedback" hidden></p>';
    html += '<button type="button" class="quiz-next" id="quiz-next" hidden>Next</button>';
    html += "</div>";
    root.innerHTML = html;

    root.querySelectorAll(".quiz-choice").forEach(function (btn) {
      btn.addEventListener("click", onChoose);
    });
    document.getElementById("quiz-next").addEventListener("click", onNext);
  }

  function onChoose(ev) {
    if (answered) return;
    answered = true;
    var chosen = parseInt(ev.currentTarget.getAttribute("data-i"), 10);
    var item = questions[index];
    var feedback = document.getElementById("quiz-feedback");
    var next = document.getElementById("quiz-next");

    root.querySelectorAll(".quiz-choice").forEach(function (btn) {
      var i = parseInt(btn.getAttribute("data-i"), 10);
      btn.disabled = true;
      if (i === item.correct) btn.classList.add("is-correct");
      if (i === chosen && chosen !== item.correct) btn.classList.add("is-wrong");
    });

    if (chosen === item.correct) {
      score += 1;
      feedback.textContent = "Correct. " + item.fact;
      feedback.className = "quiz-feedback is-correct";
    } else {
      feedback.textContent = "Not that one. " + item.fact;
      feedback.className = "quiz-feedback is-wrong";
    }
    feedback.hidden = false;
    next.hidden = false;
    next.textContent = index === questions.length - 1 ? "See score" : "Next question";
    next.focus();
  }

  function onNext() {
    index += 1;
    if (index >= questions.length) {
      renderScore();
    } else {
      renderQuestion();
    }
  }

  function renderScore() {
    var html = "";
    html += '<div class="quiz-card quiz-score" role="status">';
    html += "<h2>Your score</h2>";
    html +=
      '<p class="quiz-score-line">' +
      score +
      " out of " +
      questions.length +
      "</p>";
    html += "<p>" + encouragement(score, questions.length) + "</p>";
    html += '<button type="button" class="quiz-again" id="quiz-again">Try again</button>';
    html += "</div>";
    root.innerHTML = html;
    document.getElementById("quiz-again").addEventListener("click", reset);
    document.getElementById("quiz-again").focus();
  }

  function reset() {
    index = 0;
    score = 0;
    answered = false;
    renderQuestion();
  }

  renderQuestion();
})();
