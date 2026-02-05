import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import log from '../lib/log.js';

const onClickLogo = () => {
    window.location = 'https://scratch.mit.edu';
};

const handleTelemetryModalCancel = () => {
    log('User canceled telemetry modal');
};

const handleTelemetryModalOptIn = () => {
    log('User opted into telemetry');
};

const handleTelemetryModalOptOut = () => {
    log('User opted out of telemetry');
};

/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
export default appTarget => {
    GUI.setAppElement(appTarget);

    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedGui = compose(
        AppStateHOC,
        HashParserHOC
    )(GUI);

    // TODO a hack for testing the backpack, allow backpack host to be set by url param
    const backpackHostMatches = window.location.href.match(/[?&]backpack_host=([^&]*)&?/);
    const backpackHost = backpackHostMatches ? backpackHostMatches[1] : null;

    const scratchDesktopMatches = window.location.href.match(/[?&]isScratchDesktop=([^&]+)/);
    let simulateScratchDesktop;
    if (scratchDesktopMatches) {
        try {
            // parse 'true' into `true`, 'false' into `false`, etc.
            simulateScratchDesktop = JSON.parse(scratchDesktopMatches[1]);
        } catch {
            // it's not JSON so just use the string
            // note that a typo like "falsy" will be treated as true
            simulateScratchDesktop = scratchDesktopMatches[1];
        }
    }

    // Lese Editor-Konfiguration aus URL-Parametern
    const getUrlParam = (param, defaultValue = false) => {
        const matches = window.location.href.match(new RegExp(`[?&]${param}=([^&]+)`));
        if (matches) {
            const value = matches[1];
            if (value === '1' || value === 'true') return true;
            if (value === '0' || value === 'false') return false;
            return value;
        }
        return defaultValue;
    };

    const editorConfig = {
        hideFileMenu: getUrlParam('hide_file_menu', false),
        hideEditMenu: getUrlParam('hide_edit_menu', false),
        hideTutorials: getUrlParam('hide_tutorials', false),
        hideShare: getUrlParam('hide_share', false),
        hideSave: getUrlParam('hide_save', false),
        hideLoad: getUrlParam('hide_load', false),
        hidePublish: getUrlParam('hide_publish', false),
        hideSpriteLibrary: getUrlParam('hide_sprite_library', false),
        hideBackdropLibrary: getUrlParam('hide_backdrop_library', false),
        hideSoundLibrary: getUrlParam('hide_sound_library', false),
        hideExtensionLibrary: getUrlParam('hide_extension_library', false),
        hideExtensionButton: getUrlParam('hide_extension_button', false),
        hideCostumesTab: getUrlParam('hide_costumes_tab', false),
        hideSoundsTab: getUrlParam('hide_sounds_tab', false),
        hideCodeTab: getUrlParam('hide_code_tab', false),
        mode: getUrlParam('mode', 'full'),
        // Block-Kategorien
        hideCategoryMotion: getUrlParam('hide_category_motion', false),
        hideCategoryLooks: getUrlParam('hide_category_looks', false),
        hideCategorySound: getUrlParam('hide_category_sound', false),
        hideCategoryEvent: getUrlParam('hide_category_event', false),
        hideCategoryControl: getUrlParam('hide_category_control', false),
        hideCategorySensing: getUrlParam('hide_category_sensing', false),
        hideCategoryOperators: getUrlParam('hide_category_operators', false),
        hideCategoryData: getUrlParam('hide_category_data', false),
        hideCategoryProcedures: getUrlParam('hide_category_procedures', false)
    };

    if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
        // Warn before navigating away
        window.onbeforeunload = () => true;
    }

    // Bestimme GUI-Props basierend auf Konfiguration
    const guiProps = {
        canEditTitle: !editorConfig.hideTitle,
        canManageFiles: !editorConfig.hideFileMenu,
        canSave: !editorConfig.hideSave,
        canShare: !editorConfig.hideShare,
        backpackVisible: !editorConfig.hideBackpack && !simulateScratchDesktop,
        showComingSoon: !simulateScratchDesktop,
        backpackHost: backpackHost,
        canSave: !editorConfig.hideSave,
        onClickLogo: onClickLogo,
        editorConfig: editorConfig // Weitere Konfiguration für interne Verwendung
    };

    // Füge Scratch Desktop spezifische Props hinzu
    if (simulateScratchDesktop) {
        Object.assign(guiProps, {
            isScratchDesktop: true,
            showTelemetryModal: true,
            canSave: false,
            onTelemetryModalCancel: handleTelemetryModalCancel,
            onTelemetryModalOptIn: handleTelemetryModalOptIn,
            onTelemetryModalOptOut: handleTelemetryModalOptOut
        });
    }

    ReactDOM.render(
        <WrappedGui {...guiProps} />,
        appTarget);
};
