import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import Modal from '../modal/modal.jsx';
import Button from '../button/button.jsx';
import styles from './publish-project-modal.css';

class PublishProjectModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            title: props.projectTitle || '',
            description: '',
            coverFile: null,
            coverPreview: null,
            isPublishing: false,
            error: null
        };
        this.fileInputRef = React.createRef();
    }

    handleTitleChange (e) {
        this.setState({title: e.target.value});
    }

    handleDescriptionChange (e) {
        this.setState({description: e.target.value});
    }

    handleCoverChange (e) {
        const file = e.target.files[0];
        if (file) {
            // Prüfe Dateityp
            if (!file.type.startsWith('image/')) {
                this.setState({error: 'Bitte wählen Sie eine Bilddatei aus'});
                return;
            }

            // Prüfe Dateigröße (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.setState({error: 'Bilddatei ist zu groß (max 5MB)'});
                return;
            }

            // Erstelle Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.setState({
                    coverFile: file,
                    coverPreview: e.target.result,
                    error: null
                });
            };
            reader.readAsDataURL(file);
        }
    }

    async handlePublish () {
        const {title, description, coverFile} = this.state;

        if (!title.trim()) {
            this.setState({error: 'Bitte geben Sie einen Projekttitel ein'});
            return;
        }

        this.setState({isPublishing: true, error: null});

        try {
            // Erstelle FormData für File-Upload
            const formData = new FormData();
            formData.append('project_id', this.props.projectId);
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            if (coverFile) {
                formData.append('cover', coverFile);
            }

            const response = await fetch('/api/projects/publish_project.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                if (this.props.onPublishSuccess) {
                    this.props.onPublishSuccess();
                }
                this.props.onRequestClose();
            } else {
                this.setState({
                    error: data.error || 'Fehler beim Veröffentlichen',
                    isPublishing: false
                });
            }
        } catch (error) {
            console.error('Fehler beim Veröffentlichen:', error);
            this.setState({
                error: 'Fehler beim Veröffentlichen',
                isPublishing: false
            });
        }
    }

    render () {
        const {title, description, coverPreview, isPublishing, error} = this.state;
        const isOpen = this.props.isOpen !== false; // Standard: true wenn nicht gesetzt

        if (!isOpen) {
            return null;
        }

        return (
            <Modal
                className={styles.modalContent}
                contentLabel={this.props.intl.formatMessage({
                    id: 'gui.publishProjectModal.title',
                    defaultMessage: 'Projekt veröffentlichen'
                })}
                onRequestClose={this.props.onRequestClose}
            >
                <div className={styles.modalBody}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FormattedMessage
                                id="gui.publishProjectModal.titleLabel"
                                defaultMessage="Projekttitel"
                            />
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={(e) => this.handleTitleChange(e)}
                            placeholder={this.props.intl.formatMessage({
                                id: 'gui.publishProjectModal.titlePlaceholder',
                                defaultMessage: 'Titel des Projekts'
                            })}
                            disabled={isPublishing}
                        />
                        <div className={styles.hint}>
                            <FormattedMessage
                                id="gui.publishProjectModal.titleHint"
                                defaultMessage="Dieser Titel überschreibt den Spieltitel"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FormattedMessage
                                id="gui.publishProjectModal.descriptionLabel"
                                defaultMessage="Beschreibung"
                            />
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => this.handleDescriptionChange(e)}
                            placeholder={this.props.intl.formatMessage({
                                id: 'gui.publishProjectModal.descriptionPlaceholder',
                                defaultMessage: 'Beschreibung des Projekts'
                            })}
                            rows={4}
                            disabled={isPublishing}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FormattedMessage
                                id="gui.publishProjectModal.coverLabel"
                                defaultMessage="Cover-Bild"
                            />
                        </label>
                        <input
                            ref={this.fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => this.handleCoverChange(e)}
                            className={styles.fileInput}
                            disabled={isPublishing}
                        />
                        {coverPreview && (
                            <div className={styles.coverPreview}>
                                <img src={coverPreview} alt="Cover Preview" />
                            </div>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <Button
                            className={styles.cancelButton}
                            onClick={this.props.onRequestClose}
                            disabled={isPublishing}
                        >
                            <FormattedMessage
                                id="gui.publishProjectModal.cancel"
                                defaultMessage="Abbrechen"
                            />
                        </Button>
                        <Button
                            className={styles.publishButton}
                            onClick={() => this.handlePublish()}
                            disabled={isPublishing || !title.trim()}
                        >
                            {isPublishing ? (
                                <FormattedMessage
                                    id="gui.publishProjectModal.publishing"
                                    defaultMessage="Veröffentliche..."
                                />
                            ) : (
                                <FormattedMessage
                                    id="gui.publishProjectModal.publish"
                                    defaultMessage="Veröffentlichen"
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }
}

PublishProjectModal.propTypes = {
    intl: intlShape.isRequired,
    isOpen: PropTypes.bool,
    projectId: PropTypes.number.isRequired,
    projectTitle: PropTypes.string,
    onPublishSuccess: PropTypes.func,
    onRequestClose: PropTypes.func.isRequired
};

export default injectIntl(PublishProjectModal);

