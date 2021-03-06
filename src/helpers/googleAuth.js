import { gapi } from './gapiScript';

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

    static getClient() {
        return new Promise((resolve) => {
            if(this.youtubeClient) {
                resolve(this.youtubeClient) 
            }

            const signInAttempt = (attempts = 0) => {
                if(this.auth) {
                    this.youtubeClient = gapi.client
                    resolve(this.youtubeClient)
                } else {
                    if(attempts === 10) {
                        throw new Error('gapi initialisation failed...')
                    }

                    console.log(`Initialisation attempt ${attempts}...`)

                    setTimeout(() => signInAttempt(attempts + 1), 1000)
                }
            }
            
            if(!this.getCurrentUser()) {
                signInAttempt()
            } else {
                this.youtubeClient = gapi.client
                resolve(this.youtubeClient)
            }
        })
    }

    static updateSigninStatus() {
        if(this.auth) {
            this.currentUser = this.auth.currentUser.get();
        }
    }

    static async signIn(prompt) {
        if(prompt) {
            const options = new gapi.auth2.SigninOptionsBuilder()
                                    .setPrompt(prompt);
                                    
            return await this.auth.signIn(options);
        } else {
            return await this.auth.signIn();
        }
    }

    static async signOut() {
        return await this.auth.signOut();
    }
}