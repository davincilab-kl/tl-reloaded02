// Meine Kurse

async function getCurrentUserId() {
    try {
        const response = await fetch('/api/auth/get_current_user.php');
        const data = await response.json();
        if (data.success && data.user_id) {
            return data.user_id;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der User-ID:', error);
    }
    // Fallback auf localStorage für Kompatibilität
    return localStorage.getItem('teacher_user_id') || null;
}

function getTeacherUserId() {
    // Diese Funktion wird für Kompatibilität beibehalten
    return localStorage.getItem('teacher_user_id') || null;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let currentStudentId = null;

// Lade zuerst den ersten Schüler der Lehrkraft
async function loadFirstStudent() {
    const userId = await getCurrentUserId();
    if (!userId) {
        document.getElementById('courses-content').innerHTML = '<div class="error-messages">Keine User-ID gefunden</div>';
        return;
    }

    try {
        const response = await fetch(`/api/students/get_first_student.php?user_id=${userId}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            document.getElementById('courses-content').innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error)}</div>`;
            return;
        }

        currentStudentId = data.student.id;
        await loadCourses();
    } catch (error) {
        console.error('Fehler beim Laden des Schülers:', error);
        document.getElementById('courses-content').innerHTML = '<div class="error-messages">Fehler beim Laden des Schülers</div>';
    }
}

// Lade alle Kurse
async function loadCourses() {
    const coursesContent = document.getElementById('courses-content');
    coursesContent.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Kurse...</span>
        </div>
    `;

    try {
        const response = await fetch('/api/courses/get_courses.php');
        const data = await response.json();

        if (data.error) {
            coursesContent.innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error)}</div>`;
            return;
        }

        if (data.courses.length === 0) {
            coursesContent.innerHTML = '<div class="no-messages">Keine Kurse verfügbar</div>';
            return;
        }

        // Rendere Kurs-Karten
        coursesContent.innerHTML = '<div class="courses-grid"></div>';
        const coursesGrid = coursesContent.querySelector('.courses-grid');

        data.courses.forEach(course => {
            const courseCard = document.createElement('a');
            courseCard.className = 'course-card';
            courseCard.href = `/students/courses/view.php?course_id=${course.id}`;
            
            // Bestimme das Bild-Pfad
            let imageHtml = '';
            if (course.cover_path) {
                const imagePath = `/students/courses/imgs/course-covers/${escapeHtml(course.cover_path)}`;
                imageHtml = `<img src="${imagePath}" alt="${escapeHtml(course.title)}" class="course-cover-image">`;
            } else {
                // Fallback auf Icon wenn kein Bild vorhanden
                imageHtml = '<i class="fas fa-book"></i>';
            }
            
            // Fortschrittsbalken HTML
            const progress = course.progress || 0;
            const progressBarHtml = `
                <div class="course-footer">
                    <div class="course-progress">
                        <div class="course-progress-bar">
                            <div class="course-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="course-progress-text">${progress}%</span>
                    </div>
                </div>
            `;
            
            courseCard.innerHTML = `
                <div class="course-image">
                    ${imageHtml}
                </div>
                <div class="course-content">
                    <h3 class="course-title">${escapeHtml(course.title)}</h3>
                    <p class="course-description">${escapeHtml(course.description || 'Keine Beschreibung verfügbar')}</p>
                </div>
                ${progressBarHtml}
            `;
            coursesGrid.appendChild(courseCard);
        });

    } catch (error) {
        console.error('Fehler beim Laden der Kurse:', error);
        coursesContent.innerHTML = '<div class="error-messages">Fehler beim Laden der Kurse</div>';
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    loadFirstStudent();
});
