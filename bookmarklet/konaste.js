// SIZ_GITADORA — Konaste Bookmarklet (home version)
// Bookmarklet 架構: auth check → DOM scrape → Supabase upsert
(function () {
  "use strict";

  const SUPABASE_URL = "%%VITE_SUPABASE_URL%%";
  const SUPABASE_ANON_KEY = "%%VITE_SUPABASE_ANON_KEY%%";

  // --- Auth check ---
  function getSession() {
    const raw = localStorage.getItem(
      "sb-" + SUPABASE_URL.replace(/https?:\/\//, "").split(".")[0] + "-auth-token"
    );
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const session = getSession();
  if (!session?.access_token || !session?.user?.id) {
    alert("[SIZ_GITADORA] Please log in to SIZ_GITADORA first");
    return;
  }

  const userId = session.user.id;
  const accessToken = session.access_token;

  // --- DOM scraping (Konaste score page) ---
  // NOTE: Konaste DOM structure differs from arcade — uses different class names.
  function scrapeKonasteScores() {
    const rows = document.querySelectorAll(".kon-music-item, [class*='music_row'], [class*='score-row']");
    const scores = [];

    rows.forEach((row) => {
      try {
        const title = row.querySelector(".title, .music-name, [class*='title']")?.textContent?.trim();
        if (!title) return;

        const gameTypeText = row.querySelector("[class*='guitar'], [class*='bass'], [class*='drum']")?.className ?? "";
        const gameType = gameTypeText.includes("drum") ? "DM" : "GF";

        const diffText = row.querySelector("[class*='diff'], .difficulty")?.textContent?.trim()?.toUpperCase();
        const difficulty = ["BSC", "ADV", "EXT", "MAS"].includes(diffText) ? diffText : null;
        if (!difficulty) return;

        const achievement = parseFloat(
          row.querySelector(".rate, [class*='achieve'], [class*='percent']")?.textContent?.replace("%", "") ?? "0"
        );

        const skillPoint = parseFloat(
          row.querySelector("[class*='skill'], .sp")?.textContent ?? "0"
        );

        const playCount = parseInt(
          row.querySelector("[class*='play_count'], .count")?.textContent ?? "0", 10
        );

        const bestGrade = row.querySelector("[class*='grade'], .rank")?.textContent?.trim() ?? null;
        const isExcellent = !!row.querySelector("[class*='excellent'], .exc");
        const isFullCombo = !!row.querySelector("[class*='fullcombo'], .fc");

        scores.push({
          game_type: gameType,
          difficulty,
          achievement_rate: achievement,
          skill_point: skillPoint,
          play_count: playCount,
          best_grade: bestGrade,
          is_excellent: isExcellent,
          is_full_combo: isFullCombo,
          title,
        });
      } catch (e) {
        // skip
      }
    });

    return scores;
  }

  const rawScores = scrapeKonasteScores();

  if (rawScores.length === 0) {
    alert("[SIZ_GITADORA] No score data found on this page. Please navigate to your Konaste score page first.");
    return;
  }

  // --- Upload to Supabase ---
  async function uploadScores(scores) {
    let success = 0;
    let failed = 0;

    for (const score of scores) {
      const songRes = await fetch(
        `${SUPABASE_URL}/rest/v1/songs?konami_song_id=eq.${encodeURIComponent("konaste_" + score.title)}&select=id`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      let songId;
      const songData = await songRes.json();
      if (songData.length > 0) {
        songId = songData[0].id;
      } else {
        const insertSong = await fetch(`${SUPABASE_URL}/rest/v1/songs`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            konami_song_id: "konaste_" + score.title,
            title: score.title,
            game_type: score.game_type,
          }),
        });
        const newSong = await insertSong.json();
        songId = Array.isArray(newSong) ? newSong[0]?.id : newSong?.id;
      }

      if (!songId) { failed++; continue; }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          user_id: userId,
          song_id: songId,
          game_type: score.game_type,
          difficulty: score.difficulty,
          achievement_rate: score.achievement_rate,
          skill_point: score.skill_point,
          play_count: score.play_count,
          best_grade: score.best_grade,
          is_excellent: score.is_excellent,
          is_full_combo: score.is_full_combo,
          source: "konaste",
          imported_at: new Date().toISOString(),
        }),
      });

      if (res.ok) success++;
      else failed++;
    }

    return { success, failed };
  }

  uploadScores(rawScores).then(({ success, failed }) => {
    if (failed > 0) {
      alert(`[SIZ_GITADORA] Import complete: ${success} updated, ${failed} failed.`);
    } else {
      alert(`[SIZ_GITADORA] Import complete: ${success} songs updated`);
    }
  });
})();
