import React from 'react';
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom'
import LoadingBar from 'react-redux-loading-bar'

import img from 'govuk_template_ejs/assets/images/gov.uk_logotype_crown_invert_trans.png?0.23.0'
import ResponsiveMenu from 'react-responsive-navbar';

class Header extends React.Component {

    componentWillMount() {
        this.changeRoute = this.changeRoute.bind(this);
        this.logout = this.logout.bind(this);
        const path = this.props.location.pathname;
        window.addEventListener('resize', this.handleWindowSizeChange);
        this.state = {
            routerPath: path
        }
    }


    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
    }

    handleWindowSizeChange = () => {
        this.setState({ width: window.innerWidth });
    };

    changeRoute(path) {
        this.setState({routerPath: path});
        this.props.history.replace(path);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            this.setState({routerPath: nextProps.location.pathname});
        }
    }

    logout(event) {
        event.preventDefault();
        this.props.kc.logout();
    }

    render() {
        const { routerPath} = this.state;

        const pointerStyle = {cursor: 'pointer'};

        const adminRole = this.props.kc.realmAccess && this.props.kc.realmAccess.roles
            ? this.props.kc.realmAccess.roles.find(role => role === 'platform_admin')
            : null;

        const navWidth = window.innerWidth <= 500 ? 'inherit' : '700px';

        return <div>
            <header role="banner" id="global-header" className="with-proposition">
                <div className="header-wrapper">
                    <div className="header-global">
                        <div className="header-logo">
                            <a href="https://www.gov.uk/" title="Go to the GOV.UK homepage" id="logo"
                               className="content">
                                <img src={img} width="36" height="32" alt=""/> UK Border Force
                            </a>
                        </div>
                    </div>
                    <div className="header-proposition">
                        <div className="content">
                            <div className="grid-row">

                                <div className="column-one-half">
                                    <a href="#" id="proposition-name">Operational Activities</a>
                                </div>
                                <div className="column-one-half">
                                    <h4 style={{color: 'white', textAlign: 'right', fontSize: '15px', marginTop: '5px'}} id="proposition-name" >{this.props.kc.tokenParsed.given_name} {this.props.kc.tokenParsed.family_name} </h4>
                                </div>

                            </div>
                            <ResponsiveMenu
                                menuOpenButton={<div className="nav-menu">Open</div>}
                                menuCloseButton={<div className="nav-menu">Close</div>}
                                changeMenuOn="500px"
                                smallMenuClassName="small-menu"
                                menu={
                                    <ul id="proposition-links" style={{width: navWidth}}>
                                        <li style={pointerStyle}><a onClick={() => this.changeRoute('/profile')} className={routerPath === '/profile' ? 'active' : ''}>Profile</a></li>
                                        <li style={pointerStyle}><a onClick={() => this.changeRoute('/tasks')} className={routerPath === '/tasks' ? 'active' : ''}>Tasks</a></li>
                                        <li style={pointerStyle}><a onClick={() => this.changeRoute('/processes')} className={routerPath === '/processes' ? 'active' : ''}>Processes</a></li>
                                        <li style={pointerStyle}><a onClick={() => this.changeRoute('/reports')} className={routerPath === '/reports' ? 'active' : ''}>Reports</a></li>
                                        <li style={pointerStyle}><a onClick={() => this.changeRoute('/notifications')} className={routerPath === '/notifications' ? 'active' : ''}>Notifications</a></li>
                                        <li style={pointerStyle}><a onClick={() => this.changeRoute('/campaigns')}
                                                                    className={routerPath === '/campaigns' ? 'active' : ''}>Campaigns</a>
                                        </li>
                                        { adminRole ? <li style={pointerStyle}><a onClick={() => this.changeRoute('/admin')} className={routerPath === '/admin' ? 'active' : ''}>Admin</a></li> : <div />}
                                        <li style={pointerStyle}><a onClick={this.logout}>Logout</a></li>
                                    </ul>
                                }
                            />
                        </div>
                    </div>

                </div>
            </header>
            <div id="global-header-bar" />
            <LoadingBar
                updateTime={100}
                maxProgress={100}
                progressIncrease={4}
                scope="header"
                className="loading-bar"
            />
        </div>
    }
}

export default withRouter(connect((state) => {
    return {
        kc: state.keycloak
    }
}, {})(Header))