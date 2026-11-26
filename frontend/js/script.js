// ===== REGISTRE DES RENDERERS PAR TEMPLATE =====
var RENDERERS = {
  "home": renderHome,
  "text-blocks": renderTextBlocks,
  "listing": renderListing,
  "icon-grid": renderIconGrid,
  "badge-grid": renderBadgeGrid,
  "card-grid": renderCardGrid,
  "contact": renderContact
};

// ===== POINT D'ENTREE =====
document.addEventListener("DOMContentLoaded", function () {
  loadData();
});

async function loadData() {
  try {
    // Phase 1 : lecture du fichier JSON
    // var response = await fetch("data/data.json");
    var response = await fetch("/api/data");
    // Phase 2 : remplacer par fetch("/api/data")
    if (!response.ok) throw new Error("HTTP " + response.status);
    var data = await response.json();

    renderHeader(data.header);
    renderSections(data.sections);
    renderFooter(data.footer);
  } catch (err) {
    console.error("Erreur lors du chargement des donnees:", err);
  }
}

// ===== SECTIONS DYNAMIQUES =====
function renderSections(sections) {
  var container = document.getElementById("sections-container");
  if (!container || !sections) return;

  container.innerHTML = "";

  sections.forEach(function (section) {
    var el = document.createElement("section");
    el.id = section.key;
    if (section.css) el.className = section.css;

    var renderer = RENDERERS[section.template];
    if (renderer) {
      renderer(el, section.data);
    }

    container.appendChild(el);
  });
}

// ===== HEADER =====
function renderHeader(header) {
  if (!header) return;

  var links = Object.entries(header).map(function (entry) {
    return { key: entry[0], label: entry[1], href: "#" + entry[0] };
  });

  var desktopUl = document.querySelector(".navbar-right .link");
  if (desktopUl) {
    desktopUl.innerHTML = "";
    links.forEach(function (link) {
      var li = document.createElement("li");
      if (link.key === "contact") {
        li.className = "contact";
        li.innerHTML = '<div class="btn btn-primary container rounded text-white p-2"><a href="' + link.href + '">' + esc(link.label) + "</a></div>";
      } else {
        li.innerHTML = '<div class="container"><a href="' + link.href + '">' + esc(link.label) + "</a></div>";
      }
      desktopUl.appendChild(li);
    });
  }

  var burgerUl = document.querySelector(".burger-dropdown ul");
  if (burgerUl) {
    burgerUl.innerHTML = "";
    links.forEach(function (link) {
      var li = document.createElement("li");
      if (link.key === "contact") {
        li.className = "contact";
        li.innerHTML = '<div class="container btn btn-primary rounded text-white p-3"><a href="' + link.href + '" class="burger-contact">' + esc(link.label) + "</a></div>";
      } else {
        li.innerHTML = '<a href="' + link.href + '">' + esc(link.label) + "</a>";
      }
      burgerUl.appendChild(li);
    });
  }
}

// ===== FOOTER =====
function renderFooter(footer) {
  if (!footer) return;
  var footerEl = document.querySelector("footer");
  if (!footerEl) return;

  var descP = footerEl.querySelector(".col.m-5 .text-body-secondary");
  if (descP && footer.subtitle) descP.textContent = footer.subtitle;

  var cols = footerEl.querySelectorAll(".col.mb-3");

  if (cols.length >= 2 && footer.navigation && footer.navigation[0]) {
    var navData = footer.navigation[0];
    var navUl = cols[1].querySelector("ul");
    if (navUl) {
      navUl.innerHTML = "";
      Object.entries(navData).forEach(function (entry) {
        if (entry[0] === "title") return;
        var li = document.createElement("li");
        li.className = "nav-item mb-2";
        li.innerHTML = '<a href="#' + entry[0] + '" class="nav-link p-0 text-body-secondary">' + esc(entry[1]) + "</a>";
        navUl.appendChild(li);
      });
    }
  }

  if (cols.length >= 3 && footer.services && footer.services[0]) {
    var svcData = footer.services[0];
    var svcUl = cols[2].querySelector("ul");
    if (svcUl) {
      svcUl.innerHTML = "";
      Object.entries(svcData).forEach(function (entry) {
        if (entry[0] === "title") return;
        var li = document.createElement("li");
        li.className = "nav-item mb-2";
        li.innerHTML = '<a href="#" class="nav-link p-0 text-body-secondary">' + esc(entry[1]) + "</a>";
        svcUl.appendChild(li);
      });
    }
  }
}

// =============================================================
//  RENDERERS - chacun recoit un <section> vide et le data
// =============================================================

// ===== HOME =====
function renderHome(section, data) {
  section.innerHTML =
    '<div class="hero container position-relative overflow-hidden z-1">' +
      '<div class="px-4 p-lg-5 my-lg-5 align-items-baseline text-start">' +
        '<figcaption class="text-info">' + esc(data.tagline) + "</figcaption>" +
        '<h1 class="display-5 fw-bold text-white">' + esc(data.title) + "</h1>" +
        '<div class="col-lg-6">' +
          '<p class="lead mb-4 text-color">' + esc(data.description) + "</p>" +
          '<div class="d-grid gap-2 d-sm-flex justify-content-md-start">' +
            '<a href="#services" class="btn btn-primary btn-lg p-3">' + esc(data.discover) + "</a>" +
            '<a href="#contact" class="btn btn-outline-secondary btn-lg px-4">Nous contacter</a>' +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="info p-4 text-start">' +
        '<ul class="p-1 list-unstyled d-flex gap-4">' +
          buildStats(data.stats) +
        "</ul>" +
      "</div>" +
    "</div>";
}

function buildStats(stats) {
  if (!stats) return "";
  return stats.map(function (s) {
    return '<li><div class="container"><h2 class="fw-bold text-white">' + esc(s.value) + '</h2><p class="text-color">' + esc(s.label) + "</p></div></li>";
  }).join("");
}

// ===== TEXT-BLOCKS (a-propos) =====
function renderTextBlocks(section, data) {
  section.innerHTML =
    '<div class="title text-center">' +
      "<h2>" + esc(data["section-title"]) + "</h2>" +
      "<figcaption>" + esc(data["section-subtitle"]) + "</figcaption>" +
    "</div>" +
    '<div class="container col-12 d-lg-flex">' +
      '<div class="a-propos-right col-lg-6">' +
        '<div class="sub-section title"><h3>' + esc(data["left-title"]) + "</h3></div>" +
        '<span class="lead text-secondary">' + (data["left-description"] || []).join("<br><br>") + "</span>" +
      "</div>" +
      '<div class="a-propos-left col-lg-6">' +
        '<div class="container d-block m-5">' +
          buildBlocks(data.block) +
        "</div>" +
      "</div>" +
    "</div>";
}

function buildBlocks(blocks) {
  if (!blocks) return "";
  return blocks.map(function (b) {
    return '<div class="abt-block d-flex p-4 m-2 border border-3 rounded">' +
      '<div class="icon container"><i class="bi ' + (b.icon || "") + '"></i></div>' +
      "<div><p>" + esc(b.title) + '</p><span class="text-secondary">' + esc(b.description) + "</span></div>" +
    "</div>";
  }).join("");
}

// ===== LISTING (services) =====
function renderListing(section, data) {
  var html =
    '<div class="title text-center">' +
      "<h2>" + esc(data["section-title"]) + "</h2>" +
      "<figcaption>" + esc(data["section-subtitle"]) + "</figcaption>" +
    "</div>";

  if (data.list) {
    data.list.forEach(function (service, index) {
      var rowClass = index % 2 === 0
        ? "row flex-lg-row-reverse align-items-center g-5"
        : "row align-items-center g-5";

      var itemsHtml = "";
      if (service.items && service.items.length > 0) {
        itemsHtml = "<ul>" + service.items.map(function (item) {
          return "<li>" + esc(item) + "</li>";
        }).join("") + "</ul>";
      }

      html +=
        '<div class="container col-xxl-8 px-4 py-5">' +
          '<div class="' + rowClass + '">' +
            '<div class="col-10 col-sm-8 col-lg-6">' +
              '<img src="" class="d-block mx-lg-auto img-fluid" alt="' + esc(service.title) + '">' +
            "</div>" +
            '<div class="col-lg-6">' +
              '<h4 class="fw-bold">' + esc(service.title) + "</h4>" +
              '<p class="lead">' + esc(service.description) + "</p>" +
              itemsHtml +
            "</div>" +
          "</div>" +
        "</div>";
    });
  }

  section.innerHTML = html;
}

// ===== ICON-GRID (expertise) =====
function renderIconGrid(section, data) {
  var html =
    '<div class="title text-center">' +
      "<h2>" + esc(data["section-title"]) + "</h2>" +
      "<figcaption>" + esc(data["section-subtitle"]) + "</figcaption>" +
    "</div>" +
    '<div class="container"><div class="row">';

  if (data.list) {
    data.list.forEach(function (item) {
      html +=
        '<div class="exp col-lg-6 col-md-12 p-4 border border-3 rounded">' +
          '<div class="icon container"><i class="bi ' + (item.icon || "") + '"></i></div>' +
          "<div><p>" + esc(item.title) + '</p><span class="text-secondary">' + esc(item.description) + "</span></div>" +
        "</div>";
    });
  }

  html += "</div></div>";
  section.innerHTML = html;
}

// ===== BADGE-GRID (competences) =====
function renderBadgeGrid(section, data) {
  var html =
    '<div class="title text-center">' +
      "<h2>" + esc(data["section-title"]) + "</h2>" +
      "<figcaption>" + esc(data["section-subtitle"]) + "</figcaption>" +
    "</div>" +
    '<div class="container"><div class="row g-3">';

  if (data.list) {
    data.list.forEach(function (cat) {
      var badgesHtml = cat.badges.map(function (b) {
        return '<span class="badge text-black border rounded-pill">' + esc(b) + "</span>";
      }).join("");

      html +=
        '<div class="competence-row col-lg-4 col-md-6 col-sm-12">' +
          '<div class="title-section"><p>' + esc(cat.title) + "</p></div>" +
          "<div>" + badgesHtml + "</div>" +
        "</div>";
    });
  }

  html += "</div></div>";
  section.innerHTML = html;
}

// ===== CARD-GRID (references) =====
function renderCardGrid(section, data) {
  var html =
    '<div class="title text-center">' +
      "<h2>" + esc(data["section-title"]) + "</h2>" +
      "<figcaption>" + esc(data["section-subtitle"]) + "</figcaption>" +
    "</div>" +
    '<div class="reference-content container d-lg-flex gap-3">';

  if (data.list) {
    data.list.forEach(function (ref) {
      html +=
        '<div class="ref col-lg-4 col-md-6 col-sm-12 border border-3 rounded shadow">' +
          '<div class="container text-center p-3">' +
            '<p class="fw-bold">' + esc(ref.title) + "</p>" +
            '<p class="text-body-secondary">' + esc(ref.description) + "</p>" +
          "</div>" +
        "</div>";
    });
  }

  html += "</div>";
  section.innerHTML = html;
}

// ===== CONTACT =====
function renderContact(section, data) {
  var infoHtml = "";
  if (data.info) {
    data.info.forEach(function (info) {
      var valueHtml = info.href
        ? '<a href="' + info.href + '">' + esc(info.value) + "</a>"
        : esc(info.value);
      infoHtml +=
        '<div class="d-flex align-items-center gap-3">' +
          '<i class="bi ' + info.icon + ' text-primary fs-4"></i>' +
          '<div class="info">' +
            '<p class="info-title fw-bold mb-0">' + esc(info.title) + "</p>" +
            '<p class="description mb-0">' + valueHtml + "</p>" +
          "</div>" +
        "</div>";
    });
  }

  var form = data.form || {};

  section.innerHTML =
    '<div class="title text-center">' +
      "<h2>" + esc(data["section-title"]) + "</h2>" +
      "<figcaption>" + esc(data["section-subtitle"]) + "</figcaption>" +
    "</div>" +
    '<div class="container d-lg-flex gap-4">' +
      '<div class="col-12 col-lg-5">' +
        '<div class="column contact-info h-100 d-flex flex-column justify-content-center gap-3">' +
          infoHtml +
        "</div>" +
      "</div>" +
      '<div class="col-12 col-lg-7">' +
        '<form id="contact-form" class="contact-form d-flex flex-column gap-3">' +
          '<div class="name-email d-flex gap-3">' +
            '<input type="text" placeholder="' + esc(form.name || "Nom") + '" required>' +
            '<input type="email" placeholder="' + esc(form.email || "Email") + '" required>' +
          "</div>" +
          '<input type="text" placeholder="' + esc(form.subject || "Sujet") + '" required>' +
          '<textarea rows="6" placeholder="' + esc(form.message || "Votre message...") + '" required></textarea>' +
          '<button type="submit" class="btn btn-primary btn-lg p-2 w-100">' + esc(data.button || "Envoyer") + "</button>" +
        "</form>" +
      "</div>" +
    "</div>";

  var contactForm = section.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var inputs = contactForm.querySelectorAll("input, textarea");
      var payload = {
        name: inputs[0].value,
        email: inputs[1].value,
        subject: inputs[2].value,
        message: inputs[3].value,
      };

      var btn = contactForm.querySelector("button");
      btn.disabled = true;
      btn.textContent = "Envoi en cours...";

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          contactForm.innerHTML = '<p class="text-white text-center fs-5">Message envoye avec succes !</p>';
        } else {
          alert(data.error || "Erreur lors de l'envoi.");
          btn.disabled = false;
          btn.textContent = "Envoyer";
        }
      })
      .catch(function () {
        alert("Erreur reseau.");
        btn.disabled = false;
        btn.textContent = "Envoyer";
      });
    });
  }
}

// ===== HELPERS =====
function esc(text) {
  if (!text) return "";
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
