import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../button/button.jsx';

import styles from './save-button.css';

const SaveButton = ({
    className,
    onClick,
    isSuccess,
    successMessage
}) => (
    <Button
        className={classNames(
            className,
            styles.saveButton,
            isSuccess ? styles.saveButtonSuccess : null
        )}
        onClick={onClick}
    >
        {isSuccess ? (
            successMessage || 'Erfolgreich!'
        ) : (
            <FormattedMessage
                defaultMessage="Speichern"
                description="Label for save button"
                id="gui.menuBar.save"
            />
        )}
    </Button>
);

SaveButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
    isSuccess: PropTypes.bool,
    successMessage: PropTypes.string
};

SaveButton.defaultProps = {
    onClick: () => {},
    isSuccess: false,
    successMessage: 'Erfolgreich!'
};

export default SaveButton;

