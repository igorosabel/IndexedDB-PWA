// Abrir o crear la base de datos en IndexedDB
let db;
const request = indexedDB.open("PWA_DB", 1);

request.onerror = (event) => {
  console.error("Error al abrir IndexedDB", event);
};

request.onsuccess = (event) => {
  db = event.target.result;
  loadData();
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const objectStore = db.createObjectStore("items", { keyPath: "key" });
  objectStore.createIndex("value", "value", { unique: false });
};

// Función para cargar datos y mostrarlos en la tabla
function loadData() {
  const transaction = db.transaction(["items"], "readonly");
  const objectStore = transaction.objectStore("items");
  const table = document.getElementById("data-table");
  table.innerHTML = ""; // Limpiar la tabla

  objectStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cursor.value.key}</td>
        <td>${cursor.value.value}</td>
        <td><button onclick="deleteItem('${cursor.value.key}')">Borrar</button></td>
      `;
      table.appendChild(row);
      cursor.continue();
    }
  };
}

// Función para añadir un nuevo item a la base de datos
document.getElementById("data-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const key = document.getElementById("key").value;
  const value = document.getElementById("value").value;

  const transaction = db.transaction(["items"], "readwrite");
  const objectStore = transaction.objectStore("items");
  objectStore.put({ key, value });

  transaction.oncomplete = () => {
    document.getElementById("data-form").reset();
    loadData();
  };
});

// Función para eliminar un item de la base de datos
function deleteItem(key) {
  const transaction = db.transaction(["items"], "readwrite");
  const objectStore = transaction.objectStore("items");
  objectStore.delete(key);

  transaction.oncomplete = () => {
    loadData();
  };
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("Service Worker registrado correctamente"))
    .catch((error) => console.error("Error al registrar Service Worker:", error));
}
