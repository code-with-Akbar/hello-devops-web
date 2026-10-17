pipeline {
    agent any

    environment {
        IMAGE       = "akbar2339124/hello-devops-web:${BUILD_NUMBER}"
        KUBECONFIG  = "/var/jenkins_home/.kube/config"
        TRIVY_CACHE = "/var/jenkins_home/.trivy-cache"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Security: Code Scan') {
            steps {
                sh 'trivy fs --scanners vuln,secret,misconfig --severity CRITICAL --ignore-unfixed --skip-dirs node_modules --cache-dir $TRIVY_CACHE --exit-code 1 .'
            }
        }

        stage('Build Image') {
            steps {
                sh 'docker build -t $IMAGE .'
            }
        }

        stage('Security: Image Scan') {
            steps {
                sh 'trivy image --severity CRITICAL --ignore-unfixed --cache-dir $TRIVY_CACHE --exit-code 1 $IMAGE'
            }
        }

        stage('Push Image') {
            steps {
                sh 'docker push $IMAGE'
            }
        }

        stage('Deploy with Helm') {
            steps {
                sh '''
helm upgrade --install hello-web ./hello-web-chart \
  --set image.tag=$BUILD_NUMBER \
  --set config.appVersion=v$BUILD_NUMBER \
  --atomic --wait --timeout 120s
'''
            }
        }

        stage('Verify') {
            steps {
                sh 'helm list'
                sh 'kubectl get pods -l app=hello-web'
            }
        }
    }

    post {
        success {
            echo "Deployed ${IMAGE}"
        }
        failure {
            echo "========== PIPELINE FAILED: scan ya deploy mein masla. Log dekho. =========="
        }
    }
}
