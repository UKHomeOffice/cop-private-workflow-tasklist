import Immutable from 'immutable';
import * as actions from './actionTypes';

const {Map} = Immutable;

const initialState = new Map({
    searching: false,
    businessKeyQuery: null,
    caseSearchResults: null,
    loadingCaseDetails: false,
    caseDetails: null,
    businessKey: null,
    loadingFormVersion: false,
    formVersionDetails: null,
    selectedFormReference: null,
    loadingFormSubmissionData: false,
    formSubmissionData: null
});

function reducer(state = initialState, action) {
    switch (action.type) {
        case actions.FIND_CASES_BY_KEY:
            return state.set('businessKeyQuery', action.key)
                .set('searching', true)
                .set('caseDetails', null)
                .set('businessKey', null);
        case actions.FIND_CASES_BY_KEY_SUCCESS:
            return state.set('searching', false)
                .set('caseSearchResults', action.payload.entity);
        case actions.FIND_CASES_BY_KEY_FAILURE:
            return state.set('searching', false);
        case actions.GET_CASE_BY_KEY:
            return state.set('businessKey', action.key)
                .set('loadingCaseDetails', true);
        case actions.GET_CASE_BY_KEY_SUCCESS:
            return state.set('caseDetails', action.payload.entity)
                .set('loadingCaseDetails', false);
        case actions.GET_CASE_BY_KEY_FAILURE:
            return state.set('loadingCaseDetails', false);
        case actions.GET_FORM_VERSION:
            return state.set('loadingFormVersion', true);
        case actions.GET_FORM_VERSION_SUCCESS:
            return state.set('loadingFormVersion', false)
                .set('formVersionDetails', action.payload.entity);
        case actions.GET_FORM_VERSION_FAILURE:
            return state.set('loadingFormVersion', false);
        case actions.SET_SELECTED_FORM_REFERENCE:
            return state.set('selectedFormReference', action.formReference);
        case actions.GET_FORM_SUBMISSION_DATA:
            return state.set('loadingFormSubmissionData', true);
        case actions.GET_FORM_SUBMISSION_DATA_SUCCESS:
            return state.set('loadingFormSubmissionData', false)
                .set('formSubmissionData', action.payload.entity);
        case actions.GET_FORM_SUBMISSION_DATA_FAILURE:
            return state.set('loadingFormSubmissionData', false);
        case actions.RESET_FORM:
            return state.set('formSubmissionData', null)
                .set('formVersionDetails', null);
        case actions.RESET:
            return initialState;
        default:
            return state;
    }
}


export default reducer;
