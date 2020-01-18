import { Route, Switch } from "react-router-dom";

import AppliedRoute from "./components/appliedRoute";
import Browse from "./containers/browse";
import Home from "./containers/home";
import NotFound from "./containers/notFound";
import React from "react";

export default function Routes({ appProps }) {
  return (
    <Switch>
      <AppliedRoute path="/" exact component={Home} appProps={appProps} />
      <AppliedRoute path="/browse" exact component={Browse} appProps={appProps} />
      {/* Finally, catch all unmatched routes */}
      <Route component={NotFound} />
    </Switch>
  );
}