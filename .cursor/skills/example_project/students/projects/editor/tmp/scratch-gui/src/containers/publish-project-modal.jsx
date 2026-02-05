import {connect} from 'react-redux';
import {compose} from 'redux';
import {injectIntl} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';

import PublishProjectModal from '../components/publish-project-modal/publish-project-modal.jsx';
import {closePublishProjectModal} from '../reducers/modals';

// Hole project_id aus URL oder window.PROJECT_ID
const getProjectId = () => {
    if (window.PROJECT_ID) {
        return parseInt(window.PROJECT_ID, 10);
    }
    // Versuche aus URL zu extrahieren
    const matches = window.location.href.match(/[?&]project_id=(\d+)/);
    if (matches) {
        return parseInt(matches[1], 10);
    }
    return null;
};

const mapStateToProps = (state, ownProps) => {
    return {
        isOpen: state.scratchGui.modals.publishProjectModal,
        projectId: getProjectId() || 0,
        projectTitle: state.scratchGui.projectTitle || ''
    };
};

const mapDispatchToProps = (dispatch) => ({
    onPublishSuccess: () => {
        // Optional: Benachrichtige Parent-Frame
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'projectPublished'
            }, '*');
        }
    },
    onRequestClose: () => {
        dispatch(closePublishProjectModal());
    }
});

export default compose(
    injectIntl,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(PublishProjectModal);

