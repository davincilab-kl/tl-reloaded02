/**
 * Impersonation-Leiste JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    const impersonationBar = document.getElementById('impersonation-bar');
    const stopImpersonationBtn = document.getElementById('stop-impersonation-btn');
    const toggleBtn = document.getElementById('toggle-impersonation-bar');
    
    // Toggle-Funktionalität für Ein-/Ausblenden
    if (toggleBtn && impersonationBar) {
        toggleBtn.addEventListener('click', function() {
            impersonationBar.classList.toggle('collapsed');
            document.body.classList.toggle('impersonation-collapsed');
            
            // Status im localStorage speichern
            const isCollapsed = impersonationBar.classList.contains('collapsed');
            localStorage.setItem('impersonation-bar-collapsed', isCollapsed);
        });
        
        // Gespeicherten Status wiederherstellen
        const savedState = localStorage.getItem('impersonation-bar-collapsed');
        if (savedState === 'true') {
            impersonationBar.classList.add('collapsed');
            document.body.classList.add('impersonation-collapsed');
        }
    }
    
    if (stopImpersonationBtn) {
        stopImpersonationBtn.addEventListener('click', async function() {
            if (!confirm('Möchten Sie wirklich zum Admin-Account zurückkehren?')) {
                return;
            }
            
            // Button deaktivieren während der Anfrage
            stopImpersonationBtn.disabled = true;
            stopImpersonationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird ausgeloggt...';
            
            try {
                const response = await fetch('/api/auth/stop_impersonate.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Weiterleitung zum Admin-Dashboard
                    window.location.href = data.redirect || '/admin/dashboard/';
                } else {
                    alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
                    stopImpersonationBtn.disabled = false;
                    stopImpersonationBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Zurück zum Admin-Account';
                }
            } catch (error) {
                console.error('Fehler beim Beenden der Impersonation:', error);
                alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                stopImpersonationBtn.disabled = false;
                stopImpersonationBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Zurück zum Admin-Account';
            }
        });
    }
    
    // Body-Klasse hinzufügen für Padding (Fallback für Browser ohne :has() Support)
    if (impersonationBar) {
        document.body.classList.add('impersonation-active');
    }
});

