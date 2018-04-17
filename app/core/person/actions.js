import * as types from './actionTypes';

const fetchPerson = () => ({
    type: types.FETCH_PERSON
});

const fetchPersonSuccess = (payload) => ({
    type: types.FETCH_PERSON_SUCCESS,
    payload
});

const fetchPersonFailure = (error) => ({
    type: types.FETCH_PERSON_FAILURE,
    error: true,
    payload: error.raw.message,
})

export {
    fetchPerson,
    fetchPersonSuccess,
    fetchPersonFailure
}