import { Route, Switch } from "react-router-dom";
import { RouteTracker, configureGoogleAnalytics } from "./components/googleAnalytics";

import AppliedRoute from "./components/appliedRoute";
import Browse from "./containers/browse";
import Home from "./containers/home";
import NotFound from "./containers/notFound";
import PrivatePolicy from "./containers/privatePolicy";
import React from "react";
import Terms from "./containers/terms";

export default function Routes({ appProps }) {
  return (
    <>
    {configureGoogleAnalytics() && <RouteTracker />}
    <Switch>
      <AppliedRoute path="/" exact component={Home} appProps={appProps} />
      <AppliedRoute path="/browse" exact component={Browse} appProps={appProps} />
      <AppliedRoute path="/privacy-policy" exact component={PrivatePolicy} appProps={appProps} />
      <AppliedRoute path="/terms-of-service" exact component={Terms} appProps={appProps} />
      {/* Finally, catch all unmatched routes */}
      <Route component={NotFound} />
    </Switch>
    </>
  );
}