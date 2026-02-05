// Challenges Seite

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let selectedChallengeId = null;

// Lade alle Challenges
async function loadChallenges() {
    const challengesContent = document.getElementById('challenges-content');
    challengesContent.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Challenges...</span>
        </div>
    `;

    try {
        const response = await fetch('/api/challenges/get_challenges.php');
        const data = await response.json();

        if (data.error) {
            challengesContent.innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error)}</div>`;
            return;
        }

        if (!data.success || !data.challenges || data.challenges.length === 0) {
            challengesContent.innerHTML = '<div class="no-messages">Aktuell sind keine Challenges verfügbar. Schau später nochmal vorbei!</div>';
            return;
        }

        // Rendere Challenge-Karten
        challengesContent.innerHTML = '<div class="challenges-grid"></div>';
        const challengesGrid = challengesContent.querySelector('.challenges-grid');

        data.challenges.forEach(challenge => {
            const challengeCard = document.createElement('div');
            challengeCard.className = 'challenge-card';
            challengeCard.onclick = () => showChallengeDetails(challenge.id);
            
            // Bestimme Icon basierend auf challenge_type
            let iconClass = 'fa-trophy';
            if (challenge.challenge_type === 'tscore') {
                iconClass = 'fa-chart-line';
            } else if (challenge.challenge_type === 'projects') {
                iconClass = 'fa-star';
            }
            
            const imageHtml = challenge.image_path 
                ? `<img src="/challenges/imgs/${escapeHtml(challenge.image_path)}" alt="${escapeHtml(challenge.title)}" style="width: 100%; height: 100%; object-fit: cover;">`
                : `<i class="fas ${iconClass}"></i>`;
            
            challengeCard.innerHTML = `
                <div class="challenge-card-image">
                    ${imageHtml}
                </div>
                <div class="challenge-card-content">
                    <h3 class="challenge-card-title">${escapeHtml(challenge.title)}</h3>
                    <div class="challenge-card-meta">
                        ${challenge.end_date ? `<span class="challenge-card-date"><i class="far fa-calendar"></i> Bis ${escapeHtml(new Date(challenge.end_date).toLocaleDateString('de-DE'))}</span>` : ''}
                    </div>
                    <div class="challenge-card-filters">
                        ${challenge.state_filter ? `<span class="challenge-filter-badge"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(challenge.state_filter)}</span>` : '<span class="challenge-filter-badge"><i class="fas fa-map-marker-alt"></i> Österreichweit</span>'}
                        ${challenge.sponsor_filter ? `<span class="challenge-filter-badge"><i class="fas fa-hand-holding-usd"></i> ${escapeHtml(challenge.sponsor_filter)}</span>` : ''}
                    </div>
                </div>
            `;
            challengesGrid.appendChild(challengeCard);
        });

    } catch (error) {
        console.error('Fehler beim Laden der Challenges:', error);
        challengesContent.innerHTML = '<div class="error-messages">Fehler beim Laden der Challenges</div>';
    }
}

// Zeige Challenge-Details
async function showChallengeDetails(challengeId) {
    selectedChallengeId = challengeId;
    const detailsContainer = document.getElementById('challenge-details');
    const detailsBody = document.getElementById('challenge-details-body');
    
    detailsBody.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Details...</span>
        </div>
    `;
    detailsContainer.style.display = 'block';
    
    // Scroll zu Details
    detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
        const response = await fetch(`/api/challenges/get_challenge_details.php?challenge_id=${challengeId}`);
        const data = await response.json();

        if (data.error || !data.success) {
            detailsBody.innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error || 'Unbekannter Fehler')}</div>`;
            return;
        }

        const challenge = data.challenge;
        const entries = data.entries || [];

        let entriesHtml = '';
        if (entries.length === 0) {
            entriesHtml = '<div class="no-messages">Noch keine Projekte für diese Challenge teilgenommen.</div>';
        } else {
            if (challenge.challenge_type === 'tscore') {
                // T!Score-Challenge: Mit Rangliste
                entriesHtml = '<div class="entries-list">';
                entries.forEach((entry, index) => {
                    const rank = index + 1;
                    let rankClass = '';
                    if (rank === 1) rankClass = 'rank-1';
                    else if (rank === 2) rankClass = 'rank-2';
                    else if (rank === 3) rankClass = 'rank-3';
                    
                    entriesHtml += `
                        <div class="entry-item">
                            <div class="entry-rank ${rankClass}">#${rank}</div>
                            <div class="entry-info">
                                <div class="entry-name">${escapeHtml(entry.class_name || 'Unbekannte Klasse')}</div>
                            </div>
                            <div class="entry-score">${entry.avg_t_coins || 0} T!Score</div>
                        </div>
                    `;
                });
                entriesHtml += '</div>';
            } else if (challenge.challenge_type === 'projects') {
                // Projekt-Challenge: Alle Projekte ohne Rangliste
                entriesHtml = '<div class="projects-list">';
                entries.forEach((entry) => {
                    const projectLink = entry.link ? `<a href="${escapeHtml(entry.link)}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fas fa-external-link-alt"></i> Projekt ansehen</a>` : '';
                    
                    entriesHtml += `
                        <div class="project-item">
                            <div class="project-info">
                                <div class="project-title">${escapeHtml(entry.project_title || 'Unbekanntes Projekt')}</div>
                                ${entry.description ? `<div class="project-description">${escapeHtml(entry.description)}</div>` : ''}
                                ${entry.student_name ? `<div class="project-author"><i class="fas fa-user"></i> ${escapeHtml(entry.student_name)}</div>` : ''}
                                ${projectLink}
                            </div>
                        </div>
                    `;
                });
                entriesHtml += '</div>';
            }
        }

        const imageSection = challenge.image_path 
            ? `<div class="challenge-details-image">
                <img src="/challenges/imgs/${escapeHtml(challenge.image_path)}" alt="${escapeHtml(challenge.title)}">
               </div>`
            : '<div class="challenge-details-image-placeholder"><i class="fas fa-trophy"></i></div>';
        
        detailsBody.innerHTML = `
            <div class="challenge-details-header">
                ${imageSection}
                <div class="challenge-details-content">
                    <h2 class="challenge-details-title">${escapeHtml(challenge.title)}</h2>
                    <p class="challenge-details-description">${escapeHtml(challenge.description || 'Keine Beschreibung verfügbar')}</p>
                    <div class="challenge-details-meta">
                        ${challenge.start_date ? `<span class="challenge-meta-item"><i class="far fa-calendar-alt"></i> Start: ${escapeHtml(new Date(challenge.start_date).toLocaleDateString('de-DE'))}</span>` : ''}
                        ${challenge.end_date ? `<span class="challenge-meta-item"><i class="far fa-calendar"></i> Ende: ${escapeHtml(new Date(challenge.end_date).toLocaleDateString('de-DE'))}</span>` : ''}
                        ${challenge.state_filter ? `<span class="challenge-meta-item challenge-filter-badge"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(challenge.state_filter)}</span>` : ''}
                        ${challenge.sponsor_filter ? `<span class="challenge-meta-item challenge-filter-badge"><i class="fas fa-hand-holding-usd"></i> Sponsor: ${escapeHtml(challenge.sponsor_filter)}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="challenge-entries-section">
                <h3 class="challenge-entries-title">
                    ${challenge.challenge_type === 'tscore' ? 'Top Klassen' : 'Teilnehmende Projekte'}
                </h3>
                ${entriesHtml}
            </div>
        `;

    } catch (error) {
        console.error('Fehler beim Laden der Challenge-Details:', error);
        detailsBody.innerHTML = '<div class="error-messages">Fehler beim Laden der Details</div>';
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    loadChallenges();
});

