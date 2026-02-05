// Challenges Admin Verwaltung

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let currentChallengeId = null;

// Lade alle Challenges
async function loadChallenges() {
    const challengesList = document.getElementById('challenges-list');
    challengesList.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Challenges...</span>
        </div>
    `;

    try {
        const response = await fetch('/api/challenges/get_challenges.php?all=true');
        const data = await response.json();

        if (data.error) {
            challengesList.innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error)}</div>`;
            return;
        }

        if (!data.success || !data.challenges || data.challenges.length === 0) {
            challengesList.innerHTML = '<div class="no-messages">Noch keine Challenges vorhanden. Erstellen Sie eine neue Challenge!</div>';
            return;
        }

        challengesList.innerHTML = data.challenges.map(challenge => {
            const challengeTypeText = challenge.challenge_type === 'tscore' ? 'T!Score' : 'Projekte';
            
            return `
                <div class="challenge-item">
                    <div class="challenge-info">
                        <div class="challenge-title">${escapeHtml(challenge.title)}</div>
                        ${challenge.description ? `<div style="color: #7f8c8d; margin-top: 5px;">${escapeHtml(challenge.description.substring(0, 100))}${challenge.description.length > 100 ? '...' : ''}</div>` : ''}
                        <div class="challenge-meta">
                            <span class="challenge-meta-item">
                                <i class="fas fa-tasks"></i> ${escapeHtml(challengeTypeText)}
                            </span>
                            <span class="challenge-meta-item">
                                <i class="fas fa-toggle-${challenge.state === 'active' ? 'on' : 'off'}"></i> ${escapeHtml(challenge.state)}
                            </span>
                            ${challenge.start_date ? `<span class="challenge-meta-item"><i class="far fa-calendar-alt"></i> Start: ${escapeHtml(new Date(challenge.start_date).toLocaleDateString('de-DE'))}</span>` : ''}
                            ${challenge.end_date ? `<span class="challenge-meta-item"><i class="far fa-calendar"></i> Ende: ${escapeHtml(new Date(challenge.end_date).toLocaleDateString('de-DE'))}</span>` : ''}
                        </div>
                    </div>
                    <div class="challenge-actions">
                        <button class="btn-edit" onclick="editChallenge(${challenge.id})">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        <button class="btn-delete" onclick="deleteChallenge(${challenge.id})">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Fehler beim Laden der Challenges:', error);
        challengesList.innerHTML = '<div class="error-messages">Fehler beim Laden der Challenges</div>';
    }
}

// Lade Sponsoren für Dropdown
async function loadSponsors() {
    try {
        const response = await fetch('/api/misc/get_sponsors.php');
        const data = await response.json();
        
        const sponsorSelect = document.getElementById('challenge-sponsor-filter');
        if (!sponsorSelect) return;
        
        // Leere Optionen außer "Alle Sponsoren"
        sponsorSelect.innerHTML = '<option value="">Alle Sponsoren</option>';
        
        if (data.sponsors && data.sponsors.length > 0) {
            // Sortiere nochmal alphabetisch (für Sicherheit)
            const sortedSponsors = [...data.sponsors].sort((a, b) => 
                a.localeCompare(b, 'de', { sensitivity: 'base' })
            );
            
            sortedSponsors.forEach(sponsor => {
                const option = document.createElement('option');
                option.value = sponsor;
                option.textContent = sponsor;
                sponsorSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Fehler beim Laden der Sponsoren:', error);
    }
}

// Bild-Upload und Vorschau
function initImageUpload() {
    const imageInput = document.getElementById('challenge-image');
    const imagePreview = document.getElementById('challenge-image-preview');
    const imagePreviewImg = document.getElementById('challenge-image-preview-img');
    const imagePathInput = document.getElementById('challenge-image-path');
    const imageRemoveBtn = document.getElementById('challenge-image-remove');
    
    if (!imageInput) return;
    
    imageInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validierung
        if (!file.type.startsWith('image/')) {
            alert('Bitte wählen Sie eine Bilddatei aus.');
            imageInput.value = '';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Die Datei ist zu groß (max. 5MB).');
            imageInput.value = '';
            return;
        }
        
        // Vorschau anzeigen
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreviewImg.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
        
        // Upload zum Server
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch('/api/challenges/upload_image.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                imagePathInput.value = data.image_path;
            } else {
                alert('Fehler beim Hochladen: ' + (data.error || 'Unbekannter Fehler'));
                imageInput.value = '';
                imagePreview.style.display = 'none';
            }
        } catch (error) {
            console.error('Fehler beim Hochladen:', error);
            alert('Fehler beim Hochladen des Bildes');
            imageInput.value = '';
            imagePreview.style.display = 'none';
        }
    });
    
    // Bild entfernen
    if (imageRemoveBtn) {
        imageRemoveBtn.addEventListener('click', function() {
            imageInput.value = '';
            imagePathInput.value = '';
            imagePreview.style.display = 'none';
        });
    }
}

// Öffne Modal zum Erstellen
async function openCreateModal() {
    currentChallengeId = null;
    document.getElementById('modal-title').textContent = 'Challenge erstellen';
    document.getElementById('challenge-form').reset();
    document.getElementById('challenge-id').value = '';
    document.getElementById('challenge-error').style.display = 'none';
    document.getElementById('challenge-image-preview').style.display = 'none';
    document.getElementById('challenge-image-path').value = '';
    await loadSponsors();
    document.getElementById('challenge-modal').style.display = 'flex';
}

// Öffne Modal zum Bearbeiten
async function editChallenge(challengeId) {
    currentChallengeId = challengeId;
    
    try {
        const response = await fetch(`/api/challenges/get_challenge.php?challenge_id=${challengeId}`);
        const data = await response.json();

        if (data.error || !data.success) {
            alert('Fehler beim Laden der Challenge: ' + (data.error || 'Unbekannter Fehler'));
            return;
        }

        const challenge = data.challenge;
        
        // Lade Sponsoren bevor das Modal geöffnet wird
        await loadSponsors();
        
        document.getElementById('modal-title').textContent = 'Challenge bearbeiten';
        document.getElementById('challenge-id').value = challenge.id;
        document.getElementById('challenge-title').value = challenge.title || '';
        document.getElementById('challenge-description').value = challenge.description || '';
        document.getElementById('challenge-challenge-type').value = challenge.challenge_type || 'tscore';
        document.getElementById('challenge-start-date').value = challenge.start_date || '';
        document.getElementById('challenge-end-date').value = challenge.end_date || '';
        document.getElementById('challenge-state-filter').value = challenge.state_filter || '';
        document.getElementById('challenge-sponsor-filter').value = challenge.sponsor_filter || '';
        document.getElementById('challenge-state').value = challenge.state || 'active';
        
        // Bild anzeigen falls vorhanden
        const imagePreview = document.getElementById('challenge-image-preview');
        const imagePreviewImg = document.getElementById('challenge-image-preview-img');
        const imagePathInput = document.getElementById('challenge-image-path');
        if (challenge.image_path) {
            imagePathInput.value = challenge.image_path;
            imagePreviewImg.src = '/challenges/imgs/' + challenge.image_path;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
            imagePathInput.value = '';
        }
        
        document.getElementById('challenge-error').style.display = 'none';
        document.getElementById('challenge-modal').style.display = 'flex';

    } catch (error) {
        console.error('Fehler beim Laden der Challenge:', error);
        alert('Fehler beim Laden der Challenge');
    }
}

// Schließe Modal
function closeModal() {
    document.getElementById('challenge-modal').style.display = 'none';
    document.getElementById('challenge-form').reset();
    currentChallengeId = null;
}

// Speichere Challenge
async function saveChallenge() {
    const form = document.getElementById('challenge-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const errorDiv = document.getElementById('challenge-error');
    const submitBtn = document.getElementById('submit-challenge');
    
    // Validierung
    if (!data.title || !data.challenge_type || !data.state) {
        errorDiv.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Button deaktivieren
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gespeichert...';
    errorDiv.style.display = 'none';
    
    try {
        const url = currentChallengeId 
            ? '/api/challenges/update_challenge.php'
            : '/api/challenges/create_challenge.php';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeModal();
            loadChallenges();
        } else {
            errorDiv.textContent = result.error || 'Fehler beim Speichern';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Speichern';
        }
    } catch (error) {
        errorDiv.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Speichern';
    }
}

// Lösche Challenge
async function deleteChallenge(challengeId) {
    if (!confirm('Möchten Sie diese Challenge wirklich löschen?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/challenges/delete_challenge.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ challenge_id: challengeId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadChallenges();
        } else {
            alert('Fehler beim Löschen: ' + (result.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        alert('Fehler beim Löschen der Challenge');
    }
}

// Event Listener
document.addEventListener('DOMContentLoaded', function() {
    loadChallenges();
    initImageUpload();
    
    document.getElementById('create-challenge-btn').addEventListener('click', openCreateModal);
    document.getElementById('close-challenge-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-challenge').addEventListener('click', closeModal);
    document.getElementById('submit-challenge').addEventListener('click', saveChallenge);
    
    // Modal schließen bei Klick außerhalb
    document.getElementById('challenge-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});

