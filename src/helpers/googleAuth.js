const gapi = window.gapi;

export default class GoogleAuth {
    static auth;
    static currentUser;

    static configure({apiKey, clientId, service: {discoveryUrl, scope}}) {
        const initClient = () => {
            gapi.client.init({
                'apiKey': apiKey,
                'discoveryDocs': [discoveryUrl],
                'clientId': clientId,
                'scope': scope
            }).then(() => {
              this.auth = gapi.auth2.getAuthInstance();
              this.auth.isSignedIn.listen(() => {
                this.updateSigninStatus();
              });
            });
        };

        gapi.load('client:auth2', initClient);
    }

    static getCurrentUser() {
        if(this.auth && !this.currentUser) {
            this.currentUser = this.auth.currentUser.get()
        }
        
        return this.currentUser;
    }

    static getCurrentUserToken() {
        const user = this.getCurrentUser();
        
        if(user) {
            const { access_token } = user.reloadAuthResponse();
            return access_token;
        }
        
        return null;
    }

    static updateSigninStatus() {
        if(this.auth) {
            this.currentUser = this.auth.currentUser.get();
        }
    }

    static async signIn() {
        return await this.auth.signIn();
    }

    static async signOut() {
        return await this.auth.signOut();
    }
}