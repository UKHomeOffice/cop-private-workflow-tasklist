import { combineEpics } from 'redux-observable';
import PubSub from 'pubsub-js';
import * as Rx from 'rxjs/Observable';
import * as types from './actionTypes';
import * as actions from './actions';
import { errorObservable } from '../error/epicUtil';
import { retry } from '../util/retry';

const shift = (email, token, operationalDataUrl, client) => {
  console.log(`Requesting shift details for ${email}`);
  return client({
    method: 'GET',
    path: `${operationalDataUrl}/v1/shift?email=eq.${email}`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

const endShift = (action$, store, { client }) => action$.ofType(types.END_SHIFT)
  .mergeMap(() => client({
    method: 'DELETE',
    path: `${store.getState().appConfig.workflowServiceUrl}/api/workflow/shift/${store.getState().keycloak.tokenParsed.email}?deletedReason=finished`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${store.getState().keycloak.token}`,
    },
  })
    .retryWhen(retry)
    .map(payload => actions.endShiftSuccess(payload))
    .catch(error => errorObservable(actions.endShiftFailure(), error)));


const fetchStaffDetails = (action$, store, { client }) => action$.ofType(types.FETCH_STAFF_DETAILS)
  .mergeMap(() => client({
    method: 'POST',
    path: `${store.getState().appConfig.operationalDataUrl}/v1/rpc/staffdetails`,
    entity: {
      argstaffemail: `${store.getState().keycloak.tokenParsed.email}`,
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${store.getState().keycloak.token}`,
    },
  })
    .retryWhen(retry)
    .map(payload => actions.fetchStaffDetailsSuccess(payload))
    .catch(error => errorObservable(actions.fetchStaffDetailsFailure(), error)));


const fetchShiftForm = (action$, store, { client }) => action$.ofType(types.FETCH_SHIFT_FORM)
  .mergeMap(() => client({
    method: 'GET',
    path: `${store.getState().appConfig.translationServiceUrl}/api/translation/form/startShift`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${store.getState().keycloak.token}`,
    },
  })
    .retryWhen(retry)
    .map(payload => actions.fetchShiftFormSuccess(payload))
    .catch(error => errorObservable(actions.fetchShiftFormFailure(), error)));

const fetchActiveShift = (action$, store, { client }) => action$.ofType(types.FETCH_ACTIVE_SHIFT)
  .mergeMap(() => shift(
    store.getState().keycloak.tokenParsed.email,
    store.getState().keycloak.token,
    store.getState().appConfig.operationalDataUrl,
    client,
  )
    .retryWhen(retry)
    .map(payload => {
      if (payload.status.code === 200 && payload.entity.length === 0) {
        console.log('No data');
        throw {
          status: {
            code: 403,
          },
        };
      } else {
        return actions.fetchActiveShiftSuccess(payload);
      }
    })
    .retryWhen(errors => errors
      .takeWhile(error => error.status.code === 403)
      .take(0)
      .concat(errors.flatMap(s => Rx.Observable.throw(s))))
    .catch(error => errorObservable(actions.fetchActiveShiftFailure(), error)));


const submit = (action$, store, { client }) => action$.ofType(types.SUBMIT_VALIDATION)
  .mergeMap(action => {
    const shiftData = action.submissionData;
    return client({
      method: 'POST',
      path: `${store.getState().appConfig.workflowServiceUrl}/api/workflow/shift`,
      entity: shiftData,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${store.getState().keycloak.token}`,
        'Content-Type': 'application/json',
      },
    }).map(payload => ({
      type: types.FETCH_ACTIVE_SHIFT_AFTER_CREATE
    })).retryWhen(retry)
      .catch(error => errorObservable(actions.submitFailure(), error));
  });


const fetchActiveShiftAfterCreation = (action$, store, { client }) => action$.ofType(types.FETCH_ACTIVE_SHIFT_AFTER_CREATE)
  .mergeMap(() => shift(
    store.getState().keycloak.tokenParsed.email,
    store.getState().keycloak.token,
    store.getState().appConfig.operationalDataUrl,
    client,
  )
    .retryWhen(retry)
    .flatMap(payload => {
      if (payload.status.code === 200 && payload.entity.length === 0) {
        console.log('Empty shift details returned...retying as shift creation is asynchronous');
        throw {
          status: {
            code: 403,
          },
        };
      } else {
        console.log('Shift details located...');
        PubSub.publish('submission', {
          submission: true,
          autoDismiss: true,
          message: 'Shift successfully started',
        });
        return ([actions.createActiveShiftSuccess(),
          actions.fetchActiveShiftSuccess(payload)]);
      }
    })
    .retryWhen(errors => errors
      .takeWhile(error => {
        const retryableError = error.status.code === 403;
        console.log('Retryable error while trying to get shift...');
        return retryableError;
      })
      .delay(1000)
      .take(10)
      .concat(errors.flatMap(s => Rx.Observable.throw(s))))
    .catch(error => {
      console.log(`Failed to create shift information...${JSON.stringify(error)}`);
      return errorObservable(actions.createActiveShiftFailure(), error);
    }));

export default combineEpics(fetchActiveShift, submit, fetchShiftForm,
  fetchActiveShiftAfterCreation, fetchStaffDetails, endShift);
