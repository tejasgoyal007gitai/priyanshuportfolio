/* Priyanshu Agarwal portfolio — shared behaviour for every page */
(function () {
  "use strict";

  /* ===== Easy-to-edit settings ===== */
  var SITE = {
    // Availability badge: set on:false to hide it everywhere, or change the text.
    availability: { on: true, text: "Open to professional opportunities" },
    // Contact form: paste a form-service endpoint (e.g. a Formspree URL) to receive messages directly.
    // Left empty, the form opens the visitor's email app with the message filled in.
    formEndpoint: "",
    email: "priyanshuagarwal1501@gmail.com",
    resumePdf: "Priyanshu_Agarwal_Resume.pdf",
    resumePreview: "resume-preview.jpg",
    resumeFilename: "Priyanshu_Agarwal_Resume.pdf"
  };

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ----- Toast ----- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { toastEl.classList.remove("show"); }, 3600);
  }

  /* ----- Availability badge ----- */
  $$("[data-availability]").forEach(function (el) {
    if (!SITE.availability.on) { el.hidden = true; return; }
    var t = $("[data-availability-text]", el); if (t) t.textContent = SITE.availability.text;
  });

  /* ----- Nav: scroll shadow, mobile drawer ----- */
  var nav = $(".site-nav");
  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("scrolled", y > 8);
    var tt = $(".to-top"); if (tt) tt.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var toggle = $(".nav-toggle"), drawer = $(".drawer");
  function setDrawer(open) {
    if (!toggle || !drawer) return;
    drawer.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.innerHTML = open ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () { setDrawer(!drawer.classList.contains("open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setDrawer(false); closeLightbox(); } });
  $$(".drawer a").forEach(function (a) { a.addEventListener("click", function () { setDrawer(false); }); });

  /* ----- Back to top ----- */
  var top = $(".to-top");
  if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  /* ----- Reveal on scroll (content stays visible if anything fails) ----- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var vh = window.innerHeight || 800;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove("pending"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.95) { el.classList.add("pending"); io.observe(el); }
    });
    setTimeout(function () { $$(".reveal.pending").forEach(function (el) { el.classList.remove("pending"); }); }, 9000);
  }

  /* ----- Count-up metrics (final values are already in the HTML) ----- */
  function fmt(n, dec) { return n.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  var counters = $$("[data-count]");
  if (!reduceMotion && counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; cio.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-dec") || "0", 10);
        var pre = el.getAttribute("data-prefix") || "", suf = el.getAttribute("data-suffix") || "";
        var start = null, dur = 1400;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + fmt(target * e, dec) + suf;
          if (p < 1) requestAnimationFrame(step); else el.textContent = pre + fmt(target, dec) + suf;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ----- Filters ----- */
  $$("[data-filter-group]").forEach(function (group) {
    var scope = document.getElementById(group.getAttribute("data-filter-group"));
    $$(".filter-btn", group).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        $$(".filter-btn", group).forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        var shown = 0;
        $$("[data-cats]", scope).forEach(function (card) {
          var ok = f === "all" || card.getAttribute("data-cats").split(",").indexOf(f) > -1;
          card.classList.toggle("is-hidden", !ok); if (ok) shown++;
        });
        var empty = $("[data-empty]", scope.parentNode); if (empty) empty.hidden = shown > 0;
      });
    });
  });

  /* ----- Lightbox ----- */
  var lb, lbImg, lbCap, lbOpen, lbItems = [], lbIndex = 0, lastFocus;
  function buildLightbox() {
    lb = document.createElement("div"); lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Document preview");
    lb.innerHTML = '<button class="lb-close" aria-label="Close preview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<img alt="">' +
      '<button class="lb-nav lb-next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg></button>' +
      '<div class="lb-bar"><span class="lb-caption"></span><a class="btn btn-light btn-sm lb-open" target="_blank" rel="noopener">Open full size</a></div>';
    document.body.appendChild(lb);
    lbImg = $("img", lb); lbCap = $(".lb-caption", lb); lbOpen = $(".lb-open", lb);
    $(".lb-close", lb).addEventListener("click", closeLightbox);
    $(".lb-prev", lb).addEventListener("click", function () { showLb(lbIndex - 1); });
    $(".lb-next", lb).addEventListener("click", function () { showLb(lbIndex + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    });
  }
  function showLb(i) {
    if (!lbItems.length) return;
    lbIndex = (i + lbItems.length) % lbItems.length;
    var it = lbItems[lbIndex];
    lbImg.src = it.src; lbImg.alt = it.caption; lbCap.textContent = it.caption; lbOpen.href = it.src;
    var multi = lbItems.length > 1; $(".lb-prev", lb).hidden = !multi; $(".lb-next", lb).hidden = !multi;
  }
  function openLightbox(items, index) {
    if (!lb) buildLightbox();
    lastFocus = document.activeElement; lbItems = items; showLb(index || 0);
    lb.classList.add("open"); document.body.style.overflow = "hidden"; $(".lb-close", lb).focus();
  }
  function closeLightbox() {
    if (!lb || !lb.classList.contains("open")) return;
    lb.classList.remove("open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus();
  }
  $$("[data-lightbox]").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var group = trigger.getAttribute("data-lightbox");
      var all = $$('[data-lightbox="' + group + '"]');
      var items = all.map(function (t) { return { src: t.getAttribute("href") || t.getAttribute("data-src"), caption: t.getAttribute("data-caption") || "" }; });
      openLightbox(items, all.indexOf(trigger));
    });
  });

  /* ----- Resume download ----- */
  // On a normal web host the link downloads the PDF directly. Inside the Claude artifact viewer,
  // downloads go through the viewer's save prompt; if that is unavailable, a preview opens instead.
  var claudeDownloads = null;
  if (window.claude && typeof window.claude.use === "function") {
    window.claude.use("downloads").then(function (d) { claudeDownloads = d; }).catch(function () {});
  }
  var inClaude = !!(window.claude && typeof window.claude.use === "function");
  function resumePreview() { openLightbox([{ src: SITE.resumePreview, caption: "Resume — Priyanshu Agarwal" }], 0); }
  $$("[data-resume]").forEach(function (a) {
    a.setAttribute("href", SITE.resumePdf); a.setAttribute("download", SITE.resumeFilename);
    a.addEventListener("click", function (e) {
      if (!inClaude) return; // normal browser: let the link download the PDF
      e.preventDefault();
      if (!claudeDownloads) { resumePreview(); return; }
      fetch(SITE.resumePdf).then(function (r) { if (!r.ok) throw new Error("missing"); return r.blob(); })
        .then(function (blob) { return claudeDownloads.save({ filename: SITE.resumeFilename, data: blob }); })
        .then(function (res) { if (res && res.status === "saved") toast("Resume saved"); })
        .catch(function (err) {
          if (err && err.code === "declined") return;
          resumePreview();
        });
    });
  });

  /* ----- Copy buttons ----- */
  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg || "Copied"); }, function () { toast("Copy didn't work here. Select the text and copy it manually."); });
    } else { toast("Copy isn't available here. Select the text and copy it manually."); }
  }
  $$("[data-copy]").forEach(function (b) { b.addEventListener("click", function () { copyText(b.getAttribute("data-copy"), b.getAttribute("data-copy-msg")); }); });

  /* ----- Contact form ----- */
  var form = $("#contact-form");
  if (form) {
    var status = $("#form-status");
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your full name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
      organisation: function () { return ""; },
      subject: function (v) { return v.trim().length >= 3 ? "" : "Please add a short subject."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Please write a message of at least 10 characters."; }
    };
    function check(input) {
      var fn = rules[input.name]; if (!fn) return true;
      var msg = fn(input.value), err = $("#" + input.id + "-err");
      input.classList.toggle("invalid", !!msg); input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg; return !msg;
    }
    $$("input, textarea", form).forEach(function (i) { i.addEventListener("blur", function () { check(i); }); i.addEventListener("input", function () { if (i.classList.contains("invalid")) check(i); }); });
    function showStatus(html, kind) { status.className = "form-status show note" + (kind === "warn" ? " amber" : ""); status.innerHTML = html; status.focus && status.focus(); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true; $$("input, textarea", form).forEach(function (i) { if (!check(i)) ok = false; });
      if (!ok) { var first = $(".invalid", form); if (first) first.focus(); return; }
      var d = { name: form.name.value.trim(), email: form.email.value.trim(), organisation: form.organisation.value.trim(), subject: form.subject.value.trim(), message: form.message.value.trim() };
      var body = d.message + "\n\n— " + d.name + (d.organisation ? ", " + d.organisation : "") + "\n" + d.email;
      var btn = $("button[type=submit]", form);
      if (SITE.formEndpoint) {
        btn.disabled = true; btn.textContent = "Sending…";
        fetch(SITE.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
          .then(function (r) {
            if (!r.ok) throw new Error("status " + r.status);
            showStatus("<b>Thank you, your message has been sent.</b> Priyanshu will reply to " + escapeHtml(d.email) + ".");
            form.reset();
          })
          .catch(function () { mailtoFallback(d, body, true); })
          .then(function () { btn.disabled = false; btn.textContent = "Send message"; });
      } else { mailtoFallback(d, body, false); }
    });
    function mailtoFallback(d, body, failed) {
      var href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent(d.subject) + "&body=" + encodeURIComponent(body);
      showStatus((failed ? "<b>The message couldn't be sent from this page.</b> " : "<b>Almost done. Your message has not been sent yet.</b> ") +
        "Use the button below to open it in your email app, ready to send. If no email app opens, copy the message and email it to <b>" + SITE.email + "</b>." +
        '<div class="btn-row mt-16"><a class="btn btn-blue btn-sm" id="mailto-link">Open in email app</a><button type="button" class="btn btn-ghost btn-sm" id="copy-msg">Copy message</button></div>', "warn");
      $("#mailto-link").setAttribute("href", href);
      $("#copy-msg").addEventListener("click", function () { copyText("To: " + SITE.email + "\nSubject: " + d.subject + "\n\n" + body, "Message copied"); });
    }
  }
  function escapeHtml(s) { return s.replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ----- Account prioritisation matrix (projects detail page) ----- */
  var matrix = $("#matrix");
  if (matrix) {
    var dims = ["Account potential", "Strategic fit", "Revenue opportunity", "Profitability", "Relationship strength", "Growth potential", "Ease of service"];
    // Illustrative scores only (1–5) for three hypothetical accounts — not real client data.
    var accounts = [
      { name: "Account A (illustrative)", s: [5, 4, 5, 3, 2, 4, 3] },
      { name: "Account B (illustrative)", s: [3, 5, 3, 4, 5, 3, 4] },
      { name: "Account C (illustrative)", s: [2, 3, 2, 3, 3, 5, 5] },
      { name: "Account D (illustrative)", s: [4, 2, 4, 2, 1, 3, 2] }
    ];
    var weights = [20, 15, 20, 10, 15, 10, 10];
    var wBox = $("#weights");
    dims.forEach(function (dname, i) {
      var row = document.createElement("div"); row.className = "weight-row";
      row.innerHTML = '<label for="w' + i + '">' + dname + '</label><input type="range" id="w' + i + '" min="0" max="30" step="5" value="' + weights[i] + '"><output for="w' + i + '" id="o' + i + '">' + weights[i] + '</output>';
      wBox.appendChild(row);
      $("#w" + i, row).addEventListener("input", function (e) { weights[i] = +e.target.value; $("#o" + i).textContent = weights[i]; render(); });
    });
    function render() {
      var total = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
      var rows = accounts.map(function (a) {
        var sc = a.s.reduce(function (acc, v, i) { return acc + v * weights[i]; }, 0) / total; return { name: a.name, score: sc };
      }).sort(function (x, y) { return y.score - x.score; });
      $("#wtotal").textContent = total;
      $("#rank-body").innerHTML = rows.map(function (r, i) {
        var tier = r.score >= 3.8 ? ["tier-a", "Priority"] : r.score >= 3.0 ? ["tier-b", "Develop"] : ["tier-c", "Maintain"];
        return "<tr><td>" + (i + 1) + "</td><td>" + r.name + '</td><td><div class="bar"><i style="width:' + (r.score / 5 * 100).toFixed(0) + '%"></i></div></td><td class="score">' + r.score.toFixed(2) + '</td><td><span class="tier ' + tier[0] + '">' + tier[1] + "</span></td></tr>";
      }).join("");
    }
    render();
  }

  /* ----- Hero background: subtle network lines (canvas) ----- */
  var cv = $("#hero-canvas");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), pts = [], W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function seed() { pts = []; var n = Math.round(Math.min(70, W * H / 16000)); for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18 }); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!reduceMotion) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 15000) { ctx.strokeStyle = "rgba(0,94,184," + (0.10 * (1 - d / 15000)).toFixed(3) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        ctx.fillStyle = "rgba(0,145,218,.28)"; ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    size(); seed(); draw();
    window.addEventListener("resize", function () { size(); seed(); if (reduceMotion) draw(); });
  }

  /* ----- Portrait: show monogram until a real photo is added at portrait.jpg ----- */
  $$("img[data-portrait]").forEach(function (img) {
    function fail() { img.hidden = true; var ph = img.parentNode.querySelector(".placeholder"); if (ph) ph.hidden = false; }
    img.addEventListener("error", fail); if (img.complete && !img.naturalWidth) fail();
  });

  /* ----- Other downloads (e.g. project workbooks) inside the Claude viewer ----- */
  $$("a[download]:not([data-resume])").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (!inClaude) return;
      e.preventDefault();
      var name = a.getAttribute("href").split("/").pop();
      if (!claudeDownloads) { toast("Downloads aren't available in this preview. They work on the published website."); return; }
      fetch(a.getAttribute("href")).then(function (r) { if (!r.ok) throw new Error("missing"); return r.blob(); })
        .then(function (blob) { return claudeDownloads.save({ filename: name, data: blob }); })
        .then(function (res) { if (res && res.status === "saved") toast("File saved"); })
        .catch(function (err) { if (!err || err.code !== "declined") toast("The file couldn't be downloaded here."); });
    });
  });

  /* ----- PPVVC opportunity scorer (questions and rules from the assessment workbook) ----- */
  var ppvvcData = $("#ppvvc-data");
  if (ppvvcData) {
    var D = JSON.parse(ppvvcData.textContent), answers = D.sample.slice();
    var dims = ["PAIN", "POWER", "VISION", "VALUE", "CONTROL"];
    var val = { Y: 5, U: 2.5, N: 0 };
    function status(x) { return x >= 4 ? "HIGH" : x >= 3 ? "MEDIUM" : "LOW"; }
    function fmt1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
    function renderScorer() {
      var scores = {};
      dims.forEach(function (d) {
        var idx = []; D.q.forEach(function (q, i) { if (q.dim === d) idx.push(i); });
        scores[d] = idx.reduce(function (s, i) { return s + val[answers[i]]; }, 0) / idx.length;
        var gs = $("#gs-" + d); if (gs) gs.textContent = fmt1(scores[d]) + " / 5";
      });
      var overall = dims.reduce(function (s, d) { return s + scores[d]; }, 0) / dims.length;
      $("#ppvvc-overall").textContent = fmt1(overall);
      var pr = $("#ppvvc-prio"), st = status(overall);
      pr.className = "prio prio-" + st; pr.textContent = st + " PRIORITY";
      $("#ppvvc-dims").innerHTML = dims.map(function (d) {
        var s = scores[d], stt = status(s);
        return '<div class="dim-row"><span>' + d.charAt(0) + d.slice(1).toLowerCase() + '</span><div class="bar"><i style="width:' + (s / 5 * 100) + '%"></i></div><span class="num" style="text-align:right">' + fmt1(s) + '</span><span class="prio prio-' + stt + '" style="text-align:center">' + stt + "</span></div>";
      }).join("");
      var acts = [];
      dims.forEach(function (d) { if (scores[d] < 3) acts.push('<li><span>' + d + ' low</span><br>' + D.dimLow[d] + "</li>"); });
      D.q.forEach(function (q, i) { var a = answers[i]; if (a === "N" || a === "U") acts.push('<li><span>Q' + (i + 1) + " · " + q.dim + " · " + (a === "N" ? "No" : "Unknown") + "</span><br>" + q[a] + "</li>"); });
      $("#ppvvc-actions").innerHTML = acts.length ? acts.join("") : "<li>No gaps: every question is answered yes. Move to the next sales step.</li>";
    }
    $$("#ppvvc-scorer .ynu button").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-q"); answers[i] = b.getAttribute("data-v");
        $$('#ppvvc-scorer .ynu button[data-q="' + i + '"]').forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        renderScorer();
      });
    });
    var reset = $("#ppvvc-reset");
    if (reset) reset.addEventListener("click", function () {
      answers = D.sample.slice();
      $$("#ppvvc-scorer .ynu button").forEach(function (x) { x.setAttribute("aria-pressed", answers[+x.getAttribute("data-q")] === x.getAttribute("data-v") ? "true" : "false"); });
      renderScorer();
    });
    renderScorer();
  }

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
