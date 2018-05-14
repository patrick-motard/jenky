# Jenky!

Run your jenkins jobs from your terminal! See build log streams in real time. Stop hanging builds on command!


### Install

npm i


Copy `.env.example` to the repo/folder containing your `Jenkinsfile`. Rename it `.env`.
Fill in the values of your `.env` file for your particular job and user.


### Calling Jenky

Commit your pipeline code and push it to your remote branch.

Then call jenky from the directory of your jenkins pipeline.

```
node ../jenky/index.js
```

### Terminate Stalled builds

Sometimes builds wont stop. The log stream will continue to wait for a done signal from Jenkins.
You can send a stop build signal via Jenky. In a separate terminal, in your pipeline directory:

```
node ../jenky/index.js --stop
```
