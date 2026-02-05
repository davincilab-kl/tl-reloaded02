class SchoolEditManager {
    constructor() {
        this.schoolId = null;
        this.sponsors = [];
        this.init();
    }

    async init() {
        // Schul-ID aus URL-Parameter extrahieren
        const urlParams = new URLSearchParams(window.location.search);
        this.schoolId = urlParams.get('id');
        
        if (!this.schoolId) {
            this.showError('Keine Schul-ID angegeben');
            return;
        }
        
        this.bindEvents();
        await this.loadSponsors();
        await this.loadSchoolData();
    }

    bindEvents() {
        // Förderung-Checkbox Event
        document.getElementById('school-foerderung').addEventListener('change', (e) => {
            const sponsorGroup = document.getElementById('sponsor-group');
            if (e.target.checked) {
                sponsorGroup.style.display = 'block';
            } else {
                sponsorGroup.style.display = 'none';
                document.getElementById('school-sponsor').value = '';
            }
        });

        // Form Submit Event
        document.getElementById('school-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSchoolData();
        });
    }

    async loadSponsors() {
        try {
            const response = await fetch('/api/misc/get_sponsors.php');
            const data = await response.json();
            
            this.sponsors = data.sponsors;
            const sponsorSelect = document.getElementById('school-sponsor');
            
            // Bestehende Optionen (außer der ersten) entfernen
            while (sponsorSelect.children.length > 1) {
                sponsorSelect.removeChild(sponsorSelect.lastChild);
            }
            
            // Neue Optionen hinzufügen
            this.sponsors.forEach(sponsor => {
                const option = document.createElement('option');
                option.value = sponsor;
                option.textContent = sponsor;
                sponsorSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Fehler beim Laden der Sponsoren:', error);
        }
    }

    async loadSchoolData() {
        try {
            const response = await fetch(`/api/schools/get_school_by_id.php?id=${this.schoolId}`);
            const data = await response.json();
            
            if (!data.success || !data.school) {
                this.showError(data.error || 'Schule nicht gefunden');
                return;
            }
            
            const school = data.school;
            
            // Formular mit Schuldaten füllen
            document.getElementById('school-name').value = school.name || '';
            document.getElementById('school-bundesland').value = school.bundesland || '';
            document.getElementById('school-ort').value = school.ort || '';
            document.getElementById('school-schulart').value = school.schulart || '';
            document.getElementById('school-foerderung').checked = school.foerderung || false;
            document.getElementById('school-sponsor').value = school.sponsor || '';
            document.getElementById('school-id-display').value = school.id;
            
            // Erstelldatum formatieren
            if (school.erstelldatum) {
                const date = new Date(school.erstelldatum);
                if (!isNaN(date.getTime())) {
                    document.getElementById('school-erstelldatum').value = date.toISOString().split('T')[0];
                }
            }
            
            // Sponsor-Gruppe anzeigen/verstecken basierend auf Förderung
            const sponsorGroup = document.getElementById('sponsor-group');
            if (school.foerderung) {
                sponsorGroup.style.display = 'block';
            } else {
                sponsorGroup.style.display = 'none';
            }
            
            // Loading verstecken und Formular anzeigen
            document.getElementById('loading').style.display = 'none';
            document.getElementById('school-form').style.display = 'block';
            
        } catch (error) {
            console.error('Fehler beim Laden der Schuldaten:', error);
            this.showError('Fehler beim Laden der Schuldaten');
        }
    }

    async saveSchoolData() {
        const erstelldatumValue = document.getElementById('school-erstelldatum').value;
        
        const formData = {
            id: this.schoolId,
            name: document.getElementById('school-name').value.trim(),
            bundesland: document.getElementById('school-bundesland').value,
            ort: document.getElementById('school-ort').value.trim(),
            schulart: document.getElementById('school-schulart').value.trim(),
            foerderung: document.getElementById('school-foerderung').checked,
            sponsor: document.getElementById('school-sponsor').value,
            erstelldatum: erstelldatumValue || null
        };
        
        // Validierung
        if (!formData.name) {
            this.showError('Schulname ist erforderlich');
            return;
        }
        
        if (!formData.bundesland) {
            this.showError('Bundesland ist erforderlich');
            return;
        }
        
        // Wenn Förderung aktiviert ist, aber kein Sponsor ausgewählt
        if (formData.foerderung && !formData.sponsor) {
            this.showError('Bitte wählen Sie einen Sponsor aus, wenn Förderung aktiviert ist');
            return;
        }
        
        try {
            const response = await fetch('/api/schools/update_school.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Erfolgreich gespeichert - zurück zur Übersicht
                window.location.href = '../index.php';
            } else {
                this.showError(result.error || 'Fehler beim Speichern der Schuldaten');
            }
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            this.showError('Fehler beim Speichern der Schuldaten');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Nach 5 Sekunden automatisch verstecken
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    new SchoolEditManager();
});
