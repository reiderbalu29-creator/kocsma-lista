const STORAGE_KEY = "kocsma-lista-v1";

const samplePlaces = [
  {
    id: crypto.randomUUID(),
    name: "Minta Söröző",
    address: "Budapest",
    lat: 47.4979,
    lng: 19.0402,
    beerPrice: 850,
    rating: 4.4,
    menu: "Csapolt sör 850 Ft\nRövid 1000 Ft",
    notes: "Ez csak egy mintahely, törölhető.",
    image: ""
  },
  {
    id: crypto.randomUUID(),
    name: "Öreg Kocsma",
    address: "Budapest",
    lat: 47.503,
    lng: 19.045,
    beerPrice: 650,
    rating: 4.1,
    menu: "Világos sör 650 Ft\nPizza 2400 Ft",
    notes: "Terasz.",
    image: ""
  }
];

let places = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || samplePlaces;
let userLocation = null;
let editingId = null;
let markers = new Map();

const map = L.map("map").setView([47.4979, 19.0402], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");
const dialog = document.getElementById("placeDialog");
const form = document.getElementById("placeForm");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

function distanceKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const p1 = aLat * Math.PI / 180;
  const p2 = bLat * Math.PI / 180;
  const dp = (bLat - aLat) * Math.PI / 180;
  const dl = (bLng - aLng) * Math.PI / 180;
  const x = Math.sin(dp/2)**2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function distanceText(p) {
  if (!userLocation) return "Távolság: –";
  const km = distanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng);
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function sortedPlaces() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const sort = document.getElementById("sort").value;

  let arr = places.filter(p =>
    `${p.name} ${p.address} ${p.notes}`.toLowerCase().includes(q)
  );

  arr.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "hu");
    if (sort === "beerAsc") return (a.beerPrice ?? Infinity) - (b.beerPrice ?? Infinity);
    if (sort === "beerDesc") return (b.beerPrice ?? -Infinity) - (a.beerPrice ?? -Infinity);
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (userLocation) {
      return distanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
             distanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
    }
    return a.name.localeCompare(b.name, "hu");
  });
  return arr;
}

function render() {
  markers.forEach(m => map.removeLayer(m));
  markers.clear();

  const arr = sortedPlaces();
  listEl.innerHTML = "";

  statusEl.textContent = `${arr.length} hely található`;

  if (!arr.length) {
    listEl.innerHTML = '<div class="empty">Nincs találat.</div>';
    return;
  }

  arr.forEach(p => {
    const marker = L.marker([p.lat, p.lng]).addTo(map);
    marker.bindPopup(`<strong>${escapeHtml(p.name)}</strong><br>${escapeHtml(p.address || "")}`);
    marker.on("click", () => highlightCard(p.id));
    markers.set(p.id, marker);

    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = p.id;
    card.innerHTML = `
      <div>
        ${p.image ? `<img src="${escapeAttr(p.image)}" alt="">` :
          `<div style="width:95px;height:95px;border-radius:10px;background:#e4e4e7;display:grid;place-items:center;font-size:2rem">🍺</div>`}
      </div>
      <div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="meta">📍 ${escapeHtml(p.address || "Nincs cím")}</div>
        <div class="meta">📏 ${distanceText(p)}</div>
        <div class="meta">🍺 ${p.beerPrice ? `${p.beerPrice} Ft` : "Nincs ár"} &nbsp; ⭐ ${p.rating ?? "–"}</div>
        <div class="tags">
          ${p.notes ? `<span class="pill">${escapeHtml(p.notes.slice(0, 35))}</span>` : ""}
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      map.setView([p.lat, p.lng], Math.max(map.getZoom(), 16));
      markers.get(p.id)?.openPopup();
      openEdit(p);
    });
    listEl.appendChild(card);
  });
}

function highlightCard(id) {
  document.querySelector(`[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:"smooth", block:"center"});
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

function openNew() {
  editingId = null;
  document.getElementById("dialogTitle").textContent = "Új kocsma";
  document.getElementById("deleteBtn").classList.add("hidden");
  form.reset();

  if (userLocation) {
    document.getElementById("lat").value = userLocation.lat.toFixed(6);
    document.getElementById("lng").value = userLocation.lng.toFixed(6);
  } else {
    const c = map.getCenter();
    document.getElementById("lat").value = c.lat.toFixed(6);
    document.getElementById("lng").value = c.lng.toFixed(6);
  }
  dialog.showModal();
}

function openEdit(p) {
  editingId = p.id;
  document.getElementById("dialogTitle").textContent = "Kocsma szerkesztése";
  document.getElementById("deleteBtn").classList.remove("hidden");
  document.getElementById("placeId").value = p.id;
  document.getElementById("name").value = p.name || "";
  document.getElementById("address").value = p.address || "";
  document.getElementById("lat").value = p.lat;
  document.getElementById("lng").value = p.lng;
  document.getElementById("beerPrice").value = p.beerPrice ?? "";
  document.getElementById("rating").value = p.rating ?? "";
  document.getElementById("menu").value = p.menu || "";
  document.getElementById("notes").value = p.notes || "";
  document.getElementById("image").value = p.image || "";
  dialog.showModal();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    id: editingId || crypto.randomUUID(),
    name: document.getElementById("name").value.trim(),
    address: document.getElementById("address").value.trim(),
    lat: Number(document.getElementById("lat").value),
    lng: Number(document.getElementById("lng").value),
    beerPrice: Number(document.getElementById("beerPrice").value) || null,
    rating: Number(document.getElementById("rating").value) || null,
    menu: document.getElementById("menu").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    image: document.getElementById("image").value.trim()
  };

  if (editingId) {
    places = places.map(p => p.id === editingId ? data : p);
  } else {
    places.push(data);
  }

  save();
  dialog.close();
  render();
  map.setView([data.lat, data.lng], 16);
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  if (!editingId) return;
  if (confirm("Biztosan törlöd ezt a kocsmát?")) {
    places = places.filter(p => p.id !== editingId);
    save();
    dialog.close();
    render();
  }
});

document.getElementById("addBtn").addEventListener("click", openNew);
document.getElementById("cancelBtn").addEventListener("click", () => dialog.close());
document.getElementById("closeDialog").addEventListener("click", () => dialog.close());
document.getElementById("search").addEventListener("input", render);
document.getElementById("sort").addEventListener("change", render);

document.getElementById("locationBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("A böngésző nem támogatja a helymeghatározást.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      L.circleMarker([userLocation.lat, userLocation.lng], {radius: 8})
        .addTo(map)
        .bindPopup("Te itt vagy").openPopup();
      map.setView([userLocation.lat, userLocation.lng], 15);
      render();
    },
    () => alert("Nem sikerült lekérni a helyzetedet. Engedélyezd a helymeghatározást.")
  );
});

render();
