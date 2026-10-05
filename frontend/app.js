/* =========================================================
   HAZE
   Hyderabad Advanced Zone & Express Transit
   Frontend-only demo
========================================================= */


/* =========================================================
   MOCK DATA
========================================================= */

const demoStats = {
    activeVehicles: 142,
    activeRoutes: 24,
    onTimeRate: 87,
    congestedRoutes: 4
};


const demoVehicles = [

    {
        vehicle_id: "BUS-101",
        route: "25A",
        latitude: 17.385,
        longitude: 78.4867,
        speed: 24,
        delay: 2,
        status: "normal"
    },

    {
        vehicle_id: "BUS-216",
        route: "25A",
        latitude: 17.391,
        longitude: 78.480,
        speed: 18,
        delay: 5,
        status: "delayed"
    },

    {
        vehicle_id: "BUS-305",
        route: "218",
        latitude: 17.378,
        longitude: 78.492,
        speed: 9,
        delay: 11,
        status: "congested"
    },

    {
        vehicle_id: "BUS-412",
        route: "10H",
        latitude: 17.397,
        longitude: 78.475,
        speed: 15,
        delay: 6,
        status: "delayed"
    },

    {
        vehicle_id: "BUS-527",
        route: "5K",
        latitude: 17.369,
        longitude: 78.501,
        speed: 28,
        delay: 1,
        status: "normal"
    },

    {
        vehicle_id: "BUS-633",
        route: "218",
        latitude: 17.402,
        longitude: 78.488,
        speed: 7,
        delay: 14,
        status: "congested"
    }

];


const heatRiskData = {

    temperature: 39,

    feelsLike: 44,

    risk: "HIGH",

    affectedStops: 12,

    highExposureRoutes: 4,

    riskIndex: 82

};


/* =========================================================
   HYDERABAD BOUNDARY
========================================================= */

const HYDERABAD_BOUNDS = [
    [17.20, 78.25],
    [17.55, 78.70]
];


/* =========================================================
   DEMO SEARCH LOCATIONS
   No external geocoding API.
   Backend can replace this later.
========================================================= */

const hyderabadLocations = [

    {
        names: [
            "charminar",
            "charminar hyderabad"
        ],
        label: "Charminar",
        lat: 17.3616,
        lng: 78.4747
    },

    {
        names: [
            "secunderabad",
            "secunderabad station",
            "secunderabad railway station"
        ],
        label: "Secunderabad",
        lat: 17.4399,
        lng: 78.4983
    },

    {
        names: [
            "hitech city",
            "hitechcity",
            "hit ecity"
        ],
        label: "HITEC City",
        lat: 17.4435,
        lng: 78.3772
    },

    {
        names: [
            "gachibowli"
        ],
        label: "Gachibowli",
        lat: 17.4401,
        lng: 78.3489
    },

    {
        names: [
            "kukatpally"
        ],
        label: "Kukatpally",
        lat: 17.4849,
        lng: 78.4138
    },

    {
        names: [
            "ameerpet"
        ],
        label: "Ameerpet",
        lat: 17.4375,
        lng: 78.4483
    },

    {
        names: [
            "begumpet"
        ],
        label: "Begumpet",
        lat: 17.4439,
        lng: 78.4660
    },

    {
        names: [
            "banjara hills",
            "banjarahills"
        ],
        label: "Banjara Hills",
        lat: 17.4156,
        lng: 78.4347
    },

    {
        names: [
            "jubilee hills",
            "jubileehills"
        ],
        label: "Jubilee Hills",
        lat: 17.4326,
        lng: 78.4071
    },

    {
        names: [
            "mehdipatnam"
        ],
        label: "Mehdipatnam",
        lat: 17.3960,
        lng: 78.4404
    },

    {
        names: [
            "koti"
        ],
        label: "Koti",
        lat: 17.3850,
        lng: 78.4867
    },

    {
        names: [
            "hussain sagar",
            "hussainsagar"
        ],
        label: "Hussain Sagar",
        lat: 17.4239,
        lng: 78.4738
    }

];


/* =========================================================
   MAP STATE
========================================================= */

let map = null;

let vehicleMarkers = [];

let heatLayers = [];

let lightTileLayer = null;

let darkTileLayer = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeTheme();

    initializeMap();

    updateStatistics(demoStats);

    addVehicleMarkers(demoVehicles);

    addHeatRiskLayer();

    setupScrollReveal();

    setupNavigation();

    startBotWink();

    animateCounters();

});


/* =========================================================
   THEME
========================================================= */

function initializeTheme() {

    const savedTheme =
        localStorage.getItem("haze-theme");

    if (savedTheme === "light") {

        document.body.classList.add("light-mode");

    }

    updateThemeIcon();

}


function toggleTheme() {

    document.body.classList.toggle("light-mode");

    const isLight =
        document.body.classList.contains("light-mode");

    localStorage.setItem(
        "haze-theme",
        isLight ? "light" : "dark"
    );

    updateThemeIcon();

    updateMapTheme();

}


function updateThemeIcon() {

    const button =
        document.getElementById("themeToggle");

    if (!button) return;

    const icon =
        button.querySelector(".theme-thumb");

    if (!icon) return;

    const isLight =
        document.body.classList.contains("light-mode");

    icon.textContent =
        isLight ? "☀" : "☾";

}


/* =========================================================
   MAP
========================================================= */

function initializeMap() {

    const mapElement =
        document.getElementById("map");

    if (!mapElement) return;

    if (typeof L === "undefined") {

        console.error("Leaflet failed to load.");

        return;

    }


    map = L.map("map", {

        minZoom: 11,
        maxZoom: 17,

        maxBounds: HYDERABAD_BOUNDS,

        maxBoundsViscosity: 1.0

    });


    map.setView(
        [17.3850, 78.4867],
        12
    );


    lightTileLayer = L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }

    );


    darkTileLayer = L.tileLayer(

        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",

        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap &copy; CARTO"
        }

    );


    updateMapTheme();

}


function updateMapTheme() {

    if (!map) return;

    const isLight =
        document.body.classList.contains("light-mode");


    if (isLight) {

        if (darkTileLayer &&
            map.hasLayer(darkTileLayer)) {

            map.removeLayer(darkTileLayer);

        }

        if (lightTileLayer &&
            !map.hasLayer(lightTileLayer)) {

            lightTileLayer.addTo(map);

        }

    } else {

        if (lightTileLayer &&
            map.hasLayer(lightTileLayer)) {

            map.removeLayer(lightTileLayer);

        }

        if (darkTileLayer &&
            !map.hasLayer(darkTileLayer)) {

            darkTileLayer.addTo(map);

        }

    }

}


/* =========================================================
   VEHICLES
========================================================= */

function createVehicleMarker(vehicle) {

    if (!map) return null;


    let markerClass =
        "vehicle-normal";


    if (vehicle.status === "delayed") {

        markerClass =
            "vehicle-delayed";

    }


    if (vehicle.status === "congested") {

        markerClass =
            "vehicle-congested";

    }


    const icon =
        L.divIcon({

            className: "",

            html:
                `<div class="vehicle-marker ${markerClass}">🚌</div>`,

            iconSize: [29, 29],

            iconAnchor: [14, 14]

        });


    const marker =
        L.marker(
            [
                vehicle.latitude,
                vehicle.longitude
            ],
            { icon }
        );


    marker.addTo(map);


    marker.on(
        "click",
        function () {

            showVehicleDetails(vehicle);

        }
    );


    return marker;

}


function addVehicleMarkers(data) {

    if (!map) return;


    vehicleMarkers.forEach(
        function (marker) {

            map.removeLayer(marker);

        }
    );


    vehicleMarkers = [];


    data.forEach(
        function (vehicle) {

            const marker =
                createVehicleMarker(vehicle);

            if (marker) {

                vehicleMarkers.push(marker);

            }

        }
    );

}


function updateVehicleMarkers(data) {

    if (!Array.isArray(data)) return;

    addVehicleMarkers(data);

}


/* =========================================================
   VEHICLE DETAILS
========================================================= */

function showVehicleDetails(vehicle) {

    const panel =
        document.getElementById("vehiclePanel");

    if (!panel) return;


    document.getElementById(
        "vehiclePanelId"
    ).textContent =
        vehicle.vehicle_id;


    document.getElementById(
        "vehiclePanelRoute"
    ).textContent =
        vehicle.route;


    document.getElementById(
        "vehiclePanelSpeed"
    ).textContent =
        vehicle.speed + " km/h";


    document.getElementById(
        "vehiclePanelDelay"
    ).textContent =
        "+" + vehicle.delay + " min";


    document.getElementById(
        "vehiclePanelStatus"
    ).textContent =
        vehicle.status.toUpperCase();


    panel.classList.add("open");

    panel.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeVehicleDetails() {

    const panel =
        document.getElementById("vehiclePanel");

    if (!panel) return;

    panel.classList.remove("open");

    panel.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics(data) {

    setCounter(
        "activeVehicles",
        data.activeVehicles
    );

    setCounter(
        "activeRoutes",
        data.activeRoutes
    );

    setCounter(
        "onTimeRate",
        data.onTimeRate,
        "%"
    );

    setCounter(
        "congestedCount",
        data.congestedRoutes
    );

}


function setCounter(
    id,
    value,
    suffix = ""
) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.dataset.count = value;

    element.dataset.suffix = suffix;

    element.textContent =
        "0" + suffix;

}


/* =========================================================
   COUNTER ANIMATION
========================================================= */

function animateCounters() {

    const counters =
        document.querySelectorAll(
            ".count-number, .stat-number"
        );


    counters.forEach(
        function (counter) {

            if (counter.dataset.animated === "true") {
                return;
            }


            const target =
                Number(counter.dataset.count || 0);

            const suffix =
                counter.dataset.suffix || "";


            let current = 0;

            const duration = 1300;

            const start =
                performance.now();


            function update(time) {

                const progress =
                    Math.min(
                        (time - start) / duration,
                        1
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                current =
                    Math.round(
                        target * eased
                    );


                counter.textContent =
                    current + suffix;


                if (progress < 1) {

                    requestAnimationFrame(update);

                } else {

                    counter.textContent =
                        target + suffix;

                    counter.dataset.animated =
                        "true";

                }

            }


            requestAnimationFrame(update);

        }
    );

}


/* =========================================================
   ENVIRONMENT / HEAT RISK
========================================================= */

function updateCongestion(data) {

    if (!data) return;

    if (typeof data.congestedRoutes === "number") {

        const element =
            document.getElementById(
                "congestedCount"
            );

        if (element) {

            element.dataset.count =
                data.congestedRoutes;

        }

    }

}


function addHeatRiskLayer() {

    if (!map || typeof L === "undefined") {
        return;
    }


    /*
       Mock environmental exposure zones.

       These are deliberately approximate demo areas.
       Backend weather/sensor data can replace them later.
    */


    const zones = [

        {
            name: "Central Hyderabad",
            center: [17.385, 78.4867],
            radius: 850,
            level: "high"
        },

        {
            name: "Secunderabad",
            center: [17.4399, 78.4983],
            radius: 700,
            level: "moderate"
        },

        {
            name: "HITEC City",
            center: [17.4435, 78.3772],
            radius: 900,
            level: "extreme"
        },

        {
            name: "Mehdipatnam",
            center: [17.396, 78.4404],
            radius: 650,
            level: "high"
        }

    ];


    zones.forEach(
        function (zone) {

            let fillColor =
                "#ffc857";

            let strokeColor =
                "#ffc857";


            if (zone.level === "high") {

                fillColor =
                    "#ff8b3d";

                strokeColor =
                    "#ff8b3d";

            }


            if (zone.level === "extreme") {

                fillColor =
                    "#ff637d";

                strokeColor =
                    "#ff637d";

            }


            const circle =
                L.circle(
                    zone.center,
                    {
                        radius: zone.radius,

                        color: strokeColor,

                        weight: 1,

                        opacity: .45,

                        fillColor: fillColor,

                        fillOpacity: .10

                    }
                );


            circle.bindTooltip(
                `<strong>${zone.name}</strong><br>
                 Heat risk: ${zone.level.toUpperCase()}`
            );


            circle.addTo(map);

            heatLayers.push(circle);

        }
    );

}


/* =========================================================
   MAP SEARCH
   Local mock search only — no API key / paid API.
========================================================= */

function toggleMapSearch() {

    const panel =
        document.getElementById(
            "mapSearchPanel"
        );

    if (!panel) return;


    panel.classList.toggle("open");


    if (panel.classList.contains("open")) {

        setTimeout(
            function () {

                const input =
                    document.getElementById(
                        "mapSearchInput"
                    );

                if (input) {
                    input.focus();
                }

            },
            250
        );

    }

}


function handleMapSearchKey(event) {

    if (event.key === "Enter") {

        searchMapLocation();

    }

}


function searchMapLocation() {

    const input =
        document.getElementById(
            "mapSearchInput"
        );


    const status =
        document.getElementById(
            "mapSearchStatus"
        );


    if (!input || !status || !map) {
        return;
    }


    const query =
        input.value
            .trim()
            .toLowerCase();


    if (!query) {

        status.textContent =
            "Enter a Hyderabad place or address.";

        status.className =
            "error";

        return;

    }


    const result =
        hyderabadLocations.find(
            function (location) {

                return location.names.some(
                    function (name) {

                        return query.includes(name) ||
                               name.includes(query);

                    }
                );

            }
        );


    if (!result) {

        status.textContent =
            "Demo search: try Charminar, Gachibowli, HITEC City, Kukatpally, Koti, Ameerpet or Secunderabad.";

        status.className =
            "error";

        return;

    }


    status.textContent =
        "Located: " + result.label;

    status.className =
        "success";


    map.flyTo(
        [
            result.lat,
            result.lng
        ],
        15,
        {
            duration: 1.4
        }
    );


    L.circleMarker(
        [
            result.lat,
            result.lng
        ],
        {
            radius: 9,

            color: "#45e6ff",

            fillColor: "#45e6ff",

            fillOpacity: .25,

            weight: 2
        }
    )
    .addTo(map)
    .bindTooltip(
        result.label
    )
    .openTooltip();


}


function resetMapView() {

    if (!map) return;


    map.flyTo(
        [17.3850, 78.4867],
        12,
        {
            duration:1.2
        }
    );

}


/* =========================================================
   ROUTE PLANNER
========================================================= */

function plannerSearch() {

    const from =
        document.getElementById(
            "fromLocation"
        );

    const to =
        document.getElementById(
            "toLocation"
        );

    const result =
        document.getElementById(
            "plannerResult"
        );


    if (!from || !to || !result) {
        return;
    }


    if (!to.value.trim()) {

        result.textContent =
            "Enter a Hyderabad destination to continue.";

        return;

    }


    result.textContent =
        "Demo route ready — connecting to live routing will be handled by the backend.";

    document
        .getElementById("transit")
        ?.scrollIntoView({
            behavior:"smooth"
        });

}


/* =========================================================
   SCROLL ANIMATIONS
========================================================= */

function setupScrollReveal() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (!("IntersectionObserver" in window)) {

        elements.forEach(
            function (element) {

                element.classList.add(
                    "visible"
                );

            }
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                        }

                    }
                );

            },
            {
                threshold:.12
            }
        );


    elements.forEach(
        function (element) {

            observer.observe(element);

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );

    const links =
        document.querySelectorAll(
            ".nav-links a"
        );


    if (!sections.length) {
        return;
    }


    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        links.forEach(
                            function (link) {

                                link.classList.remove(
                                    "active"
                                );


                                if (
                                    link.getAttribute("href") ===
                                    "#" + entry.target.id
                                ) {

                                    link.classList.add(
                                        "active"
                                    );

                                }

                            }
                        );

                    }
                );

            },
            {
                rootMargin:
                    "-35% 0px -55% 0px"
            }
        );


    sections.forEach(
        function (section) {

            observer.observe(section);

        }
    );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    closeMobileMenu();

                }
            );

        }
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function toggleMobileMenu() {

    const nav =
        document.getElementById(
            "navLinks"
        );


    if (!nav) return;

    nav.classList.toggle("open");

}


function closeMobileMenu() {

    const nav =
        document.getElementById(
            "navLinks"
        );


    if (!nav) return;

    nav.classList.remove("open");

}


/* =========================================================
   CHATBOT
========================================================= */

function toggleChat() {

    const chat =
        document.getElementById(
            "chatWindow"
        );


    if (!chat) return;


    chat.classList.toggle("open");


    const isOpen =
        chat.classList.contains("open");


    chat.setAttribute(
        "aria-hidden",
        String(!isOpen)
    );

}


function openChat() {

    const chat =
        document.getElementById(
            "chatWindow"
        );


    if (!chat) return;


    if (!chat.classList.contains("open")) {

        chat.classList.add("open");

    }


    chat.setAttribute(
        "aria-hidden",
        "false"
    );


    const input =
        document.getElementById(
            "chatInput"
        );


    if (input) {

        setTimeout(
            function () {

                input.focus();

            },
            250
        );

    }

}


function handleChatKey(event) {

    if (event.key === "Enter") {

        sendChatMessage();

    }

}


function quickChat(message) {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) return;


    input.value = message;

    sendChatMessage();

}


function sendChatMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) return;


    const message =
        input.value.trim();


    if (!message) return;


    addChatMessage(
        message,
        "user"
    );


    input.value = "";


    setTimeout(
        function () {

            const lower =
                message.toLowerCase();


            let response =
                "Demo mode: HAZE is ready to help with Hyderabad mobility.";


            if (
                lower.includes("route") ||
                lower.includes("bus")
            ) {

                response =
                    "HAZE currently shows 142 demo vehicles across 24 active routes.";

            }


            if (
                lower.includes("traffic") ||
                lower.includes("congestion")
            ) {

                response =
                    "Current demo data shows 4 congested routes.";

            }


            if (
                lower.includes("heat") ||
                lower.includes("temperature") ||
                lower.includes("hot")
            ) {

                response =
                    "Current mock environmental data shows 39°C, feels like 44°C, with HIGH heat risk.";

            }


            if (
                lower.includes("stop")
            ) {

                response =
                    "The current mock heat model identifies 12 potentially affected transit stops.";

            }


            addChatMessage(
                response,
                "bot"
            );

        },
        450
    );


    /*
        FUTURE BACKEND CONNECTION

        GET  /api/vehicles
        GET  /api/routes
        GET  /api/congestion
        GET  /api/stats
        GET  /api/environment
        POST /api/chat

        Never place private API keys here.
    */

}


function addChatMessage(
    text,
    type = "bot"
) {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!messages) return;


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "chat-message " + type;


    if (type === "bot") {

        message.innerHTML =
            `<span>H</span>
             <p>${escapeHTML(text)}</p>`;

    } else {

        message.innerHTML =
            `<p>${escapeHTML(text)}</p>`;

    }


    messages.appendChild(message);


    messages.scrollTop =
        messages.scrollHeight;

}


function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   BOT WINK
========================================================= */

function startBotWink() {

    const bot =
        document.getElementById(
            "chatFab"
        );


    if (!bot) return;


    function wink() {

        bot.classList.add(
            "winking"
        );


        setTimeout(
            function () {

                bot.classList.remove(
                    "winking"
                );

            },
            180
        );

    }


    setInterval(
        wink,
        4800
    );

}


/* =========================================================
   SCROLL TO TRANSIT
========================================================= */

function scrollToTransit() {

    const section =
        document.getElementById(
            "transit"
        );


    if (!section) return;


    section.scrollIntoView({
        behavior:"smooth"
    });

        }
