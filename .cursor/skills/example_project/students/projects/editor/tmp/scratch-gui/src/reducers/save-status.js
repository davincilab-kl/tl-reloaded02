const SET_SAVE_SUCCESS = 'saveStatus/SET_SAVE_SUCCESS';
const CLEAR_SAVE_SUCCESS = 'saveStatus/CLEAR_SAVE_SUCCESS';

const initialState = {
    isSuccess: false,
    message: ''
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_SAVE_SUCCESS:
        return {
            isSuccess: true,
            message: action.message || 'Erfolgreich!'
        };
    case CLEAR_SAVE_SUCCESS:
        return {
            isSuccess: false,
            message: ''
        };
    default:
        return state;
    }
};

const setSaveSuccess = (message) => ({
    type: SET_SAVE_SUCCESS,
    message: message
});

const clearSaveSuccess = () => ({
    type: CLEAR_SAVE_SUCCESS
});

export {
    reducer as default,
    initialState as saveStatusInitialState,
    setSaveSuccess,
    clearSaveSuccess
};

