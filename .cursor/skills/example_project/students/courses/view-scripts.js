// Kurs-Detailseite

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let courseData = null;
let lectionsData = [];
let currentLectionId = null;
// Mache currentLectionId global verfügbar für Scripts in Lektions-Texten
window.currentLectionId = null;

// Lade Kurs-Details
async function loadCourse() {
    try {
        const response = await fetch(`/api/courses/get_course.php?course_id=${courseId}`);
        const data = await response.json();

        if (data.error) {
            document.getElementById('course-title').innerHTML = `<span>Fehler: ${escapeHtml(data.error)}</span>`;
            return;
        }

        courseData = data.course;
        document.getElementById('course-title').innerHTML = `
            <i class="fas fa-book"></i> <span>${escapeHtml(courseData.title)}</span>
        `;

        // Zeige Kurs-Intro, wenn vorhanden
        if (courseData.text) {
            const introDiv = document.getElementById('course-intro');
            const introTextElement = document.getElementById('course-intro-text');
            introTextElement.innerHTML = courseData.text;
            
            // Setze Hintergrundbild, falls vorhanden
            if (courseData.background_path && courseData.background_path.trim() !== '') {
                const imagePath = `/students/courses/imgs/course-covers/${escapeHtml(courseData.background_path)}`;
                introTextElement.classList.add('course-intro-bg-image');
                introTextElement.style.setProperty('--background-image-url', `url('${imagePath}')`);
            }
            
            // Führe Scripts aus, die im HTML enthalten sind
            const scripts = introTextElement.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                // Kopiere alle Attribute
                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                // Kopiere den Inhalt
                newScript.textContent = oldScript.textContent;
                // Ersetze das alte Script durch das neue (wird ausgeführt)
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
            
            introDiv.style.display = 'block';
            document.getElementById('no-content').style.display = 'none';
            
            // Event-Listener für Start-Button hinzufügen
            setupStartCourseButton();
        }

    } catch (error) {
        console.error('Fehler beim Laden des Kurses:', error);
        document.getElementById('course-title').innerHTML = '<span>Fehler beim Laden des Kurses</span>';
    }
}

// Lade Lektionen
async function loadLections() {
    const lectionsList = document.getElementById('lections-list');
    
    try {
        const response = await fetch(`/api/courses/get_lections.php?course_id=${courseId}`);
        const data = await response.json();

        if (data.error) {
            lectionsList.innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error)}</div>`;
            return;
        }

        lectionsData = data.lections;

        if (lectionsData.length === 0) {
            lectionsList.innerHTML = '<div class="no-messages">Keine Lektionen verfügbar</div>';
            return;
        }
        
        // Stelle sicher, dass Start-Button funktioniert (falls Kurs-Text bereits geladen wurde)
        setupStartCourseButton();

        // Rendere Lektionsliste
        lectionsList.innerHTML = '';
        lectionsData.forEach(lection => {
            const lectionItem = document.createElement('div');
            lectionItem.className = 'lection-item';
            lectionItem.dataset.lectionId = lection.id;
            const completedIcon = lection.is_completed 
                ? '<i class="fas fa-check-circle lection-completed-icon"></i>' 
                : '';
            lectionItem.innerHTML = `
                <div class="lection-item-number">${lection.order}</div>
                <div class="lection-item-title">${escapeHtml(lection.title)}</div>
                ${completedIcon}
            `;
            if (lection.is_completed) {
                lectionItem.classList.add('lection-completed');
            }
            lectionItem.addEventListener('click', () => showLection(lection.id));
            lectionsList.appendChild(lectionItem);
        });

    } catch (error) {
        console.error('Fehler beim Laden der Lektionen:', error);
        lectionsList.innerHTML = '<div class="error-messages">Fehler beim Laden der Lektionen</div>';
    }
}

// Zeige Lektion
async function showLection(lectionId) {
    currentLectionId = lectionId;
    window.currentLectionId = lectionId; // Aktualisiere auch globale Variable
    
    // Aktiviere Lektion in der Liste
    document.querySelectorAll('.lection-item').forEach(item => {
        if (parseInt(item.dataset.lectionId) === lectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Finde Lektion
    const lection = lectionsData.find(l => l.id === lectionId);
    if (!lection) {
        return;
    }

    // Zeige Lektionsinhalt
    const lectionTitleElement = document.getElementById('lection-title');
    lectionTitleElement.textContent = lection.title;
    
    // Entferne vorhandene Badge falls vorhanden
    const existingBadge = lectionTitleElement.querySelector('.lection-completed-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Füge "abgeschlossen" Badge hinzu, wenn Lektion abgeschlossen ist
    if (lection.is_completed) {
        const badge = document.createElement('span');
        badge.className = 'lection-completed-badge';
        badge.innerHTML = '<i class="fas fa-check-circle"></i> abgeschlossen';
        lectionTitleElement.appendChild(badge);
    }
    
    document.getElementById('lection-text').innerHTML = lection.text || '<p>Kein Inhalt verfügbar.</p>';
    
    // Führe Scripts aus, die im HTML enthalten sind
    const lectionTextElement = document.getElementById('lection-text');
    if (lectionTextElement) {
        const scripts = lectionTextElement.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            // Kopiere alle Attribute
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            // Kopiere den Inhalt
            newScript.textContent = oldScript.textContent;
            // Ersetze das alte Script durch das neue (wird ausgeführt)
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }
    
    // Ersetze Vimeo-Iframes durch Placeholder-Bild
    setTimeout(() => {
        const lectionText = document.getElementById('lection-text');
        if (lectionText) {
            const vimeoIframes = lectionText.querySelectorAll('iframe[src*="vimeo"], iframe[src*="player.vimeo"]');
            vimeoIframes.forEach(iframe => {
                // Hole ursprüngliche Größe des Iframes
                const originalWidth = iframe.offsetWidth || 640;
                const originalHeight = iframe.offsetHeight || 360;
                const placeholder = document.createElement('img');
                placeholder.src = '/students/courses/imgs/vimeo_placeholder.png';
                placeholder.alt = 'Vimeo Video Placeholder';
                placeholder.style.width = originalWidth + 'px';
                placeholder.style.maxWidth = '100%';
                placeholder.style.height = 'auto';
                placeholder.style.display = 'block';
                placeholder.style.margin = '20px auto';
                placeholder.className = 'vimeo-placeholder';
                iframe.parentNode.replaceChild(placeholder, iframe);
            });
        }
    }, 100);
    
    // Verstecke Intro und No-Content, zeige Lektionsinhalt
    document.getElementById('course-intro').style.display = 'none';
    document.getElementById('no-content').style.display = 'none';
    document.getElementById('lection-content').style.display = 'flex';
    
    // Setze box-shadow basierend auf Completion-Status
    const contentArea = document.querySelector('.course-content-area');
    if (lection.is_completed) {
        contentArea.classList.add('lection-completed');
    } else {
        contentArea.classList.remove('lection-completed');
    }

    // Lade Quiz
    await loadQuiz(lectionId);
    
    // Zeige Navigation (Weiter-Button oder Ende-Hinweis)
    showLectionNavigation(lectionId);

    // Scroll zur Seite nach oben
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Zeige Navigation am Ende der Lektion
function showLectionNavigation(lectionId) {
    const navigationContainer = document.getElementById('lection-navigation');
    if (!navigationContainer) return;
    
    // Finde aktuelle Lektion
    const currentLection = lectionsData.find(l => l.id === lectionId);
    if (!currentLection) return;
    
    // Sortiere Lektionen nach order
    const sortedLections = [...lectionsData].sort((a, b) => a.order - b.order);
    
    // Finde Index der aktuellen Lektion
    const currentIndex = sortedLections.findIndex(l => l.id === lectionId);
    
    // Prüfe ob es eine nächste Lektion gibt
    if (currentIndex < sortedLections.length - 1) {
        // Es gibt eine nächste Lektion
        const nextLection = sortedLections[currentIndex + 1];
        navigationContainer.innerHTML = `
            <div class="lection-navigation-content">
                <button id="next-lection-btn" class="btn-secondary">
                    <div class="btn-next-lection-text-wrapper">
                        <span class="btn-next-lection-text">Weiter zur nächsten Lektion</span>
                        <span class="btn-next-lection-title">${escapeHtml(nextLection.title)}</span>
                    </div>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        document.getElementById('next-lection-btn').addEventListener('click', () => {
            showLection(nextLection.id);
        });
    } else {
        // Letzte Lektion - zeige Ende-Hinweis
        navigationContainer.innerHTML = `
            <div class="lection-navigation-content">
                <div class="course-end-message">
                    <i class="fas fa-check-circle"></i>
                    <h3>Kurs abgeschlossen!</h3>
                    <p>Du hast alle Lektionen dieses Kurses durchgearbeitet.</p>
                </div>
            </div>
        `;
    }
}

// Lade Quiz für Lektion
async function loadQuiz(lectionId) {
    let quizButtonContainer = document.getElementById('quiz-button-container');
    if (!quizButtonContainer) {
        // Erstelle Button-Container falls nicht vorhanden
        const lectionContent = document.getElementById('lection-content');
        const lectionNavigation = document.getElementById('lection-navigation');
        const buttonDiv = document.createElement('div');
        buttonDiv.id = 'quiz-button-container';
        buttonDiv.className = 'quiz-button-container';
        // Füge vor lection-navigation ein
        if (lectionNavigation) {
            lectionContent.insertBefore(buttonDiv, lectionNavigation);
        } else {
            lectionContent.appendChild(buttonDiv);
        }
        quizButtonContainer = buttonDiv;
    }
    quizButtonContainer.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i> <span>Lade Quiz...</span></div>';
    
    try {
        const response = await fetch(`/api/quiz/get_quiz.php?lection_id=${lectionId}`);
        const data = await response.json();
        
        if (data.error) {
            quizButtonContainer.innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error)}</div>`;
            return;
        }
        
        if (!data.has_quiz) {
            // Kein Quiz - prüfe ob bereits abgeschlossen
            const lection = lectionsData.find(l => l.id === lectionId);
            // Verwende is_completed aus API oder aus lectionsData
            const isAlreadyCompleted = data.is_completed || (lection && lection.is_completed);
            
            // Aktualisiere lectionsData mit dem Status aus der API
            if (lection && data.is_completed !== undefined) {
                lection.is_completed = data.is_completed;
            }
            
            if (isAlreadyCompleted) {
                // Bereits abgeschlossen - zeige nur Status, kein Button
                quizButtonContainer.innerHTML = `
                    <div class="quiz-section">
                        <div class="quiz-result quiz-passed">
                            <i class="fas fa-check-circle"></i>
                            <div class="quiz-result-text">
                                <strong>Lektion abgeschlossen</strong>
                                <p>Diese Lektion wurde bereits als erledigt markiert.</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Nicht abgeschlossen - zeige "Lektion erledigt" Button
                quizButtonContainer.innerHTML = `
                    <div class="quiz-no-quiz">
                        <p>Diese Lektion hat kein Quiz.</p>
                        <button id="mark-lection-complete-btn" class="btn-mark-complete">
                            <i class="fas fa-check-circle"></i> Lektion abschließen
                        </button>
                    </div>
                `;
                
                document.getElementById('mark-lection-complete-btn').addEventListener('click', () => markLectionCompleteLegacy(lectionId));
            }
            return;
        }
        
        // Quiz vorhanden - prüfe ob bereits bestanden
        const lection = lectionsData.find(l => l.id === lectionId);
        
        // Aktualisiere lection.is_completed basierend auf API-Daten
        if (lection && data.already_completed && data.previous_result && data.previous_result.passed) {
            lection.is_completed = true;
            // Aktualisiere auch die Lektionsliste visuell
            const lectionItem = document.querySelector(`.lection-item[data-lection-id="${lectionId}"]`);
            if (lectionItem && !lectionItem.classList.contains('lection-completed')) {
                lectionItem.classList.add('lection-completed');
                if (!lectionItem.querySelector('.lection-completed-icon')) {
                    const completedIcon = document.createElement('i');
                    completedIcon.className = 'fas fa-check-circle lection-completed-icon';
                    lectionItem.appendChild(completedIcon);
                }
            }
            // Aktualisiere Badge beim Titel
            const lectionTitleElement = document.getElementById('lection-title');
            if (lectionTitleElement) {
                const existingBadge = lectionTitleElement.querySelector('.lection-completed-badge');
                if (!existingBadge) {
                    const badge = document.createElement('span');
                    badge.className = 'lection-completed-badge';
                    badge.innerHTML = '<i class="fas fa-check-circle"></i> abgeschlossen';
                    lectionTitleElement.appendChild(badge);
                }
            }
        }
        
        // Prüfe ob Lektion abgeschlossen ist - verwende API-Daten oder lection.is_completed als Fallback
        const isAlreadyCompleted = (data.already_completed && data.previous_result && data.previous_result.passed) || 
                                   (lection && lection.is_completed);
        
        let buttonText = 'Quiz starten';
        let buttonIcon = 'fa-play-circle';
        if (data.already_completed && data.previous_result) {
            if (data.previous_result.passed) {
                buttonText = 'Quiz erneut machen';
                buttonIcon = 'fa-redo';
            } else {
                buttonText = 'Quiz wiederholen';
                buttonIcon = 'fa-redo';
            }
        } else if (isAlreadyCompleted) {
            // Lektion ist abgeschlossen, aber previous_result nicht verfügbar
            buttonText = 'Quiz erneut machen';
            buttonIcon = 'fa-redo';
        }
        
        if (isAlreadyCompleted) {
            // Lektion bereits abgeschlossen - zeige Status wie bei normalen Lektionen + Wiederholungsoption
            quizButtonContainer.innerHTML = `
                <div class="quiz-section">
                    <div class="quiz-result quiz-passed">
                        <i class="fas fa-check-circle"></i>
                        <div class="quiz-result-text">
                            <strong>Lektion abgeschlossen</strong>
                            <p>Diese Lektion wurde bereits erfolgreich abgeschlossen.</p>
                        </div>
                    </div>
                    <div class="quiz-retry-section">
                        <button id="open-quiz-btn" class="btn-open-quiz">
                            <img src="/students/courses/imgs/quiz.png" alt="Quiz" class="quiz-icon"> ${buttonText}
                        </button>
                    </div>
                </div>
            `;
            // Event Listener für Button
            document.getElementById('open-quiz-btn').addEventListener('click', () => openQuizModal(data));
        } else {
            // Nicht abgeschlossen oder nicht bestanden - zeige nur Button
            quizButtonContainer.innerHTML = `
                <button id="open-quiz-btn" class="btn-open-quiz">
                    <img src="/students/courses/imgs/quiz.png" alt="Quiz" class="quiz-icon"> ${buttonText}
                </button>
            `;
            // Event Listener für Button
            document.getElementById('open-quiz-btn').addEventListener('click', () => openQuizModal(data));
        }
        
        // Speichere Quiz-Daten für später
        window.currentQuizData = data;
        
    } catch (error) {
        console.error('Fehler beim Laden des Quiz:', error);
        quizButtonContainer.innerHTML = '<div class="error-messages">Fehler beim Laden des Quiz</div>';
    }
}

// Öffne Quiz-Modal
function openQuizModal(quizData) {
    const modal = document.getElementById('quiz-modal');
    const modalContainer = document.getElementById('quiz-modal-container');
    const modalTitle = document.getElementById('quiz-modal-title');
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Verhindere Scrollen im Hintergrund
    
    if (!quizData.has_quiz) {
        modalTitle.textContent = 'Lektion abschließen';
        modalContainer.innerHTML = `
            <div class="quiz-no-quiz">
                <p>Diese Lektion hat kein Quiz.</p>
                <button id="mark-lection-complete-btn-modal" class="btn-mark-complete">
                    <i class="fas fa-check-circle"></i> Lektion abschließen
                </button>
            </div>
        `;
        document.getElementById('mark-lection-complete-btn-modal').addEventListener('click', () => {
            markLectionCompleteLegacy(currentLectionId);
            closeQuizModal();
        });
        return;
    }
    
    modalTitle.textContent = quizData.quiz.title || 'Quiz';
    // Starte immer direkt mit der ersten Frage, auch wenn Quiz bereits abgeschlossen wurde
    window.currentQuizAnswers = {}; // Setze Antworten zurück
    displayQuizFormInModal(quizData.quiz);
}

// Schließe Quiz-Modal
function closeQuizModal() {
    const modal = document.getElementById('quiz-modal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Erlaube Scrollen wieder
}

// Event Listener für Modal-Close
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('quiz-modal');
    const closeBtn = document.getElementById('quiz-modal-close');
    const overlay = modal.querySelector('.quiz-modal-overlay');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeQuizModal);
    }
    if (overlay) {
        overlay.addEventListener('click', closeQuizModal);
    }
    
    // ESC-Taste zum Schließen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeQuizModal();
        }
    });
});

// Zeige Quiz im Modal
function displayQuizInModal(quiz, alreadyCompleted, previousResult) {
    const modalContainer = document.getElementById('quiz-modal-container');
    
    if (alreadyCompleted && previousResult) {
        // Quiz bereits abgeschlossen - zeige Ergebnis mit Option zum erneuten Versuch
        const passedClass = previousResult.passed ? 'quiz-passed' : 'quiz-failed';
        modalContainer.innerHTML = `
            <div class="quiz-section">
                <div class="quiz-result ${passedClass}">
                    <i class="fas ${previousResult.passed ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    <div class="quiz-result-text">
                        <strong>${previousResult.passed ? 'Bestanden!' : 'Nicht bestanden'}</strong>
                        <p>Letztes Ergebnis: ${previousResult.points_earned} von ${previousResult.points_total} Punkten erreicht</p>
                    </div>
                </div>
                <div class="quiz-retry-section">
                    <button id="retry-quiz-btn-modal" class="btn-retry-quiz">
                        <i class="fas fa-redo"></i> Quiz erneut machen
                    </button>
                </div>
            </div>
        `;
        
        // Event Listener für erneuten Versuch - starte direkt mit der ersten Frage
        document.getElementById('retry-quiz-btn-modal').addEventListener('click', () => {
            // Setze Antworten zurück
            window.currentQuizAnswers = {};
            displayQuizFormInModal(quiz);
        });
        return;
    }
    
    displayQuizFormInModal(quiz);
}

// Zeige Quiz-Formular im Modal (eine Frage nach der anderen)
function displayQuizFormInModal(quiz) {
    const modalContainer = document.getElementById('quiz-modal-container');
    
    // Speichere Quiz-Daten global
    window.currentQuiz = quiz;
    window.currentQuizAnswers = {};
    window.currentQuestionIndex = 0;
    
    // Quiz-Container erstellen
    modalContainer.innerHTML = `
        <div class="quiz-section">
            <div class="quiz-progress">
                <div class="quiz-progress-bar">
                    <div class="quiz-progress-fill" id="quiz-progress-fill"></div>
                </div>
                <span class="quiz-progress-text" id="quiz-progress-text">Frage 1 von ${quiz.questions.length}</span>
            </div>
            <form id="quiz-form-modal">
                <div id="quiz-question-container"></div>
                <div class="quiz-form-actions">
                    <button type="button" class="btn-cancel-quiz" onclick="closeQuizModal()">
                        <i class="fas fa-times"></i> Abbrechen
                    </button>
                    <button type="button" class="btn-prev-question" id="btn-prev-question" style="display: none;">
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    <button type="button" class="btn-next-question" id="btn-next-question">
                        <i class="fas fa-arrow-right"></i> Weiter
                    </button>
                    <button type="submit" class="btn-submit-quiz" id="btn-submit-quiz" style="display: none;">
                        <i class="fas fa-paper-plane"></i> Quiz absenden
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Zeige erste Frage
    showQuestion(0);
    
    // Event Listener
    document.getElementById('btn-prev-question').addEventListener('click', () => {
        saveCurrentAnswer();
        showQuestion(window.currentQuestionIndex - 1);
    });
    
    document.getElementById('btn-next-question').addEventListener('click', () => {
        saveCurrentAnswer();
        if (window.currentQuestionIndex < quiz.questions.length - 1) {
            showQuestion(window.currentQuestionIndex + 1);
        }
    });
    
    document.getElementById('quiz-form-modal').addEventListener('submit', (e) => {
        e.preventDefault();
        saveCurrentAnswer();
        submitQuiz(quiz.id, quiz.questions);
    });
}

// Zeige eine bestimmte Frage
function showQuestion(index) {
    const quiz = window.currentQuiz;
    if (index < 0 || index >= quiz.questions.length) return;
    
    window.currentQuestionIndex = index;
    const question = quiz.questions[index];
    const questionContainer = document.getElementById('quiz-question-container');
    const progressFill = document.getElementById('quiz-progress-fill');
    const progressText = document.getElementById('quiz-progress-text');
    const btnPrev = document.getElementById('btn-prev-question');
    const btnNext = document.getElementById('btn-next-question');
    const btnSubmit = document.getElementById('btn-submit-quiz');
    
    // Update Progress
    const progress = ((index + 1) / quiz.questions.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `Frage ${index + 1} von ${quiz.questions.length}`;
    
    // Zeige Frage
    questionContainer.innerHTML = renderQuestion(question, index);
    
    // Lade gespeicherte Antwort, falls vorhanden
    loadSavedAnswer(question.id, question.type);
    
    // Update Navigation-Buttons
    btnPrev.style.display = index > 0 ? 'inline-flex' : 'none';
    btnNext.style.display = index < quiz.questions.length - 1 ? 'inline-flex' : 'none';
    btnSubmit.style.display = index === quiz.questions.length - 1 ? 'inline-flex' : 'none';
}

// Speichere aktuelle Antwort
function saveCurrentAnswer() {
    const quiz = window.currentQuiz;
    const currentQuestion = quiz.questions[window.currentQuestionIndex];
    const questionId = currentQuestion.id;
    const questionType = currentQuestion.type;
    const questionData = currentQuestion.question_data || {};
    
    let answer = null;
    
    switch (questionType) {
        case 'multiple_choice':
            const checkboxes = document.querySelectorAll(`input[name="question_${questionId}"]:checked`);
            const selected = Array.from(checkboxes).map(cb => parseInt(cb.value));
            if (selected.length > 0) {
                answer = { selected_option_indices: selected };
            }
            break;
            
        case 'single_choice':
            const radio = document.querySelector(`input[name="question_${questionId}"]:checked`);
            if (radio) {
                answer = { selected_option_index: parseInt(radio.value) };
            }
            break;
            
        case 'true_false':
            const trueFalseRadio = document.querySelector(`input[name="question_${questionId}"]:checked`);
            if (trueFalseRadio) {
                answer = { answer: trueFalseRadio.value === 'true' };
            }
            break;
            
        case 'text':
            const textarea = document.querySelector(`textarea[name="question_${questionId}"]`);
            if (textarea && textarea.value.trim()) {
                answer = { text: textarea.value.trim() };
            }
            break;
    }
    
    if (answer) {
        window.currentQuizAnswers[questionId] = answer;
    }
}

// Lade gespeicherte Antwort
function loadSavedAnswer(questionId, questionType) {
    const savedAnswer = window.currentQuizAnswers[questionId];
    if (!savedAnswer) return;
    
    switch (questionType) {
        case 'multiple_choice':
            if (savedAnswer.selected_option_indices) {
                savedAnswer.selected_option_indices.forEach(idx => {
                    const checkbox = document.querySelector(`input[name="question_${questionId}"][value="${idx}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            break;
            
        case 'single_choice':
            if (savedAnswer.selected_option_index !== undefined) {
                const radio = document.querySelector(`input[name="question_${questionId}"][value="${savedAnswer.selected_option_index}"]`);
                if (radio) radio.checked = true;
            }
            break;
            
        case 'true_false':
            if (savedAnswer.answer !== undefined) {
                const value = savedAnswer.answer ? 'true' : 'false';
                const radio = document.querySelector(`input[name="question_${questionId}"][value="${value}"]`);
                if (radio) radio.checked = true;
            }
            break;
            
        case 'text':
            if (savedAnswer.text) {
                const textarea = document.querySelector(`textarea[name="question_${questionId}"]`);
                if (textarea) textarea.value = savedAnswer.text;
            }
            break;
    }
}


// Rendere einzelne Frage
function renderQuestion(question, index) {
    let html = `
        <div class="quiz-question" data-question-id="${question.id}">
            <div class="question-header">
                <span class="question-number">Frage ${index + 1}</span>
                <span class="question-points">${question.points} ${question.points === 1 ? 'Punkt' : 'Punkte'}</span>
            </div>
            ${question.title ? `<h4 class="question-title">${escapeHtml(question.title)}</h4>` : ''}
            ${question.text ? `<p class="question-text">${escapeHtml(question.text)}</p>` : ''}
            <div class="question-answer">
    `;
    
    const questionData = question.question_data || {};
    
    switch (question.type) {
        case 'multiple_choice':
            const options = questionData.options || [];
            options.forEach((option, optIndex) => {
                html += `
                    <label class="option-label">
                        <input type="checkbox" name="question_${question.id}" value="${optIndex}">
                        <span>${escapeHtml(option.text)}</span>
                    </label>
                `;
            });
            break;
            
        case 'single_choice':
            const singleOptions = questionData.options || [];
            singleOptions.forEach((option, optIndex) => {
                html += `
                    <label class="option-label">
                        <input type="radio" name="question_${question.id}" value="${optIndex}">
                        <span>${escapeHtml(option.text)}</span>
                    </label>
                `;
            });
            break;
            
        case 'true_false':
            html += `
                <label class="option-label">
                    <input type="radio" name="question_${question.id}" value="true">
                    <span>Richtig</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="question_${question.id}" value="false">
                    <span>Falsch</span>
                </label>
            `;
            break;
            
        case 'text':
            const maxLength = questionData.max_length || 1000;
            html += `
                <textarea name="question_${question.id}" class="text-answer" 
                          maxlength="${maxLength}" 
                          placeholder="Ihre Antwort hier..."></textarea>
            `;
            break;
            
        default:
            html += `<p class="error-messages">Fragetyp "${question.type}" wird noch nicht unterstützt.</p>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Sende Quiz-Antworten
async function submitQuiz(quizId, questions) {
    const submitBtn = document.getElementById('btn-submit-quiz');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird ausgewertet...';
    
    // Verwende gespeicherte Antworten
    const answers = window.currentQuizAnswers || {};
    
    try {
        const response = await fetch('/api/quiz/submit_quiz_result.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quiz_id: quizId,
                answers: answers
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('Fehler: ' + data.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Quiz absenden';
            return;
        }
        
        // Zeige Ergebnis im Modal mit Option zum erneuten Versuch
        const modalContainer = document.getElementById('quiz-modal-container');
        const passedClass = data.passed ? 'quiz-passed' : 'quiz-failed';
        modalContainer.innerHTML = `
            <div class="quiz-section">
                <div class="quiz-result ${passedClass}">
                    <i class="fas ${data.passed ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    <div class="quiz-result-text">
                        <strong>${data.passed ? 'Bestanden!' : 'Nicht bestanden'}</strong>
                        <p>${data.points_earned} von ${data.points_total} Punkten erreicht (${data.percentage}%)</p>
                        <p class="quiz-threshold">Schwellenwert: ${data.threshold_percentage}%</p>
                    </div>
                </div>
                <div class="quiz-retry-section">
                    <button id="retry-quiz-btn-result" class="btn-retry-quiz">
                        <i class="fas fa-redo"></i> Quiz erneut machen
                    </button>
                    <button class="btn-close-quiz-result" onclick="closeQuizModal()">
                        <i class="fas fa-times"></i> Schließen
                    </button>
                </div>
            </div>
        `;
        
        // Event Listener für erneuten Versuch - starte direkt mit der ersten Frage
        document.getElementById('retry-quiz-btn-result').addEventListener('click', async () => {
            await loadQuiz(currentLectionId);
            const newData = window.currentQuizData;
            if (newData && newData.has_quiz) {
                // Setze Antworten zurück
                window.currentQuizAnswers = {};
                displayQuizFormInModal(newData.quiz);
            }
        });
        
        // Aktualisiere Lektionsliste wenn Quiz bestanden wurde
        if (data.passed) {
            const lectionItem = document.querySelector(`.lection-item[data-lection-id="${currentLectionId}"]`);
            if (lectionItem) {
                const lection = lectionsData.find(l => l.id === currentLectionId);
                if (lection) {
                    lection.is_completed = true;
                    lectionItem.classList.add('lection-completed');
                    if (!lectionItem.querySelector('.lection-completed-icon')) {
                        const completedIcon = document.createElement('i');
                        completedIcon.className = 'fas fa-check-circle lection-completed-icon';
                        lectionItem.appendChild(completedIcon);
                    }
                }
            }
            
            // Aktualisiere box-shadow der content-area
            const contentArea = document.querySelector('.course-content-area');
            if (contentArea) {
                contentArea.classList.add('lection-completed');
            }
            
            // Aktualisiere Badge beim Titel
            const lectionTitleElement = document.getElementById('lection-title');
            if (lectionTitleElement) {
                const existingBadge = lectionTitleElement.querySelector('.lection-completed-badge');
                if (!existingBadge) {
                    const badge = document.createElement('span');
                    badge.className = 'lection-completed-badge';
                    badge.innerHTML = '<i class="fas fa-check-circle"></i> abgeschlossen';
                    lectionTitleElement.appendChild(badge);
                }
            }
        }
        
    } catch (error) {
        console.error('Fehler beim Absenden des Quiz:', error);
        alert('Fehler beim Absenden des Quiz');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Quiz absenden';
    }
}

// Aktualisiere UI nach Lektionsabschluss (wiederverwendbar)
// Mache Funktion global verfügbar für Scripts in Lektions-Texten
window.updateLectionUI = function(lectionId) {
    // Aktualisiere Lektionsliste - markiere als abgeschlossen
    const lectionItem = document.querySelector(`.lection-item[data-lection-id="${lectionId}"]`);
    if (lectionItem) {
        const lection = lectionsData.find(l => l.id === lectionId);
        if (lection) {
            lection.is_completed = true;
            lectionItem.classList.add('lection-completed');
            if (!lectionItem.querySelector('.lection-completed-icon')) {
                const completedIcon = document.createElement('i');
                completedIcon.className = 'fas fa-check-circle lection-completed-icon';
                lectionItem.appendChild(completedIcon);
            }
        }
    }
    
    // Aktualisiere box-shadow der content-area
    const contentArea = document.querySelector('.course-content-area');
    if (contentArea) {
        contentArea.classList.add('lection-completed');
    }
    
    // Aktualisiere Badge beim Titel
    const lectionTitleElement = document.getElementById('lection-title');
    if (lectionTitleElement && currentLectionId === lectionId) {
        const existingBadge = lectionTitleElement.querySelector('.lection-completed-badge');
        if (!existingBadge) {
            const badge = document.createElement('span');
            badge.className = 'lection-completed-badge';
            badge.innerHTML = '<i class="fas fa-check-circle"></i> abgeschlossen';
            lectionTitleElement.appendChild(badge);
        }
    }
}

// Allgemeine Funktion zum Markieren einer Lektion als abgeschlossen
// options: { onSuccess, onError, showQuizResult, buttonElement }
// Mache Funktion global verfügbar für Scripts in Lektions-Texten
window.markLectionComplete = async function(lectionId, options = {}) {
    const {
        onSuccess = null,
        onError = null,
        showQuizResult = false,
        buttonElement = null
    } = options;
    
    // Button-Status aktualisieren, falls Button übergeben wurde
    if (buttonElement) {
        const originalText = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gespeichert...';
    }
    
    try {
        const response = await fetch('/api/quiz/mark_lection_complete.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lection_id: lectionId
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            const errorMsg = 'Fehler: ' + data.error;
            if (onError) {
                onError(data.error);
            } else {
                alert(errorMsg);
            }
            
            // Button zurücksetzen bei Fehler
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.innerHTML = originalText;
            }
            return false;
        }
        
        // Erfolg - aktualisiere UI
        updateLectionUI(lectionId);
        
        // Zeige Quiz-Result-Box, falls gewünscht
        if (showQuizResult) {
        const quizButtonContainer = document.getElementById('quiz-button-container');
            if (quizButtonContainer) {
        quizButtonContainer.innerHTML = `
            <div class="quiz-section">
                <div class="quiz-result quiz-passed">
                    <i class="fas fa-check-circle"></i>
                    <div class="quiz-result-text">
                        <strong>Lektion als erledigt markiert!</strong>
                    </div>
                </div>
            </div>
        `;
            }
        }
        
        // Callback bei Erfolg
        if (onSuccess) {
            onSuccess();
        }
        
        return true;
        
    } catch (error) {
        console.error('Fehler beim Markieren der Lektion:', error);
        const errorMsg = 'Fehler beim Markieren der Lektion';
        if (onError) {
            onError(errorMsg);
        } else {
            alert(errorMsg);
        }
        
        // Button zurücksetzen bei Fehler
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalText;
        }
        return false;
    }
}

// Alte Funktion für Rückwärtskompatibilität (Quiz-Button)
async function markLectionCompleteLegacy(lectionId) {
    const btn = document.getElementById('mark-lection-complete-btn');
    return await markLectionComplete(lectionId, {
        buttonElement: btn,
        showQuizResult: true,
        onError: (error) => {
            alert('Fehler: ' + error);
            if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Lektion erledigt';
            }
        }
    });
}

// Setup für Start-Button
function setupStartCourseButton() {
    // Verwende Event-Delegation, da der Button im dynamisch geladenen HTML ist
    const courseIntroText = document.getElementById('course-intro-text');
    if (!courseIntroText) return;
    
    // Entferne vorhandene Listener (falls vorhanden)
    const existingButton = courseIntroText.querySelector('#start-course-btn');
    if (existingButton) {
        existingButton.removeEventListener('click', handleStartCourseClick);
    }
    
    // Füge Event-Listener hinzu (auch für zukünftige Buttons)
    courseIntroText.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'start-course-btn') {
            handleStartCourseClick(e);
        }
    });
}

// Handler für Start-Button Klick
function handleStartCourseClick(e) {
    e.preventDefault();
    
    // Finde die erste Lektion (sortiert nach order)
    if (lectionsData.length === 0) {
        console.warn('Keine Lektionen verfügbar');
        return;
    }
    
    // Sortiere Lektionen nach order und nimm die erste
    const sortedLections = [...lectionsData].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
    });
    
    const firstLection = sortedLections[0];
    if (firstLection) {
        showLection(firstLection.id);
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    loadCourse();
    loadLections();
});

