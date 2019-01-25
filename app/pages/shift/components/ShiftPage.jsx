import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';

import ImmutablePropTypes from 'react-immutable-proptypes';
import {
  activeShiftSuccess,
  hasActiveShift,
  isFetchingShift,
  isFetchingStaffDetails,
  loadingShiftForm,
  shift,
  shiftForm,
  staffDetails,
  submittingActiveShift
} from '../../../core/shift/selectors';
import { errors, hasError, unauthorised } from '../../../core/error/selectors';
import { Form } from 'react-formio';
import * as actions from '../../../core/shift/actions';
import moment from 'moment';
import Loader from 'react-loader-advanced';
import DataSpinner from '../../../core/components/DataSpinner';
import ErrorPanel from '../../../core/error/component/ErrorPanel';

class ShiftPage extends React.Component {

  constructor(props) {
    super(props);
    this.resetCancelButton = this.resetCancelButton.bind(this);
    this.resetCancelButton();
  }


  componentWillMount() {
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    this.props.fetchActiveShift();
    this.props.fetchShiftForm();
    this.props.fetchStaffDetails();
  }


  componentWillReceiveProps(nextProps) {
    if (this.form && this.form.formio) {
      if (!nextProps.submittingActiveShift) {
        if (nextProps.activeShiftSuccess) {
          this.form.formio.emit('submitDone');
          this.props.history.replace('/dashboard');
        } else {
          this.form.formio.emit('error');
          this.form.formio.emit('change', this.form.formio.submission);
        }
      }

    }
  }

  submit = (submission, shiftForm) => {
    this.props.submit(shiftForm._id, submission.data);
  };

  resetCancelButton = () => {
    if (this.cancelButtonAdded === true) {
      this.cancelButtonAdded = false;
    }
  };


  renderForm() {
    const { shiftForm, shift, loadingShiftForm, isFetchingShift, isFetchingStaffDetails, staffDetails } = this.props;
    this.resetCancelButton();
    const onRender = () => {
      const hasCancelButton = $('.list-inline ul li:contains("Cancel")').length;
      if (hasCancelButton === 0 && this.cancelButtonAdded !== true) {
        $('.list-inline li:eq(0)')
          .before('<li class="list-inline-item"><button id="cancelButton" class="btn btn-default btn-secondary btn-wizard-nav-cancel">Cancel</button></li>');
        $('#cancelButton')
          .bind('click', (e) => {
            e.preventDefault();
            this.props.history.replace('/dashboard');
          });
        this.cancelButtonAdded = true;
      }
    };

    if (isFetchingShift && loadingShiftForm && isFetchingStaffDetails) {
      return <DataSpinner message="Loading shift details..."/>;
    } else {
      const options = {
        noAlerts: true,
        language: 'en',
        buttonSettings: {
          showCancel: false
        },
        i18n: {
          en: {
            cancel: 'Cancel',
            previous: 'Back',
            next: 'Next'
          }
        },
      };
      if (shiftForm) {
        if (shift) {
          const shiftSubmission = {
            data: {
              shiftminutes: shift.get('shiftminutes'),
              shifthours: shift.get('shifthours'),
              startdatetime: moment.utc(shift.get('startdatetime')),
              teamid: shift.get('teamid'),
              locationid: shift.get('locationid'),
              phone: shift.get('phone')
            }
          };
          options.i18n.en.submit = 'Amend shift';

          return <Form form={shiftForm} submission={shiftSubmission} options={options}
                       ref={(form) => {
                         this.form = form;
                       }}
                       onNextPage={() => {
                         this.resetCancelButton();
                       }}
                       onPrevPage={() => {
                         this.resetCancelButton();
                       }}
                       onRender={() => onRender()}
                       onSubmit={(submission) => this.submit(submission, shiftForm)}
          />;
        } else {
          options.i18n.en.submit = 'Start shift';
          if (staffDetails) {
            const shiftSubmission = {
              data: {
                shiftminutes: 0,
                shifthours: 8,
                startdatetime: moment.utc(moment()),
                teamid: staffDetails.get('defaultteamid'),
                locationid: staffDetails.get('defaultlocationid'),
                phone: staffDetails.get('phone')
              }
            };
            return <Form form={shiftForm} submission={shiftSubmission} options={options}
                         ref={(form) => {
                           this.form = form;
                         }}
                         onNextPage={() => {
                           this.resetCancelButton();
                         }}
                         onPrevPage={() => {
                           this.resetCancelButton();
                         }}
                         onRender={() => onRender()}
                         onSubmit={(submission) => this.submit(submission, shiftForm)}/>;
          }
          return <Form form={shiftForm}
                       ref={(form) => this.form = form}
                       onRender={() => onRender()}
                       onNextPage={() => {
                         this.resetCancelButton();
                       }}
                       onPrevPage={() => {
                         this.resetCancelButton();
                       }}
                       options={options}
                       onSubmit={(submission) => this.submit(submission, shiftForm)}/>;
        }
      } else {
        return <div/>;
      }
    }
  }

  render() {
    const {
      isFetchingShift,
      submittingActiveShift,
      hasError,
      unauthorised,
      activeShiftSuccess,
      hasActiveShift

    } = this.props;
    const failedToCreate = (activeShiftSuccess !== null && activeShiftSuccess === false) && unauthorised;

    const spinner = <DataSpinner message="Submitting your shift details..."/>;
    const formToRender = this.renderForm();

    return <div style={{ paddingTop: '20px' }}>
      {hasError || failedToCreate ? <ErrorPanel {...this.props}/> : <div/>}

      <Loader show={!isFetchingShift && submittingActiveShift} message={spinner}
              hideContentOnLoad={submittingActiveShift}
              foregroundStyle={{ color: 'black' }}
              backgroundStyle={{ backgroundColor: 'white' }}>
        <div className="grid-row">
          <div className="column-full" id="shiftWizardForm">
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '15px' }}>
              <div className="notice">
                <i className="icon icon-important">
                  <span className="visually-hidden">Warning</span>
                </i>
                {!hasActiveShift ? <strong className="bold-medium">
                  Please start your shift before proceeding
                </strong> : null}
              </div>
            </div>
            {formToRender}
          </div>
        </div>
      </Loader>
    </div>;

  }

}


ShiftPage.propTypes = {
  fetchShiftForm: PropTypes.func.isRequired,
  fetchActiveShift: PropTypes.func.isRequired,
  fetchStaffDetails: PropTypes.func.isRequired,
  isFetchingShift: PropTypes.bool,
  hasActiveShift: PropTypes.bool,
  isFetchingStaffDetails: PropTypes.bool,
  shift: ImmutablePropTypes.map,
  staffDetails: ImmutablePropTypes.map,
  unauthorised: PropTypes.bool
};


const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default withRouter(connect((state) => {
  return {
    hasActiveShift: hasActiveShift(state),
    isFetchingShift: isFetchingShift(state),
    submittingActiveShift: submittingActiveShift(state),
    activeShiftSuccess: activeShiftSuccess(state),
    shift: shift(state),
    hasError: hasError(state),
    errors: errors(state),
    unauthorised: unauthorised(state),
    shiftForm: shiftForm(state),
    loadingShiftForm: loadingShiftForm(state),
    staffDetails: staffDetails(state),
    isFetchingStaffDetails: isFetchingStaffDetails(state)

  };
}, mapDispatchToProps)(ShiftPage));
