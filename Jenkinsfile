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

 	        stage('Deploy to Kubernetes') {
            steps {
                sh '''
cat > patch.json <<EOF
{"spec":{"template":{"spec":{"containers":[{"name":"hello-web","image":"$IMAGE","env":[{"name":"APP_VERSION","value":"v$BUILD_NUMBER"}]}]}}}}
EOF
kubectl patch deployment hello-web --patch-file patch.json
if ! kubectl rollout status deployment/hello-web --timeout=120s; then
  echo "Rollout fail hua, pichle stable version par rollback"
  kubectl rollout undo deployment/hello-web
  exit 1
fi
'''
            }
        }

        stage('Verify') {
            steps {
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
                    echo "========== PIPELINE FAILED =========="

        }
    }
}
