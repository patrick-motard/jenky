var Promise = require('bluebird'),
    _ = require('underscore'),
    rp = require('request-promise');


function loadEnvFile() {
    return Promise.resolve(require('dotenv-safe').config({
            path: `${process.cwd()}/.env`,
            example: `${__dirname}/.env.example`
        }));
}

module.exports= () => {

    return loadEnvFile().bind({})
        .then(() => {
            this.url = `https://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_USER_TOKEN}@${process.env.JENKINS_URL}/`;
            this.jenkins = require('jenkins')({
                baseUrl: this.url,
                crumbIssuer: true,
                promisify: true
            });
            this.options = {
                name: process.env.JENKINS_JOB_NAME
            };
        })
        .then(() => this.jenkins.job.build(this.options))
        .then(() => this.jenkins.job.get(this.options))
        .then(res => {
            this.options.number = res.lastBuild.number;
            var done = false,
                log = this.jenkins.build.logStream(this.options);

            log.on('data', function(text) {
                console.log(text);
            });

            log.on('end', function(res) {
                done = true;
            });

            log.on('error', function(err) {
                return Promise.reject(err);
            });

            (function resolver() {
                if (done) return Promise.resolve();
                setTimeout(resolver, 30);
            })();

        })
        .then(res => console.log(res))
    // filter for dotenv-safe error where errors are missing
    // overwrite it's error message one that uses the correct path of user's .env file
        .catch((e) => { return e.name === 'MissingEnvVarsError'; },
               e => {
                   var message = `Missing the following variables in ${process.cwd()}/.env:`;
                   _(e.missing).each((key, i) => { message += `\n ${i+1}: ${key}`; });
                   return Promise.reject(new Error(message));
        })
        .catch(e => {
            console.error(e);
        });
};

module.exports();
