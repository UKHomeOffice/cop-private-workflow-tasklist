import React, {PropTypes} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";

import {bindActionCreators} from "redux";

import ImmutablePropTypes from "react-immutable-proptypes";
import {
    activeShiftSuccess,
    hasActiveShift,
    isFetchingShift,
    loadingShiftForm,
    shift,
    shiftForm,
    submittingActiveShift
} from "../../../core/shift/selectors";
import {errors, hasError} from "../../../core/error/selectors";
import $ from "jquery";
import {Form} from 'react-formio'
import * as actions from "../../../core/shift/actions";
import moment from 'moment';

const uuidv4 = require('uuid/v4');

class ShiftPage extends React.Component {

    componentWillMount() {
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        this.props.fetchActiveShift();
        this.props.fetchShiftForm();
    }


    componentWillReceiveProps(nextProps) {
        if (this.form && this.form.formio) {
            if (!nextProps.submittingActiveShift) {
                if (nextProps.activeShiftSuccess) {
                    this.form.formio.emit("submitDone");
                    this.props.history.replace('/dashboard');
                } else {
                    $('html,body').animate({scrollTop: 0}, 'slow');
                    this.form.formio.emit("error");
                    this.form.formio.emit('change', this.form.formio.submission);
                }
            }

        }
    }

    submit = (submission, shiftForm) => {
        this.props.submit(shiftForm._id, submission.data);
    };

    renderForm() {
        const {shiftForm, shift, loadingShiftForm, isFetchingShift} = this.props;
        if (isFetchingShift || loadingShiftForm) {
            return <div/>
        } else {

            const options = {
                noAlerts: true,
                language: 'en',
                i18n: {
                    en: {
                        cancel: 'Cancel',
                        previous: 'Back',
                        next: 'Next',
                        submit: 'Start shift'
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
                            commandid: shift.get('commandid'),
                            subcommandid: shift.get('subcommandid'),
                            phone: shift.get('phone'),
                            currentlocationid: shift.get('currentlocationid')
                        }
                    };
                    return <Form form={shiftForm} submission={shiftSubmission} options={options}
                                 ref={(form) => this.form = form}
                                 onSubmit={(submission) => this.submit(submission, shiftForm)}/>
                } else {
                    return <Form form={shiftForm}
                                 ref={(form) => this.form = form}
                                 options={options} onSubmit={(submission) => this.submit(submission, shiftForm)}/>
                }
            } else {
                return <div/>
            }
        }
    }

    render() {
        const {
            isFetchingShift,
            submittingActiveShift,
        } = this.props;

        const {hasError, errors} = this.props;
        const items = errors.map((err) => {
            return <li key={uuidv4()}>{err.get('url')} - [{err.get('status')} {err.get('error')}]
                - {err.get('message')}</li>
        });


        return <div style={{paddingTop: '20px'}}>
            {hasError ?
                <div className="error-summary" role="alert" aria-labelledby="error-summary-heading-example-1"
                     tabIndex="-1">
                    <h2 className="heading-medium error-summary-heading" id="error-summary-heading-example-1">
                        We are experiencing technical problems
                    </h2>
                    <ul className="error-summary-list">
                        {items}
                    </ul>

                </div> : <div/>}
            {isFetchingShift && !submittingActiveShift ?
                <div className="loading">Loading shift details</div>
                : <div/>
            }
            {!isFetchingShift && submittingActiveShift ?
                <h2 className="heading-medium loading">Submitting shift details</h2> : <div/>
            }

            <div className="grid-row">
                <div className="column-full">
                    {this.renderForm()}
                </div>

            </div>
        </div>

    }
}


ShiftPage.propTypes = {
    fetchShiftForm: PropTypes.func.isRequired,
    fetchActiveShift: PropTypes.func.isRequired,
    isFetchingShift: PropTypes.bool,
    hasActiveShift: PropTypes.bool,
    shift: ImmutablePropTypes.map
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
        shiftForm: shiftForm(state),
        loadingShiftForm: loadingShiftForm(state)

    }
}, mapDispatchToProps)(ShiftPage))