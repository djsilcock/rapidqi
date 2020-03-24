import React from "react";

import Head from "next/head";
import { SigninAssistant } from "../lib/signin";
import TopNav from "../components/topnav.js";
import { Grid } from "semantic-ui-react";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <SigninAssistant>
        <div>
          <TopNav showbuttons={true} />
          <Grid>
            <Grid.Column width={1} />
            <Grid.Column width={14}>
              <Component {...pageProps} />
            </Grid.Column>
            <Grid.Column width={1} />
          </Grid>
        </div>
        <Head>
          <title>UHM After-Event Reviews</title>
          <link
            type="text/css"
            rel="stylesheet"
            href="https://cdn.firebase.com/libs/firebaseui/3.1.1/firebaseui.css"
          />
          <link
            rel="stylesheet"
            href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
          />
          <script
            crossOrigin="anonymous"
            src="https://polyfill.io/v3/polyfill.min.js?features=es2015%2Ces2016%2Ces2017%2Ces2018"
          ></script>
        </Head>
      </SigninAssistant>
    </>
  );
}
export default MyApp;
