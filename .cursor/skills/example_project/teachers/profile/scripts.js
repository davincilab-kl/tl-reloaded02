// Helper-Funktion: User-ID aus Session holen
async function getTeacherUserId() {
    try {
        const userResponse = await fetch('/api/auth/get_current_user.php');
        const userData = await userResponse.json();
        if (userData.success && userData.user_id) {
            return userData.user_id;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der User-ID:', error);
    }
    // Fallback auf localStorage
    return localStorage.getItem('teacher_user_id') || null;
}

// Helper-Funktion: HTML escapen
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Profildaten laden
async function loadProfile() {
    try {
        const userId = await getTeacherUserId();
        if (!userId) {
            throw new Error('Keine User-ID gefunden');
        }
        
        const url = `/api/teachers/get_profile.php?user_id=${userId}`;
        const res = await fetch(url, { cache: 'no-store' });
        
        if (!res.ok) {
            throw new Error('HTTP ' + res.status);
        }
        
        const data = await res.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        const profileInfo = document.getElementById('profile-info');
        profileInfo.innerHTML = `
            <div class="profile-info-item">
                <div class="profile-info-icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="profile-info-content">
                    <div class="profile-info-label">Name</div>
                    <div class="profile-info-value">${escapeHtml(data.name || 'Nicht angegeben')}</div>
                </div>
                <button class="edit-btn" id="edit-name-btn" title="Name ändern">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            </div>
            <div class="profile-info-item">
                <div class="profile-info-icon">
                    <i class="fas fa-venus-mars"></i>
                </div>
                <div class="profile-info-content">
                    <div class="profile-info-label">Geschlecht</div>
                    <div class="profile-info-value">${escapeHtml(data.salutation || 'Nicht angegeben')}</div>
                </div>
                <button class="edit-btn" id="edit-salutation-btn" title="Geschlecht ändern">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            </div>
            <div class="profile-info-item">
                <div class="profile-info-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="profile-info-content">
                    <div class="profile-info-label">E-Mail-Adresse</div>
                    <div class="profile-info-value">${escapeHtml(data.email || 'Nicht angegeben')}</div>
                </div>
                <button class="edit-btn" id="edit-email-btn" title="E-Mail ändern">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            </div>
            <div class="profile-info-item">
                <div class="profile-info-icon">
                    <i class="fas fa-phone"></i>
                </div>
                <div class="profile-info-content">
                    <div class="profile-info-label">Mobiltelefon</div>
                    <div class="profile-info-value">${escapeHtml(data.phone || 'Nicht angegeben')}</div>
                </div>
                <button class="edit-btn" id="edit-phone-btn" title="Telefon ändern">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            </div>
            <div class="profile-info-item">
                <div class="profile-info-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="profile-info-content">
                    <div class="profile-info-label">Newsletter</div>
                    <div class="profile-info-value">${data.newsletter ? 'Ja' : 'Nein'}</div>
                </div>
                <button class="edit-btn" id="edit-newsletter-btn" title="Newsletter-Einstellung ändern">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            </div>
            ${data.school_name ? `
            <div class="profile-info-item">
                <div class="profile-info-icon">
                    <i class="fas fa-school"></i>
                </div>
                <div class="profile-info-content">
                    <div class="profile-info-label">Schule</div>
                    <div class="profile-info-value">${escapeHtml(data.school_name)}</div>
                </div>
            </div>
            ` : ''}
            <div class="profile-info-item password-item">
                <div class="profile-info-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <div class="profile-info-content">
                    <div class="profile-info-label">Passwort</div>
                    <div class="profile-info-value">••••••••</div>
                </div>
                <button class="edit-btn" id="edit-password-btn" title="Passwort ändern">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            </div>
        `;
        
        // Event-Listener für Bearbeiten-Buttons hinzufügen
        document.getElementById('edit-name-btn').addEventListener('click', () => {
            const firstNameInput = document.getElementById('first-name-input');
            const lastNameInput = document.getElementById('last-name-input');
            // Name aufteilen (falls vorhanden)
            const nameParts = (data.name || '').split(' ');
            if (nameParts.length > 0) {
                firstNameInput.value = nameParts[0] || '';
                lastNameInput.value = nameParts.slice(1).join(' ') || '';
            }
            document.getElementById('name-modal').style.display = 'flex';
        });
        
        document.getElementById('edit-salutation-btn').addEventListener('click', () => {
            const salutationSelect = document.getElementById('salutation-input');
            if (data.salutation) {
                salutationSelect.value = data.salutation;
            }
            document.getElementById('salutation-modal').style.display = 'flex';
        });
        
        document.getElementById('edit-email-btn').addEventListener('click', () => {
            const emailInput = document.getElementById('email-input');
            if (data.email) {
                emailInput.value = data.email;
            }
            document.getElementById('email-modal').style.display = 'flex';
        });
        
        document.getElementById('edit-phone-btn').addEventListener('click', () => {
            const phoneInput = document.getElementById('phone-input');
            if (data.phone) {
                phoneInput.value = data.phone;
            }
            document.getElementById('phone-modal').style.display = 'flex';
        });
        
        document.getElementById('edit-newsletter-btn').addEventListener('click', () => {
            const newsletterCheckbox = document.getElementById('newsletter-input');
            newsletterCheckbox.checked = data.newsletter || false;
            document.getElementById('newsletter-modal').style.display = 'flex';
        });
        
        document.getElementById('edit-password-btn').addEventListener('click', () => {
            document.getElementById('password-modal').style.display = 'flex';
            // Passwort-Validierung neu einrichten, falls noch nicht geschehen
            setupPasswordValidation();
        });
        
    } catch (e) {
        console.error('Fehler beim Laden der Profildaten:', e);
        document.getElementById('profile-info').innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Fehler beim Laden der Profildaten: ${escapeHtml(e.message)}</span>
            </div>
        `;
    }
}

// Profilfeld aktualisieren
async function updateProfileField(field, value) {
    const userId = await getTeacherUserId();
    if (!userId) {
        throw new Error('Keine User-ID gefunden');
    }
    
    const response = await fetch('/api/teachers/update_profile.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: parseInt(userId),
            [field]: value
        }),
        cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Fehler beim Aktualisieren');
    }
    
    return data;
}

// E-Mail ändern (für Kompatibilität)
async function updateEmail(email) {
    return await updateProfileField('email', email);
}

// Passwort ändern
async function updatePassword(currentPassword, newPassword) {
    const userId = await getTeacherUserId();
    if (!userId) {
        throw new Error('Keine User-ID gefunden');
    }
    
    const response = await fetch('/api/teachers/update_password.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: parseInt(userId),
            current_password: currentPassword,
            new_password: newPassword
        }),
        cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Fehler beim Ändern des Passworts');
    }
    
    return data;
}

// E-Mail-Modal Handler
document.getElementById('save-email').addEventListener('click', async function() {
    const emailInput = document.getElementById('email-input');
    const hint = document.getElementById('email-hint');
    const saveBtn = document.getElementById('save-email');
    
    const email = emailInput.value.trim();
    
    if (!email) {
        hint.textContent = 'Bitte geben Sie eine E-Mail-Adresse ein';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
        return;
    }
    
    // Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        hint.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
        return;
    }
    
    // Submit-Button deaktivieren
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gespeichert...';
    
    try {
        await updateEmail(email);
        
        // Erfolg anzeigen
        hint.textContent = 'E-Mail-Adresse erfolgreich aktualisiert';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#27ae60';
        
        // Modal schließen nach kurzer Zeit
        setTimeout(() => {
            document.getElementById('email-modal').style.display = 'none';
            hint.style.display = 'none';
            emailInput.value = '';
            // Profil neu laden
            loadProfile();
        }, 1500);
        
    } catch (error) {
        hint.textContent = error.message;
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Speichern';
    }
});

// Passwort-Modal Handler
document.getElementById('save-password').addEventListener('click', async function() {
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const hint = document.getElementById('password-hint');
    const saveBtn = document.getElementById('save-password');
    
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    // Validierung
    if (!currentPassword) {
        hint.textContent = 'Bitte geben Sie Ihr aktuelles Passwort ein';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
        return;
    }
    
    if (!newPassword || newPassword.length < 5) {
        hint.textContent = 'Das neue Passwort muss mindestens 5 Zeichen lang sein';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        hint.textContent = 'Die Passwörter stimmen nicht überein';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
        return;
    }
    
    // Submit-Button deaktivieren
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird geändert...';
    
    try {
        await updatePassword(currentPassword, newPassword);
        
        // Erfolg anzeigen
        hint.textContent = 'Passwort erfolgreich geändert';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#27ae60';
        
        // Modal schließen nach kurzer Zeit
        setTimeout(() => {
            document.getElementById('password-modal').style.display = 'none';
            hint.style.display = 'none';
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        }, 1500);
        
    } catch (error) {
        hint.textContent = error.message;
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Speichern';
    }
});

// Name-Modal Handler
document.getElementById('save-name').addEventListener('click', async function() {
    const firstNameInput = document.getElementById('first-name-input');
    const lastNameInput = document.getElementById('last-name-input');
    const hint = document.getElementById('name-hint');
    const saveBtn = document.getElementById('save-name');
    
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    
    if (!firstName || !lastName) {
        hint.textContent = 'Bitte geben Sie Vor- und Nachname ein';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gespeichert...';
    
    try {
        // Beide Felder gleichzeitig aktualisieren
        const userId = await getTeacherUserId();
        if (!userId) {
            throw new Error('Keine User-ID gefunden');
        }
        
        const response = await fetch('/api/teachers/update_profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: parseInt(userId),
                first_name: firstName,
                last_name: lastName
            }),
            cache: 'no-store'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Fehler beim Aktualisieren');
        }
        
        hint.textContent = 'Name erfolgreich aktualisiert';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#27ae60';
        
        setTimeout(() => {
            document.getElementById('name-modal').style.display = 'none';
            hint.style.display = 'none';
            firstNameInput.value = '';
            lastNameInput.value = '';
            loadProfile();
        }, 1500);
        
    } catch (error) {
        hint.textContent = error.message;
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Speichern';
    }
});

// Geschlecht-Modal Handler
document.getElementById('save-salutation').addEventListener('click', async function() {
    const salutationSelect = document.getElementById('salutation-input');
    const hint = document.getElementById('salutation-hint');
    const saveBtn = document.getElementById('save-salutation');
    
    const salutation = salutationSelect.value;
    
    if (!salutation) {
        hint.textContent = 'Bitte wählen Sie ein Geschlecht';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gespeichert...';
    
    try {
        await updateProfileField('salutation', salutation);
        
        hint.textContent = 'Geschlecht erfolgreich aktualisiert';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#27ae60';
        
        setTimeout(() => {
            document.getElementById('salutation-modal').style.display = 'none';
            hint.style.display = 'none';
            loadProfile();
        }, 1500);
        
    } catch (error) {
        hint.textContent = error.message;
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Speichern';
    }
});

// Telefon-Modal Handler
document.getElementById('save-phone').addEventListener('click', async function() {
    const phoneInput = document.getElementById('phone-input');
    const hint = document.getElementById('phone-hint');
    const saveBtn = document.getElementById('save-phone');
    
    const phone = phoneInput.value.trim();
    
    if (!phone) {
        hint.textContent = 'Bitte geben Sie eine Telefonnummer ein';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
        return;
    }
    
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.length < 6) {
        hint.textContent = 'Bitte geben Sie eine gültige Telefonnummer ein';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gespeichert...';
    
    try {
        await updateProfileField('phone', phone);
        
        hint.textContent = 'Telefonnummer erfolgreich aktualisiert';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#27ae60';
        
        setTimeout(() => {
            document.getElementById('phone-modal').style.display = 'none';
            hint.style.display = 'none';
            phoneInput.value = '';
            loadProfile();
        }, 1500);
        
    } catch (error) {
        hint.textContent = error.message;
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Speichern';
    }
});

// Newsletter-Modal Handler
document.getElementById('save-newsletter').addEventListener('click', async function() {
    const newsletterCheckbox = document.getElementById('newsletter-input');
    const hint = document.getElementById('newsletter-hint');
    const saveBtn = document.getElementById('save-newsletter');
    
    const newsletter = newsletterCheckbox.checked;
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gespeichert...';
    
    try {
        await updateProfileField('newsletter', newsletter);
        
        hint.textContent = 'Newsletter-Einstellung erfolgreich aktualisiert';
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#27ae60';
        
        setTimeout(() => {
            document.getElementById('newsletter-modal').style.display = 'none';
            hint.style.display = 'none';
            loadProfile();
        }, 1500);
        
    } catch (error) {
        hint.textContent = error.message;
        hint.className = 'modal-hint';
        hint.style.display = 'block';
        hint.style.color = '#e74c3c';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Speichern';
    }
});

// Modal schließen Handler
document.getElementById('close-name-modal').addEventListener('click', function() {
    document.getElementById('name-modal').style.display = 'none';
    document.getElementById('first-name-input').value = '';
    document.getElementById('last-name-input').value = '';
    document.getElementById('name-hint').style.display = 'none';
});

document.getElementById('cancel-name').addEventListener('click', function() {
    document.getElementById('name-modal').style.display = 'none';
    document.getElementById('first-name-input').value = '';
    document.getElementById('last-name-input').value = '';
    document.getElementById('name-hint').style.display = 'none';
});

document.getElementById('close-salutation-modal').addEventListener('click', function() {
    document.getElementById('salutation-modal').style.display = 'none';
    document.getElementById('salutation-hint').style.display = 'none';
});

document.getElementById('cancel-salutation').addEventListener('click', function() {
    document.getElementById('salutation-modal').style.display = 'none';
    document.getElementById('salutation-hint').style.display = 'none';
});

document.getElementById('close-email-modal').addEventListener('click', function() {
    document.getElementById('email-modal').style.display = 'none';
    document.getElementById('email-input').value = '';
    document.getElementById('email-hint').style.display = 'none';
});

document.getElementById('cancel-email').addEventListener('click', function() {
    document.getElementById('email-modal').style.display = 'none';
    document.getElementById('email-input').value = '';
    document.getElementById('email-hint').style.display = 'none';
});

document.getElementById('close-phone-modal').addEventListener('click', function() {
    document.getElementById('phone-modal').style.display = 'none';
    document.getElementById('phone-input').value = '';
    document.getElementById('phone-hint').style.display = 'none';
});

document.getElementById('cancel-phone').addEventListener('click', function() {
    document.getElementById('phone-modal').style.display = 'none';
    document.getElementById('phone-input').value = '';
    document.getElementById('phone-hint').style.display = 'none';
});

document.getElementById('close-newsletter-modal').addEventListener('click', function() {
    document.getElementById('newsletter-modal').style.display = 'none';
    document.getElementById('newsletter-hint').style.display = 'none';
});

document.getElementById('cancel-newsletter').addEventListener('click', function() {
    document.getElementById('newsletter-modal').style.display = 'none';
    document.getElementById('newsletter-hint').style.display = 'none';
});

document.getElementById('close-password-modal').addEventListener('click', function() {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-hint').style.display = 'none';
});

document.getElementById('cancel-password').addEventListener('click', function() {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-hint').style.display = 'none';
});

// Passwort-Bestätigung validieren (in Echtzeit)
let passwordValidationSetup = false;
function setupPasswordValidation() {
    if (passwordValidationSetup) return; // Bereits eingerichtet
    
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = this.value;
            const hint = document.getElementById('password-hint');
            
            if (confirmPassword && newPassword !== confirmPassword) {
                hint.textContent = 'Die Passwörter stimmen nicht überein';
                hint.className = 'modal-hint';
                hint.style.display = 'block';
                hint.style.color = '#e74c3c';
            } else if (confirmPassword && newPassword === confirmPassword) {
                hint.textContent = 'Passwörter stimmen überein';
                hint.className = 'modal-hint';
                hint.style.display = 'block';
                hint.style.color = '#27ae60';
            } else {
                hint.style.display = 'none';
            }
        });
        passwordValidationSetup = true;
    }
}

// Profildaten beim Laden der Seite laden
loadProfile();

// Passwort-Validierung beim Laden einrichten
setupPasswordValidation();

