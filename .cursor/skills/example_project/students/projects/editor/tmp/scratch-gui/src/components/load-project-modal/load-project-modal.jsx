import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import Modal from '../modal/modal.jsx';
import Button from '../button/button.jsx';
import styles from './load-project-modal.css';

class LoadProjectModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            projects: [],
            loading: true,
            error: null
        };
    }

    componentDidMount () {
        this.loadProjects();
    }

    async loadProjects () {
        try {
            // Hole student_id über API
            const studentResponse = await fetch('/api/students/get_current_student_id.php');
            const studentData = await studentResponse.json();
            
            if (!studentData.success || !studentData.student_id) {
                this.setState({
                    loading: false,
                    error: 'Keine Student-ID gefunden'
                });
                return;
            }

            // Hole Projekte des Schülers (nur Scratch-Projekte mit project_data)
            const projectsResponse = await fetch(`/api/projects/get_student_projects.php?student_id=${studentData.student_id}`);
            const projectsData = await projectsResponse.json();

            if (projectsData.error) {
                this.setState({
                    loading: false,
                    error: projectsData.error
                });
                return;
            }

            // Filtere nur Scratch-Projekte (Projekte mit link zu editor oder project_data)
            // Da wir project_data nicht direkt in der Liste haben, filtern wir nach link
            const scratchProjects = (projectsData.projects || []).filter(project => {
                // Prüfe ob Projekt Scratch-Projekt ist (link enthält 'editor')
                return project.link && project.link.includes('editor');
            });

            this.setState({
                projects: scratchProjects,
                loading: false
            });
        } catch (error) {
            console.error('Fehler beim Laden der Projekte:', error);
            this.setState({
                loading: false,
                error: 'Fehler beim Laden der Projekte'
            });
        }
    }

    handleLoadProject (projectId) {
        if (this.props.onLoadProject) {
            this.props.onLoadProject(projectId);
        }
        this.props.onRequestClose();
    }

    render () {
        const {loading, projects, error} = this.state;
        const isOpen = this.props.isOpen !== false; // Standard: true wenn nicht gesetzt

        if (!isOpen) {
            return null;
        }

        return (
            <Modal
                className={styles.modalContent}
                contentLabel={this.props.intl.formatMessage({
                    id: 'gui.loadProjectModal.title',
                    defaultMessage: 'Projekt laden'
                })}
                onRequestClose={this.props.onRequestClose}
            >
                <div className={styles.modalBody}>
                    {loading && (
                        <div className={styles.loading}>
                            <FormattedMessage
                                id="gui.loadProjectModal.loading"
                                defaultMessage="Lade Projekte..."
                            />
                        </div>
                    )}
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                    {!loading && !error && projects.length === 0 && (
                        <div className={styles.empty}>
                            <FormattedMessage
                                id="gui.loadProjectModal.noProjects"
                                defaultMessage="Keine Scratch-Projekte gefunden"
                            />
                        </div>
                    )}
                    {!loading && !error && projects.length > 0 && (
                        <div className={styles.projectsList}>
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    className={styles.projectItem}
                                    onClick={() => this.handleLoadProject(project.id)}
                                >
                                    <div className={styles.projectTitle}>{project.title || `Projekt #${project.id}`}</div>
                                    {project.description && (
                                        <div className={styles.projectDescription}>{project.description}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        );
    }
}

LoadProjectModal.propTypes = {
    intl: intlShape.isRequired,
    isOpen: PropTypes.bool,
    onLoadProject: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired
};

export default injectIntl(LoadProjectModal);

