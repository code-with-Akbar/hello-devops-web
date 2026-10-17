pipeline {
    agent any

    environment {
        IMAGE = "akbar2339124/hello-devops-web:${BUILD_NUMBER}"
	    KUBECONFIG = "/var/jenkins_home/.kube/config"

    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Build Image') {
            steps {
                sh 'docker build -t $IMAGE .'
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
  --wait --timeout 120s
'''
            }
        }

                stage('Verify') {
            steps {
                sh 'helm list'
                sh 'kubectl get deployment hello-web -o jsonpath="{.spec.template.spec.containers[0].image}"; echo'
                sh 'kubectl get pods -l app=hello-web'
            }
        }
    }

        post {
        success {
            echo "Deployed ${IMAGE}"
        }
        failure {
            sh 'helm rollback hello-web 0 || true'
            echo "========== PIPELINE FAILED, helm rollback try kiya =========="
        }
    }
}
