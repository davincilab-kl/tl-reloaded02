// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date
function formatDate(dateString) {
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

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Get status label
function getStatusLabel(status) {
    const labels = {
        'pending': 'Ausstehend',
        'paid': 'Bezahlt',
        'completed': 'Abgeschlossen',
        'cancelled': 'Storniert'
    };
    return labels[status] || status;
}

// Get status class
function getStatusClass(status) {
    const classes = {
        'pending': 'status-pending',
        'paid': 'status-paid',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return classes[status] || '';
}

// Get provisioning type label
function getProvisioningTypeLabel(type) {
    const labels = {
        'funded': 'Gefördert',
        'invoice': 'Rechnung',
        'uew': 'Unterrichtsmittel eigener Wahl'
    };
    return labels[type] || type;
}

// Load orders
async function loadOrders() {
    const ordersContent = document.getElementById('orders-content');
    if (!ordersContent) return;

    ordersContent.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Bestellungen...</span>
        </div>
    `;

    try {
        const response = await fetch('/api/classes/get_class_orders.php');
        const data = await response.json();

        if (!data.success) {
            ordersContent.innerHTML = `
                <div class="error-messages">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Fehler beim Laden der Bestellungen: ${escapeHtml(data.error || 'Unbekannter Fehler')}</span>
                </div>
            `;
            return;
        }

        const orders = data.orders || [];

        if (orders.length === 0) {
            ordersContent.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Keine Bestellungen vorhanden</span>
                </div>
            `;
            return;
        }

        ordersContent.innerHTML = `
            <div class="orders-list">
                ${orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-header-left">
                                <h3 class="order-title">Bestellung #${order.order_id}</h3>
                                <span class="order-date">${formatDate(order.created_at)}</span>
                            </div>
                            <div class="order-header-right">
                                <span class="order-status ${getStatusClass(order.status)}">${getStatusLabel(order.status)}</span>
                            </div>
                        </div>
                        <div class="order-body">
                            ${order.school_year_name ? `
                                <div class="order-info-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>Schuljahr: ${escapeHtml(order.school_year_name)}</span>
                                </div>
                            ` : ''}
                            <div class="order-info-item">
                                <i class="fas fa-user"></i>
                                <span>Bestellt von: ${escapeHtml(order.ordered_by)}</span>
                            </div>
                            <div class="order-items">
                                <h4 class="order-items-title">Bestellpositionen:</h4>
                                <table class="order-items-table">
                                    <thead>
                                        <tr>
                                            <th>Klasse</th>
                                            <th>Kurspaket</th>
                                            <th>Bereitstellung</th>
                                            <th>Schüler</th>
                                            <th>Preis pro Schüler</th>
                                            <th>Gesamtpreis</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>${escapeHtml(item.class_name)}</td>
                                                <td>${escapeHtml(item.package_name)}</td>
                                                <td>${getProvisioningTypeLabel(item.provisioning_type)}</td>
                                                <td>${item.student_count}</td>
                                                <td>${formatCurrency(item.price_per_student)}</td>
                                                <td>${formatCurrency(item.item_price_with_tax)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="order-summary">
                                <div class="order-summary-item">
                                    <span class="summary-label">Gesamt Schüler:</span>
                                    <span class="summary-value">${order.total_students}</span>
                                </div>
                                <div class="order-summary-item">
                                    <span class="summary-label">Gesamtpreis (netto):</span>
                                    <span class="summary-value">${formatCurrency(order.total_price)}</span>
                                </div>
                                <div class="order-summary-item">
                                    <span class="summary-label">Gesamtpreis (brutto):</span>
                                    <span class="summary-value summary-total">${formatCurrency(order.total_price_with_tax)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Fehler beim Laden der Bestellungen:', error);
        ordersContent.innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-circle"></i>
                <span>Fehler beim Laden der Bestellungen. Bitte versuchen Sie es später erneut.</span>
            </div>
        `;
    }
}

// Package Selection Handler
document.addEventListener('DOMContentLoaded', function() {
    const packageButtons = document.querySelectorAll('.package-selector-btn');
    const packageContent = document.getElementById('package-content');

    packageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const packageId = this.getAttribute('data-package');
            
            // Update active state
            packageButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update package content visibility
            if (packageContent) {
                packageContent.setAttribute('data-package', packageId);
            }
            
            // Scroll to top of content
            if (packageContent) {
                packageContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Initialize: Show first package by default
    if (packageButtons.length > 0 && !document.querySelector('.package-selector-btn.active')) {
        packageButtons[0].classList.add('active');
    }

    // Load orders if on orders page
    if (document.getElementById('orders-content')) {
        loadOrders();
    }
});
