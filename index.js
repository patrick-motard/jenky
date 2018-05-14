var Promise = require('bluebird'),
    _ = require('underscore'),
    rp = require('request-promise'),
    argv = require('yargs').argv;

require('dotenv-safe').config({
    path: `${process.cwd()}/.env`,
    example: `${__dirname}/.env.example`
})

var Pipeline = function({ user, token, url, jobName}) {
    this.url = `https://${user}:${token}@${url}/`;
    this.jenkins = require('jenkins')({
        baseUrl: this.url,
        crumbIssuer: true,
        promisify: true
    });
    this.options = {
        name: jobName
    };
}

Pipeline.prototype.getLatestBuildNumber = function() {
    return this.jenkins.job.get(this.options)
        .then(res => {
            this.options.number = res.lastBuild.number;
        })
}

Pipeline.prototype.build = function() {
    return this.jenkins.job.build(this.options)
        .then(() => this.getLatestBuildNumber());
}

var pipeline = new Pipeline({
    user: process.env.JENKINS_USERNAME,
    token: process.env.JENKINS_USER_TOKEN,
    url: process.env.JENKINS_URL,
    jobName: process.env.JENKINS_JOB_NAME
});

module.exports = () => {
    if (argv.stop) {
        return pipeline.getLatestBuildNumber()
            .then(() => {
                console.log(`NOTICE: Stopping build #${pipeline.options.number}`);
                return pipeline.jenkins.build.stop(pipeline.options);
            })
            .then(() => {
                return process.exit();
            })
            .catch(e => {
                console.error(e);
                return process.exit(1);
            });
    }

    return pipeline.build(pipeline.options)
        .then((res) => {
            var done = false,
                log = pipeline.jenkins.build.logStream(pipeline.options);

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


