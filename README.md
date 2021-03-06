# Jenky!

Run your jenkins jobs from your terminal! See build log streams in real time. Stop hanging builds on command!


### Install

`npm i && npm ln`


Copy `.env.example` to the repo/folder containing your `Jenkinsfile`. Rename it `.env`.
Fill in the values of your `.env` file for your particular job and user.


### Calling Jenky

Commit your pipeline code and push it to your remote branch.

Then call jenky from the directory of your jenkins pipeline.

```
jenky
```

### Terminate Stalled builds

Sometimes builds wont stop. The log stream will continue to wait for a done signal from Jenkins.
You can send a stop build signal via Jenky. In a separate terminal, in your pipeline directory:

```
jenky --stop
```
### Build Parameters

`jenky -p myParam1=myVal1 -p myParam2=myVal2`


### Quickly checking in code

I like to modify my pipeline locally in my editor, commit my changes, and call jenky all in one script.
Here's a script you can add to your path and call in a one liner.

saved to: `~/.local/bin/quick-check-in`

```
#!/usr/bin/env bash
previous_commit=$(git log -1 --pretty=%B)
if [[ $previous_commit == 'push' ]]; then
    git add -A
    git commit --amend -m 'push'
    git push -f
    exit
fi

echo "Error: previous commit message not 'push', to use this \
function make a commit with message 'push'"
```

One liner to checkin code and start the build:

`quick-check-in && node ../jenky/index.js`
