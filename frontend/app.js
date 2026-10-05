/* HAZE frontend logic — demo data only */
const demoStats={activeVehicles:142,activeRoutes:24,onTime:87,congestedRoutes:4};
const demoVehicles=[
{vehicle_id:"BUS-101",route:"25A",latitude:17.385,longitude:78.4867,speed:24,delay:2,status:"normal"},
{vehicle_id:"BUS-216",route:"25A",latitude:17.391,longitude:78.48,speed:18,delay:5,status:"delayed"},
{vehicle_id:"BUS-305",route:"218",latitude:17.378,longitude:78.492,speed:9,delay:11,status:"congested"},
{vehicle_id:"BUS-412",route:"10H",latitude:17.397,longitude:78.475,speed:15,delay:6,status:"delayed"},
{vehicle_id:"BUS-527",route:"5K",latitude:17.369,longitude:78.501,speed:28,delay:1,status:"normal"},
{vehicle_id:"BUS-633",route:"218",latitude:17.402,longitude:78.488,speed:7,delay:14,status:"congested"}];
const demoCongestion=[{route:"25A",status:"normal"},{route:"10H",status:"slow"},{route:"218",status:"congested"},{route:"5K",status:"normal"}];
let map=null,vehicleMarkers=[];

document.addEventListener("DOMContentLoaded",()=>{
  initializeMap();updateStatistics(demoStats);addVehicleMarkers(demoVehicles);updateCongestion(demoCongestion);
});

function initializeMap(){
  const el=document.getElementById("map");if(!el||typeof L==="undefined")return;
  map=L.map("map").setView([17.385,78.4867],13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(map);
}
function createVehicleMarker(vehicle){
  const cls=vehicle.status==="congested"?"congested-marker":vehicle.status==="delayed"?"delayed-marker":"normal-marker";
  const icon=L.divIcon({className:"",html:`<div class="vehicle-marker ${cls}">🚌</div>`,iconSize:[29,29],iconAnchor:[14,14]});
  const marker=L.marker([vehicle.latitude,vehicle.longitude],{icon}).addTo(map);
  marker.on("click",()=>showVehicleDetails(vehicle));return marker;
}
function addVehicleMarkers(vehicles){
  if(!map)return;vehicleMarkers.forEach(m=>map.removeLayer(m));vehicleMarkers=[];
  vehicles.forEach(v=>vehicleMarkers.push(createVehicleMarker(v)));
}
function updateVehicleMarkers(data){if(Array.isArray(data))addVehicleMarkers(data);}
function showVehicleDetails(vehicle){
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};
  set("detailVehicleId",vehicle.vehicle_id);set("detailRoute",vehicle.route);
  set("detailSpeed",`${vehicle.speed} km/h`);set("detailDelay",`+${vehicle.delay} min`);
  set("detailStatus",vehicle.status.toUpperCase());set("detailUpdated","Last updated: Demo data");
  document.getElementById("vehiclePanel")?.classList.add("open");
}
function closeVehicleDetails(){document.getElementById("vehiclePanel")?.classList.remove("open")}
function updateStatistics(data){
  if(!data)return;
  const ids={activeVehicles:data.activeVehicles,activeRoutes:data.activeRoutes,onTime:`${data.onTime}%`,congestedRoutes:data.congestedRoutes};
  Object.entries(ids).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.textContent=value});
  const hero={heroVehicles:`${data.activeVehicles*8}+`,heroRoutes:`${data.activeRoutes*5}+`,heroOnTime:`${data.onTime}%`};
  Object.entries(hero).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.textContent=value});
}
function updateCongestion(data){if(!Array.isArray(data))return;/* future backend data will update route status cards here */}
function scrollToTransit(){document.getElementById("transit")?.scrollIntoView({behavior:"smooth"})}
function toggleChat(){document.getElementById("chatPanel")?.classList.toggle("open")}
function handleChatKey(event){if(event.key==="Enter")sendChatMessage()}
function addChatMessage(text,type="bot"){
  const box=document.getElementById("chatMessages");if(!box)return;
  const div=document.createElement("div");div.className=`chat-message ${type}`;div.textContent=text;box.appendChild(div);box.scrollTop=box.scrollHeight;
}
function sendChatMessage(){
  const input=document.getElementById("chatInput");if(!input)return;
  const message=input.value.trim();if(!message)return;
  addChatMessage(message,"user");input.value="";
  setTimeout(()=>addChatMessage("Demo mode: I can show the HAZE interface now. A future FastAPI connection can provide live transit answers."),350);

  /*
    FUTURE BACKEND CONNECTION — no API key belongs in frontend code.
    GET  /api/vehicles
    GET  /api/routes
    GET  /api/congestion
    GET  /api/stats
    POST /api/chat
  */
}
