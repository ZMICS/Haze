const demoStats = {
  activeVehicles: 142,
  activeRoutes: 24,
  onTime: 87,
  congestedRoutes: 4
};

const demoVehicles = [
  {
    vehicle_id: "BUS-101",
    route: "25A",
    latitude: 17.3850,
    longitude: 78.4867,
    speed: 24,
    delay: 2,
    status: "normal"
  },
  {
    vehicle_id: "BUS-216",
    route: "25A",
    latitude: 17.3910,
    longitude: 78.4800,
    speed: 18,
    delay: 5,
    status: "delayed"
  },
  {
    vehicle_id: "BUS-305",
    route: "218",
    latitude: 17.3780,
    longitude: 78.4920,
    speed: 9,
    delay: 11,
    status: "congested"
  },
  {
    vehicle_id: "BUS-412",
    route: "10H",
    latitude: 17.3970,
    longitude: 78.4750,
    speed: 15,
    delay: 6,
    status: "delayed"
  },
  {
    vehicle_id: "BUS-527",
    route: "5K",
    latitude: 17.3690,
    longitude: 78.5010,
    speed: 28,
    delay: 1,
    status: "normal"
  },
  {
    vehicle_id: "BUS-633",
    route: "218",
    latitude: 17.4020,
    longitude: 78.4880,
    speed: 7,
    delay: 14,
    status: "congested"
  }
];


const routeData = {

  "25A": {
    from: "Secunderabad",
    to: "Mehdipatnam",
    status: "ON TIME",
    color: "#55e5dd",
    vehicles: 4,
    eta: "32 min",

    points: [
      [17.4399,78.4983],
      [17.4250,78.4920],
      [17.4020,78.4880],
      [17.3850,78.4867],
      [17.3618,78.4747],
      [17.3418,78.4495]
    ]
  },

  "218": {
    from: "ECIL",
    to: "Mehdipatnam",
    status: "DELAYED",
    color: "#f5ca58",
    vehicles: 6,
    eta: "41 min",

    points: [
      [17.4770,78.5650],
      [17.4550,78.5480],
      [17.4200,78.5250],
      [17.3920,78.5050],
      [17.3700,78.4850],
      [17.3420,78.4490]
    ]
  },

  "10H": {
    from: "Secunderabad",
    to: "Koti",
    status: "SLOW",
    color: "#ff8b62",
    vehicles: 3,
    eta: "27 min",

    points: [
      [17.4399,78.4983],
      [17.4250,78.4920],
      [17.4020,78.4880],
      [17.3820,78.4850],
      [17.3650,78.4820],
      [17.3610,78.4760]
    ]
  },

  "5K": {
    from: "Koti",
    to: "Kukatpally",
    status: "ON TIME",
    color: "#66a8ff",
    vehicles: 5,
    eta: "36 min",

    points: [
      [17.3850,78.4867],
      [17.3750,78.4750],
      [17.3610,78.4560],
      [17.3700,78.4300],
      [17.4050,78.4120],
      [17.4930,78.3990]
    ]
  }

};


const searchPlaces = [

  ["Charminar",17.3616,78.4747],
  ["Secunderabad",17.4399,78.4983],
  ["HITEC City",17.4435,78.3772],
  ["Gachibowli",17.4401,78.3489],
  ["Kukatpally",17.4849,78.4138],
  ["Ameerpet",17.4375,78.4483],
  ["Begumpet",17.4435,78.4596],
  ["Banjara Hills",17.4156,78.4347],
  ["Jubilee Hills",17.4319,78.4070],
  ["Mehdipatnam",17.3947,78.4425],
  ["Koti",17.3842,78.4866],
  ["Hussain Sagar",17.4239,78.4738]

];


let map = null;
let vehicleMarkers = [];
let routeLayers = [];
let heatLayers = [];
let selectedRoute = "25A";
let searchMarker = null;


document.addEventListener("DOMContentLoaded", () => {

  initTheme();

  initializeMap();

  updateStatistics(demoStats);

  addVehicleMarkers(demoVehicles);

  addHeatRiskZones();

  setupReveal();

  setupNavigation();

  setupMobileMenu();

  setupMapSearch();

  animateCounters();

  renderRouteCards();

});


/* ================= THEME ================= */

function initTheme() {

  const saved =
    localStorage.getItem("haze-theme");

  if (saved === "light") {
    document.body.classList.add("light");
  }

  syncThemeButton();

  document
    .getElementById("themeToggle")
    ?.addEventListener("click", () => {

      document.body.classList.toggle("light");

      localStorage.setItem(
        "haze-theme",
        document.body.classList.contains("light")
          ? "light"
          : "dark"
      );

      syncThemeButton();

      if (map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      }

    });

}


function syncThemeButton() {

  const button =
    document.getElementById("themeToggle");

  if (!button) return;

  const light =
    document.body.classList.contains("light");

  button.classList.toggle("light", light);

  const icon =
    button.querySelector("span");

  if (icon) {
    icon.textContent = light ? "☀" : "☾";
  }

}


/* ================= MAP ================= */

function initializeMap() {

  const element =
    document.getElementById("map");

  if (!element || typeof L === "undefined") {
    return;
  }

  map = L.map("map", {

    zoomControl: true,

    minZoom: 11,

    maxZoom: 17,

    maxBounds: [
      [17.20,78.25],
      [17.60,78.75]
    ],

    maxBoundsViscosity: 0.9

  }).setView(
    [17.385,78.4867],
    12.6
  );


  /*
    No Carto tiles.
    No API key.
    No Google Maps.
    OpenStreetMap tiles only.
  */

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        "© OpenStreetMap contributors"
    }
  ).addTo(map);


  map.on("click", () => {
    closeSearchResults();
  });


  drawSelectedRoute();

}


/* ================= VEHICLES ================= */

function addVehicleMarkers(data) {

  if (!map) return;

  vehicleMarkers.forEach(marker => {
    map.removeLayer(marker);
  });

  vehicleMarkers = [];


  data.forEach(vehicle => {

    let className =
      "normal-marker";

    if (vehicle.status === "delayed") {
      className = "delayed-marker";
    }

    if (vehicle.status === "congested") {
      className = "congested-marker";
    }


    const icon =
      L.divIcon({

        className: "",

        html: `
          <div class="vehicle-marker ${className}">
            🚌
          </div>
        `,

        iconSize: [31,31],

        iconAnchor: [15,15]

      });


    const marker =
      L.marker(
        [
          vehicle.latitude,
          vehicle.longitude
        ],
        { icon }
      ).addTo(map);


    marker.bindTooltip(
      `${vehicle.vehicle_id} • Route ${vehicle.route}`,
      {
        direction: "top",
        offset: [0,-13]
      }
    );


    marker.on("click", () => {
      showVehicleDetails(vehicle);
    });


    vehicleMarkers.push(marker);

  });

}


function updateVehicleMarkers(data) {

  if (Array.isArray(data)) {
    addVehicleMarkers(data);
  }

}


/* ================= VEHICLE PANEL ================= */

function showVehicleDetails(vehicle) {

  const setText =
    (id, value) => {

      const element =
        document.getElementById(id);

      if (element) {
        element.textContent = value;
      }

    };


  setText(
    "detailVehicleId",
    vehicle.vehicle_id
  );

  setText(
    "detailRoute",
    vehicle.route
  );

  setText(
    "detailSpeed",
    `${vehicle.speed} km/h`
  );

  setText(
    "detailDelay",
    `+${vehicle.delay} min`
  );

  setText(
    "detailStatus",
    vehicle.status.toUpperCase()
  );


  document
    .getElementById("vehiclePanel")
    ?.classList.add("open");

}


function closeVehicleDetails() {

  document
    .getElementById("vehiclePanel")
    ?.classList.remove("open");

}


/* ================= STATS ================= */

function updateStatistics(data) {

  const values = [

    ["activeVehicles", data.activeVehicles],

    ["activeRoutes", data.activeRoutes],

    ["onTime", `${data.onTime}%`],

    ["congestedRoutes", data.congestedRoutes]

  ];


  values.forEach(([id,value]) => {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent = value;
    }

  });

}


/* ================= ROUTES ================= */

function renderRouteCards() {

  const container =
    document.getElementById("routeCards");

  if (!container) return;


  container.innerHTML =
    Object.entries(routeData)
      .map(([route, data]) => {

        return `

          <article
            class="route-card ${
              route === selectedRoute
                ? "selected"
                : ""
            }"
            style="--route-color:${data.color}"
            onclick="selectRoute('${route}')"
          >

            <span class="route-no">
              ${route}
            </span>

            <span class="route-status">
              ${data.status}
            </span>

            <h3>
              ${data.from} → ${data.to}
            </h3>

            <p>
              Hyderabad demo transit corridor with
              map visualization and live vehicle context.
            </p>

            <div class="route-foot">
              <span>
                ${data.vehicles} active vehicles
              </span>

              <span>
                ${data.eta}
              </span>
            </div>

          </article>

        `;

      })
      .join("");

}


function selectRoute(route) {

  if (!routeData[route]) return;

  selectedRoute = route;

  renderRouteCards();

  const data =
    routeData[route];


  const title =
    document.getElementById(
      "selectedRouteTitle"
    );

  const meta =
    document.getElementById(
      "selectedRouteMeta"
    );


  if (title) {
    title.textContent =
      `${route} • ${data.from} → ${data.to}`;
  }


  if (meta) {

    meta.textContent =
      `${data.status} corridor • ${data.vehicles} active vehicles • ${data.eta}`;

  }


  drawSelectedRoute();


  document
    .getElementById("transit")
    ?.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });


  setTimeout(() => {
    focusSelectedRoute();
  },450);

}


function drawSelectedRoute() {

  if (!map) return;


  routeLayers.forEach(layer => {
    map.removeLayer(layer);
  });

  routeLayers = [];


  const data =
    routeData[selectedRoute];


  const line =
    L.polyline(
      data.points,
      {
        color:data.color,
        weight:7,
        opacity:.92,
        lineCap:"round",
        lineJoin:"round"
      }
    ).addTo(map);


  line.bindTooltip(
    `Route ${selectedRoute}`,
    {
      sticky:true,
      className:"route-line-label"
    }
  );


  routeLayers.push(line);


  data.points.forEach((point,index) => {

    const stop =
      L.circleMarker(
        point,
        {
          radius:
            index === 0 ||
            index === data.points.length - 1
              ? 7
              : 4,

          color:data.color,

          weight:2,

          fillColor:"#07131c",

          fillOpacity:1
        }
      ).addTo(map);


    routeLayers.push(stop);

  });

}


function focusSelectedRoute() {

  if (!map) return;

  const data =
    routeData[selectedRoute];

  const bounds =
    L.latLngBounds(data.points);


  map.fitBounds(
    bounds,
    {
      padding:[55,55],
      maxZoom:14,
      animate:true,
      duration:1.1
    }
  );

}


/* ================= HEAT RISK ================= */

function addHeatRiskZones() {

  if (!map) return;


  heatLayers.forEach(layer => {
    map.removeLayer(layer);
  });

  heatLayers = [];


  const zones = [

    {
      name:"Central Hyderabad",
      lat:17.385,
      lng:78.477,
      radius:1700,
      color:"#f5ca58",
      opacity:.13
    },

    {
      name:"Mehdipatnam Corridor",
      lat:17.395,
      lng:78.445,
      radius:1900,
      color:"#ff8b62",
      opacity:.15
    },

    {
      name:"Secunderabad Link",
      lat:17.438,
      lng:78.505,
      radius:1750,
      color:"#ff6575",
      opacity:.14
    }

  ];


  zones.forEach(zone => {

    const circle =
      L.circle(
        [zone.lat,zone.lng],
        {
          radius:zone.radius,
          color:zone.color,
          weight:2,
          fillColor:zone.color,
          fillOpacity:zone.opacity
        }
      ).addTo(map);


    circle.bindTooltip(
      `${zone.name} • heat exposure zone`,
      { sticky:true }
    );


    heatLayers.push(circle);

  });

}


/* ================= MAP SEARCH ================= */

function setupMapSearch() {

  const input =
    document.getElementById(
      "mapSearchInput"
    );

  const go =
    document.getElementById(
      "mapSearchGo"
    );

  const results =
    document.getElementById(
      "mapSearchResults"
    );


  if (!input) return;


  function search() {

    const query =
      input.value
        .trim()
        .toLowerCase();


    if (!query) {

      results.classList.remove(
        "open"
      );

      return;
    }


    const matches =
      searchPlaces
        .filter(place =>
          place[0]
            .toLowerCase()
            .includes(query)
        )
        .slice(0,5);


    if (matches.length) {

      results.innerHTML =
        matches
          .map(place => `
            <button
              type="button"
              data-name="${place[0]}"
            >
              ${place[0]}
            </button>
          `)
          .join("");

    } else {

      results.innerHTML = `
        <button
          type="button"
          data-name="Hyderabad"
        >
          Search Hyderabad city
        </button>
      `;

    }


    results.classList.add("open");


    results
      .querySelectorAll("button")
      .forEach(button => {

        button.onclick = () => {
          goToPlace(
            button.dataset.name
          );
        };

      });

  }


  go?.addEventListener(
    "click",
    search
  );


  input.addEventListener(
    "input",
    search
  );


  input.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        search();
      }

    }
  );


  document
    .getElementById("mapSearchToggle")
    ?.addEventListener(
      "click",
      () => {

        input.focus();

        results.classList.toggle(
          "open"
        );

      }
    );

}


function goToPlace(name) {

  if (!map) return;


  const place =
    searchPlaces.find(
      item =>
        item[0].toLowerCase() ===
        name.toLowerCase()
    );


  if (searchMarker) {

    map.removeLayer(
      searchMarker
    );

    searchMarker = null;

  }


  if (place) {

    searchMarker =
      L.marker(
        [
          place[1],
          place[2]
        ]
      )
      .addTo(map)
      .bindPopup(
        `<b>${place[0]}</b><br>Hyderabad demo location`
      )
      .openPopup();


    map.flyTo(
      [
        place[1],
        place[2]
      ],
      15,
      {
        duration:1.1
      }
    );

  } else {

    map.flyTo(
      [17.385,78.4867],
      12.6,
      {
        duration:1.1
      }
    );

  }


  closeSearchResults();

}


function closeSearchResults() {

  document
    .getElementById(
      "mapSearchResults"
    )
    ?.classList.remove("open");

}


/* ================= CHATBOT ================= */

function addChatMessage(
  text,
  type
) {

  const box =
    document.getElementById(
      "chatMessages"
    );

  if (!box) return;


  const message =
    document.createElement("div");


  message.className =
    `chat-message ${type}`;


  message.innerHTML = `
    <b>${type === "user" ? "YOU" : "HAZE AI"}</b>
    <span></span>
  `;


  message
    .querySelector("span")
    .textContent = text;


  box.appendChild(message);

  box.scrollTop =
    box.scrollHeight;

}


function toggleChat() {

  document
    .getElementById("chatPanel")
    ?.classList.toggle("open");

}


function handleChatKey(event) {

  if (event.key === "Enter") {
    sendChatMessage();
  }

}


function quickAsk(text) {

  const input =
    document.getElementById(
      "chatInput"
    );

  if (input) {
    input.value = text;
  }

  sendChatMessage();

}


function sendChatMessage() {

  const input =
    document.getElementById(
      "chatInput"
    );

  if (!input) return;


  const text =
    input.value.trim();


  if (!text) return;


  addChatMessage(
    text,
    "user"
  );


  input.value = "";


  setTimeout(() => {

    const query =
      text.toLowerCase();


    let answer =
      "Demo mode: I can help with Hyderabad transit, routes, congestion and heat-risk information.";


    if (
      query.includes("busy") ||
      query.includes("congestion")
    ) {

      answer =
        "Routes 218 and 10H are currently flagged for attention in the demo network. Route 218 has the strongest congestion signal.";

    }

    else if (
      query.includes("heat")
    ) {

      answer =
        "Hyderabad demo heat risk is HIGH: 39°C, feels like 44°C, with 12 affected stops and 4 high-exposure routes.";

    }

    else if (
      query.includes("route") ||
      query.includes("bus")
    ) {

      answer =
        "Try routes 25A, 218, 10H or 5K. Tap a route card to highlight its corridor directly on the Hyderabad map.";

    }


    addChatMessage(
      answer,
      "bot"
    );

  },420);

}


/* ================= NAVIGATION ================= */

function scrollToId(id) {

  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior:"smooth"
    });

}


function setupReveal() {

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target
              .classList
              .add("visible");

            observer.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold:.12
      }
    );


  document
    .querySelectorAll(".reveal")
    .forEach(element => {
      observer.observe(element);
    });

}


/* ================= ACTIVE NAV ================= */

function setupNavigation() {

  const sections =
    [
      ...document.querySelectorAll(
        "main section[id]"
      )
    ];

  const links =
    [
      ...document.querySelectorAll(
        ".nav-link"
      )
    ];


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            links.forEach(link => {

              link.classList.toggle(
                "active",
                link.getAttribute("href") ===
                `#${entry.target.id}`
              );

            });

          }

        });

      },
      {
        rootMargin:
          "-35% 0px -55%"
      }
    );


  sections.forEach(section => {
    observer.observe(section);
  });

}


/* ================= MOBILE MENU ================= */

function setupMobileMenu() {

  const button =
    document.getElementById(
      "menuToggle"
    );

  const menu =
    document.getElementById(
      "mobileMenu"
    );


  button?.addEventListener(
    "click",
    () => {
      menu?.classList.toggle("open");
    }
  );


  menu
    ?.querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {
          menu.classList.remove(
            "open"
          );
        }
      );

    });

}


/* ================= COUNTERS ================= */

function animateCounters() {

  document
    .querySelectorAll(
      "[data-counter]"
    )
    .forEach(element => {

      const target =
        Number(
          element.dataset.counter || 0
        );

      const suffix =
        element.dataset.suffix || "";

      const duration =
        1100;

      const startTime =
        performance.now();


      function tick(now) {

        const progress =
          Math.min(
            (now - startTime) /
            duration,
            1
          );


        const eased =
          1 -
          Math.pow(
            1 - progress,
            3
          );


        const value =
          Math.round(
            target * eased
          );


        element.textContent =
          `${value}${suffix}`;


        if (progress < 1) {
          requestAnimationFrame(tick);
        }

      }


      requestAnimationFrame(tick);

    });

}


/*
  Future backend contracts only:

  GET  /api/vehicles
  GET  /api/routes
  GET  /api/congestion
  GET  /api/stats
  GET  /api/environment
  POST /api/chat

  No API keys are required by this frontend demo.
*/
/* =========================================================
   HAZE FINAL JS POLISH
   Performance + map theme + search optimization
   ========================================================= */

(function () {
  "use strict";

  /* ---------- MAP THEME ---------- */

  function updateHazeMapTheme() {
    if (!map) return;

    const isLight =
      document.body.classList.contains("light");

    const tilePane =
      map.getPane("tilePane");

    if (tilePane) {
      tilePane.style.filter = isLight
        ? "none"
        : "invert(88%) hue-rotate(180deg) brightness(.82) contrast(1.04)";
    }

    map.getContainer()
      .classList.toggle(
        "haze-map-dark",
        !isLight
      );
  }


  /* ---------- OVERRIDE THEME SYNC ---------- */

  const originalSyncThemeButton =
    syncThemeButton;

  window.syncThemeButton = function () {
    originalSyncThemeButton();

    requestAnimationFrame(() => {
      updateHazeMapTheme();
    });
  };


  /* ---------- MAP THEME AFTER INITIALIZATION ---------- */

  const originalInitializeMap =
    initializeMap;

  window.initializeMap = function () {
    originalInitializeMap();

    requestAnimationFrame(() => {
      updateHazeMapTheme();
    });
  };


  /* ---------- LIGHTWEIGHT VEHICLE UPDATES ---------- */

  window.updateVehicleMarkers =
    function (data) {

      if (!map || !Array.isArray(data)) {
        return;
      }

      const existing = new Map();

      vehicleMarkers.forEach(marker => {
        const id =
          marker.__hazeVehicleId;

        if (id) {
          existing.set(id, marker);
        }
      });

      data.forEach(vehicle => {

        const id =
          vehicle.vehicle_id;

        const marker =
          existing.get(id);

        if (marker) {

          marker.setLatLng([
            vehicle.latitude,
            vehicle.longitude
          ]);

          marker.__hazeVehicle = vehicle;

          marker.setTooltipContent(
            `${vehicle.vehicle_id} • Route ${vehicle.route}`
          );

        }

      });

    };


  /* ---------- DEBOUNCED MAP SEARCH ---------- */

  const originalSetupMapSearch =
    setupMapSearch;

  window.setupMapSearch = function () {

    const input =
      document.getElementById(
        "mapSearchInput"
      );

    if (!input) {
      originalSetupMapSearch();
      return;
    }

    originalSetupMapSearch();

    let timer = null;

    input.addEventListener(
      "input",
      function () {

        clearTimeout(timer);

        timer = setTimeout(() => {

          const value =
            input.value.trim();

          if (!value) return;

          /*
           * Search is intentionally local/mock.
           * No external geocoding API.
           */

        }, 180);

      },
      { passive: true }
    );

  };


  /* ---------- CLOSE SEARCH WITH ESC ---------- */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Escape") {
        return;
      }

      closeSearchResults();

      document
        .getElementById("chatPanel")
        ?.classList.remove("open");

      closeVehicleDetails();

    },
    { passive: true }
  );


  /* ---------- CHAT BOT WINK TRIGGER ---------- */

  function triggerBotWink() {

    const bot =
      document.querySelector(
        ".bot-avatar"
      );

    if (!bot) return;

    bot.classList.remove(
      "haze-wink-now"
    );

    /*
     * Force a fresh animation cycle.
     */
    void bot.offsetWidth;

    bot.classList.add(
      "haze-wink-now"
    );

  }


  /*
   * Give the bot a subtle wink whenever
   * it sends a response.
   */
  const originalSendChatMessage =
    sendChatMessage;

  window.sendChatMessage =
    function () {

      originalSendChatMessage();

      setTimeout(
        triggerBotWink,
        430
      );

    };


  /* ---------- PERFORMANCE-SAFE COUNTERS ---------- */

  const originalAnimateCounters =
    animateCounters;

  window.animateCounters =
    function () {

      if (
        window.matchMedia &&
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
      ) {

        document
          .querySelectorAll(
            "[data-counter]"
          )
          .forEach(element => {

            const target =
              element.dataset.counter || 0;

            const suffix =
              element.dataset.suffix || "";

            element.textContent =
              `${target}${suffix}`;

          });

        return;
      }

      originalAnimateCounters();

    };


  /* ---------- MAP RESIZE SAFETY ---------- */

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(resizeTimer);

      resizeTimer =
        setTimeout(() => {

          if (map) {
            map.invalidateSize({
              pan: false,
              animate: false
            });
          }

        }, 180);

    },
    { passive: true }
  );


  /* ---------- INITIAL THEME SYNC ---------- */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => {
        setTimeout(
          updateHazeMapTheme,
          80
        );
      },
      { once: true }
    );

  } else {

    setTimeout(
      updateHazeMapTheme,
      80
    );

  }

})();
/* =========================================================
   HAZE — LEFT NAV DRAWER
   Lightweight pointer/swipe interaction
   ========================================================= */

(function setupHazeNavDrawer() {

  const trigger =
    document.getElementById("navDrawerTrigger");

  const backdrop =
    document.getElementById("navDrawerBackdrop");

  const drawer =
    document.querySelector(".desktop-nav");

  if (!trigger || !drawer) return;

  let startX = 0;
  let startY = 0;
  let dragging = false;

  function openDrawer() {

    document.body.classList.add(
      "nav-drawer-open"
    );

    trigger.setAttribute(
      "aria-expanded",
      "true"
    );

  }

  function closeDrawer() {

    document.body.classList.remove(
      "nav-drawer-open"
    );

    trigger.setAttribute(
      "aria-expanded",
      "false"
    );

  }

  function toggleDrawer() {

    document.body.classList.contains(
      "nav-drawer-open"
    )
      ? closeDrawer()
      : openDrawer();

  }

  trigger.addEventListener(
    "click",
    toggleDrawer
  );

  backdrop?.addEventListener(
    "click",
    closeDrawer
  );

  drawer
    .querySelectorAll(".nav-link")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          closeDrawer();

        },
        { passive: true }
      );

    });

  /* ESC */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        document.body.classList.contains(
          "nav-drawer-open"
        )
      ) {

        closeDrawer();

      }

    },
    { passive: true }
  );

  /* TOUCH SWIPE */

  document.addEventListener(
    "touchstart",
    event => {

      const touch =
        event.touches[0];

      if (!touch) return;

      startX = touch.clientX;
      startY = touch.clientY;

      dragging = true;

    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    event => {

      if (!dragging) return;

      dragging = false;

      const touch =
        event.changedTouches[0];

      if (!touch) return;

      const deltaX =
        touch.clientX - startX;

      const deltaY =
        touch.clientY - startY;

      /*
       * Ignore vertical scrolling.
       */
      if (
        Math.abs(deltaY) >
        Math.abs(deltaX)
      ) {
        return;
      }

      /*
       * Swipe right from left edge.
       */
      if (
        startX < 35 &&
        deltaX > 65
      ) {

        openDrawer();

      }

      /*
       * Swipe left while drawer is open.
       */
      else if (
        document.body.classList.contains(
          "nav-drawer-open"
        ) &&
        deltaX < -65
      ) {

        closeDrawer();

      }

    },
    { passive: true }
  );

})();
