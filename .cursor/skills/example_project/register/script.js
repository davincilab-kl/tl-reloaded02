// Registrierungsformular
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const salutation = document.getElementById('salutation').value;
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const isTeacher = document.getElementById('is-teacher').checked;
    const newsletter = document.getElementById('newsletter').checked;
    const terms = document.getElementById('terms').checked;
    const errorDiv = document.getElementById('register-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validierung
    if (!firstName || !lastName || !salutation || !email || !phone || !password || !passwordConfirm) {
        errorDiv.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!isTeacher) {
        errorDiv.textContent = 'Bitte bestätigen Sie, dass Sie eine Lehrkraft sind.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!terms) {
        errorDiv.textContent = 'Bitte akzeptieren Sie die Teilnahmebedingungen und Datenschutzbestimmungen.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorDiv.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Telefon-Validierung (einfache Prüfung)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.length < 6) {
        errorDiv.textContent = 'Bitte geben Sie eine gültige Telefonnummer ein.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Passwort-Validierung
    if (password.length < 6) {
        errorDiv.textContent = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Passwort-Bestätigung
    if (password !== passwordConfirm) {
        errorDiv.textContent = 'Die Passwörter stimmen nicht überein.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Button deaktivieren
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird registriert...';
    errorDiv.style.display = 'none';
    
    try {
        // Prüfe ob schulcode Parameter in der URL vorhanden ist
        const urlParams = new URLSearchParams(window.location.search);
        const schoolCode = urlParams.get('schulcode');
        
        const response = await fetch('/api/auth/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                salutation: salutation,
                email: email,
                phone: phone,
                password: password,
                newsletter: newsletter,
                school_code: schoolCode || null
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Erfolgreich registriert - zur E-Mail-Verifizierung weiterleiten
            // schulcode wird nicht mehr als Parameter weitergegeben, da er in der DB gespeichert ist
            window.location.href = `/register/verify_email.php?teacher_id=${data.user.teacher_id}`;
        } else {
            // Fehler anzeigen
            errorDiv.className = 'error-message';
            errorDiv.textContent = data.error || 'Registrierung fehlgeschlagen';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Kostenlos registrieren';
        }
    } catch (error) {
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Kostenlos registrieren';
    }
});

