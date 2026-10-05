/* =========================================================
   HAZE — Frontend JavaScript
   Demo data only.
   Backend/FastAPI can be connected later.
   ========================================================= */


/* =========================
   DEMO DATA
   ========================= */

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


const demoCongestion = [
    { route: "25A", status: "normal" },
    { route: "10H", status: "slow" },
    { route: "218", status: "congested" },
    { route: "5K", status: "normal" }
];


/* =========================
   GLOBAL VARIABLES
   ========================= */

let map = null;
let vehicleMarkers = [];


/* =========================
   START APPLICATION
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeMap();

    updateStatistics(demoStats);

    addVehicleMarkers(demoVehicles);

    updateCongestion(demoCongestion);

});


/* =========================
   MAP
   ========================= */

function initializeMap() {

    const hyderabad = [17.3850, 78.4867];

    map = L.map("map").setView(hyderabad, 13);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

}


/* =========================
   VEHICLE MARKERS
   ========================= */

function createVehicleMarker(vehicle) {

    let markerClass = "normal-marker";

    if (vehicle.status === "delayed") {
        markerClass = "delayed-marker";
    }

    if (vehicle.status === "congested") {
        markerClass = "congested-marker";
    }


    const icon = L.divIcon({

        className: "",

        html: `
            <div class="vehicle-marker ${markerClass}">
                🚌
            </div>
        `,

        iconSize: [29, 29],
        iconAnchor: [14, 14]

    });


    const marker = L.marker(
        [vehicle.latitude, vehicle.longitude],
        { icon: icon }
    ).addTo(map);


    marker.on("click", () => {

        showVehicleDetails(vehicle);

    });


    return marker;
}


function addVehicleMarkers(vehicles) {

    vehicleMarkers.forEach(marker => {

        map.removeLayer(marker);

    });

    vehicleMarkers = [];


    vehicles.forEach(vehicle => {

        const marker = createVehicleMarker(vehicle);

        vehicleMarkers.push(marker);

    });

}


function updateVehicleMarkers(data) {

    if (!Array.isArray(data)) {

        console.warn("Vehicle data must be an array.");

        return;

    }

    addVehicleMarkers(data);

}


/* =========================
   VEHICLE DETAILS
   ========================= */

function showVehicleDetails(vehicle) {

    /*
     * The current visual design does not have
     * a dedicated vehicle panel.
     *
     * For now, clicking a vehicle opens a clean
     * browser information card.
     *
     * This can later be replaced with a proper
     * dashboard vehicle-details component.
     */

    const status =
        vehicle.status.toUpperCase();


    alert(
        `HAZE VEHICLE\n\n` +
        `Vehicle: ${vehicle.vehicle_id}\n` +
        `Route: ${vehicle.route}\n` +
        `Speed: ${vehicle.speed} km/h\n` +
        `Delay: +${vehicle.delay} min\n` +
        `Status: ${status}`
    );

}


/* =========================
   STATISTICS
   ========================= */

function updateStatistics(data) {

    if (!data) return;


    const activeVehicles =
        document.getElementById("activeVehicles");

    const activeRoutes =
        document.getElementById("activeRoutes");

    const onTime =
        document.getElementById("onTime");

    const congestedRoutes =
        document.getElementById("congestedRoutes");


    if (activeVehicles) {
        activeVehicles.textContent =
            data.activeVehicles;
    }


    if (activeRoutes) {
        activeRoutes.textContent =
            data.activeRoutes;
    }


    if (onTime) {
        onTime.textContent =
            `${data.onTime}%`;
    }


    if (congestedRoutes) {
        congestedRoutes.textContent =
            data.congestedRoutes;
    }


    /* Hero statistics */

    const heroVehicles =
        document.getElementById("heroVehicles");

    const heroRoutes =
        document.getElementById("heroRoutes");

    const heroOnTime =
        document.getElementById("heroOnTime");


    if (heroVehicles) {
        heroVehicles.textContent =
            `${data.activeVehicles}+`;
    }


    if (heroRoutes) {
        heroRoutes.textContent =
            `${data.activeRoutes}+`;
    }


    if (heroOnTime) {
        heroOnTime.textContent =
            `${data.onTime}%`;
    }

}


/* =========================
   CONGESTION
   ========================= */

function updateCongestion(data) {

    if (!Array.isArray(data)) return;


    const routeRows =
        document.querySelectorAll(".route-row");


    routeRows.forEach(row => {

        const route =
            row.querySelector("strong");

        const status =
            row.querySelector("span");


        if (!route || !status) return;


        const routeData =
            data.find(
                item => item.route === route.textContent
            );


        if (!routeData) return;


        status.className = "";


        if (routeData.status === "normal") {

            status.classList.add("normal");

            status.textContent =
                "● NORMAL";

        }


        if (routeData.status === "slow") {

            status.classList.add("slow");

            status.textContent =
                "● SLOW";

        }


        if (routeData.status === "congested") {

            status.classList.add("congested");

            status.textContent =
                "● CONGESTED";

        }

    });

}


/* =========================
   SCROLL TO TRANSIT
   ========================= */

function scrollToTransit() {

    const section =
        document.getElementById("transit");


    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* =========================
   CHATBOT
   ========================= */

function toggleChat() {

    const panel =
        document.getElementById("chatPanel");


    if (!panel) return;


    panel.classList.toggle("active");

}


function handleChatKey(event) {

    if (event.key === "Enter") {

        sendChatMessage();

    }

}


function sendChatMessage() {

    const input =
        document.getElementById("chatInput");


    const message =
        input.value.trim();


    if (!message) return;


    addChatMessage(
        message,
        "user"
    );


    input.value = "";


    /*
     * =====================================================
     * FUTURE FASTAPI CONNECTION
     *
     * Backend team can later replace the demo response
     * with:
     *
     * fetch("/api/chat", {
     *     method: "POST",
     *     headers: {
     *         "Content-Type": "application/json"
     *     },
     *     body: JSON.stringify({
     *         message: message
     *     })
     * })
     *
     * IMPORTANT:
     * No API key belongs in this frontend.
     * =====================================================
     */


    setTimeout(() => {

        addChatMessage(
            "HAZE AI is currently running in demo mode. FastAPI intelligence will be connected here.",
            "ai"
        );

    }, 500);

}


function addChatMessage(text, sender) {

    const container =
        document.getElementById("chatMessages");


    if (!container) return;


    const messageElement =
        document.createElement("div");


    if (sender === "user") {

        messageElement.className =
            "user-message";

    } else {

        messageElement.className =
            "ai-message";

    }


    messageElement.textContent =
        text;


    container.appendChild(
        messageElement
    );


    container.scrollTop =
        container.scrollHeight;

}


/* =========================
   FUTURE BACKEND CONNECTION
   =========================

   GET  /api/vehicles
   GET  /api/routes
   GET  /api/congestion
   GET  /api/stats
   POST /api/chat

   Example:

   async function loadVehicles() {

       const response =
           await fetch("/api/vehicles");

       const data =
           await response.json();

       updateVehicleMarkers(data);
   }

   ========================= */
