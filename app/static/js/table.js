// Interaktív táblázat kezelése: bejegyzések lekérése, hozzáadása, törlése, szerkesztése, toast értesítések

document.addEventListener('DOMContentLoaded', function() {
    fetchData();
    document.getElementById('add-entry').addEventListener('click', addEntry);
});

// Toast értesítés megjelenítése
function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 3500);
}

// Bejegyzések lekérése a szerverről
function fetchData() {
    fetch('/entries')
        .then(response => response.json())
        .then(data => populateTable(data))
        .catch(error => showToast('Error fetching data', 'error'));
}

// Táblázat feltöltése adatokkal
function populateTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td><span class="name-text">${item.name}</span><input class="edit-name" type="text" value="${item.name}" style="display:none;width:90%"></td>
            <td><span class="desc-text">${item.description || ''}</span><input class="edit-desc" type="text" value="${item.description || ''}" style="display:none;width:90%"></td>
            <td>
                <button onclick="deleteEntry(${item.id})">Delete</button>
                <button onclick="editEntry(this, ${item.id})">Edit</button>
                <button onclick="saveEntry(this, ${item.id})" style="display:none;">Save</button>
                <button onclick="cancelEdit(this)" style="display:none;">Cancel</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Új bejegyzés hozzáadása
function addEntry() {
    const name = document.getElementById('nameInput').value;
    const description = document.getElementById('descriptionInput').value;
    if (!name) {
        showToast('Name is required!', 'error');
        return;
    }
    fetch('/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Entry created successfully') {
            fetchData();
            document.getElementById('nameInput').value = '';
            document.getElementById('descriptionInput').value = '';
            showToast('Entry added successfully!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    })
    .catch(error => showToast('Error adding entry', 'error'));
}

// Bejegyzés törlése
function deleteEntry(id) {
    fetch(`/delete/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            fetchData();
            showToast('Entry deleted!', 'success');
        })
        .catch(error => showToast('Error deleting entry', 'error'));
}

// Szerkesztés indítása
function editEntry(btn, id) {
    const row = btn.closest('tr');
    row.querySelector('.name-text').style.display = 'none';
    row.querySelector('.desc-text').style.display = 'none';
    row.querySelector('.edit-name').style.display = '';
    row.querySelector('.edit-desc').style.display = '';
    btn.style.display = 'none'; // Edit gomb elrejtése
    row.querySelector('button[onclick^="saveEntry"]').style.display = '';
    row.querySelector('button[onclick^="cancelEdit"]').style.display = '';
}

// Szerkesztés mentése
function saveEntry(btn, id) {
    const row = btn.closest('tr');
    const name = row.querySelector('.edit-name').value;
    const description = row.querySelector('.edit-desc').value;
    if (!name) {
        showToast('Name is required!', 'error');
        return;
    }
    fetch(`/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Entry updated successfully') {
            fetchData();
            showToast('Entry updated!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    })
    .catch(error => showToast('Error updating entry', 'error'));
}

// Szerkesztés megszakítása
function cancelEdit(btn) {
    fetchData();
}