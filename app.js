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

if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock("landscape").catch((error) => {
    console.error("Error al bloquear la orientación: " + error);
  });
} else {
  console.warn("La API de bloqueo de orientación no es compatible en este navegador.");
}

function checkOrientation() {
  const warning = document.getElementById("orientation-warning");
  if (window.innerHeight > window.innerWidth) {
    // Modo vertical (portrait)
    warning.style.display = "block";
  } else {
    // Modo horizontal (landscape)
    warning.style.display = "none";
  }
}

window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    //.then(() => console.log("Service Worker registrado correctamente"))
    .then((registration) => {
      console.log("Service Worker registrado correctamente");

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // Notificar al usuario que hay una actualización disponible
            const updateNotification = document.createElement("div");
            updateNotification.classList.add('update-notification');
            updateNotification.innerHTML = `
              <p>Hay una nueva versión disponible.</p>
              <button onclick="window.location.reload()">Actualizar</button>
            `;
            document.body.appendChild(updateNotification);
          }
        });
      });
    })
    .catch((error) => console.error("Error al registrar Service Worker:", error));
}
