const DATABASE_NAME = "spmb-student-documents";
const STORE_NAME = "documents";

function openDocumentDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Penyimpanan berkas tidak dapat dibuka."));
  });
}

export async function saveStudentDocument(key, file) {
  const database = await openDocumentDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(file, key);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("Berkas gagal disimpan."));
      transaction.onabort = () => reject(transaction.error || new Error("Penyimpanan berkas dibatalkan."));
    });
  } finally {
    database.close();
  }
}

export async function getStudentDocument(key) {
  const database = await openDocumentDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("Berkas tidak dapat dibaca."));
    });
  } finally {
    database.close();
  }
}
