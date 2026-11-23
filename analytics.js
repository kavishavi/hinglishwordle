// GoatCounter event tracking for Hinglish Wordle: fires quiz-started / quiz-completed
// once per day, matching the events the quiz sites send. Read-only: it watches the
// game's own localStorage state (key "nyt-wordle-state") and never touches game data.
(function () {
  if (!window.localStorage) return;

  function today() {
    return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time
  }

  function fire(name) {
    var t = today();
    var path = name + '/' + t;
    var flag = 'gc_track_' + name + '_' + t;
    try {
      if (localStorage.getItem(flag)) return;
      localStorage.setItem(flag, '1');
    } catch (e) {}
    var tries = 0;
    var attempt = function () {
      try {
        var gc = window.goatcounter;
        if (gc && typeof gc.count === 'function') {
          gc.count({ path: path, title: name + ' (' + t + ')', event: true });
        } else if (++tries < 40) {
          setTimeout(attempt, 250);
        }
      } catch (e) {}
    };
    attempt();
  }

  function done(name) {
    try { return !!localStorage.getItem('gc_track_' + name + '_' + today()); } catch (e) { return true; }
  }

  function sameDay(ts) {
    if (!ts) return false;
    try { return new Date(ts).toLocaleDateString('en-CA') === today(); } catch (e) { return false; }
  }

  var timer = null;
  function check() {
    try {
      var raw = localStorage.getItem('nyt-wordle-state');
      if (raw) {
        var st = JSON.parse(raw);
        if (!done('quiz-started') && sameDay(st.lastPlayedTs) && st.rowIndex > 0) {
          fire('quiz-started');
        }
        if (!done('quiz-completed') &&
            (st.gameStatus === 'WIN' || st.gameStatus === 'FAIL') &&
            sameDay(st.lastCompletedTs)) {
          fire('quiz-completed');
        }
      }
      if (done('quiz-started') && done('quiz-completed') && timer) {
        clearInterval(timer);
        timer = null;
      }
    } catch (e) {}
  }

  check();
  timer = setInterval(check, 3000);
})();
