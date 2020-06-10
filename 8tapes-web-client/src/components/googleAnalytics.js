import React, { Component } from 'react';

import ReactGA from 'react-ga';
import { Route } from 'react-router-dom';
import config from '../config';

const { googleServices } = config;

class GoogleAnalytics extends Component {
    componentDidMount () {
        const { location } = this.props;
        this.logPageChange(location);
    }

    componentDidUpdate ({ location: previousLocation }) {
        const { location } = this.props;

        const isLocationDifferent = this.confirmLocationChange(previousLocation, location)
        if (isLocationDifferent) {
            this.logPageChange(location);
        }
    }

    confirmLocationChange({ pathname: previousPathname, search: previousSearch }, { pathname, search }) {
        return pathname !== previousPathname || search !== previousSearch;
    }

    logPageChange ({ pathname, search = '' }) {
        const page = pathname + search;
        const { location } = window;
        ReactGA.set({
            page,
            location: `${location.origin}${page}`,
            ...this.props.options
        });
        ReactGA.pageview(page);
    }

    render () {
        return null;
    }
}

export const configureGoogleAnalytics = () => {
    const trackingId = googleServices.services.googleAnalytics.TRACKING_ID;
    if(trackingId) {
        ReactGA.initialize(trackingId);
        return true;
    }

    return false;
}

export const RouteTracker = () => <Route component={GoogleAnalytics} />;