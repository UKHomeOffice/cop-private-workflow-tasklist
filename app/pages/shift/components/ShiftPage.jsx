import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {
    activeShiftSuccess,
    isFetchingShift,
    isFetchingStaffDetails,
    loadingShiftForm,
    shift,
    shiftForm,
    staffDetails,
    submittingActiveShift,
} from '../../../core/shift/selectors';
import { Form } from 'react-formio';
import * as actions from '../../../core/shift/actions';
import Loader from 'react-loader-advanced';
import DataSpinner from '../../../core/components/DataSpinner';
import ShiftForm from './ShiftForm';

export class ShiftPage extends React.Component {
  constructor(props) {
      super(props);
    }

  componentDidMount() {
      this.props.fetchActiveShift();
      this.props.fetchShiftForm();
      this.props.fetchStaffDetails();
    }

  componentDidUpdate(prevProps, prevState, snapshot) {
      if (this.props.submittingActiveShift !== prevProps.submittingActiveShift && !this.props.submittingActiveShift) {
          if (this.form && this.form.formio) {
              if (this.props.activeShiftSuccess) {
                  this.form.formio.emit('submitDone');
                  this.props.history.replace('/dashboard');
                } else {
                  this.form.formio.emit('error');
                  this.form.formio.emit('change', this.form.formio.submission);
                }
            }
        }
    }

  render() {
      const {
            isFetchingShift,
            submittingActiveShift,
            isFetchingStaffDetails,
            loadingShiftForm,
            shiftForm,
        } = this.props;

      if (loadingShiftForm && isFetchingStaffDetails && isFetchingShift) {
          return <DataSpinner message="Loading your shift details" />;
        }

      if (!shiftForm) {
          return <DataSpinner message="Getting shift form" />;
        }
      const spinner = <DataSpinner message="Submitting your shift details..." />;
      return (<Loader show={submittingActiveShift} message={spinner}
                    hideContentOnLoad={submittingActiveShift}
                    foregroundStyle={{color: 'black'}}
                    backgroundStyle={{backgroundColor: 'white'}}>
                <div className="govuk-grid-row" style={{padding: '10px 10px'}}>
                    <div className="govuk-grid-row-column-full" id="shiftWizardForm">
                        <ShiftForm {...this.props} formReference={(form) => this.form = form}
                                   submit={(shiftForm, submission) => {
                                       this.props.submit(shiftForm.id, submission.data);
                                   }}/>
                    </div>
                </div>
            </Loader>);
    }

}

ShiftPage.propTypes = {
  fetchShiftForm: PropTypes.func.isRequired,
  fetchActiveShift: PropTypes.func.isRequired,
  fetchStaffDetails: PropTypes.func.isRequired,
  isFetchingShift: PropTypes.bool,
  isFetchingStaffDetails: PropTypes.bool,
  shift: ImmutablePropTypes.map,
  staffDetails: ImmutablePropTypes.map,
  unauthorised: PropTypes.bool,
};


const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default withRouter(connect((state) => ({
        isFetchingShift: isFetchingShift(state),
        submittingActiveShift: submittingActiveShift(state),
        activeShiftSuccess: activeShiftSuccess(state),
        shift: shift(state),
        shiftForm: shiftForm(state),
        loadingShiftForm: loadingShiftForm(state),
        staffDetails: staffDetails(state),
        isFetchingStaffDetails: isFetchingStaffDetails(state)

    }), mapDispatchToProps)(ShiftPage));
