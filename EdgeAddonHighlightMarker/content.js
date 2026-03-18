// content.js - コンテンツスクリプト v1.0.0 (Edge Addon)

(function () {
  "use strict";

  const AUTO_CLASS = "edge-highlight-auto";
  const MANUAL_CLASS = "edge-highlight";

  // ツールチップ
  let tooltip = null;
  function ensureTooltip() {
    if (tooltip || !document.body) return;
    tooltip = document.createElement("div");
    tooltip.className = "edge-highlight-tooltip";
    document.body.appendChild(tooltip);
  }
  function showTooltip(text, x, y) {
    ensureTooltip();
    if (!tooltip) return;
    tooltip.textContent = text;
    tooltip.style.left = x + "px";
    tooltip.style.top = (y - 34) + "px";
    tooltip.classList.add("visible");
  }
  function hideTooltip() {
    if (tooltip) tooltip.classList.remove("visible");
  }

  // spanにスタイルを適用
  function styleSpan(span, preset) {
    span.style.color = preset.textColor || "#000000";
    span.style.backgroundColor = preset.bgColor || "#ffff00";
    span.style.setProperty("--eh-bg-color", preset.bgColor || "#ffff00");
    if (preset.bold) span.style.fontWeight = "bold";
    if (preset.underline) span.style.textDecoration = "underline";
    if (preset.border) span.style.border = "2px solid " + (preset.borderColor || "#000000");
  }

  function attachHover(span, label) {
    span.addEventListener("mouseenter", function(e) { showTooltip(label, e.clientX, e.clientY); });
    span.addEventListener("mouseleave", hideTooltip);
    span.addEventListener("mousemove", function(e) {
      if (tooltip) { tooltip.style.left = e.clientX + "px"; tooltip.style.top = (e.clientY - 34) + "px"; }
    });
  }

  // spanを取り除いてテキストに戻す
  function unwrapSpan(span) {
    var parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
    parent.normalize();
  }

  // ===== 手動ハイライト =====
  function applyHighlight(preset) {
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    var range = selection.getRangeAt(0);
    if (!selection.toString().trim()) return;

    var span = document.createElement("span");
    span.className = MANUAL_CLASS + (preset.blink ? " blink" : "");
    span.dataset.preset = preset.name;
    styleSpan(span, preset);

    span.addEventListener("click", function(e) {
      e.preventDefault(); e.stopPropagation();
      unwrapSpan(span); hideTooltip();
    });
    attachHover(span, "「" + preset.name + "」- クリックで削除");

    try {
      range.surroundContents(span);
    } catch(ex) {
      var frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
    }
    selection.removeAllRanges();
  }

  function clearAll() {
    document.querySelectorAll("." + MANUAL_CLASS).forEach(unwrapSpan);
  }

  // ===== 自動ハイライト（登録文字列） =====
  var SKIP_TAGS = { SCRIPT:1, STYLE:1, NOSCRIPT:1, TEXTAREA:1, INPUT:1, SELECT:1, IFRAME:1, CODE:1, PRE:1, HEAD:1 };

  function clearAutoHighlights() {
    document.querySelectorAll("." + AUTO_CLASS).forEach(unwrapSpan);
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function replaceTextNode(textNode, entries, presets) {
    var text = textNode.nodeValue;
    var matches = [];

    entries.forEach(function(entry) {
      var flags = entry.caseSensitive ? "g" : "gi";
      var re = new RegExp(escapeRegExp(entry.text), flags);
      var m;
      while ((m = re.exec(text)) !== null) {
        var start = m.index, end = m.index + m[0].length;
        var overlap = matches.some(function(ex) { return start < ex.end && end > ex.start; });
        if (!overlap) matches.push({ start: start, end: end, entry: entry, matched: m[0] });
      }
    });

    if (matches.length === 0) return;
    matches.sort(function(a, b) { return a.start - b.start; });

    var fragment = document.createDocumentFragment();
    var pos = 0;

    matches.forEach(function(match) {
      if (pos < match.start) fragment.appendChild(document.createTextNode(text.slice(pos, match.start)));
      var preset = presets[match.entry.presetIndex] || presets[0];
      if (preset) {
        var span = document.createElement("span");
        span.className = AUTO_CLASS + (preset.blink ? " blink" : "");
        span.dataset.autoText = match.entry.text;
        span.dataset.preset = preset.name;
        styleSpan(span, preset);
        attachHover(span, "「" + preset.name + "」[自動] \"" + match.entry.text + "\"");
        span.appendChild(document.createTextNode(match.matched));
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(match.matched));
      }
      pos = match.end;
    });

    if (pos < text.length) fragment.appendChild(document.createTextNode(text.slice(pos)));
    textNode.parentNode.replaceChild(fragment, textNode);
  }

  function applyAutoHighlights(registeredStrings, presets) {
    clearAutoHighlights();
    var entries = (registeredStrings || []).filter(function(e) { return e.text && e.text.trim(); });
    if (entries.length === 0 || !presets || presets.length === 0) return;

    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          var parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (SKIP_TAGS[parent.tagName]) return NodeFilter.FILTER_REJECT;
          if (parent.closest("." + AUTO_CLASS) || parent.closest("." + MANUAL_CLASS)) return NodeFilter.FILTER_REJECT;
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) textNodes.push(node);
    textNodes.forEach(function(tn) { replaceTextNode(tn, entries, presets); });
  }

  function runAutoHighlights() {
    chrome.storage.sync.get(["registeredStrings", "presets"], function(result) {
      applyAutoHighlights(result.registeredStrings || [], result.presets || []);
    });
  }

  // ストレージ変更を監視
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.registeredStrings || changes.presets) {
      runAutoHighlights();
    }
  });

  // グローバル公開
  window.edgeHighlightMarker = { applyHighlight: applyHighlight, clearAll: clearAll };

  // ページロード時に実行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { ensureTooltip(); runAutoHighlights(); });
  } else {
    ensureTooltip();
    runAutoHighlights();
  }

})();
