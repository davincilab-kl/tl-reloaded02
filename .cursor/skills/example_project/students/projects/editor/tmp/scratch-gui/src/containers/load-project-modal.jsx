import {connect} from 'react-redux';
import {compose} from 'redux';
import {injectIntl} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';

import LoadProjectModal from '../components/load-project-modal/load-project-modal.jsx';
import {closeLoadProjectModal} from '../reducers/modals';
import {loadProject} from '../reducers/project-state';

const mapStateToProps = (state, ownProps) => {
    return {
        isOpen: state.scratchGui.modals.loadProjectModal
    };
};

const mapDispatchToProps = (dispatch) => ({
    onLoadProject: (projectId) => {
        // Lade Projekt über postMessage an Parent-Frame
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'loadProject',
                projectId: projectId
            }, '*');
        }
        dispatch(closeLoadProjectModal());
    },
    onRequestClose: () => {
        dispatch(closeLoadProjectModal());
    }
});

export default compose(
    injectIntl,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(LoadProjectModal);

