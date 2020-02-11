import React from 'react';
import {getCaseByKey} from '../actions';
import {withRouter} from "react-router";
import {connect} from "react-redux";
import {caseDetails, loadingCaseDetails} from "../selectors";
import {bindActionCreators} from "redux";
import withLog from "../../../core/error/component/withLog";
import PropTypes from "prop-types";
import CaseDetailsPanel from "./CaseDetailsPanel";
import DataSpinner from "../../../core/components/DataSpinner";

class CaseResultsPanel extends React.Component {
    render() {
        const {searching, caseSearchResults, businessKeyQuery, loadingCaseDetails, caseDetails} = this.props;

        if (searching) {
            return <h4 className="govuk-heading-s">Searching cases with reference {businessKeyQuery}...</h4>
        }
        if (!caseSearchResults) {
            return <div/>
        }

        const businessKeys = caseSearchResults._embedded.cases.map(c => {
            return <li key={c.businessKey}><a className="govuk-link" href="" onClick={(event) => {
                event.preventDefault();
                this.props.getCaseByKey(c.businessKey)
            }}>{c.businessKey}</a></li>
        });
        return <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-quarter">
                <h3 className="govuk-heading-m">Search results</h3>
                {caseSearchResults ?
                    <React.Fragment>
                        <span className="govuk-caption-m">Number of cases found</span>
                        <h3 className="govuk-heading-m">{caseSearchResults.page.totalElements}</h3>

                        {caseSearchResults.page.totalElements > 0 ? <ul className="govuk-list">
                            {businessKeys}
                        </ul> : null}
                        {caseSearchResults.page.totalElements > caseSearchResults.page.size ?
                            <button className="govuk-button" onClick={(event) => {

                            }}>Load more</button> : null}
                    </React.Fragment> : null}
            </div>
            <div className="govuk-grid-column-three-quarters">
                {
                    loadingCaseDetails ? <div style={{justifyContent: 'center', paddingTop: '20px'}}>
                            <DataSpinner
                                message="Loading case details"/></div> :
                        (!caseDetails ? null : <CaseDetailsPanel {...{caseDetails}}/>)
                }

            </div>
        </div>
    }
}

CaseResultsPanel.propTypes = {
    getCaseByKey: PropTypes.func.isRequired,
    loadingCaseDetails: PropTypes.bool,
    caseDetails: PropTypes.shape({
        businessKey: PropTypes.string,
        processInstances: PropTypes.arrayOf(PropTypes.object)
    })
};

const mapDispatchToProps = dispatch => bindActionCreators({getCaseByKey}, dispatch);

export default withRouter(connect((state) => {
    return {
        kc: state.keycloak,
        appConfig: state.appConfig,
        caseDetails: caseDetails(state),
        loadingCaseDetails: loadingCaseDetails(state),
    }
}, mapDispatchToProps)(withLog(CaseResultsPanel)));
