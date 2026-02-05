import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../button/button.jsx';

import styles from './publish-button.css';

const PublishButton = ({
    className,
    isPublished,
    onClick
}) => (
    <Button
        className={classNames(
            className,
            styles.publishButton,
            {[styles.publishButtonIsPublished]: isPublished}
        )}
        onClick={onClick}
    >
        {isPublished ? (
            <FormattedMessage
                defaultMessage="Veröffentlicht"
                description="Label for published project"
                id="gui.menuBar.isPublished"
            />
        ) : (
            <FormattedMessage
                defaultMessage="Veröffentlichen"
                description="Label for publish button"
                id="gui.menuBar.publish"
            />
        )}
    </Button>
);

PublishButton.propTypes = {
    className: PropTypes.string,
    isPublished: PropTypes.bool,
    onClick: PropTypes.func
};

PublishButton.defaultProps = {
    onClick: () => {}
};

export default PublishButton;

