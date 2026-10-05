// =========================================================
// HAZE — FRONTEND JAVASCRIPT
// Hyperlocal AI-Powered Zonal Mobility Engine
// =========================================================


// =========================================================
// DEMO DATA
// =========================================================

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


let map = null;

let vehicleMarkers = [];


// =========================================================
// PAGE INITIALIZATION
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    initializeTheme();

    initializeMap();

    updateStatistics(demoStats);

    addVehicleMarkers(demoVehicles);

    setupNavigation();

});


// =========================================================
// LIGHT / DARK MODE
// =========================================================

function initializeTheme() {

    const savedTheme = localStorage.getItem("haze-theme");

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

}


function updateThemeIcon() {

    const button =
        document.getElementById("themeToggle");

    if (!button) return;

    const icon =
        button.querySelector(".theme-icon");

    if (!icon) return;

    const isLight =
        document.body.classList.contains("light-mode");

    icon.textContent =
        isLight ? "☀" : "☾";

}


// =========================================================
// LEAFLET MAP
// =========================================================

function initializeMap() {

    const mapElement =
        document.getElementById("map");

    if (!mapElement) return;

    if (typeof L === "undefined") {

        console.error(
            "Leaflet could not be loaded."
        );

        return;
    }


    map = L.map("map").setView(
        [17.3850, 78.4867],
        13
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

}


// =========================================================
// VEHICLE MARKERS
// =========================================================

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

            html: `
                <div class="vehicle-marker ${markerClass}">
                    🚌
                </div>
            `,

            iconSize: [27, 27],

            iconAnchor: [13, 13]

        });


    const marker =
        L.marker(
            [
                vehicle.latitude,
                vehicle.longitude
            ],
            {
                icon: icon
            }
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


// =========================================================
// ADD VEHICLES
// =========================================================

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


// =========================================================
// UPDATE VEHICLES
// =========================================================

function updateVehicleMarkers(data) {

    if (!Array.isArray(data)) return;

    addVehicleMarkers(data);

}


// =========================================================
// VEHICLE DETAILS
// =========================================================

function showVehicleDetails(vehicle) {

    const message =

        "Vehicle: " +
        vehicle.vehicle_id +

        "\nRoute: " +
        vehicle.route +

        "\nSpeed: " +
        vehicle.speed +
        " km/h" +

        "\nDelay: +" +
        vehicle.delay +
        " min" +

        "\nStatus: " +
        vehicle.status.toUpperCase();


    alert(message);

}


// =========================================================
// STATISTICS
// =========================================================

function updateStatistics(data) {

    const vehicles =
        document.getElementById(
            "activeVehicles"
        );

    const routes =
        document.getElementById(
            "activeRoutes"
        );

    const onTime =
        document.getElementById(
            "onTimeRate"
        );

    const congested =
        document.getElementById(
            "congestedCount"
        );


    if (vehicles) {

        vehicles.textContent =
            data.activeVehicles;

    }


    if (routes) {

        routes.textContent =
            data.activeRoutes;

    }


    if (onTime) {

        onTime.textContent =
            data.onTimeRate + "%";

    }


    if (congested) {

        congested.textContent =
            data.congestedRoutes;

    }

}


// =========================================================
// CHATBOT
// =========================================================

function toggleChat() {

    const chat =
        document.getElementById(
            "chatWindow"
        );

    if (!chat) return;

    chat.classList.toggle("open");

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

            let response =
                "Demo mode: HAZE is ready to help with routes, buses and traffic.";


            const lower =
                message.toLowerCase();


            if (
                lower.includes("route")
            ) {

                response =
                    "HAZE recommends checking the Live Transit and Routes sections for current route information.";

            }


            else if (
                lower.includes("bus")
            ) {

                response =
                    "There are 142 demo vehicles currently shown in the HAZE transit network.";

            }


            else if (
                lower.includes("traffic") ||
                lower.includes("congestion")
            ) {

                response =
                    "Current demo data shows 4 congested routes. Check Analytics for the congestion overview.";

            }


            addChatMessage(
                response,
                "bot"
            );

        },
        450
    );


    /*
    ========================================================
    FUTURE BACKEND CONNECTION

    When the backend is ready, this function can connect to:

    GET  /api/vehicles
    GET  /api/routes
    GET  /api/congestion
    GET  /api/stats
    POST /api/chat

    IMPORTANT:
    Never put OpenAI/API secret keys in frontend code.
    ========================================================
    */

}


// =========================================================
// CHAT MESSAGE
// =========================================================

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
        "chat-message " +
        type;


    if (type === "bot") {

        message.innerHTML = `
            <span>H</span>
            <p>${escapeHTML(text)}</p>
        `;

    }

    else {

        message.innerHTML = `
            <p>${escapeHTML(text)}</p>
        `;

    }


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;

}


// =========================================================
// SECURITY HELPER
// =========================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = text;

    return div.innerHTML;

}


// =========================================================
// SCROLL TO TRANSIT
// =========================================================

function scrollToTransit() {

    const section =
        document.getElementById(
            "transit"
        );


    if (!section) return;


    section.scrollIntoView({
        behavior: "smooth"
    });

}


// =========================================================
// NAVIGATION HIGHLIGHT
// =========================================================

function setupNavigation() {

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    const links =
        document.querySelectorAll(
            ".nav-links a"
        );


    if (!sections.length) return;


    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            !entry.isIntersecting
                        ) return;


                        links.forEach(
                            function (link) {

                                link.classList.remove(
                                    "active"
                                );


                                if (
                                    link.getAttribute(
                                        "href"
                                    ) ===
                                    "#" +
                                    entry.target.id
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

}
