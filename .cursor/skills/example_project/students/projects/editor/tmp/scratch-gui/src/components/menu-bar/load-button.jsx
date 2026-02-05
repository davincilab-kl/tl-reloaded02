import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../button/button.jsx';

import styles from './load-button.css';

const LoadButton = ({
    className,
    onClick
}) => (
    <Button
        className={classNames(
            className,
            styles.loadButton
        )}
        onClick={onClick}
    >
        <FormattedMessage
            defaultMessage="Laden"
            description="Label for load button"
            id="gui.menuBar.load"
        />
    </Button>
);

LoadButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func
};

LoadButton.defaultProps = {
    onClick: () => {}
};

export default LoadButton;

