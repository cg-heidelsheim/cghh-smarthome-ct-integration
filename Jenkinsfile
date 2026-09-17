def image
def branch_name = "${env.BRANCH_NAME}" as String
def build_number = "${env.BUILD_NUMBER}" as String
def commit_hash

def tag_name = 'jb_' + branch_name + "_" + build_number

def name = 'cghh-smarthome-ct-integration'
def img_name = 'cghh/' + name;
def image_name = img_name + ":" + tag_name

pipeline {
    agent any

    options {
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '7'))
    }

    stages {
        stage('Preamble') {
            steps {
                script {
                    echo 'Updating status'
                    updateStatus("pending")
                }
                script {
                    commit_hash = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()

                    echo 'Control Variables'
                    echo '-------------------'
                    echo "COMMIT HASH: ${commit_hash}"
                    echo "BRANCH NAME: ${branch_name}"
                    echo "BUILD NUMBER: ${build_number}"
                }
            }
        }


        stage('Reports') {
            // Always-succeeding report generation (lint JSON, jscpd JSON/HTML, coverage
            // HTML/lcov), built and archived BEFORE the quality-gates stage below, so a
            // failing gate still leaves a report behind explaining why - a failed
            // `docker build` produces no image to extract from.
            steps {
                script {
                    sh "docker build --target reports -t ${img_name}-reports:${tag_name} ."
                    def reportsContainer = sh(returnStdout: true, script: "docker create ${img_name}-reports:${tag_name}").trim()
                    sh "rm -rf reports coverage && mkdir -p reports coverage"
                    sh "docker cp ${reportsContainer}:/usr/src/app/reports/. reports/ || true"
                    sh "docker cp ${reportsContainer}:/usr/src/app/coverage/. coverage/ || true"
                    sh "docker rm ${reportsContainer} || true"
                    sh "docker rmi ${img_name}-reports:${tag_name} || true"
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/**, coverage/**', allowEmptyArchive: true
                }
            }
        }

        stage('Quality Gates') {
            // lint, typecheck, knip, jscpd, tests - each fails this stage (and the whole
            // build) on a real violation, exactly like `npm run check` locally. Reuses the
            // `deps` layer cached by the Reports stage above, so this doesn't re-run
            // `npm install` from scratch.
            steps {
                sh "docker build --target builder -t ${img_name}-builder:${tag_name} ."
            }
        }

        stage('Build Docker image') {
            steps {
                script {
                    // Reuses the already-built (and already-passing) `builder` target's
                    // cached layers from the Quality Gates stage above.
                    image = docker.build(image_name)
                }
            }
        }

        stage('Start container - main') {
            when {
                expression {
                    return branch_name == 'main' || branch_name == 'master'
                }
            }
            steps {
                script {
                    try {
                        sh "docker rm ${name} -f"
                    } catch (err) {
                        echo "cant remove container - it does not exist"
                    }
                    sh "docker run --name ${name} \
                            -v /var/www/vhosts/cg-heidelsheim.de/ct-integration.smarthome.cg-heidelsheim.de/volumes/.env:/usr/src/app/.env \
                            -v /var/www/vhosts/cg-heidelsheim.de/ct-integration.smarthome.cg-heidelsheim.de/volumes/config:/usr/src/app/config \
                            -v /var/www/vhosts/cg-heidelsheim.de/ct-integration.smarthome.cg-heidelsheim.de/volumes/persistent:/usr/src/app/persistent \
                            --network=cghh-smarthome \
                            --restart unless-stopped \
                            -d ${image_name}"
                }
            }
        }

        stage('Start container - feature') {
            when {
                expression {
                    return branch_name != 'main' && branch_name != 'master'
                }
            }
            steps {
                script {
                    try {
                        sh "docker rm ${name}-feature -f"
                    } catch (err) {
                        echo "cant remove container - it does not exist"
                    }
                    sh "docker run --name ${name}-feature \
                            -v /var/www/vhosts/cg-heidelsheim.de/ct-integration.smarthome.cg-heidelsheim.de/volumes_feature/.env:/usr/src/app/.env \
                            -v /var/www/vhosts/cg-heidelsheim.de/ct-integration.smarthome.cg-heidelsheim.de/volumes_feature/config:/usr/src/app/config \
                            -v /var/www/vhosts/cg-heidelsheim.de/ct-integration.smarthome.cg-heidelsheim.de/volumes_feature/persistent:/usr/src/app/persistent \
                            --network=cghh-smarthome \
                            --restart unless-stopped \
                            -d ${image_name}"
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    sh "docker rmi ${img_name}-builder:${tag_name} || true"
                } catch (err) {
                    echo err.getMessage()
                }
            }
        }

        success {
            script {
                updateStatus("success")

                try {
                    sh 'docker image prune --filter label=stage=intermediate -f --volumes'
                } catch (err) {
                    echo err.getMessage()
                }
            }
        }

        failure {
            script {
                updateStatus("failure")
            }
        }

        aborted {
            script {
                updateStatus("error")
            }
        }
    }
}

void updateStatus(String value) {
    withCredentials([string(credentialsId: 'GITHUB_STATUS_ACCESS_TOKEN_SEBAMOMANN', variable: 'GITHUB_STATUS_ACCESS_TOKEN_SEBAMOMANN')]) {
        sh """
            curl -s "https://api.github.com/repos/cg-heidelsheim/cghh-smarthome-ct-integration/statuses/$GIT_COMMIT" \
              -H "Content-Type: application/json" \
              -H "Authorization: token $GITHUB_STATUS_ACCESS_TOKEN_SEBAMOMANN" \
              -X POST \
              -d '{
                "state": "${value}",
                "description": "Jenkins",
                "context": "continuous-integration/jenkins",
                "target_url": "https://jenkins.dankoe.de/job/cghh-smarthome-ct-integration/job/$BRANCH_NAME/$BUILD_NUMBER/console"
              }'
        """
    }
}
