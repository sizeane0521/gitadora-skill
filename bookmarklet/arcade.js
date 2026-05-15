// SIZ_GITADORA — Arcade Bookmarklet (p.eagate.573.jp)
// Selectors verified from live p.eagate.573.jp DOM inspection.
(function () {
  "use strict";

  const SUPABASE_URL = "%%VITE_SUPABASE_URL%%";
  const SUPABASE_ANON_KEY = "%%VITE_SUPABASE_ANON_KEY%%";
  const APP_URL = "%%APP_URL%%";

  // --- Auth check ---
  function getSession() {
    const key = "sb-" + SUPABASE_URL.replace(/https?:\/\//, "").split(".")[0] + "-auth-token";
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  const session = getSession();
  if (!session?.access_token || !session?.user?.id) {
    alert("[SIZ_GITADORA] SIZ_GITADORA にまずログインしてください / Please log in to SIZ_GITADORA first");
    return;
  }

  const userId = session.user.id;
  const accessToken = session.access_token;

  // --- Arcade Score DOM Scraping ---
  // Verified selectors from p.eagate.573.jp skill target song page:
  //   div.maincont > table.skill_table_tb > tbody > tr
  //   div.title a.text_link         → song title
  //   div.seq_icon[class*="part_"]  → part_GUITAR / part_BASS / part_DRUM
  //   div.seq_icon[class*="diff_"]  → diff_MASTER / diff_EXTREME / diff_ADVANCED / diff_BASIC
  //   td.skill_cell                 → skill point (e.g. "146.28 pt")
  //   td.achive_cell                → achievement rate (e.g. "79.50 %")
  //   td.diff_cell                  → difficulty level (e.g. "9.20")
  function scrapeArcadeScores() {
    const rows = document.querySelectorAll("div.maincont table.skill_table_tb tbody tr");
    const scores = [];

    rows.forEach(function (row) {
      try {
        const titleEl = row.querySelector("div.title a.text_link");
        const title = titleEl ? titleEl.textContent.trim() : null;
        if (!title) return;

        // Instrument / Part
        const partEl = row.querySelector("div.seq_icon[class*='part_']");
        const partClass = partEl ? partEl.className : "";
        var part = "G";
        var gameType = "GF";
        if (partClass.indexOf("part_DRUM") !== -1) { part = "D"; gameType = "DM"; }
        else if (partClass.indexOf("part_BASS") !== -1) { part = "B"; gameType = "GF"; }
        else { part = "G"; gameType = "GF"; }

        // Difficulty
        const diffEl = row.querySelector("div.seq_icon[class*='diff_']");
        const diffClass = diffEl ? diffEl.className : "";
        var difficulty = "MAS";
        if (diffClass.indexOf("diff_EXTREME") !== -1) difficulty = "EXT";
        else if (diffClass.indexOf("diff_ADVANCED") !== -1) difficulty = "ADV";
        else if (diffClass.indexOf("diff_BASIC") !== -1) difficulty = "BSC";
        else difficulty = "MAS";

        // Skill point: "146.28 pt" → 146.28
        const skillText = row.querySelector("td.skill_cell") ? row.querySelector("td.skill_cell").textContent.trim() : "0";
        const skillPoint = parseFloat(skillText.replace(/[^0-9.]/g, "")) || 0;

        // Achievement rate: "79.50 %" → 79.50
        const achiveText = row.querySelector("td.achive_cell") ? row.querySelector("td.achive_cell").textContent.trim() : "0";
        const achievementRate = parseFloat(achiveText.replace(/[^0-9.]/g, "")) || 0;

        // Difficulty level: "9.20" → 9.20
        const diffLevelText = row.querySelector("td.diff_cell") ? row.querySelector("td.diff_cell").textContent.trim() : "0";
        const diffLevel = parseFloat(diffLevelText) || 0;

        scores.push({
          title: title,
          game_type: gameType,
          part: part,
          difficulty: difficulty,
          skill_point: skillPoint,
          achievement_rate: achievementRate,
          diff_level: diffLevel,
        });
      } catch (e) {
        // skip malformed row silently
      }
    });

    return scores;
  }

  // Arcade Score DOM Scraping — 空頁處理
  var rawScores = scrapeArcadeScores();
  if (rawScores.length === 0) {
    alert("[SIZ_GITADORA] このページに成績データが見つかりません。スキル対象曲ページに移動してから実行してください。\n/ No score data found. Please navigate to your skill target song page first.");
    return;
  }

  // --- Arcade Score Upsert to Supabase ---
  function uploadScores(scores) {
    var success = 0;
    var failed = 0;
    var index = 0;

    function processNext() {
      if (index >= scores.length) {
        if (failed > 0) {
          alert("[SIZ_GITADORA] Import complete: " + success + " updated, " + failed + " failed.");
        } else {
          alert("[SIZ_GITADORA] Import complete: " + success + " songs updated");
        }
        if (APP_URL) {
          window.location.href = APP_URL + "/dashboard?imported=" + success + "&failed=" + failed;
        }
        return;
      }

      var score = scores[index++];
      var konamiId = "arcade_" + score.title;

      // Step 1: find or create song
      fetch(SUPABASE_URL + "/rest/v1/songs?konami_song_id=eq." + encodeURIComponent(konamiId) + "&select=id", {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + accessToken,
        },
      })
      .then(function (r) { return r.json(); })
      .then(function (songData) {
        if (songData && songData.length > 0) {
          return songData[0].id;
        }
        // Create new song record
        return fetch(SUPABASE_URL + "/rest/v1/songs", {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": "Bearer " + accessToken,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
          },
          body: JSON.stringify({
            konami_song_id: konamiId,
            title: score.title,
            game_type: score.game_type,
            artist: "",
          }),
        })
        .then(function (r) { return r.json(); })
        .then(function (newSong) {
          return Array.isArray(newSong) ? (newSong[0] && newSong[0].id) : (newSong && newSong.id);
        });
      })
      .then(function (songId) {
        if (!songId) { failed++; processNext(); return; }

        // Step 2: upsert score
        return fetch(SUPABASE_URL + "/rest/v1/scores", {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": "Bearer " + accessToken,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            user_id: userId,
            song_id: songId,
            game_type: score.game_type,
            difficulty: score.difficulty,
            achievement_rate: score.achievement_rate,
            skill_point: score.skill_point,
            play_count: 0,
            best_grade: null,
            is_excellent: false,
            is_full_combo: false,
            source: "arcade",
            imported_at: new Date().toISOString(),
          }),
        });
      })
      .then(function (res) {
        if (res && res.ok) success++; else failed++;
        processNext();
      })
      .catch(function () {
        failed++;
        processNext();
      });
    }

    processNext();
  }

  uploadScores(rawScores);
})();
