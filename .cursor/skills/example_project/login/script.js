// Tab-Wechsel
document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Tabs aktivieren/deaktivieren
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
        
        // Fehlermeldungen zurücksetzen
        document.querySelectorAll('.error-message').forEach(err => {
            err.style.display = 'none';
            err.textContent = '';
        });
    });
});

// Admin/Lehrkräfte Login
document.getElementById('admin-teacher-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value.trim();
    const errorDiv = document.getElementById('admin-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validierung
    if (!email || !password) {
        errorDiv.textContent = 'Bitte füllen Sie alle Felder aus.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Button deaktivieren
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird angemeldet...';
    errorDiv.style.display = 'none';
    
    try {
        const response = await fetch('/api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login_type: 'admin_teacher',
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Erfolgreich eingeloggt - weiterleiten
            window.location.href = data.redirect || '/admin/dashboard/';
        } else if (data.requires_verification && data.redirect) {
            // E-Mail-Verifizierung erforderlich - zur Verifizierungsseite weiterleiten
            window.location.href = data.redirect;
        } else {
            // Fehler anzeigen
            errorDiv.textContent = data.error || 'Anmeldung fehlgeschlagen';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
        }
    } catch (error) {
        errorDiv.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
    }
});

// Schüler Login
document.getElementById('student-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('student-password').value.trim();
    const errorDiv = document.getElementById('student-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validierung
    if (!password) {
        errorDiv.textContent = 'Bitte geben Sie Ihr Passwort ein.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Button deaktivieren
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird angemeldet...';
    errorDiv.style.display = 'none';
    
    try {
        const response = await fetch('/api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login_type: 'student',
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Erfolgreich eingeloggt - weiterleiten
            window.location.href = data.redirect || '/students/courses/';
        } else {
            // Fehler anzeigen
            errorDiv.textContent = data.error || 'Anmeldung fehlgeschlagen';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
        }
    } catch (error) {
        errorDiv.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
    }
});

