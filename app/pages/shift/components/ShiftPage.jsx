import React, {PropTypes} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";

import {bindActionCreators} from "redux";
import {createStructuredSelector} from "reselect";
import * as shiftActions from "../../../core/shift/actions";

import Spinner from 'react-spinkit';
import StartForm from "../../../core/start-forms/components/StartForm";
import {submittingFormForValidation} from "../../../core/start-forms/selectors";
import ImmutablePropTypes from "react-immutable-proptypes";
import {
    activeShiftSuccess, hasActiveShift, isFetchingShift, shift,
    submittingActiveShift
} from "../../../core/shift/selectors";

class ShiftPage extends React.Component {

    componentDidMount() {
        this.props.actions.shiftActions.fetchActiveShift();
        this.form = this.createForm();
    }

    componentWillUnmount() {
        this.form = null;
    }

    createForm = () => {
        return <div className="grid-row">
            <div className="column-full">
                <fieldset>
                    <legend>
                        <h3 className="heading-medium">Shift Details</h3>
                    </legend>
                    <StartForm formName="createAnActiveShift" processKey="activate-shift" {...this.props}
                               submission={this.props.shift}/>
                </fieldset>
            </div>

        </div>
    };

    render() {

        const {
            hasActiveShift,
            isFetchingShift,
            activeShiftSuccess,
            submittingActiveShift
        } = this.props;
        const headerToDisplay = !submittingActiveShift && !hasActiveShift ?
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <div className="notice">
                    <i className="icon icon-important">
                        <span className="visually-hidden">Warning</span>
                    </i>
                    <strong className="bold-small">
                        Please enter your current task assignment before proceeding
                    </strong>
                </div>
            </div> : <div/>;
        return <div>

            {isFetchingShift ?
                <div style={{display: 'flex', justifyContent: 'center'}}><Spinner
                    name="three-bounce" color="#005ea5"/></div>
                : headerToDisplay
            }
            {activeShiftSuccess ? <div className="govuk-box-highlight confirm-page new">
                <span className="hod-checkmark"/>
                <h2 className="heading-small">
                    Shift details created. You can now navigate to other areas of the platform
                </h2>
            </div> : <div/>}
            {submittingActiveShift ?
                <div style={{display: 'flex', justifyContent: 'center', paddingTop: '20px'}}><Spinner
                    name="three-bounce" color="#005ea5"/></div> : <div/>
            }
            {this.form}
        </div>
    }
}


ShiftPage.propTypes = {
    isFetchingShift: PropTypes.bool,
    hasActiveShift: PropTypes.bool,
    shift: ImmutablePropTypes.map
};


const mapDispatchToProps = (dispatch) => {
    return {
        actions: {
            shiftActions: bindActionCreators(shiftActions, dispatch)
        }
    };
};

export default connect((state) => {
    return {
        kc: state.keycloak,
        hasActiveShift: hasActiveShift(state),
        isFetchingShift: isFetchingShift(state),
        submittingFormForValidation: submittingFormForValidation(state),
        submittingActiveShift: submittingActiveShift(state),
        activeShiftSuccess: activeShiftSuccess(state),
        shift: shift(state)
    }
}, mapDispatchToProps)(withRouter(ShiftPage))

