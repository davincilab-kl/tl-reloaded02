// Email Templates Manager
const emailTemplatesManager = {
    templates: [],
    currentTemplate: null,

    async init() {
        this.bindEvents();
        await this.loadTemplates();
    },

    bindEvents() {
        // Create template button
        document.getElementById('create-template-btn').addEventListener('click', () => {
            this.openTemplateModal();
        });

        // Template modal
        document.getElementById('close-template-modal').addEventListener('click', () => {
            this.closeTemplateModal();
        });

        document.getElementById('cancel-template').addEventListener('click', () => {
            this.closeTemplateModal();
        });

        document.getElementById('save-template').addEventListener('click', () => {
            this.saveTemplate();
        });

        // Send email modal
        document.getElementById('close-send-modal').addEventListener('click', () => {
            this.closeSendModal();
        });

        document.getElementById('cancel-send').addEventListener('click', () => {
            this.closeSendModal();
        });

        document.getElementById('send-email-btn').addEventListener('click', () => {
            this.sendEmail();
        });

        // Recipient type change
        const sendToSelect = document.getElementById('send-to');
        if (sendToSelect) {
            sendToSelect.addEventListener('change', (e) => {
                const customEmailGroup = document.getElementById('custom-email-group');
                const userIdsGroup = document.getElementById('user-ids-group');
                
                if (e.target.value === 'custom') {
                    if (customEmailGroup) customEmailGroup.style.display = 'block';
                    if (userIdsGroup) userIdsGroup.style.display = 'none';
                } else if (e.target.value === 'user_ids') {
                    if (customEmailGroup) customEmailGroup.style.display = 'none';
                    if (userIdsGroup) userIdsGroup.style.display = 'block';
                } else {
                    if (customEmailGroup) customEmailGroup.style.display = 'none';
                    if (userIdsGroup) userIdsGroup.style.display = 'none';
                }
            });
        }

        // Close modals on outside click
        document.getElementById('template-modal').addEventListener('click', (e) => {
            if (e.target.id === 'template-modal') {
                this.closeTemplateModal();
            }
        });

        document.getElementById('send-email-modal').addEventListener('click', (e) => {
            if (e.target.id === 'send-email-modal') {
                this.closeSendModal();
            }
        });
    },

    async loadTemplates() {
        const listEl = document.getElementById('templates-list');
        listEl.innerHTML = '<div class="loading-templates"><i class="fas fa-spinner"></i><span>Lade Vorlagen...</span></div>';

        try {
            const response = await fetch('/api/email/get_email_templates.php');
            const data = await response.json();

            if (data.success) {
                this.templates = data.templates || [];
                this.renderTemplates();
            } else {
                listEl.innerHTML = '<div class="no-templates"><i class="fas fa-inbox"></i><span>Fehler beim Laden: ' + (data.error || 'Unbekannter Fehler') + '</span></div>';
            }
        } catch (error) {
            console.error('Error loading templates:', error);
            listEl.innerHTML = '<div class="no-templates"><i class="fas fa-exclamation-triangle"></i><span>Fehler beim Laden der Vorlagen</span></div>';
        }
    },

    renderTemplates() {
        const listEl = document.getElementById('templates-list');

        if (this.templates.length === 0) {
            listEl.innerHTML = '<div class="no-templates"><i class="fas fa-envelope-open"></i><span>Noch keine Vorlagen vorhanden. Erstellen Sie Ihre erste Vorlage!</span></div>';
            return;
        }

        listEl.innerHTML = this.templates.map(template => `
            <div class="template-card" data-id="${template.id}">
                <div class="template-info">
                    <div class="template-name">${this.escapeHtml(template.name)}</div>
                    <div class="template-subject">${this.escapeHtml(template.subject)}</div>
                    <div class="template-meta">
                        <span><i class="fas fa-calendar"></i> Erstellt: ${this.formatDate(template.created_at)}</span>
                        ${template.is_html ? '<span><i class="fas fa-code"></i> HTML</span>' : '<span><i class="fas fa-text-width"></i> Text</span>'}
                    </div>
                </div>
                <div class="template-actions">
                    <button class="btn-small btn-edit" onclick="emailTemplatesManager.editTemplate(${template.id})">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button class="btn-small btn-send" onclick="emailTemplatesManager.openSendModal(${template.id})">
                        <i class="fas fa-paper-plane"></i> Senden
                    </button>
                    <button class="btn-small btn-delete" onclick="emailTemplatesManager.deleteTemplate(${template.id})">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                </div>
            </div>
        `).join('');
    },

    openTemplateModal(templateId = null) {
        const modal = document.getElementById('template-modal');
        const form = document.getElementById('template-form');
        const modalTitle = document.getElementById('modal-title');

        if (templateId) {
            const template = this.templates.find(t => t.id === templateId);
            if (template) {
                this.currentTemplate = template;
                modalTitle.textContent = 'Vorlage bearbeiten';
                document.getElementById('template-id').value = template.id;
                document.getElementById('template-name').value = template.name;
                document.getElementById('template-subject').value = template.subject;
                document.getElementById('template-body').value = template.body;
                document.getElementById('template-is-html').checked = template.is_html == 1;
            }
        } else {
            this.currentTemplate = null;
            modalTitle.textContent = 'Neue Vorlage';
            form.reset();
            document.getElementById('template-id').value = '';
        }

        modal.style.display = 'flex';
    },

    closeTemplateModal() {
        document.getElementById('template-modal').style.display = 'none';
        document.getElementById('template-form').reset();
        this.currentTemplate = null;
    },

    async saveTemplate() {
        const form = document.getElementById('template-form');
        const formData = new FormData(form);

        const templateData = {
            id: formData.get('template_id') || null,
            name: formData.get('name'),
            subject: formData.get('subject'),
            body: formData.get('body'),
            is_html: document.getElementById('template-is-html').checked ? 1 : 0
        };

        // Validation
        if (!templateData.name || !templateData.subject || !templateData.body) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        try {
            const response = await fetch('/api/email/save_email_template.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateData)
            });

            const data = await response.json();

            if (data.success) {
                this.closeTemplateModal();
                await this.loadTemplates();
                alert('Vorlage erfolgreich gespeichert!');
            } else {
                alert('Fehler beim Speichern: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Fehler beim Speichern der Vorlage.');
        }
    },

    editTemplate(templateId) {
        this.openTemplateModal(templateId);
    },

    async deleteTemplate(templateId) {
        if (!confirm('Möchten Sie diese Vorlage wirklich löschen?')) {
            return;
        }

        try {
            const response = await fetch('/api/email/save_email_template.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: templateId,
                    delete: true
                })
            });

            const data = await response.json();

            if (data.success) {
                await this.loadTemplates();
                alert('Vorlage erfolgreich gelöscht!');
            } else {
                alert('Fehler beim Löschen: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Fehler beim Löschen der Vorlage.');
        }
    },

    openSendModal(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) {
            alert('Vorlage nicht gefunden.');
            return;
        }

        const modal = document.getElementById('send-email-modal');
        document.getElementById('send-template-id').value = templateId;

        // Preview
        document.getElementById('preview-subject').value = template.subject;
        document.getElementById('preview-body').innerHTML = template.is_html == 1 
            ? template.body 
            : '<pre>' + this.escapeHtml(template.body) + '</pre>';

        // Reset form
        document.getElementById('send-email-form').reset();
        document.getElementById('send-template-id').value = templateId;
        document.getElementById('send-to').value = '';
        document.getElementById('custom-email-group').style.display = 'none';
        document.getElementById('user-ids-group').style.display = 'none';

        modal.style.display = 'flex';
    },

    closeSendModal() {
        document.getElementById('send-email-modal').style.display = 'none';
        document.getElementById('send-email-form').reset();
    },

    async sendEmail() {
        const form = document.getElementById('send-email-form');
        const formData = new FormData(form);

        const recipientType = formData.get('recipient_type');
        const customEmail = formData.get('custom_email');
        const userIdsInput = formData.get('user_ids');
        const templateId = parseInt(formData.get('template_id'));

        if (!recipientType) {
            alert('Bitte wählen Sie einen Empfängertyp aus.');
            return;
        }

        if (recipientType === 'custom' && !customEmail) {
            alert('Bitte geben Sie eine E-Mail-Adresse ein.');
            return;
        }

        if (recipientType === 'user_ids' && !userIdsInput) {
            alert('Bitte geben Sie mindestens eine User-ID ein.');
            return;
        }

        // Parse User-IDs
        let userIds = null;
        if (recipientType === 'user_ids' && userIdsInput) {
            userIds = userIdsInput.split(',')
                .map(id => parseInt(id.trim()))
                .filter(id => !isNaN(id) && id > 0);
            
            if (userIds.length === 0) {
                alert('Bitte geben Sie gültige User-IDs ein.');
                return;
            }
        }

        const sendData = {
            template_id: templateId,
            recipient_type: recipientType,
            custom_email: recipientType === 'custom' ? customEmail : null,
            user_ids: recipientType === 'user_ids' ? userIds : null
        };

        if (!confirm('Möchten Sie diese E-Mail wirklich senden?')) {
            return;
        }

        // Request-Daten für Debugging in Console
        console.log('E-Mail-Versendung Request:', sendData);
        
        try {
            const response = await fetch('/api/email/send_email_template.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sendData)
            });

            // Response als Text lesen, um sie später als JSON zu parsen
            const responseText = await response.text();
            let data;
            
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                // Wenn kein JSON zurückkommt
                console.error('E-Mail-Versendung: Ungültige JSON-Antwort', {
                    error: e,
                    responseText: responseText
                });
                alert('Fehler beim Senden: Ungültige Serverantwort\n' + responseText.substring(0, 200));
                return;
            }

            // Prüfen ob Response OK ist (auch wenn JSON geparst wurde)
            if (!response.ok) {
                const errorMsg = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
                console.error('E-Mail-Versendung HTTP-Fehler:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorMsg,
                    fullResponse: data
                });
                alert('Fehler beim Senden: ' + errorMsg);
                return;
            }

            // Immer die vollständige Response in der Console ausgeben
            console.log('E-Mail-Versendung Response:', data);
            
            if (data.success) {
                this.closeSendModal();
                if (data.sent_count > 0) {
                    let message = `E-Mail(s) erfolgreich gesendet! (${data.sent_count} von ${data.total_recipients})`;
                    if (data.failed_count > 0) {
                        message += `\n\n${data.failed_count} fehlgeschlagen.`;
                        if (data.errors && data.errors.length > 0) {
                            message += '\n\nFehler:\n' + data.errors.slice(0, 5).join('\n');
                            if (data.errors.length > 5) {
                                message += `\n... und ${data.errors.length - 5} weitere.`;
                            }
                            // Fehler auch in Console ausgeben
                            console.error('E-Mail-Versendung Fehler:', data.errors);
                        }
                    }
                    alert(message);
                } else {
                    alert('Keine E-Mails wurden gesendet.');
                    if (data.errors && data.errors.length > 0) {
                        console.error('E-Mail-Versendung Fehler:', data.errors);
                    }
                }
            } else {
                const errorMsg = data.error || data.message || 'Unbekannter Fehler';
                console.error('E-Mail-Versendung Fehler:', errorMsg);
                console.error('Vollständige Response:', data);
                alert('Fehler beim Senden: ' + errorMsg);
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Fehler beim Senden der E-Mail: ' + (error.message || 'Netzwerkfehler oder Server nicht erreichbar'));
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatDate(dateString) {
        if (!dateString) return 'Unbekannt';
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    emailTemplatesManager.init();
});

