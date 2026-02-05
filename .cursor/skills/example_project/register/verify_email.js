// E-Mail-Verifizierung

// Code-Eingabe automatisch formatieren (nur Zahlen, max 6 Ziffern)
document.getElementById('verification-code').addEventListener('input', function() {
    // Nur Zahlen erlauben
    this.value = this.value.replace(/[^0-9]/g, '');
    
    // Auf 6 Zeichen begrenzen
    if (this.value.length > 6) {
        this.value = this.value.substring(0, 6);
    }
});

// Formular absenden - Validierung erfolgt server-seitig
document.getElementById('verify-email-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const codeInput = document.getElementById('verification-code');
    const errorDiv = document.getElementById('verify-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    const code = codeInput.value.trim();
    
    // Keine client-seitige Validierung - alles wird server-seitig geprüft
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird geprüft...';
    errorDiv.style.display = 'none';
    
    try {
        const response = await fetch('/api/auth/verify_email_code.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                teacher_id: teacherId,
                code: code
            }),
            cache: 'no-store'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Erfolgreich verifiziert - automatisch eingeloggt, weiterleiten
            window.location.href = data.redirect || `/register/select_school.php?teacher_id=${teacherId}`;
        } else {
            errorDiv.className = 'error-message';
            errorDiv.textContent = data.error || 'Ungültiger Code. Bitte versuchen Sie es erneut.';
            errorDiv.style.display = 'block';
            codeInput.value = '';
            codeInput.focus();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> E-Mail bestätigen';
        }
    } catch (error) {
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> E-Mail bestätigen';
    }
});

// Code erneut senden
document.getElementById('resend-code-link').addEventListener('click', async function(e) {
    e.preventDefault();
    
    const link = this;
    const originalText = link.textContent;
    
    link.textContent = 'Wird gesendet...';
    link.style.pointerEvents = 'none';
    
    try {
        const response = await fetch('/api/auth/resend_verification_code.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                teacher_id: teacherId
            }),
            cache: 'no-store'
        });
        
        const data = await response.json();
        
        if (data.success) {
            link.textContent = 'Code wurde erneut gesendet!';
            link.style.color = '#27ae60';
            setTimeout(() => {
                link.textContent = originalText;
                link.style.color = '';
                link.style.pointerEvents = '';
            }, 3000);
        } else {
            link.textContent = 'Fehler beim Senden';
            link.style.color = '#e74c3c';
            setTimeout(() => {
                link.textContent = originalText;
                link.style.color = '';
                link.style.pointerEvents = '';
            }, 3000);
        }
    } catch (error) {
        link.textContent = 'Fehler beim Senden';
        link.style.color = '#e74c3c';
        setTimeout(() => {
            link.textContent = originalText;
            link.style.color = '';
            link.style.pointerEvents = '';
        }, 3000);
    }
});

